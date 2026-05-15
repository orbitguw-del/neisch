import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { KeyRound, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import StoreyIcon from '@/components/brand/StoreyIcon'
import { supabase } from '@/lib/supabase'

export default function ResetPassword() {
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [done, setDone]           = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 6)  { setError('Password must be at least 6 characters'); return }

    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (err) { setError(err.message); return }
    setDone(true)
    setTimeout(() => navigate('/dashboard'), 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 p-4">
      <div className="w-full max-w-sm">

        {/* Brand header */}
        <div className="mb-7 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 shadow-lg backdrop-blur-sm ring-1 ring-white/20">
            <StoreyIcon size={32} showText={false} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Georgia, ui-serif, serif' }}>
              Storey
            </h1>
            <p className="text-sm text-white/60">Construction, organised.</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 p-6">

          {done ? (
            <div className="space-y-4 text-center py-2">
              <div className="flex justify-center">
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Password updated!</p>
                <p className="mt-1 text-sm text-gray-500">Redirecting to your dashboard…</p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
                  <KeyRound className="h-5 w-5 text-brand-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Set new password</h2>
                <p className="text-sm text-gray-500">Choose a strong password for your account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label" htmlFor="rp-password">New password</label>
                  <div className="relative">
                    <input
                      id="rp-password"
                      type={showPw ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      className="input pr-10"
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="label" htmlFor="rp-confirm">Confirm password</label>
                  <input
                    id="rp-confirm"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className="input"
                    placeholder="Re-enter password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  {loading ? 'Updating…' : 'Update password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
