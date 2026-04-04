export default function PageHeader({ title, description, action }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
