'use client'

import Link from 'next/link'
import type { MarketingTranslations } from '@/lib/i18n/types'

interface HeroSectionProps {
  t: MarketingTranslations
}

export default function HeroSection({ t }: HeroSectionProps) {
  return (
    <section className="mkt-section pt-32 pb-20 bg-white">
      <div className="mkt-container text-center">
        {/* Main heading */}
        <h1 className="mkt-heading-xl text-5xl sm:text-6xl md:text-7xl lg:text-8xl animate-fade-up">
          <span className="text-[#0A0A0A] block">{t.hero.title1}</span>
          <span className="text-[#FF2D2D] block">{t.hero.title2}</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-[#6B7280] max-w-2xl mx-auto mt-6 leading-relaxed animate-fade-up delay-200">
          {t.hero.subtitle}
        </p>

        {/* CTA Button */}
        <div className="mt-8 animate-fade-up delay-300">
          <Link href="/signup" className="mkt-cta-primary rounded-none">
            {t.hero.cta}
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

        {/* Dashboard mockup */}
        <div className="mt-16 max-w-4xl mx-auto animate-fade-up delay-400">
          <div className="rounded-xl border border-[#E5E7EB] shadow-2xl overflow-hidden">
            {/* Browser top bar */}
            <div className="bg-[#F5F5F5] border-b border-[#E5E7EB] px-4 py-3 flex items-center gap-3">
              {/* Traffic lights */}
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#FF5F57]" aria-hidden="true" />
                <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" aria-hidden="true" />
                <div className="w-3 h-3 rounded-full bg-[#28C840]" aria-hidden="true" />
              </div>
              {/* URL bar */}
              <div className="flex-1 max-w-sm mx-auto">
                <div className="bg-white border border-[#E5E7EB] rounded-md px-3 py-1 text-xs text-[#9CA3AF] text-center">
                  app.megin.io/dashboard
                </div>
              </div>
            </div>
            {/* Content area */}
            <div className="aspect-video bg-gradient-to-br from-[#F5F5F5] to-[#E5E7EB] flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-[#FF2D2D]/10 flex items-center justify-center mx-auto mb-3">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <rect x="3" y="3" width="7" height="7" rx="1" fill="#FF2D2D" opacity="0.7" />
                    <rect x="14" y="3" width="7" height="7" rx="1" fill="#FF2D2D" opacity="0.4" />
                    <rect x="3" y="14" width="7" height="7" rx="1" fill="#FF2D2D" opacity="0.4" />
                    <rect x="14" y="14" width="7" height="7" rx="1" fill="#FF2D2D" opacity="0.2" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-[#9CA3AF]">Dashboard Preview</p>
                <p className="text-xs text-[#D1D5DB] mt-1">Coming soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust signals */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm text-[#6B7280] animate-fade-up delay-500">
          <span className="flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M8 1a3 3 0 0 0-3 3v1H3.5A1.5 1.5 0 0 0 2 6.5v7A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 12.5 5H11V4a3 3 0 0 0-3-3zm-1.5 3a1.5 1.5 0 0 1 3 0v1h-3V4z"
                fill="currentColor"
              />
            </svg>
            {t.hero.trustNoCreditCard}
          </span>
          <span className="flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="6" cy="5" r="2.5" fill="currentColor" opacity="0.7" />
              <circle cx="11" cy="5" r="2" fill="currentColor" opacity="0.5" />
              <path
                d="M1 13c0-2.76 2.24-5 5-5s5 2.24 5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M11 8c1.66 0 3 1.34 3 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
                opacity="0.6"
              />
            </svg>
            {t.hero.trustFreeClients}
          </span>
        </div>
      </div>
    </section>
  )
}
