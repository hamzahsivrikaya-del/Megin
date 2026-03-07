export default function CalendarLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-border rounded w-32" />
      <div className="flex items-center justify-between bg-surface border border-border rounded-xl px-4 py-3">
        <div className="w-9 h-9 bg-border rounded-lg" />
        <div className="h-5 bg-border rounded w-40" />
        <div className="w-9 h-9 bg-border rounded-lg" />
      </div>
      <div className="bg-surface border border-border rounded-xl p-4">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-6 bg-border rounded" />
          ))}
        </div>
        <div className="space-y-2">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-12 bg-border/50 rounded" />
          ))}
        </div>
      </div>
    </div>
  )
}
