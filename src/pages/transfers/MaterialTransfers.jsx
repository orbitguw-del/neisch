import { useEffect, useState } from 'react'
import {
  Plus, ArrowRightLeft, CheckCircle, XCircle, Clock, Truck, ClipboardCheck,
  AlertTriangle, ChevronDown,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import useAuthStore from '@/stores/authStore'
import useSiteStore from '@/stores/siteStore'
import useMaterialTransferStore from '@/stores/materialTransferStore'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import { formatDate, cn } from '@/lib/utils'

const STATUS = {
  initiated: { label: 'Initiated', cls: 'bg-gray-100 text-gray-600 border-gray-200',   icon: Clock },
  prepared:  { label: 'Prepared',  cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: Truck },
  approved:  { label: 'Approved',  cls: 'bg-blue-50 text-blue-700 border-blue-200',    icon: ClipboardCheck },
  received:  { label: 'Received',  cls: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle },
  rejected:  { label: 'Rejected',  cls: 'bg-red-50 text-red-700 border-red-200',       icon: XCircle },
}
const DISCREPANCY_ACTIONS = [
  { value: 'accept_partial',  label: 'Accept partial delivery' },
  { value: 'reject_balance',  label: 'Reject balance' },
  { value: 'pending_balance', label: 'Balance delivery pending' },
]

function Badge({ status }) {
  const s = STATUS[status] ?? STATUS.initiated
  const Icon = s.icon
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium', s.cls)}>
      <Icon className="h-3 w-3" /> {s.label}
    </span>
  )
}

// ── Initiate-transfer form ─────────────────────────────────────────────────────
function TransferForm({ sites, onSubmit, loading }) {
  const [form, setForm] = useState({
    from_site_id: sites[0]?.id ?? '', to_site_id: '', material_id: '', quantity: '', note: '',
  })
  const [materials, setMaterials] = useState([])
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    if (!form.from_site_id) return
    supabase.from('materials').select('id, name, unit, quantity_available')
      .eq('site_id', form.from_site_id).order('name')
      .then(({ data }) => {
        setMaterials(data ?? [])
        setForm((f) => ({ ...f, material_id: data?.[0]?.id ?? '' }))
      })
  }, [form.from_site_id])

  const toOptions = sites.filter((s) => s.id !== form.from_site_id)
  const mat = materials.find((m) => m.id === form.material_id)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!form.from_site_id || !form.to_site_id || !form.material_id || !form.quantity) return
        const site = sites.find((s) => s.id === form.from_site_id)
        onSubmit({
          tenant_id: site?.tenant_id,
          from_site_id: form.from_site_id, to_site_id: form.to_site_id,
          material_id: form.material_id, quantity: Number(form.quantity),
          note: form.note.trim() || null,
        })
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">From site *</label>
          <select className="input" required value={form.from_site_id} onChange={set('from_site_id')}>
            {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">To site *</label>
          <select className="input" required value={form.to_site_id} onChange={set('to_site_id')}>
            <option value="">— destination —</option>
            {toOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Material *</label>
          <select className="input" required value={form.material_id} onChange={set('material_id')}>
            <option value="">— select —</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>{m.name} ({m.quantity_available ?? 0} {m.unit})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Quantity{mat ? ` (${mat.unit})` : ''} *</label>
          <input className="input" type="number" min="0.01" step="any" required
            value={form.quantity} onChange={set('quantity')} placeholder="0" />
          {mat && <p className="mt-1 text-xs text-gray-400">Available: {mat.quantity_available ?? 0} {mat.unit}</p>}
        </div>
      </div>
      <div>
        <label className="label">Note</label>
        <input className="input" value={form.note} onChange={set('note')} placeholder="Why is this being moved?" />
      </div>
      <p className="text-xs text-gray-500">
        The contractor or store keeper (warehouse) / supervisor (site) confirms dispatch details before it's sent.
      </p>
      <div className="flex justify-end pt-1">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving…' : 'Initiate Transfer'}
        </button>
      </div>
    </form>
  )
}

