/**
 * QuickActionTile — colour-coded action tile for the dashboard grid.
 *
 * Visual-first per CLAUDE.md: tile = colour + icon + short label.
 * Designed for a 3-column grid on phone, 6-column on desktop.
 *
 * Each colour key maps to a Tailwind {bg, fg} pair. Keep palette tight —
 * 6 colour slots so a 3×2 grid feels distinct without rainbow-ing.
 *
 * Usage:
 *   <QuickActionTile color="amber" icon={Pencil} label="File Log"
 *     onClick={() => navigate('/logs')} />
 */
const PALETTE = {
  amber:  { bg: 'bg-amber-50',   fg: 'text-amber-700'  },
  blue:   { bg: 'bg-blue-50',    fg: 'text-blue-700'   },
  red:    { bg: 'bg-red-50',     fg: 'text-red-700'    },
  green:  { bg: 'bg-green-50',   fg: 'text-green-700'  },
  violet: { bg: 'bg-violet-50',  fg: 'text-violet-700' },
  orange: { bg: 'bg-orange-50',  fg: 'text-orange-700' },
  sage:   { bg: 'bg-sage-100',   fg: 'text-sage-700'   },
  brand:  { bg: 'bg-brand-50',   fg: 'text-brand-700'  },
}

export default function QuickActionTile({
  icon: Icon,
  label,
  color = 'brand',
  onClick,
  disabled = false,
}) {
  const p = PALETTE[color] || PALETTE.brand
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${p.bg} flex flex-col items-start justify-between gap-2 rounded-xl p-3 sm:p-4 text-left transition-all hover:shadow-sm hover:scale-[1.02] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed min-h-[88px]`}
    >
      {Icon && <Icon className={`h-6 w-6 ${p.fg}`} aria-hidden="true" />}
      <span className={`text-sm font-semibold ${p.fg}`}>{label}</span>
    </button>
  )
}
