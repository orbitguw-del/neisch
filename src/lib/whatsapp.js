/**
 * Open WhatsApp with a pre-filled message.
 * On Android (Capacitor) the whatsapp:// scheme opens the app directly.
 * On web, wa.me works on mobile browsers; on desktop it opens WhatsApp Web.
 */
export function shareOnWhatsApp(text) {
  const encoded = encodeURIComponent(text)
  // Try native WhatsApp scheme first (works in Capacitor / mobile browser)
  const url = /Android|iPhone|iPad/i.test(navigator.userAgent)
    ? `whatsapp://send?text=${encoded}`
    : `https://wa.me/?text=${encoded}`
  window.open(url, '_blank')
}

export function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
