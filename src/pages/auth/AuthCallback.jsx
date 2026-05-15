import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import StoreyIcon from '@/components/brand/StoreyIcon'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState(null)

  useEffect(() => {
    // Supabase may append ?code= before the # (e.g. /?code=xxx#/auth/callback)
    // OR inside the hash (e.g. /#/auth/callback?code=xxx).
    // Check both locations to cover either case.
    const urlSearch  = new URLSearchParams(window.location.search)
    const code       = searchParams.get('code') || urlSearch.get('code')
    const oauthErr   = searchParams.get('error') || urlSearch.get('error')
    const oauthDesc  = searchParams.get('error_description') || urlSearch.get('error_description')
    const rawHash    = window.location.hash
    const hasToken   = rawHash.includes('access_token')

    console.log('[AuthCallback] code:', code, '| error:', oauthErr, '| hash:', rawHash)

    // ── OAuth error returned by Google / Supabase ───────────────────────────
    if (oauthErr) {
      // Friendly mapping for the most common case — user denied consent.
      const message = oauthErr === 'access_denied'
        ? 'Sign-in was cancelled. You can try again or use another method.'
        : `Sign-in failed: ${decodeURIComponent((oauthDesc || oauthErr).replace(/\+/g, ' '))}`
      setError(message)
      return
    }

    // Helper: go to dashboard if session exists, else login
    const finish = async (session) => {
      console.log('[AuthCallback] finish — session:', !!session)
      if (session) { navigate('/dashboard', { replace: true }); return }
      const { data } = await supabase.auth.getSession()
      console.log('[AuthCallback] fallback getSession:', !!data.session)
      navigate(data.session ? '/dashboard' : '/login', { replace: true })
    }

    // ── PKCE flow (Google OAuth) ────────────────────────────────────────────
    if (code) {
      supabase.auth.exchangeCodeForSession(code)
        .then(async ({ data, error: err }) => {
          console.log('[AuthCallback] exchangeCodeForSession — session:', !!data?.session, '| err:', err?.message)
          if (err) {
            const { data: existing } = await supabase.auth.getSession()
            if (existing.session) { navigate('/dashboard', { replace: true }); return }
            setError(err.message)
            return
          }
          await finish(data.session)
        })
      return
    }

    // ── Magic-link / implicit / recovery flow ──────────────────────────────
    if (hasToken) {
      // On native (Capacitor) the deep-link URL arrives as:
      //   storeyapp://auth/callback#access_token=xxx&refresh_token=yyy&type=recovery
      // capacitor.js calls router.navigate('/auth/callback#access_token=xxx...')
      // which makes window.location.hash = "#/auth/callback#access_token=xxx..."
      // (two # signs — browser only honours the first one as the fragment delimiter)
      // We extract tokens from the second fragment if present, otherwise from the first.
      const secondHash   = rawHash.indexOf('#', 1)
      const tokenFrag    = secondHash !== -1 ? rawHash.slice(secondHash + 1) : rawHash.slice(1)
      const tokenParams  = new URLSearchParams(tokenFrag)
      const accessToken  = tokenParams.get('access_token')
      const refreshToken = tokenParams.get('refresh_token') ?? ''
      const tokenType    = tokenParams.get('type') // 'recovery' | 'signup' | null

      console.log('[AuthCallback] magic-link | type:', tokenType, '| hasToken:', !!accessToken)

      if (accessToken) {
        // Explicitly set the session (needed on native — detectSessionInUrl is false)
        supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
          .then(({ data, error: sessErr }) => {
            console.log('[AuthCallback] setSession — session:', !!data?.session, '| err:', sessErr?.message)
            if (sessErr || !data?.session) { navigate('/login', { replace: true }); return }
            navigate(tokenType === 'recovery' ? '/reset-password' : '/dashboard', { replace: true })
          })
          .catch(() => navigate('/login', { replace: true }))
        return
      }

      // Fallback: no explicit token found — wait for Supabase auth state change
      // (e.g. detectSessionInUrl handled it externally)
      let done = false
      let sub = null

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (done) return
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
          done = true
          sub?.unsubscribe()
          navigate('/dashboard', { replace: true })
        }
      })
      sub = subscription

      const timer = setTimeout(async () => {
        if (done) return
        done = true
        sub?.unsubscribe()
        const { data } = await supabase.auth.getSession()
        navigate(data.session ? '/dashboard' : '/login', { replace: true })
      }, 5000)

      return () => { sub?.unsubscribe(); clearTimeout(timer) }
    }

    // ── No auth params — check existing session ─────────────────────────────
    supabase.auth.getSession().then(({ data }) => {
      navigate(data.session ? '/dashboard' : '/login', { replace: true })
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps — intentionally run once

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-gray-100 p-4">
        <div className="w-full max-w-sm text-center">
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
          <button onClick={() => navigate('/login')} className="text-sm text-brand-600 hover:text-brand-700 font-medium">
            Back to sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-gray-100">
      <div className="flex flex-col items-center gap-4">
        <StoreyIcon size={48} />
        <div className="h-8 w-8 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
        <p className="text-sm text-gray-500">Setting up your account…</p>
      </div>
    </div>
  )
}
