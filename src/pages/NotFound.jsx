import { Link } from 'react-router-dom'
import { HardHat } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100">
            <HardHat className="h-8 w-8 text-brand-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900">404</h1>
        <p className="mt-2 text-gray-500">Page not found</p>
        <Link to="/dashboard" className="btn-primary mt-6 inline-flex">
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
