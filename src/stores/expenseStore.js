import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { isOnline, queueWrite, offlineId } from '@/lib/offlineWrite'
import { withCache } from '@/lib/cachedFetch'

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
    try {
      await withCache('expense', 'fetchExpenses', { t: tenantId, s: siteId, sd: startDate, ed: endDate },
        async () => {
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
          if (error) throw new Error(error.message)
          return data ?? []
        },
        (data) => set((s) => {
          // Preserve optimistic rows queued offline — they live only in store
          // state, so a cache-driven re-fetch would otherwise wipe them.
          const pending = s.expenses.filter((e) => e._pending)
          return { expenses: [...pending, ...data], loading: false, error: null }
        }),
      )
    } catch (err) {
      set({ loading: false, error: err.message })
    }
  },

  createExpense: async (payload) => {
    const row = { ...payload, status: 'pending' }

    // Offline: queue the insert and show an optimistic row immediately.
    if (!isOnline()) {
      await queueWrite({
        table: 'site_expenses',
        op: 'insert',
        payload: row,
        label: `Expense — ${row.expense_date ?? ''}`,
      })
      const optimistic = {
        ...row,
        id: offlineId(),
        created_at: new Date().toISOString(),
        sites: null, creator: null, approver: null,
        _pending: true,
      }
      set((s) => ({ expenses: [optimistic, ...s.expenses] }))
      return optimistic
    }

    const { data, error } = await supabase
      .from('site_expenses')
      .insert(row)
      .select('*, sites(name), creator:created_by(full_name), approver:approved_by(full_name)')
      .single()
    if (error) throw error
    set((s) => ({ expenses: [data, ...s.expenses] }))
    return data
  },

  /** Approve or reject — only site_manager / contractor / superadmin (enforced by RLS). */
  setExpenseStatus: async (id, status, approverId) => {
    const patch = { status, approved_by: approverId, approved_at: new Date().toISOString() }
    if (!isOnline()) {
      await queueWrite({
        table: 'site_expenses',
        op: 'update',
        payload: patch,
        match: { id },
        label: `Expense ${status} — ${id.slice(0, 8)}`,
      })
      // Optimistic local update so the UI flips immediately.
      set((s) => ({ expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...patch, _pending: true } : e)) }))
      return { ...patch, id }
    }
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
    if (!isOnline()) {
      // Optimistic delete + queue. Skip queueing if it's an offline-only row
      // that never reached the server (id starts with "offline-") — just drop it.
      if (!String(id).startsWith('offline-')) {
        await queueWrite({
          table: 'site_expenses',
          op: 'delete',
          match: { id },
          label: `Delete expense — ${id.slice(0, 8)}`,
        })
      }
      set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) }))
      return
    }
    const { error } = await supabase.from('site_expenses').delete().eq('id', id)
    if (error) throw error
    set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) }))
  },
}))

export default useExpenseStore
