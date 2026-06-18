import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, AlertTriangle, Package, ArrowUpCircle, History, SlidersHorizontal, Hammer, ExternalLink, ChevronLeft, Pencil } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import MaterialPresetPicker from '@/components/materials/MaterialPresetPicker'
import { WORK_TYPES, WORK_TYPE_COLORS } from '@/lib/materialPresets'
import useAuthStore from '@/stores/authStore'
import useSiteStore from '@/stores/siteStore'
import useMaterialStore from '@/stores/materialStore'
import useMaterialTransactionStore from '@/stores/materialTransactionStore'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import { formatINR } from '@/lib/utils'

const UNIT_OPTIONS = ['bags', 'kg', 'tonnes', 'pieces', 'sq ft', 'cu ft', 'cu m', 'litres', 'bundles', 'metres', 'nos']
const BLANK_MAT = { name: '', brand: '', unit: 'bags', category: 'consumable', work_type: '', quantity_available: '', quantity_minimum: '', unit_cost: '', supplier: '' }

const TXN_COLORS = { receipt: 'badge-green', consumption: 'badge-red', adjustment: 'badge-yellow' }
const TXN_LABELS = { receipt: 'Receipt', consumption: 'Consumption', adjustment: 'Adjustment' }

// ─── Add Material Form ─────────────────────────────────────────────────────────
function MaterialForm({ sites, onSubmit, loading }) {
  const [step, setStep]             = useState('pick')
  const [form, setForm]             = useState({ site_id: sites[0]?.id ?? '', ...BLANK_MAT })
  const [dupWarning, setDupWarning] = useState(null)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    if (step !== 'detail' || !form.name.trim() || !form.site_id) { setDupWarning(null); return }
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from('materials')
        .select('id, name, brand, quantity_available, unit')
        .eq('site_id', form.site_id)
        .ilike('name', form.name.trim())
        .ilike('brand', form.brand.trim() || '')
        .maybeSingle()
      setDupWarning(data ?? null)
    }, 400)
    return () => clearTimeout(t)
  }, [form.name, form.brand, form.site_id, step])

  const handleSelect = (preset) => {
    setForm((f) => ({ ...f, ...preset, brand: preset.brand ?? '', quantity_available: '', quantity_minimum: '', unit_cost: '', supplier: '' }))
    setStep('detail')
  }

  if (step === 'pick') {
    return (
      <div className="space-y-3">
        <div>
          <label className="label">Site *</label>
          <select className="input" required value={form.site_id} onChange={set('site_id')}>
            {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <MaterialPresetPicker
          onSelect={handleSelect}
          onCustom={() => { setForm((f) => ({ ...f, ...BLANK_MAT })); setStep('detail') }}
        />
      </div>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const site = sites.find((s) => s.id === form.site_id)
        onSubmit({
          ...form,
          tenant_id:          site?.tenant_id,
          brand:              form.brand    || null,
          work_type:          form.work_type || null,
          unit_cost:          form.unit_cost || null,
          quantity_available: form.quantity_available || null,
          quantity_minimum:   form.quantity_minimum   || null,
        })
      }}
      className="space-y-4"
    >
      <button type="button" onClick={() => setStep('pick')}
        className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 -mt-1 mb-1">
        <ChevronLeft className="h-3.5 w-3.5" /> Back to list
      </button>
      {dupWarning && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
          <strong>Already exists</strong> — {dupWarning.brand || 'Generic'} {dupWarning.name} has{' '}
          <strong>{dupWarning.quantity_available ?? 0} {dupWarning.unit}</strong> in stock.
          Add more stock via a <strong>Receipt</strong> instead.
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Site *</label>
          <select className="input" required value={form.site_id} onChange={set('site_id')}>
            {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="label">Material name *</label>
          <input className="input" required value={form.name} onChange={set('name')} placeholder="OPC 53 Grade Cement" />
        </div>
        <div>
          <label className="label">Brand <span className="text-gray-400 font-normal">(blank = Generic)</span></label>
          <input className="input" value={form.brand} onChange={set('brand')} placeholder="Ultratech, SAIL…" />
        </div>
        <div>
          <label className="label">Work type</label>
          <select className="input" value={form.work_type} onChange={set('work_type')}>
            <option value="">— select —</option>
            {WORK_TYPES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Category *</label>
          <select className="input" value={form.category} onChange={set('category')}>
            <option value="consumable">Consumable</option>
            <option value="equipment">Equipment / Non-consumable</option>
          </select>
        </div>
        <div>
          <label className="label">Unit</label>
          <select className="input" value={form.unit} onChange={set('unit')}>
            {UNIT_OPTIONS.map((u) => <option key={u}>{u}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Unit cost (₹)</label>
          <input className="input" type="number" min="0" value={form.unit_cost} onChange={set('unit_cost')} placeholder="385" />
        </div>
        <div>
          <label className="label">{form.category === 'equipment' ? 'Qty / Count' : 'Qty available'}</label>
          <input className="input" type="number" min="0" value={form.quantity_available} onChange={set('quantity_available')} placeholder="200" />
        </div>
        {form.category === 'consumable' && (
          <div>
            <label className="label">Reorder level</label>
            <input className="input" type="number" min="0" value={form.quantity_minimum} onChange={set('quantity_minimum')} placeholder="50" />
          </div>
        )}
        <div className="col-span-2">
          <label className="label">Supplier</label>
          <input className="input" value={form.supplier} onChange={set('supplier')} placeholder="Assam Cement Depot, Guwahati" />
        </div>
      </div>
      <div className="flex justify-end pt-1">
        <button type="submit" disabled={loading || !!dupWarning} className="btn-primary">
          {loading ? 'Saving…' : 'Add material'}
        </button>
      </div>
    </form>
  )
}

// ─── Consume / Adjust Form ────────────────────────────────────────────────────
function RecordForm({ material, type, onSubmit, loading }) {
  const [form, setForm] = useState({ quantity: '', note: '' })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const isConsume = type === 'consumption'
  const isAdjust  = type === 'adjustment'

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <div className="rounded-lg bg-gray-50 px-4 py-3">
        <p className="text-sm font-medium text-gray-900">{material.name}</p>
        <p className="text-xs text-gray-500">
          {material.site?.name} · Current: <strong>{material.quantity_available ?? '—'} {material.unit}</strong>
        </p>
      </div>
      <div>
        <label className="label">{isAdjust ? 'Corrected stock quantity' : `Quantity (${material.unit})`} *</label>
        <input className="input" type="number" min="0.01" step="any" required
          value={form.quantity} onChange={set('quantity')} placeholder="0" />
        {isAdjust && <p className="mt-1 text-xs text-gray-400">Sets stock to this exact value — use for physical count corrections.</p>}
      </div>
      <div>
        <label className="label">Note</label>
        <input className="input" value={form.note} onChange={set('note')}
          placeholder={isConsume ? 'e.g. Used in foundation pour, Grid A–C' : isAdjust ? 'e.g. Physical count 20-Mar-2026' : ''} />
      </div>
      <div className="flex justify-end pt-1">
        <button type="submit" disabled={loading} className={isConsume ? 'btn-danger' : 'btn-primary'}>
          {loading ? 'Saving…' : isConsume ? 'Record Consumption' : 'Save Adjustment'}
        </button>
      </div>
    </form>
  )
}

// ─── Allocate to Work Form ─────────────────────────────────────────────────────
function AllocateForm({ material, onSubmit, loading, success }) {
  const toLocalISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const [form, setForm] = useState({ work_description: '', quantity_allocated: '', allocated_date: toLocalISO(new Date()), note: '' })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const available = Number(material.quantity_available ?? 0)
  const enteredQty = Number(form.quantity_allocated || 0)
  const exceedsStock = enteredQty > 0 && enteredQty > available

  // Show success card briefly — the parent auto-closes the modal after.
  if (success) {
    return (
      <div className="space-y-3 py-4 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <svg className="h-7 w-7 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="text-base font-semibold text-gray-900">{success}</p>
        <p className="text-xs text-gray-500">Stock updated. Closing…</p>
      </div>
    )
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (!exceedsStock) onSubmit(form) }} className="space-y-4">
      <div className="rounded-lg bg-gray-50 px-4 py-3">
        <p className="text-sm font-medium text-gray-900">{material.name}</p>
        <p className="text-xs text-gray-500">
          {material.site?.name} · Available: <strong>{material.quantity_available ?? '—'} {material.unit}</strong>
        </p>
      </div>
      <div>
        <label className="label">Work description *</label>
        <input className="input" required value={form.work_description} onChange={set('work_description')}
          placeholder="e.g. 2nd floor slab, Grid 3–6" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Quantity ({material.unit}) *</label>
          <input
            className={`input ${exceedsStock ? 'border-red-400 focus:border-red-500' : ''}`}
            type="number"
            min="0.01"
            step="any"
            max={available || undefined}
            required
            value={form.quantity_allocated}
            onChange={set('quantity_allocated')}
            placeholder="0"
          />
          {exceedsStock && (
            <p className="mt-1 text-xs text-red-600">
              Only {available} {material.unit} in stock — reduce the quantity
            </p>
          )}
        </div>
        <div>
          <label className="label">Allocation date</label>
          <input className="input" type="date" value={form.allocated_date} onChange={set('allocated_date')} />
        </div>
      </div>
      <div>
        <label className="label">Note</label>
        <input className="input" value={form.note} onChange={set('note')} placeholder="Optional" />
      </div>
      <div className="flex justify-end pt-1">
        <button
          type="submit"
          disabled={loading || exceedsStock || !form.work_description.trim() || enteredQty <= 0}
          className="btn-primary inline-flex items-center gap-2"
        >
          {loading && (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
              <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          )}
          {loading ? 'Saving…' : 'Allocate to Work'}
        </button>
      </div>
    </form>
  )
}

// ─── Ledger View ──────────────────────────────────────────────────────────────
function LedgerModal({ material, transactions, loading }) {
  if (loading) return <p className="py-6 text-center text-sm text-gray-500">Loading ledger…</p>
  if (!transactions.length) return <p className="py-6 text-center text-sm text-gray-500">No transactions recorded yet.</p>
  return (
    <div>
      <div className="mb-3 rounded-lg bg-gray-50 px-4 py-3">
        <p className="text-sm font-medium text-gray-900">{material.name}</p>
        <p className="text-xs text-gray-500">
          {material.site?.name} · Current: <strong>{material.quantity_available ?? '—'} {material.unit}</strong>
        </p>
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              {['Date', 'Type', 'Qty', 'Note', 'By'].map((h) => (
                <th key={h} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">
                  {new Date(t.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-3 py-2">
                  <span className={TXN_COLORS[t.txn_type] ?? 'badge-gray'}>{TXN_LABELS[t.txn_type] ?? t.txn_type}</span>
                </td>
                <td className="px-3 py-2 text-sm font-medium text-gray-900 whitespace-nowrap">
                  {t.txn_type === 'consumption' ? '−' : t.txn_type === 'receipt' ? '+' : '='}{t.quantity} {material.unit}
                </td>
                <td className="px-3 py-2 text-sm text-gray-600 max-w-[200px] truncate">{t.note || '—'}</td>
                <td className="px-3 py-2 text-xs text-gray-500">{t.created_by_profile?.full_name ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Budget progress chip ─────────────────────────────────────────────────────
function BudgetChip({ budgetQty, consumedQty, unit }) {
  if (!budgetQty) return null
  const budget   = Number(budgetQty)
  const consumed = Number(consumedQty ?? 0)
  const pct      = budget > 0 ? Math.round((consumed / budget) * 100) : 0
  const clampPct = Math.min(pct, 100)
  const barColor = pct > 100 ? 'bg-red-500' : pct > 75 ? 'bg-amber-400' : 'bg-green-500'
  const textColor = pct > 100 ? 'text-red-600 font-semibold' : pct > 75 ? 'text-amber-600' : 'text-gray-500'
  return (
    <div className="min-w-[90px] space-y-0.5">
      <div className="flex items-center justify-between gap-1">
        <span className="text-xs text-gray-500 truncate">{consumed}/{budget} {unit}</span>
        <span className={`text-xs ${textColor}`}>{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-200">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${clampPct}%` }} />
      </div>
    </div>
  )
}

// ─── Edit Material Form ───────────────────────────────────────────────────────
function EditMaterialForm({ material, onSubmit, loading }) {
  const [form, setForm] = useState({
    unit_cost:         material.unit_cost         ?? '',
    quantity_minimum:  material.quantity_minimum  ?? '',
    brand:             material.brand             ?? '',
    work_type:         material.work_type         ?? '',
    supplier:          material.supplier          ?? '',
    budget_qty:        material.budget_qty        ?? '',
    budget_rate:       material.budget_rate       ?? '',
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <div className="rounded-lg bg-gray-50 px-4 py-3">
        <p className="text-sm font-medium text-gray-900">{material.name}</p>
        <p className="text-xs text-gray-500">{material.site?.name} · {material.unit}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Unit cost (₹)</label>
          <input className="input" type="number" min="0" step="any" value={form.unit_cost} onChange={set('unit_cost')} placeholder="0" />
        </div>
        <div>
          <label className="label">{material.category === 'equipment' ? 'Min count' : 'Reorder level'}</label>
          <input className="input" type="number" min="0" step="any" value={form.quantity_minimum} onChange={set('quantity_minimum')} placeholder="0" />
        </div>
      </div>
      <div>
        <label className="label">Brand</label>
        <input className="input" value={form.brand} onChange={set('brand')} placeholder="Generic" />
      </div>
      <div>
        <label className="label">Work type</label>
        <select className="input" value={form.work_type} onChange={set('work_type')}>
          <option value="">— None —</option>
          {WORK_TYPES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Supplier</label>
        <input className="input" value={form.supplier} onChange={set('supplier')} placeholder="Supplier name" />
      </div>

      {/* ── Budget section ─────────────────────────────────────── */}
      <div className="border-t border-gray-100 pt-3">
        <p className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Project Budget</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Budget qty ({material.unit})</label>
            <input className="input" type="number" min="0" step="any" value={form.budget_qty}
              onChange={set('budget_qty')} placeholder="e.g. 500" />
          </div>
          <div>
            <label className="label">Budget rate (₹/{material.unit})</label>
            <input className="input" type="number" min="0" step="any" value={form.budget_rate}
              onChange={set('budget_rate')} placeholder="e.g. 385" />
          </div>
        </div>
        {form.budget_qty && form.budget_rate && (
          <p className="mt-1.5 text-xs text-gray-500">
            Total budget: <strong className="text-gray-700">{formatINR(Number(form.budget_qty) * Number(form.budget_rate))}</strong>
          </p>
        )}
      </div>

      <div className="flex justify-end pt-1">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Inventory() {
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const { sites, fetchSites } = useSiteStore()
  const { materials, createMaterial } = useMaterialStore()
  const { transactions, loading: ledgerLoading, fetchLedger, recordTransaction } = useMaterialTransactionStore()

  const [allMaterials, setAllMaterials] = useState([])
  const [matLoading,   setMatLoading]   = useState(true)
  const [activeSiteId, setActiveSiteId] = useState('all')
  const [activeCategory, setActiveCategory] = useState('all')  // all | consumable | equipment
  const [error,        setError]        = useState(null)

  const [addOpen,  setAddOpen]  = useState(false)
  const [saving,   setSaving]   = useState(false)

  const [recordTarget, setRecordTarget] = useState(null)   // { material, type }
  const [recording,    setRecording]    = useState(false)
  const [recordError,  setRecordError]  = useState(null)

  const [allocTarget,  setAllocTarget]  = useState(null)   // material
  const [allocating,   setAllocating]   = useState(false)
  const [allocError,   setAllocError]   = useState(null)
  const [allocSuccess, setAllocSuccess] = useState(null)   // success message string

  const [ledgerMaterial, setLedgerMaterial] = useState(null)

  const [editMat,    setEditMat]    = useState(null)   // material being edited
  const [editSaving, setEditSaving] = useState(false)
  const [editError,  setEditError]  = useState(null)

  const tenantId = profile?.tenant_id
  const role     = profile?.role

  // Role-based permissions
  const canAddMaterial = ['superadmin', 'contractor', 'site_manager', 'store_keeper'].includes(role)
  const canConsume     = ['superadmin', 'site_manager'].includes(role)
  const canAdjust      = ['superadmin', 'contractor', 'site_manager', 'store_keeper'].includes(role)
  const canEdit        = ['superadmin', 'contractor', 'site_manager', 'store_keeper'].includes(role)
  // Supervisor added 2026-05-20 — they're the on-site role who actually
  // consumes material against work. RLS in 20260520020000_supervisor_can_allocate
  // enforces site-assignment scoping at the DB layer.
  const canAllocate    = ['superadmin', 'contractor', 'site_manager', 'supervisor'].includes(role)

  useEffect(() => { if (tenantId) fetchSites(tenantId) }, [tenantId, fetchSites])

  const loadMaterials = async () => {
    if (!tenantId) return
    setMatLoading(true)
    // Query the budget view — includes all materials columns + consumed_qty, pct_consumed, etc.
    const { data } = await supabase.from('site_material_budget_v').select('*').order('name')
    if (data) {
      const siteIds = [...new Set(data.map((m) => m.site_id).filter(Boolean))]
      let siteMap = {}
      if (siteIds.length) {
        const { data: sd } = await supabase.from('sites').select('id, name').in('id', siteIds)
        siteMap = Object.fromEntries((sd ?? []).map((s) => [s.id, s]))
      }
      setAllMaterials(data.map((m) => ({ ...m, site: siteMap[m.site_id] ?? null })))
    }
    setMatLoading(false)
  }

  useEffect(() => { loadMaterials() }, [tenantId, materials])

  const filtered = allMaterials
    .filter((m) => activeSiteId === 'all' || m.site_id === activeSiteId)
    .filter((m) => activeCategory === 'all' || m.category === activeCategory)

  const isLow = (m) =>
    m.category === 'consumable' &&
    m.quantity_minimum != null && m.quantity_available != null &&
    Number(m.quantity_available) <= Number(m.quantity_minimum)

  const lowCount = filtered.filter(isLow).length

  const handleAdd = async (payload) => {
    setSaving(true); setError(null)
    try { await createMaterial(payload); setAddOpen(false); await loadMaterials() }
    catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const handleEditSave = async (form) => {
    if (!editMat) return
    setEditSaving(true); setEditError(null)
    try {
      const { error: e } = await supabase.from('materials').update({
        unit_cost:        form.unit_cost        ? Number(form.unit_cost)        : null,
        quantity_minimum: form.quantity_minimum ? Number(form.quantity_minimum) : null,
        brand:            form.brand.trim()     || null,
        work_type:        form.work_type        || null,
        supplier:         form.supplier.trim()  || null,
        budget_qty:       form.budget_qty       ? Number(form.budget_qty)       : null,
        budget_rate:      form.budget_rate      ? Number(form.budget_rate)      : null,
        updated_at:       new Date().toISOString(),
      }).eq('id', editMat.id)
      if (e) throw e
      setEditMat(null)
      await loadMaterials()
    } catch (err) {
      setEditError(err.message)
    } finally {
      setEditSaving(false)
    }
  }

  const handleRecord = async ({ quantity, note }) => {
    if (!recordTarget) return
    setRecording(true); setRecordError(null)
    try {
      const { material, type } = recordTarget
      const now = new Date().toISOString()

      // Update quantity_available directly
      const current = Number(material.quantity_available) || 0
      const newQty  = type === 'consumption' ? current - Number(quantity)
                    : type === 'adjustment'  ? Number(quantity)
                    : current + Number(quantity)

      await supabase.from('materials').update({ quantity_available: newQty, updated_at: now }).eq('id', material.id)

      // Log transaction
      await recordTransaction({
        material_id: material.id,
        site_id:     material.site_id,
        tenant_id:   material.tenant_id,
        txn_type:    type,
        quantity:    Number(quantity),
        note:        note || null,
        created_by:  profile?.id,
      })

      setRecordTarget(null)
      await loadMaterials()
    } catch (err) { setRecordError(err.message) }
    finally { setRecording(false) }
  }

  const handleAllocate = async ({ work_description, quantity_allocated, allocated_date, note }) => {
    if (!allocTarget) return
    setAllocating(true); setAllocError(null); setAllocSuccess(null)
    try {
      const qty = Number(quantity_allocated)

      // Single atomic RPC — validates stock, inserts allocation, decrements
      // stock, and logs consumption transaction in one Postgres transaction.
      // Replaces the previous 4-round-trip flow which had a double-decrement
      // race + no stock validation. See migration 20260522000000.
      const { data, error } = await supabase.rpc('record_material_allocation', {
        p_material_id:      allocTarget.id,
        p_site_id:          allocTarget.site_id,
        p_tenant_id:        allocTarget.tenant_id,
        p_work_description: work_description,
        p_quantity:         qty,
        p_allocated_date:   allocated_date,
        p_note:             note || null,
        p_allocated_by:     profile?.id,
      })
      if (error) throw error

      // Show success briefly before closing — gives the user concrete feedback.
      const unit = allocTarget.unit ? ` ${allocTarget.unit}` : ''
      setAllocSuccess(`Allocated ${qty}${unit} to "${work_description}"`)
      await loadMaterials()
      setTimeout(() => {
        setAllocTarget(null)
        setAllocSuccess(null)
      }, 1400)
    } catch (err) {
      setAllocError(err.message || 'Failed to allocate')
    } finally {
      setAllocating(false)
    }
  }

  const openLedger = async (material) => {
    setLedgerMaterial(material)
    await fetchLedger(material.id)
  }

  return (
    <div>
      <PageHeader
        title="Inventory"
        description="Material stock across your sites — consumables and equipment."
        action={
          canAddMaterial && (
            <button onClick={() => setAddOpen(true)} className="btn-primary">
              <Plus className="h-4 w-4" /> Add material
            </button>
          )
        }
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {lowCount > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700">
            <strong>{lowCount}</strong> consumable item{lowCount > 1 ? 's' : ''} below reorder level.
          </span>
        </div>
      )}

      {/* Site filter */}
      <div className="mb-3 flex flex-wrap gap-2">
        {['all', ...sites.map((s) => s.id)].map((id) => {
          const label = id === 'all' ? 'All Sites' : (sites.find((s) => s.id === id)?.name ?? id)
          return (
            <button key={id} onClick={() => setActiveSiteId(id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors min-h-[44px] ${
                activeSiteId === id ? 'bg-brand-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Category filter */}
      <div className="mb-4 flex gap-2">
        {[['all', 'All'], ['consumable', 'Consumables'], ['equipment', 'Equipment']].map(([val, label]) => (
          <button key={val} onClick={() => setActiveCategory(val)}
            className={`rounded-full px-3 py-2 text-xs font-medium transition-colors min-h-[44px] ${
              activeCategory === val ? 'bg-brand-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {matLoading ? (
        <p className="text-sm text-gray-500">Loading inventory…</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No materials found"
          description="Add materials to track stock levels and allocate to work."
          action={canAddMaterial && (
            <button onClick={() => setAddOpen(true)} className="btn-primary"><Plus className="h-4 w-4" /> Add material</button>
          )}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Material', 'Category', 'Site', 'Unit', 'Available', 'Reorder', 'Unit cost', 'Budget', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filtered.map((m) => (
                <tr key={m.id} className={isLow(m) ? 'bg-red-50' : 'hover:bg-gray-50'}>
                  <td className="px-3 py-3 text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-1.5">
                      {isLow(m) && <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />}
                      {m.name}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={m.category === 'equipment' ? 'badge-blue' : 'badge-gray'}>
                      {m.category === 'equipment' ? 'Equipment' : 'Consumable'}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-500 max-w-[110px] truncate">{m.site?.name ?? '—'}</td>
                  <td className="px-3 py-3 text-sm text-gray-600">{m.unit}</td>
                  <td className="px-3 py-3 text-sm font-semibold text-gray-900">{m.quantity_available ?? '—'}</td>
                  <td className="px-3 py-3 text-sm text-gray-600">{m.category === 'consumable' ? (m.quantity_minimum ?? '—') : '—'}</td>
                  <td className="px-3 py-3 text-sm text-gray-600">{m.unit_cost ? formatINR(m.unit_cost) : '—'}</td>
                  <td className="px-3 py-3">
                    <BudgetChip budgetQty={m.budget_qty} consumedQty={m.consumed_qty} unit={m.unit} />
                  </td>
                  <td className="px-3 py-3">
                    {m.category === 'equipment'
                      ? <span className="badge-blue">Equipment</span>
                      : isLow(m)
                        ? <span className="badge-red">Low stock</span>
                        : <span className="badge-green">OK</span>
                    }
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      {/* Consume — site manager only, consumables only */}
                      {canConsume && m.category === 'consumable' && (
                        <button onClick={() => setRecordTarget({ material: m, type: 'consumption' })}
                          title="Record consumption" className="flex h-10 w-10 items-center justify-center rounded-lg text-red-500 hover:bg-red-50">
                          <ArrowUpCircle className="h-4 w-4" />
                        </button>
                      )}
                      {/* Allocate to work — consumables only */}
                      {canAllocate && m.category === 'consumable' && (
                        <button onClick={() => setAllocTarget(m)}
                          title="Allocate to work" className="flex h-10 w-10 items-center justify-center rounded-lg text-brand-600 hover:bg-brand-50">
                          <Hammer className="h-4 w-4" />
                        </button>
                      )}
                      {/* Adjust */}
                      {canAdjust && (
                        <button onClick={() => setRecordTarget({ material: m, type: 'adjustment' })}
                          title="Stock adjustment" className="flex h-10 w-10 items-center justify-center rounded-lg text-yellow-600 hover:bg-yellow-50">
                          <SlidersHorizontal className="h-4 w-4" />
                        </button>
                      )}
                      {/* Edit details */}
                      {canEdit && (
                        <button onClick={() => { setEditMat(m); setEditError(null) }}
                          title="Edit material details" className="flex h-10 w-10 items-center justify-center rounded-lg text-blue-500 hover:bg-blue-50">
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}
                      {/* Ledger */}
                      <button onClick={() => openLedger(m)}
                        title="View ledger" className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100">
                        <History className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Edit material modal */}
      <Modal open={!!editMat} onClose={() => { setEditMat(null); setEditError(null) }} title="Edit Material">
        {editMat && (
          <>
            {editError && <p className="mb-3 text-sm text-red-600">{editError}</p>}
            <EditMaterialForm material={editMat} onSubmit={handleEditSave} loading={editSaving} />
          </>
        )}
      </Modal>

      {/* Add material modal */}
      <Modal open={addOpen} onClose={() => { setAddOpen(false); setError(null) }} title="Add Material">
        {sites.length === 0
          ? <p className="text-sm text-gray-500">No sites available.</p>
          : <MaterialForm sites={sites} onSubmit={handleAdd} loading={saving} />
        }
      </Modal>

      {/* Consume / Adjust modal */}
      <Modal
        open={!!recordTarget}
        onClose={() => { setRecordTarget(null); setRecordError(null) }}
        title={recordTarget?.type === 'consumption' ? 'Record Consumption' : 'Stock Adjustment'}
      >
        {recordTarget && (
          <>
            {recordError && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{recordError}</div>}
            <RecordForm material={recordTarget.material} type={recordTarget.type} onSubmit={handleRecord} loading={recording} />
          </>
        )}
      </Modal>

      {/* Allocate to work modal */}
      <Modal
        open={!!allocTarget}
        onClose={() => { setAllocTarget(null); setAllocError(null); setAllocSuccess(null) }}
        title="Allocate Material to Work"
      >
        {allocTarget && (
          <>
            {allocError && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{allocError}</div>}
            <AllocateForm
              material={allocTarget}
              onSubmit={handleAllocate}
              loading={allocating}
              success={allocSuccess}
            />
          </>
        )}
      </Modal>

      {/* Ledger modal */}
      <Modal open={!!ledgerMaterial} onClose={() => setLedgerMaterial(null)} title="Transaction Ledger">
        {ledgerMaterial && (
          <>
            <div className="mb-3 flex justify-end">
              <button
                onClick={() => { setLedgerMaterial(null); navigate(`/inventory/${ledgerMaterial.id}/ledger`) }}
                className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-800"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Open full page
              </button>
            </div>
            <LedgerModal material={ledgerMaterial} transactions={transactions} loading={ledgerLoading} />
          </>
        )}
      </Modal>
    </div>
  )
}
