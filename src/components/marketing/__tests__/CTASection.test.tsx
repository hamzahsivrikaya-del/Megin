import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import CTASection from '../CTASection'
import { en } from '@/lib/i18n/en'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('CTASection', () => {
  it('renders title1 and title2', () => {
    render(<CTASection t={en} />)
    expect(screen.getByText(en.cta.title1)).toBeInTheDocument()
    expect(screen.getByText(en.cta.title2)).toBeInTheDocument()
  })

  it('renders CTA button with correct href', () => {
    render(<CTASection t={en} />)
    const link = screen.getByRole('link', { name: new RegExp(en.cta.button) })
    expect(link).toHaveAttribute('href', '/signup')
  })

  it('renders subtext', () => {
    render(<CTASection t={en} />)
    expect(screen.getByText(en.cta.subtext)).toBeInTheDocument()
  })

  it('has white background section', () => {
    const { container } = render(<CTASection t={en} />)
    const section = container.querySelector('section')
    expect(section).toHaveClass('bg-white')
  })

  it('has centered text', () => {
    const { container } = render(<CTASection t={en} />)
    const inner = container.querySelector('.text-center')
    expect(inner).toBeInTheDocument()
  })
})
