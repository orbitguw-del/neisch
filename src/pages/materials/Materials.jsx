import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Package, ArrowLeft, AlertTriangle } from 'lucide-react'
import useMaterialStore from '@/stores/materialStore'
import useAuthStore from '@/stores/authStore'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import { formatINR } from '@/lib/utils'

const UNIT_OPTIONS = ['bags', 'kg', 'tonnes', 'pieces', 'sq ft', 'cu ft', 'cu m', 'litres', 'bundles', 'nos']

function MaterialForm({ siteId, onSubmit, loading }) {
  const [form, setForm] = useState({
    name: '', unit: 'bags', quantity_available: '',
    quantity_minimum: '', unit_cost: '', supplier: '',
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...form, site_id: siteId }) }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Material name *</label>
          <input className="input" required value={form.name} onChange={set('name')} placeholder="Portland Cement (OPC 53)" />
        </div>
        <div>
          <label className="label">Unit</label>
          <select className="input" value={form.unit} onChange={set('unit')}>
            {UNIT_OPTIONS.map((u) => <option key={u}>{u}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Unit cost (₹)</label>
          <input className="input" type="number" min="0" value={form.unit_cost} onChange={set('unit_cost')} placeholder="380" />
        </div>
        <div>
          <label className="label">Qty available</label>
          <input className="input" type="number" min="0" value={form.quantity_available} onChange={set('quantity_available')} placeholder="200" />
        </div>
        <div>
          <label className="label">Reorder level</label>
          <input className="input" type="number" min="0" value={form.quantity_minimum} onChange={set('quantity_minimum')} placeholder="50" />
        </div>
        <div className="col-span-2">
          <label className="label">Supplier</label>
          <input className="input" value={form.supplier} onChange={set('supplier')} placeholder="Assam Cement Depot, Guwahati" />
        </div>
      </div>
      <div className="flex justify-end pt-1">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving…' : 'Add material'}
        </button>
      </div>
    </form>
  )
}

export default function Materials() {
  const { siteId } = useParams()
  const navigate = useNavigate()
  const { materials, loading, fetchMaterials, createMaterial } = useMaterialStore()
  const tenantId = useAuthStore((s) => s.profile?.tenant_id)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => { fetchMaterials(siteId) }, [siteId, fetchMaterials])

  const handleCreate = async (payload) => {
    setSaving(true)
    setError(null)
    try {
      await createMaterial({
        ...payload,
        site_id: siteId,
        tenant_id: tenantId,
        unit_cost: payload.unit_cost || null,
        quantity_available: payload.quantity_available || null,
        quantity_minimum: payload.quantity_minimum || null,
      })
      setModalOpen(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const isLow = (m) =>
    m.quantity_minimum != null && m.quantity_available != null &&
    Number(m.quantity_available) <= Number(m.quantity_minimum)

  return (
    <div>
      <button onClick={() => navigate(`/sites/${siteId}`)} className="mb-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to site
      </button>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <PageHeader
        title="Materials"
        description="Inventory tracking for this site."
        action={
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> Add material
          </button>
        }
      />

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : materials.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No materials tracked"
          description="Add materials to monitor inventory levels and set reorder alerts."
          action={<button onClick={() => setModalOpen(true)} className="btn-primary"><Plus className="h-4 w-4" /> Add material</button>}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {['Material', 'Unit', 'Available', 'Reorder at', 'Unit cost', 'Supplier'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {materials.map((m) => (
                  <tr key={m.id} className={isLow(m) ? 'bg-red-50' : 'hover:bg-gray-50'}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-1.5">
                        {isLow(m) && <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />}
                        {m.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{m.unit}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{m.quantity_available ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{m.quantity_minimum ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{m.unit_cost ? formatINR(m.unit_cost) : '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{m.supplier || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Material">
        <MaterialForm siteId={siteId} onSubmit={handleCreate} loading={saving} />
      </Modal>
    </div>
  )
}
