import { useState } from 'react'
import { Phone, CheckCircle, Pencil } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import useAuthStore from '@/stores/authStore'
import PageHeader from '@/components/ui/PageHeader'

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

async function callEdge(fn, body, jwt) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${fn}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`,
    },
    body: JSON.stringify(body),
  })
  return res.json()
}

// ── Phone Verification Widget ────────────────────────────────────────────────
function PhoneSection({ profile, user, onSaved }) {
  const [step, setStep]       = useState('idle')   // idle | enter | otp
  const [phone, setPhone]     = useState(profile?.phone ?? '')
  const [newPhone, setNewPhone] = useState('')
  const [otp, setOtp]         = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [timer, setTimer]     = useState(0)

  const normPhone = (raw) => raw.replace(/[\s\-().]/g, '')

  const startTimer = () => {
    setTimer(60)
    const id = setInterval(() => {
      setTimer((t) => { if (t <= 1) { clearInterval(id); return 0 } return t - 1 })
    }, 1000)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data: { session } } = await supabase.auth.getSession()
    const data = await callEdge('link-phone', {
      action: 'send',
      phone_number: normPhone(newPhone),
    }, session.access_token)
    setLoading(false)
    if (data.error) { setError(data.error); return }
    setStep('otp')
    startTimer()
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data: { session } } = await supabase.auth.getSession()
    const data = await callEdge('link-phone', {
      action: 'verify',
      phone_number: normPhone(newPhone),
      otp_code: otp,
    }, session.access_token)
    setLoading(false)
    if (data.error) { setError(data.error); return }
    setPhone(newPhone)
    setStep('idle')
    setOtp('')
    onSaved()
  }

  const handleResend = async () => {
    if (timer > 0) return
    setError('')
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    const data = await callEdge('link-phone', {
      action: 'send',
      phone_number: normPhone(newPhone),
    }, session.access_token)
    setLoading(false)
    if (data.error) { setError(data.error) } else { startTimer() }
  }

  // ── idle: show current phone ─────────────────────────────────────────────
  if (step === 'idle') {
    return (
      <div className="space-y-2">
        <label className="label">Phone Number</label>
        {phone ? (
          <div className="flex items-center gap-2">
            <input className="input bg-gray-50 flex-1" value={phone} disabled />
            {profile?.phone_verified && (
              <span className="flex items-center gap-1 text-xs text-green-600 font-medium shrink-0">
                <CheckCircle className="h-4 w-4" /> Verified
              </span>
            )}
            <button
              type="button"
              onClick={() => { setNewPhone(phone); setStep('enter') }}
              className="shrink-0 text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
            >
              <Pencil className="h-3.5 w-3.5" /> Change
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setStep('enter')}
            className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            <Phone className="h-4 w-4" /> Add phone number
          </button>
        )}
        <p className="text-xs text-gray-400">Used for SMS OTP login.</p>
      </div>
    )
  }

  // ── enter phone ──────────────────────────────────────────────────────────
  if (step === 'enter') {
    return (
      <form onSubmit={handleSend} className="space-y-2">
        <label className="label">Phone Number</label>
        <input
          type="tel"
          autoComplete="tel"
          className="input"
          placeholder="+91 98765 43210"
          value={newPhone}
          onChange={(e) => setNewPhone(e.target.value)}
          required
        />
        <p className="text-xs text-gray-400">Include country code, e.g. +91 for India</p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2 pt-1">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Sending…' : 'Send OTP'}
          </button>
          <button
            type="button"
            onClick={() => { setStep('idle'); setError('') }}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    )
  }

  // ── otp entry ────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleVerify} className="space-y-2">
      <label className="label">Verification Code</label>
      <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-700">
        OTP sent to <span className="font-medium">{newPhone}</span>
      </div>
      <input
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
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center justify-between pt-1">
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Verifying…' : 'Verify'}
          </button>
          <button
            type="button"
            onClick={() => { setStep('enter'); setOtp(''); setError('') }}
            className="btn-secondary"
          >
            Back
          </button>
        </div>
        <button
          type="button"
          onClick={handleResend}
          disabled={timer > 0 || loading}
          className={`text-sm font-medium transition-colors ${timer > 0 ? 'text-gray-400' : 'text-brand-600 hover:text-brand-700'}`}
        >
          {timer > 0 ? `Resend in ${timer}s` : 'Resend'}
        </button>
      </div>
    </form>
  )
}

// ── Main Settings Page ───────────────────────────────────────────────────────
export default function Settings() {
  const { profile, fetchProfile, user } = useAuthStore()
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [saving, setSaving]    = useState(false)
  const [success, setSuccess]  = useState(false)
  const [error, setError]      = useState(null)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const { error: err } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id)
      if (err) throw err
      await fetchProfile(user.id)
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-lg">
      <PageHeader title="Settings" description="Manage your profile and account preferences." />

      <div className="card p-6 space-y-6">
        <h2 className="text-sm font-semibold text-gray-900">Profile</h2>

        {success && (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            Profile updated successfully.
          </div>
        )}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input bg-gray-50" value={user?.email ?? ''} disabled />
          </div>
          <div>
            <label className="label">Full name</label>
            <input
              className="input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="label">Role</label>
            <input className="input bg-gray-50 capitalize" value={profile?.role?.replace('_', ' ') ?? ''} disabled />
          </div>
          {profile?.tenant?.name && (
            <div>
              <label className="label">Company</label>
              <input className="input bg-gray-50" value={profile.tenant.name} disabled />
            </div>
          )}
          <div className="flex justify-end pt-1">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>

        <hr className="border-gray-100" />

        <PhoneSection
          profile={profile}
          user={user}
          onSaved={() => fetchProfile(user.id)}
        />
      </div>
    </div>
  )
}
