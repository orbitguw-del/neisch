/**
 * HeroStatsCard — the terracotta "today on site" snapshot card.
 *
 * Visual-first per CLAUDE.md: 2–4 big stat numbers across the card,
 * each with a small icon + label, plus an optional bottom strip
 * (weather, status, etc.).
 *
 * Usage:
 *   <HeroStatsCard
 *     label="TODAY ON SITE"
 *     stats={[
 *       { icon: HardHat, value: 12, sub: 'workers' },
 *       { icon: ListTodo, value: 3, sub: 'tasks' },
 *       { icon: IndianRupee, value: '₹14k', sub: 'spend' },
 *     ]}
 *     strip="☀️ Clear · 28°C · No rain expected"
 *   />
 */
export default function HeroStatsCard({ label, stats = [], strip }) {
  return (
    <div className="mb-6 rounded-2xl bg-brand-600 text-white shadow-sm overflow-hidden">
      <div className="px-5 pt-5 pb-4">
        {label && (
          <p className="text-[11px] font-bold tracking-[3px] text-sand-200">
            {label}
          </p>
        )}
        <div
          className={`mt-3 grid gap-2 ${
            stats.length === 4 ? 'grid-cols-2 sm:grid-cols-4'
            : stats.length === 2 ? 'grid-cols-2'
            : 'grid-cols-3'
          }`}
        >
          {stats.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className="min-w-0">
                {Icon && (
                  <Icon className="h-4 w-4 text-sand-200 mb-1" aria-hidden="true" />
                )}
                <p className="text-3xl sm:text-4xl font-extrabold tabular-nums leading-none">
                  {s.value}
                </p>
                <p className="mt-1 text-xs text-sand-200 truncate">{s.sub}</p>
              </div>
            )
          })}
        </div>
      </div>
      {strip && (
        <div className="border-t border-white/15 px-5 py-2.5 text-sm text-white/95">
          {strip}
        </div>
      )}
    </div>
  )
}
