import { createHashRouter, Navigate } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import RoleGuard from '@/components/auth/RoleGuard'
import Landing from '@/pages/landing/Landing'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import AuthCallback from '@/pages/auth/AuthCallback'
import CreateCompany from '@/pages/auth/CreateCompany'
import Privacy from '@/pages/Privacy'
import Terms from '@/pages/Terms'
import ResetPassword from '@/pages/auth/ResetPassword'
import Dashboard from '@/pages/dashboard/Dashboard'
import Sites from '@/pages/sites/Sites'
import SiteDetail from '@/pages/sites/SiteDetail'
import Workers from '@/pages/workers/Workers'
import Attendance from '@/pages/workers/Attendance'
import Materials from '@/pages/materials/Materials'
import Expenses from '@/pages/expenses/Expenses'
import Reports from '@/pages/reports/Reports'
import Settings from '@/pages/settings/Settings'
import Help from '@/pages/help/Help'
import NotFound from '@/pages/NotFound'
import Tenants from '@/pages/admin/Tenants'
import VendorRegistrations from '@/pages/admin/VendorRegistrations'
import Team from '@/pages/team/Team'
import DailyLogs from '@/pages/logs/DailyLogs'
import Inventory from '@/pages/inventory/Inventory'
import MaterialReceipts from '@/pages/receipts/MaterialReceipts'
import MaterialTransfers from '@/pages/transfers/MaterialTransfers'
import EquipmentAssets from '@/pages/equipment/EquipmentAssets'
import MaterialLedger from '@/pages/inventory/MaterialLedger'
import Tasks from '@/pages/tasks/Tasks'
import Subcontractors from '@/pages/subcontractors/Subcontractors'

const SUPERADMIN       = ['superadmin']
const CONTRACTOR_UP    = ['superadmin', 'contractor']
const MANAGER_UP       = ['superadmin', 'contractor', 'site_manager']
const SUPERVISOR_UP    = ['superadmin', 'contractor', 'site_manager', 'supervisor']
const STOREKEEPER_UP   = ['superadmin', 'contractor', 'site_manager', 'store_keeper']
const ALL_ROLES        = ['superadmin', 'contractor', 'site_manager', 'supervisor', 'store_keeper']

