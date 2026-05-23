import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Package, ArrowLeft, AlertTriangle, Upload, ClipboardList } from 'lucide-react'
import * as XLSX from 'xlsx'
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

// ── Opening Stock Modal (superadmin onboarding) ────────────────────────────────
function OpeningStockModal({ materials, profileId, onClose, onSave }) {
  const [tab, setTab]         = useState('manual')   // 'manual' | 'upload'
  const [qtys, setQtys]       = useState({})          // { materialId: qty string }
  const [preview, setPreview] = useState(null)        // parsed XLS rows
  const [parseErr, setParseErr] = useState(null)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState(null)
  const fileRef               = useRef(null)

  const pending = materials.filter((m) => !m.opening_stock_recorded)

  // ── XLS parse ────────────────────────────────────────────────────────────────
  const handleFile = (e) => {
    setParseErr(null); setPreview(null)
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const wb   = XLSX.read(ev.target.result, { type: 'array' })
        const ws   = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
        // Skip header row if first cell looks like a label
        const dataRows = (rows[0]?.[0]?.toString().toLowerCase().includes('name') ? rows.slice(1) : rows)
          .filter((r) => r[0] && r[1])
          .map((r) => {
            const name     = String(r[0]).trim()
            const qty      = Number(r[1])
            const matched  = materials.find((m) => m.name.toLowerCase() === name.toLowerCase())
            return { name, qty, matched, skip: !matched || matched.opening_stock_recorded }
          })
        if (!dataRows.length) { setParseErr('No valid rows found. Expected: Material Name | Quantity'); return }
        setPreview(dataRows)
      } catch {
        setParseErr('Could not read file. Please use .xlsx or .xls format.')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  // ── Save ─────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true); setError(null)
    try {
      if (tab === 'manual') {
        const entries = Object.entries(qtys).filter(([, v]) => v !== '' && Number(v) >= 0)
        for (const [id, v] of entries) {
          await onSave(id, Number(v), profileId)
        }
      } else {
        const toApply = (preview ?? []).filter((r) => !r.skip && r.qty >= 0)
        for (const row of toApply) {
          await onSave(row.matched.id, row.qty, profileId)
        }
      }
      onClose()
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  const tabCls = (t) =>
    `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
      tab === t ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-500 hover:text-gray-700'
    }`

  return (
    <Modal open onClose={onClose} title="Set Opening Stock">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 -mx-4 px-4 mb-4">
        <button className={tabCls('manual')} onClick={() => setTab('manual')}>
          <ClipboardList className="inline h-3.5 w-3.5 mr-1" /> Manual entry
        </button>
        <button className={tabCls('upload')} onClick={() => setTab('upload')}>
          <Upload className="inline h-3.5 w-3.5 mr-1" /> Upload XLS
        </button>
      </div>

      {/* Manual tab */}
      {tab === 'manual' && (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {pending.length === 0 ? (
            <p className="text-sm text-gray-500">All materials already have opening stock set.</p>
          ) : pending.map((m) => (
            <div key={m.id} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{m.name}</p>
                <p className="text-xs text-gray-400">{m.unit}</p>
              </div>
              <input
                type="number" min="0" step="any" placeholder="0"
                className="input w-28 text-right"
                value={qtys[m.id] ?? ''}
                onChange={(e) => setQtys((q) => ({ ...q, [m.id]: e.target.value }))}
              />
            </div>
          ))}
        </div>
      )}

      {/* Upload tab */}
      {tab === 'upload' && (
        <div className="space-y-4">
          <div className="rounded-lg border-2 border-dashed border-gray-200 p-4 text-center">
            <p className="text-sm text-gray-500 mb-2">
              XLS / XLSX format: <strong>Column A</strong> = Material Name · <strong>Column B</strong> = Quantity
            </p>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFile} />
            <button onClick={() => fileRef.current?.click()} className="btn-secondary text-sm">
              <Upload className="h-4 w-4 mr-1 inline" /> Choose file
            </button>
          </div>

          {parseErr && <p className="text-sm text-red-600">{parseErr}</p>}

          {preview && (
            <div className="max-h-64 overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 border-b">
                    <th className="pb-1 text-left font-medium">Material</th>
                    <th className="pb-1 text-right font-medium">Qty</th>
                    <th className="pb-1 text-right font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {preview.map((r, i) => (
                    <tr key={i} className={r.skip ? 'opacity-40' : ''}>
                      <td className="py-1.5 text-gray-900">{r.name}</td>
                      <td className="py-1.5 text-right text-gray-600">{r.qty}</td>
                      <td className="py-1.5 text-right">
                        {!r.matched
                          ? <span className="text-xs text-red-500">Not found</span>
                          : r.matched.opening_stock_recorded
                            ? <span className="text-xs text-gray-400">Already set</span>
                            : <span className="text-xs text-green-600">✓ Will apply</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-xs text-gray-400">
                {preview.filter((r) => !r.skip).length} of {preview.length} rows will be applied.
              </p>
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-4">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button
          onClick={handleSave}
          disabled={saving || (tab === 'upload' && !preview)}
          className="btn-primary"
        >
          {saving ? 'Saving…' : 'Apply opening stock'}
        </button>
      </div>
    </Modal>
  )
}

export default function Materials() {
  const { siteId } = useParams()
  const navigate = useNavigate()
  const { materials, loading, fetchMaterials, createMaterial, setOpeningStock } = useMaterialStore()
  const profile  = useAuthStore((s) => s.profile)
  const tenantId = profile?.tenant_id
  const isSuperadmin = profile?.role === 'superadmin'
  const [modalOpen, setModalOpen]           = useState(false)
  const [openingStockOpen, setOpeningStockOpen] = useState(false)
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
          <div className="flex gap-2">
            {isSuperadmin && materials.length > 0 && (
              <button onClick={() => setOpeningStockOpen(true)} className="btn-secondary">
                <Upload className="h-4 w-4" /> Opening stock
              </button>
            )}
            <button onClick={() => setModalOpen(true)} className="btn-primary">
              <Plus className="h-4 w-4" /> Add material
            </button>
          </div>
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

      {openingStockOpen && (
        <OpeningStockModal
          materials={materials}
          profileId={profile?.id}
          onClose={() => setOpeningStockOpen(false)}
          onSave={setOpeningStock}
        />
      )}
    </div>
  )
}
