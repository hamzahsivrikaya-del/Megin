import type { Metadata } from 'next'
import PricingCards from '@/components/marketing/PricingCards'
import FAQAccordion from '@/components/marketing/FAQAccordion'
import { tr } from '@/lib/i18n/tr'

export const metadata: Metadata = {
  title: 'Fiyatlandırma | Megin',
  description:
    'Kişisel antrenörler için sade ve dürüst fiyatlandırma. 5 üyeye kadar ücretsiz. Gizli ücret yok, sözleşme yok, istediğinizde iptal edin.',
  alternates: {
    languages: {
      en: '/pricing',
      tr: '/tr/pricing',
    },
  },
}

export default function TurkishPricingPage() {
  const t = tr
  return (
    <>
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

      <section className="mkt-section pb-20 bg-white">
        <div className="mkt-container">
          <PricingCards t={t} />
        </div>
      </section>

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
