import { useEffect, useState } from 'react'
import { Plus, Wrench, CheckCircle, AlertCircle, Clock, XCircle, UserCheck, RotateCcw, Settings } from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import useSiteStore from '@/stores/siteStore'
import useEquipmentAssetStore from '@/stores/equipmentAssetStore'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import { formatINR } from '@/lib/utils'

const STATUS_BADGE  = { available: 'badge-green', in_use: 'badge-blue', maintenance: 'badge-yellow', retired: 'badge-gray' }
const STATUS_ICON   = { available: CheckCircle, in_use: UserCheck, maintenance: Settings, retired: XCircle }
const STATUS_LABELS = { available: 'Available', in_use: 'In Use', maintenance: 'Maintenance', retired: 'Retired' }
const COND_LABELS   = { good: 'Good condition', damaged: 'Damaged', lost: 'Lost' }

function AddAssetForm({ sites, tenantId, onSubmit, loading }) {
  const [form, setForm] = useState({
    site_id: sites[0]?.id ?? '', material_id: '',
    serial_number: '', make: '', model: '', year_of_mfg: '',
    purchase_date: '', purchase_cost: '', purchase_order: '', supplier: '', warranty_expiry: '', notes: '',
  })
  const [siteMaterials, setSiteMaterials] = useState([])
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const { supabase } = window.__supabase ?? {}

  useEffect(() => {
    if (!form.site_id) return
    import('@/lib/supabase').then(({ supabase: sb }) => {
      sb.from('materials').select('id, name, unit').eq('site_id', form.site_id).eq('category', 'equipment').order('name')
        .then(({ data }) => { setSiteMaterials(data ?? []); setForm((f) => ({ ...f, material_id: data?.[0]?.id ?? '' })) })
    })
  }, [form.site_id])

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...form, tenant_id: tenantId }) }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Site *</label>
          <select className="input" required value={form.site_id} onChange={set('site_id')}>
            {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Equipment type *</label>
          <select className="input" required value={form.material_id} onChange={set('material_id')}>
            <option value="">— Select —</option>
            {siteMaterials.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
          </select>
          {siteMaterials.length === 0 && (
            <p className="mt-1 text-xs text-amber-600">No equipment-category materials on this site. Add one in Inventory first.</p>
          )}
        </div>
        <div><label className="label">Make</label><input className="input" value={form.make} onChange={set('make')} placeholder="JCB" /></div>
        <div><label className="label">Model</label><input className="input" value={form.model} onChange={set('model')} placeholder="3DX Super" /></div>
        <div><label className="label">Serial number</label><input className="input" value={form.serial_number} onChange={set('serial_number')} placeholder="SN-12345678" /></div>
        <div><label className="label">Year of manufacture</label><input className="input" type="number" min="1990" max="2030" value={form.year_of_mfg} onChange={set('year_of_mfg')} placeholder="2022" /></div>
        <div><label className="label">Purchase date</label><input className="input" type="date" value={form.purchase_date} onChange={set('purchase_date')} /></div>
        <div><label className="label">Purchase cost (₹)</label><input className="input" type="number" min="0" value={form.purchase_cost} onChange={set('purchase_cost')} /></div>
        <div><label className="label">PO number</label><input className="input" value={form.purchase_order} onChange={set('purchase_order')} placeholder="PO-2024-001" /></div>
        <div><label className="label">Supplier</label><input className="input" value={form.supplier} onChange={set('supplier')} placeholder="Equipment supplier name" /></div>
        <div><label className="label">Warranty expiry</label><input className="input" type="date" value={form.warranty_expiry} onChange={set('warranty_expiry')} /></div>
        <div className="col-span-2"><label className="label">Notes</label><input className="input" value={form.notes} onChange={set('notes')} /></div>
      </div>
      <div className="flex justify-end pt-1">
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving…' : 'Register Asset'}</button>
      </div>
    </form>
  )
}

