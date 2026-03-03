import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import FeaturesGrid from '../FeaturesGrid'
import { en } from '@/lib/i18n/en'

// next/link mock
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// useScrollReveal mock — jsdom doesn't support IntersectionObserver
vi.mock('@/lib/hooks/useScrollReveal', () => ({
  useScrollReveal: () => ({ current: null }),
}))

describe('FeaturesGrid', () => {
  it('renders section headings', () => {
    render(<FeaturesGrid t={en} />)
    expect(screen.getByText(en.features.title1)).toBeInTheDocument()
    expect(screen.getByText(en.features.title2)).toBeInTheDocument()
  })

  it('renders all 6 feature cards', () => {
    render(<FeaturesGrid t={en} />)
    en.features.items.forEach((item) => {
      expect(screen.getByText(item.title)).toBeInTheDocument()
      expect(screen.getByText(item.description)).toBeInTheDocument()
    })
  })

  it('renders "See All" link pointing to /features', () => {
    render(<FeaturesGrid t={en} />)
    const link = screen.getByRole('link', { name: new RegExp(en.features.seeAll) })
    expect(link).toHaveAttribute('href', '/features')
  })

  it('has correct number of feature card headings', () => {
    render(<FeaturesGrid t={en} />)
    const headings = screen.getAllByRole('heading', { level: 3 })
    expect(headings).toHaveLength(6)
  })
})
