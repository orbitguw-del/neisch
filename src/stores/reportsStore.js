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

  // ─── Attendance + payroll report ─────────────────────────────────────────
  attendanceData:    null,
  attendanceLoading: false,

  /**
   * Per-worker × per-date attendance grid with computed pay totals.
   * Status multipliers: present=1, half_day=0.5, paid_leave=1, absent=0
   */
  fetchAttendanceReport: async (tenantId, siteId, startDate, endDate) => {
    set({ attendanceLoading: true, attendanceData: null })

    // Workers in scope (active only; if siteId given, scope to that site)
    let workersQuery = supabase
      .from('workers')
      .select('id, name, trade, daily_wage, employment_type, vendor_name, site_id, sites(name)')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
    if (siteId) workersQuery = workersQuery.eq('site_id', siteId)

    // Attendance rows in range
    let attQuery = supabase
      .from('attendance')
      .select('worker_id, site_id, date, status')
      .eq('tenant_id', tenantId)
      .gte('date', startDate)
      .lte('date', endDate)
    if (siteId) attQuery = attQuery.eq('site_id', siteId)

    const [{ data: workers }, { data: attendance }] = await Promise.all([
      workersQuery, attQuery,
    ])

    // Build worker_id -> { date -> status }
    const byWorker = {}
    ;(attendance ?? []).forEach((a) => {
      if (!byWorker[a.worker_id]) byWorker[a.worker_id] = {}
      byWorker[a.worker_id][a.date] = a.status
    })

    // Build list of dates in range (YYYY-MM-DD)
    const dates = []
    const start = new Date(startDate + 'T00:00:00')
    const end = new Date(endDate + 'T00:00:00')
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().slice(0, 10))
    }

    const MULT = { present: 1.0, half_day: 0.5, paid_leave: 1.0, absent: 0.0 }

    const rows = (workers ?? []).map((w) => {
      const days = byWorker[w.id] ?? {}
      let present = 0, halfDay = 0, paidLeave = 0, absent = 0, payDays = 0
      dates.forEach((d) => {
        const s = days[d]
        if (s === 'present')    { present++;   payDays += 1.0 }
        if (s === 'half_day')   { halfDay++;   payDays += 0.5 }
        if (s === 'paid_leave') { paidLeave++; payDays += 1.0 }
        if (s === 'absent')     { absent++ }
      })
      const wage = Number(w.daily_wage) || 0
      const totalPay = payDays * wage
      return {
        id: w.id,
        name: w.name,
        trade: w.trade,
        wage,
        site_id: w.site_id,
        site_name: w.sites?.name ?? '—',
        employment_type: w.employment_type,
        vendor_name: w.vendor_name,
        days,          // {YYYY-MM-DD: status}
        present, halfDay, paidLeave, absent, payDays, totalPay,
      }
    })

    const totals = rows.reduce(
      (a, r) => ({
        present:   a.present + r.present,
        halfDay:   a.halfDay + r.halfDay,
        paidLeave: a.paidLeave + r.paidLeave,
        absent:    a.absent + r.absent,
        payDays:   a.payDays + r.payDays,
        totalPay:  a.totalPay + r.totalPay,
      }),
      { present: 0, halfDay: 0, paidLeave: 0, absent: 0, payDays: 0, totalPay: 0 },
    )

    set({
      attendanceData: { startDate, endDate, dates, rows, totals },
      attendanceLoading: false,
    })
  },

  // ─── Site consolidated report (logs + attendance + materials) ───────────
  siteReportData:    null,
  siteReportLoading: false,

  fetchSiteReport: async (tenantId, siteId, startDate, endDate) => {
    set({ siteReportLoading: true, siteReportData: null })

    const endTs = `${endDate}T23:59:59`
    const startTs = `${startDate}T00:00:00`

    const [
      { data: site },
      { data: logs },
      { data: attendance },
      { data: workers },
      { data: receipts },
      { data: transfersOut },
      { data: transfersIn },
    ] = await Promise.all([
      supabase.from('sites').select('name, location, status, budget').eq('id', siteId).single(),
      supabase
        .from('daily_logs')
        .select('id, log_date, workers_present, weather, work_done, issues, created_by')
        .eq('tenant_id', tenantId)
        .eq('site_id', siteId)
        .gte('log_date', startDate)
        .lte('log_date', endDate)
        .order('log_date', { ascending: false }),
      supabase
        .from('attendance')
        .select('worker_id, date, status')
        .eq('tenant_id', tenantId)
        .eq('site_id', siteId)
        .gte('date', startDate)
        .lte('date', endDate),
      supabase
        .from('workers')
        .select('id, name, daily_wage')
        .eq('tenant_id', tenantId)
        .eq('site_id', siteId)
        .eq('status', 'active'),
      supabase
        .from('material_receipts')
        .select('quantity, unit_cost, materials(name, unit), created_at')
        .eq('tenant_id', tenantId)
        .eq('site_id', siteId)
        .eq('status', 'received')
        .gte('created_at', startTs)
        .lte('created_at', endTs)
        .order('created_at', { ascending: false }),
      supabase
        .from('material_transfers')
        .select('quantity, materials(name, unit), to_site_id, sites!material_transfers_to_site_id_fkey(name), created_at')
        .eq('tenant_id', tenantId)
        .eq('from_site_id', siteId)
        .eq('status', 'confirmed')
        .gte('created_at', startTs)
        .lte('created_at', endTs),
      supabase
        .from('material_transfers')
        .select('quantity, materials(name, unit), from_site_id, sites!material_transfers_from_site_id_fkey(name), created_at')
        .eq('tenant_id', tenantId)
        .eq('to_site_id', siteId)
        .eq('status', 'confirmed')
        .gte('created_at', startTs)
        .lte('created_at', endTs),
    ])

    // ── Attendance summary ───
    const wagesByWorker = {}
    ;(workers ?? []).forEach((w) => { wagesByWorker[w.id] = Number(w.daily_wage) || 0 })
    const MULT = { present: 1.0, half_day: 0.5, paid_leave: 1.0, absent: 0.0 }
    let attTotalPayDays = 0
    let attTotalPay = 0
    const attCounts = { present: 0, half_day: 0, paid_leave: 0, absent: 0 }
    ;(attendance ?? []).forEach((a) => {
      attCounts[a.status] = (attCounts[a.status] || 0) + 1
      const m = MULT[a.status] || 0
      attTotalPayDays += m
      attTotalPay += m * (wagesByWorker[a.worker_id] || 0)
    })

    // ── Material summaries ────
    const totalReceived  = (receipts ?? []).reduce((s, r) => s + Number(r.quantity), 0)
    const totalReceivedCost = (receipts ?? []).reduce((s, r) => s + Number(r.quantity) * Number(r.unit_cost || 0), 0)
    const totalTransferOut = (transfersOut ?? []).reduce((s, t) => s + Number(t.quantity), 0)
    const totalTransferIn  = (transfersIn  ?? []).reduce((s, t) => s + Number(t.quantity), 0)

    set({
      siteReportData: {
        startDate, endDate,
        site: site ?? null,
        logs:          logs ?? [],
        attendance: {
          counts: attCounts,
          totalPayDays: attTotalPayDays,
          totalPay: attTotalPay,
          activeWorkers: (workers ?? []).length,
        },
        materials: {
          receipts:      receipts ?? [],
          transfersOut:  transfersOut ?? [],
          transfersIn:   transfersIn ?? [],
          totalReceived,
          totalReceivedCost,
          totalTransferOut,
          totalTransferIn,
        },
      },
      siteReportLoading: false,
    })
  },
}))

export default useReportsStore
