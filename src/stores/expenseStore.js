import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

const useExpenseStore = create((set, get) => ({
  expenses: [],
  loading: false,
  error: null,

  /**
   * Fetch expenses for a tenant, optionally scoped to a site and/or date range.
   * Joins site name + creator/approver names for display.
   */
  fetchExpenses: async (tenantId, { siteId = null, startDate = null, endDate = null } = {}) => {
    set({ loading: true, error: null })
    let q = supabase
      .from('site_expenses')
      .select('*, sites(name), creator:created_by(full_name), approver:approved_by(full_name)')
      .eq('tenant_id', tenantId)
      .order('expense_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (siteId)    q = q.eq('site_id', siteId)
    if (startDate) q = q.gte('expense_date', startDate)
    if (endDate)   q = q.lte('expense_date', endDate)

    const { data, error } = await q
    set({ expenses: data ?? [], loading: false, error: error?.message ?? null })
  },

  createExpense: async (payload) => {
    const { data, error } = await supabase
      .from('site_expenses')
      .insert({ ...payload, status: 'pending' })
      .select('*, sites(name), creator:created_by(full_name), approver:approved_by(full_name)')
      .single()
    if (error) throw error
    set((s) => ({ expenses: [data, ...s.expenses] }))
    return data
  },

  /** Approve or reject — only site_manager / contractor / superadmin (enforced by RLS). */
  setExpenseStatus: async (id, status, approverId) => {
    const patch = status === 'approved'
      ? { status, approved_by: approverId, approved_at: new Date().toISOString() }
      : { status, approved_by: approverId, approved_at: new Date().toISOString() }
    const { data, error } = await supabase
      .from('site_expenses')
      .update(patch)
      .eq('id', id)
      .select('*, sites(name), creator:created_by(full_name), approver:approved_by(full_name)')
      .single()
    if (error) throw error
    set((s) => ({ expenses: s.expenses.map((e) => (e.id === id ? data : e)) }))
    return data
  },

  deleteExpense: async (id) => {
    const { error } = await supabase.from('site_expenses').delete().eq('id', id)
    if (error) throw error
    set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) }))
  },
}))

export default useExpenseStore
