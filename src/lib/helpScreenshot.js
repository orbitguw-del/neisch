/**
 * helpScreenshot.js
 *
 * Captures the current screen and sends it via:
 *   1. Web Share API (Android/iOS) → native share sheet → user picks WhatsApp / Email
 *   2. Desktop → opens WhatsApp Web IMMEDIATELY (sync, no popup block)
 *              → then downloads the screenshot so the user can attach it manually
 *   3. Fallback → downloads screenshot + opens mailto:
 *
 * KEY FIX: On desktop, window.open() must fire synchronously inside the
 * original click handler — BEFORE any await — otherwise browsers block
 * it as an unsolicited popup. We achieve this by opening a blank window
 * early and setting its location after the async capture.
 */

const KARUN_WHATSAPP = '917002500154'
const SUPPORT_EMAIL  = 'help@storeyinfra.com'

/**
 * Main entry point — called when Help button is tapped.
 * @param {string} screenName  e.g. "Inventory", "Expenses", "Reports"
 * @param {string} [note]      optional extra context from user
 * @param {Window|null} [preOpenedWindow]  window opened synchronously by caller (desktop only)
 * @returns {Promise<'shared'|'downloaded'|'error'>}
 */
export async function sendHelpScreenshot(screenName = 'App', note = '', preOpenedWindow = null) {
  const message  = buildMessage(screenName, note)
  const filename = `storey-help-${screenName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`

  let blob = null

  try {
    blob = await captureScreen()
  } catch (err) {
    console.warn('Screenshot capture failed:', err)
    // If we already opened a window on desktop, send it to WhatsApp text
    if (preOpenedWindow && !preOpenedWindow.closed) {
      preOpenedWindow.location.href = whatsAppUrl(message)
    } else {
      openWhatsAppText(message)
    }
    return 'error'
  }

  const file = new File([blob], filename, { type: 'image/png' })

  // ── Path 1: Web Share API with file (Android + iOS Safari 15+) ──────────
  if (canShareFiles()) {
    try {
      await navigator.share({
        title: 'Storey Help Request',
        text:  message,
        files: [file],
      })
      return 'shared'
    } catch (err) {
      if (err.name === 'AbortError') return 'error'
      // Share failed — fall through to desktop path
    }
  }

  // ── Path 2: Desktop — download image + navigate pre-opened WhatsApp window ─
  downloadBlob(blob, filename)

  if (preOpenedWindow && !preOpenedWindow.closed) {
    // Window was already opened synchronously — just send it to WhatsApp now
    preOpenedWindow.location.href = whatsAppUrl(
      message + '\n\n_(screenshot saved to your Downloads folder)_'
    )
  } else {
    // Fallback: open WhatsApp (may be blocked on some browsers — but we tried)
    openWhatsAppText(message, true)
  }

  return 'downloaded'
}

/**
 * Fallback: email only (no screenshot — for email clients that can't attach)
 */
export function sendHelpEmail(screenName = 'App', note = '') {
  const subject = encodeURIComponent(`Storey Help — ${screenName}`)
  const body    = encodeURIComponent(
    `Hi Karun,\n\nI need help with the ${screenName} screen in Storey.\n\n` +
    (note ? `Details: ${note}\n\n` : '') +
    `Please see the attached screenshot.\n\nThanks`
  )
  window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`
}

/**
 * Open a blank window synchronously — must be called inside a click handler
 * (no awaits before it). Returns the window reference so we can navigate it
 * later after the async screenshot is ready.
 * Returns null on mobile / when Web Share API is available (not needed there).
 */
export function openWhatsAppWindowEarly() {
  if (canShareFiles()) return null      // Mobile: Web Share API will handle it
  if (isMobile())      return null      // Mobile without Share API — use whatsapp:// deep link directly
  return window.open('about:blank', '_blank', 'noopener,noreferrer')
}

// ── Internals ──────────────────────────────────────────────────────────────

async function captureScreen() {
  const html2canvas = (await import('html2canvas')).default

  // Hide the help button itself so it doesn't appear in the screenshot
  const helpBtn = document.getElementById('help-button-root')
  if (helpBtn) helpBtn.style.visibility = 'hidden'

  try {
    const canvas = await html2canvas(document.body, {
      useCORS:        true,
      allowTaint:     true,
      scale:          1,            // 1× = smaller file, faster
      logging:        false,
      ignoreElements: (el) =>
        el.id === 'help-button-root' ||
        el.classList?.contains('no-screenshot'),
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

function canShareFiles() {
  try {
    return (
      typeof navigator.share === 'function' &&
      typeof navigator.canShare === 'function' &&
      navigator.canShare({ files: [new File([''], 'test.png', { type: 'image/png' })] })
    )
  } catch {
    return false
  }
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

function openWhatsAppText(message, withAttachNote = false) {
  const text = message + (withAttachNote ? '\n\n_(screenshot saved to your Downloads folder)_' : '')
  window.open(whatsAppUrl(text), '_blank', 'noopener,noreferrer')
}
