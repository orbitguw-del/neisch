import { useState, useEffect } from 'react'
import { X, Share, Plus } from 'lucide-react'

const DISMISSED_KEY = 'storey_install_dismissed'
const DISMISS_DAYS  = 7

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isInStandaloneMode() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true
}

function isDismissed() {
  try {
    const ts = localStorage.getItem(DISMISSED_KEY)
    if (!ts) return false
    return Date.now() - Number(ts) < DISMISS_DAYS * 24 * 60 * 60 * 1000
  } catch { return false }
}

function dismiss() {
  try { localStorage.setItem(DISMISSED_KEY, String(Date.now())) } catch {}
}

export default function InstallBanner() {
  const [show,         setShow]         = useState(false)
  const [isIos,        setIsIos]        = useState(false)
  const [deferredEvt,  setDeferredEvt]  = useState(null)

  useEffect(() => {
    // Don't show if already installed or dismissed recently
    if (isInStandaloneMode() || isDismissed()) return

    const ios = isIOS()
    setIsIos(ios)

    if (ios) {
      // iOS Safari — show manual instruction after a short delay
      const t = setTimeout(() => setShow(true), 3000)
      return () => clearTimeout(t)
    }

    // Android / Chrome — intercept the native prompt
    const handler = (e) => {
      e.preventDefault()
      setDeferredEvt(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (deferredEvt) {
      deferredEvt.prompt()
      const { outcome } = await deferredEvt.userChoice
      if (outcome === 'accepted') { setShow(false); dismiss() }
    }
  }

  const handleDismiss = () => { setShow(false); dismiss() }

  if (!show) return null

  // ── iOS instruction ──────────────────────────────────────────────────────────
  if (isIos) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 rounded-2xl bg-white shadow-2xl border border-gray-100 p-4">
        <div className="flex items-start gap-3">
          <img src="/icons/icon-192.png" alt="Storey" className="h-12 w-12 rounded-xl shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900">Add Storey to Home Screen</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Tap <span className="inline-flex items-center gap-0.5 font-semibold text-brand-600"><Share className="h-3 w-3" /> Share</span> then <span className="font-semibold text-brand-600"><Plus className="h-3 w-3 inline" /> Add to Home Screen</span> for the best experience.
            </p>
          </div>
          <button onClick={handleDismiss} className="shrink-0 rounded-lg p-1 text-gray-400 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        {/* iOS bottom arrow indicator */}
        <div className="mt-3 flex justify-center">
          <div className="h-1 w-10 rounded-full bg-gray-200" />
        </div>
      </div>
    )
  }

  // ── Android / Chrome install prompt ──────────────────────────────────────────
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 rounded-2xl bg-white shadow-2xl border border-gray-100 p-4">
      <div className="flex items-center gap-3">
        <img src="/icons/icon-192.png" alt="Storey" className="h-12 w-12 rounded-xl shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900">Install Storey</p>
          <p className="text-xs text-gray-500 mt-0.5">Add to home screen for quick access</p>
        </div>
        <button onClick={handleDismiss} className="shrink-0 rounded-lg p-1 text-gray-400 hover:bg-gray-100">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={handleDismiss}
          className="flex-1 rounded-xl border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
          Not now
        </button>
        <button onClick={handleInstall}
          className="flex-1 rounded-xl bg-brand-600 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          Install
        </button>
      </div>
    </div>
  )
}
