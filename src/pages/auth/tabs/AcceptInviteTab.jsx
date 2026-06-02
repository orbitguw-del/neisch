import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import useAuthStore from '@/stores/authStore'

export default function AcceptInviteTab() {
  const [searchParams] = useSearchParams()
  const [inviteCode,      setInviteCode]      = useState(searchParams.get('invite') || '')
  const [inviteEmail,     setInviteEmail]     = useState('')   // locked from server
  const [fullName,        setFullName]        = useState('')
  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [step,            setStep]            = useState('code') // code|validating|signup|done
  const [loading,         setLoading]         = useState(false)
  const [error,           setError]           = useState('')
  const { signIn } = useAuthStore()
  const navigate   = useNavigate()

  // Auto-validate if code came in via URL query param
  useEffect(() => {
    const code = searchParams.get('invite')
    if (code) validateCode(code)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const validateCode = async (code) => {
    setStep('validating')
    setError('')
    const { data, error: fnErr } = await supabase.functions.invoke('sign-up-with-invite', {
      body: { invite_code: code.trim().toUpperCase(), validate_only: true },
    })
    if (fnErr) {
      setError('Network error — check your connection and try again.')
      setStep('code')
      return
    }
    if (data?.error) {
      setError(data.error)
      setStep('code')
      return
    }
    setInviteEmail(data.email)
    setStep('signup')
  }

  const handleSubmitCode = async (e) => {
    e.preventDefault()
    if (inviteCode.trim().length < 8) {
      setError('Invite code must be 8 characters — check the code your contractor sent')
      return
    }
    await validateCode(inviteCode)
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    setError('')

    const { data, error: fnErr } = await supabase.functions.invoke('sign-up-with-invite', {
      body: {
        invite_code: inviteCode.trim().toUpperCase(),
        email:       inviteEmail,
        password,
        full_name:   fullName.trim() || undefined,
      },
    })

    if (fnErr || data?.error) {
      setError(data?.error || 'Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    // Account created — sign in immediately
    try {
      await signIn({ email: inviteEmail, password })
      navigate('/dashboard')
    } catch {
      // Auto sign-in failed — show clear next step
      setStep('done')
      setLoading(false)
    }
  }

  // ── Code entry ────────────────────────────────────────────────────────────
  if (step === 'code') {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-brand-50 border border-brand-200 px-4 py-3 text-sm text-brand-700">
          <p className="font-medium mb-1">📩 Invited by a contractor?</p>
          <p className="text-brand-600">Enter the 8-character code your contractor shared with you.</p>
        </div>
        <form onSubmit={handleSubmitCode} className="space-y-4">
          <div>
            <label className="label" htmlFor="invite-code">Invite Code</label>
            <input
              id="invite-code"
              type="text"
              className="input uppercase tracking-widest font-mono"
              placeholder="e.g., ABC12345"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              maxLength={8}
              required
            />
            <p className="text-xs text-gray-500 mt-1">8-character code from your contractor or invite email</p>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="btn-primary w-full">Continue</button>
        </form>
      </div>
    )
  }

  // ── Validating spinner ────────────────────────────────────────────────────
  if (step === 'validating') {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <div className="h-8 w-8 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
        <p className="text-sm text-gray-500">Checking invite code…</p>
      </div>
    )
  }

  // ── Done — auto sign-in failed, show clear instructions ───────────────────
  if (step === 'done') {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-4 text-center">
          <p className="font-semibold text-green-800">Account created!</p>
          <p className="mt-1 text-sm text-green-700">Sign in with this email:</p>
          <p className="mt-1 font-mono text-sm font-bold text-green-900 break-all">{inviteEmail}</p>
          <p className="mt-1 text-xs text-green-600">Use the password you just set.</p>
        </div>
        <button
          type="button"
          className="btn-primary w-full"
          onClick={() => navigate('/login')}
        >
          Go to Sign In →
        </button>
      </div>
    )
  }

  // ── Signup form — email is locked from the invite ─────────────────────────
  return (
    <form onSubmit={handleSignup} className="space-y-4">
      {/* Locked email — can't be mistyped */}
      <div className="rounded-lg bg-brand-50 border border-brand-200 px-4 py-3">
        <p className="text-xs text-brand-600 mb-0.5">This invite was sent to</p>
        <p className="font-semibold text-brand-900 text-sm break-all">{inviteEmail}</p>
        <p className="text-xs text-brand-500 mt-0.5">You'll sign in with this email</p>
      </div>
      <div>
        <label className="label" htmlFor="inv-name">Your full name</label>
        <input
          id="inv-name"
          type="text"
          autoComplete="name"
          className="input"
          placeholder="e.g. Ravi Kumar"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="label" htmlFor="inv-password">Password</label>
        <input
          id="inv-password"
          type="password"
          autoComplete="new-password"
          className="input"
          placeholder="Min. 8 characters"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="label" htmlFor="inv-confirm">Confirm Password</label>
        <input
          id="inv-confirm"
          type="password"
          autoComplete="new-password"
          className="input"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? 'Creating account…' : 'Accept Invite & Sign In'}
      </button>
      <button
        type="button"
        className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
        onClick={() => { setStep('code'); setError(''); setInviteEmail('') }}
      >
        ← Back
      </button>
    </form>
  )
}
