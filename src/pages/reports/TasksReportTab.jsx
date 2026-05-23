import { useEffect, useState, useMemo } from 'react'
import { CheckSquare, Clock, AlertTriangle, Download, XCircle } from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import useReportsStore from '@/stores/reportsStore'
import { downloadSheet } from '@/lib/exportXLS'
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
    downloadSheet(rows, 'Tasks', `tasks-report-${new Date().toISOString().slice(0, 10)}`)
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
