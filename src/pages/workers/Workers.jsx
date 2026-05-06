import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Users, Phone, CreditCard, Building2, UserCheck,
  UserX, ClipboardCheck, ChevronDown, ChevronUp, Search,
} from 'lucide-react'
import useWorkerStore from '@/stores/workerStore'
import useAuthStore from '@/stores/authStore'
import useSiteStore from '@/stores/siteStore'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'

// ── Constants ──────────────────────────────────────────────────────────────

const TRADE_OPTIONS = [
  'Mason', 'Bar Bender', 'Carpenter', 'Electrician', 'Plumber',
  'Welder', 'Painter', 'Tile Setter', 'Helper / Labourer',
  'Machine Operator', 'Driver', 'Supervisor', 'Engineer', 'Other',
]

const ID_PROOF_TYPES = [
  { value: 'aadhaar',          label: 'Aadhaar Card' },
  { value: 'pan',              label: 'PAN Card' },
  { value: 'voter_id',         label: 'Voter ID' },
  { value: 'driving_licence',  label: 'Driving Licence' },
  { value: 'other',            label: 'Other' },
]

const EMPLOYMENT_TYPES = [
  { value: 'direct', label: 'Direct Hire' },
  { value: 'vendor', label: 'Via Labour Vendor' },
]

const STATUS_BADGE = {
  active:   'badge-green',
  inactive: 'badge-gray',
}

// ── WorkerForm ─────────────────────────────────────────────────────────────

