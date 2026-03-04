import type { MarketingTranslations } from '@/lib/i18n/types'

interface StorySectionProps {
  t: MarketingTranslations
}

export default function StorySection({ t }: StorySectionProps) {
  return (
    <section className="mkt-gradient-bg py-16 sm:py-20">
      <div className="mkt-section">
        <div className="mkt-container">
          {/* Heading */}
          <h2 className="mkt-heading-lg text-3xl sm:text-4xl md:text-5xl text-center">
            <span className="text-[#0A0A0A] block">{t.story.heading1}</span>
            <span className="text-gradient block">{t.story.heading2}</span>
          </h2>

          {/* Quote card */}
          <div className="mt-14 max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 lg:p-10 shadow-lg shadow-black/[0.03] relative">
              {/* Decorative large quote mark */}
              <div className="absolute -top-5 left-8 sm:left-10 w-10 h-10 rounded-xl bg-gradient-to-br from-[#DC2626] to-[#F97316] flex items-center justify-center shadow-lg shadow-red-500/20">
                <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
                  <path d="M0 14V8.4C0 5.6 0.6 3.5 1.8 2.1C3.1 0.7 4.8 0 7 0V3.5C5.9 3.7 5.1 4.2 4.5 5C3.9 5.8 3.6 6.8 3.6 8H7V14H0ZM11 14V8.4C11 5.6 11.6 3.5 12.8 2.1C14.1 0.7 15.8 0 18 0V3.5C16.9 3.7 16.1 4.2 15.5 5C14.9 5.8 14.6 6.8 14.6 8H18V14H11Z" fill="white" />
                </svg>
              </div>

              <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8 mt-2">
                {/* Avatar */}
                <div className="shrink-0 mx-auto md:mx-0">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#DC2626] to-[#F97316] flex items-center justify-center text-white text-xl font-bold shadow-md shadow-red-500/15">
                    H
                  </div>
                </div>

                {/* Quote */}
                <div className="flex-1">
                  <blockquote>
                    <p
                      className="text-base sm:text-lg text-[#57534E] leading-relaxed"
                      style={{ fontFamily: 'var(--font-lora), serif', fontStyle: 'italic' }}
                    >
                      &ldquo;{t.story.quote}&rdquo;
                    </p>
                    <footer className="mt-6 flex items-center gap-3">
                      <div className="w-8 h-[2px] bg-gradient-to-r from-[#DC2626] to-[#F97316] rounded-full" />
                      <cite className="text-sm font-bold text-[#0A0A0A] not-italic">
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
