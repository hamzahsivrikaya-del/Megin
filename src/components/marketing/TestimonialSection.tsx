'use client'

import { Star } from 'lucide-react'
import { useScrollReveal } from '@/lib/hooks/useScrollReveal'
import type { MarketingTranslations } from '@/lib/i18n/types'

interface TestimonialSectionProps {
  t: MarketingTranslations
}

export default function TestimonialSection({ t }: TestimonialSectionProps) {
  const revealRef = useScrollReveal()

  return (
    <section className="mkt-section py-20 sm:py-28 bg-[#FAFAFA]">
      <div className="mkt-container">
        {/* Heading */}
        <div className="text-center">
          <h2 className="mkt-heading-lg text-3xl sm:text-4xl md:text-5xl text-[#0A0A0A]">
            {t.testimonials.title}
          </h2>
          <p className="text-[#6B7280] mt-4 max-w-xl mx-auto leading-relaxed">
            {t.testimonials.subtitle}
          </p>
          <div className="w-16 h-1 rounded-full bg-gradient-to-r from-[#DC2626] to-[#F97316] mx-auto mt-6" />
        </div>

        {/* Cards */}
        <div
          ref={revealRef}
          className="mkt-stagger grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 mt-14 sm:mt-16"
        >
          {t.testimonials.items.map((item) => (
            <div
              key={item.name}
              className="mkt-reveal group relative bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E7EB] transition-all duration-500 hover:shadow-2xl hover:shadow-black/[0.06] hover:-translate-y-2 hover:border-gray-200 flex flex-col overflow-hidden"
            >
              {/* Bottom accent line on hover */}
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-[#DC2626] to-[#F97316] transition-all duration-500 group-hover:w-full" />

              {/* Large decorative quote */}
              <div className="text-[80px] leading-none font-serif text-[#DC2626]/[0.08] absolute top-3 left-5 select-none pointer-events-none transition-opacity duration-500 group-hover:text-[#DC2626]/[0.12]" aria-hidden="true">
                &ldquo;
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 relative">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="mt-5 text-[#374151] leading-relaxed flex-1 relative text-[15px]">
                &ldquo;{item.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3 mt-6 pt-5 border-t border-[#F3F4F6]">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#0A0A0A] to-[#374151] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-black/10">
                  {item.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-bold text-[#0A0A0A]">{item.name}</div>
                  <div className="text-xs text-[#9CA3AF]">{item.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