const router = createHashRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallback />,
  },
  {
    // Safety alias — some OAuth/deep-link paths resolve to /callback.
    // AuthCallback reads the code/token from the URL regardless of path.
    path: '/callback',
    element: <AuthCallback />,
  },
  {
    // Onboarding: Google OAuth contractors who haven't created their company yet
    path: '/create-company',
    element: <CreateCompany />,
  },
  {
    path: '/privacy',
    element: <Privacy />,
  },
  {
    path: '/terms',
    element: <Terms />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      // ── Universal ───────────────────────────────────────────────────────────
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/settings',  element: <Settings /> },
      { path: '/help',      element: <Help /> },

      // ── SuperAdmin ──────────────────────────────────────────────────────────
      {
        path: '/admin/tenants',
        element: (
          <RoleGuard roles={SUPERADMIN}>
            <Tenants />
          </RoleGuard>
        ),
      },
      {
        path: '/admin/vendors',
        element: (
          <RoleGuard roles={SUPERADMIN}>
            <VendorRegistrations />
          </RoleGuard>
        ),
      },

      // ── Contractor + above ──────────────────────────────────────────────────
      {
        path: '/reports',
        element: (
          <RoleGuard roles={CONTRACTOR_UP}>
            <Reports />
          </RoleGuard>
        ),
      },
      {
        path: '/team',
        element: (
          <RoleGuard roles={CONTRACTOR_UP}>
            <Team />
          </RoleGuard>
        ),
      },

      // ── Sites (contractor manages, site_manager/supervisor/storekeeper view) ─
      {
        path: '/sites',
        element: (
          <RoleGuard roles={ALL_ROLES}>
            <Sites />
          </RoleGuard>
        ),
      },
      {
        path: '/sites/:siteId',
        element: (
          <RoleGuard roles={ALL_ROLES}>
            <SiteDetail />
          </RoleGuard>
        ),
      },
      {
        path: '/sites/:siteId/workers',
        element: (
          <RoleGuard roles={SUPERVISOR_UP}>
            <Workers />
          </RoleGuard>
        ),
      },
      {
        path: '/sites/:siteId/materials',
        element: (
          <RoleGuard roles={STOREKEEPER_UP}>
            <Materials />
          </RoleGuard>
        ),
      },

      // ── Workers (role-scoped, no :siteId — picks from assignments) ──────────
      {
        path: '/workers',
        element: (
          <RoleGuard roles={SUPERVISOR_UP}>
            <Workers />
          </RoleGuard>
        ),
      },

      // ── Attendance ────────────────────────────────────────────────────────
      {
        path: '/attendance',
        element: (
          <RoleGuard roles={SUPERVISOR_UP}>
            <Attendance />
          </RoleGuard>
        ),
      },

      // ── Materials (role-scoped — all ops roles see materials at their sites) ─
      {
        path: '/materials',
        element: (
          <RoleGuard roles={ALL_ROLES}>
            <Materials />
          </RoleGuard>
        ),
      },

      // ── Site Expenses (supervisor and above) ────────────────────────────────
      {
        path: '/expenses',
        element: (
          <RoleGuard roles={SUPERVISOR_UP}>
            <Expenses />
          </RoleGuard>
        ),
      },

      // ── Tasks (work assignment — contractor / manager / supervisor) ─────────
      {
        path: '/tasks',
        element: (
          <RoleGuard roles={SUPERVISOR_UP}>
            <Tasks />
          </RoleGuard>
        ),
      },

      // ── Sub-contractors (directory: contractor; labour log: supervisor+) ────
      {
        path: '/subcontractors',
        element: (
          <RoleGuard roles={SUPERVISOR_UP}>
            <Subcontractors />
          </RoleGuard>
        ),
      },

      // ── Daily Logs ──────────────────────────────────────────────────────────
      {
        path: '/logs',
        element: (
          <RoleGuard roles={SUPERVISOR_UP}>
            <DailyLogs />
          </RoleGuard>
        ),
      },
      {
        path: '/logs/:siteId',
        element: (
          <RoleGuard roles={SUPERVISOR_UP}>
            <DailyLogs />
          </RoleGuard>
        ),
      },

      // ── Inventory (all ops roles — RLS scopes to their sites) ───────────────
      {
        path: '/inventory',
        element: (
          <RoleGuard roles={ALL_ROLES}>
            <Inventory />
          </RoleGuard>
        ),
      },

      // ── Material Receipts (inward register — all ops roles) ──────────────────
      {
        path: '/receipts',
        element: (
          <RoleGuard roles={ALL_ROLES}>
            <MaterialReceipts />
          </RoleGuard>
        ),
      },

      // ── Material Transfers (4-stage flow — every role has a step) ────────────
      // store_keeper/site_manager initiate · supervisor prepares dispatch ·
      // store_keeper/site_manager approve · supervisor/site_manager receive.
      {
        path: '/transfers',
        element: (
          <RoleGuard roles={ALL_ROLES}>
            <MaterialTransfers />
          </RoleGuard>
        ),
      },

      // ── Equipment & Assets (all ops roles see assets at their sites) ─────────
      {
        path: '/equipment',
        element: (
          <RoleGuard roles={ALL_ROLES}>
            <EquipmentAssets />
          </RoleGuard>
        ),
      },

      // ── Material Ledger (per-material transaction history) ────────────────────
      {
        path: '/inventory/:materialId/ledger',
        element: (
          <RoleGuard roles={ALL_ROLES}>
            <MaterialLedger />
          </RoleGuard>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
])

export default router
