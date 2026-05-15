import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, AlertTriangle, Warehouse, HardHat } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import useAuthStore from '@/stores/authStore'
import useSiteStore from '@/stores/siteStore'
import StatCard from '@/components/ui/StatCard'
import PageHeader from '@/components/ui/PageHeader'
import { formatINR } from '@/lib/utils'

export default function StoreKeeperDashboard() {
  const navigate  = useNavigate()
  const profile   = useAuthStore((s) => s.profile)
  const { sites, fetchSites } = useSiteStore()
  const [materials,  setMaterials]  = useState([])
  const [matLoading, setMatLoading] = useState(true)
  const [error,      setError]      = useState(null)

  const tenantId = profile?.tenant_id

  useEffect(() => {
    if (tenantId) fetchSites(tenantId)
  }, [tenantId, fetchSites])

  useEffect(() => {
    if (!tenantId) return
    async function loadMaterials() {
      setMatLoading(true)
      setError(null)
      try {
        // RLS restricts to assigned sites automatically
        const { data, error } = await supabase.from('materials').select('*').order('name')
        if (error) throw error
        const matList = data ?? []
        const siteIds = [...new Set(matList.map(m => m.site_id).filter(Boolean))]
        let siteMap = {}
        if (siteIds.length) {
          const { data: sitesData } = await supabase.from('sites').select('id, name').in('id', siteIds)
          siteMap = Object.fromEntries((sitesData ?? []).map(s => [s.id, s]))
        }
        setMaterials(matList.map(m => ({ ...m, site: siteMap[m.site_id] ?? null })))
      } catch (err) {
        setError(err.message)
      } finally {
        setMatLoading(false)
      }
    }
    loadMaterials()
  }, [tenantId])

  const isLow = (m) =>
    m.quantity_minimum != null &&
    m.quantity_available != null &&
    Number(m.quantity_available) <= Number(m.quantity_minimum)

  const lowStockItems = materials.filter(isLow)
  const totalItems    = materials.length
  const totalValue    = materials.reduce(
    (sum, m) => sum + (Number(m.unit_cost) || 0) * (Number(m.quantity_available) || 0),
    0
  )

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'

  return (
    <div>
      <PageHeader
        title={`Hello, ${firstName}`}
        description="Inventory overview for your assigned sites."
        action={
          <button onClick={() => navigate('/inventory')} className="btn-primary">
            <Warehouse className="h-4 w-4" /> Manage Inventory
          </button>
        }
      />

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Assigned Sites"  value={sites.length}      icon={HardHat}       color="brand" />
        <StatCard label="Material Items"  value={totalItems}        icon={Package}       color="sage" />
        <StatCard label="Low Stock Alerts" value={lowStockItems.length} icon={AlertTriangle} color="red" />
        <StatCard
          label="Inventory Value"
          value={totalValue > 0 ? formatINR(totalValue) : '—'}
          icon={Warehouse}
          color="green"
        />
      </div>

      {/* Low stock alerts */}
      {lowStockItems.length > 0 && (
        <div className="card overflow-hidden mb-4">
          <div className="flex items-center gap-2 border-b border-red-100 bg-red-50 px-5 py-3">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <h2 className="text-sm font-semibold text-red-700">
              {lowStockItems.length} Low Stock Alert{lowStockItems.length > 1 ? 's' : ''}
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {lowStockItems.map((m) => (
              <div key={m.id} className="flex items-center justify-between px-5 py-3 bg-red-50/40">
                <div>
                  <p className="text-sm font-medium text-gray-900">{m.name}</p>
                  <p className="text-xs text-gray-500">{m.site?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-red-600">
                    {m.quantity_available} {m.unit} left
                  </p>
                  <p className="text-xs text-gray-500">reorder at {m.quantity_minimum} {m.unit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All materials table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">Inventory Summary</h2>
          <button onClick={() => navigate('/inventory')} className="text-xs font-medium text-brand-600 hover:text-brand-700">
            Manage →
          </button>
        </div>
        {matLoading ? (
          <p className="px-5 py-8 text-sm text-gray-500">Loading inventory…</p>
        ) : materials.length === 0 ? (
          <p className="px-5 py-8 text-sm text-gray-500">No materials tracked yet.</p>
        ) : (
          <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Material', 'Site', 'Available', 'Unit', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {materials.slice(0, 10).map((m) => (
                <tr key={m.id} className={isLow(m) ? 'bg-red-50' : 'hover:bg-gray-50'}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-1.5">
                      {isLow(m) && <AlertTriangle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />}
                      {m.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-[140px] truncate">{m.site?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{m.quantity_available ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{m.unit}</td>
                  <td className="px-4 py-3">
                    {isLow(m)
                      ? <span className="badge-red">Low stock</span>
                      : <span className="badge-green">OK</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </div>
  )
}
