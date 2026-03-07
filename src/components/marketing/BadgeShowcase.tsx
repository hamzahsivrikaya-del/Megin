'use client'

import { useScrollReveal } from '@/lib/hooks/useScrollReveal'
import { BADGE_DEFINITIONS, BADGE_VISUALS } from '@/lib/badges'
import type { MarketingTranslations } from '@/lib/i18n/types'
import type { Locale } from '@/lib/i18n/types'

const BADGE_NAMES_EN: Record<string, string> = {
  first_lesson: 'First Step',
  three_in_a_row: 'Triple Threat',
  ten_lessons: 'Apprentice',
  goal_setter: 'Sharpshooter',
  first_nutrition: 'First Log',
  four_week_streak: 'Iron Will',
  fifty_lessons: 'Master',
  perfect_week: 'Perfection',
}

interface BadgeShowcaseProps {
  t: MarketingTranslations
  locale: Locale
}

const SHOWCASE_BADGE_IDS = [
  'first_lesson',
  'three_in_a_row',
  'ten_lessons',
  'goal_setter',
  'first_nutrition',
  'four_week_streak',
  'fifty_lessons',
  'perfect_week',
]

type ShowcaseBadge = (typeof BADGE_DEFINITIONS)[number] & {
  visual: (typeof BADGE_VISUALS)[string]
}

export default function BadgeShowcase({ t, locale }: BadgeShowcaseProps) {
  const revealRef = useScrollReveal()

  const showcaseBadges = SHOWCASE_BADGE_IDS
    .map((id): ShowcaseBadge | null => {
      const def = BADGE_DEFINITIONS.find((b) => b.id === id)
      const visual = BADGE_VISUALS[id]
      if (!def || !visual) return null
      return { ...def, visual }
    })
    .filter((b): b is ShowcaseBadge => b !== null)

  return (
    <section className="mkt-section-dark-warm mkt-grain py-20 sm:py-28 relative overflow-hidden">
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="mkt-section relative">
      <div className="mkt-container">
        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="heading-display text-3xl sm:text-4xl md:text-5xl text-white">
            {t.badges.title}
          </h2>
          <p className="text-white/60 mt-4 max-w-2xl mx-auto leading-relaxed">
            {t.badges.subtitle}
          </p>
        </div>

        {/* Badge grid */}
        <div
          ref={revealRef}
          className="mkt-stagger grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto"
        >
          {showcaseBadges.map((badge) => (
            <div
              key={badge.id}
              className="mkt-reveal group flex flex-col items-center gap-3 rounded-2xl bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] p-5 sm:p-6 transition-all duration-500 cursor-default hover:-translate-y-2 hover:bg-white/[0.1] hover:border-white/[0.15]"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3"
                style={{
                  background: badge.visual.gradient,
                  boxShadow: `0 8px 24px -4px ${badge.visual.shadow},0.3)`,
                }}
              >
                {badge.visual.emoji}
              </div>
              <span className="text-xs font-semibold text-white/80 text-center leading-tight">
                {locale === 'en' ? (BADGE_NAMES_EN[badge.id] || badge.name) : badge.name}
              </span>
            </div>
          ))}
        </div>
      </div>
      </div>
    </section>
  )
}