// ── Dispatch modal (supervisor) ────────────────────────────────────────────────
function DispatchModal({ transfer, onClose, onSubmit, loading }) {
  const [f, setF] = useState({
    quantity: transfer.quantity ?? '', vehicle_number: '', lr_number: '', challan_number: '',
  })
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }))
  return (
    <Modal open onClose={onClose} title="Confirm dispatch">
      <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...f, quantity: Number(f.quantity) }) }} className="space-y-4">
        <p className="text-sm text-gray-600">
          {transfer.material?.name} · {transfer.from_site?.name} → {transfer.to_site?.name}
        </p>
        <div>
          <label className="label">Quantity dispatched *</label>
          <input className="input" type="number" min="0.01" step="any" required
            value={f.quantity} onChange={set('quantity')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Vehicle number</label>
            <input className="input" value={f.vehicle_number} onChange={set('vehicle_number')} placeholder="AS 01 AB 1234" />
          </div>
          <div>
            <label className="label">Challan number</label>
            <input className="input" value={f.challan_number} onChange={set('challan_number')} placeholder="CHN-2024-0456" />
          </div>
        </div>
        <div>
          <label className="label">LR number</label>
          <input className="input" value={f.lr_number} onChange={set('lr_number')} placeholder="LR/2024/00123" />
        </div>
        <p className="text-xs text-amber-600">Confirming dispatch removes this stock from the from-site.</p>
        <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving…' : 'Confirm dispatch'}</button>
        </div>
      </form>
    </Modal>
  )
}

// ── Receive modal ──────────────────────────────────────────────────────────────
function ReceiveModal({ transfer, onClose, onSubmit, loading }) {
  const dispatched = Number(transfer.quantity)
  const [qty, setQty]       = useState(String(dispatched))
  const [reason, setReason] = useState('')
  const [action, setAction] = useState('accept_partial')
  const received = Number(qty)
  const gap = received !== dispatched && qty !== ''
  return (
    <Modal open onClose={onClose} title="Accept transfer">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit({ quantityReceived: received, discrepancyReason: gap ? reason : null, discrepancyAction: gap ? action : null })
        }}
        className="space-y-4"
      >
        <p className="text-sm text-gray-600">
          {transfer.material?.name} · dispatched <strong>{dispatched} {transfer.material?.unit}</strong>
        </p>
        <div>
          <label className="label">Quantity received *</label>
          <input className="input" type="number" min="0" step="any" required value={qty} onChange={(e) => setQty(e.target.value)} />
        </div>
        {gap && (
          <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-medium text-amber-700">
              <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />
              Discrepancy: {dispatched - received > 0 ? `${dispatched - received} short` : `${received - dispatched} extra`}
            </p>
            <div>
              <label className="label">Reason</label>
              <input className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Damage in transit, miscount…" />
            </div>
            <div>
              <label className="label">Action</label>
              <select className="input" value={action} onChange={(e) => setAction(e.target.value)}>
                {DISCREPANCY_ACTIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>
          </div>
        )}
        <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving…' : 'Accept & add stock'}</button>
        </div>
      </form>
    </Modal>
  )
}

