'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useScrollReveal } from '@/lib/hooks/useScrollReveal'

interface UseCaseSectionProps {
  label: string
  title: string
  description: string
  features: string[]
  dark?: boolean
  ctaVariant?: 'primary' | 'ghost'
}

export default function UseCaseSection({
  label,
  title,
  description,
  features,
  dark = false,
}: UseCaseSectionProps) {
  const revealRef = useScrollReveal()

  return (
    <section
      className={`mkt-section py-20 sm:py-28 relative overflow-hidden ${
        dark ? 'mkt-section-dark-warm' : 'bg-white'
      }`}
    >
      {dark && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,rgba(220,38,38,0.06),transparent)] pointer-events-none" />
      )}

      <div ref={revealRef} className="mkt-container max-w-3xl mx-auto text-center relative">
        {/* Label */}
        <p className={`mkt-reveal text-xs font-bold uppercase tracking-[0.2em] ${dark ? 'text-[#DC2626]' : 'text-[#DC2626]'}`}>
          {label}
        </p>

        {/* Title */}
        <h2 className={`mkt-reveal heading-display text-3xl sm:text-4xl md:text-5xl mt-4 ${dark ? 'text-white' : 'text-[#0A0A0A]'}`}>
          {title}
        </h2>

        {/* Accent line */}
        <div className="mkt-reveal w-16 h-1 rounded-full bg-gradient-to-r from-[#DC2626] to-[#F97316] mx-auto mt-6" />

        {/* Description */}
        <p className={`mkt-reveal mt-6 text-lg leading-relaxed ${dark ? 'text-white/60' : 'text-[#6B7280]'}`}>
          {description}
        </p>

        {/* Features grid */}
        <div className="mkt-stagger mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {features.map((feature) => (
            <div
              key={feature}
              className={`mkt-reveal flex items-center gap-3 rounded-xl px-5 py-4 transition-all duration-300 hover:-translate-y-0.5 ${
                dark
                  ? 'bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.1]'
                  : 'bg-[#FAFAFA] border border-[#E5E7EB] hover:border-gray-200 hover:shadow-sm'
              }`}
            >
              <span className="flex-shrink-0" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="8" fill={dark ? 'rgba(220,38,38,0.25)' : 'rgba(34,197,94,0.12)'} />
                  <path d="M4.5 8.5L6.5 10.5L11 5.5" stroke={dark ? '#DC2626' : '#22C55E'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className={`text-sm font-medium ${dark ? 'text-white/80' : 'text-[#374151]'}`}>
                {feature}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mkt-reveal mt-12">
          <Link href="/signup" className="cta-gradient cta-glow">
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
