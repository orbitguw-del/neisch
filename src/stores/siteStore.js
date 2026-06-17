import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { withCache } from '@/lib/cachedFetch'

const useSiteStore = create((set, get) => ({
  sites: [],
  activeSite: null,
  loading: false,
  error: null,

  fetchSites: async (tenantId) => {
    set({ loading: true, error: null })
    try {
      await withCache('site', 'fetchSites', { t: tenantId },
        async () => {
          let query = supabase.from('sites').select('*').order('created_at', { ascending: false })
          if (tenantId) query = query.eq('tenant_id', tenantId)
          const { data, error } = await query
          if (error) throw new Error(error.message)
          return data ?? []
        },
        (data) => set({ sites: data, loading: false, error: null }),
      )
    } catch (err) {
      set({ loading: false, error: err.message })
    }
  },

  fetchAllSites: async () => {
    set({ loading: true, error: null })
    try {
      await withCache('site', 'fetchAllSites', {},
        async () => {
          const { data: sites, error } = await supabase
            .from('sites')
            .select('*')
            .order('created_at', { ascending: false })
          if (error) throw new Error(error.message)
          const tenantIds = [...new Set(sites.map(s => s.tenant_id).filter(Boolean))]
          let tenantMap = {}
          if (tenantIds.length) {
            const { data: tenants } = await supabase.from('tenants').select('id, name').in('id', tenantIds)
            tenantMap = Object.fromEntries((tenants ?? []).map(t => [t.id, t]))
          }
          return sites.map(s => ({ ...s, tenant: tenantMap[s.tenant_id] ?? null }))
        },
        (data) => set({ sites: data, loading: false, error: null }),
      )
    } catch (err) {
      set({ loading: false, error: err.message })
    }
  },

  fetchSite: async (siteId) => {
    let result = null
    await withCache('site', 'fetchSite', { s: siteId },
      async () => {
        const { data, error } = await supabase
          .from('sites')
          .select(`
            *,
            workers(count),
            materials(count)
          `)
          .eq('id', siteId)
          .single()
        if (error) throw error
        return data
      },
      (data) => { result = data; set({ activeSite: data }) },
    )
    return result
  },

  createSite: async (payload) => {
    const { data, error } = await supabase
      .from('sites')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    set((s) => ({ sites: [data, ...s.sites] }))
    return data
  },

  updateSite: async (siteId, payload) => {
    const { data, error } = await supabase
      .from('sites')
      .update(payload)
      .eq('id', siteId)
      .select()
      .single()
    if (error) throw error
    set((s) => ({
      sites: s.sites.map((site) => (site.id === siteId ? data : site)),
      activeSite: s.activeSite?.id === siteId ? data : s.activeSite,
    }))
    return data
  },

  deleteSite: async (siteId) => {
    const { error } = await supabase.from('sites').delete().eq('id', siteId)
    if (error) throw error
    set((s) => ({ sites: s.sites.filter((site) => site.id !== siteId) }))
  },
}))

export default useSiteStore
