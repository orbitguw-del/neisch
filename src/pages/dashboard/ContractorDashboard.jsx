import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  HardHat, MapPin, ListTodo, IndianRupee, AlertTriangle,
  Building2, Users, Package, Wallet, BarChart3, Calendar, ChevronRight,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import useAuthStore from '@/stores/authStore'
import useSiteStore from '@/stores/siteStore'
import HeroStatsCard from '@/components/dashboard/HeroStatsCard'
import QuickActionTile from '@/components/dashboard/QuickActionTile'
import SiteStockWidget from '@/components/dashboard/SiteStockWidget'
import { formatINR } from '@/lib/utils'

// Status colour map (stripe colour on each site card)
const STATUS_STRIPE = {
  active:    '#059669', // green
  completed: '#2563EB', // blue
  planning:  '#D97706', // amber
  on_hold:   '#9CA3AF', // gray
}
const STATUS_LABEL = {
  active:    'Active',
  completed: 'Completed',
  planning:  'Planning',
  on_hold:   'On hold',
}

export default function ContractorDashboard() {
  const navigate = useNavigate()
  const profile  = useAuthStore((s) => s.profile)
  const { sites, fetchSites } = useSiteStore()

  const [workersCount,  setWorkersCount]  = useState(null)
  const [tasksDueCount, setTasksDueCount] = useState(null)
  const [spendToday,    setSpendToday]    = useState(null)
  const [lowStockCount, setLowStockCount] = useState(0)

  const tenantId  = profile?.tenant_id
  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'
  const companyName = profile?.tenant?.name ?? 'Your company'
  const today = new Date().toISOString().split('T')[0]
  const todayLabel = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: '2-digit', month: 'short',
  })

  useEffect(() => {
    if (tenantId) fetchSites(tenantId)
  }, [tenantId, fetchSites])

  useEffect(() => {
    if (!tenantId) return
    let cancelled = false

    // Run in parallel — independent queries
    const head = (table, mods = (q) => q) =>
      mods(supabase.from(table).select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId))

    Promise.all([
      head('workers'),
      head('tasks', (q) => q.eq('due_date', today).neq('status', 'done')),
      supabase
        .from('site_expenses')
        .select('amount')
        .eq('tenant_id', tenantId)
        .gte('expense_date', today),
      supabase
        .from('materials')
        .select('quantity_available, quantity_minimum, category')
        .eq('tenant_id', tenantId)
        .eq('category', 'consumable')
        .not('quantity_minimum', 'is', null)
        .not('quantity_available', 'is', null),
    ]).then(([workers, tasks, expenses, mats]) => {
      if (cancelled) return
      setWorkersCount(workers.count ?? 0)
      setTasksDueCount(tasks.count ?? 0)
      const sumToday = (expenses.data ?? [])
        .reduce((a, e) => a + (Number(e.amount) || 0), 0)
      setSpendToday(sumToday)
      const low = (mats.data ?? []).filter(
        (m) => Number(m.quantity_available) <= Number(m.quantity_minimum),
      ).length
      setLowStockCount(low)
    }).catch(() => {
      /* silent — KPI cards render '—' */
    })

    return () => { cancelled = true }
  }, [tenantId, today])

  const activeSites = sites.filter((s) => s.status === 'active').length

  // Format spend compactly for the hero card
  const spendDisplay = spendToday == null
    ? '—'
    : spendToday >= 100000
      ? `₹${(spendToday / 100000).toFixed(1)}L`
      : spendToday >= 1000
        ? `₹${Math.round(spendToday / 1000)}k`
        : `₹${spendToday}`

  return (
    <div className="space-y-4">
      {/* ── Greeting ─────────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
          Welcome, {firstName}
        </h1>
        <p className="mt-0.5 text-sm text-gray-500 flex items-center gap-1.5 flex-wrap">
          <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{todayLabel}</span>
          <span className="text-gray-300">·</span>
          <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">{companyName}</span>
        </p>
      </div>

      {/* ── Hero stats — 4-up ────────────────────────────────────── */}
      <HeroStatsCard
        label="ACROSS ALL SITES TODAY"
        stats={[
          {
            icon: HardHat,
            value: workersCount ?? '—',
            sub:   workersCount === 1 ? 'worker' : 'workers',
          },
          {
            icon: MapPin,
            value: activeSites,
            sub:   `of ${sites.length} sites`,
          },
          {
            icon: ListTodo,
            value: tasksDueCount ?? '—',
            sub:   tasksDueCount === 1 ? 'task due' : 'tasks due',
          },
          {
            icon: IndianRupee,
            value: spendDisplay,
            sub:   'spent today',
          },
        ]}
        strip={
          lowStockCount > 0
            ? `⚠ ${lowStockCount} material${lowStockCount > 1 ? 's' : ''} below reorder level`
            : sites.length === 0
              ? 'No sites yet — start by adding your first site'
              : '✓ All stock above reorder level'
        }
      />

      {/* ── Quick actions — 3×2 grid ─────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <QuickActionTile
          icon={Building2} label="Sites" color="brand"
          onClick={() => navigate('/sites')}
        />
        <QuickActionTile
          icon={Users} label="Team" color="sage"
          onClick={() => navigate('/team')}
        />
        <QuickActionTile
          icon={ListTodo} label="Tasks" color="amber"
          onClick={() => navigate('/tasks')}
        />
        <QuickActionTile
          icon={Package} label="Inventory" color="blue"
          onClick={() => navigate('/inventory')}
        />
        <QuickActionTile
          icon={Wallet} label="Expenses" color="violet"
          onClick={() => navigate('/expenses')}
        />
        <QuickActionTile
          icon={BarChart3} label="Reports" color="green"
          onClick={() => navigate('/reports')}
        />
      </div>

      {/* ── Low stock alert (only when material is below reorder) ── */}
      {lowStockCount > 0 && (
        <button
          onClick={() => navigate('/inventory')}
          className="flex w-full items-center gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-left hover:bg-red-100 transition-colors"
        >
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-red-800">
              {lowStockCount} material{lowStockCount > 1 ? 's' : ''} below reorder level
            </p>
            <p className="text-xs text-red-600">Tap to view inventory across all sites</p>
          </div>
          <ChevronRight className="h-4 w-4 flex-shrink-0 text-red-400" />
        </button>
      )}

      {/* ── Your Sites — restyled with status stripes ───────────── */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand-600" />
            <h2 className="text-sm font-semibold text-gray-900">Your sites</h2>
            {sites.length > 0 && (
              <span className="text-xs text-gray-400">· {sites.length}</span>
            )}
          </div>
          <button
            onClick={() => navigate('/sites')}
            className="text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            View all →
          </button>
        </div>

        {sites.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sand-300">
              <Building2 className="h-6 w-6 text-brand-600" />
            </div>
            <p className="text-sm font-medium text-gray-700">No sites yet</p>
            <p className="mt-1 text-xs text-gray-500">Add your first site to get started</p>
            <button
              onClick={() => navigate('/sites')}
              className="mt-3 inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              + Add first site
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sites.slice(0, 6).map((site) => {
              const stripeColor = STATUS_STRIPE[site.status] ?? STATUS_STRIPE.on_hold
              return (
                <button
                  key={site.id}
                  onClick={() => navigate(`/sites/${site.id}`)}
                  className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-gray-50"
                >
                  {/* Status stripe */}
                  <div
                    className="h-10 w-1 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: stripeColor }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{site.name}</p>
                    <p className="text-xs text-gray-500 truncate">{site.location || '—'}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs font-semibold" style={{ color: stripeColor }}>
                      {STATUS_LABEL[site.status] ?? site.status}
                    </p>
                    {site.budget && (
                      <p className="text-xs text-gray-500 tabular-nums">{formatINR(site.budget)}</p>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300" />
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Stock at a glance — reuse the existing widget ────────── */}
      <SiteStockWidget />
    </div>
  )
}
