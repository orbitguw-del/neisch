import { useEffect, useMemo, useState } from 'react'
import { Users, CalendarDays, IndianRupee, Building2 } from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import useSiteStore from '@/stores/siteStore'
import useReportsStore from '@/stores/reportsStore'
import StatCard from '@/components/ui/StatCard'
import PrintButton from '@/components/print/PrintButton'
import PrintHeader from '@/components/print/PrintHeader'
import { formatINR, cn } from '@/lib/utils'

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_CHAR = {
  present:    { ch: 'P',  cls: 'bg-green-500 text-white' },
  absent:     { ch: 'A',  cls: 'bg-red-400 text-white' },
  half_day:   { ch: '½',  cls: 'bg-amber-400 text-white' },
  paid_leave: { ch: 'PL', cls: 'bg-blue-400 text-white' },
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function firstOfMonthISO() {
  const d = new Date()
  d.setDate(1)
  return d.toISOString().slice(0, 10)
}

function shortDateLabel(iso) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

function dayOfMonth(iso) {
  return iso.slice(8, 10)
}

function isSunday(iso) {
  return new Date(iso + 'T00:00:00').getDay() === 0
}

// ── AttendanceReportTab ─────────────────────────────────────────────────────

export default function AttendanceReportTab({ sites }) {
  const profile = useAuthStore((s) => s.profile)
  const tenantId = profile?.tenant_id
  const { attendanceData, attendanceLoading, fetchAttendanceReport } = useReportsStore()

  const [startDate, setStartDate] = useState(firstOfMonthISO())
  const [endDate, setEndDate]     = useState(todayISO())
  const [siteId, setSiteId]       = useState('')

  useEffect(() => {
    if (tenantId && startDate && endDate) {
      fetchAttendanceReport(tenantId, siteId || null, startDate, endDate)
    }
  }, [tenantId, siteId, startDate, endDate])

  const siteName = useMemo(
    () => siteId ? (sites.find((s) => s.id === siteId)?.name ?? 'Unknown site') : 'All sites',
    [siteId, sites],
  )

  const periodLabel = `${shortDateLabel(startDate)} – ${shortDateLabel(endDate)}`

  // Group rows by site if no site filter (for site sub-totals on print)
  const groupedRows = useMemo(() => {
    if (!attendanceData) return []
    if (siteId) return [{ site_name: siteName, rows: attendanceData.rows }]
    const bySite = {}
    attendanceData.rows.forEach((r) => {
      if (!bySite[r.site_id]) bySite[r.site_id] = { site_name: r.site_name, rows: [] }
      bySite[r.site_id].rows.push(r)
    })
    return Object.values(bySite)
  }, [attendanceData, siteId, siteName])

  return (
    <div className="space-y-6">
      <PrintHeader
        title={`Attendance & Payroll — ${periodLabel}`}
        subtitle={`Site: ${siteName}`}
      />

      {/* Filters */}
      <div className="no-print flex flex-wrap items-end gap-3">
        <div>
          <label className="label">From</label>
          <input
            type="date"
            className="input py-1.5 text-sm"
            value={startDate}
            max={endDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="label">To</label>
          <input
            type="date"
            className="input py-1.5 text-sm"
            value={endDate}
            min={startDate}
            max={todayISO()}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Site</label>
          <select
            className="input py-1.5 pr-8 text-sm"
            value={siteId}
            onChange={(e) => setSiteId(e.target.value)}
          >
            <option value="">All sites</option>
            {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="ml-auto">
          <PrintButton label="Print attendance" />
        </div>
      </div>

      {/* Summary stat cards */}
      {attendanceData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Workers"        value={attendanceData.rows.length}              icon={Users}        color="brand" />
          <StatCard label="Pay days"       value={attendanceData.totals.payDays.toFixed(1)} icon={CalendarDays} color="sage" />
          <StatCard label="Days in period" value={attendanceData.dates.length}             icon={CalendarDays} color="brand" />
          <StatCard label="Total payroll"  value={formatINR(attendanceData.totals.totalPay)} icon={IndianRupee} color="red" />
        </div>
      )}

      {/* Grid — scrollable horizontally on screen, paged on print */}
      <div className="card overflow-hidden">
        <div className="border-b border-gray-200 px-5 py-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Daily attendance grid</h2>
          {attendanceData && (
            <span className="text-xs text-gray-500">
              Legend: <span className="font-semibold text-green-700">P</span> Present ·
              <span className="font-semibold text-red-600"> A</span> Absent ·
              <span className="font-semibold text-amber-700"> ½</span> Half day ·
              <span className="font-semibold text-blue-600"> PL</span> Paid leave
            </span>
          )}
        </div>

        {attendanceLoading ? (
          <p className="px-5 py-8 text-sm text-gray-500">Loading…</p>
        ) : !attendanceData || attendanceData.rows.length === 0 ? (
          <p className="px-5 py-8 text-sm text-gray-500">
            No active workers found for the selected scope.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="sticky left-0 z-10 bg-gray-50 px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wide">
                    Worker
                  </th>
                  <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Trade</th>
                  <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Vendor</th>
                  <th className="px-2 py-2 text-right font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Wage/day</th>
                  {attendanceData.dates.map((d) => (
                    <th key={d} className={cn(
                      'px-1 py-2 text-center font-medium text-gray-500 uppercase tracking-wide',
                      isSunday(d) && 'bg-amber-50',
                    )} title={d}>
                      {dayOfMonth(d)}
                    </th>
                  ))}
                  <th className="px-2 py-2 text-right font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Pay days</th>
                  <th className="px-2 py-2 text-right font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Total pay</th>
                </tr>
              </thead>
              <tbody>
                {groupedRows.map((group) => (
                  <SiteGroup
                    key={group.site_name}
                    siteName={group.site_name}
                    rows={group.rows}
                    dates={attendanceData.dates}
                    showSiteHeader={groupedRows.length > 1}
                    colCount={4 + attendanceData.dates.length + 2}
                  />
                ))}
                {/* Grand total */}
                <tr className="bg-gray-100 font-semibold">
                  <td colSpan={3 + attendanceData.dates.length + 1} className="px-3 py-2 text-right text-gray-900">Grand total</td>
                  <td className="px-2 py-2 text-right text-gray-900">{attendanceData.totals.payDays.toFixed(1)}</td>
                  <td className="px-2 py-2 text-right text-gray-900">{formatINR(attendanceData.totals.totalPay)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function SiteGroup({ siteName, rows, dates, showSiteHeader, colCount }) {
  const subTotals = rows.reduce(
    (a, r) => ({ payDays: a.payDays + r.payDays, totalPay: a.totalPay + r.totalPay }),
    { payDays: 0, totalPay: 0 },
  )
  return (
    <>
      {showSiteHeader && (
        <tr className="bg-brand-50">
          <td colSpan={colCount} className="px-3 py-1.5 text-xs font-semibold text-brand-800">
            <span className="inline-flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" />{siteName}</span>
          </td>
        </tr>
      )}
      {rows.map((r) => (
        <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
          <td className="sticky left-0 z-10 bg-white px-3 py-1.5 font-medium text-gray-900 whitespace-nowrap">
            {r.name}
          </td>
          <td className="px-2 py-1.5 text-gray-600 whitespace-nowrap">{r.trade || '—'}</td>
          <td className="px-2 py-1.5 text-gray-600 whitespace-nowrap">
            {r.employment_type === 'vendor' ? (r.vendor_name || 'Vendor') : 'Direct'}
          </td>
          <td className="px-2 py-1.5 text-right text-gray-900 whitespace-nowrap">{formatINR(r.wage)}</td>
          {dates.map((d) => {
            const st = r.days[d]
            const cfg = st ? STATUS_CHAR[st] : null
            return (
              <td key={d} className={cn('px-1 py-1.5 text-center', isSunday(d) && 'bg-amber-50')}>
                {cfg ? (
                  <span className={`inline-flex h-5 min-w-[1.5rem] items-center justify-center rounded text-[10px] font-semibold ${cfg.cls}`}>
                    {cfg.ch}
                  </span>
                ) : (
                  <span className="text-gray-300">·</span>
                )}
              </td>
            )
          })}
          <td className="px-2 py-1.5 text-right font-medium text-gray-900 whitespace-nowrap">{r.payDays.toFixed(1)}</td>
          <td className="px-2 py-1.5 text-right font-semibold text-gray-900 whitespace-nowrap">{formatINR(r.totalPay)}</td>
        </tr>
      ))}
      {showSiteHeader && (
        <tr className="bg-brand-50/40">
          <td colSpan={3 + dates.length + 1} className="px-3 py-1.5 text-right text-xs font-semibold text-brand-800">
            {siteName} subtotal
          </td>
          <td className="px-2 py-1.5 text-right text-xs font-semibold text-brand-800">{subTotals.payDays.toFixed(1)}</td>
          <td className="px-2 py-1.5 text-right text-xs font-semibold text-brand-800">{formatINR(subTotals.totalPay)}</td>
        </tr>
      )}
    </>
  )
}
