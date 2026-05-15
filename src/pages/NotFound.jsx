import { Link, useLocation } from 'react-router-dom'
import { HardHat } from 'lucide-react'
import useAuthStore from '@/stores/authStore'

export default function NotFound() {
  const location = useLocation()
  const session = useAuthStore((s) => s.session)
  const home = session ? '/dashboard' : '/login'
  const homeLabel = session ? 'Back to dashboard' : 'Go to sign in'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100">
            <HardHat className="h-8 w-8 text-brand-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900">404</h1>
        <p className="mt-2 text-gray-700">We couldn't find that page.</p>
        {location.pathname && location.pathname !== '/' && (
          <p className="mt-1 text-xs text-gray-400 font-mono break-all">
            {location.pathname}
          </p>
        )}
        <p className="mt-4 text-sm text-gray-500">
          The link may be old, mistyped, or the page has moved.
        </p>
        <Link to={home} className="btn-primary mt-6 inline-flex">
          {homeLabel}
        </Link>
      </div>
    </div>
  )
}
