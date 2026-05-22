// Storey illustration library — Tier-2 line illustrations.
// 16 stroke-only SVG components, brand-coherent (terracotta on sand).
// Per CLAUDE.md visual-first + three-tier rule.
//
// Usage:
//   import { Cement, Railing } from '@/components/illustrations'
//   <Cement size={70} />
//   <Railing size={120} bg="transparent" />
//
// Props (all optional):
//   size  — pixel size of the (square) frame. Default 80.
//   color — stroke colour for the line art. Default terracotta.
//   bg    — background colour of the rounded frame. Default sand.
//   sw    — stroke width (in viewBox units, 0–100). Default 3.

import React from 'react'

const TERRACOTTA = '#B85042'
const SAND       = '#E7E8D1'
const DARK       = '#2A1410'

// Reusable wrapper — every illustration uses a 100×100 viewBox with a
// rounded sand-coloured frame, then the line art inside.
function Frame({ size, bg, children }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="100" height="100" rx="10" fill={bg} />
      {children}
    </svg>
  )
}

// Stroke defaults applied via a group <g>.
function Stroke({ color, sw, children, extraProps = {} }) {
  return (
    <g
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      {...extraProps}
    >
      {children}
    </g>
  )
}

const defaults = { size: 80, color: TERRACOTTA, bg: SAND, sw: 3 }

// ─── 1. Cement bag (single, with seam) ────────────────────────────
export function Cement({ size = defaults.size, color = defaults.color, bg = defaults.bg, sw = defaults.sw } = {}) {
  return (
    <Frame size={size} bg={bg}>
      <Stroke color={color} sw={sw}>
        <path d="M30 25 Q30 20 40 20 L60 20 Q70 20 70 25 L75 82 Q75 85 70 85 L30 85 Q25 85 25 82 Z" />
        <line x1="30" y1="35" x2="70" y2="35" />
        <line x1="40" y1="20" x2="60" y2="20" />
        <line x1="50" y1="35" x2="50" y2="85" strokeDasharray="3,4" />
      </Stroke>
    </Frame>
  )
}

// ─── 2. Cement stack (3 bags) ─────────────────────────────────────
export function CementStack({ size = defaults.size, color = defaults.color, bg = defaults.bg, sw = defaults.sw } = {}) {
  return (
    <Frame size={size} bg={bg}>
      <Stroke color={color} sw={sw}>
        {[55, 40, 25].map((py) => (
          <g key={py}>
            <rect x={22} y={py} width={56} height={13} rx={2} />
            <line x1={50} y1={py} x2={50} y2={py + 13} strokeDasharray="2,3" />
          </g>
        ))}
        <line x1={15} y1={82} x2={85} y2={82} stroke={DARK} strokeWidth={2} />
      </Stroke>
    </Frame>
  )
}

// ─── 3. Sand pile ─────────────────────────────────────────────────
export function Sand({ size = defaults.size, color = defaults.color, bg = defaults.bg, sw = defaults.sw } = {}) {
  return (
    <Frame size={size} bg={bg}>
      <Stroke color={color} sw={sw}>
        <path d="M12 78 Q30 45 50 30 Q70 45 88 78 Z" />
        <path d="M25 65 Q35 55 42 60" strokeWidth={sw * 0.6} />
        <path d="M55 60 Q62 55 72 65" strokeWidth={sw * 0.6} />
      </Stroke>
      <circle cx={35} cy={72} r={2} fill={color} />
      <circle cx={50} cy={55} r={2} fill={color} />
      <circle cx={65} cy={70} r={2} fill={color} />
      <line x1={8} y1={82} x2={92} y2={82} stroke={DARK} strokeWidth={2} strokeLinecap="round" />
    </Frame>
  )
}

