import { useState, useEffect } from 'react'
import { Mail, Send, Clock, CheckCircle } from 'lucide-react'
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

export default function InviteSection({ sites = [] }) {
  const [email,   setEmail]   = useState('')
  const [role,    setRole]    = useState('supervisor')
  const [siteId,  setSiteId]  = useState(sites[0]?.id ?? '')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [success, setSuccess] = useState(null)
  const [sent,    setSent]    = useState([])

  // Sync siteId once sites load (they may arrive after initial render)
  useEffect(() => {
    if (sites.length > 0 && !siteId) {
      setSiteId(sites[0].id)
    }
  }, [sites, siteId])

  const handleInvite = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!email.trim()) return

    setLoading(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token

      const { data, error: fnError } = await supabase.functions.invoke('invite-user', {
        body: { email: email.trim(), role, site_id: siteId, tenant_id: sites.find(s => s.id === siteId)?.tenant_id },
        headers: { Authorization: `Bearer ${token}` },
      })

      if (fnError) throw fnError
      if (data?.error) throw new Error(data.error)

      const site = sites.find(s => s.id === siteId)
      setSent(prev => [{
        id: Date.now(),
        email: email.trim(),
        role,
        site: site?.name ?? 'Unknown site',
        status: 'pending',
        sent: 'Just now',
      }, ...prev])

      setSuccess(`Invite sent to ${email.trim()}`)
      setEmail('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRevoke = (id) => {
    setSent(prev => prev.filter(i => i.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="h-5 w-5 text-brand-600" />
          <h2 className="text-lg font-semibold text-gray-900">Invite Team Member</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          They will receive an email invite. Role and site access are pre-assigned.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="label">Email Address *</label>
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
              <label className="label">Assign to Site *</label>
              <select className="input" value={siteId} onChange={e => setSiteId(e.target.value)}>
                {sites.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            <Send className="h-4 w-4" />
            {loading ? 'Sending...' : 'Send Invite'}
          </button>
        </form>
      </div>

      {sent.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Sent Invites</h3>
          <div className="space-y-3">
            {sent.map(inv => (
              <div key={inv.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{inv.email}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {ROLE_LABELS[inv.role] ?? inv.role} - {inv.site} - {inv.sent}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {inv.status === 'accepted' ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 border border-green-200 rounded-full px-2.5 py-1">
                      <CheckCircle className="h-3 w-3" /> Accepted
                    </span>
                  ) : (
                    <>
                      <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
                        <Clock className="h-3 w-3" /> Pending
                      </span>
                      <button type="button" onClick={() => handleRevoke(inv.id)} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                        Revoke
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

