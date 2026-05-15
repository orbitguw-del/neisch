import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import useAuthStore from '@/stores/authStore'
import { Phone } from 'lucide-react'

export default function PhoneEnrollmentCard() {
  const { profile, user, fetchProfile } = useAuthStore()
  const enrolled = !!profile?.phone

  const [step, setStep] = useState('idle')  // 'idle' | 'phone' | 'otp'
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const reset = () => {
    setStep('idle')
    setPhone('')
    setOtp('')
    setError('')
    setMessage('')
  }

  const handleSend = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error: sendError } = await supabase.functions.invoke('enroll-phone-otp', {
      body: { phone_number: phone },
    })
    setLoading(false)
    if (sendError) {
      setError(sendError.message || 'Failed to send code.')
      return
    }
    setMessage(`Code sent to ${phone}.`)
    setStep('otp')
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error: verifyError } = await supabase.functions.invoke('verify-phone-enrollment', {
      body: { phone_number: phone, otp_code: otp },
    })
    setLoading(false)
    if (verifyError) {
      setError('Invalid or expired code.')
      return
    }
    await fetchProfile(user.id)
    reset()
    setMessage('Phone enrolled.')
  }

  return (
    <div className="card p-6">
      <h2 className="mb-1 text-sm font-semibold text-gray-900">Phone number</h2>
      <p className="mb-4 text-xs text-gray-500">
        Required to sign in with SMS OTP. Once enrolled, your phone can't be changed without support.
      </p>

      {message && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {enrolled ? (
        <div>
          <label className="label">Verified phone</label>
          <input className="input bg-gray-50" value={profile.phone} disabled />
          <p className="mt-2 text-xs text-gray-500">
            To change this number, contact support.
          </p>
        </div>
      ) : step === 'idle' ? (
        <button
          type="button"
          onClick={() => setStep('phone')}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Phone className="h-4 w-4" />
          Add phone number
        </button>
      ) : step === 'phone' ? (
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="label" htmlFor="enroll-phone">Phone (E.164 format)</label>
            <input
              id="enroll-phone"
              type="tel"
              className="input"
              placeholder="+919876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\s/g, ''))}
              required
            />
            <p className="mt-1 text-xs text-gray-500">Include country code, no spaces (e.g. +91 for India).</p>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Sending…' : 'Send code'}
            </button>
            <button type="button" onClick={reset} className="text-sm text-gray-500 hover:text-gray-700 px-3">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="label" htmlFor="enroll-otp">6-digit code</label>
            <input
              id="enroll-otp"
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
          <div className="flex gap-2">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Verifying…' : 'Verify & enroll'}
            </button>
            <button type="button" onClick={() => setStep('phone')} className="text-sm text-gray-500 hover:text-gray-700 px-3">
              ← Change number
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
