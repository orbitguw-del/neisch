import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import router from './router'
import './index.css'
import { initCapacitor } from './lib/capacitor'
import ErrorBoundary from './components/ErrorBoundary'
import { supabase } from './lib/supabase'

// Recover from stale chunk references after a redeploy.
// Vite fires `vite:preloadError` when a dynamic import 404s; one reload pulls the new build.
// sessionStorage gate prevents an infinite loop if the new build is also broken.
window.addEventListener('vite:preloadError', (event) => {
  if (sessionStorage.getItem('chunk-reload-attempted')) return
  sessionStorage.setItem('chunk-reload-attempted', '1')
  event.preventDefault()
  window.location.reload()
})

// ── OAuth callback interceptor ──────────────────────────────────────────────
// When Supabase redirects back after Google OAuth it goes to:
//   https://www.storeyinfra.com/auth/callback?code=xxx  (real path, no hash)
// Vercel rewrites this to index.html, but the hash router can't read the code
// because it's in window.location.search, not the hash fragment.
// We intercept it here — BEFORE React renders — exchange the code, then push
// the user into the hash router at /#/dashboard or /#/login.
if (
  typeof window !== 'undefined' &&
  window.location.pathname === '/auth/callback'
) {
  // ── Show a loading spinner so users don't see a blank white page ──────────
  const root = document.getElementById('root')
  if (root) {
    root.innerHTML = `
      <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#f9fafb;gap:12px">
        <div style="width:40px;height:40px;border:4px solid #d97706;border-top-color:transparent;border-radius:50%;animation:spin .8s linear infinite"></div>
        <p style="font-size:14px;color:#6b7280;font-family:system-ui,sans-serif;margin:0">Signing you in…</p>
      </div>
      <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
    `
  }

  const params = new URLSearchParams(window.location.search)
  const code   = params.get('code')
  const err    = params.get('error')

  // Also check hash fragment for access_token (magic-link / implicit flow)
  const rawHash    = window.location.hash
  const hashParams = new URLSearchParams(rawHash.startsWith('#') ? rawHash.slice(1) : rawHash)
  const accessToken  = hashParams.get('access_token')
  const refreshToken = hashParams.get('refresh_token')

  if (err) {
    window.location.replace(`/#/login?error=${encodeURIComponent(err)}`)
  } else if (code) {
    // PKCE flow (Google OAuth)
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
  } else if (accessToken) {
    // Magic-link / implicit flow — also used for password recovery
    const tokenType = hashParams.get('type') // 'recovery' | 'signup' | null
    supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken ?? '' })
      .then(({ data, error: sessErr }) => {
        if (sessErr || !data?.session) {
          console.error('[MagicLink] setSession failed:', sessErr?.message)
          window.location.replace('/#/login')
        } else if (tokenType === 'recovery') {
          // Password reset flow — send to reset page
          window.location.replace('/#/reset-password')
        } else {
          window.location.replace('/#/dashboard')
        }
      })
      .catch(() => window.location.replace('/#/login'))
  } else {
    // No code, no token, no error — check if a session already exists
    supabase.auth.getSession().then(({ data }) => {
      window.location.replace(data?.session ? '/#/dashboard' : '/#/login')
    }).catch(() => window.location.replace('/#/login'))
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
