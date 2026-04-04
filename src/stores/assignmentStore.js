import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

const useAssignmentStore = create((set) => ({
  assignments: [],
  loading: false,
  error: null,

  /** Fetch all assignments for a site (contractor / manager view). */
  fetchAssignments: async (siteId) => {
    set({ loading: true, error: null })
    const { data, error } = await supabase
      .from('site_assignments').select('*').eq('site_id', siteId).order('created_at')
    if (error) { set({ loading: false, error: error.message }); return }
    const profileIds = [...new Set((data ?? []).map(a => a.profile_id))]
    let profileMap = {}
    if (profileIds.length) {
      const { data: profiles } = await supabase.from('profiles').select('id, full_name, role').in('id', profileIds)
      profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))
    }
    const enriched = (data ?? []).map(a => ({ ...a, profile: profileMap[a.profile_id] ?? null }))
    set({ assignments: enriched, loading: false, error: null })
  },

  /** Fetch all assignments for a tenant (contractor overview). */
  fetchTenantAssignments: async (tenantId) => {
    set({ loading: true, error: null })
    const { data, error } = await supabase
      .from('site_assignments').select('*').eq('tenant_id', tenantId).order('created_at')
    if (error) { set({ loading: false, error: error.message }); return }
    const list = data ?? []
    const profileIds = [...new Set(list.map(a => a.profile_id))]
    const siteIds    = [...new Set(list.map(a => a.site_id))]
    let profileMap = {}, siteMap = {}
    if (profileIds.length) {
      const { data: profiles } = await supabase.from('profiles').select('id, full_name, role').in('id', profileIds)
      profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))
    }
    if (siteIds.length) {
      const { data: sites } = await supabase.from('sites').select('id, name, location').in('id', siteIds)
      siteMap = Object.fromEntries((sites ?? []).map(s => [s.id, s]))
    }
    const enriched = list.map(a => ({ ...a, profile: profileMap[a.profile_id] ?? null, site: siteMap[a.site_id] ?? null }))
    set({ assignments: enriched, loading: false, error: null })
  },

  /** Fetch sites assigned to the currently logged-in user. */
  fetchMyAssignments: async () => {
    set({ loading: true, error: null })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { set({ loading: false }); return }
    const { data, error } = await supabase
      .from('site_assignments').select('*').eq('profile_id', user.id).order('created_at')
    if (error) { set({ loading: false, error: error.message }); return }
    const siteIds = [...new Set((data ?? []).map(a => a.site_id))]
    let siteMap = {}
    if (siteIds.length) {
      const { data: sites } = await supabase.from('sites').select('*').in('id', siteIds)
      siteMap = Object.fromEntries((sites ?? []).map(s => [s.id, s]))
    }
    const enriched = (data ?? []).map(a => ({ ...a, site: siteMap[a.site_id] ?? null }))
    set({ assignments: enriched, loading: false, error: null })
  },

  createAssignment: async (payload) => {
    const { data, error } = await supabase
      .from('site_assignments').insert(payload).select('*').single()
    if (error) throw error
    const [{ data: profile }, { data: site }] = await Promise.all([
      supabase.from('profiles').select('id, full_name, role').eq('id', data.profile_id).single(),
      supabase.from('sites').select('id, name, location').eq('id', data.site_id).single(),
    ])
    const enriched = { ...data, profile: profile ?? null, site: site ?? null }
    set((s) => ({ assignments: [...s.assignments, enriched] }))
    return enriched
  },

  deleteAssignment: async (assignmentId) => {
    const { error } = await supabase
      .from('site_assignments')
      .delete()
      .eq('id', assignmentId)
    if (error) throw error
    set((s) => ({ assignments: s.assignments.filter((a) => a.id !== assignmentId) }))
  },
}))

export default useAssignmentStore
