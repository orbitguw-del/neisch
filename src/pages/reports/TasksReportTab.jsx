import { useEffect, useState, useMemo } from 'react'
import { CheckSquare, Clock, AlertTriangle, Download, XCircle } from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import useReportsStore from '@/stores/reportsStore'
import { downloadSheet } from '@/lib/exportXLS'
import { shareOnWhatsApp } from '@/lib/whatsapp'
import PrintButton from '@/components/print/PrintButton'
import PrintHeader from '@/components/print/PrintHeader'
import StatCard from '@/components/ui/StatCard'
import { cn } from '@/lib/utils'

const STATUS_CFG = {
  pending:     { label: 'Pending',     cls: 'bg-gray-100 text-gray-600' },
  in_progress: { label: 'In Progress', cls: 'bg-amber-100 text-amber-700' },
  submitted:   { label: 'Submitted',   cls: 'bg-blue-100 text-blue-700' },
  done:        { label: 'Done',        cls: 'bg-green-100 text-green-700' },
  blocked:     { label: 'Blocked',     cls: 'bg-red-100 text-red-700' },
}

const PRIORITY_CFG = {
  low:    { label: 'Low',    cls: 'bg-gray-100 text-gray-500' },
  normal: { label: 'Normal', cls: 'bg-blue-50 text-blue-600' },
  high:   { label: 'High',   cls: 'bg-red-100 text-red-600' },
}

function daysLabel(dueDate, status, today) {
  if (!dueDate) return null
  if (status === 'done') return null
  const diff = Math.ceil((new Date(dueDate) - new Date(today)) / 86400000)
  if (diff < 0)  return { text: `${Math.abs(diff)}d overdue`, cls: 'text-red-600 font-semibold' }
  if (diff === 0) return { text: 'Due today', cls: 'text-amber-600 font-semibold' }
  if (diff <= 3)  return { text: `${diff}d left`, cls: 'text-amber-500' }
  return { text: `${diff}d left`, cls: 'text-gray-400' }
}

