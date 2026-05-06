import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Building2, HardHat, Users, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import useAuthStore from '@/stores/authStore'
import StatCard from '@/components/ui/StatCard'
import PageHeader from '@/components/ui/PageHeader'
import { formatDate } from '@/lib/utils'

export default function SuperAdminDashboard() {
  const navigate = useNavigate()
  const profile  = useAuthStore((s) => s.profile)
  const [stats,   setStats]   = useState({ tenants: 0, sites: 0, users: 0, activeSites: 0 })
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [tenantsRes, sitesRes, usersRes] = await Promise.all([
          supabase.from('tenants').select('id, name, plan, created_at, owner_id').order('created_at', { ascending: false }),
          supabase.from('sites').select('id, status, tenant_id'),
          supabase.from('profiles').select('id, role'),
        ])
        if (tenantsRes.error) throw tenantsRes.error
        if (sitesRes.error)   throw sitesRes.error
        if (usersRes.error)   throw usersRes.error

        const activeSites = (sitesRes.data ?? []).filter((s) => s.status === 'active').length
        setTenants(tenantsRes.data ?? [])
        setStats({
          tenants:     (tenantsRes.data ?? []).length,
          sites:       (sitesRes.data ?? []).length,
          users:       (usersRes.data ?? []).length,
          activeSites,
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Karun'

  return (
    <div>
      <PageHeader
        title={`Welcome, ${firstName}`}
        description="Storey platform overview — all tenants and operations."
        action={
          <button onClick={() => navigate('/admin/tenants')} className="btn-primary">
            <Shield className="h-4 w-4" /> Manage Tenants
          </button>
        }
      />

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Tenants"  value={loading ? '—' : stats.tenants}     icon={Building2} color="brand" />
        <StatCard label="Total Sites"    value={loading ? '—' : stats.sites}       icon={HardHat}   color="earth" />
        <StatCard label="Active Sites"   value={loading ? '—' : stats.activeSites} icon={HardHat}   color="green" />
        <StatCard label="Platform Users" value={loading ? '—' : stats.users}       icon={Users}     color="red"   />
      </div>

      {/* Tenants table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">Registered Tenants</h2>
          <button onClick={() => navigate('/admin/tenants')} className="text-xs font-medium text-brand-600 hover:text-brand-700">
            View all →
          </button>
        </div>

        {loading ? (
          <p className="px-5 py-8 text-sm text-gray-500">Loading…</p>
        ) : tenants.length === 0 ? (
          <p className="px-5 py-8 text-sm text-gray-500">No tenants registered yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {tenants.slice(0, 8).map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between px-5 py-3 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100">
                    <Building2 className="h-4 w-4 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{formatDate(t.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={
                    t.plan === 'pro' ? 'badge-blue' :
                    t.plan === 'enterprise' ? 'badge-green' : 'badge-gray'
                  }>
                    {t.plan}
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-300" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
