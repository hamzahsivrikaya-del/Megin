'use client'

import { useScrollReveal } from '@/lib/hooks/useScrollReveal'
import { Check } from 'lucide-react'

interface FeatureShowcaseProps {
  title: string
  description: string
  bullets: string[]
  icon: React.ReactNode
}

export default function FeatureShowcase({
  title,
  description,
  bullets,
  icon,
}: FeatureShowcaseProps) {
  const revealRef = useScrollReveal()

  return (
    <div ref={revealRef} className="mkt-reveal">
      {/* Icon */}
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#DC2626] to-[#F97316] flex items-center justify-center mb-5 shadow-lg shadow-red-500/10">
        {icon}
      </div>
      {/* Title */}
      <h2 className="heading-display text-2xl sm:text-3xl text-[#0A0A0A]">
        {title}
      </h2>
      <p className="text-[#6B7280] mt-3 leading-relaxed text-lg">{description}</p>

      <ul className="mt-6 space-y-3" aria-label={`${title} features`}>
        {bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-3">
            <span className="mt-0.5 flex-shrink-0" aria-hidden="true">
              <Check className="w-4 h-4 text-[#DC2626]" />
            </span>
            <span className="text-sm text-[#0A0A0A]">{bullet}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
