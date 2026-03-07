interface StatCardProps {
  icon: React.ReactNode
  value: string | number
  label: string
  className?: string
}

export default function StatCard({ icon, value, label, className = '' }: StatCardProps) {
  return (
    <div className={`stat-card text-center ${className}`}>
      <div className="icon-circle mx-auto mb-2">
        {icon}
      </div>
      <span className="text-2xl font-bold text-text-primary heading-display">{value}</span>
      <span className="block text-xs text-text-secondary mt-0.5">{label}</span>
    </div>
  )
}
