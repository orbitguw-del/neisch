import { useEffect, useState, useMemo } from 'react'
import { Package, Download } from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import useReportsStore from '@/stores/reportsStore'
import { WORK_TYPES, WORK_TYPE_COLORS } from '@/lib/materialPresets'
import { downloadSheet, fmtINR } from '@/lib/exportXLS'
import { shareOnWhatsApp } from '@/lib/whatsapp'
import PrintButton from '@/components/print/PrintButton'
import PrintHeader from '@/components/print/PrintHeader'
import StatCard from '@/components/ui/StatCard'
import { formatINR, cn } from '@/lib/utils'

const WORK_LABEL = Object.fromEntries(WORK_TYPES.map(({ value, label }) => [value, label]))

export default function StockReportTab({ sites }) {
  const profile   = useAuthStore((s) => s.profile)
  const tenantId  = profile?.tenant_id
  const { stockData, stockLoading, fetchStockReport } = useReportsStore()
  const [siteId,   setSiteId]   = useState('')
  const [workType, setWorkType] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    if (tenantId) fetchStockReport(tenantId, siteId || null)
  }, [tenantId, siteId])

  const filtered = useMemo(() => {
    if (!stockData) return []
    return stockData.filter((m) => {
      if (workType && m.work_type !== workType) return false
      if (category && m.category !== category) return false
      return true
    })
  }, [stockData, workType, category])

  const totalStockValue = filtered.reduce((s, m) =>
    s + Number(m.quantity_available ?? 0) * Number(m.unit_cost ?? 0), 0)

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
      ['Site', 'Material', 'Brand', 'Category', 'Work type', 'Unit', 'Rate (₹)', 'Stock', 'Value (₹)'],
      ...filtered.map((m) => {
        const qty  = Number(m.quantity_available ?? 0)
        const rate = Number(m.unit_cost ?? 0)
        return [
          m.sites?.name ?? '—', m.name, m.brand || 'Generic',
          m.category === 'equipment' ? 'Equipment' : 'Consumable',
          WORK_LABEL[m.work_type] ?? m.work_type ?? '—',
          m.unit, rate || '', qty, rate > 0 && qty > 0 ? qty * rate : '',
        ]
      }),
      ['', '', '', '', '', '', 'Total value', '', totalStockValue],
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
        <select
          className="input py-1.5 pr-8 text-sm"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          <option value="consumable">Consumable</option>
          <option value="equipment">Equipment</option>
        </select>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => {
              if (!filtered.length) return
              const lines = [
                `📦 Stock Snapshot — ${siteName}`,
                ``,
                `Materials: ${totalItems} | Zero stock: ${lowStock}`,
                `💰 Total stock value: ${fmtINR(totalStockValue)}`,
              ]
              shareOnWhatsApp(lines.join('\n'))
            }}
            disabled={!filtered.length}
            className="btn-secondary flex items-center gap-1.5 text-sm"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp
          </button>
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total materials" value={totalItems}             icon={Package} color="brand" />
        <StatCard label="Zero stock"      value={lowStock}               icon={Package} color="red"   />
        <StatCard label="Stock value"     value={formatINR(totalStockValue)} icon={Package} color="sage" />
        <StatCard label="Sites covered"   value={bySite.length}          icon={Package} color="brand" />
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
                    {['Material', 'Brand', 'Category', 'Work type', 'Unit', 'Rate (₹)', 'Stock', 'Value (₹)'].map((h) => (
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
                        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', m.category === 'equipment' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600')}>
                          {m.category === 'equipment' ? 'Equipment' : 'Consumable'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        {m.work_type ? (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${WORK_TYPE_COLORS[m.work_type]}`}>
                            {WORK_LABEL[m.work_type] ?? m.work_type}
                          </span>
                        ) : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-gray-600">{m.unit}</td>
                      <td className="px-4 py-2.5 text-sm text-gray-600">
                        {m.unit_cost ? formatINR(m.unit_cost) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className={cn(
                        'px-4 py-2.5 text-sm font-semibold',
                        Number(m.quantity_available) <= 0 ? 'text-red-600' : 'text-gray-900',
                      )}>
                        {Number(m.quantity_available ?? 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-gray-900">
                        {m.unit_cost && Number(m.quantity_available) > 0
                          ? formatINR(Number(m.quantity_available) * Number(m.unit_cost))
                          : <span className="text-gray-300">—</span>}
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
