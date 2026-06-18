import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { createNotification } from '@/stores/notificationStore'
import { isOnline, queueWrite, offlineId } from '@/lib/offlineWrite'
import { withCache } from '@/lib/cachedFetch'

async function attachCreators(logs) {
  const ids = [...new Set(logs.map(l => l.created_by).filter(Boolean))]
  if (!ids.length) return logs
  const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', ids)
  const map = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))
  return logs.map(l => ({ ...l, created_by_profile: map[l.created_by] ?? null }))
}

const useDailyLogStore = create((set) => ({
  logs: [],
  activeLog: null,
  loading: false,
  error: null,

  fetchLogs: async (siteId) => {
    set({ loading: true, error: null })
    try {
      await withCache('dailyLog', 'fetchLogs', { s: siteId },
        async () => {
          const { data, error } = await supabase
            .from('daily_logs')
            .select('*, daily_log_photos(id, photo_path, caption)')
            .eq('site_id', siteId)
            .order('log_date', { ascending: false })
          if (error) throw new Error(error.message)
          return await attachCreators(data ?? [])
        },
        (data) => set((s) => {
          // Preserve optimistic logs queued offline — same reason as expenses.
          const pending = s.logs.filter((l) => l._pending)
          return { logs: [...pending, ...data], loading: false, error: null }
        }),
      )
    } catch (err) {
      set({ loading: false, error: err.message })
    }
  },

  fetchLog: async (logId) => {
    let result = null
    await withCache('dailyLog', 'fetchLog', { id: logId },
      async () => {
        const { data, error } = await supabase.from('daily_logs').select('*').eq('id', logId).single()
        if (error) throw error
        const [enriched] = await attachCreators([data])
        return enriched
      },
      (data) => { result = data; set({ activeLog: data }) },
    )
    return result
  },

  createLog: async (payload) => {
    // Offline: queue the insert and show an optimistic row immediately.
    if (!isOnline()) {
      await queueWrite({
        table: 'daily_logs',
        op: 'insert',
        payload,
        label: `Daily log — ${payload.log_date ?? ''}`,
      })
      const optimistic = {
        ...payload,
        id: offlineId(),
        created_at: new Date().toISOString(),
        created_by_profile: null,
        approval_status: 'submitted',
        _pending: true,
      }
      set((s) => ({ logs: [optimistic, ...s.logs] }))
      return optimistic
    }

    const { data, error } = await supabase.from('daily_logs').insert(payload).select('*').single()
    if (error) throw error
    const [enriched] = await attachCreators([data])
    set((s) => ({ logs: [enriched, ...s.logs] }))
    return enriched
  },

  updateLog: async (logId, payload) => {
    // An edit returns the log to 'submitted' — it needs (re-)confirmation.
    const { data, error } = await supabase.from('daily_logs')
      .update({ ...payload, approval_status: 'submitted', confirmed_by: null, confirmed_at: null })
      .eq('id', logId).select('*').single()
    if (error) throw error
    const [enriched] = await attachCreators([data])
    set((s) => ({
      logs: s.logs.map((l) => (l.id === logId ? enriched : l)),
      activeLog: s.activeLog?.id === logId ? enriched : s.activeLog,
    }))
    return enriched
  },

  /** Site Manager confirms a daily log. */
  confirmLog: async (logId, profileId) => {
    const { data, error } = await supabase.from('daily_logs')
      .update({ approval_status: 'confirmed', confirmed_by: profileId, confirmed_at: new Date().toISOString() })
      .eq('id', logId).select('*').single()
    if (error) throw error
    const [enriched] = await attachCreators([data])
    set((s) => ({ logs: s.logs.map((l) => (l.id === logId ? enriched : l)) }))
    // Notify log creator — fire-and-forget
    if (enriched.created_by && enriched.created_by !== profileId) {
      createNotification({
        tenantId:   enriched.tenant_id,
        userId:     enriched.created_by,
        title:      'Your daily log was confirmed ✅',
        body:       `Log for ${enriched.log_date} has been approved`,
        type:       'log_confirmed',
        entityId:   logId,
        entityType: 'daily_log',
      }).catch(() => {})
    }
    return enriched
  },

  deleteLog: async (logId) => {
    const { error } = await supabase.from('daily_logs').delete().eq('id', logId)
    if (error) throw error
    set((s) => ({ logs: s.logs.filter((l) => l.id !== logId) }))
  },
}))

export default useDailyLogStore
