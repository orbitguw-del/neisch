import { cn } from '@/lib/utils'

export default function StatCard({ label, value, icon: Icon, trend, color = 'brand' }) {
  const colorMap = {
    brand: 'bg-brand-50 text-brand-600',
    earth: 'bg-earth-50 text-earth-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
  }

  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={cn('flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl', colorMap[color])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="mt-0.5 text-2xl font-bold text-gray-900 tabular-nums">{value}</p>
        {trend && <p className="mt-0.5 text-xs text-gray-500">{trend}</p>}
      </div>
    </div>
  )
}
