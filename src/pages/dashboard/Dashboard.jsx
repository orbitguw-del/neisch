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
  const role = useAuthStore((s) => s.profile?.role)
  const DashboardComponent = DASHBOARDS[role]

  if (!DashboardComponent) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-gray-500">
        Loading dashboard…
      </div>
    )
  }

  return <DashboardComponent />
}