function WorkerForm({ sites, defaultSiteId, onSubmit, loading, onCancel }) {
  const [form, setForm] = useState({
    name:             '',
    trade:            'Helper / Labourer',
    phone:            '',
    daily_wage:       '',
    employment_type:  'direct',
    vendor_name:      '',
    id_proof_type:    '',
    id_proof_number:  '',
    address:          '',
    emergency_contact:'',
    site_id:          defaultSiteId ?? (sites[0]?.id ?? ''),
    status:           'active',
    joined_at:        new Date().toISOString().slice(0, 10),
  })

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    if (!form.site_id) return
    onSubmit({
      ...form,
      daily_wage:      form.daily_wage      ? Number(form.daily_wage)  : null,
      vendor_name:     form.employment_type === 'vendor' ? form.vendor_name.trim() || null : null,
      id_proof_type:   form.id_proof_type   || null,
      id_proof_number: form.id_proof_number.trim() || null,
      address:         form.address.trim()  || null,
      emergency_contact: form.emergency_contact.trim() || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Basic info */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Basic Info</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="label">Full name *</label>
            <input
              className="input" required
              value={form.name} onChange={set('name')}
              placeholder="e.g. Biren Das"
            />
          </div>
          <div>
            <label className="label">Trade / Skill *</label>
            <select className="input" value={form.trade} onChange={set('trade')}>
              {TRADE_OPTIONS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Daily wage (₹)</label>
            <input
              className="input" type="number" min="0" step="50"
              value={form.daily_wage} onChange={set('daily_wage')}
              placeholder="600"
            />
          </div>
          <div>
            <label className="label">Phone</label>
            <input
              className="input" type="tel"
              value={form.phone} onChange={set('phone')}
              placeholder="+91 98XXXXXXXX"
            />
          </div>
          <div>
            <label className="label">Joined date</label>
            <input className="input" type="date" value={form.joined_at} onChange={set('joined_at')} />
          </div>
        </div>
      </div>

      {/* Site assignment */}
      <div>
        <label className="label">Assign to Site *</label>
        <select className="input" value={form.site_id} onChange={set('site_id')} required>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Employment type */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Employment</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Employment Type</label>
            <select className="input" value={form.employment_type} onChange={set('employment_type')}>
              {EMPLOYMENT_TYPES.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
          </div>
          {form.employment_type === 'vendor' && (
            <div>
              <label className="label">Vendor / Contractor Name *</label>
              <input
                className="input"
                required={form.employment_type === 'vendor'}
                value={form.vendor_name} onChange={set('vendor_name')}
                placeholder="e.g. Sharma Labour Supply"
              />
            </div>
          )}
        </div>
      </div>

      {/* ID proof */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">ID Proof</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Proof Type</label>
            <select className="input" value={form.id_proof_type} onChange={set('id_proof_type')}>
              <option value="">— Select —</option>
              {ID_PROOF_TYPES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">ID Number</label>
            <input
              className="input"
              value={form.id_proof_number} onChange={set('id_proof_number')}
              placeholder="XXXX XXXX XXXX"
            />
          </div>
        </div>
      </div>

      {/* Address + emergency */}
      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="label">Home address</label>
          <input
            className="input"
            value={form.address} onChange={set('address')}
            placeholder="Village / Town, District"
          />
        </div>
        <div>
          <label className="label">Emergency contact</label>
          <input
            className="input" type="tel"
            value={form.emergency_contact} onChange={set('emergency_contact')}
            placeholder="+91 98XXXXXXXX (family member)"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving…' : 'Add Worker'}
        </button>
      </div>
    </form>
  )
}

// ── WorkerRow ──────────────────────────────────────────────────────────────

function WorkerRow({ worker, onToggleStatus, siteName }) {
  const [expanded, setExpanded] = useState(false)
  const proofLabel = ID_PROOF_TYPES.find((p) => p.value === worker.id_proof_type)?.label

  return (
    <>
      <tr
        className={`cursor-pointer transition-colors ${worker.status === 'inactive' ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50'}`}
        onClick={() => setExpanded((e) => !e)}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
              {worker.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{worker.name}</p>
              <p className="text-xs text-gray-400">{worker.trade}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">{siteName ?? '—'}</td>
        <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">
          {worker.employment_type === 'vendor' ? (
            <span className="flex items-center gap-1 text-xs">
              <Building2 className="h-3 w-3 text-gray-400" />
              {worker.vendor_name ?? 'Vendor'}
            </span>
          ) : (
            <span className="text-xs text-gray-400">Direct</span>
          )}
        </td>
        <td className="px-4 py-3 text-sm font-medium text-gray-900 hidden sm:table-cell">
          {worker.daily_wage ? `₹${Number(worker.daily_wage).toLocaleString('en-IN')}` : '—'}
        </td>
        <td className="px-4 py-3">
          <span className={STATUS_BADGE[worker.status] ?? 'badge-gray'}>{worker.status}</span>
        </td>
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleStatus(worker) }}
              className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                worker.status === 'active'
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-green-600 hover:bg-green-50'
              }`}
            >
              {worker.status === 'active' ? 'Deactivate' : 'Activate'}
            </button>
            {expanded
              ? <ChevronUp className="h-4 w-4 text-gray-400" />
              : <ChevronDown className="h-4 w-4 text-gray-400" />
            }
          </div>
        </td>
      </tr>

      {expanded && (
        <tr className="bg-brand-50/30">
          <td colSpan={6} className="px-6 pb-4 pt-2">
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-4">
              <div>
                <p className="text-xs text-gray-400">Phone</p>
                <p className="font-medium">
                  {worker.phone
                    ? <a href={`tel:${worker.phone}`} className="flex items-center gap-1 text-brand-600"><Phone className="h-3 w-3" />{worker.phone}</a>
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">ID Proof</p>
                <p className="font-medium flex items-center gap-1">
                  {worker.id_proof_type
                    ? <><CreditCard className="h-3 w-3 text-gray-400" />{proofLabel}{worker.id_proof_number ? ` · ${worker.id_proof_number}` : ''}</>
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Emergency contact</p>
                <p className="font-medium">{worker.emergency_contact ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Address</p>
                <p className="font-medium">{worker.address ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Joined</p>
                <p className="font-medium">{worker.joined_at ?? '—'}</p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

// ── Main Workers Page ──────────────────────────────────────────────────────

export default function Workers() {
  const navigate = useNavigate()
  const profile  = useAuthStore((s) => s.profile)
  const { sites, fetchSites } = useSiteStore()
  const { workers, loading, error, fetchWorkers, createWorker, updateWorker } = useWorkerStore()

  const tenantId = profile?.tenant_id
  const role     = profile?.role

  const [selectedSite, setSelectedSite] = useState('all')
  const [statusFilter, setStatusFilter] = useState('active')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen]       = useState(false)
  const [saving, setSaving]             = useState(false)
  const [saveError, setSaveError]       = useState(null)

  useEffect(() => {
    if (tenantId) {
      fetchSites(tenantId)
      fetchWorkers({ tenantId })
    }
  }, [tenantId, fetchSites, fetchWorkers])

  // Build a siteId→name map
  const siteMap = useMemo(
    () => Object.fromEntries(sites.map((s) => [s.id, s.name])),
    [sites]
  )

  const filtered = useMemo(() => {
    let list = workers
    if (selectedSite !== 'all') list = list.filter((w) => w.site_id === selectedSite)
    if (statusFilter !== 'all')  list = list.filter((w) => w.status === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.trade?.toLowerCase().includes(q) ||
          w.vendor_name?.toLowerCase().includes(q)
      )
    }
    return list
  }, [workers, selectedSite, statusFilter, search])

  const stats = useMemo(() => {
    const active   = workers.filter((w) => w.status === 'active').length
    const inactive = workers.filter((w) => w.status === 'inactive').length
    const vendors  = workers.filter((w) => w.employment_type === 'vendor' && w.status === 'active').length
    const direct   = workers.filter((w) => w.employment_type === 'direct' && w.status === 'active').length
    return { active, inactive, vendors, direct }
  }, [workers])

  const handleCreate = async (payload) => {
    setSaving(true)
    setSaveError(null)
    try {
      await createWorker({ ...payload, tenant_id: tenantId })
      setModalOpen(false)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (worker) => {
    try {
      await updateWorker(worker.id, {
        status: worker.status === 'active' ? 'inactive' : 'active',
      })
    } catch (err) {
      console.error('Status toggle failed:', err.message)
    }
  }

  return (
    <div>
      <PageHeader
        title="Workers"
        description="Labour roster across all your sites — onboarding, ID proof, and status."
        action={
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/attendance')}
              className="btn-secondary flex items-center gap-2"
            >
              <ClipboardCheck className="h-4 w-4" /> Mark Attendance
            </button>
            <button onClick={() => setModalOpen(true)} className="btn-primary">
              <Plus className="h-4 w-4" /> Add Worker
            </button>
          </div>
        }
      />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Active"    value={stats.active}   icon={UserCheck} color="green" />
        <StatCard label="Inactive"  value={stats.inactive} icon={UserX}     color="red" />
        <StatCard label="Direct"    value={stats.direct}   icon={Users}     color="brand" />
        <StatCard label="Via Vendor" value={stats.vendors} icon={Building2} color="sage" />
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* Site filter */}
        <select
          className="input w-auto text-sm"
          value={selectedSite}
          onChange={(e) => setSelectedSite(e.target.value)}
        >
          <option value="all">All Sites</option>
          {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        {/* Status filter */}
        <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden text-sm">
          {[['all', 'All'], ['active', 'Active'], ['inactive', 'Inactive']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setStatusFilter(val)}
              className={`px-3 py-1.5 font-medium transition-colors ${
                statusFilter === val
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            className="input pl-9 text-sm"
            placeholder="Search by name, trade, vendor…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500 py-8 text-center">Loading workers…</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={workers.length === 0 ? 'No workers yet' : 'No workers match this filter'}
          description={workers.length === 0
            ? 'Start by onboarding your first worker — fill in their ID proof and trade details.'
            : 'Try changing the site or status filter.'}
          action={workers.length === 0
            ? <button onClick={() => setModalOpen(true)} className="btn-primary"><Plus className="h-4 w-4" /> Add Worker</button>
            : null}
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Worker</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">Site</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide hidden sm:table-cell">Employment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide hidden sm:table-cell">Daily Wage</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filtered.map((w) => (
                <WorkerRow
                  key={w.id}
                  worker={w}
                  siteName={siteMap[w.site_id]}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
            </tbody>
          </table>
          <div className="border-t border-gray-100 px-4 py-2 text-xs text-gray-400">
            {filtered.length} worker{filtered.length !== 1 ? 's' : ''} shown
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setSaveError(null) }} title="Onboard New Worker">
        {saveError && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{saveError}</div>
        )}
        <WorkerForm
          sites={sites}
          defaultSiteId={selectedSite !== 'all' ? selectedSite : sites[0]?.id}
          onSubmit={handleCreate}
          loading={saving}
          onCancel={() => { setModalOpen(false); setSaveError(null) }}
        />
      </Modal>
    </div>
  )
}
