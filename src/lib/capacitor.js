/**
 * Capacitor initialisation
 * Called once at app start (main.jsx).
 * All imports are dynamic so this file is safe to load on web
 * (Capacitor stubs resolve to no-ops when not running natively).
 */

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

      // e.g. "storeyapp://auth/callback?code=abc123"
      const parsed = new URL(url)
      // Build the hash-router path: /auth/callback?code=abc123
      const path = parsed.pathname + parsed.search + parsed.hash
      router.navigate(path, { replace: true })
    })

    // Handle the URL that launched the app (cold-start deep link)
    const launchResult = await App.getLaunchUrl()
    const launchUrl = launchResult?.url
    if (launchUrl) {
      try {
        const { Browser } = await import('@capacitor/browser')
        await Browser.close()
      } catch { /* ignore */ }
      const parsed = new URL(launchUrl)
      const path = parsed.pathname + parsed.search + parsed.hash
      router.navigate(path, { replace: true })
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
