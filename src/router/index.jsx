import { createHashRouter, Navigate } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import RoleGuard from '@/components/auth/RoleGuard'
import Landing from '@/pages/landing/Landing'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import AuthCallback from '@/pages/auth/AuthCallback'
import CreateCompany from '@/pages/auth/CreateCompany'
import Dashboard from '@/pages/dashboard/Dashboard'
import Sites from '@/pages/sites/Sites'
import SiteDetail from '@/pages/sites/SiteDetail'
import Workers from '@/pages/workers/Workers'
import Attendance from '@/pages/workers/Attendance'
import Materials from '@/pages/materials/Materials'
import Reports from '@/pages/reports/Reports'
import Settings from '@/pages/settings/Settings'
import NotFound from '@/pages/NotFound'
import Tenants from '@/pages/admin/Tenants'
import Team from '@/pages/team/Team'
import DailyLogs from '@/pages/logs/DailyLogs'
import Inventory from '@/pages/inventory/Inventory'
import MaterialReceipts from '@/pages/receipts/MaterialReceipts'
import MaterialTransfers from '@/pages/transfers/MaterialTransfers'
import EquipmentAssets from '@/pages/equipment/EquipmentAssets'
import MaterialLedger from '@/pages/inventory/MaterialLedger'

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
    // Onboarding: Google OAuth contractors who haven't created their company yet
    path: '/create-company',
    element: <CreateCompany />,
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

      // ── SuperAdmin ──────────────────────────────────────────────────────────
      {
        path: '/admin/tenants',
        element: (
          <RoleGuard roles={SUPERADMIN}>
            <Tenants />
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

      // ── Materials (role-scoped) ─────────────────────────────────────────────
      {
        path: '/materials',
        element: (
          <RoleGuard roles={STOREKEEPER_UP}>
            <Materials />
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

      // ── Inventory ───────────────────────────────────────────────────────────
      {
        path: '/inventory',
        element: (
          <RoleGuard roles={STOREKEEPER_UP}>
            <Inventory />
          </RoleGuard>
        ),
      },

      // ── Material Receipts (inward register) ──────────────────────────────────
      {
        path: '/receipts',
        element: (
          <RoleGuard roles={STOREKEEPER_UP}>
            <MaterialReceipts />
          </RoleGuard>
        ),
      },

      // ── Material Transfers (inter-site) ──────────────────────────────────────
      {
        path: '/transfers',
        element: (
          <RoleGuard roles={MANAGER_UP}>
            <MaterialTransfers />
          </RoleGuard>
        ),
      },

      // ── Equipment & Assets ────────────────────────────────────────────────────
      {
        path: '/equipment',
        element: (
          <RoleGuard roles={STOREKEEPER_UP}>
            <EquipmentAssets />
          </RoleGuard>
        ),
      },

      // ── Material Ledger (per-material transaction history) ────────────────────
      {
        path: '/inventory/:materialId/ledger',
        element: (
          <RoleGuard roles={STOREKEEPER_UP}>
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
