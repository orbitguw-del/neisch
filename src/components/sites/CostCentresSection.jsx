import { useEffect, useState } from 'react'
import { Plus, Layers, Pencil, Trash2, IndianRupee } from 'lucide-react'
import useCostCentreStore from '@/stores/costCentreStore'
import Modal from '@/components/ui/Modal'
import { formatINR } from '@/lib/utils'

/**
 * Cost Centres section for a site — the spend buckets (Building, Utilities…).
 * Lists each centre with its budget + a spent progress chip (colour + %).
 * Contractor + site_manager can add/edit; only contractor (+superadmin) deletes.
 */
export default function CostCentresSection({ siteId, tenantId, profileId, role }) {
  const {
    costCentres, budgetRollup,
    fetchCostCentres, fetchBudgetRollup,
    createCostCentre, updateCostCentre, deleteCostCentre,
  } = useCostCentreStore()

  const canManage = ['superadmin', 'contractor', 'site_manager'].includes(role)
  const canDelete = ['superadmin', 'contractor'].includes(role)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing]     = useState(null)   // cost centre row or null (= add)
  const [error, setError]         = useState(null)

  const refresh = () => { fetchCostCentres(siteId); fetchBudgetRollup(siteId) }
  useEffect(() => { refresh() /* eslint-disable-next-line */ }, [siteId])

  // Merge editable rows with the actuals rollup (by id)
  const rollupById = Object.fromEntries(budgetRollup.map((r) => [r.id, r]))
  const rows = costCentres.map((c) => ({ ...c, ...(rollupById[c.id] ?? {}) }))

  const openAdd  = () => { setEditing(null); setError(null); setModalOpen(true) }
  const openEdit = (c) => { setEditing(c);  setError(null); setModalOpen(true) }

  const handleSave = async (form) => {
    setError(null)
    try {
      if (editing) {
        await updateCostCentre(editing.id, {
          name: form.name.trim(),
          budget_amount: form.budget_amount === '' ? null : Number(form.budget_amount),
        })
      } else {
        await createCostCentre({
          site_id: siteId,
          tenant_id: tenantId,
          name: form.name.trim(),
          budget_amount: form.budget_amount === '' ? null : Number(form.budget_amount),
          sort_order: costCentres.length,
          created_by: profileId ?? null,
        })
      }
      setModalOpen(false)
      fetchBudgetRollup(siteId)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete cost centre "${c.name}"? Materials tagged to it become Unassigned (stock is kept).`)) return
    try {
      await deleteCostCentre(c.id)
      fetchBudgetRollup(siteId)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-brand-600" />
          <h2 className="text-sm font-semibold text-gray-900">Cost Centres</h2>
          <span className="text-xs text-gray-400">spend buckets within this site</span>
        </div>
        {canManage && (
          <button onClick={openAdd} className="btn-secondary text-xs py-1.5">
            <Plus className="h-3.5 w-3.5" /> Add cost centre
          </button>
        )}
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      {rows.length === 0 ? (
        <div className="card p-6 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 mb-3">
            <Layers className="h-6 w-6 text-brand-600" />
          </div>
          <p className="text-sm font-medium text-gray-900">No cost centres yet</p>
          <p className="text-xs text-gray-500 mt-1 mb-3 max-w-xs">
            Split this site into buckets like Building, Utilities or Boundary Wall — then budget and track each one.
          </p>
          {canManage && (
            <button onClick={openAdd} className="btn-primary text-sm">
              <Plus className="h-4 w-4" /> Add cost centre
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rows.map((c) => (
            <CostCentreCard
              key={c.id} c={c}
              canManage={canManage} canDelete={canDelete}
              onEdit={() => openEdit(c)} onDelete={() => handleDelete(c)}
            />
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit cost centre' : 'Add cost centre'}>
        <CostCentreForm initial={editing} onSubmit={handleSave} error={error} />
      </Modal>
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────
function CostCentreCard({ c, canManage, canDelete, onEdit, onDelete }) {
  const hasBudget = c.budget_amount != null
  const pct = c.pct_spent ?? (hasBudget && c.budget_amount > 0
    ? Math.round(((c.actual_cost ?? 0) / c.budget_amount) * 100) : null)

  // colour by spend level — visual-first status
  const tone =
    pct == null     ? { bar: 'bg-gray-300',  text: 'text-gray-500',  chip: 'bg-gray-100 text-gray-600' }
    : pct <= 80      ? { bar: 'bg-green-500', text: 'text-green-700', chip: 'bg-green-50 text-green-700' }
    : pct <= 100     ? { bar: 'bg-amber-500', text: 'text-amber-700', chip: 'bg-amber-50 text-amber-700' }
    :                  { bar: 'bg-red-500',   text: 'text-red-700',   chip: 'bg-red-50 text-red-700' }

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {hasBudget ? `Budget ${formatINR(c.budget_amount)}` : 'No budget set'}
          </p>
        </div>
        {(canManage || canDelete) && (
          <div className="flex gap-1 flex-shrink-0">
            {canManage && (
              <button onClick={onEdit} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Edit">
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
            {canDelete && (
              <button onClick={onDelete} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600" aria-label="Delete">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* spend row */}
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-gray-500 flex items-center gap-0.5">
          <IndianRupee className="h-3 w-3" />Spent {formatINR(c.actual_cost ?? 0).replace('₹', '')}
        </span>
        {pct != null && (
          <span className={`px-2 py-0.5 rounded-full font-semibold ${tone.chip}`}>{pct}%</span>
        )}
      </div>

      {hasBudget && (
        <div className="mt-1.5 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
          <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${Math.min(pct ?? 0, 100)}%` }} />
        </div>
      )}
    </div>
  )
}

// ── Form ──────────────────────────────────────────────────────────────────────
function CostCentreForm({ initial, onSubmit }) {
  const [name, setName]     = useState(initial?.name ?? '')
  const [budget, setBudget] = useState(initial?.budget_amount ?? '')
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    await onSubmit({ name, budget_amount: budget })
    setSaving(false)
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label">Cost centre name *</label>
        <input className="input" required value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Building / Utilities / Boundary Wall" autoFocus />
      </div>
      <div>
        <label className="label">Budget (₹) <span className="text-gray-400 font-normal">optional</span></label>
        <input className="input" type="number" min="0" value={budget} onChange={(e) => setBudget(e.target.value)}
          placeholder="500000" />
        <p className="text-xs text-gray-400 mt-1">Top-down budget for this bucket. Need not equal the site budget.</p>
      </div>
      <div className="flex justify-end pt-1">
        <button type="submit" disabled={saving || !name.trim()} className="btn-primary">
          {saving ? 'Saving…' : initial ? 'Save changes' : 'Add cost centre'}
        </button>
      </div>
    </form>
  )
}
