import type { Metadata } from 'next'
import PricingCards from '@/components/marketing/PricingCards'
import FAQAccordion from '@/components/marketing/FAQAccordion'
import { en } from '@/lib/i18n/en'

export const metadata: Metadata = {
  title: 'Pricing | Megin',
  description:
    'Simple, honest pricing for personal trainers. Free for up to 3 clients. No hidden fees, no contracts, cancel anytime.',
}

export default function PricingPage() {
  const t = en
  return (
    <>
      {/* Dark hero header */}
      <section className="mkt-section-dark-warm pt-32 sm:pt-40 pb-16 sm:pb-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(220,38,38,0.08),transparent)] pointer-events-none" />
        <div className="mkt-container relative">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-[#DC2626] mb-4">Pricing</span>
          <h1 className="mkt-heading-xl text-[clamp(2rem,6vw,4rem)] leading-[0.95] text-white">
            {t.pricing.title.toUpperCase()}
          </h1>
          <p className="text-white/60 mt-4 max-w-2xl mx-auto leading-relaxed">
            {t.pricing.subtitle}
          </p>
          <div className="w-16 h-1 rounded-full bg-gradient-to-r from-[#DC2626] to-[#F97316] mx-auto mt-6" />
        </div>
      </section>

      {/* Pricing cards */}
      <section className="mkt-section py-16 sm:py-20 bg-[#FAFAFA]">
        <div className="mkt-container">
          <PricingCards t={t} />
        </div>
      </section>

      {/* FAQ */}
      <section className="mkt-section py-20 sm:py-28 bg-white">
        <div className="mkt-container max-w-3xl mx-auto">
          <h2 className="mkt-heading-lg text-2xl sm:text-3xl md:text-4xl text-[#0A0A0A] text-center mb-4">
            {t.pricing.faq.title}
          </h2>
          <div className="w-16 h-1 rounded-full bg-gradient-to-r from-[#DC2626] to-[#F97316] mx-auto mb-12" />
          <FAQAccordion items={t.pricing.faq.items} />
        </div>
      </section>
    </>
  )
}
