import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

const useWorkerStore = create((set) => ({
  workers: [],
  loading: false,
  error: null,

  fetchWorkers: async (siteId) => {
    set({ loading: true, error: null })
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .eq('site_id', siteId)
      .order('name')
    set({ workers: data ?? [], loading: false, error: error?.message ?? null })
  },

  createWorker: async (payload) => {
    const { data, error } = await supabase
      .from('workers')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    set((s) => ({ workers: [...s.workers, data] }))
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
    set((s) => ({
      workers: s.workers.map((w) => (w.id === workerId ? data : w)),
    }))
    return data
  },

  deleteWorker: async (workerId) => {
    const { error } = await supabase.from('workers').delete().eq('id', workerId)
    if (error) throw error
    set((s) => ({ workers: s.workers.filter((w) => w.id !== workerId) }))
  },
}))

export default useWorkerStore
