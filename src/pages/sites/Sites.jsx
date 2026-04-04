import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, HardHat } from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import useSiteStore from '@/stores/siteStore'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import { formatDate, formatINR } from '@/lib/utils'

const CAN_CREATE_SITES = ['superadmin', 'contractor']

const STATUS_OPTIONS = ['planning', 'active', 'on_hold', 'completed']

function SiteForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    name: '', location: '', status: 'planning',
    start_date: '', end_date: '', budget: '',
    description: '',
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(form) }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Site name *</label>
          <input className="input" required value={form.name} onChange={set('name')} placeholder="NH-27 Bridge Work" />
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
          <input className="input" type="date" value={form.start_date} onChange={set('start_date')} />
        </div>
        <div>
          <label className="label">End date</label>
          <input className="input" type="date" value={form.end_date} onChange={set('end_date')} />
        </div>
        <div className="col-span-2">
          <label className="label">Description</label>
          <textarea className="input resize-none" rows={2} value={form.description} onChange={set('description')} />
        </div>
      </div>
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

  const tenantId = profile?.tenant_id
  const canCreate = CAN_CREATE_SITES.includes(profile?.role)

  useEffect(() => {
    if (tenantId) fetchSites(tenantId)
  }, [tenantId, fetchSites])

  const handleCreate = async (form) => {
    setSaving(true)
    try {
      await createSite({ ...form, tenant_id: tenantId, budget: form.budget || null })
      setModalOpen(false)
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

  return (
    <div>
      <PageHeader
        title="Sites"
        description="Manage all your active and upcoming construction sites."
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => (
            <button
              key={site.id}
              onClick={() => navigate(`/sites/${site.id}`)}
              className="card p-5 text-left hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="font-semibold text-gray-900 leading-tight">{site.name}</p>
                <span className={statusClass[site.status] ?? 'badge-gray'}>{site.status?.replace('_', ' ')}</span>
              </div>
              {site.location && <p className="text-xs text-gray-500 mb-3">{site.location}</p>}
              <div className="flex justify-between text-xs text-gray-400">
                <span>{formatDate(site.start_date)}</span>
                {site.budget && <span className="font-medium text-gray-600">{formatINR(site.budget)}</span>}
              </div>
            </button>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Construction Site">
        <SiteForm onSubmit={handleCreate} loading={saving} />
      </Modal>
    </div>
  )
}
