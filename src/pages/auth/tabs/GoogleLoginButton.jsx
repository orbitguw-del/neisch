import { Chrome } from 'lucide-react'
import { supabase, authRedirectUrl } from '@/lib/supabase'
import { useState } from 'react'

const isNative = typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()

export default function GoogleLoginButton({ label = 'Continue with Google' }) {
  const [error, setError] = useState('')

  const handleGoogle = async () => {
    setError('')

    if (isNative) {
      // On native: get the OAuth URL without auto-redirecting the WebView,
      // then open it in Chrome Custom Tabs via @capacitor/browser.
      // The PKCE verifier stays in the WebView localStorage.
      // When Google redirects back to storeyapp://auth/callback?code=xxx,
      // capacitor.js appUrlOpen fires and AuthCallback exchanges the code.
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: authRedirectUrl, skipBrowserRedirect: true },
      })
      if (oauthError) { setError(oauthError.message); return }
      if (data?.url) {
        const { Browser } = await import('@capacitor/browser')
        await Browser.open({ url: data.url, windowName: '_self' })
      }
    } else {
      // On web: standard redirect
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: authRedirectUrl },
      })
      if (oauthError) setError(oauthError.message)
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleGoogle}
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
      >
        <Chrome className="h-4 w-4" />
        {label}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
