/**
 * Capacitor initialisation
 * Called once at app start (main.jsx).
 * All imports are dynamic so this file is safe to load on web
 * (Capacitor stubs resolve to no-ops when not running natively).
 */

/**
 * Convert a deep-link / launch URL into the in-app router path.
 *
 * Custom-scheme URLs are the tricky case: `new URL('storeyapp://auth/callback')`
 * parses `auth` as the HOST and `/callback` as the pathname. If we used
 * pathname alone we'd navigate to `/callback` — which has no route → 404.
 * So for non-http(s) schemes we prepend the host segment back.
 *
 *   storeyapp://auth/callback?code=x   → /auth/callback?code=x
 *   https://storeyinfra.com/auth/callback?code=x → /auth/callback?code=x
 */
function deepLinkToPath(url) {
  const parsed = new URL(url)
  if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
    return parsed.pathname + parsed.search + parsed.hash
  }
  // Custom scheme — host holds the first path segment.
  return '/' + parsed.host + parsed.pathname + parsed.search + parsed.hash
}

export async function initCapacitor(router) {
  // Detect whether we're running inside a Capacitor native shell
  const isNative = typeof window !== 'undefined' &&
    window.Capacitor?.isNativePlatform?.()

  if (!isNative) return   // nothing to do on web

  // ── Status bar ──────────────────────────────────────────────────────────────
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    await StatusBar.setStyle({ style: Style.Dark })
    await StatusBar.setBackgroundColor({ color: '#FAF7F2' })
  } catch {}

  // ── Splash screen ──────────────────────────────────────────────────────────
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen')
    await SplashScreen.hide()
  } catch {}

  // ── Deep-link handler (for Google OAuth / magic-link callbacks) ────────────
  // When the user signs in with Google (or follows a magic link / password reset
  // email), Supabase redirects to:
  //   storeyapp://auth/callback?code=XXXX    (PKCE flow)
  //   storeyapp://auth/callback#access_token=... (implicit / magic-link)
  // Capacitor catches this URL and fires appUrlOpen.
  // We close any open @capacitor/browser window first, then push the path into
  // React Router so AuthCallback / ResetPassword can handle it.
  try {
    const { App } = await import('@capacitor/app')

    App.addListener('appUrlOpen', async ({ url }) => {
      // Close the in-app browser that was opened for OAuth / magic-link
      try {
        const { Browser } = await import('@capacitor/browser')
        await Browser.close()
      } catch { /* Browser may not be open — ignore */ }

      // e.g. "storeyapp://auth/callback?code=abc123" → "/auth/callback?code=abc123"
      router.navigate(deepLinkToPath(url), { replace: true })
    })

    // Handle the URL that launched the app (cold-start deep link)
    const launchResult = await App.getLaunchUrl()
    const launchUrl = launchResult?.url
    if (launchUrl) {
      try {
        const { Browser } = await import('@capacitor/browser')
        await Browser.close()
      } catch { /* ignore */ }
      router.navigate(deepLinkToPath(launchUrl), { replace: true })
    }
  } catch {}

  // ── Back-button handler ─────────────────────────────────────────────────────
  // On Android the hardware back button should navigate back in-app,
  // and only exit the app if there's nothing left in the history stack.
  try {
    const { App } = await import('@capacitor/app')

    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        router.navigate(-1)
      } else {
        App.exitApp()
      }
    })
  } catch {}
}
