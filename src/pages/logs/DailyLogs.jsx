import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, ClipboardList, CloudRain, AlertTriangle, Users, Camera, X, HardHat } from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import useSiteStore from '@/stores/siteStore'
import useDailyLogStore from '@/stores/dailyLogStore'
import { supabase } from '@/lib/supabase'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import PhotoThumb from '@/components/photo/PhotoThumb'
import ApprovalBadge from '@/components/ApprovalBadge'
import { capturePhoto, uploadPhoto, getPhotoUrl } from '@/lib/photos'
import { formatDate } from '@/lib/utils'

const MAX_PHOTOS = 20

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

// ── Multi-photo picker ────────────────────────────────────────────────────────
function PhotoPicker({ photos, onChange }) {
  const photosRef = useRef(photos)
  photosRef.current = photos

  useEffect(() => {
    return () => { photosRef.current.forEach(p => p.url && URL.revokeObjectURL(p.url)) }
  }, [])

  const add = async () => {
    if (photos.length >= MAX_PHOTOS) return
    const blob = await capturePhoto()
    if (!blob) return
    onChange([...photos, { blob, url: URL.createObjectURL(blob), caption: '' }])
  }

  const remove = (i) => {
    URL.revokeObjectURL(photos[i].url)
    onChange(photos.filter((_, idx) => idx !== i))
  }

  const setCaption = (i, val) => {
    const next = [...photos]
    next[i] = { ...next[i], caption: val }
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="label mb-0">Site photos</label>
        <span className="text-xs text-gray-400">{photos.length}/{MAX_PHOTOS}</span>
      </div>
      {photos.map((p, i) => (
        <div key={i} className="flex gap-3 items-start">
          <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden border border-gray-200">
            <img src={p.url} alt="" className="w-full h-full object-cover" />
            <button type="button" onClick={() => remove(i)}
              className="absolute top-0.5 right-0.5 rounded-full bg-black/50 p-0.5 text-white">
              <X className="h-2.5 w-2.5" />
            </button>
          </div>
          <input
            className="input flex-1 text-sm"
            placeholder="Caption (optional) — e.g. North wall brickwork"
            value={p.caption}
            onChange={e => setCaption(i, e.target.value)}
          />
        </div>
      ))}
      {photos.length < MAX_PHOTOS && (
        <button type="button" onClick={add}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-3 text-sm text-gray-400 hover:border-brand-300 hover:text-brand-500 transition-colors">
          <Camera className="h-4 w-4" />
          Add photo
        </button>
      )}
    </div>
  )
}

