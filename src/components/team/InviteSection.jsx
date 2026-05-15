import { useState, useEffect } from 'react'
import { Mail, Send, Clock, CheckCircle, Copy, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const ASSIGNABLE_ROLES = [
  { value: 'site_manager', label: 'Site Manager' },
  { value: 'supervisor',   label: 'Supervisor' },
  { value: 'store_keeper', label: 'Store Keeper' },
]

const ROLE_LABELS = {
  site_manager: 'Site Manager',
  supervisor:   'Supervisor',
  store_keeper: 'Store Keeper',
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handle = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      type="button"
      onClick={handle}
      className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

export default function InviteSection({ sites = [] }) {
  const [email,   setEmail]   = useState('')
  const [role,    setRole]    = useState('supervisor')
  const [siteId,  setSiteId]  = useState(sites[0]?.id ?? '')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [sent,    setSent]    = useState([])

  useEffect(() => {
    if (sites.length > 0 && !siteId) setSiteId(sites[0].id)
  }, [sites, siteId])

  const handleInvite = async (e) => {
    e.preventDefault()
    setError(null)
    if (!email.trim()) return

    setLoading(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
      const site  = sites.find(s => s.id === siteId)

      const { data, error: fnError } = await supabase.functions.invoke('invite-user', {
        body: { email: email.trim(), role, site_id: siteId, tenant_id: site?.tenant_id },
        headers: { Authorization: `Bearer ${token}` },
      })

      if (fnError) throw fnError
      if (data?.error) throw new Error(data.error)

      setSent(prev => [{
        id:          Date.now(),
        email:       email.trim(),
        role,
        site:        site?.name ?? 'Unknown site',
        invite_code: data.invite_code,
        sent:        'Just now',
        accepted:    false,
      }, ...prev])

      setEmail('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">

      {/* ── Send invite form ───────────────────────────────────────────────── */}
      <div className="card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Mail className="h-4 w-4 text-brand-600" />
          <h2 className="font-semibold text-gray-900">Invite a Team Member</h2>
        </div>
        <p className="mb-4 text-sm text-gray-500">
          They'll get an invite code to create their account. You can also share the code directly over WhatsApp.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="label">Email address *</label>
            <input
              type="email"
              required
              className="input"
              placeholder="supervisor@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Role *</label>
              <select className="input" value={role} onChange={e => setRole(e.target.value)}>
                {ASSIGNABLE_ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Site *</label>
              <select className="input" value={siteId} onChange={e => setSiteId(e.target.value)}>
                {sites.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" disabled={loading || sites.length === 0} className="btn-primary flex items-center gap-2">
            <Send className="h-4 w-4" />
            {loading ? 'Sending…' : 'Send Invite'}
          </button>
        </form>
      </div>

      {/* ── Sent invites ───────────────────────────────────────────────────── */}
      {sent.length > 0 && (
        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">Sent Invites</h3>
          <div className="space-y-3">
            {sent.map(inv => (
              <div key={inv.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{inv.email}</p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {ROLE_LABELS[inv.role] ?? inv.role} · {inv.site} · {inv.sent}
                    </p>
                  </div>
                  {inv.accepted ? (
                    <span className="flex shrink-0 items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-600">
                      <CheckCircle className="h-3 w-3" /> Accepted
                    </span>
                  ) : (
                    <span className="flex shrink-0 items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600">
                      <Clock className="h-3 w-3" /> Pending
                    </span>
                  )}
                </div>

                {/* Invite code box */}
                {inv.invite_code && !inv.accepted && (
                  <div className="mt-3 flex items-center justify-between rounded-lg border border-brand-100 bg-brand-50 px-3 py-2">
                    <div>
                      <p className="text-xs text-brand-600 mb-0.5">Invite code — share this with them</p>
                      <p className="font-mono text-base font-bold tracking-widest text-brand-800">{inv.invite_code}</p>
                    </div>
                    <CopyButton text={inv.invite_code} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
