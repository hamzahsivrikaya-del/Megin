import type { MarketingTranslations } from '@/lib/i18n/types'

interface StorySectionProps {
  t: MarketingTranslations
}

export default function StorySection({ t }: StorySectionProps) {
  return (
    <section className="mkt-section py-20 sm:py-28 bg-[#F5F5F5]">
      <div className="mkt-container">
        {/* Heading */}
        <h2 className="mkt-heading-lg text-3xl sm:text-4xl md:text-5xl text-center">
          <span className="text-[#0A0A0A] block">{t.story.heading1}</span>
          <span className="text-[#FF2D2D] block">{t.story.heading2}</span>
        </h2>

        {/* Quote block */}
        <div className="mt-12 max-w-2xl mx-auto">
          <blockquote className="border-l-4 border-[#FF2D2D] pl-6 sm:pl-8">
            <p
              className="text-base sm:text-lg text-[#6B7280] leading-relaxed"
              style={{ fontFamily: 'var(--font-lora), serif', fontStyle: 'italic' }}
            >
              &ldquo;{t.story.quote}&rdquo;
            </p>
            <footer className="mt-4">
              <cite
                className="text-sm font-bold text-[#0A0A0A] not-italic"
                style={{ fontStyle: 'normal' }}
              >
                {t.story.author}
              </cite>
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  )
}
