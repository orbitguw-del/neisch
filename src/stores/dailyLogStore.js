import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

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
    const { data, error } = await supabase
      .from('daily_logs').select('*').eq('site_id', siteId).order('log_date', { ascending: false })
    if (error) { set({ loading: false, error: error.message }); return }
    const enriched = await attachCreators(data ?? [])
    set({ logs: enriched, loading: false, error: null })
  },

  fetchLog: async (logId) => {
    const { data, error } = await supabase.from('daily_logs').select('*').eq('id', logId).single()
    if (error) throw error
    const [enriched] = await attachCreators([data])
    set({ activeLog: enriched })
    return enriched
  },

  createLog: async (payload) => {
    const { data, error } = await supabase.from('daily_logs').insert(payload).select('*').single()
    if (error) throw error
    const [enriched] = await attachCreators([data])
    set((s) => ({ logs: [enriched, ...s.logs] }))
    return enriched
  },

  updateLog: async (logId, payload) => {
    const { data, error } = await supabase.from('daily_logs').update(payload).eq('id', logId).select('*').single()
    if (error) throw error
    const [enriched] = await attachCreators([data])
    set((s) => ({
      logs: s.logs.map((l) => (l.id === logId ? enriched : l)),
      activeLog: s.activeLog?.id === logId ? enriched : s.activeLog,
    }))
    return enriched
  },

  deleteLog: async (logId) => {
    const { error } = await supabase.from('daily_logs').delete().eq('id', logId)
    if (error) throw error
    set((s) => ({ logs: s.logs.filter((l) => l.id !== logId) }))
  },
}))

export default useDailyLogStore
