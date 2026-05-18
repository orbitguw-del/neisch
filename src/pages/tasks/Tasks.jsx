import { useEffect, useMemo, useState } from 'react'
import {
  ListTodo, Plus, ChevronRight, Clock, AlertTriangle, CheckCircle2,
  CircleDot, Ban, CornerDownRight, CalendarDays, Camera,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import useAuthStore from '@/stores/authStore'
import useSiteStore from '@/stores/siteStore'
import useWorkerStore from '@/stores/workerStore'
import useTaskStore, { isOverdue, daysLate } from '@/stores/taskStore'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import PhotoCapture from '@/components/photo/PhotoCapture'
import PhotoThumb from '@/components/photo/PhotoThumb'
import { uploadPhoto } from '@/lib/photos'
import { formatDate, cn } from '@/lib/utils'

// Which role each role assigns work to.
const ASSIGNS_TO = {
  contractor:   'site_manager',
  site_manager: 'supervisor',
  supervisor:   'worker',
}
const ROLE_LABEL = { site_manager: 'Site Manager', supervisor: 'Supervisor', worker: 'Worker' }

const STATUS = {
  pending:     { label: 'Pending',     cls: 'bg-gray-100 text-gray-600 border-gray-200',   icon: CircleDot },
  in_progress: { label: 'In progress', cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  submitted:   { label: 'Submitted',   cls: 'bg-blue-50 text-blue-700 border-blue-200',    icon: CornerDownRight },
  done:        { label: 'Done',        cls: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle2 },
  blocked:     { label: 'Blocked',     cls: 'bg-red-50 text-red-700 border-red-200',       icon: Ban },
}
const PRIORITY = {
  low:    'text-gray-400',
  normal: 'text-gray-500',
  high:   'text-red-600 font-semibold',
}

function StatusBadge({ status }) {
  const s = STATUS[status] ?? STATUS.pending
  const Icon = s.icon
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium', s.cls)}>
      <Icon className="h-3 w-3" /> {s.label}
    </span>
  )
}

function assigneeName(task) {
  return task.assignee_profile?.full_name || task.assignee_worker?.name || 'Unassigned'
}

// ── Create task / sub-task form ────────────────────────────────────────────────
function TaskForm({ sites, role, tenantId, parentTask, onSubmit, onCancel, loading }) {
  const assignRole = ASSIGNS_TO[role]
  const [form, setForm] = useState({
    site_id:   parentTask?.site_id ?? (sites[0]?.id ?? ''),
    title:     '',
    description: '',
    assignee:  '',
    priority:  'normal',
    start_date: '',
    due_date:  '',
  })
  const [people, setPeople] = useState([])
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  // Load the people this role can assign to, for the chosen site.
  useEffect(() => {
    if (!form.site_id || !assignRole) return
    let cancelled = false
    ;(async () => {
      if (assignRole === 'worker') {
        const { data } = await supabase
          .from('workers').select('id, name, trade').eq('site_id', form.site_id)
          .eq('status', 'active').order('name')
        if (!cancelled) setPeople((data ?? []).map((w) => ({ id: w.id, label: `${w.name} · ${w.trade ?? 'Worker'}`, kind: 'worker' })))
      } else {
        // profiles assigned to this site with the target role
        const { data: asg } = await supabase
          .from('site_assignments').select('profile_id, role').eq('site_id', form.site_id).eq('role', assignRole)
        const ids = (asg ?? []).map((a) => a.profile_id)
        if (!ids.length) { if (!cancelled) setPeople([]); return }
        const { data: profs } = await supabase
          .from('profiles').select('id, full_name').in('id', ids)
        if (!cancelled) setPeople((profs ?? []).map((p) => ({ id: p.id, label: p.full_name ?? 'Unnamed', kind: 'profile' })))
      }
    })()
    return () => { cancelled = true }
  }, [form.site_id, assignRole])

  const submit = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.assignee || !form.site_id) return
    const person = people.find((p) => p.id === form.assignee)
    onSubmit({
      tenant_id: tenantId,
      site_id:   form.site_id,
      parent_task_id: parentTask?.id ?? null,
      title:       form.title.trim(),
      description: form.description.trim() || null,
      assigned_to_profile: person?.kind === 'profile' ? person.id : null,
      assigned_to_worker:  person?.kind === 'worker'  ? person.id : null,
      priority:   form.priority,
      start_date: form.start_date || null,
      due_date:   form.due_date || null,
      status:     'pending',
    })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {!parentTask && (
        <div>
          <label className="label">Site *</label>
          <select className="input" required value={form.site_id} onChange={set('site_id')}>
            {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      )}
      <div>
        <label className="label">Task title *</label>
        <input className="input" required value={form.title} onChange={set('title')}
          placeholder="e.g. Complete 2nd-floor slab shuttering" />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea className="input resize-none" rows={2} value={form.description}
          onChange={set('description')} placeholder="Details, quantities, location…" />
      </div>
      <div>
        <label className="label">Assign to ({ROLE_LABEL[assignRole]}) *</label>
        <select className="input" required value={form.assignee} onChange={set('assignee')}>
          <option value="">Select {ROLE_LABEL[assignRole]?.toLowerCase()}…</option>
          {people.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        {people.length === 0 && (
          <p className="mt-1 text-xs text-amber-600">
            No {ROLE_LABEL[assignRole]?.toLowerCase()} on this site yet.
          </p>
        )}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="label">Priority</label>
          <select className="input" value={form.priority} onChange={set('priority')}>
            <option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option>
          </select>
        </div>
        <div>
          <label className="label">Start date</label>
          <input type="date" className="input" value={form.start_date} onChange={set('start_date')} />
        </div>
        <div>
          <label className="label">Due date</label>
          <input type="date" className="input" value={form.due_date} onChange={set('due_date')} />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving…' : parentTask ? 'Add sub-task' : 'Create task'}
        </button>
      </div>
    </form>
  )
}

// ── Daily update form ──────────────────────────────────────────────────────────
function UpdateForm({ onSubmit, loading }) {
  const [note, setNote]   = useState('')
  const [photo, setPhoto] = useState(null)
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (!note.trim() && !photo) return; onSubmit({ note: note.trim(), photo }) }}
      className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3"
    >
      <textarea className="input resize-none" rows={2} value={note} onChange={(e) => setNote(e.target.value)}
        placeholder="What was done today?" />
      <PhotoCapture value={photo} onChange={setPhoto} label="Today's photo" />
      <div className="flex justify-end">
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-1.5">
          <Camera className="h-4 w-4" /> {loading ? 'Saving…' : 'Log update'}
        </button>
      </div>
    </form>
  )
}

