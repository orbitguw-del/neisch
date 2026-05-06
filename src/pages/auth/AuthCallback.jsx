import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import StoreyIcon from '@/components/brand/StoreyIcon'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code')

    if (code) {
      // PKCE flow (Google OAuth) — exchange the code for a session
      supabase.auth.exchangeCodeForSession(code).then(({ data: { session }, error: err }) => {
        if (err) { setError(err.message); return }
        if (session) navigate('/dashboard', { replace: true })
        else navigate('/login', { replace: true })
      })
    } else {
      // Hash-based flow (magic link / email invite)
      supabase.auth.getSession().then(({ data: { session }, error: err }) => {
        if (err) { setError(err.message); return }
        if (session) navigate('/dashboard', { replace: true })
        else navigate('/login', { replace: true })
      })
    }
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
