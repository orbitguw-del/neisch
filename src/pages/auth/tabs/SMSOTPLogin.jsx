import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'
import { Phone } from 'lucide-react'

export default function SMSOTPLogin() {
  const [step, setStep] = useState('email')  // 'email' | 'phone' | 'otp'
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [timer, setTimer] = useState(0)
  const navigate = useNavigate()

  const startResendTimer = () => {
    setTimer(60)
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) { clearInterval(interval); return 0 }
        return t - 1
      })
    }, 1000)
  }

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: sendError } = await supabase.functions.invoke('send-sms-otp', {
      body: { email, phone_number: phone },
    })

    setLoading(false)
    if (sendError) {
      setError(sendError.message || 'Failed to send OTP. Check the number and try again.')
      return
    }

    setStep('otp')
    startResendTimer()
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: verifyError } = await supabase.functions.invoke('verify-sms-otp', {
      body: { email, phone_number: phone, otp_code: otp },
    })

    if (verifyError || !data?.success) {
      setError('Invalid or expired OTP. Please try again.')
      setLoading(false)
      return
    }

    // Use the magic link returned by the edge function to create a real session
    if (data.magic_link) {
      const url = new URL(data.magic_link)
      const token_hash = url.searchParams.get('token_hash')
      const type = url.searchParams.get('type') ?? 'magiclink'

      if (token_hash) {
        const { error: sessionError } = await supabase.auth.verifyOtp({ token_hash, type })
        if (!sessionError) {
          navigate('/dashboard')
          return
        }
      }
    }

    // Fallback: if magic link fails, user needs to sign in with password
    setError('Phone verified. Please sign in with your email and password.')
    setLoading(false)
  }

  const handleResend = async () => {
    if (timer > 0) return
    setError('')
    setLoading(true)
    const { error: sendError } = await supabase.functions.invoke('send-sms-otp', {
      body: { email, phone_number: phone },
    })
    setLoading(false)
    if (sendError) {
      setError('Failed to resend OTP.')
    } else {
      startResendTimer()
    }
  }

  if (step === 'email') {
    return (
      <form onSubmit={(e) => { e.preventDefault(); setError(''); setStep('phone') }} className="space-y-4">
        <div>
          <label className="label" htmlFor="sms-email">Email</label>
          <input
            id="sms-email"
            type="email"
            autoComplete="email"
            className="input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            We'll look up your account then send an OTP to your registered phone.
          </p>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
          <Phone className="h-4 w-4" />
          Continue with Phone OTP
        </button>
      </form>
    )
  }

  if (step === 'phone') {
    return (
      <form onSubmit={handleSendOTP} className="space-y-4">
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
          <p className="text-xs text-gray-500 mt-1">
            Include country code, e.g. +91 for India
          </p>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Sending OTP…' : 'Send OTP'}
        </button>
        <button
          type="button"
          className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
          onClick={() => { setStep('email'); setError('') }}
        >
          ← Back
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={handleVerifyOTP} className="space-y-4">
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
          className={`font-medium transition-colors ${
            timer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-brand-600 hover:text-brand-700'
          }`}
        >
          {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
        </button>
      </div>
    </form>
  )
}
