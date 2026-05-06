import { useEffect, useState, useMemo, useCallback } from 'react'
import {
  CalendarDays, ChevronLeft, ChevronRight, CheckCircle2,
  XCircle, Clock, Umbrella, Save, Users, Building2,
} from 'lucide-react'
import useWorkerStore from '@/stores/workerStore'
import useAuthStore from '@/stores/authStore'
import useSiteStore from '@/stores/siteStore'
import PageHeader from '@/components/ui/PageHeader'

// ── Helpers ────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  present:    { label: 'P',         fullLabel: 'Present',    icon: CheckCircle2, cls: 'bg-green-500 text-white',      ring: 'ring-green-400' },
  absent:     { label: 'A',         fullLabel: 'Absent',     icon: XCircle,      cls: 'bg-red-500 text-white',        ring: 'ring-red-400' },
  half_day:   { label: '½',         fullLabel: 'Half Day',   icon: Clock,        cls: 'bg-yellow-400 text-white',     ring: 'ring-yellow-400' },
  paid_leave: { label: 'PL',        fullLabel: 'Paid Leave', icon: Umbrella,     cls: 'bg-blue-400 text-white',       ring: 'ring-blue-400' },
}

const STATUS_CYCLE = ['present', 'absent', 'half_day', 'paid_leave']

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function formatDisplayDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })
}

// ── AttendanceSummary ─────────────────────────────────────────────────────

