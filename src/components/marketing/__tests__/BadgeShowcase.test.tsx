import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import BadgeShowcase from '../BadgeShowcase'
import { en } from '@/lib/i18n/en'
import { tr } from '@/lib/i18n/tr'
import { BADGE_DEFINITIONS, BADGE_VISUALS } from '@/lib/badges'

// useScrollReveal mock — jsdom doesn't support IntersectionObserver
vi.mock('@/lib/hooks/useScrollReveal', () => ({
  useScrollReveal: () => ({ current: null }),
}))

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

describe('BadgeShowcase', () => {
  it('renders the section heading with EN translations', () => {
    render(<BadgeShowcase t={en} locale="en" />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(en.badges.title)
  })

  it('renders the subtitle with EN translations', () => {
    render(<BadgeShowcase t={en} locale="en" />)
    expect(screen.getByText(en.badges.subtitle)).toBeInTheDocument()
  })

  it('renders the section heading with TR translations', () => {
    render(<BadgeShowcase t={tr} locale="tr" />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(tr.badges.title)
  })

  it('renders the subtitle with TR translations', () => {
    render(<BadgeShowcase t={tr} locale="tr" />)
    expect(screen.getByText(tr.badges.subtitle)).toBeInTheDocument()
  })

  it('renders exactly 8 badge cards', () => {
    const { container } = render(<BadgeShowcase t={en} locale="en" />)
    const cards = container.querySelectorAll('.mkt-reveal')
    expect(cards).toHaveLength(8)
  })

  it('renders TR badge names when locale is tr', () => {
    render(<BadgeShowcase t={tr} locale="tr" />)
    SHOWCASE_BADGE_IDS.forEach((id) => {
      const def = BADGE_DEFINITIONS.find((b) => b.id === id)
      if (!def) return
      expect(screen.getByText(def.name)).toBeInTheDocument()
    })
  })

  it('renders EN badge names when locale is en', () => {
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
    render(<BadgeShowcase t={en} locale="en" />)
    SHOWCASE_BADGE_IDS.forEach((id) => {
      const def = BADGE_DEFINITIONS.find((b) => b.id === id)
      if (!def) return
      const expectedName = BADGE_NAMES_EN[id] || def.name
      expect(screen.getByText(expectedName)).toBeInTheDocument()
    })
  })

  it('renders each badge icon div with a non-empty background style', () => {
    const { container } = render(<BadgeShowcase t={en} locale="en" />)
    const iconDivs = container.querySelectorAll('.mkt-reveal .rounded-2xl.flex')
    expect(iconDivs.length).toBe(8)
    iconDivs.forEach((div) => {
      // jsdom normalises hex colours to rgb() in inline styles,
      // so we only assert the style attribute is set (not empty)
      expect((div as HTMLElement).style.background).not.toBe('')
    })
  })

  it('renders badge emoji for each showcase badge', () => {
    const { container } = render(<BadgeShowcase t={en} locale="en" />)
    const iconDivs = container.querySelectorAll('.mkt-reveal .rounded-2xl.flex')
    SHOWCASE_BADGE_IDS.forEach((id, index) => {
      const visual = BADGE_VISUALS[id]
      if (!visual) return
      expect(iconDivs[index].textContent).toBe(visual.emoji)
    })
  })

  it('renders a section element with correct background class', () => {
    const { container } = render(<BadgeShowcase t={en} locale="en" />)
    const section = container.querySelector('section')
    expect(section).toHaveClass('bg-white')
  })

  it('renders badge cards with white background', () => {
    const { container } = render(<BadgeShowcase t={en} locale="en" />)
    const cards = container.querySelectorAll('.mkt-reveal')
    cards.forEach((card) => {
      expect(card).toHaveClass('bg-white')
    })
  })

  it('renders the badge grid with responsive grid classes', () => {
    const { container } = render(<BadgeShowcase t={en} locale="en" />)
    const grid = container.querySelector('.mkt-stagger')
    expect(grid).toHaveClass('grid', 'grid-cols-2', 'sm:grid-cols-4')
  })

  it('applies hover animation classes to each badge card', () => {
    const { container } = render(<BadgeShowcase t={en} locale="en" />)
    const cards = container.querySelectorAll('.mkt-reveal')
    cards.forEach((card) => {
      expect(card).toHaveClass('hover:-translate-y-1')
    })
  })

  it('applies group-hover scale to icon divs', () => {
    const { container } = render(<BadgeShowcase t={en} locale="en" />)
    const iconDivs = container.querySelectorAll('.mkt-reveal .rounded-2xl.flex')
    iconDivs.forEach((div) => {
      expect(div).toHaveClass('group-hover:scale-110')
    })
  })

  it('does not render badges with unknown IDs', () => {
    // All 8 showcase IDs must exist in BADGE_DEFINITIONS and BADGE_VISUALS
    SHOWCASE_BADGE_IDS.forEach((id) => {
      expect(BADGE_DEFINITIONS.find((b) => b.id === id)).toBeDefined()
      expect(BADGE_VISUALS[id]).toBeDefined()
    })
  })
})
