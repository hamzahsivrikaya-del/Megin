import Link from 'next/link'
import type { Metadata } from 'next'
import { Globe, ArrowRight, Check, Camera, BarChart2, Award, Smartphone, Bell, Image, Star } from 'lucide-react'
import { tr } from '@/lib/i18n/tr'
import PricingCards from '@/components/marketing/PricingCards'
import FAQAccordion from '@/components/marketing/FAQAccordion'
import CTASection from '@/components/marketing/CTASection'

const segment = tr.useCases.segments[2]

const FEATURE_ICONS = [Camera, BarChart2, Award, Smartphone, Bell, Image]

export const metadata: Metadata = {
  title: `${segment.label} | Megin`,
  description: segment.heroDescription,
  alternates: {
    languages: {
      en: '/use-cases/online-coaches',
      tr: '/tr/use-cases/online-coaches',
    },
  },
}

export default function TurkishOnlineCoachesPage() {
  return (
    <>
      {/* 1. Hero */}
      <section className="mkt-section pt-32 pb-20 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#DC2626]/[0.04] rounded-full blur-[120px] -translate-y-1/3 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#F97316]/[0.05] rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />
        <div className="mkt-container max-w-3xl mx-auto text-center relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#DC2626] to-[#F97316] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/10">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <p className="text-xs font-bold tracking-widest uppercase text-[#DC2626] mb-3">{segment.label}</p>
          <h1 className="heading-display-xl text-4xl sm:text-5xl md:text-6xl text-[#0A0A0A]">
            {segment.title}
          </h1>
          <p className="text-[#6B7280] mt-4 text-lg leading-relaxed max-w-2xl mx-auto">
            {segment.heroDescription}
          </p>
          <div className="mt-8">
            <Link href="/signup" className="cta-gradient">
              Ücretsiz Başla <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Problem Strip */}
      <section className="mkt-section bg-[#0A0A0A] py-8 sm:py-10">
        <div className="mkt-container">
          <p className="text-center text-lg sm:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed italic">
            &ldquo;{segment.problemStrip}&rdquo;
          </p>
        </div>
      </section>

      {/* 3. Features Grid — unique icons */}
      <section className="mkt-section py-20 bg-[#FAFAFA]">
        <div className="mkt-container">
          <h2 className="heading-display text-2xl sm:text-3xl text-[#0A0A0A] text-center mb-12">Temel Özellikler</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 max-w-5xl mx-auto">
            {segment.extendedFeatures.map((f, i) => {
              const Icon = FEATURE_ICONS[i] ?? Check
              return (
                <div key={f.title} className="bg-white rounded-xl border border-[#E5E7EB] p-5 sm:p-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#DC2626] to-[#F97316] flex items-center justify-center mb-4 shadow-md shadow-red-500/10">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-[#0A0A0A]">{f.title}</h3>
                  <p className="text-sm text-[#6B7280] mt-1 leading-relaxed">{f.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 4. Testimonial with avatar + stars */}
      <section className="mkt-section py-16 bg-white">
        <div className="mkt-container max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#DC2626] to-[#F97316] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-red-500/10">
            <span className="text-lg font-bold text-white">{segment.testimonialName.split(' ').map((n: string) => n[0]).join('')}</span>
          </div>
          <div className="flex items-center justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-xl sm:text-2xl text-[#0A0A0A] leading-relaxed italic">
            &ldquo;{segment.testimonialQuote}&rdquo;
          </p>
          <div className="mt-6">
            <p className="font-bold text-[#0A0A0A]">{segment.testimonialName}</p>
            <p className="text-sm text-[#6B7280]">{segment.testimonialRole}</p>
          </div>
        </div>
      </section>

      {/* 5. Comparison — responsive */}
      <section className="mkt-section py-20 bg-[#FAFAFA]">
        <div className="mkt-container max-w-3xl mx-auto">
          <h2 className="heading-display text-2xl sm:text-3xl text-[#0A0A0A] text-center mb-10">Megin Öncesi &amp; Sonrası</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#6B7280] mb-4">Megin Öncesi</p>
              <div className="space-y-3">
                {segment.comparisonBefore.map((item: string) => (
                  <div key={item} className="flex items-start gap-3 bg-white rounded-lg border border-[#E5E7EB] p-3 sm:p-4">
                    <span className="mt-0.5 text-red-400 flex-shrink-0">&#10007;</span>
                    <span className="text-sm text-[#374151]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#DC2626] mb-4">Megin Sonrası</p>
              <div className="space-y-3">
                {segment.comparisonAfter.map((item: string) => (
                  <div key={item} className="flex items-start gap-3 bg-white rounded-lg border border-[#E5E7EB] p-3 sm:p-4">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#374151]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Pricing */}
      <section className="mkt-section py-20 bg-white">
        <div className="mkt-container">
          <h2 className="heading-display text-2xl sm:text-3xl text-[#0A0A0A] text-center mb-3">{tr.pricing.title}</h2>
          <p className="text-[#6B7280] text-center mb-10">{tr.pricing.subtitle}</p>
          <PricingCards t={tr} />
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="mkt-section py-20 bg-[#FAFAFA]">
        <div className="mkt-container max-w-3xl mx-auto">
          <h2 className="heading-display text-2xl sm:text-3xl text-[#0A0A0A] text-center mb-10">Sık Sorulan Sorular</h2>
          <FAQAccordion items={segment.faqItems} />
        </div>
      </section>

      {/* 8. CTA */}
      <CTASection t={tr} />
    </>
  )
}
