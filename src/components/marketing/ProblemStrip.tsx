'use client'

import type { MarketingTranslations } from '@/lib/i18n/types'
import { useScrollReveal } from '@/lib/hooks/useScrollReveal'

interface ProblemStripProps {
  t: MarketingTranslations
}

export default function ProblemStrip({ t }: ProblemStripProps) {
  const revealRef = useScrollReveal()

  return (
    <section className="mkt-section-dark-warm mkt-grain py-20 sm:py-28 relative overflow-hidden mkt-pattern-diagonal">
      {/* Subtle red accent glow */}
      <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-[#DC2626]/[0.06] rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="mkt-section relative">
        <div ref={revealRef} className="mkt-container mkt-stagger text-center max-w-3xl mx-auto">
          {/* Main problem statement */}
          <p className="mkt-reveal text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-snug tracking-tight">
            {t.problem.line1}
          </p>

          {/* Red accent divider */}
          <div className="mkt-reveal w-16 h-1 rounded-full bg-gradient-to-r from-[#DC2626] to-[#F97316] mx-auto mt-10 mb-10" />

          {/* Solution hint — improved contrast */}
          <p className="mkt-reveal text-base sm:text-lg text-white/70 leading-relaxed max-w-2xl mx-auto">
            {t.problem.line2}
          </p>

          {/* Punch line */}
          <p className="mkt-reveal text-lg sm:text-xl font-bold mt-10">
            <span className="text-gradient">{t.problem.line3}</span>
          </p>
        </div>
      </div>
    </section>
  )
}
