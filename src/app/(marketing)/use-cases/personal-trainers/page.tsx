import Link from 'next/link'
import type { Metadata } from 'next'
import { User, ArrowRight, Check, Package, Dumbbell, Ruler, BellRing, Utensils, FileBarChart, Star } from 'lucide-react'
import { en } from '@/lib/i18n/en'
import type { MarketingTranslations } from '@/lib/i18n/types'
import PricingCards from '@/components/marketing/PricingCards'
import FAQAccordion from '@/components/marketing/FAQAccordion'
import CTASection from '@/components/marketing/CTASection'

const segment = en.useCases.segments[0]
const t: MarketingTranslations = en

const FEATURE_ICONS = [Package, Dumbbell, Ruler, BellRing, Utensils, FileBarChart]

export const metadata: Metadata = {
  title: `${segment.label} | Megin`,
  description: segment.heroDescription,
  alternates: {
    languages: {
      en: '/use-cases/personal-trainers',
      tr: '/tr/use-cases/personal-trainers',
    },
  },
}

export default function PersonalTrainersPage() {
  return (
    <>
      {/* 1. Hero */}
      <section className="mkt-section-dark-warm mkt-grain pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(220,38,38,0.15),transparent)] pointer-events-none" />
        <div className="mkt-container max-w-3xl mx-auto text-center relative">
          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8 text-white" />
          </div>
          <p className="text-xs font-bold tracking-widest uppercase text-[#DC2626] mb-3">{segment.label}</p>
          <h1 className="heading-display-xl text-4xl sm:text-5xl md:text-6xl text-white">
            {segment.title}
          </h1>
          <p className="text-white/70 mt-4 text-lg leading-relaxed max-w-2xl mx-auto">
            {segment.heroDescription}
          </p>
          <div className="mt-8">
            <Link href="/signup" className="cta-gradient cta-glow">
              GET STARTED FREE <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Problem Strip */}
      <section className="mkt-section mkt-grain bg-[#0A0A0A] py-8 sm:py-10">
        <div className="mkt-container">
          <p className="text-center text-lg sm:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed italic">
            &ldquo;{segment.problemStrip}&rdquo;
          </p>
        </div>
      </section>

      {/* 3. Features Grid — unique icons per feature */}
      <section className="mkt-section py-20 bg-[#FAFAFA]">
        <div className="mkt-container">
          <h2 className="heading-display text-2xl sm:text-3xl text-[#0A0A0A] text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 max-w-5xl mx-auto">
            {segment.extendedFeatures.map((f, i) => {
              const Icon = FEATURE_ICONS[i] ?? Check
              return (
                <div key={f.title} className="bg-white rounded-xl border border-[#E5E7EB] p-5 sm:p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/[0.06] hover:border-gray-200">
                  <div className="w-10 h-10 rounded-xl bg-[#0A0A0A] flex items-center justify-center mb-4">
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
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0A0A0A] to-[#374151] flex items-center justify-center mx-auto mb-5">
            <span className="text-lg font-bold text-white">
              {segment.testimonialName.split(' ').map((n: string) => n[0]).join('')}
            </span>
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

      {/* 5. Comparison — responsive grid */}
      <section className="mkt-section py-20 bg-[#FAFAFA]">
        <div className="mkt-container max-w-3xl mx-auto">
          <h2 className="heading-display text-2xl sm:text-3xl text-[#0A0A0A] text-center mb-10">Before &amp; After Megin</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#6B7280] mb-4">Before Megin</p>
              <div className="space-y-3">
                {segment.comparisonBefore.map((item: string) => (
                  <div key={item} className="flex items-start gap-3 bg-white rounded-lg border border-[#E5E7EB] p-4 transition-all duration-300 hover:shadow-md">
                    <span className="mt-0.5 text-red-400 flex-shrink-0">&#10007;</span>
                    <span className="text-sm text-[#374151]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#DC2626] mb-4">After Megin</p>
              <div className="space-y-3">
                {segment.comparisonAfter.map((item: string) => (
                  <div key={item} className="flex items-start gap-3 bg-white rounded-lg border border-[#E5E7EB] p-4 transition-all duration-300 hover:shadow-md">
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
          <h2 className="heading-display text-2xl sm:text-3xl text-[#0A0A0A] text-center mb-3">{en.pricing.title}</h2>
          <p className="text-[#6B7280] text-center mb-10">{en.pricing.subtitle}</p>
          <PricingCards t={t} />
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="mkt-section py-20 bg-[#FAFAFA]">
        <div className="mkt-container max-w-3xl mx-auto">
          <h2 className="heading-display text-2xl sm:text-3xl text-[#0A0A0A] text-center mb-10">Frequently Asked Questions</h2>
          <FAQAccordion items={segment.faqItems} />
        </div>
      </section>

      {/* 8. CTA */}
      <CTASection t={t} />
    </>
  )
}
