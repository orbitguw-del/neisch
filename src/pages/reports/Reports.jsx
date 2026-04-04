import { useEffect } from 'react'
import { BarChart3, HardHat, Users, Package } from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import useSiteStore from '@/stores/siteStore'
import PageHeader from '@/components/ui/PageHeader'
import StatCard from '@/components/ui/StatCard'
import { formatINR, formatDate } from '@/lib/utils'

export default function Reports() {
  const profile = useAuthStore((s) => s.profile)
  const { sites, fetchSites } = useSiteStore()
  const tenantId = profile?.tenant_id

  useEffect(() => {
    if (tenantId) fetchSites(tenantId)
  }, [tenantId, fetchSites])

  const totalBudget = sites.reduce((sum, s) => sum + (Number(s.budget) || 0), 0)
  const byStatus = sites.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1
    return acc
  }, {})

  return (
    <div>
      <PageHeader
        title="Reports"
        description="High-level summary across all your construction sites."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Sites"     value={sites.length}          icon={HardHat}   color="brand" />
        <StatCard label="Active"          value={byStatus.active ?? 0}  icon={BarChart3}  color="green" />
        <StatCard label="Completed"       value={byStatus.completed ?? 0} icon={BarChart3} color="earth" />
        <StatCard label="Total Budget"    value={formatINR(totalBudget)} icon={Package}   color="red"   />
      </div>

      {/* Site breakdown table */}
      <div className="card overflow-hidden">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">Site Budget Breakdown</h2>
        </div>
        {sites.length === 0 ? (
          <p className="px-5 py-8 text-sm text-gray-500">No sites to report on yet.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Site', 'Location', 'Status', 'Start date', 'Budget'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {sites.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{s.location || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={
                      s.status === 'active' ? 'badge-green' :
                      s.status === 'completed' ? 'badge-blue' :
                      s.status === 'planning' ? 'badge-yellow' : 'badge-gray'
                    }>{s.status?.replace('_', ' ')}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(s.start_date)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.budget ? formatINR(s.budget) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
