import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

/**
 * Cost centres = spend buckets within a site (Building, Utilities, …).
 * Each carries its own budget. Materials are tagged to one; actual cost
 * rolls up from confirmed receipts via the cost_centre_budget_v view.
 */
const useCostCentreStore = create((set) => ({
  costCentres: [],   // raw cost_centres rows for the active site
  budgetRollup: [],  // cost_centre_budget_v rows (budget vs actual) for the active site
  loading: false,
  error: null,

  /** Fetch the editable list of cost centres for a site. */
  fetchCostCentres: async (siteId) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('cost_centres')
        .select('*')
        .eq('site_id', siteId)
        .order('sort_order')
        .order('name')
      if (error) throw new Error(error.message)
      set({ costCentres: data ?? [], error: null })
    } catch (err) {
      set({ error: err.message })
    } finally {
      set({ loading: false })
    }
  },

  /** Fetch budget-vs-actual rollup (view) for a site — for chips and Reports. */
  fetchBudgetRollup: async (siteId) => {
    const { data, error } = await supabase
      .from('cost_centre_budget_v')
      .select('*')
      .eq('site_id', siteId)
      .order('sort_order')
    set({ budgetRollup: data ?? [], error: error?.message ?? null })
    return data ?? []
  },

  createCostCentre: async (payload) => {
    const { data, error } = await supabase
      .from('cost_centres')
      .insert(payload)
      .select()
      .single()
    if (error) {
      if (error.code === '23505') {
        throw new Error(`A cost centre named "${payload.name}" already exists on this site.`)
      }
      throw error
    }
    set((s) => ({ costCentres: [...s.costCentres, data] }))
    return data
  },

  updateCostCentre: async (id, payload) => {
    const { data, error } = await supabase
      .from('cost_centres')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) {
      if (error.code === '23505') {
        throw new Error(`A cost centre named "${payload.name}" already exists on this site.`)
      }
      throw error
    }
    set((s) => ({ costCentres: s.costCentres.map((c) => (c.id === id ? data : c)) }))
    return data
  },

  /** Delete a cost centre. Tagged materials fall back to "Unassigned" (FK on delete set null). */
  deleteCostCentre: async (id) => {
    const { error } = await supabase.from('cost_centres').delete().eq('id', id)
    if (error) throw error
    set((s) => ({ costCentres: s.costCentres.filter((c) => c.id !== id) }))
  },
}))

export default useCostCentreStore
