import { useEffect, useState } from 'react'
import { Mail, Clock, CheckCircle, XCircle, RotateCw, Trash2, MessageCircle } from 'lucide-react'

function whatsappLink(inviteCode, email) {
  const msg = `You've been invited to join Storey — a construction site management app.\n\nYour login email: *${email}*\nInvite code: *${inviteCode}*\n\nDownload: https://storeyinfra.com\nOpen the app → Login → tap "Accept Invite" → enter the code above.\n\nCode expires in 7 days.`
  return `https://wa.me/?text=${encodeURIComponent(msg)}`
}
import { supabase } from '@/lib/supabase'
import useAuthStore from '@/stores/authStore'
import StatCard from '@/components/ui/StatCard'
import PrintButton from '@/components/print/PrintButton'
import PrintHeader from '@/components/print/PrintHeader'
import { formatDate, cn } from '@/lib/utils'

const ROLE_LABELS = {
  site_manager: 'Site Manager',
  supervisor:   'Supervisor',
  store_keeper: 'Store Keeper',
}

function inviteStatus(inv) {
  if (inv.accepted_at) return 'accepted'
  if (new Date(inv.expires_at) < new Date()) return 'expired'
  return 'pending'
}

const STATUS_STYLE = {
  accepted: 'bg-green-50 text-green-700 border-green-200',
  expired:  'bg-gray-100 text-gray-500 border-gray-200',
  pending:  'bg-amber-50 text-amber-700 border-amber-200',
}
const STATUS_LABEL = { accepted: 'Accepted', expired: 'Expired', pending: 'Pending' }

export default function InvitesReportTab({ tenantId }) {
  const role = useAuthStore((s) => s.profile?.role)
  const canManage = ['contractor', 'superadmin'].includes(role)

  const [invites, setInvites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [busyId,  setBusyId]  = useState(null)   // invite id mid-action
  const [actionError, setActionError] = useState(null)
  const [flashId, setFlashId] = useState(null)   // invite id that just resent OK

  useEffect(() => {
    if (!tenantId) return
    let cancelled = false
    setLoading(true)
    setError(null)
    supabase
      .from('pending_invites')
      .select('id, email, role, site_id, invite_code, accepted_at, expires_at, created_at, sites(name)')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) setError(error.message)
        else setInvites(data ?? [])
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [tenantId])

  const handleResend = async (inv) => {
    setBusyId(inv.id); setActionError(null); setFlashId(null)
    try {
      const { data, error: fnErr } = await supabase.functions.invoke('invite-user', {
        body: { email: inv.email, role: inv.role, site_id: inv.site_id, tenant_id: tenantId },
      })
      if (fnErr || data?.error) throw new Error(data?.error || fnErr.message)
      // invite-user regenerates the code + resets expiry to now + 7 days
      const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      setInvites((list) => list.map((i) =>
        i.id === inv.id
          ? { ...i, invite_code: data.invite_code ?? i.invite_code, expires_at: newExpiry }
          : i,
      ))
      setFlashId(inv.id)
      setTimeout(() => setFlashId((cur) => (cur === inv.id ? null : cur)), 3000)
    } catch (e) {
      setActionError(`Resend failed: ${e.message}`)
    } finally {
      setBusyId(null)
    }
  }

  const handleRevoke = async (inv) => {
    if (!window.confirm(`Revoke the invite for ${inv.email}? The code will stop working.`)) return
    setBusyId(inv.id); setActionError(null)
    try {
      const { error: delErr } = await supabase.from('pending_invites').delete().eq('id', inv.id)
      if (delErr) throw delErr
      setInvites((list) => list.filter((i) => i.id !== inv.id))
    } catch (e) {
      setActionError(`Revoke failed: ${e.message}`)
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <p className="text-sm text-gray-500">Loading invites…</p>
  if (error)   return <p className="text-sm text-red-600">{error}</p>

  const counts = invites.reduce(
    (acc, inv) => { acc[inviteStatus(inv)]++; return acc },
    { pending: 0, accepted: 0, expired: 0 },
  )

  return (
    <div className="space-y-6">
      <PrintHeader title="Team Invites" subtitle={`${invites.length} invites total`} />

      <div className="no-print flex justify-end">
        <PrintButton label="Print invites" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Invites" value={invites.length}  icon={Mail}        color="brand" />
        <StatCard label="Pending"       value={counts.pending}  icon={Clock}       color="sage" />
        <StatCard label="Accepted"      value={counts.accepted} icon={CheckCircle} color="green" />
        <StatCard label="Expired"       value={counts.expired}  icon={XCircle}     color="red" />
      </div>

      {actionError && (
        <p className="no-print text-sm text-red-600 rounded-lg bg-red-50 border border-red-200 px-3 py-2">{actionError}</p>
      )}

      {invites.length === 0 ? (
        <p className="text-sm text-gray-500">No invites have been sent yet.</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Site</th>
                <th className="px-4 py-3">Invite Code</th>
                <th className="px-4 py-3">Sent</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3">Status</th>
                {canManage && <th className="px-4 py-3 no-print text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {invites.map((inv) => {
                const status = inviteStatus(inv)
                const isPending = status === 'pending'
                const isExpired = status === 'expired'
                const busy = busyId === inv.id
                return (
                  <tr key={inv.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-gray-900">{inv.email}</td>
                    <td className="px-4 py-3 text-gray-600">{ROLE_LABELS[inv.role] ?? inv.role}</td>
                    <td className="px-4 py-3 text-gray-600">{inv.sites?.name ?? '—'}</td>
                    <td className="px-4 py-3 font-mono text-gray-700">
                      {inv.invite_code}
                      {flashId === inv.id && <span className="ml-2 text-xs font-sans font-semibold text-green-600">Resent ✓</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(inv.created_at)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(inv.expires_at)}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold',
                        STATUS_STYLE[status],
                      )}>
                        {STATUS_LABEL[status]}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-4 py-3 no-print">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Resend regenerates the code + re-sends; useful for pending OR expired */}
                          {(isPending || isExpired) && (
                            <button
                              type="button"
                              onClick={() => handleResend(inv)}
                              disabled={busy}
                              title="Resend invite (new code, +7 days)"
                              className="inline-flex items-center gap-1 rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 disabled:opacity-50"
                            >
                              <RotateCw className={cn('h-3.5 w-3.5', busy && 'animate-spin')} />
                              Resend
                            </button>
                          )}
                          {(isPending || isExpired) && inv.invite_code && (
                            <a
                              href={whatsappLink(inv.invite_code, inv.email)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Share invite code via WhatsApp"
                              className="inline-flex items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-2.5 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                              WhatsApp
                            </a>
                          )}
                          {status !== 'accepted' && (
                            <button
                              type="button"
                              onClick={() => handleRevoke(inv)}
                              disabled={busy}
                              title="Revoke invite"
                              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Revoke
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
