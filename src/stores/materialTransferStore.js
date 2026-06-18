import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { createNotification } from '@/stores/notificationStore'

// 4-stage lifecycle: initiated → prepared → approved → received (+ rejected).
//   initiate       — Store Keeper / Site Manager raises the request
//   prepareDispatch— from-site Supervisor fills detail & confirms → stock OUT
//   approveTransfer— Store Keeper / Site Manager signs off
//   receiveTransfer— receiving site accepts → stock IN

async function enrichTransfers(list) {
  if (!list.length) return list
  const profileIds = [...new Set(
    list.flatMap((t) => [t.initiated_by, t.prepared_by, t.approved_by, t.received_by]).filter(Boolean),
  )]
  const materialIds = [...new Set(list.map((t) => t.material_id).filter(Boolean))]
  const siteIds = [...new Set(list.flatMap((t) => [t.from_site_id, t.to_site_id]).filter(Boolean))]

  const [pRes, mRes, sRes] = await Promise.all([
    profileIds.length  ? supabase.from('profiles').select('id, full_name').in('id', profileIds)   : { data: [] },
    materialIds.length ? supabase.from('materials').select('id, name, unit').in('id', materialIds) : { data: [] },
    siteIds.length     ? supabase.from('sites').select('id, name, type').in('id', siteIds)          : { data: [] },
  ])
  const pMap = Object.fromEntries((pRes.data ?? []).map((p) => [p.id, p]))
  const mMap = Object.fromEntries((mRes.data ?? []).map((m) => [m.id, m]))
  const sMap = Object.fromEntries((sRes.data ?? []).map((s) => [s.id, s]))

  return list.map((t) => ({
    ...t,
    initiated_by_profile: pMap[t.initiated_by] ?? null,
    prepared_by_profile:  pMap[t.prepared_by]  ?? null,
    approved_by_profile:  pMap[t.approved_by]  ?? null,
    received_by_profile:  pMap[t.received_by]  ?? null,
    material:  mMap[t.material_id]  ?? null,
    from_site: sMap[t.from_site_id] ?? null,
    to_site:   sMap[t.to_site_id]   ?? null,
  }))
}

