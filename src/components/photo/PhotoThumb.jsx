import { useEffect, useState } from 'react'
import { ImageIcon } from 'lucide-react'
import { getPhotoUrl } from '@/lib/photos'

/**
 * Displays a stored photo from its Storage path via a signed URL.
 * Renders nothing (or a placeholder) when there is no path.
 *
 * Props:
 *   path        — Storage path, or null
 *   size        — pixel size of the square thumb (default 48)
 *   className   — extra classes
 *   onClick     — optional click handler (e.g. open full-size)
 */
export default function PhotoThumb({ path, size = 48, className = '', onClick }) {
  const [url, setUrl] = useState(null)

  useEffect(() => {
    let cancelled = false
    if (!path) { setUrl(null); return }
    getPhotoUrl(path).then((u) => { if (!cancelled) setUrl(u) })
    return () => { cancelled = true }
  }, [path])

  const style = { width: size, height: size }

  if (!path) {
    return (
      <div
        style={style}
        className={`flex items-center justify-center rounded-md bg-gray-100 text-gray-300 ${className}`}
      >
        <ImageIcon className="h-4 w-4" />
      </div>
    )
  }

  return (
    <img
      src={url ?? undefined}
      alt="Site photo"
      style={style}
      onClick={onClick}
      className={`rounded-md border border-gray-200 object-cover ${onClick ? 'cursor-pointer' : ''} ${className}`}
    />
  )
}
