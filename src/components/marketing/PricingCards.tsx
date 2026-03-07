'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { MarketingTranslations } from '@/lib/i18n/types'

interface PricingCardsProps {
  t: MarketingTranslations
}

/* ── Icons ── */

function CheckIcon({ dark }: { dark?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="flex-shrink-0 mt-0.5">
      <circle cx="8" cy="8" r="8" fill={dark ? 'rgba(255,255,255,0.12)' : 'rgba(34,197,94,0.12)'} />
      <path d="M4.5 8.5L6.5 10.5L11 5.5" stroke={dark ? '#FFFFFF' : '#22C55E'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="flex-shrink-0 mt-0.5">
      <rect x="3" y="6" width="8" height="6" rx="1.5" stroke="#D1D5DB" strokeWidth="1.2" />
      <path d="M5 6V4.5a2 2 0 0 1 4 0V6" stroke="#D1D5DB" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function TableCheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="mx-auto">
      <circle cx="10" cy="10" r="10" fill="rgba(34,197,94,0.1)" />
      <path d="M5.5 10.5L8.5 13.5L14 6.5" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TableXIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="mx-auto">
      <circle cx="10" cy="10" r="10" fill="rgba(209,213,219,0.15)" />
      <path d="M7 7L13 13M13 7L7 13" stroke="#D1D5DB" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/* ── Tier Icons ── */

function FreeTierIcon() {
  return (
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  )
}

function PlusTierIcon() {
  return (
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#DC2626] to-[#F97316] flex items-center justify-center mb-4 shadow-lg shadow-red-500/20">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    </div>
  )
}

function ProTierIcon() {
  return (
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/20 to-white/5 border border-white/10 flex items-center justify-center mb-4">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </div>
  )
}

const tierIcons = [FreeTierIcon, PlusTierIcon, ProTierIcon]

const tierNames = ['Free', 'Plus', 'Pro']

/* ── Component ── */

export default function PricingCards({ t }: PricingCardsProps) {
  const [isAnnual, setIsAnnual] = useState(true)
  const { pricing } = t

  const ctaLabels = [pricing.startFree, pricing.startTrial, pricing.contactUs]
  const ctaHrefs = ['/signup', '/signup?plan=plus', '/signup?plan=pro']

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
          const cs = pricing.currencySymbol
          const priceLabel = displayPrice === 0 ? `${cs}0` : `${cs}${displayPrice}`

          const ctaLabel = ctaLabels[index]
          const ctaHref = ctaHrefs[index]
          const TierIcon = tierIcons[index]
          const locked = pricing.lockedFeatures[index]

          return (
            <div
              key={tier.badge}
              className="relative"
            >
              {/* Gradient glow behind highlighted card */}
              {isHighlighted && (
                <div
                  className="absolute -inset-[2px] rounded-[18px] bg-gradient-to-br from-[#DC2626] via-[#F97316] to-[#DC2626] opacity-60 blur-sm -z-10"
                  aria-hidden="true"
                />
              )}
              {isHighlighted && (
                <div
                  className="absolute -inset-[1px] rounded-[17px] bg-gradient-to-br from-[#DC2626] to-[#F97316] -z-[5]"
                  aria-hidden="true"
                />
              )}

              <div
                className={[
                  'rounded-2xl border p-6 sm:p-8 lg:p-10 relative flex flex-col transition-all duration-500 group',
                  'hover:-translate-y-2 hover:shadow-2xl',
                  isHighlighted
                    ? 'border-transparent bg-white shadow-2xl shadow-red-500/[0.08] z-10 md:scale-[1.03]'
                    : isDark
                      ? 'border-white/10 bg-[#0A0A0A] hover:shadow-black/20 hover:border-white/20'
                      : 'border-[#E5E7EB] bg-white hover:shadow-black/[0.06] hover:border-gray-300',
                ].join(' ')}
              >
                {/* Most Popular badge */}
                {isHighlighted && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#DC2626] to-[#F97316] text-white text-xs font-bold px-5 py-1.5 rounded-full uppercase tracking-wider whitespace-nowrap shadow-lg shadow-red-500/25">
                    {pricing.mostPopular}
                  </span>
                )}

                {/* Tier icon */}
                <TierIcon />

                {/* Tier badge */}
                <span className={[
                  'inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full w-fit',
                  isDark ? 'bg-white/10 text-white/70' : isHighlighted ? 'bg-red-50 text-[#DC2626]' : 'bg-[#F5F5F5] text-[#6B7280]',
                ].join(' ')}>
                  {tier.badge}
                </span>

                {/* Price */}
                <div className="mt-5">
                  {isAnnual && monthlyPrice > 0 && (
                    <div className="mb-1">
                      <span className={`text-lg line-through ${isDark ? 'text-white/30' : 'text-[#D1D5DB]'}`}>
                        {cs}{monthlyPrice}
                      </span>
                    </div>
                  )}
                  <div className="flex items-end gap-1">
                    <span className={[
                      'font-display text-5xl sm:text-6xl font-bold leading-none tracking-tight transition-colors duration-300',
                      isDark ? 'text-white' : isHighlighted ? 'text-[#0A0A0A] group-hover:text-[#DC2626]' : 'text-[#0A0A0A]',
                    ].join(' ')}>
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
                    {cs}{tier.annualPrice}{pricing.perYear}
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
                  {/* Locked features */}
                  {locked.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 opacity-50">
                      <LockIcon />
                      <span className={`text-sm line-through decoration-1 ${isDark ? 'text-white/40' : 'text-[#9CA3AF]'}`}>
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
                      'w-full justify-center transition-transform duration-300 group-hover:scale-[1.02]',
                      isHighlighted
                        ? 'cta-gradient cta-glow'
                        : isDark
                          ? 'cta-primary'
                          : 'cta-ghost',
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
            </div>
          )
        })}
      </div>

      {/* Cancel anytime */}
      <p className="mt-10 text-center text-sm text-[#9CA3AF]">{pricing.cancelAnytime}</p>

      {/* ── Feature Comparison Table ── */}
      <div className="mt-20 sm:mt-24">
        <h3 className="text-2xl sm:text-3xl font-display font-bold text-center text-[#0A0A0A] mb-3">
          {pricing.comparisonTitle}
        </h3>
        <p className="text-center text-[#6B7280] text-sm mb-10">
          {pricing.comparisonSubtitle}
        </p>

        {/* Scrollable wrapper */}
        <div className="relative overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[600px] border-collapse">
            {/* Header */}
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-[#FAFAFA] text-left text-sm font-semibold text-[#6B7280] py-4 px-4 sm:px-6 w-[200px] sm:w-[260px]">
                  {pricing.featureLabel}
                </th>
                {tierNames.map((name, i) => (
                  <th
                    key={name}
                    className={[
                      'text-center py-4 px-3 sm:px-6 text-sm font-bold',
                      i === 1 ? 'text-[#DC2626]' : i === 2 ? 'text-[#0A0A0A]' : 'text-[#6B7280]',
                    ].join(' ')}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className={[
                        'inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full',
                        i === 0 ? 'bg-[#F5F5F5] text-[#6B7280]' : i === 1 ? 'bg-red-50 text-[#DC2626]' : 'bg-[#0A0A0A] text-white',
                      ].join(' ')}>
                        {name}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {pricing.comparisonCategories.map((category, catIdx) => (
                <>
                  {/* Category header */}
                  <tr key={`cat-${catIdx}`}>
                    <td
                      colSpan={4}
                      className="sticky left-0 z-10 bg-[#FAFAFA] pt-6 pb-3 px-4 sm:px-6"
                    >
                      <span className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                        {category.name}
                      </span>
                    </td>
                  </tr>

                  {/* Feature rows */}
                  {category.features.map((feature, fIdx) => (
                    <tr
                      key={`${catIdx}-${fIdx}`}
                      className="border-b border-[#F3F4F6] transition-colors duration-200 hover:bg-[#F9FAFB]"
                    >
                      <td className="sticky left-0 z-10 bg-white hover:bg-[#F9FAFB] transition-colors duration-200 text-sm text-[#374151] py-3.5 px-4 sm:px-6 font-medium">
                        {feature.name}
                      </td>
                      {feature.values.map((val, vi) => (
                        <td key={vi} className="text-center py-3.5 px-3 sm:px-6">
                          {typeof val === 'boolean' ? (
                            val ? <TableCheckIcon /> : <TableXIcon />
                          ) : (
                            <span className={[
                              'text-sm font-semibold',
                              vi === 1 ? 'text-[#DC2626]' : vi === 2 ? 'text-[#0A0A0A]' : 'text-[#6B7280]',
                            ].join(' ')}>
                              {val}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom CTA row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 max-w-3xl mx-auto">
          {tierNames.map((name, i) => (
            <Link
              key={name}
              href={ctaHrefs[i]}
              className={[
                'text-center text-sm',
                i === 1
                  ? 'cta-gradient cta-glow'
                  : i === 2
                    ? 'cta-primary'
                    : 'cta-ghost',
              ].join(' ')}
            >
              {ctaLabels[i]}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