function AttendanceSummary({ records, totalWorkers }) {
  const counts = useMemo(() => {
    const c = { present: 0, absent: 0, half_day: 0, paid_leave: 0 }
    Object.values(records).forEach((r) => { if (c[r] !== undefined) c[r]++ })
    return c
  }, [records])

  const unmarked = totalWorkers - Object.keys(records).length

  return (
    <div className="flex flex-wrap gap-2 text-sm">
      {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
        <span key={key} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.cls}`}>
          {cfg.fullLabel}: {counts[key]}
        </span>
      ))}
      {unmarked > 0 && (
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-600">
          Unmarked: {unmarked}
        </span>
      )}
    </div>
  )
}

// ── WorkerAttendanceRow ────────────────────────────────────────────────────

function WorkerAttendanceRow({ worker, status, onCycle, siteName }) {
  const cfg = STATUS_CONFIG[status]

  return (
    <div className={`flex items-center justify-between rounded-lg border px-4 py-3 transition-all ${
      status === 'absent' ? 'border-red-100 bg-red-50/40'
      : status === 'half_day' ? 'border-yellow-100 bg-yellow-50/40'
      : status === 'paid_leave' ? 'border-blue-100 bg-blue-50/40'
      : status === 'present' ? 'border-green-100 bg-green-50/30'
      : 'border-gray-100 bg-white hover:bg-gray-50'
    }`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
          {worker.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-900">{worker.name}</p>
          <p className="flex items-center gap-1 text-xs text-gray-400">
            {worker.trade}
            {worker.employment_type === 'vendor' && worker.vendor_name && (
              <span className="flex items-center gap-0.5 ml-1 text-gray-400">
                <Building2 className="h-3 w-3" /> {worker.vendor_name}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Status cycle buttons */}
      <div className="flex items-center gap-1 flex-shrink-0 ml-3">
        {/* Quick-tap individual buttons */}
        <div className="hidden sm:flex gap-1">
          {STATUS_CYCLE.map((s) => {
            const c = STATUS_CONFIG[s]
            return (
              <button
                key={s}
                onClick={() => onCycle(worker.id, s)}
                title={c.fullLabel}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  status === s
                    ? `${c.cls} ring-2 ${c.ring} ring-offset-1 scale-105`
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {c.label}
              </button>
            )
          })}
        </div>

        {/* Mobile: tap to cycle */}
        <button
          onClick={() => onCycle(worker.id, STATUS_CYCLE[(STATUS_CYCLE.indexOf(status ?? 'absent') + 1) % STATUS_CYCLE.length])}
          className={`sm:hidden rounded-xl px-4 py-2 text-sm font-bold transition-all ${cfg ? cfg.cls : 'bg-gray-100 text-gray-500'}`}
          title="Tap to cycle status"
        >
          {cfg ? cfg.label : '?'}
        </button>
      </div>
    </div>
  )
}

// ── Main Attendance Page ───────────────────────────────────────────────────

export default function Attendance() {
  const profile  = useAuthStore((s) => s.profile)
  const { sites, fetchSites } = useSiteStore()
  const { workers, loading: workersLoading, fetchWorkers, fetchAttendance, saveAttendanceBulk } = useWorkerStore()

  const tenantId = profile?.tenant_id

  const [selectedSite, setSelectedSite] = useState('')
  const [date, setDate]                 = useState(todayISO)
  const [records, setRecords]           = useState({})   // { workerId: status }
  const [loadingAtt, setLoadingAtt]     = useState(false)
  const [saving, setSaving]             = useState(false)
  const [saved, setSaved]               = useState(false)
  const [error, setError]               = useState(null)

  // Init sites
  useEffect(() => {
    if (tenantId) fetchSites(tenantId)
  }, [tenantId, fetchSites])

  // Set default site once sites load
  useEffect(() => {
    if (sites.length > 0 && !selectedSite) {
      setSelectedSite(sites[0].id)
    }
  }, [sites, selectedSite])

  // Load workers for selected site
  useEffect(() => {
    if (selectedSite) fetchWorkers({ siteId: selectedSite })
  }, [selectedSite, fetchWorkers])

  // Load existing attendance when site or date changes
  useEffect(() => {
    if (!selectedSite || !date) return
    setLoadingAtt(true)
    setError(null)
    fetchAttendance(selectedSite, date)
      .then((data) => {
        // data = { workerId: { id, status, notes } }
        const map = {}
        Object.entries(data).forEach(([wId, rec]) => { map[wId] = rec.status })
        setRecords(map)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingAtt(false))
  }, [selectedSite, date, fetchAttendance])

  const activeWorkers = useMemo(
    () => workers.filter((w) => w.status === 'active'),
    [workers]
  )

  const handleCycle = useCallback((workerId, newStatus) => {
    setRecords((r) => ({ ...r, [workerId]: newStatus }))
    setSaved(false)
  }, [])

  const handleMarkAll = (status) => {
    const next = {}
    activeWorkers.forEach((w) => { next[w.id] = status })
    setRecords(next)
    setSaved(false)
  }

  const handleSave = async () => {
    if (!selectedSite || !date || activeWorkers.length === 0) return
    setSaving(true)
    setError(null)
    try {
      const recordsToSave = activeWorkers
        .filter((w) => records[w.id])
        .map((w) => ({ workerId: w.id, status: records[w.id], notes: null }))

      if (recordsToSave.length === 0) {
        setError('Mark at least one worker before saving.')
        return
      }

      await saveAttendanceBulk({ siteId: selectedSite, tenantId, date, records: recordsToSave })
      setSaved(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const shiftDate = (days) => {
    const d = new Date(date + 'T00:00:00')
    d.setDate(d.getDate() + days)
    setDate(d.toISOString().slice(0, 10))
    setSaved(false)
  }

  const markedCount = Object.keys(records).length
  const allMarked   = activeWorkers.length > 0 && markedCount >= activeWorkers.length

  return (
    <div>
      <PageHeader
        title="Daily Attendance"
        description="Mark worker presence for any site and date."
      />

      {/* Site + Date controls */}
      <div className="mb-5 flex flex-wrap items-end gap-3">
        <div>
          <label className="label">Site</label>
          <select
            className="input w-auto"
            value={selectedSite}
            onChange={(e) => { setSelectedSite(e.target.value); setSaved(false) }}
          >
            {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Date</label>
          <div className="flex items-center gap-1">
            <button onClick={() => shiftDate(-1)} className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50">
              <ChevronLeft className="h-4 w-4 text-gray-500" />
            </button>
            <input
              type="date"
              className="input"
              value={date}
              max={todayISO()}
              onChange={(e) => { setDate(e.target.value); setSaved(false) }}
            />
            <button
              onClick={() => shiftDate(1)}
              disabled={date >= todayISO()}
              className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4 text-gray-500" />
            </button>
            {date !== todayISO() && (
              <button
                onClick={() => { setDate(todayISO()); setSaved(false) }}
                className="ml-1 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700 hover:bg-brand-100"
              >
                Today
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Date display */}
      <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
        <CalendarDays className="h-4 w-4" />
        <span>{formatDisplayDate(date)}</span>
        {loadingAtt && <span className="text-xs text-gray-400 ml-2">Loading…</span>}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {workersLoading || loadingAtt ? (
        <p className="py-8 text-center text-sm text-gray-400">Loading…</p>
      ) : activeWorkers.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 py-12 text-center">
          <Users className="mx-auto mb-2 h-8 w-8 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">No active workers on this site</p>
          <p className="mt-1 text-xs text-gray-400">Onboard workers first from the Workers page.</p>
        </div>
      ) : (
        <>
          {/* Bulk actions + summary */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <AttendanceSummary records={records} totalWorkers={activeWorkers.length} />
            <div className="flex gap-2">
              <button
                onClick={() => handleMarkAll('present')}
                className="rounded-lg bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-200 transition-colors"
              >
                All Present
              </button>
              <button
                onClick={() => handleMarkAll('absent')}
                className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200 transition-colors"
              >
                All Absent
              </button>
            </div>
          </div>

          {/* Worker rows */}
          <div className="space-y-2 mb-5">
            {activeWorkers.map((w) => (
              <WorkerAttendanceRow
                key={w.id}
                worker={w}
                status={records[w.id]}
                onCycle={handleCycle}
              />
            ))}
          </div>

          {/* Save bar */}
          <div className="sticky bottom-4 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg">
            <p className="text-sm text-gray-500">
              {markedCount} / {activeWorkers.length} workers marked
              {allMarked && <span className="ml-2 text-green-600 font-medium">✓ All marked</span>}
            </p>
            <div className="flex items-center gap-3">
              {saved && <span className="text-sm text-green-600 font-medium">Saved ✓</span>}
              <button
                onClick={handleSave}
                disabled={saving || markedCount === 0}
                className="btn-primary flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving…' : 'Save Attendance'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
