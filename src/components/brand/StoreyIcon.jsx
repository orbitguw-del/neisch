export default function StoreyIcon({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Storey"
    >
      <rect width="32" height="32" rx="8" fill="#B85042" />
      {/* Three ascending white bars, centered */}
      <rect x="5"  y="18" width="6" height="9"  rx="1" fill="white" />
      <rect x="13" y="13" width="6" height="14" rx="1" fill="white" />
      <rect x="21" y="7"  width="6" height="20" rx="1" fill="white" />
    </svg>
  )
}