export default function TasksReportTab({ sites }) {
  const profile  = useAuthStore((s) => s.profile)
  const tenantId = profile?.tenant_id
  const { tasksData, tasksLoading, fetchTasksReport } = useReportsStore()

  const [siteId,   setSiteId]   = useState('')
  const [status,   setStatus]   = useState('')
  const [priority, setPriority] = useState('')
  const [showSubs, setShowSubs] = useState(false)

  useEffect(() => {
    if (tenantId) fetchTasksReport(tenantId, siteId || null, status || null)
  }, [tenantId, siteId, status])

  const filtered = useMemo(() => {
    if (!tasksData) return []
    return tasksData.rows.filter((t) => {
      if (!showSubs && t.parent_task_id) return false
      if (priority && t.priority !== priority) return false
      return true
    })
  }, [tasksData, priority, showSubs])

  const siteName = siteId ? (sites.find((s) => s.id === siteId)?.name ?? '—') : 'All sites'

  function handleExport() {
    if (!tasksData) return
    const today = tasksData.today
    const rows = [
      ['Site', 'Task', 'Assigned to', 'Assigned by', 'Priority', 'Status', 'Start date', 'Due date', 'Days', 'Sub-task?'],
      ...filtered.map((t) => {
        const assignee = t.assignee_profile?.full_name ?? t.assignee_worker?.name ?? '—'
        const days = t.due_date && t.status !== 'done'
          ? Math.ceil((new Date(t.due_date) - new Date(today)) / 86400000)
          : ''
        return [
          t.sites?.name ?? '—', t.title, assignee,
          t.assigner?.full_name ?? '—',
          PRIORITY_CFG[t.priority]?.label ?? t.priority,
          STATUS_CFG[t.status]?.label ?? t.status,
          t.start_date ?? '', t.due_date ?? '',
          days, t.parent_task_id ? 'Yes' : 'No',
        ]
      }),
    ]
    const d = new Date()
    downloadSheet(rows, 'Tasks', `tasks-report-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
  }

  const counts = tasksData?.counts ?? {}
  const overdue = tasksData?.overdue ?? 0

  return (
    <div className="space-y-6">
      <PrintHeader
        title="Tasks Report"
        subtitle={`Site: ${siteName}`}
      />

      {/* Filters */}
      <div className="no-print flex flex-wrap items-end gap-3">
        <div>
          <label className="label">Site</label>
          <select className="input py-1.5 pr-8 text-sm" value={siteId} onChange={(e) => setSiteId(e.target.value)}>
            <option value="">All sites</option>
            {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input py-1.5 pr-8 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {Object.entries(STATUS_CFG).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Priority</label>
          <select className="input py-1.5 pr-8 text-sm" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="">All priorities</option>
            {Object.entries(PRIORITY_CFG).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer pb-1">
            <input
              type="checkbox"
              checked={showSubs}
              onChange={(e) => setShowSubs(e.target.checked)}
              className="rounded"
            />
            Show sub-tasks
          </label>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => {
              if (!tasksData) return
              const c = tasksData.counts
              const lines = [
                `✅ Tasks Report — ${siteName}`,
                ``,
                `Done: ${c.done ?? 0} | In Progress: ${c.in_progress ?? 0}`,
                `Submitted: ${c.submitted ?? 0} | Pending: ${c.pending ?? 0}`,
                `🔴 Overdue: ${tasksData.overdue}`,
              ]
              shareOnWhatsApp(lines.join('\n'))
            }}
            disabled={!tasksData}
            className="btn-secondary flex items-center gap-1.5 text-sm"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp
          </button>
          <PrintButton label="Print" />
          <button
            onClick={handleExport}
            disabled={!filtered.length}
            className="btn-secondary flex items-center gap-1.5 text-sm"
          >
            <Download className="h-4 w-4" /> Export XLS
          </button>
        </div>
      </div>

      {/* Stat cards */}
      {tasksData && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <StatCard label="Pending"     value={counts.pending     ?? 0} icon={Clock}         color="brand" />
          <StatCard label="In progress" value={counts.in_progress ?? 0} icon={Clock}         color="sage"  />
          <StatCard label="Submitted"   value={counts.submitted   ?? 0} icon={CheckSquare}   color="brand" />
          <StatCard label="Done"        value={counts.done        ?? 0} icon={CheckSquare}   color="green" />
          <StatCard label="Overdue"     value={overdue}                  icon={AlertTriangle} color="red"   />
        </div>
      )}

      {/* Status mini-bar */}
      {tasksData && filtered.length > 0 && (() => {
        const total = Object.values(counts).reduce((a, b) => a + b, 0)
        if (!total) return null
        const pct = (v) => ((v / total) * 100).toFixed(1)
        return (
          <div className="card px-5 py-4 no-print">
            <p className="text-xs text-gray-500 mb-2">Overall progress ({total} tasks)</p>
            <div className="flex h-3 rounded-full overflow-hidden gap-px">
              {counts.done        > 0 && <div style={{ width: `${pct(counts.done)}%` }}        className="bg-green-500" title={`Done ${pct(counts.done)}%`} />}
              {counts.submitted   > 0 && <div style={{ width: `${pct(counts.submitted)}%` }}   className="bg-blue-400" title={`Submitted ${pct(counts.submitted)}%`} />}
              {counts.in_progress > 0 && <div style={{ width: `${pct(counts.in_progress)}%` }} className="bg-amber-400" title={`In progress ${pct(counts.in_progress)}%`} />}
              {counts.blocked     > 0 && <div style={{ width: `${pct(counts.blocked)}%` }}     className="bg-red-400" title={`Blocked ${pct(counts.blocked)}%`} />}
              {counts.pending     > 0 && <div style={{ width: `${pct(counts.pending)}%` }}     className="bg-gray-200" title={`Pending ${pct(counts.pending)}%`} />}
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              {[
                { label: 'Done',        color: 'bg-green-500', val: counts.done },
                { label: 'Submitted',   color: 'bg-blue-400',  val: counts.submitted },
                { label: 'In progress', color: 'bg-amber-400', val: counts.in_progress },
                { label: 'Blocked',     color: 'bg-red-400',   val: counts.blocked },
                { label: 'Pending',     color: 'bg-gray-300',  val: counts.pending },
              ].filter(x => x.val > 0).map(({ label, color, val }) => (
                <span key={label} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span className={`h-2.5 w-2.5 rounded-sm ${color}`} />
                  {label} ({val})
                </span>
              ))}
            </div>
          </div>
        )
      })()}

      {/* Table */}
      {tasksLoading ? (
        <p className="card px-5 py-8 text-sm text-gray-500">Loading…</p>
      ) : !filtered.length ? (
        <p className="card px-5 py-8 text-sm text-gray-500 text-center">No tasks found for the selected filters.</p>
      ) : (
        <div className="card overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Task', 'Site', 'Assigned to', 'Priority', 'Status', 'Due', 'Days'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filtered.map((t) => {
                const assignee  = t.assignee_profile?.full_name ?? t.assignee_worker?.name ?? '—'
                const dl        = daysLabel(t.due_date, t.status, tasksData.today)
                const isOverdue = dl?.cls?.includes('red')
                const statusCfg = STATUS_CFG[t.status] ?? { label: t.status, cls: 'bg-gray-100 text-gray-600' }
                const priCfg    = PRIORITY_CFG[t.priority] ?? { label: t.priority, cls: 'bg-gray-100 text-gray-500' }
                return (
                  <tr key={t.id} className={cn('hover:bg-gray-50', isOverdue && 'bg-red-50/30')}>
                    <td className="px-4 py-2.5 max-w-xs">
                      <p className={cn('text-sm font-medium text-gray-900', t.parent_task_id && 'pl-4 border-l-2 border-gray-200')}>
                        {t.title}
                      </p>
                      {t.description && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">{t.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 whitespace-nowrap">{t.sites?.name ?? '—'}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-700 whitespace-nowrap">{assignee}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priCfg.cls}`}>{priCfg.label}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusCfg.cls}`}>{statusCfg.label}</span>
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 whitespace-nowrap">
                      {t.due_date
                        ? new Date(t.due_date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-2.5 text-sm whitespace-nowrap">
                      {dl ? <span className={dl.cls}>{dl.text}</span> : <span className="text-gray-300">—</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
