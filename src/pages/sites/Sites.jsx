import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, HardHat, Warehouse, CheckCircle, Clock, PauseCircle, PlayCircle } from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import useSiteStore from '@/stores/siteStore'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import { formatDate, formatINR } from '@/lib/utils'

const CAN_CREATE_SITES = ['superadmin', 'contractor']

const STATUS_OPTIONS = ['planning', 'active', 'on_hold', 'completed']

function SiteForm({ onSubmit, loading, error }) {
  const [form, setForm] = useState({
    name: '', location: '', status: 'planning',
    start_date: '', end_date: '', budget: '',
    description: '', type: 'construction_site',
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(form) }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Type *</label>
          <div className="flex gap-3">
            {[
              { value: 'construction_site', label: 'Construction site' },
              { value: 'warehouse',         label: 'Warehouse / Store' },
            ].map(({ value, label }) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="site_type" value={value}
                  checked={form.type === value} onChange={set('type')} />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="col-span-2">
          <label className="label">Name *</label>
          <input className="input" required value={form.name} onChange={set('name')}
            placeholder={form.type === 'warehouse' ? 'Guwahati Central Store' : 'NH-27 Bridge Work'} />
        </div>
        <div className="col-span-2">
          <label className="label">Location</label>
          <input className="input" value={form.location} onChange={set('location')} placeholder="Dimapur, Nagaland" />
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={set('status')}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Budget (INR)</label>
          <input className="input" type="number" min="0" value={form.budget} onChange={set('budget')} placeholder="5000000" />
        </div>
        <div>
          <label className="label">Start date</label>
          <input className="input" type="date" value={form.start_date} onChange={set('start_date')}
            style={{ WebkitAppearance: 'none' }} />
        </div>
        <div>
          <label className="label">End date</label>
          <input className="input" type="date" value={form.end_date} onChange={set('end_date')}
            style={{ WebkitAppearance: 'none' }} />
        </div>
        <div className="col-span-2">
          <label className="label">Description</label>
          <textarea className="input resize-none" rows={2} value={form.description} onChange={set('description')} />
        </div>
      </div>
      {error && (
        <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2 pt-1">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving…' : 'Create site'}
        </button>
      </div>
    </form>
  )
}

export default function Sites() {
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const { sites, loading, fetchSites, createSite } = useSiteStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const tenantId = profile?.tenant_id
  const canCreate = CAN_CREATE_SITES.includes(profile?.role)

  useEffect(() => {
    if (tenantId) fetchSites(tenantId)
  }, [tenantId, fetchSites])

  const handleCreate = async (form) => {
    if (!tenantId) { setSaveError('Profile not loaded yet — please try again.'); return }
    setSaving(true)
    setSaveError('')
    try {
      await createSite({ ...form, tenant_id: tenantId, budget: form.budget || null })
      setModalOpen(false)
    } catch (err) {
      setSaveError(err?.message ?? 'Failed to create site. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const statusClass = {
    active: 'badge-green',
    completed: 'badge-blue',
    planning: 'badge-yellow',
    on_hold: 'badge-gray',
  }
  const statusIcon = {
    active:    PlayCircle,
    completed: CheckCircle,
    planning:  Clock,
    on_hold:   PauseCircle,
  }
  const statusLabel = {
    active: 'Active', completed: 'Completed', planning: 'Planning', on_hold: 'On hold',
  }

  const warehouses       = sites.filter((s) => s.type === 'warehouse')
  const constructionSites = sites.filter((s) => s.type !== 'warehouse')

  const SiteCard = ({ site }) => (
    <button
      key={site.id}
      onClick={() => navigate(`/sites/${site.id}`)}
      className="card p-5 text-left hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-semibold text-gray-900 leading-tight">{site.name}</p>
        {(() => { const SI = statusIcon[site.status]; return (
          <span className={`${statusClass[site.status] ?? 'badge-gray'} gap-1`}>
            {SI && <SI className="h-3 w-3" />}
            {statusLabel[site.status] ?? site.status?.replace('_', ' ')}
          </span>
        ); })()}
      </div>
      {site.location && <p className="text-xs text-gray-500 mb-3">{site.location}</p>}
      <div className="flex justify-between text-xs text-gray-400">
        <span>{formatDate(site.start_date)}</span>
        {site.budget && <span className="font-medium text-gray-600">{formatINR(site.budget)}</span>}
      </div>
    </button>
  )

  return (
    <div>
      <PageHeader
        title="Sites"
        description="Manage your construction sites and warehouses."
        action={
          canCreate && (
            <button onClick={() => setModalOpen(true)} className="btn-primary">
              <Plus className="h-4 w-4" /> New site
            </button>
          )
        }
      />

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : sites.length === 0 ? (
        <EmptyState
          icon={HardHat}
          title="No sites yet"
          description={canCreate
            ? "Add your first construction site to get started tracking workers, materials, and progress."
            : "No sites have been assigned to you yet. Contact your contractor to get assigned."}
          action={
            canCreate && (
              <button onClick={() => setModalOpen(true)} className="btn-primary">
                <Plus className="h-4 w-4" /> Add site
              </button>
            )
          }
        />
      ) : (
        <div className="space-y-6">
          {warehouses.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Warehouse className="h-4 w-4 text-gray-400" />
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Warehouses</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {warehouses.map((site) => <SiteCard key={site.id} site={site} />)}
              </div>
            </div>
          )}
          {constructionSites.length > 0 && (
            <div>
              {warehouses.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <HardHat className="h-4 w-4 text-gray-400" />
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Construction Sites</h2>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {constructionSites.map((site) => <SiteCard key={site.id} site={site} />)}
              </div>
            </div>
          )}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setSaveError('') }} title="New Site">
        <SiteForm onSubmit={handleCreate} loading={saving} error={saveError} />
      </Modal>
    </div>
  )
}
