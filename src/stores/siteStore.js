import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

const useSiteStore = create((set, get) => ({
  sites: [],
  activeSite: null,
  loading: false,
  error: null,

  fetchSites: async (tenantId) => {
    set({ loading: true, error: null })
    let query = supabase.from('sites').select('*').order('created_at', { ascending: false })
    if (tenantId) query = query.eq('tenant_id', tenantId)
    const { data, error } = await query
    set({ sites: data ?? [], loading: false, error: error?.message ?? null })
  },

  /** Superadmin: fetch all sites across all tenants with tenant name. */
  fetchAllSites: async () => {
    set({ loading: true, error: null })
    const { data: sites, error } = await supabase
      .from('sites')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) { set({ loading: false, error: error.message }); return }
    // Attach tenant names
    const tenantIds = [...new Set(sites.map(s => s.tenant_id).filter(Boolean))]
    let tenantMap = {}
    if (tenantIds.length) {
      const { data: tenants } = await supabase.from('tenants').select('id, name').in('id', tenantIds)
      tenantMap = Object.fromEntries((tenants ?? []).map(t => [t.id, t]))
    }
    const enriched = sites.map(s => ({ ...s, tenant: tenantMap[s.tenant_id] ?? null }))
    set({ sites: enriched, loading: false, error: null })
  },

  fetchSite: async (siteId) => {
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
    set({ activeSite: data })
    return data
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
