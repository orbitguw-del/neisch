import { useEffect, useState, useMemo } from 'react'
import { Package, Download } from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import useReportsStore from '@/stores/reportsStore'
import { WORK_TYPES, WORK_TYPE_COLORS } from '@/lib/materialPresets'
import { downloadSheet, fmtINR } from '@/lib/exportXLS'
import PrintButton from '@/components/print/PrintButton'
import PrintHeader from '@/components/print/PrintHeader'
import StatCard from '@/components/ui/StatCard'
import { cn } from '@/lib/utils'

const WORK_LABEL = Object.fromEntries(WORK_TYPES.map(({ value, label }) => [value, label]))

export default function StockReportTab({ sites }) {
  const profile   = useAuthStore((s) => s.profile)
  const tenantId  = profile?.tenant_id
  const { stockData, stockLoading, fetchStockReport } = useReportsStore()
  const [siteId, setSiteId] = useState('')
  const [workType, setWorkType] = useState('')

  useEffect(() => {
    if (tenantId) fetchStockReport(tenantId, siteId || null)
  }, [tenantId, siteId])

  const filtered = useMemo(() => {
    if (!stockData) return []
    return workType ? stockData.filter((m) => m.work_type === workType) : stockData
  }, [stockData, workType])

  const totalItems = filtered.length
  const lowStock   = filtered.filter((m) => Number(m.quantity_available) <= 0).length

  // Group by site for display
  const bySite = useMemo(() => {
    const map = {}
    filtered.forEach((m) => {
      const key = m.site_id
      if (!map[key]) map[key] = { name: m.sites?.name ?? '—', type: m.sites?.type, rows: [] }
      map[key].rows.push(m)
    })
    return Object.values(map).sort((a, b) => {
      if (a.type === 'warehouse' && b.type !== 'warehouse') return -1
      if (b.type === 'warehouse' && a.type !== 'warehouse') return 1
      return a.name.localeCompare(b.name)
    })
  }, [filtered])

  const siteName = siteId ? (sites.find((s) => s.id === siteId)?.name ?? '—') : 'All sites'

  function handleExport() {
    const rows = [
      ['Site', 'Material', 'Brand', 'Work type', 'Unit', 'Stock'],
      ...filtered.map((m) => [
        m.sites?.name ?? '—',
        m.name,
        m.brand || 'Generic',
        WORK_LABEL[m.work_type] ?? m.work_type ?? '—',
        m.unit,
        Number(m.quantity_available ?? 0),
      ]),
    ]
    const date = new Date().toISOString().slice(0, 10)
    downloadSheet(rows, 'Stock', `stock-snapshot-${date}`)
  }

  return (
    <div className="space-y-6">
      <PrintHeader
        title="Stock Snapshot"
        subtitle={`Site: ${siteName} · ${totalItems} materials`}
      />

      {/* Filters */}
      <div className="no-print flex flex-wrap items-center gap-3">
        <select
          className="input py-1.5 pr-8 text-sm"
          value={siteId}
          onChange={(e) => setSiteId(e.target.value)}
        >
          <option value="">All sites</option>
          {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select
          className="input py-1.5 pr-8 text-sm"
          value={workType}
          onChange={(e) => setWorkType(e.target.value)}
        >
          <option value="">All work types</option>
          {WORK_TYPES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <div className="ml-auto flex items-center gap-2">
          <PrintButton label="Print" />
          <button
            onClick={handleExport}
            disabled={!filtered.length}
            className="btn-secondary flex items-center gap-1.5 text-sm"
          >
            <Download className="h-4 w-4" /> Export XLS
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Total materials" value={totalItems}  icon={Package} color="brand" />
        <StatCard label="Zero stock"      value={lowStock}    icon={Package} color="red"   />
        <StatCard label="Sites covered"   value={bySite.length} icon={Package} color="sage" />
      </div>

      {/* Table per site */}
      {stockLoading ? (
        <p className="card px-5 py-8 text-sm text-gray-500">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="card px-5 py-8 text-sm text-gray-500 text-center">No materials found.</p>
      ) : (
        bySite.map((group) => (
          <div key={group.name} className="card overflow-hidden">
            <div className="border-b border-gray-200 px-5 py-3 flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-900 flex-1">{group.name}</h2>
              {group.type === 'warehouse' && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">Warehouse</span>
              )}
              <span className="text-xs text-gray-500">{group.rows.length} items</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    {['Material', 'Brand', 'Work type', 'Unit', 'Stock'].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {group.rows.map((m) => (
                    <tr key={m.id} className={cn('hover:bg-gray-50', Number(m.quantity_available) <= 0 && 'bg-red-50/40')}>
                      <td className="px-4 py-2.5 text-sm font-medium text-gray-900">{m.name}</td>
                      <td className="px-4 py-2.5 text-sm text-gray-500">{m.brand || <span className="text-gray-300">Generic</span>}</td>
                      <td className="px-4 py-2.5">
                        {m.work_type ? (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${WORK_TYPE_COLORS[m.work_type]}`}>
                            {WORK_LABEL[m.work_type] ?? m.work_type}
                          </span>
                        ) : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-gray-600">{m.unit}</td>
                      <td className={cn(
                        'px-4 py-2.5 text-sm font-semibold',
                        Number(m.quantity_available) <= 0 ? 'text-red-600' : 'text-gray-900',
                      )}>
                        {Number(m.quantity_available ?? 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
