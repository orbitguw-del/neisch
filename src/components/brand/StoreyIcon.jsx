/**
 * StoreyIcon
 *
 * showText={true}  — default: icon + "STOREY" label (login page, settings, splash)
 * showText={false} — icon only, square (favicon, tiny app-bar use)
 *
 * The icon viewport is always 32×32.
 * With text the total height becomes 32 + 14 = 46 units tall.
 */
export default function StoreyIcon({ size = 32, className = '', showText = true }) {
  const textHeight = 14            // extra height below the square for the label
  const totalH     = showText ? 32 + textHeight : 32
  const pixelH     = Math.round(size * (totalH / 32))

  return (
    <svg
      width={size}
      height={showText ? pixelH : size}
      viewBox={`0 0 32 ${totalH}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Storey"
    >
      {/* Square background */}
      <rect width="32" height="32" rx="8" fill="#B85042" />

      {/* Three ascending white bars */}
      <rect x="5"  y="18" width="6" height="9"  rx="1" fill="white" />
      <rect x="13" y="13" width="6" height="14" rx="1" fill="white" />
      <rect x="21" y="7"  width="6" height="20" rx="1" fill="white" />

      {/* "STOREY" label beneath the square */}
      {showText && (
        <text
          x="16"
          y="42"
          textAnchor="middle"
          fill="#B85042"
          fontFamily="Georgia, 'Times New Roman', ui-serif, serif"
          fontSize="7.5"
          fontWeight="bold"
          letterSpacing="2"
        >
          STOREY
        </text>
      )}
    </svg>
  )
}
