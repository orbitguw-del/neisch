import { useEffect, useState } from 'react'
import { Mail, Clock, CheckCircle, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
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
  const [invites, setInvites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!tenantId) return
    let cancelled = false
    setLoading(true)
    setError(null)
    supabase
      .from('pending_invites')
      .select('id, email, role, invite_code, accepted_at, expires_at, created_at, sites(name)')
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
              </tr>
            </thead>
            <tbody>
              {invites.map((inv) => {
                const status = inviteStatus(inv)
                return (
                  <tr key={inv.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-gray-900">{inv.email}</td>
                    <td className="px-4 py-3 text-gray-600">{ROLE_LABELS[inv.role] ?? inv.role}</td>
                    <td className="px-4 py-3 text-gray-600">{inv.sites?.name ?? '—'}</td>
                    <td className="px-4 py-3 font-mono text-gray-700">{inv.invite_code}</td>
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
