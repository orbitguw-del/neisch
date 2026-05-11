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
  const role    = useAuthStore((s) => s.profile?.role)
  const loading = useAuthStore((s) => s.loading)
  const signOut = useAuthStore((s) => s.signOut)
  const DashboardComponent = DASHBOARDS[role]

  // Still fetching profile — brief spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-7 w-7 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  // Profile loaded but role missing / unrecognised — data issue, not still loading
  if (!DashboardComponent) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <p className="text-sm text-gray-500">Your profile could not be loaded.</p>
        <button
          onClick={signOut}
          className="text-sm text-brand-600 hover:underline"
        >
          Sign out and try again
        </button>
      </div>
    )
  }

  return <DashboardComponent />
}
