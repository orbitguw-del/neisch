import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import { supabase, authRedirectUrl } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'

// ── Forgot Password sub-form ──────────────────────────────────────────────────
function ForgotPasswordForm({ onBack }) {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  const handleReset = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: authRedirectUrl,
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">Check your email</p>
          <p className="mt-1 text-sm text-gray-500">
            We sent a password reset link to <span className="font-medium">{email}</span>
          </p>
        </div>
        <button type="button" onClick={onBack}
          className="text-sm text-brand-600 hover:underline">
          Back to sign in
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleReset} className="space-y-4">
      <div>
        <p className="mb-4 text-sm text-gray-500">
          Enter your email and we'll send you a reset link.
        </p>
        <label className="label" htmlFor="fp-email">Email address</label>
        <input
          id="fp-email"
          type="email"
          autoComplete="email"
          required
          className="input"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? 'Sending…' : 'Send reset link'}
      </button>
      <button type="button" onClick={onBack}
        className="w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors">
        Back to sign in
      </button>
    </form>
  )
}

// ── Main login form ───────────────────────────────────────────────────────────
export default function EmailPasswordLogin() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [forgotMode, setForgotMode] = useState(false)
  const { signIn } = useAuthStore()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signIn({ email, password })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (forgotMode) {
    return <ForgotPasswordForm onBack={() => setForgotMode(false)} />
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label className="label" htmlFor="ep-email">Email address</label>
        <input
          id="ep-email"
          type="email"
          autoComplete="email"
          required
          className="input"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="label mb-0" htmlFor="ep-password">Password</label>
          <button
            type="button"
            onClick={() => setForgotMode(true)}
            className="text-xs text-brand-600 hover:underline"
          >
            Forgot password?
          </button>
        </div>
        <input
          id="ep-password"
          type="password"
          autoComplete="current-password"
          required
          className="input"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
