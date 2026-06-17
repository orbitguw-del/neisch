import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { isOnline, queueWrite } from '@/lib/offlineWrite'
import { withCache } from '@/lib/cachedFetch'

const useWorkerStore = create((set, get) => ({
  workers: [],
  loading: false,
  error: null,

  // ── Workers ────────────────────────────────────────────────────────────────

  fetchWorkers: async ({ siteId, tenantId } = {}) => {
    set({ loading: true, error: null })
    try {
      await withCache('worker', 'fetchWorkers', { s: siteId, t: tenantId },
        async () => {
          let q = supabase.from('workers').select('*').order('name')
          if (siteId)   q = q.eq('site_id', siteId)
          if (tenantId) q = q.eq('tenant_id', tenantId)
          const { data, error } = await q
          if (error) throw new Error(error.message)
          return data ?? []
        },
        (data) => set({ workers: data, loading: false, error: null }),
      )
    } catch (err) {
      set({ loading: false, error: err.message })
    }
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

  // Returns { [workerId]: { id, status, notes, approval_status } } for a site + date
  fetchAttendance: async (siteId, date) => {
    let result = {}
    await withCache('worker', 'fetchAttendance', { s: siteId, d: date },
      async () => {
        const { data, error } = await supabase
          .from('attendance')
          .select('id, worker_id, status, notes, approval_status, confirmed_at')
          .eq('site_id', siteId)
          .eq('date', date)
        if (error) throw error
        return Object.fromEntries((data ?? []).map((r) => [r.worker_id, r]))
      },
      (data) => { result = data },
    )
    return result
  },

  // Confirm a whole site+date roster — Site Manager sign-off.
  confirmAttendanceDay: async ({ siteId, date, profileId }) => {
    const { error } = await supabase
      .from('attendance')
      .update({ approval_status: 'confirmed', confirmed_by: profileId, confirmed_at: new Date().toISOString() })
      .eq('site_id', siteId)
      .eq('date', date)
    if (error) throw error
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
    // Every save (new or edit) marks the row 'submitted' — it needs (re-)confirmation.
    const rows = records.map(({ workerId, status, notes }) => ({
      worker_id: workerId,
      site_id: siteId,
      tenant_id: tenantId,
      date,
      status,
      notes: notes ?? null,
      approval_status: 'submitted',
    }))

    // Offline: queue the upsert; it replays on reconnect.
    if (!isOnline()) {
      await queueWrite({
        table: 'attendance',
        op: 'upsert',
        payload: rows,
        upsertOpts: { onConflict: 'worker_id,date' },
        label: `Attendance — ${date} (${rows.length} workers)`,
      })
      return
    }

    const { error } = await supabase
      .from('attendance')
      .upsert(rows, { onConflict: 'worker_id,date' })
    if (error) throw error
  },

  // Monthly summary: { date: { present, absent, half_day, paid_leave } }
  fetchMonthlyAttendance: async (siteId, year, month) => {
    let result = []
    await withCache('worker', 'fetchMonthlyAttendance', { s: siteId, y: year, m: month },
      async () => {
        const from = `${year}-${String(month).padStart(2, '0')}-01`
        const to   = new Date(year, month, 0).toISOString().slice(0, 10)
        const { data, error } = await supabase
          .from('attendance')
          .select('worker_id, date, status')
          .eq('site_id', siteId)
          .gte('date', from)
          .lte('date', to)
        if (error) throw error
        return data ?? []
      },
      (data) => { result = data },
    )
    return result
  },
}))

export default useWorkerStore
