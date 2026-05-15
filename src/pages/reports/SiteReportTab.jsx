import { useEffect, useState, useMemo } from 'react'
import {
  Building2, CalendarDays, Users, Package, ArrowDown, ArrowUp,
  IndianRupee, FileText, AlertCircle, Cloud,
} from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import useReportsStore from '@/stores/reportsStore'
import StatCard from '@/components/ui/StatCard'
import PrintButton from '@/components/print/PrintButton'
import PrintHeader from '@/components/print/PrintHeader'
import { formatINR, formatDate, cn } from '@/lib/utils'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function daysAgoISO(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

function shortDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

export default function SiteReportTab({ sites }) {
  const profile = useAuthStore((s) => s.profile)
  const tenantId = profile?.tenant_id
  const { siteReportData, siteReportLoading, fetchSiteReport } = useReportsStore()

  const [siteId, setSiteId] = useState(sites[0]?.id ?? '')
  const [startDate, setStartDate] = useState(daysAgoISO(7))
  const [endDate, setEndDate]     = useState(todayISO())

  useEffect(() => {
    if (sites.length > 0 && !siteId) setSiteId(sites[0].id)
  }, [sites])

  useEffect(() => {
    if (tenantId && siteId && startDate && endDate) {
      fetchSiteReport(tenantId, siteId, startDate, endDate)
    }
  }, [tenantId, siteId, startDate, endDate])

  const periodLabel = `${shortDate(startDate)} – ${shortDate(endDate)}`
  const d = siteReportData

  return (
    <div className="space-y-6">
      <PrintHeader
        title={`Site Report — ${d?.site?.name ?? '—'}`}
        subtitle={`Period: ${periodLabel}${d?.site?.location ? ` · Location: ${d.site.location}` : ''}`}
      />

      {/* Filters */}
      <div className="no-print flex flex-wrap items-end gap-3">
        <div>
          <label className="label">Site</label>
          <select
            className="input py-1.5 pr-8 text-sm"
            value={siteId}
            onChange={(e) => setSiteId(e.target.value)}
          >
            <option value="">Select site</option>
            {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">From</label>
          <input
            type="date" className="input py-1.5 text-sm"
            value={startDate} max={endDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="label">To</label>
          <input
            type="date" className="input py-1.5 text-sm"
            value={endDate} min={startDate} max={todayISO()}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="ml-auto">
          <PrintButton label="Print site report" />
        </div>
      </div>

      {siteReportLoading && (
        <p className="card px-5 py-8 text-sm text-gray-500">Loading…</p>
      )}

      {!siteReportLoading && d && (
        <>
          {/* Top summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Daily logs" value={d.logs.length} icon={FileText} color="brand" />
            <StatCard label="Pay days"   value={d.attendance.totalPayDays.toFixed(1)} icon={Users} color="sage" />
            <StatCard label="Payroll"    value={formatINR(d.attendance.totalPay)} icon={IndianRupee} color="red" />
            <StatCard label="Material in" value={formatINR(d.materials.totalReceivedCost)} icon={Package} color="brand" />
          </div>

          {/* ── Attendance summary ───────────────────────────────────────── */}
          <Section title="Attendance summary" icon={Users}>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 px-5 py-4 border-b border-gray-100">
              <Cell label="Active workers" value={d.attendance.activeWorkers} />
              <Cell label="Present marks"  value={d.attendance.counts.present || 0} />
              <Cell label="Half-day marks" value={d.attendance.counts.half_day || 0} />
              <Cell label="Paid leave"     value={d.attendance.counts.paid_leave || 0} />
              <Cell label="Absent"         value={d.attendance.counts.absent || 0} />
            </div>
            <div className="px-5 py-3 text-sm text-gray-700 flex flex-wrap items-center gap-4">
              <span>Pay days total: <strong>{d.attendance.totalPayDays.toFixed(1)}</strong></span>
              <span>·</span>
              <span>Payroll total: <strong>{formatINR(d.attendance.totalPay)}</strong></span>
            </div>
          </Section>

          {/* ── Daily logs timeline ──────────────────────────────────────── */}
          <Section title="Daily logs" icon={FileText} count={d.logs.length}>
            {d.logs.length === 0 ? (
              <p className="px-5 py-6 text-sm text-gray-500">No logs in this period.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {d.logs.map((log) => (
                  <li key={log.id} className="px-5 py-3 print:break-inside-avoid">
                    <div className="flex items-baseline gap-3 flex-wrap mb-1">
                      <span className="text-sm font-semibold text-gray-900">{formatDate(log.log_date)}</span>
                      {log.workers_present > 0 && (
                        <span className="text-xs text-gray-500">{log.workers_present} workers</span>
                      )}
                      {log.weather && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <Cloud className="h-3 w-3" />{log.weather}
                        </span>
                      )}
                    </div>
                    {log.work_done && <p className="text-sm text-gray-700 whitespace-pre-wrap">{log.work_done}</p>}
                    {log.issues && (
                      <p className="mt-1 text-sm text-amber-700 flex items-start gap-1.5">
                        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>{log.issues}</span>
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {/* ── Materials in ─────────────────────────────────────────────── */}
          <Section title="Materials received" icon={ArrowDown} count={d.materials.receipts.length}>
            {d.materials.receipts.length === 0 ? (
              <p className="px-5 py-6 text-sm text-gray-500">No receipts in this period.</p>
            ) : (
              <MaterialTable
                rows={d.materials.receipts}
                showCost
                totalLabel="Total received"
                totalQty={d.materials.totalReceived}
                totalCost={d.materials.totalReceivedCost}
              />
            )}
          </Section>

          {/* ── Materials transferred ───────────────────────────────────── */}
          <Section title="Materials transferred out" icon={ArrowUp} count={d.materials.transfersOut.length}>
            {d.materials.transfersOut.length === 0 ? (
              <p className="px-5 py-6 text-sm text-gray-500">No transfers out in this period.</p>
            ) : (
              <MaterialTable
                rows={d.materials.transfersOut}
                showDestination
                totalLabel="Total out"
                totalQty={d.materials.totalTransferOut}
              />
            )}
          </Section>

          {d.materials.transfersIn.length > 0 && (
            <Section title="Materials transferred in" icon={ArrowDown} count={d.materials.transfersIn.length}>
              <MaterialTable
                rows={d.materials.transfersIn}
                showSource
                totalLabel="Total in"
                totalQty={d.materials.totalTransferIn}
              />
            </Section>
          )}

          {/* Print-only signature block */}
          <div className="print-only mt-8 pt-6 border-t border-gray-300">
            <div className="grid grid-cols-2 gap-12">
              <div>
                <div className="border-t border-gray-700 mt-12 pt-2 text-xs text-gray-700">Prepared by</div>
              </div>
              <div>
                <div className="border-t border-gray-700 mt-12 pt-2 text-xs text-gray-700">Approved by</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function Section({ title, icon: Icon, count, children }) {
  return (
    <div className="card overflow-hidden print:break-inside-avoid-page">
      <div className="border-b border-gray-200 px-5 py-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-900 flex-1">{title}</h2>
        {typeof count === 'number' && (
          <span className="text-xs text-gray-500">{count} {count === 1 ? 'entry' : 'entries'}</span>
        )}
      </div>
      {children}
    </div>
  )
}

function Cell({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-lg font-bold text-gray-900">{value}</p>
    </div>
  )
}

function MaterialTable({ rows, showCost, showDestination, showSource, totalLabel, totalQty, totalCost }) {
  return (
    <table className="min-w-full text-sm">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
          {showCost && <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Cost</th>}
          {showDestination && <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">To site</th>}
          {showSource && <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">From site</th>}
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {rows.map((r, i) => (
          <tr key={i} className="hover:bg-gray-50">
            <td className="px-4 py-2 font-medium text-gray-900">{r.materials?.name ?? 'Unknown'}</td>
            <td className="px-4 py-2 text-gray-600">{r.materials?.unit ?? '—'}</td>
            <td className="px-4 py-2 text-right text-gray-900">{Number(r.quantity).toFixed(2)}</td>
            {showCost && (
              <td className="px-4 py-2 text-right text-gray-900">
                {r.unit_cost ? formatINR(Number(r.quantity) * Number(r.unit_cost)) : '—'}
              </td>
            )}
            {showDestination && <td className="px-4 py-2 text-gray-600">{r.sites?.name ?? '—'}</td>}
            {showSource && <td className="px-4 py-2 text-gray-600">{r.sites?.name ?? '—'}</td>}
            <td className="px-4 py-2 text-gray-500">{r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN') : '—'}</td>
          </tr>
        ))}
        <tr className="bg-gray-50 font-semibold">
          <td colSpan={2} className="px-4 py-2 text-right text-gray-700">{totalLabel}</td>
          <td className="px-4 py-2 text-right text-gray-900">{Number(totalQty).toFixed(2)}</td>
          {showCost && <td className="px-4 py-2 text-right text-gray-900">{formatINR(totalCost)}</td>}
          {showDestination && <td />}
          {showSource && <td />}
          <td />
        </tr>
      </tbody>
    </table>
  )
}
