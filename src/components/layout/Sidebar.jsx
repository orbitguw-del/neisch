import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  HardHat,
  Users,
  Package,
  BarChart3,
  Settings,
  Building2,
  ClipboardList,
  ClipboardCheck,
  ArrowRightLeft,
  Shield,
  UserCog,
  Warehouse,
  Wrench,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import useAuthStore from '@/stores/authStore'

const NAV_BY_ROLE = {
  superadmin: [
    { label: 'Dashboard',     to: '/dashboard',     icon: LayoutDashboard },
    { label: 'All Tenants',   to: '/admin/tenants', icon: Shield },
    { label: 'Settings',      to: '/settings',      icon: Settings },
  ],
  contractor: [
    { label: 'Dashboard',     to: '/dashboard',     icon: LayoutDashboard },
    { label: 'Sites',         to: '/sites',         icon: HardHat },
    { label: 'Inventory',     to: '/inventory',     icon: Warehouse },
    { label: 'Receipts',      to: '/receipts',      icon: ClipboardCheck },
    { label: 'Transfers',     to: '/transfers',     icon: ArrowRightLeft },
    { label: 'Equipment',     to: '/equipment',     icon: Wrench },
    { label: 'Reports',       to: '/reports',       icon: BarChart3 },
    { label: 'Team',          to: '/team',          icon: UserCog },
    { label: 'Settings',      to: '/settings',      icon: Settings },
  ],
  site_manager: [
    { label: 'Dashboard',     to: '/dashboard',     icon: LayoutDashboard },
    { label: 'My Sites',      to: '/sites',         icon: HardHat },
    { label: 'Workers',       to: '/workers',       icon: Users },
    { label: 'Inventory',     to: '/inventory',     icon: Warehouse },
    { label: 'Receipts',      to: '/receipts',      icon: ClipboardCheck },
    { label: 'Transfers',     to: '/transfers',     icon: ArrowRightLeft },
    { label: 'Equipment',     to: '/equipment',     icon: Wrench },
    { label: 'Daily Logs',    to: '/logs',          icon: ClipboardList },
    { label: 'Settings',      to: '/settings',      icon: Settings },
  ],
  supervisor: [
    { label: 'Dashboard',     to: '/dashboard',     icon: LayoutDashboard },
    { label: 'Daily Logs',    to: '/logs',          icon: ClipboardList },
    { label: 'Workers',       to: '/workers',       icon: Users },
    { label: 'Settings',      to: '/settings',      icon: Settings },
  ],
  store_keeper: [
    { label: 'Dashboard',     to: '/dashboard',     icon: LayoutDashboard },
    { label: 'Inventory',     to: '/inventory',     icon: Warehouse },
    { label: 'Receipts',      to: '/receipts',      icon: ClipboardCheck },
    { label: 'Equipment',     to: '/equipment',     icon: Wrench },
    { label: 'My Sites',      to: '/sites',         icon: HardHat },
    { label: 'Settings',      to: '/settings',      icon: Settings },
  ],
}

const ROLE_LABELS = {
  superadmin:   'Super Admin',
  contractor:   'Contractor',
  site_manager: 'Site Manager',
  supervisor:   'Supervisor',
  store_keeper: 'Store Keeper',
}

const ROLE_COLORS = {
  superadmin:   'bg-purple-50 text-purple-700 border-purple-200',
  contractor:   'bg-brand-50 text-brand-700 border-brand-200',
  site_manager: 'bg-earth-50 text-earth-700 border-earth-200',
  supervisor:   'bg-green-50 text-green-700 border-green-200',
  store_keeper: 'bg-yellow-50 text-yellow-700 border-yellow-200',
}

export default function Sidebar() {
  const profile = useAuthStore((s) => s.profile)
  const role = profile?.role ?? 'contractor'
  const tenantName = profile?.tenant?.name ?? 'ConsNE'
  const navItems = NAV_BY_ROLE[role] ?? NAV_BY_ROLE.contractor

  return (
    <aside className="flex w-60 flex-shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-gray-200 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-gray-900">ConsNE</p>
          <p className="truncate text-xs text-gray-500">
            {role === 'superadmin' ? 'Platform Admin' : tenantName}
          </p>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-4 pt-4">
        <span className={cn(
          'inline-flex w-full items-center justify-center rounded-lg border px-3 py-1.5 text-xs font-semibold',
          ROLE_COLORS[role] ?? ROLE_COLORS.contractor
        )}>
          {ROLE_LABELS[role] ?? role}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3 py-3">
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              )
            }
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <div className="rounded-lg bg-earth-50 px-3 py-2 text-xs text-earth-700">
          <span className="font-medium">Northeast India</span>
          <br />
          Construction Platform
        </div>
      </div>
    </aside>
  )
}
