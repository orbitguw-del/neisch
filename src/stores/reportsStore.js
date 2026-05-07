import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

const useReportsStore = create((set, get) => ({
  // ─── Monthly report ──────────────────────────────────────────────────────
  monthlyData:    null,
  monthlyLoading: false,

  fetchMonthlyReport: async (tenantId, month /* 'YYYY-MM' */, siteId = null) => {
    set({ monthlyLoading: true, monthlyData: null })

    const startTs = `${month}-01T00:00:00`
    // Last day of month: go to next month day 1 and subtract 1 ms
    const [yr, mo] = month.split('-').map(Number)
    const nextMonth = mo === 12 ? `${yr + 1}-01` : `${yr}-${String(mo + 1).padStart(2, '0')}`
    const endTs = `${nextMonth}-01T00:00:00`

    // Receipts in range
    let rQuery = supabase
      .from('material_receipts')
      .select('material_id, quantity, unit_cost, site_id, materials(name, unit), sites(name)')
      .eq('tenant_id', tenantId)
      .eq('status', 'received')
      .gte('created_at', startTs)
      .lt('created_at', endTs)

    if (siteId) rQuery = rQuery.eq('site_id', siteId)

    // Transfers out in range
    let toQuery = supabase
      .from('material_transfers')
      .select('material_id, quantity, from_site_id, materials(name, unit), sites!material_transfers_from_site_id_fkey(name)')
      .eq('tenant_id', tenantId)
      .eq('status', 'confirmed')
      .gte('created_at', startTs)
      .lt('created_at', endTs)

    if (siteId) toQuery = toQuery.eq('from_site_id', siteId)

    const [{ data: receipts }, { data: transfersOut }] = await Promise.all([
      rQuery,
      toQuery,
    ])

    // Aggregate by material
    const byMaterial = {}

    ;(receipts ?? []).forEach((r) => {
      const key = r.material_id
      if (!byMaterial[key]) {
        byMaterial[key] = {
          name:        r.materials?.name ?? 'Unknown',
          unit:        r.materials?.unit ?? '',
          received:    0,
          transferred: 0,
          cost:        0,
        }
      }
      byMaterial[key].received += Number(r.quantity)
      byMaterial[key].cost     += Number(r.quantity) * Number(r.unit_cost || 0)
    })

    ;(transfersOut ?? []).forEach((t) => {
      const key = t.material_id
      if (!byMaterial[key]) {
        byMaterial[key] = {
          name:        t.materials?.name ?? 'Unknown',
          unit:        t.materials?.unit ?? '',
          received:    0,
          transferred: 0,
          cost:        0,
        }
      }
      byMaterial[key].transferred += Number(t.quantity)
    })

    const rows = Object.entries(byMaterial).map(([id, data]) => ({ id, ...data }))
    const totalCost = rows.reduce((s, r) => s + r.cost, 0)

    set({ monthlyData: { month, rows, totalCost }, monthlyLoading: false })
  },

  // ─── Budget vs Actual ────────────────────────────────────────────────────
  budgetData:    null,
  budgetLoading: false,

  fetchBudgetReport: async (tenantId, siteId, month) => {
    set({ budgetLoading: true, budgetData: null })

    const startTs = `${month}-01T00:00:00`
    const [yr, mo] = month.split('-').map(Number)
    const nextMonth = mo === 12 ? `${yr + 1}-01` : `${yr}-${String(mo + 1).padStart(2, '0')}`
    const endTs = `${nextMonth}-01T00:00:00`

    const [{ data: budgets }, { data: receipts }] = await Promise.all([
      supabase
        .from('budget_lines')
        .select('*, materials(name, unit)')
        .eq('tenant_id', tenantId)
        .eq('site_id', siteId)
        .eq('period_month', month),
      supabase
        .from('material_receipts')
        .select('material_id, quantity, unit_cost')
        .eq('tenant_id', tenantId)
        .eq('site_id', siteId)
        .eq('status', 'received')
        .gte('created_at', startTs)
        .lt('created_at', endTs),
    ])

    // Map actual spend per material
    const actualByMaterial = {}
    ;(receipts ?? []).forEach((r) => {
      actualByMaterial[r.material_id] = (actualByMaterial[r.material_id] || 0) +
        Number(r.quantity) * Number(r.unit_cost || 0)
    })

    const items = (budgets ?? []).map((b) => {
      const actual   = actualByMaterial[b.material_id] || 0
      const variance = Number(b.budgeted_cost) - actual
      return {
        id:             b.id,
        material_id:    b.material_id,
        material:       b.materials?.name ?? 'Unknown',
        unit:           b.materials?.unit ?? '',
        budgeted_qty:   Number(b.budgeted_quantity),
        budgeted_cost:  Number(b.budgeted_cost),
        actual,
        variance,
        variance_pct:   b.budgeted_cost > 0
          ? ((variance / Number(b.budgeted_cost)) * 100).toFixed(1)
          : '0.0',
      }
    })

    const totalBudgeted = items.reduce((s, i) => s + i.budgeted_cost, 0)
    const totalActual   = items.reduce((s, i) => s + i.actual, 0)

    set({
      budgetData: { month, siteId, items, totalBudgeted, totalActual, totalVariance: totalBudgeted - totalActual },
      budgetLoading: false,
    })
  },

  // ─── Budget lines CRUD ───────────────────────────────────────────────────
  budgetLines:        [],
  budgetLinesLoading: false,

  fetchBudgetLines: async (tenantId, siteId, month) => {
    set({ budgetLinesLoading: true })
    const { data } = await supabase
      .from('budget_lines')
      .select('*, materials(name, unit)')
      .eq('tenant_id', tenantId)
      .eq('site_id', siteId)
      .eq('period_month', month)
      .order('created_at', { ascending: true })
    set({ budgetLines: data ?? [], budgetLinesLoading: false })
  },

  createBudgetLine: async (payload) => {
    const { data, error } = await supabase
      .from('budget_lines')
      .upsert(payload, { onConflict: 'site_id,material_id,period_month' })
      .select('*, materials(name, unit)')
      .single()
    if (error) throw error
    set((s) => {
      const exists = s.budgetLines.find((b) => b.id === data.id)
      return {
        budgetLines: exists
          ? s.budgetLines.map((b) => (b.id === data.id ? data : b))
          : [data, ...s.budgetLines],
      }
    })
    return data
  },

  deleteBudgetLine: async (id) => {
    const { error } = await supabase.from('budget_lines').delete().eq('id', id)
    if (error) throw error
    set((s) => ({ budgetLines: s.budgetLines.filter((b) => b.id !== id) }))
  },
}))

export default useReportsStore
