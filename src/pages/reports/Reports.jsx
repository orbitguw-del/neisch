import { useEffect, useState } from 'react'
import {
  BarChart3, HardHat, Package, TrendingUp, TrendingDown,
  CalendarDays, Plus, Trash2, ChevronDown,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import useAuthStore from '@/stores/authStore'
import useSiteStore from '@/stores/siteStore'
import useMaterialStore from '@/stores/materialStore'
import useReportsStore from '@/stores/reportsStore'
import PageHeader from '@/components/ui/PageHeader'
import StatCard from '@/components/ui/StatCard'
import Modal from '@/components/ui/Modal'
import PrintButton from '@/components/print/PrintButton'
import PrintHeader from '@/components/print/PrintHeader'
import { formatINR, formatDate, cn } from '@/lib/utils'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

function monthLabel(m) {
  const [yr, mo] = m.split('-')
  return new Date(Number(yr), Number(mo) - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' })
}

function monthOptions() {
  const opts = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    opts.push({ value: val, label: monthLabel(val) })
  }
  return opts
}

// ─── Tab: Overview ────────────────────────────────────────────────────────────

function OverviewTab({ sites }) {
  const totalBudget = sites.reduce((s, x) => s + (Number(x.budget) || 0), 0)
  const byStatus = sites.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <PrintHeader title="Site Overview" subtitle={`${sites.length} sites · Total budget: ${formatINR(totalBudget)}`} />

      <div className="no-print flex justify-end">
        <PrintButton label="Print overview" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Sites"  value={sites.length}             icon={HardHat}  color="brand" />
        <StatCard label="Active"       value={byStatus.active ?? 0}    icon={BarChart3} color="green" />
        <StatCard label="Completed"    value={byStatus.completed ?? 0} icon={BarChart3} color="sage"  />
        <StatCard label="Total Budget" value={formatINR(totalBudget)}  icon={Package}  color="red"   />
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">Site Budget Breakdown</h2>
        </div>
        {sites.length === 0 ? (
          <p className="px-5 py-8 text-sm text-gray-500">No sites to report on yet.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Site', 'Location', 'Status', 'Start date', 'Budget'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {sites.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{s.location || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={
                      s.status === 'active'    ? 'badge-green'  :
                      s.status === 'completed' ? 'badge-blue'   :
                      s.status === 'planning'  ? 'badge-yellow' : 'badge-gray'
                    }>{s.status?.replace('_', ' ')}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(s.start_date)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {s.budget ? formatINR(s.budget) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ─── Tab: Monthly Report ──────────────────────────────────────────────────────

function MonthlyTab({ tenantId, sites }) {
  const { monthlyData, monthlyLoading, fetchMonthlyReport } = useReportsStore()
  const [month, setMonth]   = useState(currentMonth)
  const [siteId, setSiteId] = useState('')
  const months = monthOptions()

  useEffect(() => {
    if (tenantId) fetchMonthlyReport(tenantId, month, siteId || null)
  }, [tenantId, month, siteId])

  const siteName = siteId ? sites.find((s) => s.id === siteId)?.name : 'All sites'

  return (
    <div className="space-y-6">
      <PrintHeader
        title={`Monthly Materials Report — ${monthLabel(month)}`}
        subtitle={`Site: ${siteName}`}
      />

      {/* Filters */}
      <div className="no-print flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-gray-400" />
          <select
            className="input py-1.5 pr-8 text-sm"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <select
          className="input py-1.5 pr-8 text-sm"
          value={siteId}
          onChange={(e) => setSiteId(e.target.value)}
        >
          <option value="">All Sites</option>
          {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <PrintButton label="Print monthly report" className="ml-auto" />
      </div>

      {/* Summary cards */}
      {monthlyData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Materials received"
            value={monthlyData.rows.length}
            icon={Package}
            color="brand"
          />
          <StatCard
            label="Total spend"
            value={formatINR(monthlyData.totalCost)}
            icon={TrendingUp}
            color="red"
          />
          <StatCard
            label="Period"
            value={monthLabel(month)}
            icon={CalendarDays}
            color="sage"
          />
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="border-b border-gray-200 px-5 py-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">
            Materials — {monthLabel(month)}
          </h2>
          {monthlyData && (
            <span className="text-sm text-gray-500">
              Total: <span className="font-semibold text-gray-900">{formatINR(monthlyData.totalCost)}</span>
            </span>
          )}
        </div>

        {monthlyLoading ? (
          <p className="px-5 py-8 text-sm text-gray-500">Loading…</p>
        ) : !monthlyData || monthlyData.rows.length === 0 ? (
          <p className="px-5 py-8 text-sm text-gray-500">
            No confirmed receipts for {monthLabel(month)}.
          </p>
        ) : (
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Material', 'Unit', 'Qty received', 'Transferred out', 'Cost'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {monthlyData.rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{row.unit}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{row.received.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {row.transferred > 0 ? row.transferred.toFixed(2) : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {row.cost > 0 ? formatINR(row.cost) : '—'}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-semibold">
                <td colSpan={4} className="px-4 py-3 text-sm text-gray-900 text-right">Total</td>
                <td className="px-4 py-3 text-sm text-gray-900">{formatINR(monthlyData.totalCost)}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ─── Budget Line Form (modal) ─────────────────────────────────────────────────

function BudgetLineForm({ siteId, tenantId, month, onSuccess, onClose }) {
  const { createBudgetLine } = useReportsStore()
  const { materials, fetchMaterials } = useMaterialStore()
  const profile = useAuthStore((s) => s.profile)
  const [form, setForm] = useState({ material_id: '', budgeted_quantity: '', budgeted_cost: '', note: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState(null)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  useEffect(() => { fetchMaterials(siteId) }, [siteId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await createBudgetLine({
        tenant_id:          tenantId,
        site_id:            siteId,
        material_id:        form.material_id,
        budgeted_quantity:  Number(form.budgeted_quantity),
        budgeted_cost:      Number(form.budgeted_cost),
        period_month:       month,
        note:               form.note || null,
        created_by:         profile?.id,
      })
      onSuccess()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Material *</label>
        <select className="input" required value={form.material_id} onChange={set('material_id')}>
          <option value="">Select material</option>
          {materials.map((m) => (
            <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Budgeted Qty *</label>
          <input
            className="input" type="number" min="0" step="0.01" required
            value={form.budgeted_quantity} onChange={set('budgeted_quantity')}
            placeholder="500"
          />
        </div>
        <div>
          <label className="label">Budgeted Cost (₹) *</label>
          <input
            className="input" type="number" min="0" step="0.01" required
            value={form.budgeted_cost} onChange={set('budgeted_cost')}
            placeholder="50000"
          />
        </div>
      </div>
      <div>
        <label className="label">Note</label>
        <input className="input" value={form.note} onChange={set('note')} placeholder="Optional note" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save budget line'}
        </button>
      </div>
    </form>
  )
}

// ─── Tab: Budget vs Actual ────────────────────────────────────────────────────

function BudgetTab({ tenantId, sites }) {
  const {
    budgetData, budgetLoading, fetchBudgetReport,
    budgetLines, budgetLinesLoading, fetchBudgetLines, deleteBudgetLine,
  } = useReportsStore()
  const [month,  setMonth]  = useState(currentMonth)
  const [siteId, setSiteId] = useState(sites[0]?.id ?? '')
  const [modalOpen, setModalOpen] = useState(false)
  const months = monthOptions()

  useEffect(() => {
    if (sites.length > 0 && !siteId) setSiteId(sites[0].id)
  }, [sites])

  useEffect(() => {
    if (!tenantId || !siteId) return
    fetchBudgetReport(tenantId, siteId, month)
    fetchBudgetLines(tenantId, siteId, month)
  }, [tenantId, siteId, month])

  const handleDelete = async (id) => {
    await deleteBudgetLine(id)
    fetchBudgetReport(tenantId, siteId, month)
  }

  const varClass = (v) => v >= 0 ? 'text-green-600' : 'text-red-600'
  const varIcon  = (v) => v >= 0
    ? <TrendingDown className="h-3.5 w-3.5 inline mr-0.5" />
    : <TrendingUp   className="h-3.5 w-3.5 inline mr-0.5" />

  const siteName = sites.find((s) => s.id === siteId)?.name ?? 'Unknown site'

  return (
    <div className="space-y-6">
      <PrintHeader
        title={`Budget vs Actual — ${monthLabel(month)}`}
        subtitle={`Site: ${siteName}`}
      />

      {/* Filters */}
      <div className="no-print flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-gray-400" />
          <select className="input py-1.5 pr-8 text-sm" value={month} onChange={(e) => setMonth(e.target.value)}>
            {months.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <select className="input py-1.5 pr-8 text-sm" value={siteId} onChange={(e) => setSiteId(e.target.value)}>
          <option value="">Select site</option>
          {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <div className="ml-auto flex items-center gap-2">
          <PrintButton label="Print" />
          <button
            onClick={() => setModalOpen(true)}
            disabled={!siteId}
            className="btn-primary"
          >
            <Plus className="h-4 w-4" /> Add budget line
          </button>
        </div>
      </div>

      {/* Summary cards */}
      {budgetData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Budgeted"  value={formatINR(budgetData.totalBudgeted)} icon={BarChart3}    color="brand" />
          <StatCard label="Actual"    value={formatINR(budgetData.totalActual)}   icon={TrendingUp}   color="red"   />
          <div className={cn(
            'card px-5 py-4',
            budgetData.totalVariance >= 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50',
          )}>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Variance</p>
            <p className={cn('text-2xl font-bold', varClass(budgetData.totalVariance))}>
              {formatINR(Math.abs(budgetData.totalVariance))}
            </p>
            <p className={cn('text-xs mt-0.5', varClass(budgetData.totalVariance))}>
              {budgetData.totalVariance >= 0 ? 'Under budget' : 'Over budget'}
            </p>
          </div>
        </div>
      )}

      {/* Comparison table */}
      <div className="card overflow-hidden">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">
            Budget vs Actual — {monthLabel(month)}
          </h2>
        </div>

        {budgetLoading ? (
          <p className="px-5 py-8 text-sm text-gray-500">Loading…</p>
        ) : !budgetData || budgetData.items.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-gray-500 mb-2">No budget lines for {monthLabel(month)}.</p>
            <p className="text-xs text-gray-400">Click "Add budget line" to set targets for this site & month.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Material', 'Budgeted qty', 'Budgeted cost', 'Actual cost', 'Variance', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {budgetData.items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.material}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {item.budgeted_qty.toFixed(2)} {item.unit}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatINR(item.budgeted_cost)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatINR(item.actual)}</td>
                  <td className={cn('px-4 py-3 text-sm font-medium', varClass(item.variance))}>
                    {varIcon(item.variance)}
                    {formatINR(Math.abs(item.variance))}
                    <span className="ml-1 text-xs opacity-70">({item.variance_pct}%)</span>
                  </td>
                  <td className="px-4 py-3 no-print">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                      title="Delete budget line"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-semibold">
                <td colSpan={2} className="px-4 py-3 text-sm text-gray-700">Total</td>
                <td className="px-4 py-3 text-sm text-gray-900">{formatINR(budgetData.totalBudgeted)}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{formatINR(budgetData.totalActual)}</td>
                <td className={cn('px-4 py-3 text-sm font-semibold', varClass(budgetData.totalVariance))}>
                  {varIcon(budgetData.totalVariance)}
                  {formatINR(Math.abs(budgetData.totalVariance))}
                </td>
                <td className="no-print" />
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {/* Budget lines list (for management) — manage UI, not part of printed report */}
      {budgetLines.length > 0 && (
        <div className="card overflow-hidden no-print">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">Budget Lines (manage)</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {budgetLines.map((bl) => (
              <div key={bl.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{bl.materials?.name}</p>
                  <p className="text-xs text-gray-500">
                    {bl.budgeted_quantity} {bl.materials?.unit} · {formatINR(bl.budgeted_cost)}
                    {bl.note ? ` · ${bl.note}` : ''}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(bl.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Add Budget Line — ${monthLabel(month)}`}>
        <BudgetLineForm
          siteId={siteId}
          tenantId={tenantId}
          month={month}
          onSuccess={() => {
            fetchBudgetReport(tenantId, siteId, month)
            fetchBudgetLines(tenantId, siteId, month)
          }}
          onClose={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'monthly',  label: 'Monthly Report' },
  { id: 'budget',   label: 'Budget vs Actual' },
]

export default function Reports() {
  const profile   = useAuthStore((s) => s.profile)
  const { sites, fetchSites } = useSiteStore()
  const tenantId  = profile?.tenant_id
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    if (tenantId) fetchSites(tenantId)
  }, [tenantId, fetchSites])

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Cost tracking, budget analysis, and site summaries."
      />

      {/* Tabs */}
      <div className="no-print flex gap-1 border-b border-gray-200 mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t.id
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-gray-500 hover:text-gray-700',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab sites={sites} />}
      {tab === 'monthly'  && <MonthlyTab  tenantId={tenantId} sites={sites} />}
      {tab === 'budget'   && <BudgetTab   tenantId={tenantId} sites={sites} />}
    </div>
  )
}
