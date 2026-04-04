import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Building2, Users, HardHat, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import { formatDate, formatINR } from '@/lib/utils'

function TenantRow({ tenant }) {
  const [expanded, setExpanded]   = useState(false)
  const [details,  setDetails]    = useState(null)
  const [loading,  setLoading]    = useState(false)

  const loadDetails = async () => {
    if (details) { setExpanded((e) => !e); return }
    setLoading(true)
    try {
      const [sitesRes, usersRes] = await Promise.all([
        supabase.from('sites').select('id, name, status, budget, location').eq('tenant_id', tenant.id),
        supabase.from('profiles').select('id, full_name, role').eq('tenant_id', tenant.id),
      ])
      setDetails({ sites: sitesRes.data ?? [], users: usersRes.data ?? [] })
      setExpanded(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        className="flex w-full items-center justify-between px-5 py-4 hover:bg-gray-50 text-left"
        onClick={loadDetails}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100">
            <Building2 className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{tenant.name}</p>
            <p className="text-xs text-gray-500">
              Owner: {tenant.owner?.full_name ?? 'N/A'} · Joined {formatDate(tenant.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={
            tenant.plan === 'pro' ? 'badge-blue' :
            tenant.plan === 'enterprise' ? 'badge-green' : 'badge-gray'
          }>
            {tenant.plan}
          </span>
          {loading
            ? <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
            : expanded
              ? <ChevronUp className="h-4 w-4 text-gray-400" />
              : <ChevronDown className="h-4 w-4 text-gray-400" />
          }
        </div>
      </button>

      {expanded && details && (
        <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sites */}
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                <HardHat className="h-3.5 w-3.5" /> Sites ({details.sites.length})
              </p>
              {details.sites.length === 0 ? (
                <p className="text-xs text-gray-400">No sites yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {details.sites.map((s) => (
                    <div key={s.id} className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-medium text-gray-800">{s.name}</span>
                        {s.location && <span className="text-xs text-gray-500"> — {s.location}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        {s.budget && <span className="text-xs text-gray-600">{formatINR(s.budget)}</span>}
                        <span className={
                          s.status === 'active' ? 'badge-green' :
                          s.status === 'completed' ? 'badge-blue' :
                          s.status === 'planning' ? 'badge-yellow' : 'badge-gray'
                        }>
                          {s.status?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Users */}
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                <Users className="h-3.5 w-3.5" /> Team ({details.users.length})
              </p>
              {details.users.length === 0 ? (
                <p className="text-xs text-gray-400">No team members yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {details.users.map((u) => (
                    <div key={u.id} className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-800">{u.full_name ?? 'Unnamed'}</span>
                      <span className="badge-gray text-xs capitalize">{u.role?.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Tenants() {
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const { data, error } = await supabase
          .from('tenants')
          .select('*')
          .order('created_at', { ascending: false })
        if (error) throw error
        const tenantList = data ?? []
        // Attach owner names
        const ownerIds = tenantList.map(t => t.owner_id).filter(Boolean)
        if (ownerIds.length) {
          const { data: owners } = await supabase.from('profiles').select('id, full_name').in('id', ownerIds)
          const ownerMap = Object.fromEntries((owners ?? []).map(o => [o.id, o]))
          tenantList.forEach(t => { t.owner = ownerMap[t.owner_id] ?? null })
        }
        setTenants(tenantList)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const plans = tenants.reduce((acc, t) => {
    acc[t.plan] = (acc[t.plan] || 0) + 1
    return acc
  }, {})

  return (
    <div>
      <PageHeader
        title="Tenants"
        description="All registered contracting companies on the ConsNE platform."
      />

      {/* Summary */}
      {!loading && tenants.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="card px-4 py-3 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-brand-600" />
            <span className="text-sm font-semibold text-gray-900">{tenants.length}</span>
            <span className="text-sm text-gray-500">total tenants</span>
          </div>
          {Object.entries(plans).map(([plan, count]) => (
            <div key={plan} className="card px-4 py-3 flex items-center gap-2">
              <span className={plan === 'pro' ? 'badge-blue' : plan === 'enterprise' ? 'badge-green' : 'badge-gray'}>
                {plan}
              </span>
              <span className="text-sm text-gray-600">{count}</span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <p className="px-5 py-8 text-sm text-gray-500">Loading tenants…</p>
        ) : tenants.length === 0 ? (
          <p className="px-5 py-8 text-sm text-gray-500">No tenants registered yet.</p>
        ) : (
          <div>
            {tenants.map((t) => (
              <TenantRow key={t.id} tenant={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
