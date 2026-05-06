export default function StoreyLogo({ size = 'md', className = '' }) {
  const scales = { sm: 0.6, md: 1, lg: 1.4, xl: 2 }
  const s = scales[size] ?? 1

  return (
    <div className={`flex items-end gap-3 ${className}`}>
      {/* Three ascending bars */}
      <svg
        width={Math.round(56 * s)}
        height={Math.round(48 * s)}
        viewBox="0 0 56 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect x="0"  y="22" width="14" height="26" rx="2" fill="#B85042" />
        <rect x="21" y="12" width="14" height="36" rx="2" fill="#B85042" />
        <rect x="42" y="0"  width="14" height="48" rx="2" fill="#B85042" />
      </svg>

      {/* Wordmark */}
      <span
        style={{
          fontFamily: 'Georgia, ui-serif, serif',
          fontWeight: 700,
          fontSize: Math.round(20 * s),
          color: '#2C2C2A',
          letterSpacing: '-0.02em',
          lineHeight: 1,
          paddingBottom: Math.round(2 * s),
        }}
      >
        Storey
      </span>
    </div>
  )
}
