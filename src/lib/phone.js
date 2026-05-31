// Phone-number normalisation — shared by SMS OTP login and phone enrollment.
//
// Storey's users are NE-India contractors, so the default country is India (+91).
// They type a bare 10-digit mobile number ("9876543210"); we store and send it
// in E.164 format ("+919876543210") which Twilio requires.
//
// IMPORTANT: login and enrollment MUST normalise identically, or the
// ownership check in verify-sms-otp (profile.phone === phone_number) fails.
// That's why this lives in one place — do not inline a second copy.

const DEFAULT_CC = '91' // India

// Returns an E.164 string, or '' if there aren't enough digits to be a number.
export function normalizePhone(raw) {
  if (!raw) return ''
  const trimmed = raw.trim()

  // Already international (user typed a +) — keep their country code, drop junk.
  if (trimmed.startsWith('+')) {
    const digits = trimmed.slice(1).replace(/\D/g, '')
    return digits ? '+' + digits : ''
  }

  let digits = trimmed.replace(/\D/g, '')
  if (!digits) return ''

  if (digits.startsWith('00')) return '+' + digits.slice(2) // 00 = intl dialling prefix
  if (digits.startsWith('0')) digits = digits.slice(1)      // strip Indian trunk 0

  // Bare 10-digit Indian mobile → prepend +91.
  if (digits.length === 10) return `+${DEFAULT_CC}${digits}`
  // 91XXXXXXXXXX (12 digits, country code typed without +).
  if (digits.length === 12 && digits.startsWith(DEFAULT_CC)) return '+' + digits

  // Anything else: treat the leading digits as a country code already present.
  return '+' + digits
}

// True if the normalised value looks like a plausible E.164 number.
export function isValidPhone(raw) {
  return /^\+\d{8,15}$/.test(normalizePhone(raw))
}
