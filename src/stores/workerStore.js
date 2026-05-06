import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

const useWorkerStore = create((set, get) => ({
  workers: [],
  loading: false,
  error: null,

  // ── Workers ────────────────────────────────────────────────────────────────

  fetchWorkers: async ({ siteId, tenantId } = {}) => {
    set({ loading: true, error: null })
    let q = supabase.from('workers').select('*').order('name')
    if (siteId)   q = q.eq('site_id', siteId)
    if (tenantId) q = q.eq('tenant_id', tenantId)
    const { data, error } = await q
    set({ workers: data ?? [], loading: false, error: error?.message ?? null })
  },

  createWorker: async (payload) => {
    const { data, error } = await supabase
      .from('workers')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    set((s) => ({ workers: [...s.workers, data].sort((a, b) => a.name.localeCompare(b.name)) }))
    return data
  },

  updateWorker: async (workerId, payload) => {
    const { data, error } = await supabase
      .from('workers')
      .update(payload)
      .eq('id', workerId)
      .select()
      .single()
    if (error) throw error
    set((s) => ({ workers: s.workers.map((w) => (w.id === workerId ? data : w)) }))
    return data
  },

  deactivateWorker: async (workerId) => {
    return get().updateWorker(workerId, { status: 'inactive' })
  },

  activateWorker: async (workerId) => {
    return get().updateWorker(workerId, { status: 'active' })
  },

  // ── Attendance ─────────────────────────────────────────────────────────────

  // Returns { [workerId]: { id, status, notes } } for a given site + date
  fetchAttendance: async (siteId, date) => {
    const { data, error } = await supabase
      .from('attendance')
      .select('id, worker_id, status, notes')
      .eq('site_id', siteId)
      .eq('date', date)
    if (error) throw error
    return Object.fromEntries((data ?? []).map((r) => [r.worker_id, r]))
  },

  // Upsert a single worker's attendance for a date
  upsertAttendance: async ({ workerId, siteId, tenantId, date, status, notes }) => {
    const { data, error } = await supabase
      .from('attendance')
      .upsert(
        { worker_id: workerId, site_id: siteId, tenant_id: tenantId, date, status, notes: notes ?? null },
        { onConflict: 'worker_id,date' }
      )
      .select()
      .single()
    if (error) throw error
    return data
  },

  // Bulk-save attendance map { workerId: { status, notes } } for a site + date
  saveAttendanceBulk: async ({ siteId, tenantId, date, records }) => {
    if (!records.length) return
    const rows = records.map(({ workerId, status, notes }) => ({
      worker_id: workerId,
      site_id: siteId,
      tenant_id: tenantId,
      date,
      status,
      notes: notes ?? null,
    }))
    const { error } = await supabase
      .from('attendance')
      .upsert(rows, { onConflict: 'worker_id,date' })
    if (error) throw error
  },

  // Monthly summary: { date: { present, absent, half_day, paid_leave } }
  fetchMonthlyAttendance: async (siteId, year, month) => {
    const from = `${year}-${String(month).padStart(2, '0')}-01`
    const to   = new Date(year, month, 0).toISOString().slice(0, 10) // last day of month
    const { data, error } = await supabase
      .from('attendance')
      .select('worker_id, date, status')
      .eq('site_id', siteId)
      .gte('date', from)
      .lte('date', to)
    if (error) throw error
    return data ?? []
  },
}))

export default useWorkerStore
