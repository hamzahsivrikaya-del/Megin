'use client'

import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { useScrollReveal } from '@/lib/hooks/useScrollReveal'
import type { MarketingTranslations } from '@/lib/i18n/types'

interface FeaturesPageContentProps {
  t: MarketingTranslations
  locale: 'en' | 'tr'
}

/* ── Large visual mockups for feature page ── */

function ClientMockupLg({ locale }: { locale: string }) {
  const clients = [
    { initials: 'AK', name: 'Ali K.', pct: 85, color: 'bg-green-400' },
    { initials: 'SM', name: 'Selin M.', pct: 92, color: 'bg-green-500' },
    { initials: 'BT', name: 'Burak T.', pct: 61, color: 'bg-orange-400' },
    { initials: 'ZA', name: 'Zeynep A.', pct: 78, color: 'bg-green-400' },
  ]
  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-black/[0.06] p-5 sm:p-6 max-w-sm mx-auto">
      <div className="flex items-center justify-between mb-5">
        <span className="text-sm font-bold text-gray-900">{locale === 'tr' ? 'Aktif Üyeler' : 'Active Clients'}</span>
        <span className="text-xs text-gray-400 font-medium">4 / 15</span>
      </div>
      <div className="space-y-4">
        {clients.map((c) => (
          <div key={c.initials} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-orange-400 flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-[11px] font-bold text-white leading-none">{c.initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-gray-700 block">{c.name}</span>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-1">
                <div className={`h-full rounded-full ${c.color}`} style={{ width: `${c.pct}%` }} />
              </div>
            </div>
            <span className="text-sm font-semibold text-gray-600 w-10 text-right">{c.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function WorkoutMockupLg({ locale }: { locale: string }) {
  const daysTr = [
    { d: 'Pzt', active: true, ex: 4 },
    { d: 'Sal', active: false, ex: 0 },
    { d: 'Çar', active: true, ex: 5 },
    { d: 'Per', active: true, ex: 3 },
    { d: 'Cum', active: false, ex: 0 },
    { d: 'Cmt', active: true, ex: 6 },
  ]
  const daysEn = [
    { d: 'Mon', active: true, ex: 4 },
    { d: 'Tue', active: false, ex: 0 },
    { d: 'Wed', active: true, ex: 5 },
    { d: 'Thu', active: true, ex: 3 },
    { d: 'Fri', active: false, ex: 0 },
    { d: 'Sat', active: true, ex: 6 },
  ]
  const days = locale === 'tr' ? daysTr : daysEn
  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-black/[0.06] p-5 sm:p-6 max-w-sm mx-auto">
      <div className="flex items-center justify-between mb-5">
        <span className="text-sm font-bold text-gray-900">{locale === 'tr' ? 'Bu Hafta' : 'This Week'}</span>
        <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
          {locale === 'tr' ? '4/6 gün' : '4/6 days'}
        </span>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {days.map((day, i) => (
          <div
            key={i}
            className={`rounded-xl py-3 flex flex-col items-center gap-1.5 ${
              day.active
                ? 'bg-gradient-to-b from-orange-400 to-red-500 shadow-md shadow-orange-300/30'
                : 'bg-gray-50 border border-gray-100'
            }`}
          >
            <span className={`text-[11px] font-bold ${day.active ? 'text-white' : 'text-gray-400'}`}>
              {day.d}
            </span>
            {day.active && (
              <span className="text-[10px] text-white/80 font-medium">{day.ex}{locale === 'tr' ? 'eg' : 'ex'}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function NutritionMockupLg({ locale }: { locale: string }) {
  const mealsTr = [
    { label: 'Kahvaltı', time: '08:30', done: true },
    { label: 'Öğle', time: '12:45', done: true },
    { label: 'Ara Öğün', time: '15:00', done: true },
    { label: 'Akşam', time: '19:30', done: false },
  ]
  const mealsEn = [
    { label: 'Breakfast', time: '08:30', done: true },
    { label: 'Lunch', time: '12:45', done: true },
    { label: 'Snack', time: '15:00', done: true },
    { label: 'Dinner', time: '19:30', done: false },
  ]
  const meals = locale === 'tr' ? mealsTr : mealsEn
  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-black/[0.06] p-5 sm:p-6 max-w-sm mx-auto">
      <div className="flex items-center justify-between mb-5">
        <span className="text-sm font-bold text-gray-900">{locale === 'tr' ? 'Bugünün Öğünleri' : "Today's Meals"}</span>
        <span className="text-xs text-green-600 font-semibold">{locale === 'tr' ? '%75 tamamlandı' : '75% done'}</span>
      </div>
      <div className="space-y-3">
        {meals.map((m, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
              m.done ? 'bg-green-100' : 'bg-gray-50 border border-gray-100'
            }`}>
              {m.done ? (
                <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                  <path d="M1 5.5L5 9.5L13 1" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <div className="w-3 h-3 rounded-full border-2 border-gray-300" />
              )}
            </div>
            <div className="flex-1">
              <span className={`text-sm font-medium ${m.done ? 'text-gray-700' : 'text-gray-400'}`}>{m.label}</span>
            </div>
            <span className="text-xs text-gray-400">{m.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChartMockupLg({ locale }: { locale: string }) {
  const weeks = locale === 'tr'
    ? [{ l: 'H1', v: 65 }, { l: 'H2', v: 72 }, { l: 'H3', v: 68 }, { l: 'H4', v: 81 }, { l: 'H5', v: 78 }, { l: 'H6', v: 85 }, { l: 'H7', v: 91 }]
    : [{ l: 'W1', v: 65 }, { l: 'W2', v: 72 }, { l: 'W3', v: 68 }, { l: 'W4', v: 81 }, { l: 'W5', v: 78 }, { l: 'W6', v: 85 }, { l: 'W7', v: 91 }]
  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-black/[0.06] p-5 sm:p-6 max-w-sm mx-auto">
      <div className="flex items-center justify-between mb-5">
        <span className="text-sm font-bold text-gray-900">{locale === 'tr' ? 'İlerleme' : 'Progress'}</span>
        <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">
          {locale === 'tr' ? '+%26 trend' : '+26% trend'}
        </span>
      </div>
      <div className="flex items-end gap-2.5 h-28">
        {weeks.map((w, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
            <div
              className="w-full rounded-lg bg-gradient-to-t from-blue-500 to-cyan-400 shadow-sm shadow-blue-200/30"
              style={{ height: `${w.v}%` }}
            />
            <span className="text-[10px] text-gray-400 font-medium">{w.l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function BadgeMockupLg({ locale }: { locale: string }) {
  const badgesTr = [
    { emoji: '\u{1F3C6}', label: 'İlk Seans', bg: 'from-amber-200 to-yellow-100' },
    { emoji: '\u{1F525}', label: '7 Gün Seri', bg: 'from-orange-200 to-red-100' },
    { emoji: '\u{1F4AA}', label: 'Tutarlılık', bg: 'from-blue-200 to-indigo-100' },
    { emoji: '\u{2B50}', label: '30 Seans', bg: 'from-yellow-200 to-amber-100' },
    { emoji: '\u{1F3AF}', label: 'Hedefe Ulaştı', bg: 'from-green-200 to-emerald-100' },
    { emoji: '\u{1F48E}', label: 'Elit', bg: 'from-purple-200 to-violet-100' },
  ]
  const badgesEn = [
    { emoji: '\u{1F3C6}', label: 'First Session', bg: 'from-amber-200 to-yellow-100' },
    { emoji: '\u{1F525}', label: '7-Day Streak', bg: 'from-orange-200 to-red-100' },
    { emoji: '\u{1F4AA}', label: 'Consistency', bg: 'from-blue-200 to-indigo-100' },
    { emoji: '\u{2B50}', label: '30 Sessions', bg: 'from-yellow-200 to-amber-100' },
    { emoji: '\u{1F3AF}', label: 'Goal Hit', bg: 'from-green-200 to-emerald-100' },
    { emoji: '\u{1F48E}', label: 'Elite', bg: 'from-purple-200 to-violet-100' },
  ]
  const badges = locale === 'tr' ? badgesTr : badgesEn
  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-black/[0.06] p-5 sm:p-6 max-w-sm mx-auto">
      <div className="flex items-center justify-between mb-5">
        <span className="text-sm font-bold text-gray-900">{locale === 'tr' ? 'Kazanılan Rozetler' : 'Badges Earned'}</span>
        <span className="text-xs text-amber-600 font-semibold">6 / 27</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {badges.map((b, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${b.bg} flex items-center justify-center shadow-sm`}>
              <span className="text-xl">{b.emoji}</span>
            </div>
            <span className="text-[10px] text-gray-500 font-medium text-center leading-tight">{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function NotificationMockupLg({ locale }: { locale: string }) {
  const notifsTr = [
    { color: 'bg-green-400', title: 'Paket yenilendi', desc: 'Ali K. — 12 seans', time: '2dk' },
    { color: 'bg-orange-400', title: 'Öğün hatırlatması', desc: 'Selin M. — Akşam yemeği', time: '15dk' },
    { color: 'bg-purple-400', title: 'Yeni rozet', desc: 'Burak T. — 7 Gün Serisi', time: '1sa' },
  ]
  const notifsEn = [
    { color: 'bg-green-400', title: 'Package renewed', desc: 'Ali K. — 12 sessions', time: '2m' },
    { color: 'bg-orange-400', title: 'Meal reminder sent', desc: 'Selin M. — Dinner logged', time: '15m' },
    { color: 'bg-purple-400', title: 'New badge earned', desc: 'Burak T. — 7-Day Streak', time: '1h' },
  ]
  const notifications = locale === 'tr' ? notifsTr : notifsEn
  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-black/[0.06] p-5 sm:p-6 max-w-sm mx-auto">
      <div className="flex items-center justify-between mb-5">
        <span className="text-sm font-bold text-gray-900">{locale === 'tr' ? 'Bildirimler' : 'Notifications'}</span>
        <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">3</span>
      </div>
      <div className="space-y-3.5">
        {notifications.map((n, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${n.color} flex-shrink-0 mt-1.5`} />
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-gray-700 block">{n.title}</span>
              <span className="text-xs text-gray-400">{n.desc}</span>
            </div>
            <span className="text-[11px] text-gray-400 flex-shrink-0">{n.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

type MockupComponent = ({ locale }: { locale: string }) => React.ReactNode

const featureMockups: MockupComponent[] = [ClientMockupLg, WorkoutMockupLg, NutritionMockupLg, ChartMockupLg, BadgeMockupLg, NotificationMockupLg]
const featureBgs = [
  'from-red-50 to-orange-50',
  'from-orange-50 to-amber-50',
  'from-green-50 to-emerald-50',
  'from-blue-50 to-cyan-50',
  'from-amber-50 to-yellow-50',
  'from-purple-50 to-violet-50',
]

export default function FeaturesPageContent({ t, locale }: FeaturesPageContentProps) {
  const revealRef = useScrollReveal()
  const signupHref = locale === 'tr' ? '/tr/signup' : '/signup'

  return (
    <>
      {/* Page header */}
      <section className="mkt-section-dark-warm pt-32 sm:pt-40 pb-16 sm:pb-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(220,38,38,0.08),transparent)] pointer-events-none" />
        <div className="mkt-container relative">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-[#DC2626] mb-4">Features</span>
          <h1 className="heading-display-xl text-[clamp(2rem,6vw,4rem)] leading-[0.95] text-white">
            {t.featuresPage.title}
          </h1>
          <div className="w-16 h-1 rounded-full bg-gradient-to-r from-[#DC2626] to-[#F97316] mx-auto mt-6" />
          <p className="text-white/60 mt-4 max-w-2xl mx-auto leading-relaxed text-lg">
            {t.featuresPage.subtitle}
          </p>
        </div>
      </section>

      {/* Feature sections — alternating layout */}
      <section className="mkt-section bg-white py-20 sm:py-28" ref={revealRef}>
        <div className="mkt-container space-y-12 sm:space-y-16 lg:space-y-24">
          {t.featuresPage.items.map((feature, index) => {
            const Mockup = featureMockups[index]
            const bg = featureBgs[index]
            if (!Mockup) return null
            const isReversed = index % 2 === 1

            return (
              <div
                key={feature.title}
                className="mkt-reveal grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-14 items-center"
              >
                {/* Visual mockup side */}
                <div className={isReversed ? 'lg:order-2' : ''}>
                  <div className="relative">
                    <div className="absolute -inset-2 bg-gradient-to-r from-[#DC2626]/[0.04] via-transparent to-[#F97316]/[0.04] rounded-3xl blur-xl pointer-events-none" />
                    <div className={`relative bg-gradient-to-br ${bg} rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-12 border border-gray-100`}>
                      <Mockup locale={locale} />
                    </div>
                  </div>
                </div>

                {/* Text side */}
                <div className={isReversed ? 'lg:order-1' : ''}>
                  <h2 className="heading-display text-xl sm:text-2xl lg:text-3xl text-[#0A0A0A]">
                    {feature.title}
                  </h2>
                  <p className="text-[#6B7280] mt-2 sm:mt-3 leading-relaxed text-sm sm:text-base lg:text-lg">
                    {feature.description}
                  </p>
                  <ul className="mt-4 sm:mt-6 space-y-2.5 sm:space-y-3">
                    {feature.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2.5 sm:gap-3">
                        <span className="mt-0.5 flex-shrink-0">
                          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#DC2626]" />
                        </span>
                        <span className="text-sm sm:text-[15px] text-[#0A0A0A]">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mkt-section-dark-warm py-24 sm:py-32 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-[#DC2626]/[0.06] rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="mkt-container relative">
          <h2 className="heading-display-xl text-[clamp(2rem,6vw,4rem)] leading-[0.95] text-white">
            {t.featuresPage.ctaTitle}
          </h2>
          <div className="mt-8">
            <Link href={signupHref} className="cta-gradient cta-glow">
              {t.featuresPage.ctaButton}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
