import Link from 'next/link'
import type { MarketingTranslations } from '@/lib/i18n/types'

interface CTASectionProps {
  t: MarketingTranslations
}

export default function CTASection({ t }: CTASectionProps) {
  return (
    <section className="mkt-section py-20 sm:py-28 bg-white">
      <div className="mkt-container text-center">
        <h2 className="mkt-heading-lg text-3xl sm:text-4xl md:text-5xl text-[#0A0A0A]">
          {t.cta.title1}
          <br />
          <span className="text-[#FF2D2D]">{t.cta.title2}</span>
        </h2>

        <div className="mt-8">
          <Link href="/signup" className="mkt-cta-primary rounded-none">
            {t.cta.button}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>

        <p className="text-sm text-[#6B7280] mt-4">{t.cta.subtext}</p>
      </div>
    </section>
  )
}
