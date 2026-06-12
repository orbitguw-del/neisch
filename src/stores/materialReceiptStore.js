import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import useEquipmentAssetStore from './equipmentAssetStore'

async function enrichReceipts(list) {
  if (!list.length) return list
  const profileIds  = [...new Set([...list.map((r) => r.created_by), ...list.map((r) => r.received_by)].filter(Boolean))]
  const materialIds = [...new Set(list.map((r) => r.material_id).filter(Boolean))]
  const siteIds     = [...new Set(list.map((r) => r.site_id).filter(Boolean))]

  const [pRes, mRes, sRes] = await Promise.all([
    profileIds.length  ? supabase.from('profiles').select('id, full_name').in('id', profileIds)                       : { data: [] },
    materialIds.length ? supabase.from('materials').select('id, name, unit, category').in('id', materialIds)          : { data: [] },
    siteIds.length     ? supabase.from('sites').select('id, name').in('id', siteIds)                                   : { data: [] },
  ])

  const pMap = Object.fromEntries((pRes.data ?? []).map((p) => [p.id, p]))
  const mMap = Object.fromEntries((mRes.data ?? []).map((m) => [m.id, m]))
  const sMap = Object.fromEntries((sRes.data ?? []).map((s) => [s.id, s]))

  return list.map((r) => ({
    ...r,
    created_by_profile:  pMap[r.created_by]  ?? null,
    received_by_profile: pMap[r.received_by] ?? null,
    material: mMap[r.material_id] ?? null,
    site:     sMap[r.site_id]     ?? null,
  }))
}

const useMaterialReceiptStore = create((set, get) => ({
  receipts: [],
  loading:  false,

  fetchReceipts: async (tenantId) => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('material_receipts')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
    if (error) { set({ loading: false }); throw error }
    const enriched = await enrichReceipts(data ?? [])
    set({ receipts: enriched, loading: false })
  },

  createReceipt: async (payload, destinationSiteId = null) => {
    const { data, error } = await supabase
      .from('material_receipts')
      .insert(payload)
      .select('*')
      .single()
    if (error) throw error

    if (destinationSiteId) {
      const { error: tErr } = await supabase.from('material_transfers').insert({
        material_id:  payload.material_id,
        from_site_id: payload.site_id,
        to_site_id:   destinationSiteId,
        tenant_id:    payload.tenant_id,
        quantity:     payload.quantity,
        status:       'initiated',
        initiated_by: payload.created_by,
        note:         `Auto-created from receipt ${data.id}`,
      })
      if (tErr) throw tErr
    }

    const [enriched] = await enrichReceipts([data])
    set((s) => ({ receipts: [enriched, ...s.receipts] }))
    return enriched
  },

  /**
   * Site manager confirms a receipt.
   * @param {string}  receiptId
   * @param {string}  profileId        — confirming user's profile id
   * @param {object}  opts
   *   quantityReceived   {number}     — actual qty received (may differ from ordered)
   *   discrepancyReason  {string}     — required if qty differs
   *   discrepancyAction  {string}     — 'accept_partial' | 'reject_balance' | 'pending_balance'
   *   assetSerials       {string[]}   — serial numbers for equipment units (optional)
   *   assetMake          {string}
   *   assetModel         {string}
   */
  confirmReceipt: async (receiptId, profileId, opts = {}) => {
    const now = new Date().toISOString()
    const {
      quantityReceived,
      discrepancyReason,
      discrepancyAction,
      assetSerials = [],
      assetMake,
      assetModel,
    } = opts

    // Fetch full receipt
    const { data: receipt, error: rFetchErr } = await supabase
      .from('material_receipts')
      .select('*')
      .eq('id', receiptId)
      .single()
    if (rFetchErr) throw rFetchErr

    const qtyToAdd = quantityReceived ?? Number(receipt.quantity)
    const hasDiscrepancy = qtyToAdd !== Number(receipt.quantity)

    // Generate GRN number
    const { data: grn, error: grnErr } = await supabase
      .rpc('next_grn_number', { p_tenant_id: receipt.tenant_id })
    if (grnErr) throw grnErr

    // Update receipt record
    const { error: rErr } = await supabase
      .from('material_receipts')
      .update({
        status:             'received',
        grn_number:         grn,
        quantity_received:  qtyToAdd,
        received_by:        profileId,
        received_at:        now,
        ...(hasDiscrepancy && { discrepancy_reason: discrepancyReason, discrepancy_action: discrepancyAction }),
      })
      .eq('id', receiptId)
    if (rErr) throw rErr

    // Build ledger note
    const noteparts = [
      `${receipt.source_type === 'supplier' ? 'Supplier' : 'Warehouse'}: ${receipt.source_name}`,
      `GRN: ${grn}`,
      receipt.lr_number      ? `LR: ${receipt.lr_number}`           : null,
      receipt.challan_number ? `Challan: ${receipt.challan_number}` : null,
      receipt.vehicle_number ? `Vehicle: ${receipt.vehicle_number}` : null,
      hasDiscrepancy         ? `Note: ordered ${receipt.quantity}, received ${qtyToAdd}` : null,
    ].filter(Boolean).join(' | ')

    // Stock IN — atomic, row-locked RPC. Updates quantity_available AND writes the
    // ledger row in one locked statement, so concurrent receipts can't lose an update.
    // (Replaces the earlier read-add-write + manual ledger insert, which raced.)
    const { error: rpcErr } = await supabase.rpc('record_material_transaction', {
      p_material_id: receipt.material_id,
      p_site_id:     receipt.site_id,
      p_tenant_id:   receipt.tenant_id,
      p_txn_type:    'receipt',
      p_quantity:    qtyToAdd,
      p_note:        noteparts,
      p_created_by:  profileId,
      p_ref_type:    'receipt',
      p_ref_id:      receiptId,
    })
    if (rpcErr) throw rpcErr

    // If equipment category: create individual asset records
    const { data: materialRow } = await supabase
      .from('materials')
      .select('category')
      .eq('id', receipt.material_id)
      .single()

    if (materialRow?.category === 'equipment') {
      const { bulkCreateAssets } = useEquipmentAssetStore.getState()
      await bulkCreateAssets({
        materialId:  receipt.material_id,
        siteId:      receipt.site_id,
        tenantId:    receipt.tenant_id,
        grnReceiptId: receiptId,
        count:       Math.floor(qtyToAdd),
        serials:     assetSerials,
        make:        assetMake,
        model:       assetModel,
        createdBy:   profileId,
      })
    }

    // Update local state
    set((s) => ({
      receipts: s.receipts.map((r) =>
        r.id === receiptId
          ? { ...r, status: 'received', grn_number: grn, quantity_received: qtyToAdd, received_at: now }
          : r
      ),
    }))

    return { grn, qtyToAdd }
  },

  rejectReceipt: async (receiptId, profileId, reason = '') => {
    const { error } = await supabase
      .from('material_receipts')
      .update({ status: 'rejected', received_by: profileId, discrepancy_reason: reason || null })
      .eq('id', receiptId)
    if (error) throw error
    set((s) => ({
      receipts: s.receipts.map((r) =>
        r.id === receiptId ? { ...r, status: 'rejected' } : r
      ),
    }))
  },
}))

export default useMaterialReceiptStore
