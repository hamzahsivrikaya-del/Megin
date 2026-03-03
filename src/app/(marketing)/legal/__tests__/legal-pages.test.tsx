import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PrivacyPolicyPage from '../privacy/page'
import TermsOfServicePage from '../terms/page'
import RefundPolicyPage from '../refund/page'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('PrivacyPolicyPage', () => {
  it('renders the page heading', () => {
    render(<PrivacyPolicyPage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('PRIVACY POLICY')
  })

  it('renders last updated date', () => {
    render(<PrivacyPolicyPage />)
    expect(screen.getByText(/last updated: march 2026/i)).toBeInTheDocument()
  })

  it('renders "Information We Collect" section', () => {
    render(<PrivacyPolicyPage />)
    expect(screen.getByRole('heading', { name: /information we collect/i })).toBeInTheDocument()
  })

  it('renders "How We Use Your Information" section', () => {
    render(<PrivacyPolicyPage />)
    expect(screen.getByRole('heading', { name: /how we use your information/i })).toBeInTheDocument()
  })

  it('renders "Data Sharing" section', () => {
    render(<PrivacyPolicyPage />)
    expect(screen.getByRole('heading', { name: /data sharing/i })).toBeInTheDocument()
  })

  it('renders "Data Retention" section', () => {
    render(<PrivacyPolicyPage />)
    expect(screen.getByRole('heading', { name: /data retention/i })).toBeInTheDocument()
  })

  it('renders "Your Rights" section', () => {
    render(<PrivacyPolicyPage />)
    expect(screen.getByRole('heading', { name: /your rights/i })).toBeInTheDocument()
  })

  it('renders contact email', () => {
    render(<PrivacyPolicyPage />)
    const emailLinks = screen.getAllByRole('link', { name: /hello@megin\.io/i })
    expect(emailLinks.length).toBeGreaterThan(0)
    expect(emailLinks[0]).toHaveAttribute('href', 'mailto:hello@megin.io')
  })

  it('renders breadcrumb navigation', () => {
    render(<PrivacyPolicyPage />)
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/')
  })

  it('links to terms and refund pages', () => {
    render(<PrivacyPolicyPage />)
    expect(screen.getByRole('link', { name: /terms of service/i })).toHaveAttribute('href', '/legal/terms')
    expect(screen.getByRole('link', { name: /refund policy/i })).toHaveAttribute('href', '/legal/refund')
  })
})

describe('TermsOfServicePage', () => {
  it('renders the page heading', () => {
    render(<TermsOfServicePage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('TERMS OF SERVICE')
  })

  it('renders last updated date', () => {
    render(<TermsOfServicePage />)
    expect(screen.getByText(/last updated: march 2026/i)).toBeInTheDocument()
  })

  it('renders "Acceptance of Terms" section', () => {
    render(<TermsOfServicePage />)
    expect(screen.getByRole('heading', { name: /acceptance of terms/i })).toBeInTheDocument()
  })

  it('renders "Account Registration" section', () => {
    render(<TermsOfServicePage />)
    expect(screen.getByRole('heading', { name: /account registration/i })).toBeInTheDocument()
  })

  it('renders "Use License" section', () => {
    render(<TermsOfServicePage />)
    expect(screen.getByRole('heading', { name: /use license/i })).toBeInTheDocument()
  })

  it('renders "Payments and Subscriptions" section', () => {
    render(<TermsOfServicePage />)
    expect(screen.getByRole('heading', { name: /payments and subscriptions/i })).toBeInTheDocument()
  })

  it('renders "Termination" section', () => {
    render(<TermsOfServicePage />)
    expect(screen.getByRole('heading', { name: /termination/i })).toBeInTheDocument()
  })

  it('renders "Disclaimers" section', () => {
    render(<TermsOfServicePage />)
    expect(screen.getByRole('heading', { name: /disclaimers/i })).toBeInTheDocument()
  })

  it('renders contact email', () => {
    render(<TermsOfServicePage />)
    const emailLinks = screen.getAllByRole('link', { name: /hello@megin\.io/i })
    expect(emailLinks.length).toBeGreaterThan(0)
  })

  it('links to privacy and refund pages', () => {
    render(<TermsOfServicePage />)
    expect(screen.getByRole('link', { name: /privacy policy/i })).toHaveAttribute('href', '/legal/privacy')
    expect(screen.getByRole('link', { name: /refund policy/i })).toHaveAttribute('href', '/legal/refund')
  })

  it('renders breadcrumb', () => {
    render(<TermsOfServicePage />)
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/')
  })
})

describe('RefundPolicyPage', () => {
  it('renders the page heading', () => {
    render(<RefundPolicyPage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('REFUND POLICY')
  })

  it('renders last updated date', () => {
    render(<RefundPolicyPage />)
    expect(screen.getByText(/last updated: march 2026/i)).toBeInTheDocument()
  })

  it('renders "Eligibility" section', () => {
    render(<RefundPolicyPage />)
    expect(screen.getByRole('heading', { name: /eligibility/i })).toBeInTheDocument()
  })

  it('renders "How to Request a Refund" section', () => {
    render(<RefundPolicyPage />)
    expect(screen.getByRole('heading', { name: /how to request a refund/i })).toBeInTheDocument()
  })

  it('renders "Timeline" section', () => {
    render(<RefundPolicyPage />)
    expect(screen.getByRole('heading', { name: /timeline/i })).toBeInTheDocument()
  })

  it('renders "Exceptions" section', () => {
    render(<RefundPolicyPage />)
    expect(screen.getByRole('heading', { name: /exceptions/i })).toBeInTheDocument()
  })

  it('renders contact email', () => {
    render(<RefundPolicyPage />)
    const emailLinks = screen.getAllByRole('link', { name: /hello@megin\.io/i })
    expect(emailLinks.length).toBeGreaterThan(0)
  })

  it('mentions 14-day money-back guarantee', () => {
    render(<RefundPolicyPage />)
    expect(screen.getByText(/14-day money-back guarantee/i)).toBeInTheDocument()
  })

  it('links to privacy and terms pages', () => {
    render(<RefundPolicyPage />)
    expect(screen.getByRole('link', { name: /privacy policy/i })).toHaveAttribute('href', '/legal/privacy')
    expect(screen.getByRole('link', { name: /terms of service/i })).toHaveAttribute('href', '/legal/terms')
  })

  it('renders breadcrumb', () => {
    render(<RefundPolicyPage />)
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/')
  })
})