// ── Transfer card ──────────────────────────────────────────────────────────────
function TransferCard({ t, role, onPrepare, onApprove, onReject, onReceive, busy }) {
  const [open, setOpen] = useState(false)
  const fromIsWarehouse = t.from_site?.type === 'warehouse'
  const can = {
    // Warehouse dispatch: contractor / store_keeper / site_manager (supervisor not at warehouse)
    // Site dispatch: supervisor / site_manager / contractor (person on the ground)
    prepare: t.status === 'initiated' && (
      fromIsWarehouse
        ? ['contractor', 'site_manager', 'store_keeper'].includes(role)
        : ['contractor', 'site_manager', 'supervisor'].includes(role)
    ),
    approve: t.status === 'prepared'  && ['contractor', 'site_manager', 'store_keeper'].includes(role),
    receive: t.status === 'approved'  && ['contractor', 'site_manager', 'store_keeper', 'supervisor'].includes(role),
  }
  const trail = [
    ['Initiated', t.initiated_by_profile, t.created_at],
    ['Prepared',  t.prepared_by_profile,  t.prepared_at],
    ['Approved',  t.approved_by_profile,  t.approved_at],
    ['Received',  t.received_by_profile,  t.received_at],
  ].filter(([, , at]) => at)

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge status={t.status} />
            <span className="text-xs text-gray-400">{formatDate(t.created_at)}</span>
          </div>
          <p className="mt-1.5 font-semibold text-gray-900">
            {t.material?.name ?? 'Material'} · {t.quantity} {t.material?.unit ?? ''}
            {t.quantity_received != null && t.quantity_received !== t.quantity &&
              <span className="text-amber-600"> (received {t.quantity_received})</span>}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
            {t.from_site?.name ?? '—'} <ArrowRightLeft className="h-3 w-3" /> {t.to_site?.name ?? '—'}
          </p>
        </div>
        <div className="flex flex-shrink-0 flex-col gap-1.5">
          {can.prepare && <button onClick={() => onPrepare(t)} disabled={busy} className="btn-primary text-xs py-1.5">Confirm dispatch</button>}
          {can.approve && <>
            <button onClick={() => onApprove(t)} disabled={busy} className="btn-primary text-xs py-1.5">Approve</button>
            <button onClick={() => onReject(t)}  disabled={busy} className="btn-secondary text-xs py-1.5">Reject</button>
          </>}
          {can.receive && <button onClick={() => onReceive(t)} disabled={busy} className="btn-primary text-xs py-1.5">Accept</button>}
        </div>
      </div>

      <button onClick={() => setOpen((v) => !v)}
        className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
        Activity log
      </button>
      {open && (
        <div className="mt-2 space-y-1 border-t border-gray-100 pt-2">
          {trail.map(([label, person, at]) => (
            <p key={label} className="text-xs text-gray-500">
              <span className="font-medium text-gray-700">{label}</span> by {person?.full_name ?? 'Unknown'} · {formatDate(at)}
            </p>
          ))}
          {t.vehicle_number && <p className="text-xs text-gray-400">Vehicle: {t.vehicle_number}</p>}
          {t.challan_number && <p className="text-xs text-gray-400">Challan: {t.challan_number}</p>}
          {t.discrepancy_reason && <p className="text-xs text-amber-600">Discrepancy: {t.discrepancy_reason}</p>}
        </div>
      )}
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────────
export default function MaterialTransfers() {
  const profile = useAuthStore((s) => s.profile)
  const role    = profile?.role
  const tenantId = profile?.tenant_id
  const { sites, fetchSites } = useSiteStore()
  const { transfers, loading, fetchTransfers, initiateTransfer, prepareDispatch, approveTransfer, receiveTransfer, rejectTransfer } =
    useMaterialTransferStore()

  const [createOpen, setCreateOpen]   = useState(false)
  const [dispatchFor, setDispatchFor] = useState(null)
  const [receiveFor, setReceiveFor]   = useState(null)
  const [saving, setSaving]           = useState(false)
  const [busyId, setBusyId]           = useState(null)
  const [error, setError]             = useState(null)
  const [filter, setFilter]           = useState('all')

  const canInitiate = ['contractor', 'site_manager', 'store_keeper'].includes(role)

  useEffect(() => {
    if (!tenantId) return
    fetchSites(tenantId)
    fetchTransfers(tenantId).catch((e) => setError(e.message))
  }, [tenantId, fetchSites, fetchTransfers])

  const shown = filter === 'all' ? transfers : transfers.filter((t) => t.status === filter)

  const run = async (id, fn) => {
    setBusyId(id); setError(null)
    try { await fn() } catch (e) { setError(e.message) } finally { setBusyId(null) }
  }

  const handleInitiate = async (payload) => {
    setSaving(true); setError(null)
    try { await initiateTransfer({ ...payload, initiated_by: profile?.id }); setCreateOpen(false) }
    catch (e) { setError(e.message) } finally { setSaving(false) }
  }

  return (
    <div>
      <PageHeader title="Material Transfers" description="Move material between sites — initiate, dispatch, approve, receive." />

      <div className="mb-5 flex items-center gap-3">
        <select className="input max-w-xs" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          {Object.keys(STATUS).map((s) => <option key={s} value={s}>{STATUS[s].label}</option>)}
        </select>
        <div className="flex-1" />
        {canInitiate && (
          <button onClick={() => setCreateOpen(true)} className="btn-primary flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Initiate Transfer
          </button>
        )}
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-500">Loading transfers…</p>
      ) : shown.length === 0 ? (
        <EmptyState icon={ArrowRightLeft} title="No transfers"
          description="Initiate a transfer to move material between sites." />
      ) : (
        <div className="space-y-2.5">
          {shown.map((t) => (
            <TransferCard key={t.id} t={t} role={role} busy={busyId === t.id}
              onPrepare={(tr) => setDispatchFor(tr)}
              onApprove={(tr) => run(tr.id, () => approveTransfer(tr.id, profile?.id))}
              onReject={(tr)  => run(tr.id, () => rejectTransfer(tr.id, profile?.id))}
              onReceive={(tr) => setReceiveFor(tr)} />
          ))}
        </div>
      )}

      {createOpen && (
        <Modal open onClose={() => setCreateOpen(false)} title="Initiate Transfer">
          <TransferForm sites={sites} onSubmit={handleInitiate} loading={saving} />
        </Modal>
      )}

      {dispatchFor && (
        <DispatchModal transfer={dispatchFor} loading={busyId === dispatchFor.id}
          onClose={() => setDispatchFor(null)}
          onSubmit={async (detail) => {
            await run(dispatchFor.id, () => prepareDispatch(dispatchFor.id, profile?.id, detail))
            setDispatchFor(null)
          }} />
      )}

      {receiveFor && (
        <ReceiveModal transfer={receiveFor} loading={busyId === receiveFor.id}
          onClose={() => setReceiveFor(null)}
          onSubmit={async (opts) => {
            await run(receiveFor.id, () => receiveTransfer(receiveFor.id, profile?.id, opts))
            setReceiveFor(null)
          }} />
      )}
    </div>
  )
}
