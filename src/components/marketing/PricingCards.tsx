'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { MarketingTranslations } from '@/lib/i18n/types'

interface PricingCardsProps {
  t: MarketingTranslations
}

function CheckIcon({ dark }: { dark?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="flex-shrink-0 mt-0.5">
      <circle cx="8" cy="8" r="8" fill={dark ? 'rgba(255,255,255,0.12)' : 'rgba(34,197,94,0.12)'} />
      <path d="M4.5 8.5L6.5 10.5L11 5.5" stroke={dark ? '#FFFFFF' : '#22C55E'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function PricingCards({ t }: PricingCardsProps) {
  const [isAnnual, setIsAnnual] = useState(true)
  const { pricing } = t

  const ctaLabels = [pricing.startFree, pricing.startTrial, pricing.contactUs]
  const ctaHrefs = ['/signup', '/signup', '/contact']

  return (
    <div>
      {/* Toggle */}
      <div className="flex justify-center items-center gap-3 mb-12">
        <div className="inline-flex items-center bg-white border border-[#E5E7EB] rounded-full p-1 shadow-sm" role="group" aria-label="Billing period">
          <button
            type="button"
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer ${!isAnnual ? 'bg-[#0A0A0A] text-white shadow-md' : 'text-[#6B7280] hover:text-[#0A0A0A]'}`}
            onClick={() => setIsAnnual(false)}
            aria-pressed={!isAnnual}
          >
            {pricing.monthly}
          </button>
          <button
            type="button"
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer ${isAnnual ? 'bg-[#0A0A0A] text-white shadow-md' : 'text-[#6B7280] hover:text-[#0A0A0A]'}`}
            onClick={() => setIsAnnual(true)}
            aria-pressed={isAnnual}
          >
            {pricing.annual}
          </button>
        </div>
        {isAnnual && (
          <span className="text-xs font-bold text-[#059669] bg-[#059669]/[0.08] border border-[#059669]/20 px-3 py-1.5 rounded-full animate-fade-in">
            {pricing.savePercent}
          </span>
        )}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 items-start">
        {pricing.tiers.map((tier, index) => {
          const isHighlighted = index === 1
          const isDark = index === 2

          const monthlyPrice = tier.monthlyPrice
          const annualPerMonth = tier.annualPrice === 0 ? 0 : Math.round(tier.annualPrice / 12)
          const displayPrice = isAnnual ? annualPerMonth : monthlyPrice
          const priceLabel = displayPrice === 0 ? '$0' : `$${displayPrice}`

          const ctaLabel = ctaLabels[index]
          const ctaHref = ctaHrefs[index]

          return (
            <div
              key={tier.badge}
              className={[
                'rounded-2xl border p-6 sm:p-8 lg:p-10 relative flex flex-col transition-all duration-500 hover:-translate-y-2',
                isHighlighted
                  ? 'border-[#DC2626]/30 bg-white shadow-2xl shadow-red-500/[0.06] scale-[1.03] z-10'
                  : isDark
                    ? 'border-white/10 bg-[#0A0A0A] hover:shadow-2xl hover:shadow-black/20'
                    : 'border-[#E5E7EB] bg-white hover:shadow-2xl hover:shadow-black/[0.06] hover:border-gray-200',
              ].join(' ')}
            >
              {/* Most Popular badge */}
              {isHighlighted && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#0A0A0A] text-white text-xs font-bold px-5 py-1.5 rounded-full uppercase tracking-wider whitespace-nowrap shadow-lg">
                  {pricing.mostPopular}
                </span>
              )}

              {/* Tier badge */}
              <span className={[
                'inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full w-fit',
                isDark ? 'bg-white/10 text-white/70' : 'bg-[#F5F5F5] text-[#6B7280]',
              ].join(' ')}>
                {tier.badge}
              </span>

              {/* Price */}
              <div className="mt-5">
                {isAnnual && monthlyPrice > 0 && (
                  <div className="mb-1">
                    <span className={`text-lg line-through ${isDark ? 'text-white/30' : 'text-[#D1D5DB]'}`}>
                      ${monthlyPrice}
                    </span>
                  </div>
                )}
                <div className="flex items-end gap-1">
                  <span className={`font-display text-5xl sm:text-6xl font-bold leading-none tracking-tight ${isDark ? 'text-white' : 'text-[#0A0A0A]'}`}>
                    {priceLabel}
                  </span>
                  <span className={`text-sm mb-2 ${isDark ? 'text-white/50' : 'text-[#9CA3AF]'}`}>
                    {pricing.perMonth}
                  </span>
                </div>
              </div>

              {/* Annual total */}
              {isAnnual && tier.annualPrice > 0 && (
                <p className={`text-xs mt-1 ${isDark ? 'text-white/40' : 'text-[#9CA3AF]'}`}>
                  ${tier.annualPrice}{pricing.perYear}
                </p>
              )}

              {/* Client limit */}
              <p className={`mt-3 text-sm font-medium ${isDark ? 'text-white/60' : 'text-[#6B7280]'}`}>
                {tier.limit}
              </p>

              {/* Divider */}
              <hr className={`my-6 ${isDark ? 'border-white/10' : 'border-[#F3F4F6]'}`} />

              {/* Features */}
              <ul className="space-y-3.5 flex-1" aria-label={`${tier.badge} plan features`}>
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckIcon dark={isDark} />
                    <span className={`text-sm ${isDark ? 'text-white/80' : 'text-[#374151]'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="mt-8">
                <Link
                  href={ctaHref}
                  className={[
                    'w-full justify-center',
                    isHighlighted
                      ? 'mkt-cta-gradient mkt-cta-glow'
                      : isDark
                        ? 'mkt-cta-primary'
                        : 'mkt-cta-ghost',
                  ].join(' ')}
                >
                  {ctaLabel}
                </Link>
              </div>

              {/* Trial note */}
              {index === 1 && (
                <p className="mt-3 text-center text-xs text-[#9CA3AF]">{pricing.trialNote}</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Cancel anytime */}
      <p className="mt-10 text-center text-sm text-[#9CA3AF]">{pricing.cancelAnytime}</p>
    </div>
  )
}
