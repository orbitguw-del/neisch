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

    const { data: { session } } = await supabase.auth.getSession()
    set({ session, user: session?.user ?? null, loading: session?.user ? true : false })

    if (session?.user) {
      await get().fetchProfile(session.user.id)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        set({ session, user: session.user, loading: true })
        await get().fetchProfile(session.user.id)
      } else {
        set({ session: null, user: null, profile: null, loading: false })
      }
    })

    set({ _authSubscription: subscription })
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

    // Fix: build new object instead of mutating profile directly
    set({ profile: { ...profile, tenant }, loading: false })
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

  signOut: async () => {
    get().destroy()
    await supabase.auth.signOut()
    set({ session: null, user: null, profile: null })
  },
}))

export default useAuthStore



