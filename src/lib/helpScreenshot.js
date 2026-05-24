/**
 * helpScreenshot.js
 *
 * Captures the current screen and sends it via:
 *   1. Web Share API (Android/iOS) → native share sheet → screenshot attached
 *   2. Desktop (Chrome/Edge) → copies screenshot to clipboard + opens WhatsApp Web
 *                              → user presses Ctrl+V to paste image directly in chat
 *   3. Fallback (clipboard unavailable) → downloads file + opens WhatsApp Web
 *
 * KEY: window.open() fires synchronously BEFORE any await to avoid popup blocking.
 */

const KARUN_WHATSAPP = '917002500154'
const SUPPORT_EMAIL  = 'help@storeyinfra.com'

/**
 * Main entry point.
 * @param {string} screenName
 * @param {string} [note]
 * @param {Window|null} [preOpenedWindow]  blank window opened synchronously by caller
 * @returns {Promise<'shared'|'clipboard'|'downloaded'|'error'>}
 */
export async function sendHelpScreenshot(screenName = 'App', note = '', preOpenedWindow = null) {
  const message  = buildMessage(screenName, note)
  const filename = `storey-help-${screenName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`

  let blob = null
  try {
    blob = await captureScreen()
  } catch (err) {
    console.warn('Screenshot capture failed:', err)
    navigateWindow(preOpenedWindow, whatsAppUrl(message))
    return 'error'
  }

  // ── Path 1: Web Share API — Android / iOS ────────────────────────────────
  if (canShareFiles()) {
    const file = new File([blob], filename, { type: 'image/png' })
    try {
      await navigator.share({ title: 'Storey Help Request', text: message, files: [file] })
      return 'shared'
    } catch (err) {
      if (err.name === 'AbortError') return 'error'
      // Share failed — fall through
    }
  }

  // ── Path 2: Desktop — copy to clipboard + open WhatsApp Web ─────────────
  // WhatsApp Web supports Ctrl+V image paste natively.
  const copied = await copyToClipboard(blob)

  const waText = copied
    ? message + '\n\n_(screenshot copied — paste with Ctrl+V)_'
    : message + '\n\n_(screenshot saved to Downloads — attach manually)_'

  if (copied) {
    // Clipboard succeeded — no download needed
    navigateWindow(preOpenedWindow, whatsAppUrl(waText))
    return 'clipboard'
  }

  // ── Path 3: Clipboard failed — fall back to file download ───────────────
  downloadBlob(blob, filename)
  navigateWindow(preOpenedWindow, whatsAppUrl(waText))
  return 'downloaded'
}

/**
 * Open a blank window synchronously inside the click handler (before any await).
 * Returns null on mobile — Web Share API or whatsapp:// handles it natively.
 */
export function openWhatsAppWindowEarly() {
  if (canShareFiles()) return null
  if (isMobile())      return null
  return window.open('about:blank', '_blank', 'noopener,noreferrer')
}

export function sendHelpEmail(screenName = 'App', note = '') {
  const subject = encodeURIComponent(`Storey Help — ${screenName}`)
  const body    = encodeURIComponent(
    `Hi Karun,\n\nI need help with the ${screenName} screen in Storey.\n\n` +
    (note ? `Details: ${note}\n\n` : '') +
    `Please see the attached screenshot.\n\nThanks`
  )
  window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`
}

// ── Internals ──────────────────────────────────────────────────────────────

async function captureScreen() {
  const html2canvas = (await import('html2canvas')).default
  const helpBtn = document.getElementById('help-button-root')
  if (helpBtn) helpBtn.style.visibility = 'hidden'
  try {
    const canvas = await html2canvas(document.body, {
      useCORS:        true,
      allowTaint:     true,
      scale:          1,
      logging:        false,
      ignoreElements: (el) =>
        el.id === 'help-button-root' || el.classList?.contains('no-screenshot'),
    })
    return await canvasToBlob(canvas)
  } finally {
    if (helpBtn) helpBtn.style.visibility = 'visible'
  }
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/png', 0.85)
  })
}

/**
 * Copy image blob to system clipboard.
 * Works in Chrome 76+, Edge 79+. Returns true if successful.
 */
async function copyToClipboard(blob) {
  try {
    if (!navigator.clipboard?.write) return false
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ])
    return true
  } catch (err) {
    console.warn('Clipboard write failed:', err)
    return false
  }
}

function navigateWindow(win, url) {
  if (win && !win.closed) {
    win.location.href = url
  } else {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

function canShareFiles() {
  try {
    return (
      typeof navigator.share === 'function' &&
      typeof navigator.canShare === 'function' &&
      navigator.canShare({ files: [new File([''], 'test.png', { type: 'image/png' })] })
    )
  } catch { return false }
}

function isMobile() {
  return /Android|iPhone|iPad/i.test(navigator.userAgent)
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a   = Object.assign(document.createElement('a'), { href: url, download: filename })
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

function whatsAppUrl(text) {
  return isMobile()
    ? `whatsapp://send?phone=${KARUN_WHATSAPP}&text=${encodeURIComponent(text)}`
    : `https://wa.me/${KARUN_WHATSAPP}?text=${encodeURIComponent(text)}`
}

function buildMessage(screenName, note) {
  return [
    `Hi Karun, I need help with the *${screenName}* screen in Storey.`,
    note ? `\nDetails: ${note}` : '',
    `\nSee screenshot attached.`,
  ].filter(Boolean).join('')
}
