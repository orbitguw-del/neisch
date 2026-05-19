import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HardHat, Users, Package, ClipboardList, BellRing, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import useAuthStore from '@/stores/authStore'
import useSiteStore from '@/stores/siteStore'
import StatCard from '@/components/ui/StatCard'
import MyTasksWidget from '@/components/dashboard/MyTasksWidget'
import PageHeader from '@/components/ui/PageHeader'
import { formatINR } from '@/lib/utils'

const STATUS_CLASS = {
  active:    'badge-green',
  completed: 'badge-blue',
  planning:  'badge-yellow',
  on_hold:   'badge-gray',
}

export default function SiteManagerDashboard() {
  const navigate = useNavigate()
  const profile  = useAuthStore((s) => s.profile)
  const { sites, fetchSites } = useSiteStore()

  const tenantId = profile?.tenant_id
  const [pending, setPending] = useState(null)

  useEffect(() => {
    // RLS will automatically restrict to assigned sites for site_manager role
    if (tenantId) fetchSites(tenantId)
  }, [tenantId, fetchSites])

  // Counts of items awaiting this manager's confirmation (RLS scopes to their sites).
  useEffect(() => {
    if (!tenantId) return
    const head = (table, col, val) =>
      supabase.from(table).select('id', { count: 'exact', head: true }).eq(col, val)
    Promise.all([
      head('daily_logs',        'approval_status', 'submitted'),
      head('attendance',        'approval_status', 'submitted'),
      head('tasks',             'status',          'submitted'),
      head('material_transfers','status',          'prepared'),
      head('site_expenses',     'status',          'pending'),
    ]).then(([l, a, t, tr, e]) => setPending({
      logs: l.count ?? 0, attendance: a.count ?? 0, tasks: t.count ?? 0,
      transfers: tr.count ?? 0, expenses: e.count ?? 0,
    })).catch(() => {})
  }, [tenantId])

  const activeSites = sites.filter((s) => s.status === 'active').length
  const firstName   = profile?.full_name?.split(' ')[0] ?? 'there'

  const pendingItems = pending ? [
    { key: 'attendance', n: pending.attendance, label: 'Attendance entries to confirm', to: '/attendance' },
    { key: 'logs',       n: pending.logs,       label: 'Daily logs to confirm',         to: '/logs' },
    { key: 'tasks',      n: pending.tasks,      label: 'Tasks submitted for sign-off',  to: '/tasks' },
    { key: 'transfers',  n: pending.transfers,  label: 'Transfers to approve',          to: '/transfers' },
    { key: 'expenses',   n: pending.expenses,   label: 'Expenses to approve',           to: '/expenses' },
  ].filter((i) => i.n > 0) : []

  return (
    <div>
      <PageHeader
        title={`Hello, ${firstName}`}
        description="Your assigned construction sites — today's overview."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Assigned Sites" value={sites.length} icon={HardHat}      color="brand" />
        <StatCard label="Active"         value={activeSites}  icon={HardHat}      color="green" />
        <StatCard label="Workers"        value="—"            icon={Users}        color="sage" />
        <StatCard label="Logs Today"     value="—"            icon={ClipboardList} color="red"  />
      </div>

      {/* My tasks */}
      <MyTasksWidget profileId={profile?.id} />

      {/* Needs your confirmation */}
      {pendingItems.length > 0 && (
        <div className="card overflow-hidden mb-4 border-amber-200">
          <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-5 py-3">
            <BellRing className="h-4 w-4 text-amber-600" />
            <h2 className="text-sm font-semibold text-amber-800">Needs your confirmation</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingItems.map((i) => (
              <button key={i.key} onClick={() => navigate(i.to)}
                className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-gray-50">
                <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-amber-100 px-2 text-sm font-bold text-amber-700">
                  {i.n}
                </span>
                <span className="flex-1 text-sm text-gray-800">{i.label}</span>
                <ChevronRight className="h-4 w-4 text-gray-300" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Assigned sites */}
      <div className="card overflow-hidden mb-4">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">My Sites</h2>
          <button onClick={() => navigate('/sites')} className="text-xs font-medium text-brand-600 hover:text-brand-700">
            View all →
          </button>
        </div>
        {sites.length === 0 ? (
          <p className="px-5 py-8 text-sm text-gray-500">No sites assigned to you yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {sites.map((site) => (
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
                    <span className="hidden sm:inline text-xs font-medium text-gray-600">
                      {formatINR(site.budget)}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button onClick={() => navigate('/workers')} className="card p-4 text-left hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-sage-600" />
            <p className="text-sm font-semibold text-gray-900">Workers</p>
          </div>
          <p className="text-xs text-gray-500">View and manage labour roster</p>
        </button>
        <button onClick={() => navigate('/materials')} className="card p-4 text-left hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-1">
            <Package className="h-4 w-4 text-brand-600" />
            <p className="text-sm font-semibold text-gray-900">Materials</p>
          </div>
          <p className="text-xs text-gray-500">Check inventory levels</p>
        </button>
        <button onClick={() => navigate('/logs')} className="card p-4 text-left hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList className="h-4 w-4 text-green-600" />
            <p className="text-sm font-semibold text-gray-900">Daily Logs</p>
          </div>
          <p className="text-xs text-gray-500">Review progress reports</p>
        </button>
      </div>
    </div>
  )
}
