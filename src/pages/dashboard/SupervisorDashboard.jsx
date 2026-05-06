import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, Users, Plus, Calendar } from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import useSiteStore from '@/stores/siteStore'
import useDailyLogStore from '@/stores/dailyLogStore'
import PageHeader from '@/components/ui/PageHeader'
import { formatDate } from '@/lib/utils'

const WEATHER_EMOJI = {
  'Clear': '☀️', 'Sunny': '☀️', 'Cloudy': '☁️', 'Rain': '🌧️',
  'Drizzle': '🌦️', 'Fog': '🌫️', 'Overcast': '🌥️',
}

function weatherIcon(weather) {
  if (!weather) return '🌤️'
  const key = Object.keys(WEATHER_EMOJI).find((k) => weather.toLowerCase().includes(k.toLowerCase()))
  return key ? WEATHER_EMOJI[key] : '🌤️'
}

export default function SupervisorDashboard() {
  const navigate = useNavigate()
  const profile  = useAuthStore((s) => s.profile)
  const { sites, fetchSites } = useSiteStore()
  const { logs, fetchLogs }   = useDailyLogStore()

  const tenantId = profile?.tenant_id

  useEffect(() => {
    if (tenantId) fetchSites(tenantId)
  }, [tenantId, fetchSites])

  // Load logs for first assigned site
  const primarySite = sites[0]
  useEffect(() => {
    if (primarySite) fetchLogs(primarySite.id)
  }, [primarySite, fetchLogs])

  const today      = new Date().toISOString().split('T')[0]
  const todayLog   = logs.find((l) => l.log_date === today)
  const recentLogs = logs.slice(0, 5)
  const firstName  = profile?.full_name?.split(' ')[0] ?? 'there'

  return (
    <div>
      <PageHeader
        title={`Good day, ${firstName}`}
        description="Supervisor view — daily attendance and progress logs."
        action={
          <button
            onClick={() => navigate('/logs')}
            className="btn-primary"
          >
            <Plus className="h-4 w-4" />
            {todayLog ? 'Update today\'s log' : 'File today\'s log'}
          </button>
        }
      />

      {/* Today's status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Today's log card */}
        <div className={`card p-5 sm:col-span-2 ${!todayLog ? 'border-dashed border-amber-300 bg-amber-50' : ''}`}>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Today — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short' })}
            </span>
          </div>
          {todayLog ? (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl font-bold text-gray-900">{todayLog.workers_present ?? '—'}</span>
                <span className="text-sm text-gray-500">workers present</span>
                <span className="ml-auto text-lg">{weatherIcon(todayLog.weather)}</span>
              </div>
              <p className="text-sm text-gray-700 line-clamp-2">{todayLog.work_done}</p>
              {todayLog.issues && (
                <p className="mt-1.5 text-xs text-amber-700 bg-amber-100 rounded px-2 py-1">
                  ⚠ {todayLog.issues}
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-sm font-medium text-amber-700">No log filed for today yet</p>
              <p className="text-xs text-amber-600 mt-1">File your daily progress report to keep the site on track.</p>
            </div>
          )}
        </div>

        {/* Assigned sites */}
        <div className="card p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">My Sites</p>
          {sites.length === 0 ? (
            <p className="text-sm text-gray-400">No sites assigned.</p>
          ) : (
            <div className="space-y-2">
              {sites.map((s) => (
                <button
                  key={s.id}
                  onClick={() => navigate(`/sites/${s.id}`)}
                  className="flex w-full items-center justify-between text-left group"
                >
                  <span className="text-sm font-medium text-gray-900 truncate group-hover:text-brand-600">
                    {s.name}
                  </span>
                  <span className={s.status === 'active' ? 'badge-green' : 'badge-gray'}>
                    {s.status}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent logs */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">Recent Daily Logs</h2>
          <button onClick={() => navigate('/logs')} className="text-xs font-medium text-brand-600 hover:text-brand-700">
            View all →
          </button>
        </div>
        {recentLogs.length === 0 ? (
          <p className="px-5 py-8 text-sm text-gray-500">No logs yet. Start by filing today's report.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentLogs.map((log) => (
              <button
                key={log.id}
                onClick={() => navigate('/logs')}
                className="flex w-full items-center gap-4 px-5 py-3 text-left hover:bg-gray-50"
              >
                <div className="flex-shrink-0 text-center">
                  <p className="text-xs text-gray-400">{formatDate(log.log_date)}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-700 truncate">{log.work_done}</p>
                  {log.issues && (
                    <p className="text-xs text-amber-600 truncate">⚠ {log.issues}</p>
                  )}
                </div>
                <div className="flex-shrink-0 flex items-center gap-2">
                  <span className="text-xs text-gray-500">{log.workers_present ?? '—'} workers</span>
                  <span className="text-sm">{weatherIcon(log.weather)}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button onClick={() => navigate('/logs')} className="card p-4 text-left hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList className="h-4 w-4 text-green-600" />
            <p className="text-sm font-semibold text-gray-900">Daily Logs</p>
          </div>
          <p className="text-xs text-gray-500">Progress, weather, issues</p>
        </button>
        <button onClick={() => navigate('/workers')} className="card p-4 text-left hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-sage-600" />
            <p className="text-sm font-semibold text-gray-900">Workers</p>
          </div>
          <p className="text-xs text-gray-500">Labour roster & status</p>
        </button>
      </div>
    </div>
  )
}
