import { useEffect, useState, useMemo } from 'react'
import {
  Building2, CalendarDays, Users, Package, ArrowDown, ArrowUp,
  IndianRupee, FileText, AlertCircle, Cloud, Wallet, Download, Hammer,
} from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import useReportsStore from '@/stores/reportsStore'
import StatCard from '@/components/ui/StatCard'
import PrintButton from '@/components/print/PrintButton'
import PrintHeader from '@/components/print/PrintHeader'
import PhotoThumb from '@/components/photo/PhotoThumb'
import { downloadWorkbook, fmtINR } from '@/lib/exportXLS'
import { shareOnWhatsApp } from '@/lib/whatsapp'
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
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => {
              if (!d) return
              const lines = [
                `📋 Site Report — ${d.site?.name ?? ''}`,
                `📅 ${startDate} to ${endDate}`,
                ``,
                `👷 Payroll: ${fmtINR(d.attendance.totalPay)} (${d.attendance.activeWorkers} workers)`,
                `📦 Materials in: ${fmtINR(d.materials.totalReceivedCost)}`,
                `🔨 Consumed: ${fmtINR(d.materials.allocations?.reduce((s,a)=>s+Number(a.quantity_allocated||0)*Number(a.materials?.unit_cost||0),0) ?? 0)}`,
                `💸 Expenses: ${fmtINR(d.expenses?.approved ?? 0)}`,
                ``,
                `📊 Total spend: ${fmtINR(d.totalSpend ?? 0)}`,
              ]
              shareOnWhatsApp(lines.join('\n'))
            }}
            disabled={!d}
            className="btn-secondary flex items-center gap-1.5 text-sm"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp
          </button>
          <PrintButton label="Print site report" />
          <button
            onClick={() => {
              if (!d) return
              const sheets = [
                {
                  name: 'Summary',
                  rows: [
                    ['Site report', d.site?.name ?? '—'],
                    ['Period', `${startDate} to ${endDate}`],
                    [],
                    ['Payroll', fmtINR(d.attendance.totalPay)],
                    ['Materials received', fmtINR(d.materials.totalReceivedCost)],
                    ['Expenses (approved)', fmtINR(d.expenses?.approved ?? 0)],
                    ['Total spend', fmtINR(d.totalSpend ?? 0)],
                  ],
                },
                {
                  name: 'Materials received',
                  rows: [
                    ['Material', 'Unit', 'Qty', 'Cost', 'Date'],
                    ...d.materials.receipts.map((r) => [
                      r.materials?.name ?? '—', r.materials?.unit ?? '—',
                      Number(r.quantity), r.unit_cost ? Number(r.quantity) * Number(r.unit_cost) : '',
                      r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN') : '—',
                    ]),
                    ['', '', Number(d.materials.totalReceived).toFixed(2), fmtINR(d.materials.totalReceivedCost), ''],
                  ],
                },
                {
                  name: 'Expenses',
                  rows: [
                    ['Date', 'Category', 'Paid by', 'Status', 'Amount'],
                    ...(d.expenses?.rows ?? []).map((e) => [
                      e.expense_date, e.category + (e.note ? ` — ${e.note}` : ''), e.paid_by || '—', e.status, Number(e.amount),
                    ]),
                    ['', '', '', 'Approved total', fmtINR(d.expenses?.approved ?? 0)],
                  ],
                },
                {
                  name: 'Consumption',
                  rows: [
                    ['Date', 'Material', 'Work description', 'Qty consumed', 'Unit'],
                    ...(d.materials.allocations ?? []).map((a) => [
                      a.allocated_date, a.materials?.name ?? '—', a.work_description || '—',
                      Number(a.quantity_allocated), a.materials?.unit ?? '',
                    ]),
                  ],
                },
                {
                  name: 'Daily logs',
                  rows: [
                    ['Date', 'Workers', 'Weather', 'Work done', 'Issues'],
                    ...d.logs.map((l) => [
                      l.log_date, l.workers_present ?? '', l.weather ?? '', l.work_done ?? '', l.issues ?? '',
                    ]),
                  ],
                },
              ]
              downloadWorkbook(sheets, `site-report-${d.site?.name ?? 'site'}-${startDate}-to-${endDate}`)
            }}
            disabled={!d}
            className="btn-secondary flex items-center gap-1.5 text-sm"
          >
            <Download className="h-4 w-4" /> Export XLS
          </button>
        </div>
      </div>

      {siteReportLoading && (
        <p className="card px-5 py-8 text-sm text-gray-500">Loading…</p>
      )}

      {!siteReportLoading && d && (
        <>
          {/* Top summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Payroll"      value={formatINR(d.attendance.totalPay)} icon={Users} color="sage" />
            <StatCard label="Material in"  value={formatINR(d.materials.totalReceivedCost)} icon={Package} color="brand" />
            <StatCard label="Expenses"     value={formatINR(d.expenses?.approved ?? 0)} icon={Wallet} color="brand" />
            <StatCard label="Total spend"  value={formatINR(d.totalSpend ?? 0)} icon={IndianRupee} color="red" />
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
                    {log.photo_path && (
                      <div className="mt-2">
                        <PhotoThumb path={log.photo_path} size={88} />
                      </div>
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

          {/* ── Materials consumed (allocations) ───────────────────────── */}
          <Section title="Materials consumed" icon={Hammer} count={d.materials.allocations.length}>
            {d.materials.allocations.length === 0 ? (
              <p className="px-5 py-6 text-sm text-gray-500">No material allocations in this period.</p>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Date', 'Material', 'Work description', 'Qty consumed', 'Value (₹)'].map((h) => (
                      <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {d.materials.allocations.map((a, i) => {
                    const val = Number(a.quantity_allocated) * Number(a.materials?.unit_cost ?? 0)
                    return (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-600 whitespace-nowrap">
                        {new Date(a.allocated_date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </td>
                      <td className="px-4 py-2 font-medium text-gray-900">{a.materials?.name ?? '—'}</td>
                      <td className="px-4 py-2 text-gray-700">{a.work_description || '—'}</td>
                      <td className="px-4 py-2 text-right font-semibold text-gray-900">
                        {Number(a.quantity_allocated).toLocaleString('en-IN')} {a.materials?.unit}
                      </td>
                      <td className="px-4 py-2 text-right text-gray-900">
                        {a.materials?.unit_cost > 0 ? formatINR(val) : <span className="text-gray-300">—</span>}
                      </td>
                    </tr>
                  )})}
                  <tr className="bg-gray-50 font-semibold">
                    <td colSpan={4} className="px-4 py-2 text-right text-gray-700">Total consumed</td>
                    <td className="px-4 py-2 text-right text-gray-900">
                      {Number(d.materials.totalConsumed).toLocaleString('en-IN')} units
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </Section>

          {/* ── Site expenses ────────────────────────────────────────────── */}
          <Section title="Site expenses" icon={Wallet} count={d.expenses?.rows.length ?? 0}>
            {(!d.expenses || d.expenses.rows.length === 0) ? (
              <p className="px-5 py-6 text-sm text-gray-500">No expenses recorded in this period.</p>
            ) : (
              <>
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Date', 'Category', 'Paid by', 'Status', 'Amount'].map((h) => (
                        <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {d.expenses.rows.map((e, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-600">{formatDate(e.expense_date)}</td>
                        <td className="px-4 py-2 text-gray-900">{e.category}{e.note ? ` — ${e.note}` : ''}</td>
                        <td className="px-4 py-2 text-gray-600">{e.paid_by || '—'}</td>
                        <td className="px-4 py-2">
                          <span className={
                            e.status === 'approved' ? 'badge-green'
                            : e.status === 'rejected' ? 'badge-red' : 'badge-yellow'
                          }>{e.status}</span>
                        </td>
                        <td className="px-4 py-2 text-right font-medium text-gray-900">{formatINR(e.amount)}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-semibold">
                      <td colSpan={4} className="px-4 py-2 text-right text-gray-700">Approved total</td>
                      <td className="px-4 py-2 text-right text-gray-900">{formatINR(d.expenses.approved)}</td>
                    </tr>
                  </tbody>
                </table>
                {d.expenses.pending > 0 && (
                  <p className="px-5 py-2 text-xs text-amber-700">
                    {formatINR(d.expenses.pending)} pending approval — not counted in total spend.
                  </p>
                )}
              </>
            )}
          </Section>

          {/* ── Total site spend ─────────────────────────────────────────── */}
          <div className="card p-5 print-avoid-break">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Total site spend (this period)</p>
            <p className="text-2xl font-bold text-gray-900">{formatINR(d.totalSpend ?? 0)}</p>
            <p className="mt-1 text-xs text-gray-500">
              Payroll {formatINR(d.attendance.totalPay)} + Materials {formatINR(d.materials.totalReceivedCost)} + Expenses {formatINR(d.expenses?.approved ?? 0)}
            </p>
          </div>

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
      <div className="overflow-x-auto">
        {children}
      </div>
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
