import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import NumbersStrip from '../NumbersStrip'
import { en } from '@/lib/i18n/en'

// AnimatedCounter uses IntersectionObserver — mock it
vi.mock('@/components/shared/AnimatedCounter', () => ({
  default: ({ end, suffix = '' }: { end: number; suffix?: string }) => (
    <span>{end}{suffix}</span>
  ),
}))

describe('NumbersStrip', () => {
  it('renders all stat labels', () => {
    render(<NumbersStrip t={en} />)
    en.numbers.items.forEach((item) => {
      expect(screen.getByText(item.label)).toBeInTheDocument()
      expect(screen.getByText(item.sublabel)).toBeInTheDocument()
    })
  })

  it('renders correct AnimatedCounter values', () => {
    render(<NumbersStrip t={en} />)
    // "500+" → end=500, suffix="+"
    expect(screen.getByText('500+')).toBeInTheDocument()
    // "10,000+" → end=10000, suffix="+"
    expect(screen.getByText('10000+')).toBeInTheDocument()
    // "98%" → end=98, suffix="%"
    expect(screen.getByText('98%')).toBeInTheDocument()
  })

  it('has dark section styling', () => {
    const { container } = render(<NumbersStrip t={en} />)
    const section = container.querySelector('section')
    expect(section).toHaveClass('mkt-section-dark')
  })

  it('renders a 3-column grid', () => {
    const { container } = render(<NumbersStrip t={en} />)
    const grid = container.querySelector('.grid-cols-3')
    expect(grid).toBeInTheDocument()
  })
})
