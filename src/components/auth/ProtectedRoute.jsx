import { useEffect, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import useAuthStore from '@/stores/authStore'

export default function ProtectedRoute({ children }) {
  const { session, profile, loading, init } = useAuthStore()
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      init()
    }
  }, [init])

  // Still bootstrapping — never redirect during this window
  if (loading || !initialized.current) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
          <p className="text-sm text-gray-500">Loading Storey…</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  // Contractor who signed up via Google OAuth (or similar) but hasn't created
  // their company yet — tenant_id is null so all RLS policies fail.
  // Send them to the onboarding screen to set up their company first.
  if (profile && profile.role === 'contractor' && !profile.tenant_id) {
    return <Navigate to="/create-company" replace />
  }

  return children
}
