'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useCountUp } from '@/lib/hooks/useCountUp'
import type { MarketingTranslations } from '@/lib/i18n/types'

interface HeroSectionProps {
  t: MarketingTranslations
  locale?: 'en' | 'tr'
}

/* ── Counter Strip ── */
function CounterStrip({ locale }: { locale: 'en' | 'tr' }) {
  const trainers = useCountUp(1000, { duration: 1500, suffix: '+' })
  const rating = useCountUp(4.9, { duration: 1500, decimals: 1 })
  const retention = useCountUp(98, { duration: 1500, suffix: '%' })

  const labels =
    locale === 'tr'
      ? ['Antrenör', 'Puan', 'Tutma Oranı']
      : ['Trainers', 'Rating', 'Retention']

  return (
    <div className="mt-12 flex items-center justify-center gap-4 sm:gap-10 animate-fade-up delay-400">
      {[
        { ref: trainers.ref, value: trainers.value, label: labels[0] },
        { ref: rating.ref, value: rating.value, label: labels[1] },
        { ref: retention.ref, value: retention.value, label: labels[2] },
      ].map((item, i) => (
        <div key={item.label} className="flex items-center gap-4 sm:gap-10">
          {i > 0 && (
            <div className="h-8 sm:h-10 w-px bg-[#E5E7EB]" aria-hidden="true" />
          )}
          <div className="text-center">
            <span
              ref={item.ref}
              className="block font-display text-2xl sm:text-4xl font-bold text-[#0A0A0A] leading-none"
            >
              {item.value}
            </span>
            <span className="block text-[10px] sm:text-xs text-[#6B7280] mt-1">
              {item.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Realistic Dashboard Mockup ── */
function DashboardMockup({ locale }: { locale: 'en' | 'tr' }) {
  const clients = [
    { name: 'Ali K.', pct: 73, color: 'bg-red-400' },
    { name: 'Selin M.', pct: 92, color: 'bg-green-500' },
    { name: 'Burak T.', pct: 61, color: 'bg-red-500' },
    { name: 'Zeynep A.', pct: 85, color: 'bg-green-500' },
  ]

  const dashTitle = 'Dashboard'
  const lessonsToday = locale === 'tr' ? 'Bugün 4 ders' : '4 lessons today'
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
    <div className="mt-16 max-w-4xl mx-auto animate-fade-up delay-500">
      <div className="relative rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-2xl shadow-black/5">
        {/* Gradient top bar */}
        <div className="h-8 bg-gradient-to-r from-[#B91C1C] via-[#DC2626] to-[#EF4444] flex items-center px-4 gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
        </div>

        {/* Dashboard content */}
        <div className="bg-[#FAFAFA] p-4 sm:p-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {/* Left panel — client list */}
          <div className="sm:col-span-2 space-y-4">
            <div>
              <p className="text-sm font-bold text-[#0A0A0A]">{dashTitle}</p>
              <p className="text-xs text-[#9CA3AF]">{lessonsToday}</p>
            </div>

            <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 sm:p-5 space-y-3.5">
              {clients.map((c) => (
                <div key={c.name} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#B91C1C] to-[#EF4444] flex items-center justify-center flex-shrink-0 shadow-sm shadow-red-200/40">
                    <span className="text-[10px] font-bold text-white leading-none">
                      {c.name.split(' ').map((n) => n[0]).join('')}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-[#0A0A0A] w-16 truncate">
                    {c.name}
                  </span>
                  <div className="flex-1 h-2.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${c.color}`}
                      style={{ width: `${c.pct}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-[#6B7280] w-9 text-right">
                    {c.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel — stats */}
          <div className="grid grid-cols-3 sm:grid-cols-1 gap-3 sm:gap-4">
            {/* Active Clients card */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
              <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider">
                {activeClientsLabel}
              </p>
              <p className="text-2xl font-bold text-[#0A0A0A] mt-1.5">
                12 <span className="text-sm font-normal text-[#9CA3AF]">/ 15</span>
              </p>
              <div className="mt-2.5 h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-[#B91C1C] to-[#EF4444]" />
              </div>
            </div>

            {/* Mini bar chart — richer */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
              <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
                {thisWeekLabel}
              </p>
              <div className="flex items-end justify-between gap-1.5 h-20">
                {weekDays.map((day, i) => (
                  <div key={day} className="flex flex-col items-center gap-1 flex-1">
                    <div
                      className={`w-full max-w-[20px] mx-auto rounded-md ${
                        barActive[i]
                          ? 'bg-gradient-to-t from-[#B91C1C] to-[#EF4444]'
                          : 'bg-[#E5E7EB]'
                      }`}
                      style={{ height: `${barHeights[i]}%` }}
                    />
                    <span className={`text-[9px] font-medium ${barActive[i] ? 'text-[#6B7280]' : 'text-[#D1D5DB]'}`}>
                      {day}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nutrition card — richer */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
              <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider">
                {nutritionLabel}
              </p>
              <div className="flex items-center gap-3 mt-2">
                {/* Mini donut */}
                <div className="w-11 h-11 flex-shrink-0 relative">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#F3F4F6" strokeWidth="4" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#22C55E" strokeWidth="4"
                      strokeDasharray="87.96 12.04"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-[#0A0A0A]">87</span>
                </div>
                <div>
                  <p className="text-lg font-bold text-[#0A0A0A] leading-none">87%</p>
                  <p className="text-[10px] text-[#9CA3AF] mt-0.5">{complianceLabel}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main Hero ── */
export default function HeroSection({ t, locale = 'en' }: HeroSectionProps) {
  const secondaryCta = locale === 'tr' ? 'Nasıl Çalışır?' : 'See How It Works'

  return (
    <section className="mkt-section pt-28 sm:pt-36 pb-16 sm:pb-20 bg-white relative overflow-hidden">
      {/* Multi-layer gradient blobs */}
      <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-[#DC2626]/[0.04] rounded-full blur-[140px] -translate-y-1/3 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#F97316]/[0.05] rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-[#D97706]/[0.03] rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="mkt-container text-center relative">
        {/* Main heading */}
        <h1 className="mkt-heading-xl text-5xl sm:text-6xl md:text-7xl lg:text-8xl animate-fade-up">
          <span className="text-[#0A0A0A] block">{t.hero.title1}</span>
          <span className="text-gradient block">{t.hero.title2}</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-[#6B7280] max-w-2xl mx-auto mt-8 leading-relaxed animate-fade-up delay-200">
          {t.hero.subtitle}
        </p>

        {/* Dual CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up delay-300">
          <Link href="/signup" className="mkt-cta-gradient">
            {t.hero.cta}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/features" className="mkt-cta-ghost rounded-lg">
            {secondaryCta}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Animated Counter Strip */}
        <CounterStrip locale={locale} />

        {/* Realistic Dashboard Mockup */}
        <DashboardMockup locale={locale} />
      </div>
    </section>
  )
}
