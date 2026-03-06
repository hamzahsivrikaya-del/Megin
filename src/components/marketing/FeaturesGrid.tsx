'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useScrollReveal } from '@/lib/hooks/useScrollReveal'
import type { MarketingTranslations } from '@/lib/i18n/types'

interface FeaturesGridProps {
  t: MarketingTranslations
}

/* ── Mini visual mockups — scaled up for impact ── */

function ClientMockup() {
  const clients = [
    { initials: 'AK', pct: 85, color: 'bg-green-400' },
    { initials: 'SM', pct: 72, color: 'bg-orange-400' },
    { initials: 'BT', pct: 94, color: 'bg-green-500' },
  ]
  return (
    <div className="space-y-3.5">
      {clients.map((c) => (
        <div key={c.initials} className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-400 to-orange-400 flex items-center justify-center flex-shrink-0 shadow-sm shadow-red-200/50">
            <span className="text-[10px] font-bold text-white leading-none">{c.initials}</span>
          </div>
          <div className="flex-1 h-2.5 bg-white/70 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${c.color}`} style={{ width: `${c.pct}%` }} />
          </div>
          <span className="text-xs font-semibold text-gray-600 w-9 text-right">{c.pct}%</span>
        </div>
      ))}
    </div>
  )
}

function WorkoutMockup() {
  const days = ['M', 'T', 'W', 'T', 'F']
  const active = [true, false, true, true, false]
  return (
    <div className="flex gap-2 justify-center">
      {days.map((d, i) => (
        <div
          key={d + i}
          className={`w-12 h-[52px] rounded-xl flex flex-col items-center justify-center ${
            active[i]
              ? 'bg-gradient-to-b from-orange-400 to-red-500 shadow-md shadow-orange-300/40'
              : 'bg-white/70 border border-gray-100'
          }`}
        >
          <span className={`text-xs font-bold ${active[i] ? 'text-white' : 'text-gray-400'}`}>
            {d}
          </span>
          {active[i] && <div className="w-1.5 h-1.5 rounded-full bg-white/80 mt-1" />}
        </div>
      ))}
    </div>
  )
}

function NutritionMockup() {
  const meals = [
    { label: 'B', done: true },
    { label: 'L', done: true },
    { label: 'D', done: false },
  ]
  return (
    <div className="flex gap-4 justify-center">
      {meals.map((m, i) => (
        <div key={i} className="relative">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-bold ${
            m.done ? 'bg-green-100 text-green-600 shadow-sm shadow-green-200/40' : 'bg-white/70 text-gray-400 border border-gray-100'
          }`}>
            {m.label}
          </div>
          {m.done && (
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-green-400 flex items-center justify-center shadow-sm">
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function ChartMockup() {
  const bars = [35, 55, 45, 75, 60, 85, 70]
  return (
    <div className="flex items-end gap-2 h-20 justify-center">
      {bars.map((h, i) => (
        <div
          key={i}
          className="w-5 rounded-md bg-gradient-to-t from-blue-500 to-cyan-400 shadow-sm shadow-blue-200/30"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  )
}

function BadgeMockup() {
  const badges = [
    { emoji: '\u{1F3C6}', bg: 'from-amber-200 to-yellow-100' },
    { emoji: '\u{1F525}', bg: 'from-orange-200 to-red-100' },
    { emoji: '\u{1F4AA}', bg: 'from-blue-200 to-indigo-100' },
    { emoji: '\u{2B50}', bg: 'from-yellow-200 to-amber-100' },
  ]
  return (
    <div className="flex gap-3 justify-center">
      {badges.map((b, i) => (
        <div
          key={i}
          className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${b.bg} flex items-center justify-center shadow-sm`}
        >
          <span className="text-lg">{b.emoji}</span>
        </div>
      ))}
    </div>
  )
}

function NotificationMockup() {
  return (
    <div className="space-y-3">
      {[
        { dot: 'bg-green-400', w: '80%' },
        { dot: 'bg-orange-400', w: '60%' },
        { dot: 'bg-purple-400', w: '45%' },
      ].map((n, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${n.dot} flex-shrink-0 shadow-sm`} />
          <div className="flex-1">
            <div className="h-2.5 bg-white/70 rounded-full" style={{ width: n.w }} />
            <div className="h-1.5 bg-white/40 rounded-full mt-1.5" style={{ width: `${parseInt(n.w) - 20}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

const featureVisuals = [
  { Mockup: ClientMockup, bg: 'from-red-50/80 to-orange-50/80' },
  { Mockup: WorkoutMockup, bg: 'from-orange-50/80 to-amber-50/80' },
  { Mockup: NutritionMockup, bg: 'from-green-50/80 to-emerald-50/80' },
  { Mockup: ChartMockup, bg: 'from-blue-50/80 to-cyan-50/80' },
  { Mockup: BadgeMockup, bg: 'from-amber-50/80 to-yellow-50/80' },
  { Mockup: NotificationMockup, bg: 'from-purple-50/80 to-violet-50/80' },
]

export default function FeaturesGrid({ t }: FeaturesGridProps) {
  const revealRef = useScrollReveal()

  return (
    <section className="mkt-section py-20 sm:py-28 bg-white">
      <div className="mkt-container">
        {/* Heading */}
        <div className="text-center">
          <h2 className="mkt-heading-lg text-3xl sm:text-4xl md:text-5xl">
            <span className="text-[#0A0A0A] block">{t.features.title1}</span>
            <span className="text-gradient block">{t.features.title2}</span>
          </h2>
          <div className="w-16 h-1 rounded-full bg-gradient-to-r from-[#DC2626] to-[#F97316] mx-auto mt-6" />
        </div>

        {/* Feature cards with visual mockups */}
        <div
          ref={revealRef}
          className="mkt-stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mt-14"
        >
          {t.features.items.map((item, index) => {
            const visual = featureVisuals[index]
            if (!visual) return null
            const { Mockup, bg } = visual
            return (
              <div
                key={item.title}
                className="mkt-reveal group relative flex flex-col rounded-2xl border border-gray-100 bg-white overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-black/[0.06] hover:-translate-y-2 hover:border-gray-200"
              >
                {/* Visual preview area */}
                <div className={`bg-gradient-to-br ${bg} px-5 sm:px-8 flex items-center justify-center relative overflow-hidden h-[160px] sm:h-[200px]`}>
                  <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                  <div className="w-full max-w-[260px] relative">
                    <Mockup />
                  </div>
                </div>

                {/* Text area */}
                <div className="px-5 py-5 sm:px-6 sm:py-6 flex-1 flex flex-col">
                  <h3 className="text-base sm:text-lg font-bold text-[#0A0A0A] leading-tight">{item.title}</h3>
                  <p className="text-sm text-[#6B7280] mt-2 leading-relaxed line-clamp-3 flex-1">
                    {item.description}
                  </p>
                </div>

                {/* Bottom accent line on hover */}
                <div className="h-0.5 w-0 bg-gradient-to-r from-[#DC2626] to-[#F97316] transition-all duration-500 group-hover:w-full mt-auto" />
              </div>
            )
          })}
        </div>

        {/* See All link */}
        <div className="text-center mt-10">
          <Link
            href="/features"
            className="inline-flex items-center gap-2 text-[#DC2626] font-semibold text-sm uppercase tracking-wider hover:text-[#F97316] transition-colors"
          >
            {t.features.seeAll}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
