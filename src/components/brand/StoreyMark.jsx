export default function StoreyMark({ size = 32, className = '' }) {
  const s = size / 56

  return (
    <svg
      width={size}
      height={Math.round(48 * s)}
      viewBox="0 0 56 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Storey"
    >
      <rect x="0"  y="22" width="14" height="26" rx="2" fill="#B85042" />
      <rect x="21" y="12" width="14" height="36" rx="2" fill="#B85042" />
      <rect x="42" y="0"  width="14" height="48" rx="2" fill="#B85042" />
    </svg>
  )
}
