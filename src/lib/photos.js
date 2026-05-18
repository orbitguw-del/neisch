// On-site photo capture, compression and upload.
//
// Photos live in the private `site-photos` Storage bucket under
//   <tenant_id>/<site_id>/<entity>/<uuid>.jpg
// The path is generated client-side BEFORE upload, so an entity record can
// store its photo path immediately even when the upload is queued offline.
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import imageCompression from 'browser-image-compression'
import { supabase } from '@/lib/supabase'
import { isOnline, queueWrite } from '@/lib/offlineWrite'

const BUCKET = 'site-photos'

/**
 * Browser capture — a standard file input. On phones this still shows the
 * "Camera / Photo Library" chooser. Used on the web where @capacitor/camera's
 * getPhoto() is not available without extra PWA-element setup.
 */
function webCapture() {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.setAttribute('capture', 'environment')
    let settled = false
    const done = (v) => { if (!settled) { settled = true; resolve(v) } }
    input.addEventListener('change', () => done(input.files?.[0] ?? null))
    input.addEventListener('cancel', () => done(null))
    input.click()
  })
}

/** Open the camera / picker and return a Blob, or null if cancelled. */
export async function capturePhoto() {
  // Native app → Capacitor camera. Web/mobile browser → file input.
  const isNative = typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()
  if (!isNative) {
    return webCapture()
  }
  try {
    const photo = await Camera.getPhoto({
      quality: 80,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,   // live camera only — no gallery
    })
    if (!photo?.webPath) return null
    const res = await fetch(photo.webPath)
    return await res.blob()
  } catch (err) {
    // User cancelled the picker — not an error.
    if (String(err?.message ?? err).toLowerCase().includes('cancel')) return null
    throw err
  }
}

/** Compress an image Blob/File for upload (site photos are large). */
export async function compressImage(blob) {
  return imageCompression(blob, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: 'image/jpeg',
  })
}

/**
 * Burn a date-time stamp into the bottom-right corner of a photo — proof of
 * when the on-site photo was taken. Returns a new JPEG Blob.
 */
export async function stampTimestamp(blob) {
  try {
    const bitmap = await createImageBitmap(blob)
    const canvas = document.createElement('canvas')
    canvas.width  = bitmap.width
    canvas.height = bitmap.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(bitmap, 0, 0)

    const stamp = new Date().toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    })
    const pad      = Math.round(canvas.width * 0.018)
    const fontSize = Math.max(15, Math.round(canvas.width * 0.030))
    ctx.font = `bold ${fontSize}px Arial, sans-serif`
    const textW = ctx.measureText(stamp).width
    const barH  = fontSize + pad * 1.4

    ctx.fillStyle = 'rgba(0,0,0,0.58)'
    ctx.fillRect(canvas.width - textW - pad * 3, canvas.height - barH - pad, textW + pad * 3, barH)
    ctx.fillStyle    = '#FFFFFF'
    ctx.textBaseline = 'middle'
    ctx.fillText(stamp, canvas.width - textW - pad * 1.5, canvas.height - barH / 2 - pad)

    return await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b ?? blob), 'image/jpeg', 0.9),
    )
  } catch {
    return blob   // never block an upload because the stamp failed
  }
}

/** Build the storage path for a new photo. */
export function photoPath({ tenantId, siteId, entity }) {
  const id = (crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`)
  return `${tenantId}/${siteId ?? 'general'}/${entity}/${id}.jpg`
}

/**
 * Compress + upload a photo. Returns the storage path (store this on the
 * entity record). When offline the upload is queued and replayed on reconnect;
 * the path is still returned so the record can reference it right away.
 */
export async function uploadPhoto({ blob, tenantId, siteId, entity }) {
  const compressed = await stampTimestamp(await compressImage(blob))
  const path = photoPath({ tenantId, siteId, entity })

  if (!isOnline()) {
    await queueWrite({
      op: 'storage',
      bucket: BUCKET,
      path,
      blob: compressed,
      contentType: 'image/jpeg',
      label: `Photo — ${entity}`,
    })
    return path
  }

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, compressed, { contentType: 'image/jpeg', upsert: true })
  if (error) throw error
  return path
}

/** Create a temporary signed URL to display a stored photo. */
export async function getPhotoUrl(path, expiresInSeconds = 3600) {
  if (!path) return null
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresInSeconds)
  if (error) return null
  return data?.signedUrl ?? null
}
