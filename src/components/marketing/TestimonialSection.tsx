'use client'

import { Star, Quote } from 'lucide-react'
import { useScrollReveal } from '@/lib/hooks/useScrollReveal'
import type { MarketingTranslations } from '@/lib/i18n/types'

interface TestimonialSectionProps {
  t: MarketingTranslations
}

export default function TestimonialSection({ t }: TestimonialSectionProps) {
  const revealRef = useScrollReveal()

  return (
    <section className="mkt-section py-20 sm:py-28 bg-white relative overflow-hidden">
      {/* Subtle radial */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_0%,rgba(220,38,38,0.03),transparent)] pointer-events-none" />

      <div className="mkt-container relative">
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
          {t.testimonials.items.map((item, index) => (
            <div
              key={item.name}
              className={`mkt-reveal group relative rounded-2xl p-6 sm:p-8 transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 flex flex-col overflow-hidden ${
                index === 1
                  ? 'bg-[#0A0A0A] text-white border border-white/10 hover:shadow-black/20'
                  : 'bg-white text-[#0A0A0A] border border-[#E5E7EB] hover:shadow-black/[0.06] hover:border-gray-200'
              }`}
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 h-0.5 w-0 bg-gradient-to-r from-[#DC2626] to-[#F97316] transition-all duration-500 group-hover:w-full" />

              {/* Large decorative quote icon */}
              <Quote className={`w-8 h-8 mb-4 ${index === 1 ? 'text-[#DC2626]/40' : 'text-[#DC2626]/20'}`} />

              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className={`mt-4 leading-relaxed flex-1 text-[15px] ${
                index === 1 ? 'text-white/80' : 'text-[#374151]'
              }`}>
                &ldquo;{item.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className={`flex items-center gap-3 mt-6 pt-5 border-t ${
                index === 1 ? 'border-white/10' : 'border-[#F3F4F6]'
              }`}>
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shadow-md ${
                  index === 1
                    ? 'bg-gradient-to-br from-[#DC2626] to-[#F97316] text-white shadow-red-500/20'
                    : 'bg-gradient-to-br from-[#0A0A0A] to-[#374151] text-white shadow-black/10'
                }`}>
                  {item.name.charAt(0)}
                </div>
                <div>
                  <div className={`text-sm font-bold ${index === 1 ? 'text-white' : 'text-[#0A0A0A]'}`}>{item.name}</div>
                  <div className={`text-xs ${index === 1 ? 'text-white/50' : 'text-[#9CA3AF]'}`}>{item.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