// ─── 4. Brick stack ───────────────────────────────────────────────
export function Bricks({ size = defaults.size, color = defaults.color, bg = defaults.bg, sw = defaults.sw } = {}) {
  return (
    <Frame size={size} bg={bg}>
      <Stroke color={color} sw={sw}>
        {[25, 42, 59].map((py, row) => {
          const offset = row % 2 === 1 ? 7.5 : 0
          return [0, 1, 2, 3].map((c) => {
            const px = 18 + offset + c * 15
            if (px + 13 > 88) return null
            return <rect key={`${py}-${c}`} x={px} y={py} width={13} height={13} rx={1.5} />
          })
        })}
      </Stroke>
      <line x1={10} y1={78} x2={90} y2={78} stroke={DARK} strokeWidth={2} strokeLinecap="round" />
    </Frame>
  )
}

// ─── 5. Rebar bundle (end-on) ─────────────────────────────────────
export function Rebar({ size = defaults.size, color = defaults.color, bg = defaults.bg, sw = defaults.sw } = {}) {
  const rods = [
    [50, 32], [38, 42], [62, 42],
    [32, 55], [50, 55], [68, 55],
    [38, 68], [62, 68], [50, 78],
  ]
  return (
    <Frame size={size} bg={bg}>
      <Stroke color={color} sw={sw}>
        <ellipse cx={50} cy={55} rx={30} ry={30} strokeWidth={sw * 0.7} strokeDasharray="3,4" />
      </Stroke>
      {rods.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={5} stroke={color} strokeWidth={sw} fill="none" />
      ))}
    </Frame>
  )
}

// ─── 6. Rebar long (laid out, ribbed) ─────────────────────────────
export function RebarLong({ size = defaults.size, color = defaults.color, bg = defaults.bg, sw = defaults.sw } = {}) {
  return (
    <Frame size={size} bg={bg}>
      <Stroke color={color} sw={sw}>
        <line x1={10} y1={35} x2={90} y2={35} />
        <line x1={10} y1={50} x2={90} y2={50} />
        <line x1={10} y1={65} x2={90} y2={65} />
        {[20, 35, 50, 65, 80].map((px) => (
          <g key={px}>
            <line x1={px} y1={32} x2={px} y2={38} strokeWidth={1.5} />
            <line x1={px} y1={47} x2={px} y2={53} strokeWidth={1.5} />
            <line x1={px} y1={62} x2={px} y2={68} strokeWidth={1.5} />
          </g>
        ))}
      </Stroke>
    </Frame>
  )
}

// ─── 7. Railing ───────────────────────────────────────────────────
export function Railing({ size = defaults.size, color = defaults.color, bg = defaults.bg, sw = defaults.sw } = {}) {
  return (
    <Frame size={size} bg={bg}>
      <Stroke color={color} sw={sw}>
        <line x1={15} y1={32} x2={85} y2={32} />
        <line x1={15} y1={68} x2={85} y2={68} />
        {[0, 1, 2, 3, 4].map((i) => {
          const px = 20 + i * 15
          return <line key={i} x1={px} y1={25} x2={px} y2={75} />
        })}
      </Stroke>
      <line x1={10} y1={82} x2={90} y2={82} stroke={DARK} strokeWidth={2} strokeLinecap="round" />
    </Frame>
  )
}

// ─── 8. Paver ─────────────────────────────────────────────────────
export function Paver({ size = defaults.size, color = defaults.color, bg = defaults.bg, sw = defaults.sw } = {}) {
  return (
    <Frame size={size} bg={bg}>
      <Stroke color={color} sw={sw * 0.85}>
        {[0, 1, 2].map((r) =>
          [0, 1, 2].map((c) => {
            const px = 18 + c * 22 + (r % 2 ? 11 : 0)
            const py = 22 + r * 22
            return <rect key={`${r}-${c}`} x={px} y={py} width={18} height={18} rx={2} />
          })
        )}
      </Stroke>
    </Frame>
  )
}

