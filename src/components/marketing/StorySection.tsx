import type { MarketingTranslations } from '@/lib/i18n/types'

interface StorySectionProps {
  t: MarketingTranslations
}

export default function StorySection({ t }: StorySectionProps) {
  return (
    <section className="py-20 sm:py-28 bg-white relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,rgba(249,115,22,0.03),transparent)] pointer-events-none" />

      <div className="mkt-section relative">
        <div className="mkt-container">
          {/* Heading */}
          <h2 className="mkt-heading-lg text-3xl sm:text-4xl md:text-5xl text-center">
            <span className="text-[#0A0A0A] block">{t.story.heading1}</span>
            <span className="text-gradient block">{t.story.heading2}</span>
          </h2>

          {/* Quote card */}
          <div className="mt-14 sm:mt-16 max-w-3xl mx-auto">
            <div className="relative bg-[#FAFAFA] rounded-2xl p-8 sm:p-10 lg:p-12 border border-[#E5E7EB]">
              {/* Top accent line */}
              <div className="absolute top-0 left-8 right-8 sm:left-10 sm:right-10 h-0.5 bg-gradient-to-r from-transparent via-[#DC2626]/30 to-transparent" />

              <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8">
                {/* Avatar */}
                <div className="shrink-0 mx-auto md:mx-0">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0A0A0A] to-[#374151] flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-black/10">
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
                      <div className="w-10 h-[2px] bg-gradient-to-r from-[#DC2626] to-[#F97316] rounded-full" />
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