const useMaterialTransferStore = create((set) => ({
  transfers: [],
  loading:   false,

  fetchTransfers: async (tenantId) => {
    set({ loading: true })
    try {
      const { data, error } = await supabase
        .from('material_transfers').select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
      if (error) throw error
      set({ transfers: await enrichTransfers(data ?? []) })
    } catch {
    } finally {
      set({ loading: false })
    }
  },

  patchLocal: (id, patch) => set((s) => ({
    transfers: s.transfers.map((t) => (t.id === id ? { ...t, ...patch } : t)),
  })),

  /** Stage 1 — Store Keeper / Site Manager raises the request. */
  initiateTransfer: async (payload) => {
    const { data, error } = await supabase
      .from('material_transfers')
      .insert({ ...payload, status: 'initiated' })
      .select('*').single()
    if (error) throw error
    const [enriched] = await enrichTransfers([data])
    set((s) => ({ transfers: [enriched, ...s.transfers] }))
    return enriched
  },

  /** Stage 2 — from-site Supervisor fills dispatch detail & confirms. Stock leaves the from-site. */
  prepareDispatch: async (transferId, profileId, detail = {}) => {
    const now = new Date().toISOString()
    const { data: transfer, error: tErr } = await supabase
      .from('material_transfers').select('*').eq('id', transferId).single()
    if (tErr) throw tErr

    const qty = Number(detail.quantity ?? transfer.quantity)
    const { data: toSite } = await supabase
      .from('sites').select('name').eq('id', transfer.to_site_id).single()

    // Stock OUT of the from-site (atomic, row-locked RPC)
    await supabase.rpc('record_material_transaction', {
      p_material_id: transfer.material_id,
      p_site_id:     transfer.from_site_id,
      p_tenant_id:   transfer.tenant_id,
      p_txn_type:    'transfer_out',
      p_quantity:    qty,
      p_ref_type:    'transfer',
      p_ref_id:      transferId,
      p_note:        `Dispatched to ${toSite?.name ?? 'site'}`,
      p_created_by:  profileId,
    })

    const { error: uErr } = await supabase.from('material_transfers').update({
      status:         'prepared',
      prepared_by:    profileId,
      prepared_at:    now,
      quantity:       qty,
      lr_number:      detail.lr_number      ?? transfer.lr_number,
      lr_date:        detail.lr_date        ?? transfer.lr_date,
      challan_number: detail.challan_number ?? transfer.challan_number,
      challan_date:   detail.challan_date   ?? transfer.challan_date,
      vehicle_number: detail.vehicle_number ?? transfer.vehicle_number,
    }).eq('id', transferId)
    if (uErr) throw uErr
    useMaterialTransferStore.getState().patchLocal(transferId, {
      status: 'prepared', prepared_by: profileId, prepared_at: now, quantity: qty,
    })
  },

  /** Stage 3 — Store Keeper / Site Manager signs off the dispatch. */
  approveTransfer: async (transferId, profileId) => {
    const now = new Date().toISOString()
    const transfer = useMaterialTransferStore.getState().transfers.find(t => t.id === transferId)
    const { error } = await supabase.from('material_transfers')
      .update({ status: 'approved', approved_by: profileId, approved_at: now })
      .eq('id', transferId)
    if (error) throw error
    useMaterialTransferStore.getState().patchLocal(transferId, {
      status: 'approved', approved_by: profileId, approved_at: now,
    })
    // Notify the supervisor who prepared the dispatch — fire-and-forget
    if (transfer?.prepared_by && transfer.prepared_by !== profileId) {
      createNotification({
        tenantId:   transfer.tenant_id,
        userId:     transfer.prepared_by,
        title:      'Transfer approved — ready to dispatch 🔄',
        body:       `${transfer.material?.name ?? 'Material'} from ${transfer.from_site?.name ?? ''} to ${transfer.to_site?.name ?? ''} approved`,
        type:       'transfer_pending',
        entityId:   transferId,
        entityType: 'transfer',
      }).catch(() => {})
    }
  },

  /** Stage 4 — receiving site accepts. Stock arrives at the to-site. */
  receiveTransfer: async (transferId, profileId, opts = {}) => {
    const now = new Date().toISOString()
    const { quantityReceived, discrepancyReason, discrepancyAction } = opts

    const { data: transfer, error: tErr } = await supabase
      .from('material_transfers').select('*').eq('id', transferId).single()
    if (tErr) throw tErr

    const qtyDispatched  = Number(transfer.quantity)
    const qtyReceived    = quantityReceived ?? qtyDispatched
    const hasDiscrepancy = qtyReceived !== qtyDispatched

    const { data: fromMat, error: fErr } = await supabase
      .from('materials').select('*').eq('id', transfer.material_id).single()
    if (fErr) throw fErr
    const [{ data: fromSite }, { data: toSite }] = await Promise.all([
      supabase.from('sites').select('name').eq('id', transfer.from_site_id).single(),
      supabase.from('sites').select('name').eq('id', transfer.to_site_id).single(),
    ])

    // Find or create the matching material on the receiving site
    const { data: toMatArr } = await supabase
      .from('materials').select('id')
      .eq('site_id', transfer.to_site_id).eq('name', fromMat.name).eq('unit', fromMat.unit)
      .limit(1)
    let toMaterialId = toMatArr?.[0]?.id
    if (!toMaterialId) {
      const { data: newMat, error: nErr } = await supabase.from('materials').insert({
        site_id: transfer.to_site_id, tenant_id: transfer.tenant_id,
        name: fromMat.name, unit: fromMat.unit, unit_cost: fromMat.unit_cost,
        quantity_available: 0, quantity_minimum: fromMat.quantity_minimum,
        supplier: fromMat.supplier, category: fromMat.category, opening_stock_recorded: true,
      }).select('id').single()
      if (nErr) throw nErr
      toMaterialId = newMat.id
    }

    // Stock IN to the to-site (atomic RPC)
    await supabase.rpc('record_material_transaction', {
      p_material_id: toMaterialId,
      p_site_id:     transfer.to_site_id,
      p_tenant_id:   transfer.tenant_id,
      p_txn_type:    'transfer_in',
      p_quantity:    qtyReceived,
      p_ref_type:    'transfer',
      p_ref_id:      transferId,
      p_note:        `Transfer from ${fromSite?.name ?? 'site'}${hasDiscrepancy ? ` | dispatched ${qtyDispatched}, received ${qtyReceived}` : ''}`,
      p_created_by:  profileId,
    })

    const { error: rErr } = await supabase.from('material_transfers').update({
      status: 'received', received_by: profileId, received_at: now,
      quantity_received: qtyReceived,
      ...(hasDiscrepancy && { discrepancy_reason: discrepancyReason, discrepancy_action: discrepancyAction }),
    }).eq('id', transferId)
    if (rErr) throw rErr
    useMaterialTransferStore.getState().patchLocal(transferId, {
      status: 'received', received_by: profileId, received_at: now, quantity_received: qtyReceived,
    })
    // Notify the initiator — fire-and-forget
    if (transfer.initiated_by && transfer.initiated_by !== profileId) {
      createNotification({
        tenantId:   transfer.tenant_id,
        userId:     transfer.initiated_by,
        title:      'Transfer received ✅',
        body:       `${qtyReceived} ${fromMat.unit} of ${fromMat.name} received at ${toSite?.name ?? 'the destination site'}`,
        type:       'transfer_pending',
        entityId:   transferId,
        entityType: 'transfer',
      }).catch(() => {})
    }
  },

  rejectTransfer: async (transferId, profileId, reason = '') => {
    const { error } = await supabase.from('material_transfers')
      .update({ status: 'rejected', approved_by: profileId, discrepancy_reason: reason || null })
      .eq('id', transferId)
    if (error) throw error
    useMaterialTransferStore.getState().patchLocal(transferId, { status: 'rejected' })
  },
}))

export default useMaterialTransferStore
