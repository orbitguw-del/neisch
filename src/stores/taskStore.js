import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

// FK embeds: two FKs point at profiles (assigned_to_profile, assigned_by),
// so each embed names its FK column explicitly to disambiguate.
const TASK_SELECT = `
  id, tenant_id, site_id, parent_task_id, title, description,
  assigned_to_profile, assigned_to_worker, assigned_by,
  status, priority, start_date, due_date,
  confirmed_by, confirmed_at, completed_at, created_at, updated_at,
  site:site_id(name),
  assignee_profile:assigned_to_profile(full_name, role),
  assignee_worker:assigned_to_worker(name, trade),
  assigner:assigned_by(full_name)
`

const useTaskStore = create((set, get) => ({
  tasks:   [],
  updates: {},      // { [taskId]: [update, ...] }
  loading: false,
  error:   null,

  /** All tasks for a tenant (RLS scopes sub-roles to their sites). */
  fetchTasks: async (tenantId, { siteId = null } = {}) => {
    set({ loading: true, error: null })
    let q = supabase.from('tasks').select(TASK_SELECT)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
    if (siteId) q = q.eq('site_id', siteId)
    const { data, error } = await q
    set({ tasks: data ?? [], loading: false, error: error?.message ?? null })
  },

  createTask: async (payload) => {
    const { data, error } = await supabase
      .from('tasks').insert(payload).select(TASK_SELECT).single()
    if (error) throw error
    set((s) => ({ tasks: [data, ...s.tasks] }))
    return data
  },

  updateTask: async (id, patch) => {
    const { data, error } = await supabase
      .from('tasks').update(patch).eq('id', id).select(TASK_SELECT).single()
    if (error) throw error
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? data : t)) }))
    return data
  },

  // ── status transitions ──────────────────────────────────────────────────────
  startTask:  (id) => get().updateTask(id, { status: 'in_progress' }),
  blockTask:  (id) => get().updateTask(id, { status: 'blocked' }),

  /** Assignee marks the task finished — goes to the assigner for confirmation. */
  submitTask: (id) => get().updateTask(id, { status: 'submitted' }),

  /** Assigner confirms a submitted task → Done. */
  confirmTask: (id, confirmerId) => get().updateTask(id, {
    status:       'done',
    confirmed_by: confirmerId,
    confirmed_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
  }),

  /** Assigner rejects a submitted task → back to In progress for rework. */
  sendBack: (id) => get().updateTask(id, {
    status: 'in_progress', confirmed_by: null, confirmed_at: null, completed_at: null,
  }),

  deleteTask: async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) throw error
    // drop the task and any of its direct children from local state
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id && t.parent_task_id !== id) }))
  },

  // ── daily progress updates ──────────────────────────────────────────────────
  fetchUpdates: async (taskId) => {
    const { data, error } = await supabase
      .from('task_updates')
      .select('*, author:created_by(full_name)')
      .eq('task_id', taskId)
      .order('update_date', { ascending: false })
      .order('created_at', { ascending: false })
    if (error) throw error
    set((s) => ({ updates: { ...s.updates, [taskId]: data ?? [] } }))
    return data ?? []
  },

  addUpdate: async (payload) => {
    const { data, error } = await supabase
      .from('task_updates')
      .insert(payload)
      .select('*, author:created_by(full_name)')
      .single()
    if (error) throw error
    set((s) => ({
      updates: { ...s.updates, [payload.task_id]: [data, ...(s.updates[payload.task_id] ?? [])] },
    }))
    return data
  },
}))

// ── Derived helpers (overdue / stalled are computed, never stored) ─────────────

/** A task past its due date and not finished. */
export function isOverdue(task) {
  if (!task?.due_date || task.status === 'done') return false
  return new Date(task.due_date) < new Date(new Date().toDateString())
}

/** Whole days a task is past due (0 if not overdue). */
export function daysLate(task) {
  if (!isOverdue(task)) return 0
  const ms = Date.now() - new Date(task.due_date).getTime()
  return Math.floor(ms / 86400000)
}

export default useTaskStore
