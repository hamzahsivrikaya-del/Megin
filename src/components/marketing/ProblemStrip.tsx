import type { MarketingTranslations } from '@/lib/i18n/types'

interface ProblemStripProps {
  t: MarketingTranslations
}

export default function ProblemStrip({ t }: ProblemStripProps) {
  return (
    <section className="mkt-section-dark py-20 sm:py-28">
      <div className="mkt-section">
        <div className="mkt-container text-center max-w-3xl mx-auto">
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">
            {t.problem.line1}
          </p>
          <p className="text-base sm:text-lg text-white/60 mt-6 leading-relaxed">
            {t.problem.line2}
          </p>
          <p className="text-lg sm:text-xl text-[#FF2D2D] font-bold mt-6">
            {t.problem.line3}
          </p>
        </div>
      </div>
    </section>
  )
}
