import { useState, useEffect } from 'react'
import {
  Phone, CheckCircle, Pencil, User, Building2,
  Mail, Shield, LogOut, Users, HardHat, Copy, Check,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import useAuthStore from '@/stores/authStore'
import PageHeader from '@/components/ui/PageHeader'
import HelpDesk from '@/components/auth/HelpDesk'

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

async function callEdge(fn, body, jwt) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${fn}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt ?? SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  })
  return res.json()
}

const ROLE_LABEL = {
  superadmin:   'Super Admin',
  contractor:   'Contractor',
  site_manager: 'Site Manager',
  supervisor:   'Supervisor',
  store_keeper: 'Store Keeper',
}

const ROLE_COLOR = {
  superadmin:   'bg-purple-100 text-purple-700',
  contractor:   'bg-amber-100 text-amber-700',
  site_manager: 'bg-blue-100 text-blue-700',
  supervisor:   'bg-green-100 text-green-700',
  store_keeper: 'bg-gray-100 text-gray-700',
}

// ── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, size = 'lg' }) {
  const initials = (name ?? '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const sizeClass = size === 'lg'
    ? 'h-20 w-20 text-2xl'
    : 'h-12 w-12 text-base'

  return (
    <div className={`${sizeClass} rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center font-bold text-white shadow-md flex-shrink-0`}>
      {initials}
    </div>
  )
}

