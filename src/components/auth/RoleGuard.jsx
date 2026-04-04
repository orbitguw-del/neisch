import { Navigate } from 'react-router-dom'
import useAuthStore from '@/stores/authStore'

/**
 * Restricts access to a set of allowed roles.
 * If the user's role is not in `roles`, redirects to `redirectTo` (default: /dashboard).
 * While auth is still loading, renders null.
 */
export default function RoleGuard({ roles, children, redirectTo = '/dashboard' }) {
  const profile = useAuthStore((s) => s.profile)
  const loading = useAuthStore((s) => s.loading)

  if (loading) return null

  if (!profile || !roles.includes(profile.role)) {
    return <Navigate to={redirectTo} replace />
  }

  return children
}
