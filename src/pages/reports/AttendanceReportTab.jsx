import { useEffect, useMemo, useState } from 'react'
import { Users, CalendarDays, IndianRupee, Building2, Download } from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import useSiteStore from '@/stores/siteStore'
import useReportsStore from '@/stores/reportsStore'
import StatCard from '@/components/ui/StatCard'
import PrintButton from '@/components/print/PrintButton'
import PrintHeader from '@/components/print/PrintHeader'
import { downloadSheet, fmtINR } from '@/lib/exportXLS'
import { shareOnWhatsApp } from '@/lib/whatsapp'
import { formatINR, formatINRCompact, cn } from '@/lib/utils'

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_CHAR = {
  present:    { ch: 'P',  cls: 'bg-green-500 text-white' },
  absent:     { ch: 'A',  cls: 'bg-red-400 text-white' },
  half_day:   { ch: '½',  cls: 'bg-amber-400 text-white' },
  paid_leave: { ch: 'PL', cls: 'bg-blue-400 text-white' },
}

function toLocalISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function todayISO() {
  return toLocalISO(new Date())
}

function firstOfMonthISO() {
  const d = new Date()
  d.setDate(1)
  return toLocalISO(d)
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
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => {
              if (!attendanceData) return
              const lines = [
                `👷 Attendance & Payroll`,
                `📅 ${startDate} to ${endDate}`,
                `Site: ${siteName}`,
                ``,
                `Workers: ${attendanceData.rows.length}`,
                `Pay days: ${attendanceData.totals.payDays.toFixed(1)}`,
                `💰 Total payroll: ${fmtINR(attendanceData.totals.totalPay)}`,
              ]
              shareOnWhatsApp(lines.join('\n'))
            }}
            disabled={!attendanceData}
            className="btn-secondary flex items-center gap-1.5 text-sm"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp
          </button>
          <PrintButton label="Print attendance" />
          <button
            onClick={() => {
              if (!attendanceData) return
              const header = ['Worker', 'Trade', 'Vendor', 'Wage/day', ...attendanceData.dates, 'Pay days', 'Total pay']
              const dataRows = attendanceData.rows.map((r) => [
                r.name, r.trade || '', r.employment_type === 'vendor' ? (r.vendor_name || 'Vendor') : 'Direct',
                r.wage,
                ...attendanceData.dates.map((d) => r.days[d] || ''),
                r.payDays.toFixed(1), fmtINR(r.totalPay),
              ])
              dataRows.push(['', '', '', '', ...attendanceData.dates.map(() => ''), attendanceData.totals.payDays.toFixed(1), fmtINR(attendanceData.totals.totalPay)])
              downloadSheet([header, ...dataRows], 'Attendance', `attendance-${startDate}-to-${endDate}`)
            }}
            disabled={!attendanceData}
            className="btn-secondary flex items-center gap-1.5 text-sm"
          >
            <Download className="h-4 w-4" /> Export XLS
          </button>
        </div>
      </div>

      {/* Summary stat cards */}
      {attendanceData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Workers"        value={attendanceData.rows.length}              icon={Users}        color="brand" />
          <StatCard label="Pay days"       value={attendanceData.totals.payDays.toFixed(1)} icon={CalendarDays} color="sage" />
          <StatCard label="Days in period" value={attendanceData.dates.length}             icon={CalendarDays} color="brand" />
          <StatCard label="Total payroll"  value={formatINRCompact(attendanceData.totals.totalPay)} icon={IndianRupee} color="red" />
        </div>
      )}

      {/* Pending-confirmation flag */}
      {attendanceData && attendanceData.pendingConfirmation > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
          ⚠ {attendanceData.pendingConfirmation} attendance entr{attendanceData.pendingConfirmation === 1 ? 'y is' : 'ies are'} still
          awaiting Site Manager confirmation — included in payroll above, but not yet signed off.
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
