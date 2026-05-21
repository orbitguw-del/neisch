export default function PageHeader({ title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      {/* min-w-0 + flex-1 lets the title shrink properly on narrow screens
          instead of forcing one-word-per-line wrap (Tailwind/Flexbox default
          is min-width: auto, which equals the content's intrinsic width).
          The action prop is responsible for its own internal flex/wrap. */}
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-bold text-gray-900 break-words">{title}</h1>
        {description && <p className="mt-0.5 text-sm text-gray-500 break-words">{description}</p>}
      </div>
      {action && <div className="sm:flex-shrink-0">{action}</div>}
    </div>
  )
}
