import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

const useAuthStore = create((set, get) => ({
  session: null,
  user: null,
  profile: null,
  loading: true,
  _authSubscription: null,

  /** Bootstrap auth state from Supabase and subscribe to changes. */
  init: async () => {
    // Prevent duplicate subscriptions (React StrictMode double-invokes effects)
    if (get()._authSubscription) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      set({ session, user: session?.user ?? null, loading: session?.user ? true : false })

      if (session?.user) {
        await get().fetchProfile(session.user.id)
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        // Skip INITIAL_SESSION — already handled by getSession() above to avoid
        // double-fetching the profile on mount.
        if (event === 'INITIAL_SESSION') return

        if (session?.user) {
          set({ session, user: session.user, loading: true })
          await get().fetchProfile(session.user.id)
        } else {
          set({ session: null, user: null, profile: null, loading: false })
        }
      })

      set({ _authSubscription: subscription })
    } catch (err) {
      console.error('[authStore] init failed:', err)
      set({ loading: false })
    }
  },

  /** Call this on app unmount if needed to clean up the listener. */
  destroy: () => {
    const sub = get()._authSubscription
    if (sub) {
      sub.unsubscribe()
      set({ _authSubscription: null })
    }
  },

  fetchProfile: async (userId) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!profile) {
        set({ loading: false })
        return
      }

      let tenant = null
      if (profile.tenant_id) {
        const { data } = await supabase
          .from('tenants')
          .select('name, plan')
          .eq('id', profile.tenant_id)
          .single()
        tenant = data ?? null
      }

      set({ profile: { ...profile, tenant }, loading: false })
    } catch (err) {
      console.error('[authStore] fetchProfile failed:', err)
      set({ loading: false })
    }
  },

  signIn: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  signUp: async ({ email, password, fullName, tenantName }) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (authError) throw authError

    const { error: tenantError } = await supabase
      .from('tenants')
      .insert({ name: tenantName, owner_id: authData.user.id })
    if (tenantError) throw tenantError

    return authData
  },

  /** Creates a tenant for a contractor who signed up via Google OAuth (tenant_id = null). */
  createTenantForUser: async (tenantName) => {
    const user = get().user
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('tenants')
      .insert({ name: tenantName, owner_id: user.id })
    if (error) throw error

    // Re-fetch profile to pick up the new tenant_id set by link_owner_to_tenant trigger
    await get().fetchProfile(user.id)
  },

  signOut: async () => {
    get().destroy()
    await supabase.auth.signOut()
    set({ session: null, user: null, profile: null })
  },
}))

export default useAuthStore
