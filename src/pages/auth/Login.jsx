import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Chrome } from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import StoreyIcon from '@/components/brand/StoreyIcon'

export default function Login() {
  const [tab, setTab]               = useState('email') // 'email' | 'invite'
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [error, setError]           = useState(null)
  const [loading, setLoading]       = useState(false)

  // Invite tab state
  const [inviteToken, setInviteToken] = useState('')
  const [invitePass, setInvitePass]   = useState('')
  const [inviteRole, setInviteRole]   = useState('supervisor')

  const { signIn } = useAuthStore()
  const navigate   = useNavigate()

  // ── Email/password login ──────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signIn({ email, password })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Google OAuth ──────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) setError(error.message)
  }

  // ── Accept invite ─────────────────────────────────────────────────────────
  const handleInviteAccept = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: inviteToken.trim(),
        type: 'invite',
      })
      if (error) throw error
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-gray-100 p-4">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <StoreyIcon size={48} />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Georgia, ui-serif, serif' }}>Storey</h1>
            <p className="text-sm text-gray-500">Construction, organised.</p>
            <p className="mt-1 text-xs text-gray-400">ConTech ERP · real-time site decisions</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => { setTab('email'); setError(null) }}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
              tab === 'email'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('invite'); setError(null) }}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
              tab === 'invite'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Accept Invite
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ── Sign In Tab ── */}
        {tab === 'email' && (
          <div className="space-y-4">

            {/* Google OAuth */}
            <button
              type="button"
              onClick={handleGoogle}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <Chrome className="h-4 w-4" />
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-gray-200" />
              <span className="text-xs text-gray-400 uppercase tracking-wide">or</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            {/* Email/password form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label" htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                />
              </div>
              <div>
                <label className="label" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-1"
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700">
                Register your company
              </Link>
            </p>
          </div>
        )}

        {/* ── Accept Invite Tab ── */}
        {tab === 'invite' && (
          <div className="space-y-4">

            <div className="rounded-lg bg-brand-50 border border-brand-200 px-4 py-3 text-sm text-brand-700">
              <p className="font-medium mb-1">📩 Invited by a contractor?</p>
              <p className="text-brand-600">Paste your invite token from the email. Your role and site are pre-assigned.</p>
            </div>

            {/* Google accept */}
            <button
              type="button"
              onClick={handleGoogle}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <Chrome className="h-4 w-4" />
              Accept Invite with Google
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-gray-200" />
              <span className="text-xs text-gray-400 uppercase tracking-wide">or</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            <form onSubmit={handleInviteAccept} className="space-y-4">
              <div>
                <label className="label">Invite Token</label>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="Paste token from email"
                  value={inviteToken}
                  onChange={(e) => setInviteToken(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Your Role</label>
                <select
                  className="input"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  <option value="supervisor">Supervisor</option>
                  <option value="store_keeper">Store Keeper</option>
                  <option value="site_manager">Site Manager</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-1"
              >
                {loading ? 'Joining…' : 'Accept Invite →'}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setTab('email')}
                className="font-medium text-brand-600 hover:text-brand-700"
              >
                Sign in instead
              </button>
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
