import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  HardHat, ListTodo, MapPin, Pencil, Calendar, Package,
  Truck, Wallet, Camera, ClipboardList, AlertTriangle, ChevronRight,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import useAuthStore from '@/stores/authStore'
import useSiteStore from '@/stores/siteStore'
import useDailyLogStore from '@/stores/dailyLogStore'
import useMaterialTransferStore from '@/stores/materialTransferStore'
import MyTasksWidget from '@/components/dashboard/MyTasksWidget'
import AllocationsTodayWidget from '@/components/dashboard/AllocationsTodayWidget'
import SiteStockWidget from '@/components/dashboard/SiteStockWidget'
import HeroStatsCard from '@/components/dashboard/HeroStatsCard'
import QuickActionTile from '@/components/dashboard/QuickActionTile'
import { formatDate } from '@/lib/utils'

const WEATHER_EMOJI = {
  'Clear': '☀️', 'Sunny': '☀️', 'Cloudy': '☁️', 'Rain': '🌧️',
  'Drizzle': '🌦️', 'Fog': '🌫️', 'Overcast': '🌥️',
}

function weatherStrip(log) {
  if (!log) return null
  const key = log.weather && Object.keys(WEATHER_EMOJI).find(
    (k) => log.weather.toLowerCase().includes(k.toLowerCase()),
  )
  const icon = key ? WEATHER_EMOJI[key] : '🌤️'
  return `${icon} ${log.weather ?? 'Weather'} · log filed`
}

export default function SupervisorDashboard() {
  const navigate = useNavigate()
  const profile  = useAuthStore((s) => s.profile)
  const { sites, fetchSites } = useSiteStore()
  const { logs, fetchLogs }   = useDailyLogStore()
  const { transfers, fetchTransfers } = useMaterialTransferStore()

  const tenantId = profile?.tenant_id
  const [openTaskCount, setOpenTaskCount] = useState(null)

  useEffect(() => {
    if (!tenantId) return
    fetchSites(tenantId)
    fetchTransfers(tenantId).catch(() => {})
  }, [tenantId, fetchSites, fetchTransfers])

  // Open tasks assigned to me (everything except 'done')
  useEffect(() => {
    if (!profile?.id) return
    supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('assigned_to_profile', profile.id)
      .neq('status', 'done')
      .then(({ count }) => setOpenTaskCount(count ?? 0))
      .catch(() => setOpenTaskCount(null))
  }, [profile?.id])

  const mySiteIds = sites.map((s) => s.id)
  const awaitingDispatch = transfers.filter(
    (t) => t.status === 'initiated' && mySiteIds.includes(t.from_site_id),
  )

  const primarySite = sites[0]
  useEffect(() => {
    if (primarySite) fetchLogs(primarySite.id)
  }, [primarySite, fetchLogs])

  const today      = new Date().toISOString().split('T')[0]
  const todayLog   = logs.find((l) => l.log_date === today)
  const recentLogs = logs.slice(0, 3)
  const firstName  = profile?.full_name?.split(' ')[0] ?? 'there'
  const siteName   = primarySite?.name ?? 'no site assigned'
  const todayLabel = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: '2-digit', month: 'short',
  })

  return (
    <div className="space-y-4">
      {/* Greeting */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
          Good day, {firstName}
        </h1>
        <p className="mt-0.5 text-sm text-gray-500 flex items-center gap-1.5 flex-wrap">
          <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{todayLabel}</span>
          {primarySite && (
            <>
              <span className="text-gray-300">·</span>
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{siteName}</span>
            </>
          )}
        </p>
      </div>

      {/* Hero stats — today on site */}
      <HeroStatsCard
        label="TODAY ON SITE"
        stats={[
          {
            icon: HardHat,
            value: todayLog?.workers_present ?? '—',
            sub:   'workers',
          },
          {
            icon: ListTodo,
            value: openTaskCount ?? '—',
            sub:   openTaskCount === 1 ? 'task open' : 'tasks open',
          },
          {
            icon: MapPin,
            value: sites.length,
            sub:   sites.length === 1 ? 'site' : 'sites',
          },
        ]}
        strip={
          todayLog
            ? weatherStrip(todayLog)
            : '⚠ No log filed for today yet — tap "File Log" below'
        }
      />

      {/* Quick actions — 3×2 grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <QuickActionTile
          icon={Pencil} label="File Log" color="amber"
          onClick={() => navigate('/logs')}
        />
        <QuickActionTile
          icon={HardHat} label="Attendance" color="blue"
          onClick={() => navigate('/attendance')}
        />
        <QuickActionTile
          icon={Package} label="Allocate" color="red"
          onClick={() => navigate('/inventory')}
        />
        <QuickActionTile
          icon={Truck} label="Transfer" color="green"
          onClick={() => navigate('/transfers')}
        />
        <QuickActionTile
          icon={Wallet} label="Expense" color="violet"
          onClick={() => navigate('/expenses')}
        />
        <QuickActionTile
          icon={Camera} label="Photo Log" color="orange"
          onClick={() => navigate('/logs')}
        />
      </div>

      {/* Transfers awaiting MY dispatch — only when relevant */}
      {awaitingDispatch.length > 0 && (
        <button
          onClick={() => navigate('/transfers')}
          className="flex w-full items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-left hover:bg-amber-100 transition-colors"
        >
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
            <Truck className="h-5 w-5 text-amber-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-amber-800">
              {awaitingDispatch.length} transfer{awaitingDispatch.length > 1 ? 's' : ''} awaiting your dispatch
            </p>
            <p className="text-xs text-amber-600 truncate">
              {awaitingDispatch.map((t) => t.material?.name ?? 'Material').join(', ')}
            </p>
          </div>
          <span className="flex flex-shrink-0 items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white">
            Open <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </button>
      )}

      {/* My tasks — existing widget, restyled by its own component */}
      <MyTasksWidget profileId={profile?.id} />

      {/* Material allocated today by me */}
      <AllocationsTodayWidget profileId={profile?.id} />

      {/* Stock at a glance — lowest first */}
      <SiteStockWidget />

      {/* Recent daily logs — compact card */}
      {recentLogs.length > 0 && (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-green-600" />
              <h2 className="text-sm font-semibold text-gray-900">Recent daily logs</h2>
            </div>
            <button
              onClick={() => navigate('/logs')}
              className="text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              View all →
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {recentLogs.map((log) => (
              <button
                key={log.id}
                onClick={() => navigate('/logs')}
                className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-gray-50"
              >
                <div className="flex-shrink-0 text-center min-w-[44px]">
                  <p className="text-xs text-gray-400">{formatDate(log.log_date)}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-700 truncate">{log.work_done}</p>
                  {log.issues && (
                    <p className="text-xs text-amber-600 truncate flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                      {log.issues}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <span className="text-xs text-gray-500">
                    {log.workers_present ?? '—'} 👷
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
