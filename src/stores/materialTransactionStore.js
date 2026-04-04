import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

// Human-readable labels for txn_type
export const TXN_LABELS = {
  opening:      'Opening Balance',
  receipt:      'GRN Receipt',
  transfer_in:  'Transfer In',
  transfer_out: 'Transfer Out',
  consumption:  'Consumption',
  allocation:   'Work Allocation',
  wastage:      'Wastage',
  return:       'Return to Stock',
  adjustment:   'Stock Adjustment',
}

// Which txn_types increase stock (+) vs decrease (-) vs set (=)
export const TXN_SIGN = {
  opening:      '+',
  receipt:      '+',
  transfer_in:  '+',
  transfer_out: '-',
  consumption:  '-',
  allocation:   '-',
  wastage:      '-',
  return:       '+',
  adjustment:   '=',
}

export const TXN_BADGE = {
  opening:      'badge-blue',
  receipt:      'badge-green',
  transfer_in:  'badge-green',
  transfer_out: 'badge-yellow',
  consumption:  'badge-red',
  allocation:   'badge-red',
  wastage:      'badge-red',
  return:       'badge-green',
  adjustment:   'badge-yellow',
}

const useMaterialTransactionStore = create((set) => ({
  transactions: [],
  loading: false,

  /**
   * Fetch the full ledger for a material, oldest first (for running balance).
   * Enriches each row with creator profile and reference document info.
   */
  fetchLedger: async (materialId) => {
    set({ loading: true, transactions: [] })

    const { data, error } = await supabase
      .from('material_transactions')
      .select('*')
      .eq('material_id', materialId)
      .order('created_at', { ascending: true })

    if (error) { set({ loading: false }); throw error }
    const list = data ?? []

    // Enrich with creator profiles
    const profileIds = [...new Set(list.map((t) => t.created_by).filter(Boolean))]
    let profileMap = {}
    if (profileIds.length) {
      const { data: profiles } = await supabase
        .from('profiles').select('id, full_name').in('id', profileIds)
      profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))
    }

    // Compute running balance (from first transaction forward)
    let running = 0
    const enriched = list.map((t) => {
      const sign = TXN_SIGN[t.txn_type]
      if (sign === '+') running += Number(t.quantity)
      else if (sign === '-') running -= Number(t.quantity)
      else if (sign === '=') running = Number(t.quantity)

      return {
        ...t,
        created_by_profile: profileMap[t.created_by] ?? null,
        computed_balance:   running,
      }
    })

    set({ transactions: enriched, loading: false })
  },

  /**
   * Record a transaction and update quantity_available atomically via Postgres RPC.
   * Replaces the previous JS read-then-write pattern which had a race condition
   * under concurrent usage.
   *
   * The RPC `record_material_transaction` must exist in Supabase (see migration notes).
   * It accepts: material_id, site_id, tenant_id, txn_type, quantity,
   *             note, created_by, ref_type, ref_id
   * It returns: { txn_id, new_qty }
   *
   * payload must include: material_id, site_id, tenant_id, txn_type, quantity
   * Optional: note, created_by, ref_type, ref_id
   */
  recordTransaction: async (payload) => {
    const { data, error } = await supabase.rpc('record_material_transaction', {
      p_material_id: payload.material_id,
      p_site_id:     payload.site_id,
      p_tenant_id:   payload.tenant_id,
      p_txn_type:    payload.txn_type,
      p_quantity:    payload.quantity,
      p_note:        payload.note        ?? null,
      p_created_by:  payload.created_by  ?? null,
      p_ref_type:    payload.ref_type    ?? null,
      p_ref_id:      payload.ref_id      ?? null,
    })
    if (error) throw error
    return { txn: data.txn_id, newQty: data.new_qty }
  },
}))

export default useMaterialTransactionStore
