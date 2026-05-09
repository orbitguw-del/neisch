import { createClient } from '@supabase/supabase-js'

const supabaseUrl    = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
}

// On native Android the app uses the storeyapp:// deep-link scheme.
// On web it uses the normal https:// origin.
const isNative = typeof window !== 'undefined' &&
  window.Capacitor?.isNativePlatform?.()

const authRedirectUrl = isNative
  ? 'storeyapp://auth/callback'
  : `${window.location.origin}/#/auth/callback`

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Capacitor's WebView uses localStorage (available in WebView) — this is fine.
    // If you later add @capacitor/preferences you can swap storage here.
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    flowType: 'pkce',    // PKCE is required for mobile (no implicit flow)
  },
  global: {
    headers: {
      'x-app-platform': isNative ? 'android' : 'web',
    },
  },
})

// Export redirect URL so Google OAuth and magic-link callers can use it
export { authRedirectUrl }
