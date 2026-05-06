import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  HardHat,
  Users,
  BarChart3,
  Settings,
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
import StoreyLogo from '@/components/brand/StoreyLogo'

const NAV_BY_ROLE = {
  superadmin: [
    { label: 'Dashboard',  to: '/dashboard',     icon: LayoutDashboard },
    { label: 'All Tenants', to: '/admin/tenants', icon: Shield },
    { label: 'Settings',   to: '/settings',      icon: Settings },
  ],
  contractor: [
    { label: 'Dashboard',  to: '/dashboard',  icon: LayoutDashboard },
    { label: 'Sites',      to: '/sites',      icon: HardHat },
    { label: 'Inventory',  to: '/inventory',  icon: Warehouse },
    { label: 'Receipts',   to: '/receipts',   icon: ClipboardCheck },
    { label: 'Transfers',  to: '/transfers',  icon: ArrowRightLeft },
    { label: 'Equipment',  to: '/equipment',  icon: Wrench },
    { label: 'Reports',    to: '/reports',    icon: BarChart3 },
    { label: 'Team',       to: '/team',       icon: UserCog },
    { label: 'Settings',   to: '/settings',   icon: Settings },
  ],
  site_manager: [
    { label: 'Dashboard',  to: '/dashboard',  icon: LayoutDashboard },
    { label: 'My Sites',   to: '/sites',      icon: HardHat },
    { label: 'Workers',    to: '/workers',    icon: Users },
    { label: 'Inventory',  to: '/inventory',  icon: Warehouse },
    { label: 'Receipts',   to: '/receipts',   icon: ClipboardCheck },
    { label: 'Transfers',  to: '/transfers',  icon: ArrowRightLeft },
    { label: 'Equipment',  to: '/equipment',  icon: Wrench },
    { label: 'Daily Logs', to: '/logs',       icon: ClipboardList },
    { label: 'Settings',   to: '/settings',   icon: Settings },
  ],
  supervisor: [
    { label: 'Dashboard',  to: '/dashboard',  icon: LayoutDashboard },
    { label: 'Daily Logs', to: '/logs',       icon: ClipboardList },
    { label: 'Workers',    to: '/workers',    icon: Users },
    { label: 'Settings',   to: '/settings',   icon: Settings },
  ],
  store_keeper: [
    { label: 'Dashboard',  to: '/dashboard',  icon: LayoutDashboard },
    { label: 'Inventory',  to: '/inventory',  icon: Warehouse },
    { label: 'Receipts',   to: '/receipts',   icon: ClipboardCheck },
    { label: 'Equipment',  to: '/equipment',  icon: Wrench },
    { label: 'My Sites',   to: '/sites',      icon: HardHat },
    { label: 'Settings',   to: '/settings',   icon: Settings },
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
  site_manager: 'bg-sage-100 text-sage-700 border-sage-200',
  supervisor:   'bg-green-50 text-green-700 border-green-200',
  store_keeper: 'bg-sand-300 text-charcoal-700 border-sand-400',
}

export default function Sidebar({ open = false, onClose = () => {} }) {
  const profile = useAuthStore((s) => s.profile)
  const role = profile?.role ?? 'contractor'
  const tenantName = profile?.tenant?.name ?? 'Storey'
  const navItems = NAV_BY_ROLE[role] ?? NAV_BY_ROLE.contractor

  return (
    <aside className={cn(
      'flex w-60 flex-shrink-0 flex-col border-r border-gray-200 bg-white',
      'fixed inset-y-0 left-0 z-30 transition-transform duration-300 ease-in-out',
      'lg:static lg:z-auto lg:translate-x-0',
      open ? 'translate-x-0' : '-translate-x-full',
    )}>
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-gray-200 px-4">
        <div className="flex flex-col min-w-0">
          <StoreyLogo size="sm" />
          <p className="truncate text-xs text-gray-400 mt-0.5 pl-0.5">
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
            onClick={onClose}
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
        <div className="rounded-lg bg-sand-200 px-3 py-2 text-xs text-charcoal-600">
          <span className="font-display font-semibold">Construction, organised.</span>
        </div>
      </div>
    </aside>
  )
}
