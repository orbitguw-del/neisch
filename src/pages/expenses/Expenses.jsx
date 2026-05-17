import { useEffect, useMemo, useState } from 'react'
import {
  Plus, Wallet, CheckCircle2, Clock, XCircle, Trash2, IndianRupee,
} from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import useSiteStore from '@/stores/siteStore'
import useExpenseStore from '@/stores/expenseStore'
import PageHeader from '@/components/ui/PageHeader'
import StatCard from '@/components/ui/StatCard'
import Modal from '@/components/ui/Modal'
import { formatINR, formatDate, cn } from '@/lib/utils'

const CATEGORIES = [
  'Fuel',
  'Transport',
  'Food & refreshment',
  'Equipment rental',
  'Repairs & maintenance',
  'Labour advance',
  'Office / admin',
  'Miscellaneous',
]

const STATUS_BADGE = {
  pending:  { label: 'Pending',  cls: 'badge-yellow', icon: Clock },
  approved: { label: 'Approved', cls: 'badge-green',  icon: CheckCircle2 },
  rejected: { label: 'Rejected', cls: 'badge-red',    icon: XCircle },
}

function todayISO() { return new Date().toISOString().slice(0, 10) }
function firstOfMonthISO() {
  const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10)
}

// ── Add-expense form ──────────────────────────────────────────────────────────

function ExpenseForm({ sites, defaultSiteId, onSubmit, loading, onCancel }) {
  const [form, setForm] = useState({
    site_id:      defaultSiteId ?? (sites[0]?.id ?? ''),
    expense_date: todayISO(),
    category:     CATEGORIES[0],
    amount:       '',
    paid_by:      '',
    note:         '',
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.site_id || !form.amount || Number(form.amount) <= 0) return
    onSubmit({
      site_id:      form.site_id,
      expense_date: form.expense_date,
      category:     form.category,
      amount:       Number(form.amount),
      paid_by:      form.paid_by.trim() || null,
      note:         form.note.trim() || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Site *</label>
          <select className="input" required value={form.site_id} onChange={set('site_id')}>
            {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Date *</label>
          <input type="date" className="input" required max={todayISO()}
            value={form.expense_date} onChange={set('expense_date')} />
        </div>
        <div>
          <label className="label">Category *</label>
          <select className="input" value={form.category} onChange={set('category')}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Amount (₹) *</label>
          <input type="number" min="1" step="1" required className="input"
            value={form.amount} onChange={set('amount')} placeholder="2000" />
        </div>
        <div>
          <label className="label">Paid by</label>
          <input className="input" value={form.paid_by} onChange={set('paid_by')}
            placeholder="Cash / name" />
        </div>
        <div className="col-span-2">
          <label className="label">Note</label>
          <input className="input" value={form.note} onChange={set('note')}
            placeholder="What was this for?" />
        </div>
      </div>
      <p className="text-xs text-gray-500">
        New expenses are recorded as <strong>Pending</strong> and need a Site Manager's approval.
      </p>
      <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving…' : 'Add Expense'}
        </button>
      </div>
    </form>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Expenses() {
  const profile = useAuthStore((s) => s.profile)
  const tenantId = profile?.tenant_id
  const role = profile?.role
  const canApprove = ['superadmin', 'contractor', 'site_manager'].includes(role)
  const canDelete  = ['superadmin', 'contractor'].includes(role)

  const { sites, fetchSites } = useSiteStore()
  const { expenses, loading, fetchExpenses, createExpense, setExpenseStatus, deleteExpense } = useExpenseStore()

  const [siteId, setSiteId]       = useState('')
  const [startDate, setStartDate] = useState(firstOfMonthISO())
  const [endDate, setEndDate]     = useState(todayISO())
  const [statusFilter, setStatusFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState(null)

  useEffect(() => { if (tenantId) fetchSites(tenantId) }, [tenantId, fetchSites])

  useEffect(() => {
    if (tenantId) {
      fetchExpenses(tenantId, { siteId: siteId || null, startDate, endDate })
    }
  }, [tenantId, siteId, startDate, endDate])

  const filtered = useMemo(
    () => statusFilter === 'all' ? expenses : expenses.filter((e) => e.status === statusFilter),
    [expenses, statusFilter],
  )

  const totals = useMemo(() => {
    let approved = 0, pending = 0
    expenses.forEach((e) => {
      if (e.status === 'approved') approved += Number(e.amount)
      if (e.status === 'pending')  pending  += Number(e.amount)
    })
    return { approved, pending, count: expenses.length }
  }, [expenses])

  const handleAdd = async (payload) => {
    setSaving(true); setError(null)
    try {
      await createExpense({ ...payload, tenant_id: tenantId, created_by: profile?.id })
      setModalOpen(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleStatus = async (id, status) => {
    try {
      await setExpenseStatus(id, status, profile?.id)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (id) => {
    try { await deleteExpense(id) } catch (err) { setError(err.message) }
  }

  return (
    <div>
      <PageHeader
        title="Site Expenses"
        description="Record fuel, transport, rentals and other cash spends — approved by your Site Manager."
        action={
          <button onClick={() => setModalOpen(true)} className="btn-primary" disabled={sites.length === 0}>
            <Plus className="h-4 w-4" /> Add Expense
          </button>
        }
      />

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-end gap-3">
        <div>
          <label className="label">Site</label>
          <select className="input py-1.5 pr-8 text-sm" value={siteId} onChange={(e) => setSiteId(e.target.value)}>
            <option value="">All sites</option>
            {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">From</label>
          <input type="date" className="input py-1.5 text-sm" value={startDate}
            max={endDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="label">To</label>
          <input type="date" className="input py-1.5 text-sm" value={endDate}
            min={startDate} max={todayISO()} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input py-1.5 pr-8 text-sm" value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Approved spend" value={formatINR(totals.approved)} icon={CheckCircle2} color="red" />
        <StatCard label="Pending approval" value={formatINR(totals.pending)} icon={Clock} color="sage" />
        <StatCard label="Total entries" value={totals.count} icon={Wallet} color="brand" />
      </div>

      {/* List */}
      <div className="card overflow-hidden">
        {loading ? (
          <p className="px-5 py-8 text-sm text-gray-500">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="px-5 py-8 text-sm text-gray-500">No expenses for this filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Date', 'Site', 'Category', 'Amount', 'Paid by', 'Status', 'Added by', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((e) => {
                  const sb = STATUS_BADGE[e.status] ?? STATUS_BADGE.pending
                  return (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(e.expense_date)}</td>
                      <td className="px-4 py-3 text-gray-900">{e.sites?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{e.category}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{formatINR(e.amount)}</td>
                      <td className="px-4 py-3 text-gray-600">{e.paid_by || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={sb.cls}>{sb.label}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{e.creator?.full_name ?? '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2 justify-end">
                          {canApprove && e.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatus(e.id, 'approved')}
                                className="rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatus(e.id, 'rejected')}
                                className="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(e.id)}
                              className="text-gray-300 hover:text-red-500 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Site Expense">
        <ExpenseForm
          sites={sites}
          defaultSiteId={siteId}
          onSubmit={handleAdd}
          loading={saving}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  )
}
