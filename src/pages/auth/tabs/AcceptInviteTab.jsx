import { useState, useEffect } from 'react'
import useAuthStore from '@/stores/authStore'
import { useNavigate, useSearchParams } from 'react-router-dom'

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Use raw fetch so we always get the response body, whether 200 or 4xx
async function callInvite(body) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/sign-up-with-invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  })
  return res.json()
}

export default function AcceptInviteTab() {
  const [searchParams] = useSearchParams()
  const [email,           setEmail]           = useState('')
  const [fullName,        setFullName]        = useState('')
  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [inviteCode,      setInviteCode]      = useState(searchParams.get('invite') || '')
  const [step,            setStep]            = useState('code')
  const [loading,         setLoading]         = useState(false)
  const [error,           setError]           = useState('')
  const { signIn } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (inviteCode) setStep('signup')
  }, [])

  const handleSubmitCode = (e) => {
    e.preventDefault()
    // Codes are always 8 characters
    if (inviteCode.trim().length < 8) {
      setError('Invite code must be 8 characters — check the code your contractor sent')
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

    // Use raw fetch so we always get the JSON body (even on 4xx errors)
    const data = await callInvite({
      email:        email.trim(),
      password,
      full_name:    fullName.trim() || undefined,
      invite_code:  inviteCode.trim(),
    })

    if (data.error) {
      setError(data.error)
      setLoading(false)
      return
    }

    // Account created — sign in immediately
    try {
      await signIn({ email: email.trim(), password })
      navigate('/dashboard')
    } catch {
      // Account exists but sign-in failed — prompt manual login
      setError('Account created! Please sign in with your email and password.')
      setLoading(false)
    }
  }

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
            <p className="text-xs text-gray-500 mt-1">
              8-character code from your contractor or invite email
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
        <p className="text-xs text-gray-400 mt-1">Must match the email your contractor invited</p>
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
        onClick={() => { setStep('code'); setError('') }}
      >
        ← Back
      </button>
    </form>
  )
}
