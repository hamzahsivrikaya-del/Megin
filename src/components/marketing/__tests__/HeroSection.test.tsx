import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import HeroSection from '../HeroSection'
import { en } from '@/lib/i18n/en'

// next/link mock
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('HeroSection', () => {
  it('renders title1 and title2', () => {
    render(<HeroSection t={en} />)
    expect(screen.getByText(en.hero.title1)).toBeInTheDocument()
    expect(screen.getByText(en.hero.title2)).toBeInTheDocument()
  })

  it('renders subtitle text', () => {
    render(<HeroSection t={en} />)
    expect(screen.getByText(en.hero.subtitle)).toBeInTheDocument()
  })

  it('renders CTA button linking to /signup', () => {
    render(<HeroSection t={en} />)
    const link = screen.getByRole('link', { name: new RegExp(en.hero.cta) })
    expect(link).toHaveAttribute('href', '/signup')
  })

  it('renders trust signals', () => {
    render(<HeroSection t={en} />)
    expect(screen.getByText(en.hero.trustNoCreditCard)).toBeInTheDocument()
    expect(screen.getByText(en.hero.trustFreeClients)).toBeInTheDocument()
  })

  it('renders dashboard mockup placeholder', () => {
    render(<HeroSection t={en} />)
    expect(screen.getByText('Dashboard Preview')).toBeInTheDocument()
  })

  it('has correct section element', () => {
    const { container } = render(<HeroSection t={en} />)
    const section = container.querySelector('section')
    expect(section).toBeInTheDocument()
  })
})
