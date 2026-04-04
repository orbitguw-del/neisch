import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import useMaterialTransactionStore, { TXN_LABELS, TXN_SIGN, TXN_BADGE } from '@/stores/materialTransactionStore'
import { formatINR } from '@/lib/utils'

function SignIcon({ sign }) {
  if (sign === '+') return <TrendingUp  className="h-3.5 w-3.5 text-green-600" />
  if (sign === '-') return <TrendingDown className="h-3.5 w-3.5 text-red-500" />
  return <Minus className="h-3.5 w-3.5 text-yellow-600" />
}

export default function MaterialLedger() {
  const { materialId } = useParams()
  const navigate = useNavigate()
  const { transactions, loading, fetchLedger } = useMaterialTransactionStore()

  const [material, setMaterial] = useState(null)
  const [matLoading, setMatLoading] = useState(true)

  useEffect(() => {
    if (!materialId) return
    // Load material details
    supabase.from('materials').select('*, site:sites(id, name)').eq('id', materialId).single()
      .then(({ data }) => {
        if (data) {
          // Handle site separately since FK join may not work
          if (!data.site) {
            supabase.from('sites').select('id, name').eq('id', data.site_id).single()
              .then(({ data: siteData }) => setMaterial({ ...data, site: siteData }))
          } else {
            setMaterial(data)
          }
        }
        setMatLoading(false)
      })
    fetchLedger(materialId)
  }, [materialId, fetchLedger])

  if (matLoading) return <p className="text-sm text-gray-500 p-4">Loading…</p>
  if (!material)  return <p className="text-sm text-red-600 p-4">Material not found.</p>

  const isLow = material.quantity_minimum != null && material.quantity_available != null
    && Number(material.quantity_available) <= Number(material.quantity_minimum)

  // Summary stats
  const totalIn  = transactions.filter((t) => TXN_SIGN[t.txn_type] === '+').reduce((s, t) => s + Number(t.quantity), 0)
  const totalOut = transactions.filter((t) => TXN_SIGN[t.txn_type] === '-').reduce((s, t) => s + Number(t.quantity), 0)

  return (
    <div>
      <button onClick={() => navigate('/inventory')}
        className="mb-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to Inventory
      </button>

      {/* Material header */}
      <div className="card p-5 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-lg font-bold text-gray-900">{material.name}</p>
            <p className="text-sm text-gray-500">{material.site?.name} · {material.unit} · {material.category}</p>
            {material.supplier && <p className="text-xs text-gray-400 mt-0.5">Supplier: {material.supplier}</p>}
          </div>
          <div className="flex gap-6 text-right">
            <div>
              <p className="text-xs text-gray-500">Current Stock</p>
              <p className={`text-2xl font-bold ${isLow ? 'text-red-600' : 'text-gray-900'}`}>
                {material.quantity_available ?? '—'} <span className="text-sm font-normal">{material.unit}</span>
              </p>
              {isLow && <p className="text-xs text-red-500">Below reorder level ({material.quantity_minimum})</p>}
            </div>
            {material.unit_cost && (
              <div>
                <p className="text-xs text-gray-500">Unit Cost</p>
                <p className="text-lg font-semibold text-gray-900">{formatINR(material.unit_cost)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Movement summary */}
        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-gray-100 pt-4">
          <div className="rounded-lg bg-green-50 px-4 py-2.5 text-center">
            <p className="text-xs text-green-700 font-medium">Total In</p>
            <p className="text-lg font-bold text-green-800">+{totalIn} {material.unit}</p>
          </div>
          <div className="rounded-lg bg-red-50 px-4 py-2.5 text-center">
            <p className="text-xs text-red-700 font-medium">Total Out</p>
            <p className="text-lg font-bold text-red-800">-{totalOut} {material.unit}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-4 py-2.5 text-center">
            <p className="text-xs text-gray-600 font-medium">Transactions</p>
            <p className="text-lg font-bold text-gray-800">{transactions.length}</p>
          </div>
        </div>
      </div>

      {/* Ledger table */}
      {loading ? (
        <p className="text-sm text-gray-500">Loading ledger…</p>
      ) : transactions.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm text-gray-500">No transactions recorded yet.</p>
          <p className="text-xs text-gray-400 mt-1">Transactions appear when stock moves — receipts, consumption, transfers, and adjustments.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">Transaction Ledger</h2>
            <p className="text-xs text-gray-500">Sorted oldest → newest · Running balance computed from first entry</p>
          </div>
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Date & Time', 'Type', 'Document / Reference', 'In (+)', 'Out (−)', 'Balance', 'Recorded by'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {transactions.map((t, idx) => {
                const sign    = TXN_SIGN[t.txn_type] ?? '+'
                const isFirst = idx === 0
                return (
                  <tr key={t.id} className={isFirst ? 'bg-blue-50/40' : 'hover:bg-gray-50'}>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      <p>{new Date(t.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                      <p className="text-gray-400">{new Date(t.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={TXN_BADGE[t.txn_type] ?? 'badge-gray'}>
                        {TXN_LABELS[t.txn_type] ?? t.txn_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[240px]">
                      <p className="truncate">{t.note || '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-green-700">
                      {sign === '+' ? <span className="flex items-center gap-1"><SignIcon sign="+" />{t.quantity} {material.unit}</span> : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-red-600">
                      {sign === '-' ? <span className="flex items-center gap-1"><SignIcon sign="-" />{t.quantity} {material.unit}</span> : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {sign === '=' && <SignIcon sign="=" />}
                        {t.computed_balance} {material.unit}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {t.created_by_profile?.full_name ?? '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
