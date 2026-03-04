import type { Metadata } from 'next'
import PricingCards from '@/components/marketing/PricingCards'
import FAQAccordion from '@/components/marketing/FAQAccordion'
import { en } from '@/lib/i18n/en'

export const metadata: Metadata = {
  title: 'Pricing | Megin',
  description:
    'Simple, honest pricing for personal trainers. Free for up to 5 clients. No hidden fees, no contracts, cancel anytime.',
}

export default function PricingPage() {
  const t = en
  return (
    <>
      {/* Page header */}
      <section className="mkt-section pt-32 pb-16 text-center bg-white">
        <div className="mkt-container">
          <h1 className="mkt-heading-xl text-4xl sm:text-5xl md:text-6xl text-[#0A0A0A]">
            {t.pricing.title.toUpperCase()}
          </h1>
          <p className="text-[#6B7280] mt-4 max-w-2xl mx-auto leading-relaxed">
            {t.pricing.subtitle}
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="mkt-section pb-20 bg-white">
        <div className="mkt-container">
          <PricingCards t={t} />
        </div>
      </section>

      {/* FAQ */}
      <section className="mkt-section py-20 mkt-gradient-bg">
        <div className="mkt-container max-w-3xl mx-auto">
          <h2 className="mkt-heading-lg text-2xl sm:text-3xl text-[#0A0A0A] text-center mb-12">
            {t.pricing.faq.title}
          </h2>
          <FAQAccordion items={t.pricing.faq.items} />
        </div>
      </section>
    </>
  )
}
