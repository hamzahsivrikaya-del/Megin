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
    <section className="mkt-section py-16 sm:py-20 bg-white">
      <div className="mkt-container">
        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="mkt-heading-lg text-3xl sm:text-4xl md:text-5xl text-[#0A0A0A]">
            {t.badges.title}
          </h2>
          <p className="text-[#6B7280] mt-4 max-w-2xl mx-auto leading-relaxed">
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
              className="mkt-reveal group flex flex-col items-center gap-2.5 sm:gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-5 transition-all duration-300 cursor-default hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
                style={{
                  background: badge.visual.gradient,
                  boxShadow: `0 4px 14px -2px ${badge.visual.shadow},0.25)`,
                }}
              >
                {badge.visual.emoji}
              </div>
              <span className="text-xs font-semibold text-[#0A0A0A] text-center leading-tight">
                {locale === 'en' ? (BADGE_NAMES_EN[badge.id] || badge.name) : badge.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
