'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useCountUp } from '@/lib/hooks/useCountUp'
import type { MarketingTranslations } from '@/lib/i18n/types'

interface HeroSectionProps {
  t: MarketingTranslations
  locale?: 'en' | 'tr'
}

/* -- Counter Strip -- */
function CounterStrip({ locale }: { locale: 'en' | 'tr' }) {
  const trainers = useCountUp(1000, { duration: 2000, suffix: '+' })
  const rating = useCountUp(4.9, { duration: 2000, decimals: 1 })
  const retention = useCountUp(98, { duration: 2000, suffix: '%' })

  const labels =
    locale === 'tr'
      ? ['Antrenör', 'Puan', 'Tutma Oranı']
      : ['Trainers', 'Rating', 'Retention']

  const items = [
    { ref: trainers.ref, value: trainers.value, label: labels[0] },
    { ref: rating.ref, value: rating.value, label: labels[1] },
    { ref: retention.ref, value: retention.value, label: labels[2] },
  ]

  return (
    <div className="mt-14 flex items-center justify-center gap-6 sm:gap-12 animate-fade-up delay-400">
      {items.map((item, i) => (
        <div key={item.label} className="flex items-center gap-6 sm:gap-12">
          {i > 0 && (
            <div className="h-10 sm:h-12 w-px bg-gradient-to-b from-transparent via-[#E5E7EB] to-transparent" aria-hidden="true" />
          )}
          <div className="text-center">
            <span
              ref={item.ref}
              className="block font-display text-3xl sm:text-5xl font-bold text-[#0A0A0A] leading-none tracking-tight"
            >
              {item.value}
            </span>
            <span className="block text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em] text-[#9CA3AF] mt-2">
              {item.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

/* -- Dashboard Mockup -- */
function DashboardMockup({ locale }: { locale: 'en' | 'tr' }) {
  const clients = [
    { name: 'Ali K.', pct: 73, color: 'bg-red-400' },
    { name: 'Selin M.', pct: 92, color: 'bg-green-500' },
    { name: 'Burak T.', pct: 61, color: 'bg-red-500' },
    { name: 'Zeynep A.', pct: 85, color: 'bg-green-500' },
  ]

  const activeClientsLabel = locale === 'tr' ? 'Aktif Danışanlar' : 'Active Clients'
  const thisWeekLabel = locale === 'tr' ? 'Bu Hafta' : 'This Week'
  const nutritionLabel = locale === 'tr' ? 'Beslenme' : 'Nutrition'
  const complianceLabel = locale === 'tr' ? 'uyum' : 'compliance'
  const weekDays = locale === 'tr'
    ? ['Pzt', 'Sal', 'Çar', 'Per', 'Cum']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  const barHeights = [55, 75, 40, 90, 65]
  const barActive = [true, true, false, true, true]

  return (
    <div className="mt-16 sm:mt-20 max-w-4xl mx-auto animate-fade-up delay-500">
      {/* Outer glow wrapper */}
      <div className="relative animate-float-mockup">
        {/* Glow behind card */}
        <div className="absolute -inset-4 bg-gradient-to-r from-[#DC2626]/[0.06] via-transparent to-[#F97316]/[0.06] rounded-3xl blur-2xl pointer-events-none" />

        <div className="relative rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-2xl shadow-black/8">
          {/* Top bar — dark macOS style */}
          <div className="h-9 bg-gradient-to-r from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] flex items-center px-4 gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]/60" />
            <span className="ml-3 text-[10px] text-white/30 font-mono">megin.io/admin</span>
          </div>

          {/* Dashboard content */}
          <div className="bg-[#FAFAFA] p-4 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {/* Left — client list */}
              <div className="sm:col-span-2">
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 sm:p-5 space-y-3.5">
                  {clients.map((c) => (
                    <div key={c.name} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0A0A0A] to-[#374151] flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-white leading-none">
                          {c.name.split(' ').map((n) => n[0]).join('')}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-[#0A0A0A] w-16 truncate">{c.name}</span>
                      <div className="flex-1 h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${c.color}`} style={{ width: `${c.pct}%` }} />
                      </div>
                      <span className="text-[11px] font-semibold text-[#6B7280] w-9 text-right">{c.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — stats */}
              <div className="grid grid-cols-3 sm:grid-cols-1 gap-3">
                {/* Active Clients */}
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-3 sm:p-4">
                  <p className="text-[9px] sm:text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider">{activeClientsLabel}</p>
                  <p className="text-xl sm:text-2xl font-bold text-[#0A0A0A] mt-1">
                    12 <span className="text-xs sm:text-sm font-normal text-[#9CA3AF]">/ 15</span>
                  </p>
                  <div className="mt-2 h-1.5 sm:h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-[#DC2626] to-[#F97316]" />
                  </div>
                </div>

                {/* Bar chart */}
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-3 sm:p-4">
                  <p className="text-[9px] sm:text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">{thisWeekLabel}</p>
                  <div className="flex items-end justify-between gap-1 h-16 sm:h-20">
                    {weekDays.map((day, i) => (
                      <div key={day} className="flex flex-col items-center gap-1 flex-1">
                        <div
                          className={`w-full max-w-[18px] mx-auto rounded-md ${barActive[i] ? 'bg-gradient-to-t from-[#0A0A0A] to-[#374151]' : 'bg-[#E5E7EB]'}`}
                          style={{ height: `${barHeights[i]}%` }}
                        />
                        <span className={`text-[8px] sm:text-[9px] font-medium ${barActive[i] ? 'text-[#6B7280]' : 'text-[#D1D5DB]'}`}>{day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nutrition donut */}
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-3 sm:p-4">
                  <p className="text-[9px] sm:text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider">{nutritionLabel}</p>
                  <div className="flex items-center gap-2 sm:gap-3 mt-2">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0 relative">
                      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#F3F4F6" strokeWidth="4" />
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#22C55E" strokeWidth="4" strokeDasharray="87.96 12.04" strokeLinecap="round" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[8px] sm:text-[9px] font-bold text-[#0A0A0A]">87</span>
                    </div>
                    <div>
                      <p className="text-base sm:text-lg font-bold text-[#0A0A0A] leading-none">87%</p>
                      <p className="text-[9px] sm:text-[10px] text-[#9CA3AF] mt-0.5">{complianceLabel}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* -- Main Hero -- */
export default function HeroSection({ t, locale = 'en' }: HeroSectionProps) {
  const secondaryCta = locale === 'tr' ? 'Nasıl Çalışır?' : 'See How It Works'

  return (
    <section className="mkt-section pt-32 sm:pt-40 pb-20 sm:pb-28 bg-white relative overflow-hidden">
      {/* Background: subtle radial gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(220,38,38,0.06),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_100%,rgba(249,115,22,0.04),transparent)] pointer-events-none" />

      <div className="mkt-container text-center relative">
        {/* Trust badge */}
        <div className="animate-fade-up mb-8">
          <span className="mkt-trust-badge">
            <span className="mkt-trust-badge-icon">
              <svg viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            {locale === 'tr' ? '5 danışana kadar tamamen ücretsiz' : 'Free forever for up to 5 clients'}
          </span>
        </div>

        {/* Main heading */}
        <h1 className="mkt-heading-xl text-[clamp(2.8rem,8vw,6rem)] leading-[0.9] animate-fade-up delay-100">
          <span className="text-[#0A0A0A] block">{t.hero.title1}</span>
          <span className="text-gradient block mt-1 sm:mt-2">{t.hero.title2}</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg lg:text-xl text-[#6B7280] max-w-2xl mx-auto mt-8 sm:mt-10 leading-relaxed animate-fade-up delay-200">
          {t.hero.subtitle}
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up delay-300">
          <Link href="/signup" className="mkt-cta-gradient mkt-cta-glow">
            {t.hero.cta}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/features" className="mkt-cta-ghost rounded-xl">
            {secondaryCta}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Counter Strip */}
        <CounterStrip locale={locale} />

        {/* Dashboard Mockup */}
        <DashboardMockup locale={locale} />
      </div>
    </section>
  )
}
