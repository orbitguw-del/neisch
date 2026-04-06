import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HardHat, Users, Package, TrendingUp, Plus, IndianRupee, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import useAuthStore from '@/stores/authStore'
import useSiteStore from '@/stores/siteStore'
import StatCard from '@/components/ui/StatCard'
import PageHeader from '@/components/ui/PageHeader'
import { formatDate, formatINR } from '@/lib/utils'

const STATUS_CLASS = {
  active:    'badge-green',
  completed: 'badge-blue',
  planning:  'badge-yellow',
  on_hold:   'badge-gray',
}

export default function ContractorDashboard() {
  const navigate = useNavigate()
  const profile  = useAuthStore((s) => s.profile)
  const { sites, fetchSites } = useSiteStore()

  const [teamCount,    setTeamCount]    = useState(0)
  const [lowStockCount, setLowStockCount] = useState(0)
  const [loading,      setLoading]      = useState(true)

  const tenantId  = profile?.tenant_id
  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'

  useEffect(() => {
    if (tenantId) fetchSites(tenantId)
  }, [tenantId, fetchSites])

  useEffect(() => {
    if (!tenantId) return
    async function loadKPIs() {
      setLoading(true)
      try {
        // Team members (excluding contractor)
        const { count: tc } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .neq('role', 'contractor')
        setTeamCount(tc ?? 0)

        // Low stock materials
        const { data: mats } = await supabase
          .from('materials')
          .select('quantity_available, quantity_minimum, category')
          .eq('tenant_id', tenantId)
          .eq('category', 'consumable')
          .not('quantity_minimum', 'is', null)
          .not('quantity_available', 'is', null)
        const low = (mats ?? []).filter(
          (m) => Number(m.quantity_available) <= Number(m.quantity_minimum)
        ).length
        setLowStockCount(low)
      } finally {
        setLoading(false)
      }
    }
    loadKPIs()
  }, [tenantId])

  const activeSites = sites.filter((s) => s.status === 'active').length
  const planSites   = sites.filter((s) => s.status === 'planning').length
  const totalBudget = sites.reduce((sum, s) => sum + (Number(s.budget) || 0), 0)

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description={`${profile?.tenant?.name ?? 'Your company'} — construction operations overview.`}
        action={
          <button onClick={() => navigate('/sites')} className="btn-primary">
            <Plus className="h-4 w-4" /> New site
          </button>
        }
      />

      {/* Low stock alert banner */}
      {lowStockCount > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700">
            <strong>{lowStockCount}</strong> material{lowStockCount > 1 ? 's' : ''} below reorder level across your sites.{' '}
            <button onClick={() => navigate('/inventory')} className="underline font-medium">View inventory →</button>
          </span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Sites"    value={sites.length}  icon={HardHat}       color="brand" />
        <StatCard label="Active Sites"   value={activeSites}   icon={TrendingUp}    color="green" />
        <StatCard label="Team Members"   value={teamCount}     icon={Users}         color="earth" />
        <StatCard
          label="Total Budget"
          value={totalBudget > 0 ? formatINR(totalBudget) : '—'}
          icon={IndianRupee}
          color="red"
        />
      </div>

      {/* Second row KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="In Planning"    value={planSites}     icon={Package}       color="earth" />
        <StatCard
          label="Low Stock Items"
          value={lowStockCount}
          icon={AlertTriangle}
          color={lowStockCount > 0 ? 'red' : 'green'}
        />
        <StatCard
          label="Completed Sites"
          value={sites.filter((s) => s.status === 'completed').length}
          icon={HardHat}
          color="blue"
        />
      </div>

      {/* Recent sites */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">Your Sites</h2>
          <button onClick={() => navigate('/sites')} className="text-xs font-medium text-brand-600 hover:text-brand-700">
            View all →
          </button>
        </div>

        {sites.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">
            No sites yet.{' '}
            <button onClick={() => navigate('/sites')} className="text-brand-600 hover:underline">
              Add your first site
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sites.slice(0, 6).map((site) => (
              <button
                key={site.id}
                onClick={() => navigate(`/sites/${site.id}`)}
                className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-gray-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{site.name}</p>
                  <p className="text-xs text-gray-500 truncate">{site.location}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <span className={STATUS_CLASS[site.status] ?? 'badge-gray'}>
                    {site.status?.replace('_', ' ')}
                  </span>
                  {site.budget && (
                    <span className="text-xs font-medium text-gray-600">{formatINR(site.budget)}</span>
                  )}
                  <span className="text-xs text-gray-400">{formatDate(site.start_date)}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => navigate('/reports')}
          className="card p-4 text-left hover:shadow-md transition-shadow"
        >
          <p className="text-sm font-semibold text-gray-900">Reports</p>
          <p className="text-xs text-gray-500 mt-0.5">Budget & status summary</p>
        </button>
        <button
          onClick={() => navigate('/team')}
          className="card p-4 text-left hover:shadow-md transition-shadow"
        >
          <p className="text-sm font-semibold text-gray-900">Team</p>
          <p className="text-xs text-gray-500 mt-0.5">Manage site assignments</p>
        </button>
        <button
          onClick={() => navigate('/inventory')}
          className="card p-4 text-left hover:shadow-md transition-shadow"
        >
          <p className="text-sm font-semibold text-gray-900">Inventory</p>
          <p className="text-xs text-gray-500 mt-0.5">Stock levels & alerts</p>
        </button>
      </div>
    </div>
  )
}
