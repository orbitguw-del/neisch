/**
 * helpScreenshot.js
 *
 * Captures the current screen and sends it via:
 *   1. Web Share API (Android/iOS) → native share sheet → user picks WhatsApp / Email
 *   2. Desktop with WhatsApp available → downloads screenshot + opens WhatsApp Web
 *   3. Fallback → downloads screenshot + opens mailto:
 */

const KARUN_WHATSAPP = '919615888555' // ← replace with real number (no + or spaces)
const SUPPORT_EMAIL  = 'help@storeyinfra.com'

/**
 * Main entry point — called when Help button is tapped.
 * @param {string} screenName  e.g. "Inventory", "Expenses", "Reports"
 * @param {string} [note]      optional extra context from user
 * @returns {Promise<'shared'|'downloaded'|'error'>}
 */
export async function sendHelpScreenshot(screenName = 'App', note = '') {
  let blob = null

  try {
    blob = await captureScreen()
  } catch (err) {
    console.warn('Screenshot capture failed:', err)
    // Still open WhatsApp/email — just without the image
    openWhatsAppText(screenName, note)
    return 'error'
  }

  const filename = `storey-help-${screenName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`
  const file = new File([blob], filename, { type: 'image/png' })

  const message = buildMessage(screenName, note)

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
      // User cancelled or share failed — fall through
      if (err.name === 'AbortError') return 'error'
    }
  }

  // ── Path 2: Desktop — download image + open WhatsApp Web ────────────────
  downloadBlob(blob, filename)
  openWhatsAppText(screenName, note, /* withAttachNote */ true)
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
  return (
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [new File([''], 'test.png', { type: 'image/png' })] })
  )
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a   = Object.assign(document.createElement('a'), { href: url, download: filename })
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

function buildMessage(screenName, note) {
  return [
    `Hi Karun, I need help with the *${screenName}* screen in Storey.`,
    note ? `\nDetails: ${note}` : '',
    `\nSee screenshot attached.`,
  ].filter(Boolean).join('')
}

function openWhatsAppText(screenName, note, withAttachNote = false) {
  const text = buildMessage(screenName, note) +
    (withAttachNote ? '\n\n_(screenshot saved to your Downloads folder)_' : '')
  const url = /Android|iPhone|iPad/i.test(navigator.userAgent)
    ? `whatsapp://send?phone=${KARUN_WHATSAPP}&text=${encodeURIComponent(text)}`
    : `https://wa.me/${KARUN_WHATSAPP}?text=${encodeURIComponent(text)}`
  window.open(url, '_blank', 'noopener,noreferrer')
}
