import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import useAuthStore from '@/stores/authStore'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function AcceptInviteTab() {
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [inviteCode, setInviteCode] = useState(searchParams.get('invite') || '')
  const [step, setStep] = useState('code')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (inviteCode) setStep('signup')
  }, [])

  const handleSubmitCode = (e) => {
    e.preventDefault()
    if (inviteCode.trim().length < 6) {
      setError('Invite code must be at least 6 characters')
      return
    }
    setError('')
    setStep('signup')
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    setError('')

    const { error: signupError } = await supabase.functions.invoke('sign-up-with-invite', {
      body: { email, password, invite_code: inviteCode.trim() },
    })

    if (signupError) {
      setError(signupError.message || 'Failed to accept invite')
      setLoading(false)
      return
    }

    try {
      await signIn({ email, password })
      navigate('/dashboard')
    } catch {
      setError('Account created. Please sign in with your email and password.')
      setLoading(false)
    }
  }

  if (step === 'code') {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-brand-50 border border-brand-200 px-4 py-3 text-sm text-brand-700">
          <p className="font-medium mb-1">📩 Invited by a contractor?</p>
          <p className="text-brand-600">Enter your invite code from the email your contractor sent.</p>
        </div>
        <form onSubmit={handleSubmitCode} className="space-y-4">
          <div>
            <label className="label" htmlFor="invite-code">Invite Code</label>
            <input
              id="invite-code"
              type="text"
              className="input uppercase tracking-widest"
              placeholder="e.g., ABC12345"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Find this code in your invite email from Storey
            </p>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="btn-primary w-full">
            Continue
          </button>
        </form>
      </div>
    )
  }

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      <div>
        <label className="label" htmlFor="inv-email">Email</label>
        <input
          id="inv-email"
          type="email"
          autoComplete="email"
          className="input"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          placeholder="••••••••"
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
        onClick={() => { setStep('code'); setError('') }}
      >
        ← Back
      </button>
    </form>
  )
}
