import { useEffect, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import useAuthStore from '@/stores/authStore'

export default function ProtectedRoute({ children }) {
  const { session, loading, init } = useAuthStore()
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      init()
    }
  }, [init])

  // Still bootstrapping — never redirect to login during this window
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

  return children
}
