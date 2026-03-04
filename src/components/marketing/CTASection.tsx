import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { MarketingTranslations } from '@/lib/i18n/types'

interface CTASectionProps {
  t: MarketingTranslations
}

export default function CTASection({ t }: CTASectionProps) {
  return (
    <section className="mkt-section-dark-warm py-16 sm:py-20 relative overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-[#DC2626]/[0.08] rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-[#F97316]/[0.06] rounded-full blur-[80px] translate-x-1/4 translate-y-1/4 pointer-events-none" />

      <div className="mkt-container text-center relative">
        <h2 className="mkt-heading-lg text-3xl sm:text-4xl md:text-5xl text-white">
          {t.cta.title1}
          <br />
          <span className="text-gradient">{t.cta.title2}</span>
        </h2>

        <div className="mt-10">
          <Link href="/signup" className="mkt-cta-gradient">
            {t.cta.button}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="text-sm text-white/40 mt-5">{t.cta.subtext}</p>
      </div>
    </section>
  )
}
