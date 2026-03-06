'use client'

import type { MarketingTranslations } from '@/lib/i18n/types'
import { useScrollReveal } from '@/lib/hooks/useScrollReveal'

interface StorySectionProps {
  t: MarketingTranslations
}

export default function StorySection({ t }: StorySectionProps) {
  const revealRef = useScrollReveal()
  return (
    <section className="mkt-section-dark-warm mkt-grain py-24 sm:py-32 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-[#F97316]/[0.04] rounded-full blur-[150px] -translate-y-1/2 pointer-events-none" />

      <div className="mkt-section relative">
        <div ref={revealRef} className="mkt-container mkt-stagger">
          {/* Heading */}
          <h2 className="mkt-reveal mkt-heading-lg text-3xl sm:text-4xl md:text-5xl text-center">
            <span className="text-white block">{t.story.heading1}</span>
            <span className="text-gradient block">{t.story.heading2}</span>
          </h2>

          {/* Quote card */}
          <div className="mkt-reveal mt-14 sm:mt-16 max-w-3xl mx-auto">
            <div className="relative bg-white/[0.04] backdrop-blur-sm rounded-2xl p-8 sm:p-10 lg:p-12 border border-white/[0.08]">
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#DC2626]/50 to-transparent" />

              <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8">
                {/* Avatar */}
                <div className="shrink-0 mx-auto md:mx-0">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#DC2626] to-[#F97316] flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-red-500/20">
                    H
                  </div>
                </div>

                {/* Quote */}
                <div className="flex-1">
                  <blockquote>
                    <p
                      className="text-base sm:text-lg text-white/70 leading-relaxed"
                      style={{ fontFamily: 'var(--font-lora), serif', fontStyle: 'italic' }}
                    >
                      &ldquo;{t.story.quote}&rdquo;
                    </p>
                    <footer className="mt-6 flex items-center gap-3">
                      <div className="w-10 h-[2px] bg-gradient-to-r from-[#DC2626] to-[#F97316] rounded-full" />
                      <cite className="text-sm font-bold text-white not-italic">
                        {t.story.author}
                      </cite>
                    </footer>
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
