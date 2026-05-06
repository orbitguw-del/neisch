import { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Users, Package, Calendar, MapPin, IndianRupee, ClipboardList } from 'lucide-react'
import useSiteStore from '@/stores/siteStore'
import useAuthStore from '@/stores/authStore'
import PageHeader from '@/components/ui/PageHeader'
import { formatDate, formatINR } from '@/lib/utils'

export default function SiteDetail() {
  const { siteId } = useParams()
  const navigate = useNavigate()
  const { activeSite, fetchSite } = useSiteStore()
  const role = useAuthStore((s) => s.profile?.role)
  const canManageWorkers    = ['superadmin', 'contractor', 'site_manager', 'supervisor'].includes(role)
  const canManageMaterials  = ['superadmin', 'contractor', 'site_manager', 'store_keeper'].includes(role)
  const canViewLogs         = ['superadmin', 'contractor', 'site_manager', 'supervisor'].includes(role)

  useEffect(() => {
    fetchSite(siteId)
  }, [siteId, fetchSite])

  if (!activeSite || activeSite.id !== siteId) {
    return <div className="text-sm text-gray-500">Loading site…</div>
  }

  const site = activeSite

  return (
    <div>
      <button
        onClick={() => navigate('/sites')}
        className="mb-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to sites
      </button>

      <PageHeader
        title={site.name}
        description={site.description}
        action={
          <div className="flex gap-2">
            {canManageWorkers && (
              <Link to={`/sites/${siteId}/workers`} className="btn-secondary">
                <Users className="h-4 w-4" /> Workers
              </Link>
            )}
            {canManageMaterials && (
              <Link to={`/sites/${siteId}/materials`} className="btn-secondary">
                <Package className="h-4 w-4" /> Materials
              </Link>
            )}
            {canViewLogs && (
              <Link to={`/logs/${siteId}`} className="btn-secondary">
                <ClipboardList className="h-4 w-4" /> Logs
              </Link>
            )}
          </div>
        }
      />

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: MapPin,        label: 'Location',   value: site.location || '—' },
          { icon: Calendar,      label: 'Start date',  value: formatDate(site.start_date) },
          { icon: Calendar,      label: 'End date',    value: formatDate(site.end_date) },
          { icon: IndianRupee,   label: 'Budget',      value: site.budget ? formatINR(site.budget) : '—' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="card p-4 flex items-start gap-3">
            <Icon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-sm font-semibold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {canManageWorkers && (
          <Link
            to={`/sites/${siteId}/workers`}
            className="card p-5 hover:shadow-md transition-shadow flex items-center gap-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage-100">
              <Users className="h-5 w-5 text-sage-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Workers</p>
              <p className="text-sm text-gray-500">Labour roster &amp; wages</p>
            </div>
          </Link>
        )}
        {canManageMaterials && (
          <Link
            to={`/sites/${siteId}/materials`}
            className="card p-5 hover:shadow-md transition-shadow flex items-center gap-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
              <Package className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Materials</p>
              <p className="text-sm text-gray-500">Inventory &amp; procurement</p>
            </div>
          </Link>
        )}
        {canViewLogs && (
          <Link
            to={`/logs/${siteId}`}
            className="card p-5 hover:shadow-md transition-shadow flex items-center gap-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
              <ClipboardList className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Daily Logs</p>
              <p className="text-sm text-gray-500">Progress &amp; site reports</p>
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}
