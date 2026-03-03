'use client'

import Link from 'next/link'
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
  ctaVariant = 'primary',
}: UseCaseSectionProps) {
  const revealRef = useScrollReveal()

  return (
    <section
      className={`mkt-section py-20 sm:py-28 ${
        dark ? 'mkt-section-dark' : 'bg-white'
      }`}
    >
      <div
        ref={revealRef}
        className="mkt-container max-w-3xl mx-auto text-center"
      >
        {/* Label */}
        <p
          className={`mkt-reveal text-xs font-bold uppercase tracking-[0.2em] ${
            dark ? 'text-white/60' : 'text-[#FF2D2D]'
          }`}
        >
          {label}
        </p>

        {/* Title */}
        <h2
          className={`mkt-reveal mkt-heading-lg text-3xl sm:text-4xl mt-3 ${
            dark ? 'text-white' : 'text-[#0A0A0A]'
          }`}
        >
          {title}
        </h2>

        {/* Description */}
        <p
          className={`mkt-reveal mt-4 text-lg leading-relaxed ${
            dark ? 'text-white/60' : 'text-[#6B7280]'
          }`}
        >
          {description}
        </p>

        {/* Features grid */}
        <div className="mkt-stagger mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {features.map((feature) => (
            <div
              key={feature}
              className={`mkt-reveal flex items-center gap-3 rounded-xl px-5 py-4 ${
                dark ? 'bg-white/8 border border-white/10' : 'bg-[#F5F5F5] border border-[#E5E7EB]'
              }`}
            >
              <span className="flex-shrink-0" aria-hidden="true">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="8"
                    fill={dark ? 'rgba(255,45,45,0.25)' : 'rgba(255,45,45,0.12)'}
                  />
                  <path
                    d="M4.5 8.5L6.5 10.5L11 5.5"
                    stroke="#FF2D2D"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span
                className={`text-sm font-medium ${
                  dark ? 'text-white/80' : 'text-[#0A0A0A]'
                }`}
              >
                {feature}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mkt-reveal mt-10">
          <Link
            href="/signup"
            className={ctaVariant === 'primary' ? 'mkt-cta-primary' : 'mkt-cta-ghost'}
          >
            Get Started Free
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