function AssignForm({ asset, sites, onSubmit, loading }) {
  const [form, setForm] = useState({ assigned_to_name: '', zone: '' })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <div className="rounded-lg bg-gray-50 px-4 py-3">
        <p className="text-sm font-semibold text-gray-900">{asset.asset_code} — {asset.material?.name}</p>
        <p className="text-xs text-gray-500">{asset.site?.name}</p>
      </div>
      <div>
        <label className="label">Assigned to (name) *</label>
        <input className="input" required value={form.assigned_to_name} onChange={set('assigned_to_name')} placeholder="Operator / Person name" />
      </div>
      <div>
        <label className="label">Zone / Location</label>
        <input className="input" value={form.zone} onChange={set('zone')} placeholder="e.g. Block B, 2nd floor excavation" />
      </div>
      <div className="flex justify-end pt-1">
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving…' : 'Assign'}</button>
      </div>
    </form>
  )
}

function ReturnForm({ asset, onSubmit, loading }) {
  const [form, setForm] = useState({ return_condition: 'good', note: '' })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <div className="rounded-lg bg-gray-50 px-4 py-3">
        <p className="text-sm font-semibold text-gray-900">{asset.asset_code} — {asset.material?.name}</p>
        <p className="text-xs text-gray-500">Currently assigned to: {asset.current_assignee_name ?? 'Unknown'}</p>
      </div>
      <div>
        <label className="label">Condition on return *</label>
        <select className="input" value={form.return_condition} onChange={set('return_condition')}>
          <option value="good">Good condition</option>
          <option value="damaged">Damaged</option>
          <option value="lost">Lost</option>
        </select>
      </div>
      <div>
        <label className="label">Note</label>
        <input className="input" value={form.note} onChange={set('note')} placeholder="Optional remarks" />
      </div>
      <div className="flex justify-end pt-1">
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving…' : 'Mark Returned'}</button>
      </div>
    </form>
  )
}

