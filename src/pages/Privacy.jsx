import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import StoreyIcon from '@/components/brand/StoreyIcon'

export default function Privacy() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-10">

        <div className="mb-8 flex items-center gap-3">
          <StoreyIcon size={32} />
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Georgia, ui-serif, serif' }}>
              Privacy Policy
            </h1>
            <p className="text-xs text-gray-500">Storey — Construction Management · Last updated May 2026</p>
          </div>
        </div>

        <div className="card p-6 sm:p-8 space-y-6 text-sm text-gray-700 leading-relaxed">

          <section className="space-y-2">
            <h2 className="font-semibold text-gray-900 text-base">1. What we collect</h2>
            <p>We collect information you provide when you register: your name, email address, phone number, and company details. We also collect data you enter into the app — sites, workers, materials, attendance records, and related construction data.</p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-gray-900 text-base">2. How we use it</h2>
            <p>Your data is used solely to provide the Storey construction management service to you and your team. We do not sell, rent, or share your data with third parties for marketing purposes.</p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-gray-900 text-base">3. Data storage</h2>
            <p>All data is stored securely on Supabase (PostgreSQL) with row-level security policies ensuring strict tenant isolation — your company's data is never visible to other companies.</p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-gray-900 text-base">4. Google Sign-In</h2>
            <p>If you sign in with Google, we receive your name and email address from Google. We do not access your Google Drive, Gmail, contacts, or any other Google services. We only use the basic profile scope.</p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-gray-900 text-base">5. SMS & Phone</h2>
            <p>If you add a phone number, it is used only for SMS OTP login verification. We do not use your phone number for marketing or share it with third parties.</p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-gray-900 text-base">6. Cookies & Local storage</h2>
            <p>We use browser local storage to maintain your login session. We do not use advertising cookies or tracking pixels.</p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-gray-900 text-base">7. Data deletion</h2>
            <p>You may request deletion of your account and all associated data by contacting us at <a href="mailto:support@storeyinfra.com" className="text-brand-600 hover:underline">support@storeyinfra.com</a>. We will process deletion requests within 30 days.</p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-gray-900 text-base">8. Contact</h2>
            <p>For any privacy-related questions, write to us at <a href="mailto:support@storeyinfra.com" className="text-brand-600 hover:underline">support@storeyinfra.com</a>.</p>
          </section>

        </div>

        <button
          onClick={() => navigate(-1)}
          className="mt-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

      </div>
    </div>
  )
}
