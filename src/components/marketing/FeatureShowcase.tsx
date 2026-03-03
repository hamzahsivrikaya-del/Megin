'use client'

import { useScrollReveal } from '@/lib/hooks/useScrollReveal'

interface FeatureShowcaseProps {
  title: string
  description: string
  bullets: string[]
  reversed?: boolean
}

export default function FeatureShowcase({
  title,
  description,
  bullets,
  reversed = false,
}: FeatureShowcaseProps) {
  const revealRef = useScrollReveal()

  return (
    <div
      ref={revealRef}
      className={`grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center ${
        reversed ? 'lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1' : ''
      }`}
    >
      {/* Text column */}
      <div className="mkt-reveal">
        <h2 className="mkt-heading-lg text-2xl sm:text-3xl md:text-4xl text-[#0A0A0A]">
          {title}
        </h2>
        <p className="text-[#6B7280] mt-4 leading-relaxed">{description}</p>

        <ul className="mt-6 space-y-3" aria-label={`${title} features`}>
          {bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-3">
              <span className="mt-0.5 flex-shrink-0" aria-hidden="true">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="8" cy="8" r="8" fill="#FF2D2D" fillOpacity="0.12" />
                  <path
                    d="M4.5 8.5L6.5 10.5L11 5.5"
                    stroke="#FF2D2D"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="text-sm text-[#0A0A0A]">{bullet}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Image placeholder column */}
      <div className="mkt-reveal">
        <div className="aspect-[4/3] bg-gradient-to-br from-[#F5F5F5] to-[#E5E7EB] rounded-2xl border border-[#E5E7EB] flex items-center justify-center">
          <p className="text-sm font-medium text-[#9CA3AF]">Feature Preview</p>
        </div>
      </div>
    </div>
  )
}