// ── Log form ──────────────────────────────────────────────────────────────────
function toLocalISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function LogForm({ sites, onSubmit, loading, userId }) {
  const today = toLocalISO(new Date())
  const [form, setForm] = useState({
    site_id:         sites[0]?.id ?? '',
    log_date:        today,
    workers_present: '',
    weather:         'Partly cloudy',
    work_done:       '',
    issues:          '',
  })
  const [photos, setPhotos] = useState([])
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({
          ...form,
          workers_present: form.workers_present ? Number(form.workers_present) : null,
          created_by: userId,
          tenant_id:  sites.find((s) => s.id === form.site_id)?.tenant_id,
          _photos:    photos,
        })
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Site *</label>
          <select className="input" required value={form.site_id} onChange={set('site_id')}>
            {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Date *</label>
          <input className="input" type="date" required value={form.log_date} onChange={set('log_date')} />
        </div>
        <div>
          <label className="label">Workers present</label>
          <input className="input" type="number" min="0"
            value={form.workers_present} onChange={set('workers_present')} placeholder="e.g. 12" />
        </div>
        <div className="col-span-2">
          <label className="label">Weather</label>
          <select className="input" value={form.weather} onChange={set('weather')}>
            {WEATHER_OPTIONS.map((w) => <option key={w}>{w}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="label">Work done today *</label>
          <textarea className="input resize-none" rows={3} required
            value={form.work_done} onChange={set('work_done')}
            placeholder="Describe the work completed — quantities, locations, activities…" />
        </div>
        <div className="col-span-2">
          <label className="label">Issues / Observations</label>
          <textarea className="input resize-none" rows={2}
            value={form.issues} onChange={set('issues')}
            placeholder="Equipment breakdown, material shortage, safety incident, etc." />
        </div>
        <div className="col-span-2">
          <PhotoPicker photos={photos} onChange={setPhotos} />
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

// ── Log card photos ───────────────────────────────────────────────────────────
function LogPhotos({ log }) {
  const [urls, setUrls] = useState([])

  useEffect(() => {
    const newPhotos = log.daily_log_photos ?? []

    if (newPhotos.length > 0) {
      Promise.all(newPhotos.map(p => getPhotoUrl(p.photo_path)))
        .then(signed => setUrls(newPhotos.map((p, i) => ({ url: signed[i], caption: p.caption })).filter(p => p.url)))
    } else if (log.photo_path) {
      // Legacy single-photo support
      getPhotoUrl(log.photo_path).then(url => url ? setUrls([{ url, caption: null }]) : null)
    }
  }, [log])

  if (urls.length === 0) return null

  return (
    <div className="mt-3 space-y-2">
      <div className="grid grid-cols-3 gap-2">
        {urls.map((p, i) => (
          <div key={i} className="space-y-1">
            <div className="aspect-square rounded-xl overflow-hidden border border-gray-100">
              <img src={p.url} alt={p.caption ?? ''} className="w-full h-full object-cover" />
            </div>
            {p.caption && <p className="text-xs text-gray-500 text-center truncate">{p.caption}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Sub-contractor presence ───────────────────────────────────────────────────
function SubcontractorPresence({ siteId, date }) {
  const [scLogs, setScLogs] = useState([])

  useEffect(() => {
    supabase
      .from('subcontractor_daily_logs')
      .select('headcount, subcontractors(name, type)')
      .eq('site_id', siteId)
      .eq('date', date)
      .then(({ data }) => setScLogs(data ?? []))
  }, [siteId, date])

  if (scLogs.length === 0) return null

  const total = scLogs.reduce((s, l) => s + l.headcount, 0)

  return (
    <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
      <div className="flex items-center gap-1.5 mb-2">
        <HardHat className="h-3.5 w-3.5 text-gray-500" />
        <span className="text-xs font-semibold text-gray-600">Sub-contractor Labour — {total} total</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {scLogs.map((l, i) => (
          <span key={i} className="inline-flex items-center gap-1 rounded-full bg-white border border-gray-200 px-2.5 py-1 text-xs text-gray-700">
            <span className="font-bold text-amber-600">{l.headcount}</span>
            {l.subcontractors?.name}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DailyLogs() {
  const { siteId }    = useParams()
  const profile       = useAuthStore((s) => s.profile)
  const user          = useAuthStore((s) => s.user)
  const { sites, fetchSites } = useSiteStore()
  const { logs, loading, fetchLogs, createLog, confirmLog } = useDailyLogStore()

  const [modalOpen,    setModalOpen]    = useState(false)
  const [saving,       setSaving]       = useState(false)
  const [error,        setError]        = useState(null)
  const [activeSiteId, setActiveSiteId] = useState(siteId ?? null)
  const [confirmingId, setConfirmingId] = useState(null)

  const tenantId   = profile?.tenant_id
  const canConfirm = ['superadmin', 'contractor', 'site_manager'].includes(profile?.role)
  const canCreate  = ['superadmin', 'contractor', 'site_manager', 'supervisor'].includes(profile?.role)

  const handleConfirmLog = async (logId) => {
    setConfirmingId(logId)
    try { await confirmLog(logId, profile?.id) }
    catch (err) { setError(err.message) }
    finally { setConfirmingId(null) }
  }

  useEffect(() => {
    if (tenantId) fetchSites(tenantId)
  }, [tenantId, fetchSites])

  useEffect(() => {
    if (!activeSiteId && sites.length > 0) setActiveSiteId(sites[0].id)
  }, [sites, activeSiteId])

  useEffect(() => {
    if (activeSiteId) fetchLogs(activeSiteId)
  }, [activeSiteId, fetchLogs])

  const handleCreate = async ({ _photos, ...payload }) => {
    setSaving(true)
    setError(null)
    try {
      // Create log (no photo_path — using daily_log_photos table)
      const log = await createLog(payload)

      // Upload and insert each photo
      if (_photos?.length > 0 && log?.id && !log._pending) {
        for (const p of _photos) {
          const path = await uploadPhoto({
            blob: p.blob, tenantId: payload.tenant_id, siteId: payload.site_id, entity: 'daily-log',
          })
          await supabase.from('daily_log_photos').insert({ log_id: log.id, photo_path: path, caption: p.caption || null })
        }
        // Refresh to pick up the photos
        fetchLogs(activeSiteId ?? payload.site_id)
      }

      if (payload.site_id !== activeSiteId) setActiveSiteId(payload.site_id)
      setModalOpen(false)
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
          canCreate && (
            <button onClick={() => setModalOpen(true)} className="btn-primary">
              <Plus className="h-4 w-4" /> File log
            </button>
          )
        }
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Site selector */}
      {sites.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {sites.map((s) => (
            <button key={s.id} onClick={() => setActiveSiteId(s.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                s.id === activeSiteId
                  ? 'bg-brand-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}>
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
            canCreate && (
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
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">{formatDate(log.log_date)}</p>
                    <ApprovalBadge status={log.approval_status} />
                  </div>
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
                      <span className="truncate max-w-[140px]">{log.weather}</span>
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

              {/* Multi-photo gallery (new) + legacy single photo */}
              <LogPhotos log={log} />

              {/* Sub-contractor presence for this site+date */}
              <SubcontractorPresence siteId={log.site_id} date={log.log_date} />

              {canConfirm && log.approval_status !== 'confirmed' && !log._pending && (
                <div className="mt-3 flex justify-end">
                  <button onClick={() => handleConfirmLog(log.id)} disabled={confirmingId === log.id}
                    className="btn-primary text-sm py-1.5">
                    {confirmingId === log.id ? 'Confirming…' : 'Confirm log'}
                  </button>
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