// ── Task detail modal ──────────────────────────────────────────────────────────
function TaskDetail({ task, allTasks, profile, sites, onOpenTask, onClose }) {
  const { updates, fetchUpdates, addUpdate, startTask, submitTask, blockTask,
          confirmTask, sendBack, createTask } = useTaskStore()
  const [busy, setBusy]       = useState(false)
  const [subOpen, setSubOpen] = useState(false)
  const taskUpdates = updates[task.id] ?? []
  const subtasks    = allTasks.filter((t) => t.parent_task_id === task.id)
  const subDone     = subtasks.filter((t) => t.status === 'done').length
  const canSub      = ASSIGNS_TO[profile?.role] && task.assigned_to_profile  // can't sub-divide a worker leaf

  useEffect(() => { fetchUpdates(task.id) }, [task.id, fetchUpdates])

  const act = async (fn) => { setBusy(true); try { await fn() } catch (e) { alert(e.message) } finally { setBusy(false) } }

  const handleUpdate = async ({ note, photo }) => {
    setBusy(true)
    try {
      let photo_path = null
      if (photo) photo_path = await uploadPhoto({ blob: photo, tenantId: task.tenant_id, siteId: task.site_id, entity: 'task' })
      await addUpdate({ task_id: task.id, tenant_id: task.tenant_id, site_id: task.site_id, note: note || null, photo_path, created_by: profile?.id })
    } catch (e) { alert(e.message) } finally { setBusy(false) }
  }

  const handleSub = async (payload) => {
    setBusy(true)
    try { await createTask({ ...payload, assigned_by: profile?.id }); setSubOpen(false) }
    catch (e) { alert(e.message) } finally { setBusy(false) }
  }

  const overdue = isOverdue(task)

  return (
    <Modal open onClose={onClose} title="Task">
      <div className="space-y-4">
        {/* header */}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={task.status} />
            {overdue && (
              <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                <AlertTriangle className="h-3 w-3" /> {daysLate(task)}d late
              </span>
            )}
            <span className={cn('text-xs', PRIORITY[task.priority])}>{task.priority} priority</span>
          </div>
          <h3 className="mt-2 text-lg font-bold text-gray-900">{task.title}</h3>
          {task.description && <p className="mt-0.5 text-sm text-gray-600 whitespace-pre-wrap">{task.description}</p>}
        </div>

        {/* meta */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-gray-400">Site:</span> {task.site?.name ?? '—'}</div>
          <div><span className="text-gray-400">Assigned to:</span> {assigneeName(task)}</div>
          <div><span className="text-gray-400">By:</span> {task.assigner?.full_name ?? '—'}</div>
          <div className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
            {task.due_date ? `Due ${formatDate(task.due_date)}` : 'No due date'}
          </div>
        </div>

        {/* status actions */}
        <div className="flex flex-wrap gap-2 border-y border-gray-100 py-3">
          {task.status === 'pending' &&
            <button onClick={() => act(() => startTask(task.id))} disabled={busy} className="btn-secondary text-sm">Start work</button>}
          {task.status === 'in_progress' && <>
            <button onClick={() => act(() => submitTask(task.id))} disabled={busy} className="btn-primary text-sm">Mark finished — submit</button>
            <button onClick={() => act(() => blockTask(task.id))} disabled={busy} className="btn-secondary text-sm">Block</button>
          </>}
          {task.status === 'blocked' &&
            <button onClick={() => act(() => startTask(task.id))} disabled={busy} className="btn-secondary text-sm">Resume</button>}
          {task.status === 'submitted' && <>
            <button onClick={() => act(() => confirmTask(task.id, profile?.id))} disabled={busy} className="btn-primary text-sm">Confirm — done</button>
            <button onClick={() => act(() => sendBack(task.id))} disabled={busy} className="btn-secondary text-sm">Send back</button>
          </>}
          {task.status === 'done' && <span className="text-sm text-green-700">✓ Confirmed{task.confirmed_at ? ` · ${formatDate(task.confirmed_at)}` : ''}</span>}
        </div>

        {/* sub-tasks */}
        {(subtasks.length > 0 || canSub) && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700">
                Sub-tasks {subtasks.length > 0 && <span className="text-gray-400">· {subDone}/{subtasks.length} done</span>}
              </p>
              {canSub && (
                <button onClick={() => setSubOpen((v) => !v)} className="text-xs font-medium text-brand-600 hover:underline">
                  {subOpen ? 'Cancel' : '+ Add sub-task'}
                </button>
              )}
            </div>
            {subOpen && (
              <div className="mb-3">
                <TaskForm sites={sites} role={profile?.role} tenantId={task.tenant_id}
                  parentTask={task} onSubmit={handleSub} onCancel={() => setSubOpen(false)} loading={busy} />
              </div>
            )}
            <div className="space-y-1.5">
              {subtasks.map((st) => (
                <button key={st.id} onClick={() => onOpenTask(st)}
                  className="flex w-full items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-left hover:bg-gray-100">
                  <StatusBadge status={st.status} />
                  <span className="flex-1 truncate text-sm text-gray-800">{st.title}</span>
                  <span className="text-xs text-gray-400">{assigneeName(st)}</span>
                  <ChevronRight className="h-4 w-4 text-gray-300" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* daily updates */}
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700">Daily progress</p>
          {task.status !== 'done' && <UpdateForm onSubmit={handleUpdate} loading={busy} />}
          <div className="mt-3 space-y-3">
            {taskUpdates.length === 0 && <p className="text-xs text-gray-400">No updates logged yet.</p>}
            {taskUpdates.map((u) => (
              <div key={u.id} className="flex gap-3">
                {u.photo_path
                  ? <PhotoThumb path={u.photo_path} size={56} />
                  : <div className="h-14 w-1 rounded bg-gray-200" />}
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-400">
                    {formatDate(u.update_date)} · {u.author?.full_name ?? 'Unknown'}
                  </p>
                  {u.note && <p className="text-sm text-gray-700">{u.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}

// ── Task card ──────────────────────────────────────────────────────────────────
function TaskCard({ task, subCount, subDone, onOpen }) {
  const overdue = isOverdue(task)
  return (
    <button onClick={onOpen}
      className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left hover:border-brand-300 hover:shadow-sm transition">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={task.status} />
          {overdue && (
            <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
              <AlertTriangle className="h-3 w-3" /> {daysLate(task)}d late
            </span>
          )}
        </div>
        <p className="mt-1.5 font-semibold text-gray-900 truncate">{task.title}</p>
        <p className="mt-0.5 text-xs text-gray-500">
          {task.site?.name ?? '—'} · {assigneeName(task)}
          {task.due_date && ` · due ${formatDate(task.due_date)}`}
          {subCount > 0 && ` · ${subDone}/${subCount} sub-tasks`}
        </p>
      </div>
      <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-300" />
    </button>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────────
export default function Tasks() {
  const profile  = useAuthStore((s) => s.profile)
  const tenantId = profile?.tenant_id
  const { sites, fetchSites } = useSiteStore()
  const { tasks, loading, fetchTasks, createTask } = useTaskStore()

  const [siteFilter, setSiteFilter] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState(null)
  const [openTask, setOpenTask]     = useState(null)

  const canCreate = ['contractor', 'site_manager', 'supervisor'].includes(profile?.role)

  useEffect(() => { if (tenantId) { fetchSites(tenantId); fetchTasks(tenantId) } }, [tenantId, fetchSites, fetchTasks])

  // keep the open task in sync with store updates
  useEffect(() => {
    if (openTask) {
      const fresh = tasks.find((t) => t.id === openTask.id)
      if (fresh && fresh !== openTask) setOpenTask(fresh)
    }
  }, [tasks])  // eslint-disable-line

  const topTasks = useMemo(() => {
    let list = tasks.filter((t) => !t.parent_task_id)
    if (siteFilter !== 'all') list = list.filter((t) => t.site_id === siteFilter)
    return list
  }, [tasks, siteFilter])

  const handleCreate = async (payload) => {
    setSaving(true); setError(null)
    try { await createTask({ ...payload, assigned_by: profile?.id }); setCreateOpen(false) }
    catch (e) { setError(e.message) } finally { setSaving(false) }
  }

  return (
    <div>
      <PageHeader title="Tasks" description="Assign work, track daily progress and confirm completion." />

      <div className="mb-5 flex items-center gap-3">
        <select className="input max-w-xs" value={siteFilter} onChange={(e) => setSiteFilter(e.target.value)}>
          <option value="all">All sites</option>
          {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <div className="flex-1" />
        {canCreate && (
          <button onClick={() => setCreateOpen(true)} className="btn-primary flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> New Task
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading tasks…</p>
      ) : topTasks.length === 0 ? (
        <EmptyState icon={ListTodo} title="No tasks yet"
          description="Create a task and assign it down the chain — contractor to site manager to supervisor to workers." />
      ) : (
        <div className="space-y-2.5">
          {topTasks.map((t) => {
            const subs = tasks.filter((x) => x.parent_task_id === t.id)
            return (
              <TaskCard key={t.id} task={t} subCount={subs.length}
                subDone={subs.filter((s) => s.status === 'done').length}
                onOpen={() => setOpenTask(t)} />
            )
          })}
        </div>
      )}

      {createOpen && (
        <Modal open onClose={() => { setCreateOpen(false); setError(null) }} title="New Task">
          {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
          <TaskForm sites={sites} role={profile?.role} tenantId={tenantId}
            onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} loading={saving} />
        </Modal>
      )}

      {openTask && (
        <TaskDetail task={openTask} allTasks={tasks} profile={profile} sites={sites}
          onOpenTask={(t) => setOpenTask(t)} onClose={() => setOpenTask(null)} />
      )}
    </div>
  )
}
