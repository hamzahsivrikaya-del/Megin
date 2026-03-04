'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { MarketingTranslations } from '@/lib/i18n/types'

interface PricingCardsProps {
  t: MarketingTranslations
}

function CheckIcon({ dark }: { dark?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="flex-shrink-0 mt-0.5"
    >
      <circle
        cx="8"
        cy="8"
        r="8"
        fill={dark ? 'rgba(255,255,255,0.12)' : 'rgba(34,197,94,0.12)'}
      />
      <path
        d="M4.5 8.5L6.5 10.5L11 5.5"
        stroke={dark ? '#FFFFFF' : '#22C55E'}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
      <div className="flex justify-center items-center gap-3 mb-10">
        <div className="mkt-pricing-toggle" role="group" aria-label="Billing period">
          <button
            type="button"
            className={!isAnnual ? 'active' : ''}
            onClick={() => setIsAnnual(false)}
            aria-pressed={!isAnnual}
          >
            {pricing.monthly}
          </button>
          <button
            type="button"
            className={isAnnual ? 'active' : ''}
            onClick={() => setIsAnnual(true)}
            aria-pressed={isAnnual}
          >
            {pricing.annual}
          </button>
        </div>
        {isAnnual && (
          <span className="mkt-save-badge text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
            {pricing.savePercent}
          </span>
        )}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {pricing.tiers.map((tier, index) => {
          const isHighlighted = index === 1
          const isDark = index === 2

          const monthlyPrice = tier.monthlyPrice
          const annualPerMonth =
            tier.annualPrice === 0 ? 0 : Math.round(tier.annualPrice / 12)
          const displayPrice = isAnnual ? annualPerMonth : monthlyPrice

          const priceLabel = displayPrice === 0 ? '$0' : `$${displayPrice}`

          const ctaLabel = ctaLabels[index]
          const ctaHref = ctaHrefs[index]

          let ctaClass: string
          if (isHighlighted) {
            ctaClass = 'mkt-cta-gradient w-full justify-center'
          } else if (isDark) {
            ctaClass = 'mkt-cta-primary w-full justify-center'
          } else {
            ctaClass = 'mkt-cta-ghost w-full justify-center'
          }

          return (
            <div
              key={tier.badge}
              className={[
                'rounded-2xl border p-6 sm:p-8 lg:p-10 relative flex flex-col',
                isHighlighted
                  ? 'border-[#DC2626] bg-white gradient-border scale-[1.02]'
                  : isDark
                    ? 'border-[#E5E7EB] bg-[#0A0A0A]'
                    : 'border-[#E5E7EB] bg-white',
              ].join(' ')}
            >
              {/* Most Popular badge */}
              {isHighlighted && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#DC2626] to-[#F97316] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                  {pricing.mostPopular}
                </span>
              )}

              {/* Tier badge */}
              <span
                className={[
                  'inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full',
                  isDark
                    ? 'bg-white/10 text-white/70'
                    : 'bg-[#F5F5F5] text-[#6B7280]',
                ].join(' ')}
              >
                {tier.badge}
              </span>

              {/* Price */}
              <div className="mt-4">
                {/* Strikethrough monthly price when annual is selected */}
                {isAnnual && monthlyPrice > 0 && (
                  <div className="mb-1">
                    <span
                      className={`text-lg line-through ${
                        isDark ? 'text-white/30' : 'text-[#9CA3AF]'
                      }`}
                    >
                      ${monthlyPrice}
                    </span>
                  </div>
                )}
                <div className="flex items-end gap-1">
                  <span
                    className={`font-display text-5xl font-bold leading-none ${
                      isDark ? 'text-white' : 'text-[#0A0A0A]'
                    }`}
                  >
                    {priceLabel}
                  </span>
                  <span
                    className={`text-sm mb-1.5 ${
                      isDark ? 'text-white/50' : 'text-[#6B7280]'
                    }`}
                  >
                    {pricing.perMonth}
                  </span>
                </div>
              </div>

              {/* Annual total hint */}
              {isAnnual && tier.annualPrice > 0 && (
                <p
                  className={`text-xs mt-1 ${
                    isDark ? 'text-white/40' : 'text-[#9CA3AF]'
                  }`}
                >
                  ${tier.annualPrice}{pricing.perYear}
                </p>
              )}

              {/* Client limit */}
              <p
                className={`mt-2 text-sm font-medium ${
                  isDark ? 'text-white/60' : 'text-[#6B7280]'
                }`}
              >
                {tier.limit}
              </p>

              {/* Divider */}
              <hr
                className={`my-6 ${
                  isDark ? 'border-white/10' : 'border-[#E5E7EB]'
                }`}
              />

              {/* Features */}
              <ul className="space-y-3 flex-1" aria-label={`${tier.badge} plan features`}>
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckIcon dark={isDark} />
                    <span
                      className={`text-sm ${
                        isDark ? 'text-white/80' : 'text-[#0A0A0A]'
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="mt-8">
                <Link href={ctaHref} className={ctaClass}>
                  {ctaLabel}
                </Link>
              </div>

              {/* Trial note for Pro tier */}
              {index === 1 && (
                <p
                  className={`mt-3 text-center text-xs ${
                    isDark ? 'text-white/40' : 'text-[#9CA3AF]'
                  }`}
                >
                  {pricing.trialNote}
                </p>
              )}

              {/* Mini testimonial */}
              {pricing.miniTestimonials[index] && (
                <p
                  className={`mt-3 text-center text-xs italic ${
                    isDark ? 'text-white/40' : 'text-[#9CA3AF]'
                  }`}
                >
                  {pricing.miniTestimonials[index]}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Cancel anytime */}
      <p className="mt-8 text-center text-sm text-[#9CA3AF]">
        {pricing.cancelAnytime}
      </p>
    </div>
  )
}