function MaintenanceForm({ asset, onSubmit, loading }) {
  const [form, setForm] = useState({
    service_type: 'scheduled', description: '', serviced_by: '',
    service_date: new Date().toISOString().slice(0, 10), next_service_date: '', cost: '',
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <div className="rounded-lg bg-gray-50 px-4 py-3">
        <p className="text-sm font-semibold text-gray-900">{asset.asset_code} — {asset.material?.name}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Service type *</label>
          <select className="input" value={form.service_type} onChange={set('service_type')}>
            <option value="scheduled">Scheduled</option>
            <option value="breakdown">Breakdown repair</option>
            <option value="inspection">Inspection</option>
          </select>
        </div>
        <div><label className="label">Serviced by</label><input className="input" value={form.serviced_by} onChange={set('serviced_by')} placeholder="Vendor / mechanic" /></div>
        <div><label className="label">Service date *</label><input className="input" type="date" required value={form.service_date} onChange={set('service_date')} /></div>
        <div><label className="label">Est. cost (₹)</label><input className="input" type="number" min="0" value={form.cost} onChange={set('cost')} /></div>
        <div className="col-span-2"><label className="label">Description</label><input className="input" value={form.description} onChange={set('description')} placeholder="What work is being done" /></div>
        <div><label className="label">Next service date</label><input className="input" type="date" value={form.next_service_date} onChange={set('next_service_date')} /></div>
      </div>
      <div className="flex justify-end pt-1">
        <button type="submit" disabled={loading} className="btn-danger">{loading ? 'Saving…' : 'Send to Maintenance'}</button>
      </div>
    </form>
  )
}

function AssetDetailModal({ asset, onClose }) {
  const { assignments, maintenance, fetchAssignmentHistory, fetchMaintenanceHistory, completeMaintenance, returnAsset } = useEquipmentAssetStore()
  const [tab, setTab] = useState('details')
  const [completing, setCompleting] = useState(null)

  useEffect(() => {
    if (tab === 'history')     fetchAssignmentHistory(asset.id)
    if (tab === 'maintenance') fetchMaintenanceHistory(asset.id)
  }, [tab, asset.id])

  const details = [
    ['Asset Code',      asset.asset_code],
    ['Type',            asset.material?.name ?? '—'],
    ['Site',            asset.site?.name ?? '—'],
    ['Make / Model',    [asset.make, asset.model].filter(Boolean).join(' ') || '—'],
    ['Serial Number',   asset.serial_number ?? '—'],
    ['Year of Mfg',     asset.year_of_mfg ?? '—'],
    ['Purchase Date',   asset.purchase_date ?? '—'],
    ['Purchase Cost',   asset.purchase_cost ? formatINR(asset.purchase_cost) : '—'],
    ['PO Number',       asset.purchase_order ?? '—'],
    ['Supplier',        asset.supplier ?? '—'],
    ['Warranty Expiry', asset.warranty_expiry ?? '—'],
    ['Last Service',    asset.last_service_date ?? '—'],
    ['Next Service',    asset.next_service_date ?? '—'],
    ['Current Assignee', asset.current_assignee_name ?? '—'],
    ['Zone',            asset.current_zone ?? '—'],
    ['Notes',           asset.notes ?? '—'],
  ]

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {[['details', 'Details'], ['history', 'Assignment History'], ['maintenance', 'Maintenance']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === key ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'details' && (
        <div className="space-y-2">
          {details.map(([label, val]) => (
            <div key={label} className="flex gap-3">
              <span className="w-32 flex-shrink-0 text-xs text-gray-500">{label}</span>
              <span className="text-sm text-gray-900">{val}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'history' && (
        assignments.length === 0
          ? <p className="py-6 text-center text-sm text-gray-500">No assignment history.</p>
          : <div className="divide-y divide-gray-100">
              {assignments.map((a) => (
                <div key={a.id} className="py-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{a.assigned_to_name ?? a.assigned_to_profile_obj?.full_name ?? 'Unknown'}</p>
                      {a.zone && <p className="text-xs text-gray-500">Zone: {a.zone}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{new Date(a.assigned_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                      {a.returned_at && (
                        <p className="text-xs text-gray-500">
                          Returned: {new Date(a.returned_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          {a.return_condition && ` (${COND_LABELS[a.return_condition] ?? a.return_condition})`}
                        </p>
                      )}
                      {!a.returned_at && <span className="badge-blue">Active</span>}
                    </div>
                  </div>
                  {a.note && <p className="text-xs text-gray-500 mt-1">{a.note}</p>}
                </div>
              ))}
            </div>
      )}

      {tab === 'maintenance' && (
        maintenance.length === 0
          ? <p className="py-6 text-center text-sm text-gray-500">No maintenance records.</p>
          : <div className="divide-y divide-gray-100">
              {maintenance.map((m) => (
                <div key={m.id} className="py-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">{m.service_type} — {m.description || 'No description'}</p>
                      <p className="text-xs text-gray-500">{m.serviced_by ? `By: ${m.serviced_by}` : ''} {m.cost ? `| Cost: ${formatINR(m.cost)}` : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{m.service_date}</p>
                      <span className={m.status === 'completed' ? 'badge-green' : m.status === 'in_progress' ? 'badge-yellow' : 'badge-gray'}>
                        {m.status}
                      </span>
                    </div>
                  </div>
                  {m.next_service_date && <p className="text-xs text-gray-400 mt-1">Next: {m.next_service_date}</p>}
                  {m.status === 'in_progress' && (
                    <button
                      disabled={completing === m.id}
                      onClick={async () => {
                        setCompleting(m.id)
                        await completeMaintenance(m.id, asset.id, { nextServiceDate: m.next_service_date })
                        await fetchMaintenanceHistory(asset.id)
                        setCompleting(null)
                      }}
                      className="mt-2 rounded px-2 py-1 text-xs text-green-700 hover:bg-green-50 border border-green-200"
                    >
                      {completing === m.id ? 'Saving…' : 'Mark Completed'}
                    </button>
                  )}
                </div>
              ))}
            </div>
      )}
    </div>
  )
}

export default function EquipmentAssets() {
  const profile  = useAuthStore((s) => s.profile)
  const { sites, fetchSites } = useSiteStore()
  const { assets, loading, fetchAssets, createAsset, assignAsset, returnAsset, sendToMaintenance, retireAsset } = useEquipmentAssetStore()

  const [filterSite,   setFilterSite]   = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [addOpen,      setAddOpen]      = useState(false)
  const [saving,       setSaving]       = useState(false)
  const [acting,       setActing]       = useState(null)
  const [error,        setError]        = useState(null)
  const [detailAsset,  setDetailAsset]  = useState(null)
  const [assignTarget, setAssignTarget] = useState(null)
  const [returnTarget, setReturnTarget] = useState(null)
  const [maintTarget,  setMaintTarget]  = useState(null)
  const [retireTarget, setRetireTarget] = useState(null)

  const tenantId = profile?.tenant_id
  const role     = profile?.role
  const canManage = ['superadmin', 'contractor', 'site_manager', 'store_keeper'].includes(role)
  const canRetire = ['superadmin', 'contractor', 'site_manager'].includes(role)

  useEffect(() => {
    if (!tenantId) return
    fetchSites(tenantId)
    fetchAssets(tenantId, filterSite !== 'all' ? { siteId: filterSite } : {})
  }, [tenantId, filterSite])

  const statusCounts = assets.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1
    return acc
  }, {})

  const filtered = filterStatus === 'all' ? assets : assets.filter((a) => a.status === filterStatus)

  const handleCreate = async (payload) => {
    setSaving(true); setError(null)
    try { await createAsset({ ...payload, created_by: profile?.id }); setAddOpen(false) }
    catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const handleAssign = async (form) => {
    setActing('assign'); setError(null)
    try {
      await assignAsset(assignTarget.id, { ...form, assignedBy: profile?.id })
      setAssignTarget(null)
    } catch (err) { setError(err.message) }
    finally { setActing(null) }
  }

  const handleReturn = async (form) => {
    setActing('return'); setError(null)
    try {
      await returnAsset(returnTarget.id, { ...form, returnedBy: profile?.id })
      setReturnTarget(null)
    } catch (err) { setError(err.message) }
    finally { setActing(null) }
  }

  const handleMaintenance = async (form) => {
    setActing('maint'); setError(null)
    try {
      await sendToMaintenance(maintTarget.id, { ...form, createdBy: profile?.id })
      setMaintTarget(null)
    } catch (err) { setError(err.message) }
    finally { setActing(null) }
  }

  const handleRetire = async () => {
    setActing('retire'); setError(null)
    try {
      await retireAsset(retireTarget.id, { reason: '', retiredBy: profile?.id })
      setRetireTarget(null)
    } catch (err) { setError(err.message) }
    finally { setActing(null) }
  }

  return (
    <div>
      <PageHeader
        title="Equipment Register"
        description="Individual asset tracking — assignment, maintenance, and lifecycle management."
        action={
          canManage && (
            <button onClick={() => setAddOpen(true)} className="btn-primary">
              <Plus className="h-4 w-4" /> Register Asset
            </button>
          )
        }
      />

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {/* Status summary pills */}
      <div className="mb-4 grid grid-cols-4 gap-3">
        {[['available', 'Available', 'bg-green-50 border-green-200 text-green-700'],
          ['in_use',    'In Use',    'bg-blue-50 border-blue-200 text-blue-700'],
          ['maintenance','Maintenance','bg-yellow-50 border-yellow-200 text-yellow-700'],
          ['retired',   'Retired',   'bg-gray-50 border-gray-200 text-gray-600'],
        ].map(([key, label, cls]) => (
          <button key={key} onClick={() => setFilterStatus(filterStatus === key ? 'all' : key)}
            className={`rounded-lg border p-3 text-center transition-all ${cls} ${filterStatus === key ? 'ring-2 ring-offset-1 ring-brand-400' : ''}`}
          >
            <p className="text-xl font-bold">{statusCounts[key] ?? 0}</p>
            <p className="text-xs font-medium">{label}</p>
          </button>
        ))}
      </div>

      {/* Site filter */}
      <div className="mb-4 flex flex-wrap gap-2">
        {['all', ...sites.map((s) => s.id)].map((id) => {
          const label = id === 'all' ? 'All Sites' : sites.find((s) => s.id === id)?.name ?? id
          return (
            <button key={id} onClick={() => setFilterSite(id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                filterSite === id ? 'bg-brand-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading assets…</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No equipment assets registered"
          description="Register individual equipment assets to track assignments, maintenance, and lifecycle."
          action={canManage && <button onClick={() => setAddOpen(true)} className="btn-primary"><Plus className="h-4 w-4" /> Register Asset</button>}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Asset Code', 'Type', 'Make / Model', 'Serial No.', 'Site', 'Status', 'Assignee', 'Warranty', 'Actions'].map((h) => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filtered.map((asset) => {
                const StatusIcon = STATUS_ICON[asset.status] ?? Clock
                const warrantyExpired = asset.warranty_expiry && new Date(asset.warranty_expiry) < new Date()
                return (
                  <tr key={asset.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 text-sm font-mono font-semibold text-brand-700">{asset.asset_code}</td>
                    <td className="px-3 py-3 text-sm font-medium text-gray-900">{asset.material?.name ?? '—'}</td>
                    <td className="px-3 py-3 text-sm text-gray-600">
                      {[asset.make, asset.model].filter(Boolean).join(' ') || '—'}
                    </td>
                    <td className="px-3 py-3 text-xs font-mono text-gray-500">{asset.serial_number || '—'}</td>
                    <td className="px-3 py-3 text-xs text-gray-500 max-w-[100px] truncate">{asset.site?.name ?? '—'}</td>
                    <td className="px-3 py-3">
                      <span className={`${STATUS_BADGE[asset.status] ?? 'badge-gray'} flex items-center gap-1 w-fit`}>
                        <StatusIcon className="h-3 w-3" />
                        {STATUS_LABELS[asset.status] ?? asset.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-600 max-w-[120px] truncate">
                      {asset.current_assignee_name ?? (asset.status === 'in_use' ? 'Assigned' : '—')}
                      {asset.current_zone && <span className="block text-xs text-gray-400">{asset.current_zone}</span>}
                    </td>
                    <td className="px-3 py-3 text-xs">
                      {asset.warranty_expiry
                        ? <span className={warrantyExpired ? 'text-red-600' : 'text-gray-500'}>{asset.warranty_expiry}{warrantyExpired ? ' (expired)' : ''}</span>
                        : <span className="text-gray-400">—</span>
                      }
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setDetailAsset(asset)} className="rounded px-2 py-1 text-xs text-brand-600 hover:bg-brand-50">View</button>
                        {asset.status === 'available' && canManage && (
                          <button onClick={() => setAssignTarget(asset)} className="rounded px-2 py-1 text-xs text-blue-700 hover:bg-blue-50">Assign</button>
                        )}
                        {asset.status === 'in_use' && canManage && (
                          <button onClick={() => setReturnTarget(asset)} className="rounded px-2 py-1 text-xs text-green-700 hover:bg-green-50">Return</button>
                        )}
                        {['available', 'in_use'].includes(asset.status) && canManage && (
                          <button onClick={() => setMaintTarget(asset)} className="rounded px-2 py-1 text-xs text-yellow-700 hover:bg-yellow-50">Service</button>
                        )}
                        {asset.status !== 'retired' && canRetire && (
                          <button onClick={() => setRetireTarget(asset)} className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50">Retire</button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}

      <Modal open={addOpen}          onClose={() => { setAddOpen(false); setError(null) }}  title="Register Equipment Asset">
        <AddAssetForm sites={sites} tenantId={tenantId} onSubmit={handleCreate} loading={saving} />
      </Modal>
      <Modal open={!!assignTarget}   onClose={() => setAssignTarget(null)}  title="Assign Asset">
        {assignTarget && <AssignForm asset={assignTarget} sites={sites} onSubmit={handleAssign} loading={acting === 'assign'} />}
      </Modal>
      <Modal open={!!returnTarget}   onClose={() => setReturnTarget(null)}  title="Return Asset">
        {returnTarget && <ReturnForm asset={returnTarget} onSubmit={handleReturn} loading={acting === 'return'} />}
      </Modal>
      <Modal open={!!maintTarget}    onClose={() => setMaintTarget(null)}   title="Send to Maintenance">
        {maintTarget && <MaintenanceForm asset={maintTarget} onSubmit={handleMaintenance} loading={acting === 'maint'} />}
      </Modal>
      <Modal open={!!retireTarget}   onClose={() => setRetireTarget(null)}  title="Retire Asset">
        {retireTarget && (
          <div className="space-y-4">
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm font-medium text-red-800">Retire {retireTarget.asset_code} — {retireTarget.material?.name}?</p>
              <p className="text-xs text-red-600 mt-1">This will permanently mark the asset as retired and reduce the material count by 1. This cannot be undone.</p>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setRetireTarget(null)} className="btn-secondary">Cancel</button>
              <button disabled={acting === 'retire'} onClick={handleRetire} className="btn-danger">
                {acting === 'retire' ? 'Retiring…' : 'Retire Asset'}
              </button>
            </div>
          </div>
        )}
      </Modal>
      <Modal open={!!detailAsset}    onClose={() => setDetailAsset(null)}   title={`Asset ${detailAsset?.asset_code ?? ''}`}>
        {detailAsset && <AssetDetailModal asset={detailAsset} onClose={() => setDetailAsset(null)} />}
      </Modal>
    </div>
  )
}
