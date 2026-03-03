'use client'

import Link from 'next/link'
import { useScrollReveal } from '@/lib/hooks/useScrollReveal'
import type { MarketingTranslations } from '@/lib/i18n/types'

interface FeaturesGridProps {
  t: MarketingTranslations
}

const featureIcons = [
  // Client Management — Users
  (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="7" r="3.5" stroke="#FF2D2D" strokeWidth="1.8" />
      <path d="M2 20c0-3.87 3.13-7 7-7s7 3.13 7 7" stroke="#FF2D2D" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="18" cy="8" r="2.5" stroke="#FF2D2D" strokeWidth="1.6" opacity="0.6" />
      <path d="M21 19c0-2.76-1.34-5-3-5" stroke="#FF2D2D" strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
    </svg>
  ),
  // Workout Programs — Dumbbell
  (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="10" width="3" height="4" rx="1" fill="#FF2D2D" />
      <rect x="1" y="8" width="2" height="8" rx="1" fill="#FF2D2D" opacity="0.7" />
      <rect x="19" y="10" width="3" height="4" rx="1" fill="#FF2D2D" />
      <rect x="21" y="8" width="2" height="8" rx="1" fill="#FF2D2D" opacity="0.7" />
      <rect x="5" y="11" width="14" height="2" rx="1" fill="#FF2D2D" />
    </svg>
  ),
  // Nutrition Tracking — Apple
  (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 6C12 6 11 3 14 2" stroke="#FF2D2D" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M18 8C18 8 20 9.5 20 13C20 17 17.5 21 14 21C13 21 12.5 20.5 12 20.5C11.5 20.5 11 21 10 21C6.5 21 4 17 4 13C4 9.5 6 8 8 8C9.5 8 10.5 8.5 12 8.5C13.5 8.5 14.5 8 16 8C16.7 8 17.4 8 18 8Z" stroke="#FF2D2D" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  ),
  // Progress Reports — Chart
  (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="14" width="4" height="7" rx="1" fill="#FF2D2D" opacity="0.5" />
      <rect x="10" y="9" width="4" height="12" rx="1" fill="#FF2D2D" opacity="0.7" />
      <rect x="17" y="4" width="4" height="17" rx="1" fill="#FF2D2D" />
      <path d="M3 3h18" stroke="#FF2D2D" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    </svg>
  ),
  // Badge System — Trophy
  (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 21h8M12 17v4M7 3H5a2 2 0 0 0-2 2v2a4 4 0 0 0 4 4h0M17 3h2a2 2 0 0 1 2 2v2a4 4 0 0 1-4 4h0" stroke="#FF2D2D" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7 3h10v7a5 5 0 0 1-10 0V3z" stroke="#FF2D2D" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  ),
  // Push Notifications — Bell
  (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#FF2D2D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#FF2D2D" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="18" cy="5" r="3" fill="#FF2D2D" />
    </svg>
  ),
]

export default function FeaturesGrid({ t }: FeaturesGridProps) {
  const revealRef = useScrollReveal()

  return (
    <section className="mkt-section py-20 sm:py-28 bg-white">
      <div className="mkt-container">
        {/* Heading */}
        <div className="text-center">
          <h2 className="mkt-heading-lg text-3xl sm:text-4xl md:text-5xl">
            <span className="text-[#0A0A0A] block">{t.features.title1}</span>
            <span className="text-[#FF2D2D] block">{t.features.title2}</span>
          </h2>
        </div>

        {/* Cards grid */}
        <div
          ref={revealRef}
          className="mkt-stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-16"
        >
          {t.features.items.map((item, index) => (
            <div
              key={item.title}
              className="mkt-reveal bg-[#F5F5F5] rounded-2xl p-6 sm:p-8 border border-[#E5E7EB] hover-lift card-glow transition-all cursor-default"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-full bg-[#FF2D2D]/10 flex items-center justify-center">
                {featureIcons[index]}
              </div>
              {/* Title */}
              <h3 className="text-lg font-bold text-[#0A0A0A] mt-4">{item.title}</h3>
              {/* Description */}
              <p className="text-sm text-[#6B7280] mt-2 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>

        {/* See All link */}
        <div className="text-center mt-12">
          <Link
            href="/features"
            className="inline-flex items-center gap-2 text-[#FF2D2D] font-semibold text-sm uppercase tracking-wider hover:underline transition-colors"
          >
            {t.features.seeAll}
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2.5 7h9M8 3.5L11.5 7 8 10.5"
                stroke="currentColor"
                strokeWidth="1.8"
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
