import { useEffect, useState } from 'react'
import { Plus, ClipboardCheck, Truck, Warehouse, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import useAuthStore from '@/stores/authStore'
import useSiteStore from '@/stores/siteStore'
import useMaterialReceiptStore from '@/stores/materialReceiptStore'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'

const STATUS_BADGE = {
  pending:  'badge-yellow',
  received: 'badge-green',
  rejected: 'badge-red',
}

const STATUS_ICON = {
  pending:  Clock,
  received: CheckCircle,
  rejected: XCircle,
}

const DISCREPANCY_ACTIONS = [
  { value: 'accept_partial',   label: 'Accept partial delivery' },
  { value: 'reject_balance',   label: 'Reject balance (vendor resend)' },
  { value: 'pending_balance',  label: 'Balance delivery pending' },
]

function ReceiptForm({ sites, onSubmit, loading }) {
  const [allMaterials, setAllMaterials] = useState([])
  const [form, setForm] = useState({
    site_id: sites[0]?.id ?? '',
    material_id: '',
    source_type: 'supplier',
    source_name: '',
    quantity: '',
    unit_cost: '',
    lr_number: '',
    lr_date: '',
    challan_number: '',
    challan_date: '',
    vehicle_number: '',
    note: '',
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  // Load materials for selected site
  useEffect(() => {
    if (!form.site_id) return
    supabase
      .from('materials')
      .select('id, name, unit, category')
      .eq('site_id', form.site_id)
      .order('name')
      .then(({ data }) => {
        setAllMaterials(data ?? [])
        setForm((f) => ({ ...f, material_id: data?.[0]?.id ?? '' }))
      })
  }, [form.site_id])

  const selectedMat = allMaterials.find((m) => m.id === form.material_id)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const site = sites.find((s) => s.id === form.site_id)
        onSubmit({
          ...form,
          tenant_id: site?.tenant_id,
          unit_cost:  form.unit_cost  || null,
          lr_date:    form.lr_date    || null,
          challan_date: form.challan_date || null,
        })
      }}
      className="space-y-4"
    >
      {/* Site + Material */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Site *</label>
          <select className="input" required value={form.site_id} onChange={set('site_id')}>
            {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Material *</label>
          <select className="input" required value={form.material_id} onChange={set('material_id')}>
            <option value="">— Select —</option>
            {allMaterials.map((m) => (
              <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Source */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Source type *</label>
          <select className="input" value={form.source_type} onChange={set('source_type')}>
            <option value="supplier">Supplier</option>
            <option value="warehouse">Warehouse</option>
          </select>
        </div>
        <div>
          <label className="label">{form.source_type === 'supplier' ? 'Supplier name' : 'Warehouse name'} *</label>
          <input className="input" required value={form.source_name} onChange={set('source_name')}
            placeholder={form.source_type === 'supplier' ? 'Assam Cement Depot, Jorhat' : 'Central Store — Guwahati'} />
        </div>
      </div>

      {/* Quantity + Unit cost */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Quantity{selectedMat ? ` (${selectedMat.unit})` : ''} *</label>
          <input className="input" type="number" min="0.01" step="any" required
            value={form.quantity} onChange={set('quantity')} placeholder="0" />
        </div>
        <div>
          <label className="label">Unit cost (₹) — optional</label>
          <input className="input" type="number" min="0" value={form.unit_cost} onChange={set('unit_cost')} placeholder="385" />
        </div>
      </div>

      {/* LR Details */}
      <div className="rounded-lg border border-gray-200 p-3 space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Lorry Receipt (LR)</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">LR Number</label>
            <input className="input" value={form.lr_number} onChange={set('lr_number')} placeholder="LR/2024/00123" />
          </div>
          <div>
            <label className="label">LR Date</label>
            <input className="input" type="date" value={form.lr_date} onChange={set('lr_date')} />
          </div>
        </div>
      </div>

      {/* Challan Details */}
      <div className="rounded-lg border border-gray-200 p-3 space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Delivery Challan</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Challan Number</label>
            <input className="input" value={form.challan_number} onChange={set('challan_number')} placeholder="CHN-2024-0456" />
          </div>
          <div>
            <label className="label">Challan Date</label>
            <input className="input" type="date" value={form.challan_date} onChange={set('challan_date')} />
          </div>
        </div>
      </div>

      {/* Vehicle + Note */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Vehicle number</label>
          <input className="input" value={form.vehicle_number} onChange={set('vehicle_number')} placeholder="AS 01 AB 1234" />
        </div>
        <div>
          <label className="label">Note</label>
          <input className="input" value={form.note} onChange={set('note')} placeholder="Optional remarks" />
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving…' : 'Create Receipt Order'}
        </button>
      </div>
    </form>
  )
}

function ReceiptDetail({ receipt }) {
  const hasDiscrepancy =
    receipt.quantity_received != null &&
    Number(receipt.quantity_received) !== Number(receipt.quantity)

  const rows = [
    ['GRN Number',     receipt.grn_number ?? '—'],
    ['Source',         `${receipt.source_type === 'supplier' ? 'Supplier' : 'Warehouse'}: ${receipt.source_name}`],
    ['Material',       `${receipt.material?.name ?? '—'} (${receipt.material?.unit ?? ''})`],
    ['Site',           receipt.site?.name ?? '—'],
    ['Qty Ordered',    `${receipt.quantity} ${receipt.material?.unit ?? ''}`],
    ['Qty Received',   receipt.quantity_received != null
      ? `${receipt.quantity_received} ${receipt.material?.unit ?? ''}`
      : '—'],
    ['Unit cost',      receipt.unit_cost ? `₹${Number(receipt.unit_cost).toLocaleString('en-IN')}` : '—'],
    ['LR Number',      receipt.lr_number  ?? '—'],
    ['LR Date',        receipt.lr_date    ?? '—'],
    ['Challan No.',    receipt.challan_number ?? '—'],
    ['Challan Date',   receipt.challan_date   ?? '—'],
    ['Vehicle',        receipt.vehicle_number ?? '—'],
    ['Note',           receipt.note ?? '—'],
    ['Created by',     receipt.created_by_profile?.full_name ?? '—'],
    ['Received by',    receipt.received_by_profile?.full_name ?? '—'],
  ]

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex gap-3">
            <span className="w-32 flex-shrink-0 text-xs text-gray-500">{label}</span>
            <span className="text-sm text-gray-900">{value}</span>
          </div>
        ))}
      </div>

      {hasDiscrepancy && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 uppercase tracking-wide">
            <AlertTriangle className="h-3.5 w-3.5" /> Discrepancy
          </div>
          {receipt.discrepancy_reason && (
            <div className="flex gap-3">
              <span className="w-32 flex-shrink-0 text-xs text-gray-500">Reason</span>
              <span className="text-sm text-gray-900">{receipt.discrepancy_reason}</span>
            </div>
          )}
          {receipt.discrepancy_action && (
            <div className="flex gap-3">
              <span className="w-32 flex-shrink-0 text-xs text-gray-500">Action</span>
              <span className="text-sm text-gray-900">
                {DISCREPANCY_ACTIONS.find((a) => a.value === receipt.discrepancy_action)?.label ?? receipt.discrepancy_action}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Modal to confirm receipt with quantity + discrepancy + asset registration
function ConfirmReceiptModal({ receipt, open, onClose, onSubmit, loading }) {
  const isEquipment = receipt?.material?.category === 'equipment'
  const orderedQty  = receipt ? Number(receipt.quantity) : 0

  const [quantityReceived,    setQuantityReceived]    = useState('')
  const [discrepancyReason,   setDiscrepancyReason]   = useState('')
  const [discrepancyAction,   setDiscrepancyAction]   = useState('accept_partial')
  const [assetSerials,        setAssetSerials]        = useState([])
  const [assetMake,           setAssetMake]           = useState('')
  const [assetModel,          setAssetModel]          = useState('')

  // Reset form whenever modal opens with a new receipt
  useEffect(() => {
    if (open && receipt) {
      setQuantityReceived(String(receipt.quantity))
      setDiscrepancyReason('')
      setDiscrepancyAction('accept_partial')
      setAssetMake('')
      setAssetModel('')
      // Pre-fill one serial per unit (for equipment)
      const qty = Math.max(1, Math.round(Number(receipt.quantity)))
      setAssetSerials(Array(qty).fill(''))
    }
  }, [open, receipt])

  if (!receipt) return null

  const qtyNum       = parseFloat(quantityReceived) || 0
  const hasDiscrepancy = quantityReceived !== '' && qtyNum !== orderedQty

  // Keep serial array length in sync with quantity received
  const handleQtyChange = (val) => {
    setQuantityReceived(val)
    if (isEquipment) {
      const n = Math.max(1, Math.round(parseFloat(val) || 1))
      setAssetSerials((prev) => {
        if (n > prev.length) return [...prev, ...Array(n - prev.length).fill('')]
        return prev.slice(0, n)
      })
    }
  }

  const handleSerialChange = (idx, val) => {
    setAssetSerials((prev) => prev.map((s, i) => (i === idx ? val : s)))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(receipt.id, {
      quantityReceived: qtyNum,
      discrepancyReason: hasDiscrepancy ? discrepancyReason : '',
      discrepancyAction: hasDiscrepancy ? discrepancyAction : null,
      assetSerials: isEquipment ? assetSerials : [],
      assetMake:    isEquipment ? assetMake    : '',
      assetModel:   isEquipment ? assetModel   : '',
    })
  }

  return (
    <Modal open={open} onClose={onClose} title="Confirm Receipt">
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Summary info */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-1.5">
          <div className="flex gap-3">
            <span className="w-32 flex-shrink-0 text-xs text-gray-500">Material</span>
            <span className="text-sm font-medium text-gray-900">
              {receipt.material?.name ?? '—'} ({receipt.material?.unit ?? ''})
            </span>
          </div>
          <div className="flex gap-3">
            <span className="w-32 flex-shrink-0 text-xs text-gray-500">Source</span>
            <span className="text-sm text-gray-900">{receipt.source_name}</span>
          </div>
          <div className="flex gap-3">
            <span className="w-32 flex-shrink-0 text-xs text-gray-500">Qty Ordered</span>
            <span className="text-sm font-semibold text-gray-900">
              {receipt.quantity} {receipt.material?.unit ?? ''}
            </span>
          </div>
          {receipt.lr_number && (
            <div className="flex gap-3">
              <span className="w-32 flex-shrink-0 text-xs text-gray-500">LR No.</span>
              <span className="text-sm text-gray-900">{receipt.lr_number}</span>
            </div>
          )}
          {receipt.challan_number && (
            <div className="flex gap-3">
              <span className="w-32 flex-shrink-0 text-xs text-gray-500">Challan No.</span>
              <span className="text-sm text-gray-900">{receipt.challan_number}</span>
            </div>
          )}
        </div>

        {/* Quantity actually received */}
        <div>
          <label className="label">
            Quantity actually received ({receipt.material?.unit ?? 'units'}) *
          </label>
          <input
            className="input"
            type="number"
            min="0.01"
            step="any"
            required
            value={quantityReceived}
            onChange={(e) => handleQtyChange(e.target.value)}
          />
        </div>

        {/* Discrepancy section — shown when quantity differs */}
        {hasDiscrepancy && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 uppercase tracking-wide">
              <AlertTriangle className="h-3.5 w-3.5" />
              Discrepancy detected — ordered {orderedQty}, received {qtyNum}
            </div>
            <div>
              <label className="label">Discrepancy reason *</label>
              <input
                className="input"
                required
                value={discrepancyReason}
                onChange={(e) => setDiscrepancyReason(e.target.value)}
                placeholder="e.g. 2 bags damaged in transit"
              />
            </div>
            <div>
              <label className="label">Action *</label>
              <select
                className="input"
                value={discrepancyAction}
                onChange={(e) => setDiscrepancyAction(e.target.value)}
              >
                {DISCREPANCY_ACTIONS.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Equipment: register individual assets */}
        {isEquipment && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 space-y-3">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
              Register individual assets
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Make</label>
                <input
                  className="input"
                  value={assetMake}
                  onChange={(e) => setAssetMake(e.target.value)}
                  placeholder="e.g. Bosch"
                />
              </div>
              <div>
                <label className="label">Model</label>
                <input
                  className="input"
                  value={assetModel}
                  onChange={(e) => setAssetModel(e.target.value)}
                  placeholder="e.g. GBH 2-26"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="label">Serial numbers (one per unit)</label>
              {assetSerials.map((serial, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-6 text-right text-xs text-gray-400">{idx + 1}.</span>
                  <input
                    className="input flex-1"
                    value={serial}
                    onChange={(e) => handleSerialChange(idx, e.target.value)}
                    placeholder={`Serial #${idx + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Confirming…' : 'Confirm Receipt'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// Modal to reject a receipt with a reason
function RejectReceiptModal({ receipt, open, onClose, onSubmit, loading }) {
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (open) setReason('')
  }, [open])

  if (!receipt) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(receipt.id, reason)
  }

  return (
    <Modal open={open} onClose={onClose} title="Reject Receipt">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-1.5">
          <div className="flex gap-3">
            <span className="w-32 flex-shrink-0 text-xs text-gray-500">Material</span>
            <span className="text-sm font-medium text-gray-900">
              {receipt.material?.name ?? '—'}
            </span>
          </div>
          <div className="flex gap-3">
            <span className="w-32 flex-shrink-0 text-xs text-gray-500">Qty Ordered</span>
            <span className="text-sm text-gray-900">
              {receipt.quantity} {receipt.material?.unit ?? ''}
            </span>
          </div>
        </div>

        <div>
          <label className="label">Rejection reason *</label>
          <input
            className="input"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Wrong material delivered"
          />
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="rounded px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
            {loading ? 'Rejecting…' : 'Reject Receipt'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default function MaterialReceipts() {
  const profile  = useAuthStore((s) => s.profile)
  const { sites, fetchSites } = useSiteStore()
  const { receipts, loading, fetchReceipts, createReceipt, confirmReceipt, rejectReceipt } = useMaterialReceiptStore()

  const [createOpen,      setCreateOpen]      = useState(false)
  const [detailItem,      setDetailItem]      = useState(null)
  const [confirmTarget,   setConfirmTarget]   = useState(null)  // receipt object for confirm modal
  const [rejectTarget,    setRejectTarget]    = useState(null)  // receipt object for reject modal
  const [saving,          setSaving]          = useState(false)
  const [acting,          setActing]          = useState(null)  // receiptId being acted on
  const [error,           setError]           = useState(null)
  const [filterStatus,    setFilterStatus]    = useState('all')

  const tenantId = profile?.tenant_id
  const role     = profile?.role

  const canCreate  = ['superadmin', 'contractor', 'store_keeper'].includes(role)
  const canConfirm = ['superadmin', 'contractor', 'site_manager'].includes(role)

  useEffect(() => {
    if (tenantId) {
      fetchSites(tenantId)
      fetchReceipts(tenantId)
    }
  }, [tenantId, fetchSites, fetchReceipts])

  const filtered = filterStatus === 'all'
    ? receipts
    : receipts.filter((r) => r.status === filterStatus)

  const pendingCount = receipts.filter((r) => r.status === 'pending').length

  const handleCreate = async (payload) => {
    setSaving(true); setError(null)
    try {
      await createReceipt({ ...payload, created_by: profile?.id })
      setCreateOpen(false)
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const handleConfirmSubmit = async (id, opts) => {
    setActing(id); setError(null)
    try {
      await confirmReceipt(id, profile?.id, opts)
      setConfirmTarget(null)
    } catch (err) { setError(err.message) }
    finally { setActing(null) }
  }

  const handleRejectSubmit = async (id, reason) => {
    setActing(id); setError(null)
    try {
      await rejectReceipt(id, profile?.id, reason)
      setRejectTarget(null)
    } catch (err) { setError(err.message) }
    finally { setActing(null) }
  }

  return (
    <div>
      <PageHeader
        title="Material Receipts"
        description="Inward register — all material deliveries with LR and challan details."
        action={
          canCreate && (
            <button onClick={() => setCreateOpen(true)} className="btn-primary">
              <Plus className="h-4 w-4" /> New Receipt
            </button>
          )
        }
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {pendingCount > 0 && canConfirm && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <Clock className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <span className="text-sm text-amber-700">
            <strong>{pendingCount}</strong> receipt{pendingCount > 1 ? 's' : ''} pending your confirmation.
          </span>
        </div>
      )}

      {/* Filter tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {['all', 'pending', 'received', 'rejected'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors capitalize ${
              filterStatus === s
                ? 'bg-brand-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {s === 'all' ? 'All' : s}
            {s === 'pending' && pendingCount > 0 && (
              <span className="ml-1.5 rounded-full bg-amber-500 px-1.5 py-0.5 text-xs text-white">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading receipts…</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No receipts found"
          description="Material receipt orders will appear here once created by the contractor or store keeper."
          action={
            canCreate && (
              <button onClick={() => setCreateOpen(true)} className="btn-primary">
                <Plus className="h-4 w-4" /> New Receipt
              </button>
            )
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Date', 'Material', 'Site', 'Source', 'Qty', 'Qty Received', 'GRN No.', 'LR No.', 'Challan No.', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filtered.map((r) => {
                const StatusIcon = STATUS_ICON[r.status] ?? Clock
                const hasDiscrepancy =
                  r.quantity_received != null &&
                  Number(r.quantity_received) !== Number(r.quantity)
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-3 py-3 text-sm font-medium text-gray-900">{r.material?.name ?? '—'}</td>
                    <td className="px-3 py-3 text-xs text-gray-500 max-w-[120px] truncate">{r.site?.name ?? '—'}</td>
                    <td className="px-3 py-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        {r.source_type === 'supplier'
                          ? <Truck className="h-3.5 w-3.5 text-gray-400" />
                          : <Warehouse className="h-3.5 w-3.5 text-gray-400" />
                        }
                        <span className="max-w-[120px] truncate">{r.source_name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {r.quantity} {r.material?.unit ?? ''}
                    </td>
                    <td className="px-3 py-3 text-sm whitespace-nowrap">
                      {r.quantity_received != null ? (
                        <span className={`flex items-center gap-1 ${hasDiscrepancy ? 'text-amber-700 font-medium' : 'text-gray-900'}`}>
                          {hasDiscrepancy && <AlertTriangle className="h-3 w-3 flex-shrink-0" />}
                          {r.quantity_received} {r.material?.unit ?? ''}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500">{r.grn_number || '—'}</td>
                    <td className="px-3 py-3 text-xs text-gray-500">{r.lr_number || '—'}</td>
                    <td className="px-3 py-3 text-xs text-gray-500">{r.challan_number || '—'}</td>
                    <td className="px-3 py-3">
                      <span className={`${STATUS_BADGE[r.status] ?? 'badge-gray'} flex items-center gap-1 w-fit`}>
                        <StatusIcon className="h-3 w-3" />{r.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setDetailItem(r)}
                          className="rounded px-2 py-1 text-xs text-brand-600 hover:bg-brand-50"
                        >
                          View
                        </button>
                        {r.status === 'pending' && canConfirm && (
                          <>
                            <button
                              disabled={acting === r.id}
                              onClick={() => setConfirmTarget(r)}
                              className="rounded px-2 py-1 text-xs text-green-700 hover:bg-green-50 disabled:opacity-50"
                            >
                              Receive
                            </button>
                            <button
                              disabled={acting === r.id}
                              onClick={() => setRejectTarget(r)}
                              className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
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

      {/* Create modal */}
      <Modal open={createOpen} onClose={() => { setCreateOpen(false); setError(null) }} title="New Receipt Order">
        {sites.length === 0 ? (
          <p className="text-sm text-gray-500">No sites available.</p>
        ) : (
          <ReceiptForm sites={sites} onSubmit={handleCreate} loading={saving} />
        )}
      </Modal>

      {/* Detail modal */}
      <Modal open={!!detailItem} onClose={() => setDetailItem(null)} title="Receipt Details">
        {detailItem && <ReceiptDetail receipt={detailItem} />}
      </Modal>

      {/* Confirm receipt modal */}
      <ConfirmReceiptModal
        receipt={confirmTarget}
        open={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onSubmit={handleConfirmSubmit}
        loading={!!acting}
      />

      {/* Reject receipt modal */}
      <RejectReceiptModal
        receipt={rejectTarget}
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onSubmit={handleRejectSubmit}
        loading={!!acting}
      />
    </div>
  )
}
