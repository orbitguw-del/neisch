import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import StoreyIcon from '@/components/brand/StoreyIcon'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState(null)

  useEffect(() => {
    const code  = searchParams.get('code')
    const rawHash = window.location.hash
    const hasToken = rawHash.includes('access_token')

    // Helper: go to dashboard if session exists, else login
    const finish = async (session) => {
      if (session) { navigate('/dashboard', { replace: true }); return }
      // Safety net: maybe session was already stored by Supabase auto-detection
      const { data } = await supabase.auth.getSession()
      navigate(data.session ? '/dashboard' : '/login', { replace: true })
    }

    // ── PKCE flow (Google OAuth) ────────────────────────────────────────────
    if (code) {
      supabase.auth.exchangeCodeForSession(code)
        .then(async ({ data, error: err }) => {
          if (err) {
            // Code may have been auto-consumed — check for existing session
            const { data: existing } = await supabase.auth.getSession()
            if (existing.session) { navigate('/dashboard', { replace: true }); return }
            setError(err.message)
            return
          }
          await finish(data.session)
        })
      return
    }

    // ── Magic-link / implicit flow ──────────────────────────────────────────
    if (hasToken) {
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
