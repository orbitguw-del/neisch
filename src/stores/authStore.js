import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { getCached, setCache, clearAllCache } from '@/lib/offlineCache'
import { runWithTimeout } from '@/lib/cachedFetch'
import useOfflineStore from '@/stores/offlineStore'

const useAuthStore = create((set, get) => ({
  session: null,
  user: null,
  profile: null,
  loading: true,
  _authSubscription: null,
  _initPromise: null,
  _profileFetchInFlight: null,

  /** Last fetch error, exposed for UI ('You may need to refresh' banners etc.). */
  profileError: null,

  /** Bootstrap auth state from Supabase and subscribe to changes. */
  init: () => {
    // Memoised promise prevents the StrictMode double-invocation race:
    // both effect callbacks await the same in-flight init, so we never
    // subscribe twice or fetch the profile twice.
    if (get()._initPromise) return get()._initPromise
    if (get()._authSubscription) return Promise.resolve()

    const promise = (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        set({ session, user: session?.user ?? null, loading: session?.user ? true : false })

        if (session?.user) {
          await get().fetchProfile(session.user.id)
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          // INITIAL_SESSION fires immediately on subscribe — already handled above.
          if (event === 'INITIAL_SESSION') return

          // Signed out / no session — clear everything.
          if (event === 'SIGNED_OUT' || !newSession?.user) {
            set({ session: null, user: null, profile: null, loading: false })
            return
          }

          const prevUserId = get().user?.id

          // Always keep the session token fresh — but QUIETLY. A background
          // TOKEN_REFRESHED (fires hourly / on tab focus / on reconnect) must
          // never blank the app into the loading spinner.
          set({ session: newSession, user: newSession.user })

          // Only (re)fetch the profile when the actual user changed — a real
          // sign-in — not on every token refresh. No `loading: true` here:
          // the app is already rendered; the profile updates in place.
          if (newSession.user.id !== prevUserId) {
            await get().fetchProfile(newSession.user.id)
          }
        })

        set({ _authSubscription: subscription, _initPromise: null })
      } catch (err) {
        console.error('[authStore] init failed:', err)
        set({ loading: false, _initPromise: null })
      }
    })()

    // Safety net — never let the bootstrap spinner hang forever. If init hasn't
    // finished in 12s (e.g. the network is down mid-flap), release the loading
    // screen so the app renders instead of freezing. init keeps running in the
    // background; the auth subscription still attaches when the network returns.
    const guard = setTimeout(() => {
      if (get().loading) {
        console.warn('[authStore] init timed out — releasing the loading screen')
        set({ loading: false })
      }
    }, 12000)
    promise.finally(() => clearTimeout(guard))

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

  fetchProfile: async (userId) => {
    // Coalesce concurrent fetches for the same user — back-to-back auth events
    // (e.g. SIGNED_IN immediately after a token refresh) should share one round-trip.
    const inflight = get()._profileFetchInFlight
    if (inflight && inflight.userId === userId) return inflight.promise

    const promise = (async () => {
      try {
        const profileCacheKey = `auth:profile:u=${userId}`
        const cached = await getCached(profileCacheKey)
        if (cached) {
          const cp = cached.data.profile
          set({ profile: cp, profileError: null, loading: false })
          if (!useOfflineStore.getState().online) return
        }

        const { data: profile, error } = await runWithTimeout(
          () => supabase.from('profiles').select('*').eq('id', userId).single(),
          10000, // 10s — fires before the 12s init safety-net, so profileError is set before loading clears
        )

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
          try {
            const { data: tenant, error: tenantError } = await runWithTimeout(() =>
              supabase.from('tenants').select('name, plan, sm_can_create_receipts').eq('id', profile.tenant_id).single()
            )
            if (tenantError) {
              console.error('[fetchProfile] tenant fetch failed', tenantError.code, tenantError.message)
            } else if (tenant) {
              set((state) => ({ profile: state.profile ? { ...state.profile, tenant } : state.profile }))
              await setCache(profileCacheKey, { profile: { ...profile, tenant } })
            }
          } catch {
            // Timed out — profile already set above; cache it without tenant enrichment
            console.warn('[fetchProfile] tenant fetch timed out — skipping enrichment')
            await setCache(profileCacheKey, { profile })
          }
        } else {
          await setCache(profileCacheKey, { profile })
        }
      } catch (err) {
        console.error('[authStore] fetchProfile failed:', err)
        set({ profile: null, profileError: err, loading: false })
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

  signUp: async ({ email, password, fullName, tenantName, consent }) => {
    // Server-side atomic registration: creates the auth user + tenant, rolls back the
    // user if the tenant insert fails. Avoids the orphaned-auth-user failure mode.
    // `consent` (optional) captures ToS + Privacy Policy acceptance for DPDP audit.
    const { data, error } = await supabase.functions.invoke('register-tenant', {
      body: {
        email,
        password,
        full_name: fullName,
        tenant_name: tenantName,
        consent: consent ?? null,
      },
    })
    if (error) {
      // supabase-js wraps non-2xx responses as FunctionsHttpError with a generic
      // message ("Edge Function returned a non-2xx status code"). The actual
      // error from our function lives in error.context — read it and surface
      // the friendly message to the user instead of the generic one.
      let serverMessage = null
      try {
        const body = await error.context?.json?.()
        serverMessage = body?.error
      } catch (_) {
        /* ignore — fall back to generic message */
      }
      throw new Error(serverMessage || error.message || 'Registration failed')
    }
    if (!data?.success) throw new Error(data?.error || 'Registration failed')

    // Sign in normally to establish a session in the browser.
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({ email, password })
    if (signInError) throw signInError
    return signInData
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
    await clearAllCache()
    await supabase.auth.signOut()
  },
}))

export default useAuthStore
