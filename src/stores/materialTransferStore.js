import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

async function enrichTransfers(list) {
  if (!list.length) return list
  const profileIds  = [...new Set([...list.map((t) => t.initiated_by), ...list.map((t) => t.confirmed_by)].filter(Boolean))]
  const materialIds = [...new Set(list.map((t) => t.material_id).filter(Boolean))]
  const siteIds     = [...new Set([...list.map((t) => t.from_site_id), ...list.map((t) => t.to_site_id)].filter(Boolean))]

  const [pRes, mRes, sRes] = await Promise.all([
    profileIds.length  ? supabase.from('profiles').select('id, full_name').in('id', profileIds)   : { data: [] },
    materialIds.length ? supabase.from('materials').select('id, name, unit').in('id', materialIds) : { data: [] },
    siteIds.length     ? supabase.from('sites').select('id, name').in('id', siteIds)               : { data: [] },
  ])

  const pMap = Object.fromEntries((pRes.data ?? []).map((p) => [p.id, p]))
  const mMap = Object.fromEntries((mRes.data ?? []).map((m) => [m.id, m]))
  const sMap = Object.fromEntries((sRes.data ?? []).map((s) => [s.id, s]))

  return list.map((t) => ({
    ...t,
    initiated_by_profile: pMap[t.initiated_by] ?? null,
    confirmed_by_profile: pMap[t.confirmed_by] ?? null,
    material:   mMap[t.material_id]  ?? null,
    from_site:  sMap[t.from_site_id] ?? null,
    to_site:    sMap[t.to_site_id]   ?? null,
  }))
}

const useMaterialTransferStore = create((set) => ({
  transfers: [],
  loading:   false,

  fetchTransfers: async (tenantId) => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('material_transfers')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
    if (error) { set({ loading: false }); throw error }
    const enriched = await enrichTransfers(data ?? [])
    set({ transfers: enriched, loading: false })
  },

  createTransfer: async (payload) => {
    const { data, error } = await supabase
      .from('material_transfers')
      .insert(payload)
      .select('*').single()
    if (error) throw error
    const [enriched] = await enrichTransfers([data])
    set((s) => ({ transfers: [enriched, ...s.transfers] }))
    return enriched
  },

  /**
   * Receiver site manager confirms a transfer.
   * Fix: stock deduction and addition are now done via atomic RPC calls
   * (record_material_transaction) instead of JS read-then-write, eliminating
   * the race condition under concurrent usage.
   *
   * @param {string} transferId
   * @param {string} profileId         — confirming user
   * @param {object} opts
   *   quantityReceived   {number}
   *   discrepancyReason  {string}
   *   discrepancyAction  {string}
   */
  confirmTransfer: async (transferId, profileId, opts = {}) => {
    const now = new Date().toISOString()
    const { quantityReceived, discrepancyReason, discrepancyAction } = opts

    // Fetch full transfer
    const { data: transfer, error: tErr } = await supabase
      .from('material_transfers').select('*').eq('id', transferId).single()
    if (tErr) throw tErr

    const qtyDispatched  = Number(transfer.quantity)
    const qtyReceived    = quantityReceived ?? qtyDispatched
    const hasDiscrepancy = qtyReceived !== qtyDispatched

    // Fetch sender material for metadata
    const { data: fromMat, error: fErr } = await supabase
      .from('materials').select('*').eq('id', transfer.material_id).single()
    if (fErr) throw fErr

    const [{ data: fromSite }, { data: toSite }] = await Promise.all([
      supabase.from('sites').select('name').eq('id', transfer.from_site_id).single(),
      supabase.from('sites').select('name').eq('id', transfer.to_site_id).single(),
    ])

    const lrNote = [
      transfer.lr_number      ? `LR: ${transfer.lr_number}`           : null,
      transfer.challan_number ? `Challan: ${transfer.challan_number}` : null,
      transfer.vehicle_number ? `Vehicle: ${transfer.vehicle_number}` : null,
    ].filter(Boolean).join(' | ')

    // Find or create matching material on receiver site
    const { data: toMatArr } = await supabase
      .from('materials')
      .select('id, quantity_available')
      .eq('site_id', transfer.to_site_id)
      .eq('name', fromMat.name)
      .eq('unit', fromMat.unit)
      .limit(1)

    let toMaterialId
    if (toMatArr && toMatArr.length > 0) {
      toMaterialId = toMatArr[0].id
    } else {
      const { data: newMat, error: nErr } = await supabase
        .from('materials')
        .insert({
          site_id:            transfer.to_site_id,
          tenant_id:          transfer.tenant_id,
          name:               fromMat.name,
          unit:               fromMat.unit,
          unit_cost:          fromMat.unit_cost,
          quantity_available: 0,   // RPC will add the correct amount atomically
          quantity_minimum:   fromMat.quantity_minimum,
          supplier:           fromMat.supplier,
          category:           fromMat.category,
          opening_stock_recorded: true,
        })
        .select('id').single()
      if (nErr) throw nErr
      toMaterialId = newMat.id
    }

    // Atomic stock deduction on sender via RPC
    await supabase.rpc('record_material_transaction', {
      p_material_id: transfer.material_id,
      p_site_id:     transfer.from_site_id,
      p_tenant_id:   transfer.tenant_id,
      p_txn_type:    'transfer_out',
      p_quantity:    qtyDispatched,
      p_ref_type:    'transfer',
      p_ref_id:      transferId,
      p_note:        `Transferred to ${toSite?.name ?? 'site'}${lrNote ? ' | ' + lrNote : ''}${hasDiscrepancy ? ` | Dispatched: ${qtyDispatched}, Received: ${qtyReceived}` : ''}`,
      p_created_by:  profileId,
    })

    // Atomic stock addition on receiver via RPC
    await supabase.rpc('record_material_transaction', {
      p_material_id: toMaterialId,
      p_site_id:     transfer.to_site_id,
      p_tenant_id:   transfer.tenant_id,
      p_txn_type:    'transfer_in',
      p_quantity:    qtyReceived,
      p_ref_type:    'transfer',
      p_ref_id:      transferId,
      p_note:        `Transfer from ${fromSite?.name ?? 'site'}${lrNote ? ' | ' + lrNote : ''}`,
      p_created_by:  profileId,
    })

    // Mark transfer confirmed
    const { error: cErr } = await supabase
      .from('material_transfers')
      .update({
        status:            'confirmed',
        confirmed_by:      profileId,
        confirmed_at:      now,
        quantity_received: qtyReceived,
        ...(hasDiscrepancy && { discrepancy_reason: discrepancyReason, discrepancy_action: discrepancyAction }),
      })
      .eq('id', transferId)
    if (cErr) throw cErr

    set((s) => ({
      transfers: s.transfers.map((t) =>
        t.id === transferId ? { ...t, status: 'confirmed', confirmed_at: now, quantity_received: qtyReceived } : t
      ),
    }))
  },

  rejectTransfer: async (transferId, profileId, reason = '') => {
    const { error } = await supabase
      .from('material_transfers')
      .update({ status: 'rejected', confirmed_by: profileId, discrepancy_reason: reason || null })
      .eq('id', transferId)
    if (error) throw error
    set((s) => ({
      transfers: s.transfers.map((t) =>
        t.id === transferId ? { ...t, status: 'rejected' } : t
      ),
    }))
  },
}))

export default useMaterialTransferStore
