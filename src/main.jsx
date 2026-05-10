import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import router from './router'
import './index.css'
import { initCapacitor } from './lib/capacitor'
import ErrorBoundary from './components/ErrorBoundary'
import { supabase } from './lib/supabase'

// ── OAuth callback interceptor ──────────────────────────────────────────────
// When Supabase redirects back after Google OAuth it goes to:
//   https://storeyinfra.com/auth/callback?code=xxx   (real path, no hash)
// Vercel rewrites this to index.html, but the hash router can't read the code
// because it's in window.location.search, not the hash fragment.
// We intercept it here — BEFORE React renders — exchange the code, then push
// the user into the hash router at /#/dashboard or /#/login.
if (
  typeof window !== 'undefined' &&
  window.location.pathname === '/auth/callback'
) {
  const params = new URLSearchParams(window.location.search)
  const code   = params.get('code')
  const err    = params.get('error')

  if (err) {
    window.location.replace(`/#/login?error=${encodeURIComponent(err)}`)
  } else if (code) {
    supabase.auth.exchangeCodeForSession(code)
      .then(({ data, error: exchErr }) => {
        if (exchErr || !data?.session) {
          console.error('[OAuth] exchange failed:', exchErr?.message)
          window.location.replace('/#/login')
        } else {
          window.location.replace('/#/dashboard')
        }
      })
      .catch(() => window.location.replace('/#/login'))
  } else {
    // No code, no error — just go to login
    window.location.replace('/#/login')
  }
} else {
  // Normal app startup
  initCapacitor(router)

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </React.StrictMode>,
  )
}
