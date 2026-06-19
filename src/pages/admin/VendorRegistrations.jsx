import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Store, Phone, Mail, MapPin, Wrench, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import { formatDate } from '@/lib/utils'

const STATUS_STYLE = {
  pending:  { label: 'Pending',  cls: 'badge-yellow', icon: Clock },
  approved: { label: 'Approved', cls: 'badge-green',  icon: CheckCircle2 },
  rejected: { label: 'Rejected', cls: 'badge-gray',   icon: XCircle },
}

function VendorCard({ vendor, onAction, busy }) {
  const st = STATUS_STYLE[vendor.status] ?? STATUS_STYLE.pending
  const Icon = st.icon

  return (
    <div className="border-b border-gray-100 last:border-0 px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100">
            <Store className="h-5 w-5 text-amber-700" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{vendor.business_name}</p>
            <p className="text-xs text-gray-500">{vendor.contact_name}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{vendor.phone}</span>
              {vendor.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{vendor.email}</span>}
              {vendor.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{vendor.city}</span>}
              {vendor.work_type && <span className="flex items-center gap-1"><Wrench className="h-3 w-3" />{vendor.work_type}</span>}
            </div>
            {vendor.gst_number && <p className="mt-1 text-xs text-gray-400">GST: {vendor.gst_number}</p>}
            {vendor.note && <p className="mt-1 text-xs text-gray-600 italic">"{vendor.note}"</p>}
            <p className="mt-1 text-xs text-gray-400">Registered {formatDate(vendor.created_at)}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className={`${st.cls} flex items-center gap-1`}>
            <Icon className="h-3 w-3" /> {st.label}
          </span>
          {vendor.status === 'pending' && (
            <div className="flex gap-1.5">
              <button
                onClick={() => onAction(vendor.id, 'approved')}
                disabled={busy}
                className="rounded-md bg-green-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => onAction(vendor.id, 'rejected')}
                disabled={busy}
                className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function VendorRegistrations() {
  const [vendors, setVendors]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [busy, setBusy]         = useState(false)
  const [filter, setFilter]     = useState('all')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('vendor_registrations')
        .select('*')
        .order('created_at', { ascending: false })
      if (err) throw err
      setVendors(data ?? [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleAction = async (id, status) => {
    setBusy(true)
    try {
      const { error: err } = await supabase
        .from('vendor_registrations')
        .update({ status })
        .eq('id', id)
      if (err) throw err
      setVendors((prev) => prev.map((v) => v.id === id ? { ...v, status } : v))
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const filtered = filter === 'all' ? vendors : vendors.filter((v) => v.status === filter)
  const counts = { pending: 0, approved: 0, rejected: 0 }
  vendors.forEach((v) => { if (counts[v.status] !== undefined) counts[v.status]++ })

  return (
    <div>
      <PageHeader
        title="Vendor Registrations"
        description="Vendors who registered through the website form."
      />

      {!loading && vendors.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="card px-4 py-3 flex items-center gap-2">
            <Store className="h-4 w-4 text-amber-700" />
            <span className="text-sm font-semibold text-gray-900">{vendors.length}</span>
            <span className="text-sm text-gray-500">total</span>
          </div>
          {counts.pending > 0 && (
            <div className="card px-4 py-3 flex items-center gap-2">
              <span className="badge-yellow">{counts.pending} pending</span>
            </div>
          )}
          <div className="flex-1" />
          <select className="input max-w-[160px]" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All ({vendors.length})</option>
            <option value="pending">Pending ({counts.pending})</option>
            <option value="approved">Approved ({counts.approved})</option>
            <option value="rejected">Rejected ({counts.rejected})</option>
          </select>
          <button onClick={load} className="btn-secondary flex items-center gap-1.5">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <p className="px-5 py-8 text-sm text-gray-500">Loading registrations…</p>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <Store className="mx-auto h-10 w-10 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">
              {vendors.length === 0 ? 'No vendor registrations yet.' : `No ${filter} registrations.`}
            </p>
          </div>
        ) : (
          <div>
            {filtered.map((v) => (
              <VendorCard key={v.id} vendor={v} onAction={handleAction} busy={busy} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
