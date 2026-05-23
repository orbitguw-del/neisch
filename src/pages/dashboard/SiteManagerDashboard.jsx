import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  HardHat, MapPin, ListTodo, BellRing, Calendar, Building2, Users,
  Package, Wallet, BarChart3, ClipboardList, Truck, ChevronRight, Pencil,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import useAuthStore from '@/stores/authStore'
import useSiteStore from '@/stores/siteStore'
import MyTasksWidget from '@/components/dashboard/MyTasksWidget'
import SiteStockWidget from '@/components/dashboard/SiteStockWidget'
import HeroStatsCard from '@/components/dashboard/HeroStatsCard'
import QuickActionTile from '@/components/dashboard/QuickActionTile'
import { formatINR } from '@/lib/utils'

const STATUS_STRIPE = {
  active:    '#059669',
  completed: '#2563EB',
  planning:  '#D97706',
  on_hold:   '#9CA3AF',
}
const STATUS_LABEL = {
  active:    'Active',
  completed: 'Completed',
  planning:  'Planning',
  on_hold:   'On hold',
}

export default function SiteManagerDashboard() {
  const navigate = useNavigate()
  const profile  = useAuthStore((s) => s.profile)
  const { sites, fetchSites } = useSiteStore()

  const tenantId = profile?.tenant_id
  const [pending,      setPending]      = useState(null)
  const [workersCount, setWorkersCount] = useState(null)
  const [openTasks,    setOpenTasks]    = useState(null)

  useEffect(() => {
    // RLS auto-scopes to the manager's assigned sites
    if (tenantId) fetchSites(tenantId)
  }, [tenantId, fetchSites])

  useEffect(() => {
    if (!tenantId) return
    let cancelled = false

    const head = (table, col, val) =>
      supabase.from(table).select('id', { count: 'exact', head: true }).eq(col, val)

    Promise.all([
      head('daily_logs',         'approval_status', 'submitted'),
      head('attendance',         'approval_status', 'submitted'),
      head('tasks',              'status',          'submitted'),
      head('material_transfers', 'status',          'prepared'),
      head('site_expenses',      'status',          'pending'),
      supabase.from('workers').select('id', { count: 'exact', head: true }),
      supabase.from('tasks').select('id', { count: 'exact', head: true }).neq('status', 'done'),
    ]).then(([l, a, t, tr, e, w, ot]) => {
      if (cancelled) return
      setPending({
        logs:       l.count  ?? 0,
        attendance: a.count  ?? 0,
        tasks:      t.count  ?? 0,
        transfers:  tr.count ?? 0,
        expenses:   e.count  ?? 0,
      })
      setWorkersCount(w.count ?? 0)
      setOpenTasks(ot.count ?? 0)
    }).catch(() => {/* silent — UI will show — */})

    return () => { cancelled = true }
  }, [tenantId])

  const activeSites = sites.filter((s) => s.status === 'active').length
  const firstName   = profile?.full_name?.split(' ')[0] ?? 'there'
  const todayLabel  = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: '2-digit', month: 'short',
  })

  const pendingItems = pending ? [
    { key: 'attendance', n: pending.attendance, icon: HardHat,        label: 'Attendance entries',  to: '/attendance' },
    { key: 'logs',       n: pending.logs,       icon: Pencil,         label: 'Daily logs',          to: '/logs' },
    { key: 'tasks',      n: pending.tasks,      icon: ListTodo,       label: 'Tasks submitted',     to: '/tasks' },
    { key: 'transfers',  n: pending.transfers,  icon: Truck,          label: 'Material transfers',  to: '/transfers' },
    { key: 'expenses',   n: pending.expenses,   icon: Wallet,         label: 'Expenses',            to: '/expenses' },
  ].filter((i) => i.n > 0) : []

  const totalPending = pendingItems.reduce((sum, i) => sum + i.n, 0)

  return (
    <div className="space-y-4">
      {/* ── Greeting ─────────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
          Hello, {firstName}
        </h1>
        <p className="mt-0.5 text-sm text-gray-500 flex items-center gap-1.5 flex-wrap">
          <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{todayLabel}</span>
          <span className="text-gray-300">·</span>
          <span>Site Manager</span>
          {sites.length > 0 && (
            <>
              <span className="text-gray-300">·</span>
              <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{sites.length} site{sites.length > 1 ? 's' : ''}</span>
            </>
          )}
        </p>
      </div>

      {/* ── Hero stats — confirmations come first (the SM's primary job) ── */}
      <HeroStatsCard
        label="ACROSS YOUR SITES"
        stats={[
          {
            icon: BellRing,
            value: pending == null ? '—' : totalPending,
            sub:   totalPending === 1 ? 'needs your sign-off' : 'need your sign-off',
          },
          {
            icon: MapPin,
            value: activeSites,
            sub:   `of ${sites.length} active`,
          },
          {
            icon: HardHat,
            value: workersCount ?? '—',
            sub:   workersCount === 1 ? 'worker' : 'workers',
          },
          {
            icon: ListTodo,
            value: openTasks ?? '—',
            sub:   openTasks === 1 ? 'task open' : 'tasks open',
          },
        ]}
        strip={
          totalPending > 0
            ? `🔔 ${totalPending} item${totalPending > 1 ? 's' : ''} waiting — review below`
            : pending == null
              ? 'Loading…'
              : '✓ All clear — no pending approvals'
        }
      />

      {/* ── Needs your confirmation — prominent when items exist ── */}
      {pendingItems.length > 0 && (
        <div className="card overflow-hidden border-amber-300">
          <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-5 py-3">
            <BellRing className="h-4 w-4 text-amber-600" />
            <h2 className="text-sm font-semibold text-amber-900">Needs your confirmation</h2>
            <span className="ml-auto text-xs font-semibold text-amber-700">
              {totalPending} total
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingItems.map((i) => {
              const Icon = i.icon
              return (
                <button
                  key={i.key}
                  onClick={() => navigate(i.to)}
                  className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-amber-50/40 transition-colors"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100">
                    <Icon className="h-4 w-4 text-amber-700" />
                  </div>
                  <span className="flex-1 text-sm font-medium text-gray-800">{i.label}</span>
                  <span className="flex h-7 min-h-7 min-w-7 items-center justify-center rounded-full bg-amber-600 px-2 text-xs font-bold text-white tabular-nums">
                    {i.n}
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-300" />
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Quick actions ────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <QuickActionTile
          icon={BellRing} label="Approvals" color="amber"
          onClick={() => {
            // Jump to the first pending category if any, else attendance.
            navigate(pendingItems[0]?.to ?? '/attendance')
          }}
        />
        <QuickActionTile
          icon={Building2} label="Sites" color="brand"
          onClick={() => navigate('/sites')}
        />
        <QuickActionTile
          icon={Users} label="Workers" color="sage"
          onClick={() => navigate('/workers')}
        />
        <QuickActionTile
          icon={Package} label="Materials" color="blue"
          onClick={() => navigate('/materials')}
        />
        <QuickActionTile
          icon={ClipboardList} label="Daily Logs" color="green"
          onClick={() => navigate('/logs')}
        />
        <QuickActionTile
          icon={BarChart3} label="Reports" color="violet"
          onClick={() => navigate('/reports')}
        />
      </div>

      {/* ── My Tasks — existing widget ───────────────────────────── */}
      <MyTasksWidget profileId={profile?.id} />

      {/* ── My Sites — restyled with status stripes ──────────────── */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand-600" />
            <h2 className="text-sm font-semibold text-gray-900">My sites</h2>
            {sites.length > 0 && (
              <span className="text-xs text-gray-400">· {sites.length}</span>
            )}
          </div>
          <button onClick={() => navigate('/sites')} className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50 transition-colors">
            View all <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {sites.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sand-300">
              <Building2 className="h-6 w-6 text-brand-600" />
            </div>
            <p className="text-sm font-medium text-gray-700">No sites assigned yet</p>
            <p className="mt-1 text-xs text-gray-500">Ask your contractor to add you to a site</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sites.map((site) => {
              const stripeColor = STATUS_STRIPE[site.status] ?? STATUS_STRIPE.on_hold
              return (
                <button
                  key={site.id}
                  onClick={() => navigate(`/sites/${site.id}`)}
                  className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-gray-50"
                >
                  <div
                    className="h-10 w-1.5 flex-shrink-0 rounded-full"
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

      {/* ── Stock at a glance — reused widget ────────────────────── */}
      <SiteStockWidget />
    </div>
  )
}
