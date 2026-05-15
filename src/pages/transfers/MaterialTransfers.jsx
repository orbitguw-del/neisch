import { useEffect, useState } from 'react'
import { Plus, ArrowRightLeft, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import useAuthStore from '@/stores/authStore'
import useSiteStore from '@/stores/siteStore'
import useMaterialTransferStore from '@/stores/materialTransferStore'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'

const STATUS_BADGE = { pending: 'badge-yellow', confirmed: 'badge-green', rejected: 'badge-red' }
const STATUS_ICON  = { pending: Clock, confirmed: CheckCircle, rejected: XCircle }

const DISCREPANCY_ACTIONS = [
  { value: 'accept_partial',  label: 'Accept partial delivery' },
  { value: 'reject_balance',  label: 'Reject balance (vendor resend)' },
  { value: 'pending_balance', label: 'Balance delivery pending' },
]

function TransferForm({ sites, myAssignedSiteIds, onSubmit, loading }) {
  // For site_manager: from_site is pre-selected to one of their assigned sites
  const isSiteManager = myAssignedSiteIds.length > 0
  const fromSiteOptions = isSiteManager
    ? sites.filter((s) => myAssignedSiteIds.includes(s.id))
    : sites

  const [form, setForm] = useState({
    from_site_id: fromSiteOptions[0]?.id ?? '',
    to_site_id:   '',
    material_id:  '',
    quantity:     '',
    lr_number:    '',
    lr_date:      '',
    challan_number: '',
    challan_date:   '',
    vehicle_number: '',
    note:           '',
  })
  const [fromMaterials, setFromMaterials] = useState([])
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    if (!form.from_site_id) return
    supabase
      .from('materials')
      .select('id, name, unit, quantity_available')
      .eq('site_id', form.from_site_id)
      .order('name')
      .then(({ data }) => {
        setFromMaterials(data ?? [])
        setForm((f) => ({ ...f, material_id: data?.[0]?.id ?? '' }))
      })
  }, [form.from_site_id])

  const toSiteOptions = sites.filter((s) => s.id !== form.from_site_id)
  const selectedMat   = fromMaterials.find((m) => m.id === form.material_id)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const site = sites.find((s) => s.id === form.from_site_id)
        onSubmit({ ...form, tenant_id: site?.tenant_id, lr_date: form.lr_date || null, challan_date: form.challan_date || null })
      }}
      className="space-y-4"
    >
      {/* From / To */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">From site *</label>
          <select className="input" required value={form.from_site_id} onChange={set('from_site_id')}>
            {fromSiteOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">To site *</label>
          <select className="input" required value={form.to_site_id} onChange={set('to_site_id')}>
            <option value="">— Select destination —</option>
            {toSiteOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {/* Material + Quantity */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Material *</label>
          <select className="input" required value={form.material_id} onChange={set('material_id')}>
            <option value="">— Select —</option>
            {fromMaterials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.quantity_available ?? 0} {m.unit} available)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Quantity{selectedMat ? ` (${selectedMat.unit})` : ''} *</label>
          <input className="input" type="number" min="0.01" step="any" required
            value={form.quantity} onChange={set('quantity')}
            max={selectedMat?.quantity_available ?? undefined} placeholder="0" />
          {selectedMat && (
            <p className="mt-1 text-xs text-gray-400">Available: {selectedMat.quantity_available ?? 0} {selectedMat.unit}</p>
          )}
        </div>
      </div>

      {/* LR */}
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

      {/* Challan */}
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
          {loading ? 'Saving…' : 'Initiate Transfer'}
        </button>
      </div>
    </form>
  )
}

// Modal to confirm a transfer with quantity + discrepancy
function ConfirmTransferModal({ transfer, open, onClose, onSubmit, loading }) {
  const dispatchedQty = transfer ? Number(transfer.quantity) : 0

  const [quantityReceived,  setQuantityReceived]  = useState('')
  const [discrepancyReason, setDiscrepancyReason] = useState('')
  const [discrepancyAction, setDiscrepancyAction] = useState('accept_partial')

  // Reset form when modal opens with a new transfer
  useEffect(() => {
    if (open && transfer) {
      setQuantityReceived(String(transfer.quantity))
      setDiscrepancyReason('')
      setDiscrepancyAction('accept_partial')
    }
  }, [open, transfer])

  if (!transfer) return null

  const qtyNum         = parseFloat(quantityReceived) || 0
  const hasDiscrepancy = quantityReceived !== '' && qtyNum !== dispatchedQty

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(transfer.id, {
      quantityReceived: qtyNum,
      discrepancyReason: hasDiscrepancy ? discrepancyReason : '',
      discrepancyAction: hasDiscrepancy ? discrepancyAction : null,
    })
  }

  return (
    <Modal open={open} onClose={onClose} title="Confirm Transfer Receipt">
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Summary info */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-1.5">
          <div className="flex gap-3">
            <span className="w-32 flex-shrink-0 text-xs text-gray-500">Material</span>
            <span className="text-sm font-medium text-gray-900">
              {transfer.material?.name ?? '—'} ({transfer.material?.unit ?? ''})
            </span>
          </div>
          <div className="flex gap-3">
            <span className="w-32 flex-shrink-0 text-xs text-gray-500">From site</span>
            <span className="text-sm text-gray-900">{transfer.from_site?.name ?? '—'}</span>
          </div>
          <div className="flex gap-3">
            <span className="w-32 flex-shrink-0 text-xs text-gray-500">To site</span>
            <span className="text-sm text-gray-900">{transfer.to_site?.name ?? '—'}</span>
          </div>
          <div className="flex gap-3">
            <span className="w-32 flex-shrink-0 text-xs text-gray-500">Qty Dispatched</span>
            <span className="text-sm font-semibold text-gray-900">
              {transfer.quantity} {transfer.material?.unit ?? ''}
            </span>
          </div>
          {transfer.lr_number && (
            <div className="flex gap-3">
              <span className="w-32 flex-shrink-0 text-xs text-gray-500">LR No.</span>
              <span className="text-sm text-gray-900">{transfer.lr_number}</span>
            </div>
          )}
          {transfer.challan_number && (
            <div className="flex gap-3">
              <span className="w-32 flex-shrink-0 text-xs text-gray-500">Challan No.</span>
              <span className="text-sm text-gray-900">{transfer.challan_number}</span>
            </div>
          )}
        </div>

        {/* Quantity actually received */}
        <div>
          <label className="label">
            Quantity actually received ({transfer.material?.unit ?? 'units'}) *
          </label>
          <input
            className="input"
            type="number"
            min="0.01"
            step="any"
            required
            value={quantityReceived}
            onChange={(e) => setQuantityReceived(e.target.value)}
          />
        </div>

        {/* Discrepancy section — shown when quantity differs */}
        {hasDiscrepancy && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 uppercase tracking-wide">
              <AlertTriangle className="h-3.5 w-3.5" />
              Discrepancy detected — dispatched {dispatchedQty}, received {qtyNum}
            </div>
            <div>
              <label className="label">Discrepancy reason *</label>
              <input
                className="input"
                required
                value={discrepancyReason}
                onChange={(e) => setDiscrepancyReason(e.target.value)}
                placeholder="e.g. 3 bags spilled during transit"
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

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Confirming…' : 'Confirm Transfer'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default function MaterialTransfers() {
  const profile  = useAuthStore((s) => s.profile)
  const { sites, fetchSites } = useSiteStore()
  const { transfers, loading, fetchTransfers, createTransfer, confirmTransfer, rejectTransfer } = useMaterialTransferStore()

  const [createOpen,          setCreateOpen]          = useState(false)
  const [detailItem,          setDetailItem]          = useState(null)
  const [confirmTarget,       setConfirmTarget]       = useState(null)  // transfer object for confirm modal
  const [saving,              setSaving]              = useState(false)
  const [acting,              setActing]              = useState(null)
  const [error,               setError]               = useState(null)
  const [filterStatus,        setFilterStatus]        = useState('all')
  const [myAssignedSiteIds,   setMyAssignedSiteIds]   = useState([])

  const tenantId = profile?.tenant_id
  const role     = profile?.role

  const canCreate  = ['superadmin', 'contractor', 'site_manager'].includes(role)
  const canConfirm = ['superadmin', 'contractor', 'site_manager'].includes(role)

  useEffect(() => {
    if (!tenantId) return
    fetchSites(tenantId)
    fetchTransfers(tenantId)
    // For site managers, get their assigned site IDs
    if (role === 'site_manager') {
      supabase
        .from('site_assignments')
        .select('site_id')
        .eq('profile_id', profile.id)
        .then(({ data }) => setMyAssignedSiteIds((data ?? []).map((a) => a.site_id)))
    }
  }, [tenantId, role, fetchSites, fetchTransfers])

  const filtered = filterStatus === 'all'
    ? transfers
    : transfers.filter((t) => t.status === filterStatus)

  const pendingCount = transfers.filter((t) => t.status === 'pending').length

  // Site manager can only confirm transfers TO their sites
  const canConfirmTransfer = (transfer) => {
    if (['superadmin', 'contractor'].includes(role)) return true
    if (role === 'site_manager') return myAssignedSiteIds.includes(transfer.to_site_id)
    return false
  }

  const handleCreate = async (payload) => {
    setSaving(true); setError(null)
    try {
      await createTransfer({ ...payload, initiated_by: profile?.id })
      setCreateOpen(false)
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const handleConfirmSubmit = async (id, opts) => {
    setActing(id); setError(null)
    try {
      await confirmTransfer(id, profile?.id, opts)
      setConfirmTarget(null)
    } catch (err) { setError(err.message) }
    finally { setActing(null) }
  }

  const handleReject = async (id) => {
    setActing(id); setError(null)
    try { await rejectTransfer(id, profile?.id) }
    catch (err) { setError(err.message) }
    finally { setActing(null) }
  }

  return (
    <div>
      <PageHeader
        title="Material Transfers"
        description="Inter-site material movements — initiated by site managers, confirmed on receipt."
        action={
          canCreate && (
            <button onClick={() => setCreateOpen(true)} className="btn-primary">
              <Plus className="h-4 w-4" /> New Transfer
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
            <strong>{pendingCount}</strong> transfer{pendingCount > 1 ? 's' : ''} awaiting confirmation.
          </span>
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {['all', 'pending', 'confirmed', 'rejected'].map((s) => (
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
        <p className="text-sm text-gray-500">Loading transfers…</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ArrowRightLeft}
          title="No transfers found"
          description="Initiate a transfer when you need to move materials between sites."
          action={
            canCreate && (
              <button onClick={() => setCreateOpen(true)} className="btn-primary">
                <Plus className="h-4 w-4" /> New Transfer
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
                {['Date', 'Material', 'From', 'To', 'Qty Dispatched', 'Qty Received', 'LR No.', 'Challan No.', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filtered.map((t) => {
                const StatusIcon = STATUS_ICON[t.status] ?? Clock
                const hasDiscrepancy =
                  t.quantity_received != null &&
                  Number(t.quantity_received) !== Number(t.quantity)
                return (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(t.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-3 py-3 text-sm font-medium text-gray-900">{t.material?.name ?? '—'}</td>
                    <td className="px-3 py-3 text-xs text-gray-500 max-w-[120px] truncate">{t.from_site?.name ?? '—'}</td>
                    <td className="px-3 py-3 text-xs text-gray-500 max-w-[120px] truncate">{t.to_site?.name ?? '—'}</td>
                    <td className="px-3 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {t.quantity} {t.material?.unit ?? ''}
                    </td>
                    <td className="px-3 py-3 text-sm whitespace-nowrap">
                      {t.quantity_received != null ? (
                        <span className={`flex items-center gap-1 ${hasDiscrepancy ? 'text-amber-700 font-medium' : 'text-gray-900'}`}>
                          {hasDiscrepancy && <AlertTriangle className="h-3 w-3 flex-shrink-0" />}
                          {t.quantity_received} {t.material?.unit ?? ''}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500">{t.lr_number || '—'}</td>
                    <td className="px-3 py-3 text-xs text-gray-500">{t.challan_number || '—'}</td>
                    <td className="px-3 py-3">
                      <span className={`${STATUS_BADGE[t.status] ?? 'badge-gray'} flex items-center gap-1 w-fit`}>
                        <StatusIcon className="h-3 w-3" />{t.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setDetailItem(t)}
                          className="rounded px-2 py-1 text-xs text-brand-600 hover:bg-brand-50"
                        >
                          View
                        </button>
                        {t.status === 'pending' && canConfirmTransfer(t) && (
                          <>
                            <button
                              disabled={acting === t.id}
                              onClick={() => setConfirmTarget(t)}
                              className="rounded px-2 py-1 text-xs text-green-700 hover:bg-green-50 disabled:opacity-50"
                            >
                              Confirm
                            </button>
                            <button
                              disabled={acting === t.id}
                              onClick={() => handleReject(t.id)}
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

      <Modal open={createOpen} onClose={() => { setCreateOpen(false); setError(null) }} title="Initiate Material Transfer">
        {sites.length < 2 ? (
          <p className="text-sm text-gray-500">At least two sites are needed to initiate a transfer.</p>
        ) : (
          <TransferForm
            sites={sites}
            myAssignedSiteIds={myAssignedSiteIds}
            onSubmit={handleCreate}
            loading={saving}
          />
        )}
      </Modal>

      {/* Detail modal */}
      <Modal open={!!detailItem} onClose={() => setDetailItem(null)} title="Transfer Details">
        {detailItem && (
          <div className="space-y-3">
            <div className="space-y-2">
              {[
                ['Material',      `${detailItem.material?.name ?? '—'} (${detailItem.material?.unit ?? ''})`],
                ['From site',     detailItem.from_site?.name ?? '—'],
                ['To site',       detailItem.to_site?.name ?? '—'],
                ['Qty Dispatched', `${detailItem.quantity} ${detailItem.material?.unit ?? ''}`],
                ['Qty Received',  detailItem.quantity_received != null
                  ? `${detailItem.quantity_received} ${detailItem.material?.unit ?? ''}`
                  : '—'],
                ['LR Number',     detailItem.lr_number     ?? '—'],
                ['LR Date',       detailItem.lr_date       ?? '—'],
                ['Challan No.',   detailItem.challan_number ?? '—'],
                ['Challan Date',  detailItem.challan_date   ?? '—'],
                ['Vehicle',       detailItem.vehicle_number ?? '—'],
                ['Note',          detailItem.note           ?? '—'],
                ['Initiated by',  detailItem.initiated_by_profile?.full_name ?? '—'],
                ['Confirmed by',  detailItem.confirmed_by_profile?.full_name ?? '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <span className="w-28 flex-shrink-0 text-xs text-gray-500">{label}</span>
                  <span className="text-sm text-gray-900">{value}</span>
                </div>
              ))}
            </div>

            {/* Discrepancy info in detail view */}
            {detailItem.quantity_received != null &&
              Number(detailItem.quantity_received) !== Number(detailItem.quantity) && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 uppercase tracking-wide">
                  <AlertTriangle className="h-3.5 w-3.5" /> Discrepancy
                </div>
                {detailItem.discrepancy_reason && (
                  <div className="flex gap-3">
                    <span className="w-28 flex-shrink-0 text-xs text-gray-500">Reason</span>
                    <span className="text-sm text-gray-900">{detailItem.discrepancy_reason}</span>
                  </div>
                )}
                {detailItem.discrepancy_action && (
                  <div className="flex gap-3">
                    <span className="w-28 flex-shrink-0 text-xs text-gray-500">Action</span>
                    <span className="text-sm text-gray-900">
                      {DISCREPANCY_ACTIONS.find((a) => a.value === detailItem.discrepancy_action)?.label ?? detailItem.discrepancy_action}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Confirm transfer modal */}
      <ConfirmTransferModal
        transfer={confirmTarget}
        open={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onSubmit={handleConfirmSubmit}
        loading={!!acting}
      />
    </div>
  )
}
