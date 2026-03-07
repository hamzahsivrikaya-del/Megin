export interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  glow?: boolean
}

export default function Card({ children, className = '', onClick, glow }: CardProps) {
  return (
    <div
      className={`panel-card ${glow ? 'panel-card-glow' : ''} ${onClick ? 'panel-card-interactive' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }: CardProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '' }: CardProps) {
  return (
    <h3 className={`text-lg heading-display text-text-primary ${className}`}>
      {children}
    </h3>
  )
}
