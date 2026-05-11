import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const SUPABASE_URL     = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

async function callEdge(fn, body) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${fn}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  })
  return res.json()
}

export default function SMSOTPLogin() {
  const [step,    setStep]    = useState('phone') // 'phone' | 'otp'
  const [phone,   setPhone]   = useState('')
  const [otp,     setOtp]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [timer,   setTimer]   = useState(0)
  const navigate = useNavigate()

  const startResendTimer = () => {
    setTimer(60)
    const interval = setInterval(() => {
      setTimer((t) => { if (t <= 1) { clearInterval(interval); return 0 } return t - 1 })
    }, 1000)
  }

  // Normalise phone: strip spaces/dashes so "+91 7002 500154" → "+917002500154"
  const normPhone = (raw) => raw.replace(/[\s\-().]/g, '')

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const data = await callEdge('send-sms-otp', { phone_number: normPhone(phone) })

    setLoading(false)
    if (data.error) { setError(data.error); return }
    setStep('otp')
    startResendTimer()
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const isNative = typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()

    const data = await callEdge('verify-sms-otp', {
      phone_number: normPhone(phone),
      otp_code: otp,
      platform: isNative ? 'native' : 'web',
    })

    setLoading(false)
    if (data.error) { setError('Invalid or expired OTP. Please try again.'); return }

    if (data.session) {
      // Edge function returned a session directly (future-proofing)
      window.location.replace('/#/dashboard')
      return
    }

    if (data.hashed_token) {
      // ── Preferred path: verify the token directly, no browser needed ─────────
      // Works the same on web and native — no redirect, no Chrome tab.
      setLoading(true)
      const { error: verifyErr } = await supabase.auth.verifyOtp({
        token_hash: data.hashed_token,
        type: 'magiclink',
      })
      setLoading(false)
      if (verifyErr) {
        setError('Could not sign in: ' + verifyErr.message)
        return
      }
      navigate('/dashboard', { replace: true })
      return
    }

    if (data.magic_link) {
      // ── Fallback: open magic link in browser (web only) ──────────────────────
      window.location.href = data.magic_link
      return
    }

    setError('Verification succeeded but session could not be created. Please sign in with email.')
  }

  const handleResend = async () => {
    if (timer > 0) return
    setError('')
    setLoading(true)
    const data = await callEdge('send-sms-otp', { phone_number: normPhone(phone) })
    setLoading(false)
    if (data.error) { setError('Failed to resend OTP.') } else { startResendTimer() }
  }

  if (step === 'phone') {
    return (
      <form onSubmit={handleSendOTP} className="space-y-3">
        <div>
          <label className="label" htmlFor="sms-phone">Phone Number</label>
          <input
            id="sms-phone"
            type="tel"
            autoComplete="tel"
            className="input"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <p className="text-xs text-gray-500 mt-1">Include country code, e.g. +91 for India</p>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <Phone className="h-4 w-4" />
          {loading ? 'Sending OTP…' : 'Continue with Phone OTP'}
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={handleVerifyOTP} className="space-y-3">
      <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
        OTP sent to <span className="font-medium">{phone}</span>. Check your messages.
      </div>
      <div>
        <label className="label" htmlFor="sms-otp">6-digit OTP</label>
        <input
          id="sms-otp"
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          className="input text-center tracking-[0.5em] text-lg font-mono"
          placeholder="000000"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          required
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? 'Verifying…' : 'Verify OTP'}
      </button>
      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          className="text-gray-500 hover:text-gray-700 transition-colors"
          onClick={() => { setStep('phone'); setOtp(''); setError('') }}
        >
          ← Change number
        </button>
        <button
          type="button"
          onClick={handleResend}
          disabled={timer > 0 || loading}
          className={`font-medium transition-colors ${timer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-brand-600 hover:text-brand-700'}`}
        >
          {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
        </button>
      </div>
    </form>
  )
}
