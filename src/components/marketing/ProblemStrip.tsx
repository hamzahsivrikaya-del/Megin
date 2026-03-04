import type { MarketingTranslations } from '@/lib/i18n/types'

interface ProblemStripProps {
  t: MarketingTranslations
}

export default function ProblemStrip({ t }: ProblemStripProps) {
  return (
    <section className="mkt-section-dark-warm py-16 sm:py-20 relative overflow-hidden mkt-pattern-diagonal">
      <div className="mkt-section relative">
        <div className="mkt-container text-center max-w-3xl mx-auto">
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">
            {t.problem.line1}
          </p>
          <p className="text-base sm:text-lg text-white/50 mt-8 leading-relaxed">
            {t.problem.line2}
          </p>
          <p className="text-lg sm:text-xl font-bold mt-8">
            <span className="text-gradient">{t.problem.line3}</span>
          </p>
        </div>
      </div>
    </section>
  )
}
