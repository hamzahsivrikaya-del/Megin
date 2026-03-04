'use client'

import { Star } from 'lucide-react'
import { useScrollReveal } from '@/lib/hooks/useScrollReveal'
import type { MarketingTranslations } from '@/lib/i18n/types'

interface TestimonialSectionProps {
  t: MarketingTranslations
}

const avatarColors = [
  'from-[#DC2626] to-[#F97316]',
  'from-[#F97316] to-[#D97706]',
  'from-[#D97706] to-[#DC2626]',
]

export default function TestimonialSection({ t }: TestimonialSectionProps) {
  const revealRef = useScrollReveal()

  return (
    <section className="mkt-section py-16 sm:py-20 bg-white">
      <div className="mkt-container">
        {/* Heading */}
        <div className="text-center">
          <h2 className="mkt-heading-lg text-3xl sm:text-4xl md:text-5xl">
            <span className="text-[#0A0A0A] block">{t.testimonials.title}</span>
          </h2>
          <p className="text-[#6B7280] mt-4 max-w-xl mx-auto leading-relaxed">
            {t.testimonials.subtitle}
          </p>
        </div>

        {/* Testimonial grid */}
        <div
          ref={revealRef}
          className="mkt-stagger grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-12 sm:mt-16"
        >
          {t.testimonials.items.map((item, index) => (
            <div
              key={item.name}
              className="mkt-reveal mkt-testimonial-card flex flex-col"
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]"
                  />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="mt-4 text-[#374151] leading-relaxed flex-1">
                &ldquo;{item.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#F3F4F6]">
                {/* Avatar placeholder */}
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColors[index % avatarColors.length]} flex items-center justify-center text-white font-bold text-sm`}
                >
                  {item.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#0A0A0A]">
                    {item.name}
                  </div>
                  <div className="text-xs text-[#6B7280]">{item.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
