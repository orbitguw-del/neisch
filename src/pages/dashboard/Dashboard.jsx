import useAuthStore from '@/stores/authStore'
import SuperAdminDashboard  from './SuperAdminDashboard'
import ContractorDashboard  from './ContractorDashboard'
import SiteManagerDashboard from './SiteManagerDashboard'
import SupervisorDashboard  from './SupervisorDashboard'
import StoreKeeperDashboard from './StoreKeeperDashboard'

const DASHBOARDS = {
  superadmin:   SuperAdminDashboard,
  contractor:   ContractorDashboard,
  site_manager: SiteManagerDashboard,
  supervisor:   SupervisorDashboard,
  store_keeper: StoreKeeperDashboard,
}

export default function Dashboard() {
  const profile = useAuthStore((s) => s.profile)
  const loading = useAuthStore((s) => s.loading)
  const userId  = useAuthStore((s) => s.user?.id)
  const role = profile?.role
  const DashboardComponent = DASHBOARDS[role]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-sm text-gray-500">
        <p>No profile found for your account.</p>
        <p className="text-xs text-gray-400 font-mono">{userId}</p>
        <p className="text-xs text-gray-400">Contact your administrator or re-register.</p>
      </div>
    )
  }

  if (!DashboardComponent) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-gray-500">
        Unknown role: <span className="font-mono ml-1">{role}</span>
      </div>
    )
  }

  return <DashboardComponent />
}
