import { Link } from 'react-router-dom'
import { Building2 } from 'lucide-react'

export default function AdminSignupTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
        <p className="font-medium mb-1">🏗️ New contractor account?</p>
        <p>Register your company to get started. You'll be able to manage sites, invite team members, and track materials.</p>
      </div>

      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="rounded-full bg-brand-100 p-4">
            <Building2 className="h-8 w-8 text-brand-600" />
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-600">
            Admin accounts are created through the company registration flow.
          </p>
        </div>
        <Link to="/register" className="btn-primary w-full inline-block text-center">
          Register your company →
        </Link>
      </div>
    </div>
  )
}
