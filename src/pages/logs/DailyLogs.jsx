import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, ClipboardList, CloudRain, AlertTriangle, Users } from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import useSiteStore from '@/stores/siteStore'
import useDailyLogStore from '@/stores/dailyLogStore'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import { formatDate } from '@/lib/utils'

const WEATHER_OPTIONS = [
  'Clear and sunny',
  'Partly cloudy',
  'Overcast',
  'Light drizzle',
  'Moderate rain',
  'Heavy rain — work suspended',
  'Morning fog, cleared by afternoon',
  'Strong winds',
]

function LogForm({ sites, onSubmit, loading, userId }) {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({
    site_id: sites[0]?.id ?? '',
    log_date: today,
    workers_present: '',
    weather: 'Partly cloudy',
    work_done: '',
    issues: '',
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({
          ...form,
          workers_present: form.workers_present ? Number(form.workers_present) : null,
          created_by: userId,
          tenant_id: sites.find((s) => s.id === form.site_id)?.tenant_id,
        })
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Site *</label>
          <select className="input" required value={form.site_id} onChange={set('site_id')}>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Date *</label>
          <input className="input" type="date" required value={form.log_date} onChange={set('log_date')} />
        </div>
        <div>
          <label className="label">Workers present</label>
          <input
            className="input" type="number" min="0"
            value={form.workers_present} onChange={set('workers_present')}
            placeholder="e.g. 12"
          />
        </div>
        <div className="col-span-2">
          <label className="label">Weather</label>
          <select className="input" value={form.weather} onChange={set('weather')}>
            {WEATHER_OPTIONS.map((w) => <option key={w}>{w}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="label">Work done today *</label>
          <textarea
            className="input resize-none" rows={3} required
            value={form.work_done} onChange={set('work_done')}
            placeholder="Describe the work completed — quantities, locations, activities…"
          />
        </div>
        <div className="col-span-2">
          <label className="label">Issues / Observations</label>
          <textarea
            className="input resize-none" rows={2}
            value={form.issues} onChange={set('issues')}
            placeholder="Equipment breakdown, material shortage, safety incident, etc. (leave blank if none)"
          />
        </div>
      </div>
      <div className="flex justify-end pt-1">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving…' : 'File log'}
        </button>
      </div>
    </form>
  )
}

export default function DailyLogs() {
  const { siteId }    = useParams()
  const profile       = useAuthStore((s) => s.profile)
  const user          = useAuthStore((s) => s.user)
  const { sites, fetchSites } = useSiteStore()
  const { logs, loading, fetchLogs, createLog } = useDailyLogStore()

  const [modalOpen,      setModalOpen]      = useState(false)
  const [saving,         setSaving]         = useState(false)
  const [error,          setError]          = useState(null)
  const [activeSiteId,   setActiveSiteId]   = useState(siteId ?? null)

  const tenantId = profile?.tenant_id

  useEffect(() => {
    if (tenantId) fetchSites(tenantId)
  }, [tenantId, fetchSites])

  // Set default active site when sites load
  useEffect(() => {
    if (!activeSiteId && sites.length > 0) {
      setActiveSiteId(sites[0].id)
    }
  }, [sites, activeSiteId])

  useEffect(() => {
    if (activeSiteId) fetchLogs(activeSiteId)
  }, [activeSiteId, fetchLogs])

  const canCreateLog = ['superadmin', 'contractor', 'site_manager', 'supervisor'].includes(profile?.role)

  const handleCreate = async (payload) => {
    setSaving(true)
    setError(null)
    try {
      await createLog(payload)
      setModalOpen(false)
      // Refresh logs if the log was for a different site
      if (payload.site_id !== activeSiteId) {
        setActiveSiteId(payload.site_id)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const activeSite = sites.find((s) => s.id === activeSiteId)

  return (
    <div>
      <PageHeader
        title="Daily Logs"
        description="Progress reports, weather, workers present, and site issues."
        action={
          canCreateLog && (
            <button onClick={() => setModalOpen(true)} className="btn-primary">
              <Plus className="h-4 w-4" /> File log
            </button>
          )
        }
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Site selector */}
      {sites.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {sites.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSiteId(s.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                s.id === activeSiteId
                  ? 'bg-brand-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {activeSite && (
        <p className="mb-4 text-xs text-gray-500">
          Showing logs for <span className="font-medium text-gray-700">{activeSite.name}</span>
        </p>
      )}

      {/* Logs list */}
      {loading ? (
        <p className="text-sm text-gray-500">Loading logs…</p>
      ) : logs.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No logs yet"
          description="Daily logs capture progress, attendance, weather conditions, and issues on site."
          action={
            canCreateLog && (
              <button onClick={() => setModalOpen(true)} className="btn-primary">
                <Plus className="h-4 w-4" /> File first log
              </button>
            )
          }
        />
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="card p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(log.log_date)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Filed by {log.created_by_profile?.full_name ?? 'Unknown'}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {log.workers_present != null && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Users className="h-3.5 w-3.5" />
                      {log.workers_present} workers
                    </div>
                  )}
                  {log.weather && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <CloudRain className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline truncate max-w-[140px]">{log.weather}</span>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-700 leading-relaxed">{log.work_done}</p>

              {log.issues && (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">{log.issues}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setError(null) }} title="File Daily Log">
        {sites.length === 0 ? (
          <p className="text-sm text-gray-500">No assigned sites found.</p>
        ) : (
          <LogForm sites={sites} onSubmit={handleCreate} loading={saving} userId={user?.id} />
        )}
      </Modal>
    </div>
  )
}
