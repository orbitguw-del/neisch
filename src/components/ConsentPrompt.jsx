import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, AlertCircle } from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import { supabase } from '@/lib/supabase'

// Bump these in lockstep with the values in Register.jsx and CLAUDE.md.
const TERMS_VERSION   = '2026-05-22'
const PRIVACY_VERSION = '2026-05-22'

/**
 * Grandfather-consent modal. Renders only for authenticated users whose
 * profile row has `consent_at = null` — these are testers / pilot users
 * who signed up BEFORE the in-app consent checkbox was wired (pre-
 * 2026-05-22 sign-ups).
 *
 * They cannot dismiss it without ticking the box + clicking Accept;
 * declining offers a sign-out path.
 *
 * Mount once in AppLayout (behind ProtectedRoute) — it self-suppresses
 * for everyone with a non-null `consent_at`.
 */
export default function ConsentPrompt() {
  const { profile, signOut } = useAuthStore()
  const [checked, setChecked] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [stampedLocally, setStampedLocally] = useState(false)

  // Guard: only show when profile is loaded AND consent_at is missing.
  // `stampedLocally` is the optimistic switch so the modal disappears
  // immediately after a successful update, without waiting for the
  // store to refetch the profile row.
  const needsConsent =
    !!profile?.id && !profile?.consent_at && !stampedLocally

  useEffect(() => {
    if (needsConsent) {
      // Lock background scroll while the modal is open.
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [needsConsent])

  if (!needsConsent) return null

  const handleAccept = async () => {
    if (!checked) return
    setSaving(true)
    setError(null)
    try {
      const { error: e } = await supabase
        .from('profiles')
        .update({
          consent_at:              new Date().toISOString(),
          consent_terms_version:   TERMS_VERSION,
          consent_privacy_version: PRIVACY_VERSION,
        })
        .eq('id', profile.id)
      if (e) throw e
      setStampedLocally(true)
    } catch (err) {
      setError(err.message || 'Could not save your consent. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Brand band */}
        <div className="bg-brand-600 px-6 py-4 flex items-center gap-3">
          <div className="rounded-full bg-white/20 p-2">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div className="text-white">
            <div className="font-semibold text-base">One quick thing</div>
            <div className="text-xs text-white/80">Updated Terms & Privacy Policy</div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4 text-sm text-gray-700 leading-relaxed">
          <p>
            We've published our{' '}
            <Link to="/terms" target="_blank" className="font-medium text-brand-600 hover:text-brand-700 underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" target="_blank" className="font-medium text-brand-600 hover:text-brand-700 underline">
              Privacy Policy
            </Link>
            . Because you signed up during beta, we'd like to record your
            acceptance now — it takes 10 seconds.
          </p>

          <p className="text-xs text-gray-500">
            Nothing changes about how Storey works for you. This is just so
            we have a clean record under India's DPDP Act 2023.
          </p>

          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-brand-600 focus:ring-brand-600"
            />
            <span className="text-xs">
              I am at least 18 and I agree to Storey's Terms of Service and
              Privacy Policy. I understand Storey is in beta.
            </span>
          </label>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
          <button
            type="button"
            onClick={signOut}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            I don't agree — sign me out
          </button>
          <button
            type="button"
            onClick={handleAccept}
            disabled={!checked || saving}
            className="btn-primary px-5 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Accept & continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