// ─── 9. Foundation columns ────────────────────────────────────────
export function Foundation({ size = defaults.size, color = defaults.color, bg = defaults.bg, sw = defaults.sw } = {}) {
  return (
    <Frame size={size} bg={bg}>
      <Stroke color={color} sw={sw}>
        <line x1={10} y1={78} x2={90} y2={78} />
        <line x1={25} y1={40} x2={25} y2={78} />
        <line x1={50} y1={30} x2={50} y2={78} />
        <line x1={75} y1={35} x2={75} y2={78} />
      </Stroke>
      <rect x={18} y={78} width={14} height={8} fill={color} />
      <rect x={43} y={78} width={14} height={8} fill={color} />
      <rect x={68} y={78} width={14} height={8} fill={color} />
    </Frame>
  )
}

// ─── 10. Slab + rebar grid (isometric) ────────────────────────────
export function Slab({ size = defaults.size, color = defaults.color, bg = defaults.bg, sw = defaults.sw } = {}) {
  return (
    <Frame size={size} bg={bg}>
      <Stroke color={color} sw={sw}>
        <polygon points="15,50 50,30 85,50 50,70" />
        <line x1={15} y1={50} x2={15} y2={60} />
        <line x1={85} y1={50} x2={85} y2={60} />
        <line x1={50} y1={70} x2={50} y2={80} />
        <line x1={15} y1={60} x2={50} y2={80} />
        <line x1={85} y1={60} x2={50} y2={80} />
        <line x1={30} y1={43} x2={65} y2={61} strokeWidth={1.5} />
        <line x1={40} y1={38} x2={70} y2={52} strokeWidth={1.5} />
      </Stroke>
    </Frame>
  )
}

// ─── 11. Scaffold (X-braced) ──────────────────────────────────────
export function Scaffold({ size = defaults.size, color = defaults.color, bg = defaults.bg, sw = defaults.sw } = {}) {
  return (
    <Frame size={size} bg={bg}>
      <Stroke color={color} sw={sw}>
        <line x1={25} y1={20} x2={25} y2={82} />
        <line x1={55} y1={20} x2={55} y2={82} />
        <line x1={85} y1={20} x2={85} y2={82} />
        <line x1={20} y1={35} x2={90} y2={35} />
        <line x1={20} y1={65} x2={90} y2={65} />
        <line x1={25} y1={35} x2={55} y2={65} strokeWidth={sw * 0.7} />
        <line x1={55} y1={35} x2={25} y2={65} strokeWidth={sw * 0.7} />
        <line x1={55} y1={35} x2={85} y2={65} strokeWidth={sw * 0.7} />
        <line x1={85} y1={35} x2={55} y2={65} strokeWidth={sw * 0.7} />
      </Stroke>
    </Frame>
  )
}

// ─── 12. Tile stack (offset slabs) ────────────────────────────────
export function Tiles({ size = defaults.size, color = defaults.color, bg = defaults.bg, sw = defaults.sw } = {}) {
  return (
    <Frame size={size} bg={bg}>
      <Stroke color={color} sw={sw}>
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={22 + i * 5} y={60 - i * 5} width={55} height={12} rx={2} />
        ))}
      </Stroke>
    </Frame>
  )
}

// ─── 13. Paint bucket (with drip) ─────────────────────────────────
export function Paint({ size = defaults.size, color = defaults.color, bg = defaults.bg, sw = defaults.sw } = {}) {
  return (
    <Frame size={size} bg={bg}>
      <Stroke color={color} sw={sw}>
        <path d="M28 35 L32 85 Q32 88 36 88 L64 88 Q68 88 68 85 L72 35" />
        <ellipse cx={50} cy={35} rx={22} ry={7} />
        <path d="M30 32 Q50 18 70 32" strokeWidth={sw * 0.7} />
        {/* Paint drip */}
        <path d="M40 50 Q42 58 40 62 Q42 65 40 68" strokeWidth={sw * 0.8} />
        <circle cx={40} cy={70} r={2.5} fill={color} />
      </Stroke>
    </Frame>
  )
}