// ── Section card ─────────────────────────────────────────────────────────────
function Section({ icon: Icon, title, children }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-gray-100 px-5 py-4 bg-gray-50/60">
        <Icon className="h-4 w-4 text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

// ── Read-only field ───────────────────────────────────────────────────────────
function Field({ label, value, copyable }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex items-center gap-2">
        <input className="input bg-gray-50 flex-1" value={value ?? '—'} disabled />
        {copyable && value && (
          <button type="button" onClick={handleCopy}
            className="shrink-0 rounded-lg border border-gray-200 bg-white p-2 text-gray-400 hover:text-gray-600 transition-colors">
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Phone Verification ────────────────────────────────────────────────────────
function PhoneSection({ profile, user, onSaved }) {
  const [step, setStep]         = useState('idle')
  const [phone]                 = useState(profile?.phone ?? '')
  const [newPhone, setNewPhone] = useState('')
  const [otp, setOtp]           = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [timer, setTimer]       = useState(0)

  const normPhone = (raw) => raw.replace(/[\s\-().]/g, '')
  const startTimer = () => {
    setTimer(60)
    const id = setInterval(() => {
      setTimer((t) => { if (t <= 1) { clearInterval(id); return 0 } return t - 1 })
    }, 1000)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { data: { session } } = await supabase.auth.getSession()
    const data = await callEdge('link-phone', { action: 'send', phone_number: normPhone(newPhone) }, session.access_token)
    setLoading(false)
    if (data.error) { setError(data.error); return }
    setStep('otp'); startTimer()
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { data: { session } } = await supabase.auth.getSession()
    const data = await callEdge('link-phone', { action: 'verify', phone_number: normPhone(newPhone), otp_code: otp }, session.access_token)
    setLoading(false)
    if (data.error) { setError(data.error); return }
    setStep('idle'); setOtp(''); onSaved()
  }

  if (step === 'idle') {
    return (
      <div className="space-y-2">
        <label className="label">Phone Number</label>
        {phone ? (
          <div className="flex items-center gap-2">
            <input className="input bg-gray-50 flex-1" value={phone} disabled />
            {profile?.phone_verified && (
              <span className="flex items-center gap-1 text-xs font-medium text-green-600 shrink-0">
                <CheckCircle className="h-4 w-4" /> Verified
              </span>
            )}
            <button type="button" onClick={() => { setNewPhone(phone); setStep('enter') }}
              className="shrink-0 text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
              <Pencil className="h-3.5 w-3.5" /> Change
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setStep('enter')}
            className="flex items-center gap-2 rounded-lg border-2 border-dashed border-gray-200 px-4 py-3 text-sm text-gray-500 hover:border-brand-300 hover:text-brand-600 transition-colors w-full">
            <Phone className="h-4 w-4" />
            Add phone number for SMS OTP login
          </button>
        )}
      </div>
    )
  }

  if (step === 'enter') {
    return (
      <form onSubmit={handleSend} className="space-y-3">
        <label className="label">New Phone Number</label>
        <input type="tel" autoComplete="tel" className="input" placeholder="+91 98765 43210"
          value={newPhone} onChange={(e) => setNewPhone(e.target.value)} required />
        <p className="text-xs text-gray-400">Include country code, e.g. +91 for India</p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Sending…' : 'Send OTP'}</button>
          <button type="button" onClick={() => { setStep('idle'); setError('') }} className="btn-secondary">Cancel</button>
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={handleVerify} className="space-y-3">
      <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-700">
        OTP sent to <span className="font-medium">{newPhone}</span>
      </div>
      <label className="label">6-digit OTP</label>
      <input type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6}
        className="input text-center tracking-[0.5em] text-lg font-mono" placeholder="000000"
        value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} required />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Verifying…' : 'Verify'}</button>
          <button type="button" onClick={() => { setStep('enter'); setOtp(''); setError('') }} className="btn-secondary">Back</button>
        </div>
        <button type="button" onClick={handleVerify} disabled={timer > 0 || loading}
          className={`text-sm font-medium ${timer > 0 ? 'text-gray-400' : 'text-brand-600 hover:text-brand-700'}`}>
          {timer > 0 ? `Resend in ${timer}s` : 'Resend'}
        </button>
      </div>
    </form>
  )
}

// ── Company Section (contractor only) ────────────────────────────────────────
function CompanySection({ profile }) {
  const [name, setName]     = useState(profile?.tenant?.name ?? '')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]   = useState(null)
  const [teamCount, setTeamCount] = useState(null)
  const { fetchProfile, user } = useAuthStore()

  useEffect(() => {
    if (!profile?.tenant_id) return
    supabase.from('profiles').select('id', { count: 'exact', head: true })
      .eq('tenant_id', profile.tenant_id)
      .then(({ count }) => setTeamCount(count ?? 0))
  }, [profile?.tenant_id])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true); setError(null); setSuccess(false)
    const { error: err } = await supabase
      .from('tenants')
      .update({ name: name.trim() })
      .eq('id', profile.tenant_id)
    if (err) { setError(err.message) }
    else { await fetchProfile(user.id); setSuccess(true) }
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          Company name updated.
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 sm:col-span-1">
          <Field label="Plan" value={profile?.tenant?.plan ?? 'Free'} />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="label">Team members</label>
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-semibold text-gray-900">
              {teamCount === null ? '…' : teamCount}
            </span>
            <span className="text-xs text-gray-500">people in your company</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-3">
        <div>
          <label className="label">Company / Firm name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sharma Constructions Pvt Ltd" />
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Update company name'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ── Main Settings Page ────────────────────────────────────────────────────────
export default function Settings() {
  const { profile, fetchProfile, user, signOut } = useAuthStore()
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [saving, setSaving]    = useState(false)
  const [success, setSuccess]  = useState(false)
  const [error, setError]      = useState(null)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true); setError(null); setSuccess(false)
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

  const role     = profile?.role
  const isContractor = role === 'contractor'

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Settings" description="Manage your profile and account." />

      {/* ── Profile hero ── */}
      <div className="card p-5">
        <div className="flex items-center gap-4">
          <Avatar name={profile?.full_name} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900 truncate">
                {profile?.full_name ?? 'Your Name'}
              </h2>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_COLOR[role] ?? 'bg-gray-100 text-gray-600'}`}>
                {ROLE_LABEL[role] ?? role}
              </span>
            </div>
            <p className="text-sm text-gray-500 truncate">{user?.email}</p>
            {profile?.tenant?.name && (
              <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
                <Building2 className="h-3.5 w-3.5" />
                {profile.tenant.name}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Personal info ── */}
      <Section icon={User} title="Personal Information">
        {success && (
          <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            Profile updated successfully.
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
        )}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Full name</label>
              <input className="input" value={fullName}
                onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" />
            </div>
            <Field label="Email address" value={user?.email} copyable />
            <div>
              <label className="label">Role</label>
              <div className={`flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 ${ROLE_COLOR[role] ?? 'bg-gray-50'}`}>
                <HardHat className="h-4 w-4 opacity-60" />
                <span className="text-sm font-semibold">{ROLE_LABEL[role] ?? role}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </Section>

      {/* ── Phone ── */}
      <Section icon={Phone} title="Phone & SMS Login">
        <PhoneSection profile={profile} user={user} onSaved={() => fetchProfile(user.id)} />
      </Section>

      {/* ── Company (contractor only) ── */}
      {isContractor && (
        <Section icon={Building2} title="Company">
          <CompanySection profile={profile} />
        </Section>
      )}

      {/* ── Account ── */}
      <Section icon={Shield} title="Account">
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-900">Sign-in method</p>
              <p className="text-xs text-gray-500">
                {user?.app_metadata?.provider === 'google' ? 'Google OAuth' : 'Email & Password'}
              </p>
            </div>
            <Mail className="h-5 w-5 text-gray-300" />
          </div>

          <button
            type="button"
            onClick={() => signOut()}
            className="flex w-full items-center justify-between rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
          >
            <span>Sign out</span>
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </Section>

      {/* ── App info ── */}
      <div className="text-center text-xs text-gray-400 pb-4 space-y-1">
        <p>Storey — Construction Management</p>
        <p>v1.0.2 · <a href="/#/privacy" className="hover:underline">Privacy Policy</a></p>
      </div>

      <div className="card p-6">
        <HelpDesk collapsedLabel="Contact support" />
      </div>
    </div>
  )
}
