import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

const useAuthStore = create((set, get) => ({
  session: null,
  user: null,
  profile: null,
  loading: true,
  _authSubscription: null,
  _initPromise: null,
  _profileFetchInFlight: null,

  /** Bootstrap auth state from Supabase and subscribe to changes. */
  init: () => {
    // Memoised promise prevents the StrictMode double-invocation race:
    // both effect callbacks await the same in-flight init, so we never
    // subscribe twice or fetch the profile twice.
    if (get()._initPromise) return get()._initPromise
    if (get()._authSubscription) return Promise.resolve()

    const promise = (async () => {
      const { data: { session } } = await supabase.auth.getSession()
      set({ session, user: session?.user ?? null, loading: session?.user ? true : false })

      if (session?.user) {
        await get().fetchProfile(session.user.id)
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        // INITIAL_SESSION fires immediately on subscribe — already handled above
        if (event === 'INITIAL_SESSION') return

        if (session?.user) {
          set({ session, user: session.user, loading: true })
          await get().fetchProfile(session.user.id)
        } else {
          set({ session: null, user: null, profile: null, loading: false })
        }
      })

      set({ _authSubscription: subscription, _initPromise: null })
    })()

    set({ _initPromise: promise })
    return promise
  },

  /** Call this on app unmount if needed to clean up the listener. */
  destroy: () => {
    const sub = get()._authSubscription
    if (sub) {
      sub.unsubscribe()
      set({ _authSubscription: null })
    }
  },

  /** Last fetch error, exposed for UI ('You may need to refresh' banners etc.). */
  profileError: null,

  fetchProfile: async (userId) => {
    // Coalesce concurrent fetches for the same user — back-to-back auth events
    // (e.g. SIGNED_IN immediately after a token refresh) should share one round-trip.
    const inflight = get()._profileFetchInFlight
    if (inflight && inflight.userId === userId) return inflight.promise

    const promise = (async () => {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      // PGRST116 = no rows — handle_new_user trigger didn't run for this account
      // (common for Google OAuth users created before the trigger existed)
      if (error?.code === 'PGRST116') {
        const { data: { user } } = await supabase.auth.getUser()
        const fullName = user?.user_metadata?.full_name
          ?? user?.user_metadata?.name
          ?? user?.email
          ?? null

        const { data: created, error: insertError } = await supabase
          .from('profiles')
          .insert({ id: userId, full_name: fullName })
          .select()
          .single()

        if (insertError) {
          console.error('[fetchProfile] backfill failed', insertError.code, insertError.message)
          set({ profile: null, profileError: insertError, loading: false })
          return
        }

        set({ profile: created ?? null, profileError: null, loading: false })
        return
      }

      if (error) {
        console.error('[fetchProfile]', error.code, error.message)
        set({ profile: null, profileError: error, loading: false })
        return
      }

      set({ profile: profile ?? null, profileError: null, loading: false })

      if (profile?.tenant_id) {
        const { data: tenant, error: tenantError } = await supabase
          .from('tenants')
          .select('name, plan')
          .eq('id', profile.tenant_id)
          .single()
        if (tenantError) {
          console.error('[fetchProfile] tenant fetch failed', tenantError.code, tenantError.message)
        } else if (tenant) {
          set((state) => ({ profile: state.profile ? { ...state.profile, tenant } : state.profile }))
        }
      }
    })()

    set({ _profileFetchInFlight: { userId, promise } })
    try {
      await promise
    } finally {
      // Clear only if still ours — a newer fetch may have replaced it.
      const current = get()._profileFetchInFlight
      if (current?.promise === promise) set({ _profileFetchInFlight: null })
    }
  },

  signIn: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  signUp: async ({ email, password, fullName, tenantName }) => {
    // Server-side atomic registration: creates the auth user + tenant, rolls back the
    // user if the tenant insert fails. Avoids the orphaned-auth-user failure mode.
    const { data, error } = await supabase.functions.invoke('register-tenant', {
      body: {
        email,
        password,
        full_name: fullName,
        tenant_name: tenantName,
      },
    })
    if (error) throw new Error(error.message || 'Registration failed')
    if (!data?.success) throw new Error(data?.error || 'Registration failed')

    // Sign in normally to establish a session in the browser.
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({ email, password })
    if (signInError) throw signInError
    return signInData
  },

  signOut: async () => {
    // Keep the auth listener subscribed — onAuthStateChange will fire SIGNED_OUT
    // and clear state via the existing handler in init(). Unsubscribing here would
    // leave this tab unable to react to fresh sessions from sibling tabs.
    await supabase.auth.signOut()
  },
}))

export default useAuthStore