// ─── 14. Hardhat ──────────────────────────────────────────────────
export function Hardhat({ size = defaults.size, color = defaults.color, bg = defaults.bg, sw = defaults.sw } = {}) {
  return (
    <Frame size={size} bg={bg}>
      <Stroke color={color} sw={sw}>
        <path d="M18 70 Q50 25 82 70" />
        <line x1={12} y1={72} x2={88} y2={72} />
        <line x1={50} y1={30} x2={50} y2={70} />
        <line x1={35} y1={40} x2={35} y2={70} strokeWidth={sw * 0.7} />
        <line x1={65} y1={40} x2={65} y2={70} strokeWidth={sw * 0.7} />
      </Stroke>
    </Frame>
  )
}

// ─── 15. Truck (transfer) ─────────────────────────────────────────
export function Truck({ size = defaults.size, color = defaults.color, bg = defaults.bg, sw = defaults.sw } = {}) {
  return (
    <Frame size={size} bg={bg}>
      <Stroke color={color} sw={sw}>
        <rect x={15} y={40} width={40} height={30} rx={2} />
        <path d="M55 50 L75 50 L80 60 L80 70 L55 70 Z" />
        <circle cx={30} cy={75} r={6} />
        <circle cx={70} cy={75} r={6} />
      </Stroke>
    </Frame>
  )
}

// ─── 16. Building / site ──────────────────────────────────────────
export function Building({ size = defaults.size, color = defaults.color, bg = defaults.bg, sw = defaults.sw } = {}) {
  return (
    <Frame size={size} bg={bg}>
      <Stroke color={color} sw={sw}>
        <rect x={25} y={30} width={50} height={55} />
        <rect x={32} y={40} width={10} height={12} />
        <rect x={58} y={40} width={10} height={12} />
        <rect x={32} y={58} width={10} height={12} />
        <rect x={58} y={58} width={10} height={12} />
        <rect x={43} y={70} width={14} height={15} />
      </Stroke>
      <line x1={12} y1={85} x2={88} y2={85} stroke={DARK} strokeWidth={2} strokeLinecap="round" />
    </Frame>
  )
}

// ─── Library metadata — for previews and switch-by-string lookups ──
export const ILLUSTRATIONS = [
  { key: 'Cement',       Component: Cement,       label: 'Cement bag',          kind: 'material · primary' },
  { key: 'CementStack',  Component: CementStack,  label: 'Cement stack',        kind: 'material · alt' },
  { key: 'Sand',         Component: Sand,         label: 'Sand pile',           kind: 'material' },
  { key: 'Bricks',       Component: Bricks,       label: 'Brick stack',         kind: 'material' },
  { key: 'Rebar',        Component: Rebar,        label: 'Rebar bundle',        kind: 'material · end-on' },
  { key: 'RebarLong',    Component: RebarLong,    label: 'Rebar long',          kind: 'material · alt' },
  { key: 'Railing',      Component: Railing,      label: 'Railing',             kind: 'work type' },
  { key: 'Paver',        Component: Paver,        label: 'Paver',               kind: 'work type' },
  { key: 'Foundation',   Component: Foundation,   label: 'Foundation columns',  kind: 'work type' },
  { key: 'Slab',         Component: Slab,         label: 'Slab + rebar grid',   kind: 'work type' },
  { key: 'Scaffold',     Component: Scaffold,     label: 'Scaffold',            kind: 'work type · equipment' },
  { key: 'Tiles',        Component: Tiles,        label: 'Tile stack',          kind: 'material' },
  { key: 'Paint',        Component: Paint,        label: 'Paint bucket',        kind: 'material · finishing' },
  { key: 'Hardhat',      Component: Hardhat,      label: 'Hardhat',             kind: 'role · worker' },
  { key: 'Truck',        Component: Truck,        label: 'Truck',               kind: 'verb · transfer' },
  { key: 'Building',     Component: Building,     label: 'Building / site',     kind: 'site' },
]

// Default export is the metadata array (most useful for preview pages).
export default ILLUSTRATIONS
