import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { MarketingTranslations } from '@/lib/i18n/types'

interface CTASectionProps {
  t: MarketingTranslations
}

export default function CTASection({ t }: CTASectionProps) {
  return (
    <section className="mkt-section-dark-warm py-24 sm:py-32 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-[#DC2626]/[0.06] rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="mkt-container text-center relative">
        {/* Bigger, bolder heading */}
        <h2 className="mkt-heading-xl text-[clamp(2rem,6vw,4.5rem)] leading-[0.95] text-white">
          {t.cta.title1}
          <br />
          <span className="text-gradient">{t.cta.title2}</span>
        </h2>

        <div className="mt-12">
          <Link href="/signup" className="mkt-cta-gradient mkt-cta-glow text-base px-10 py-5 rounded-2xl">
            {t.cta.button}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <p className="text-sm text-white/40 mt-6">{t.cta.subtext}</p>
      </div>
    </section>
  )
}
