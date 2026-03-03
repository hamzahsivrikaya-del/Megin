export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-border rounded w-32" />
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface rounded-xl border border-border p-4 space-y-2">
            <div className="h-3 bg-border rounded w-20" />
            <div className="h-8 bg-border rounded w-24" />
          </div>
        ))}
      </div>
      {/* Chart area */}
      <div className="bg-surface rounded-xl border border-border p-4">
        <div className="h-5 bg-border rounded w-40 mb-4" />
        <div className="h-64 bg-border rounded" />
      </div>
      {/* Table */}
      <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
        <div className="h-5 bg-border rounded w-36" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 bg-border rounded" />
        ))}
      </div>
    </div>
  )
}
