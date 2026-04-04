import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Users, ArrowLeft, Phone } from 'lucide-react'
import useWorkerStore from '@/stores/workerStore'
import useAuthStore from '@/stores/authStore'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import { formatINR } from '@/lib/utils'

const TRADE_OPTIONS = [
  'Mason', 'Carpenter', 'Electrician', 'Plumber', 'Welder',
  'Painter', 'Helper / Labourer', 'Supervisor', 'Engineer', 'Other',
]

function WorkerForm({ siteId, onSubmit, loading }) {
  const [form, setForm] = useState({
    name: '', trade: 'Helper / Labourer', phone: '',
    daily_wage: '', status: 'active',
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...form, site_id: siteId }) }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Full name *</label>
          <input className="input" required value={form.name} onChange={set('name')} placeholder="Biren Das" />
        </div>
        <div>
          <label className="label">Trade</label>
          <select className="input" value={form.trade} onChange={set('trade')}>
            {TRADE_OPTIONS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Daily wage (₹)</label>
          <input className="input" type="number" min="0" value={form.daily_wage} onChange={set('daily_wage')} placeholder="600" />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98XXXXXXXX" />
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={set('status')}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end pt-1">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving…' : 'Add worker'}
        </button>
      </div>
    </form>
  )
}

export default function Workers() {
  const { siteId } = useParams()
  const navigate = useNavigate()
  const { workers, loading, fetchWorkers, createWorker } = useWorkerStore()
  const tenantId = useAuthStore((s) => s.profile?.tenant_id)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => { fetchWorkers(siteId) }, [siteId, fetchWorkers])

  const handleCreate = async (payload) => {
    setSaving(true)
    setError(null)
    try {
      await createWorker({ ...payload, site_id: siteId, tenant_id: tenantId, daily_wage: payload.daily_wage || null })
      setModalOpen(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <button onClick={() => navigate(`/sites/${siteId}`)} className="mb-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to site
      </button>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <PageHeader
        title="Workers"
        description="Labour roster for this site."
        action={
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> Add worker
          </button>
        }
      />

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : workers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No workers yet"
          description="Add workers to track attendance, wages, and trade assignments."
          action={<button onClick={() => setModalOpen(true)} className="btn-primary"><Plus className="h-4 w-4" /> Add worker</button>}
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Name', 'Trade', 'Daily wage', 'Phone', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {workers.map((w) => (
                <tr key={w.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{w.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{w.trade}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{w.daily_wage ? formatINR(w.daily_wage) : '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {w.phone ? (
                      <a href={`tel:${w.phone}`} className="flex items-center gap-1 hover:text-brand-600">
                        <Phone className="h-3 w-3" />{w.phone}
                      </a>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={w.status === 'active' ? 'badge-green' : 'badge-gray'}>{w.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Worker">
        <WorkerForm siteId={siteId} onSubmit={handleCreate} loading={saving} />
      </Modal>
    </div>
  )
}
