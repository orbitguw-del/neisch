import { useEffect, useState, useMemo } from 'react'
import { Hammer, Download, CalendarDays } from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import useReportsStore from '@/stores/reportsStore'
import { WORK_TYPES, WORK_TYPE_COLORS } from '@/lib/materialPresets'
import { downloadWorkbook, fmtINR } from '@/lib/exportXLS'
import PrintButton from '@/components/print/PrintButton'
import PrintHeader from '@/components/print/PrintHeader'
import StatCard from '@/components/ui/StatCard'
import { cn } from '@/lib/utils'

const WORK_LABEL = Object.fromEntries(WORK_TYPES.map(({ value, label }) => [value, label]))

function todayISO() { return new Date().toISOString().slice(0, 10) }
function firstOfMonthISO() {
  const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10)
}
function shortDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

export default function ConsumptionReportTab({ sites }) {
  const profile  = useAuthStore((s) => s.profile)
  const tenantId = profile?.tenant_id
  const { consumptionData, consumptionLoading, fetchConsumptionReport } = useReportsStore()

  const [siteId,    setSiteId]    = useState('')
  const [startDate, setStartDate] = useState(firstOfMonthISO)
  const [endDate,   setEndDate]   = useState(todayISO)
  const [workType,  setWorkType]  = useState('')
  const [view,      setView]      = useState('summary') // 'summary' | 'detail'

  useEffect(() => {
    if (tenantId && startDate && endDate) {
      fetchConsumptionReport(tenantId, siteId || null, startDate, endDate)
    }
  }, [tenantId, siteId, startDate, endDate])

  const filteredRows = useMemo(() => {
    if (!consumptionData) return []
    return workType
      ? consumptionData.rows.filter((r) => r.materials?.work_type === workType)
      : consumptionData.rows
  }, [consumptionData, workType])

  const filteredSummary = useMemo(() => {
    if (!consumptionData) return []
    return workType
      ? consumptionData.summary.filter((s) => s.work_type === workType)
      : consumptionData.summary
  }, [consumptionData, workType])

  const siteName    = siteId ? (sites.find((s) => s.id === siteId)?.name ?? '—') : 'All sites'
  const periodLabel = `${shortDate(startDate)} – ${shortDate(endDate)}`

  function handleExport() {
    if (!consumptionData) return
    const sheets = [
      {
        name: 'Summary by material',
        rows: [
          ['Material', 'Brand', 'Work type', 'Unit', 'Total consumed', 'No. of entries'],
          ...filteredSummary.map((s) => [
            s.name, s.brand || 'Generic',
            WORK_LABEL[s.work_type] ?? s.work_type ?? '—',
            s.unit, s.total, s.entries,
          ]),
        ],
      },
      {
        name: 'Detail',
        rows: [
          ['Date', 'Material', 'Brand', 'Work description', 'Site', 'Qty consumed', 'Note'],
          ...filteredRows.map((r) => [
            r.allocated_date,
            r.materials?.name ?? '—',
            r.materials?.brand || 'Generic',
            r.work_description || '—',
            r.sites?.name ?? '—',
            Number(r.quantity_allocated),
            r.note || '',
          ]),
        ],
      },
    ]
    downloadWorkbook(sheets, `consumption-${startDate}-to-${endDate}`)
  }

  return (
    <div className="space-y-6">
      <PrintHeader
        title="Material Consumption"
        subtitle={`Site: ${siteName} · ${periodLabel}`}
      />

      {/* Filters */}
      <div className="no-print flex flex-wrap items-end gap-3">
        <div>
          <label className="label">From</label>
          <input type="date" className="input py-1.5 text-sm"
            value={startDate} max={endDate}
            onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="label">To</label>
          <input type="date" className="input py-1.5 text-sm"
            value={endDate} min={startDate} max={todayISO()}
            onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div>
          <label className="label">Site</label>
          <select className="input py-1.5 pr-8 text-sm" value={siteId} onChange={(e) => setSiteId(e.target.value)}>
            <option value="">All sites</option>
            {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Work type</label>
          <select className="input py-1.5 pr-8 text-sm" value={workType} onChange={(e) => setWorkType(e.target.value)}>
            <option value="">All types</option>
            {WORK_TYPES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <PrintButton label="Print" />
          <button
            onClick={handleExport}
            disabled={!filteredRows.length}
            className="btn-secondary flex items-center gap-1.5 text-sm"
          >
            <Download className="h-4 w-4" /> Export XLS
          </button>
        </div>
      </div>

      {/* Summary cards */}
      {consumptionData && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard label="Materials used"    value={filteredSummary.length}   icon={Hammer} color="brand" />
          <StatCard label="Allocation entries" value={filteredRows.length}      icon={Hammer} color="sage"  />
          <StatCard label="Period"             value={periodLabel}              icon={CalendarDays} color="brand" />
        </div>
      )}

      {/* View toggle */}
      <div className="no-print flex gap-1 border-b border-gray-200">
        {[{ id: 'summary', label: 'By material' }, { id: 'detail', label: 'All entries' }].map((t) => (
          <button
            key={t.id}
            onClick={() => setView(t.id)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              view === t.id ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-500 hover:text-gray-700',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {consumptionLoading ? (
        <p className="card px-5 py-8 text-sm text-gray-500">Loading…</p>
      ) : !filteredRows.length ? (
        <p className="card px-5 py-8 text-sm text-gray-500 text-center">
          No consumption recorded for this period.
        </p>
      ) : view === 'summary' ? (
        /* ── Summary: one row per material ─────────────────────────── */
        <div className="card overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Material', 'Brand', 'Work type', 'Unit', 'Total consumed', 'Entries'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredSummary.map((s, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-sm font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-500">{s.brand || <span className="text-gray-300">Generic</span>}</td>
                  <td className="px-4 py-2.5">
                    {s.work_type ? (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${WORK_TYPE_COLORS[s.work_type]}`}>
                        {WORK_LABEL[s.work_type] ?? s.work_type}
                      </span>
                    ) : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-gray-600">{s.unit}</td>
                  <td className="px-4 py-2.5 text-sm font-semibold text-gray-900">
                    {Number(s.total).toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-gray-500">{s.entries}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* ── Detail: every allocation entry ────────────────────────── */
        <div className="card overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Date', 'Material', 'Work description', 'Site', 'Qty'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredRows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-sm text-gray-600 whitespace-nowrap">
                    {new Date(r.allocated_date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </td>
                  <td className="px-4 py-2.5">
                    <p className="text-sm font-medium text-gray-900">{r.materials?.name ?? '—'}</p>
                    {r.materials?.brand && <p className="text-xs text-gray-400">{r.materials.brand}</p>}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-gray-700 max-w-xs">
                    {r.work_description || <span className="text-gray-300">—</span>}
                    {r.note && <p className="text-xs text-gray-400 mt-0.5">{r.note}</p>}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-gray-600">{r.sites?.name ?? '—'}</td>
                  <td className="px-4 py-2.5 text-sm font-semibold text-gray-900 whitespace-nowrap">
                    {Number(r.quantity_allocated).toLocaleString('en-IN')} {r.materials?.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
