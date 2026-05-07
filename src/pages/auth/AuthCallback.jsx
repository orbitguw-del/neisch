import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import StoreyIcon from '@/components/brand/StoreyIcon'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code')
    const hash = window.location.hash

    if (code) {
      // PKCE flow (Google OAuth) — exchange the code for a session
      supabase.auth.exchangeCodeForSession(code).then(({ data: { session }, error: err }) => {
        if (err) { setError(err.message); return }
        navigate(session ? '/dashboard' : '/login', { replace: true })
      })
      return
    }

    if (hash && hash.includes('access_token')) {
      // Implicit / magic-link flow — Supabase processes the hash asynchronously.
      // Use a ref-like variable so the callback can safely unsubscribe even if it
      // fires before the const assignment is returned (closure timing safety).
      let done = false
      let sub = null

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (done) return
        if (event === 'SIGNED_IN' && session) {
          done = true
          if (sub) sub.unsubscribe()
          navigate('/dashboard', { replace: true })
        }
      })
      sub = subscription

      // Fallback: if SIGNED_IN hasn't fired after 4 s, check session directly
      const timer = setTimeout(async () => {
        if (done) return
        done = true
        sub.unsubscribe()
        const { data: { session } } = await supabase.auth.getSession()
        navigate(session ? '/dashboard' : '/login', { replace: true })
      }, 4000)

      return () => {
        sub?.unsubscribe()
        clearTimeout(timer)
      }
    }

    // No code, no hash — just check for an existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      navigate(session ? '/dashboard' : '/login', { replace: true })
    })
  }, [navigate])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-gray-100 p-4">
        <div className="w-full max-w-sm text-center">
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
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
