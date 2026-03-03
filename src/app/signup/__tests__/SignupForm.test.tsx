import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import SignupForm from '../SignupForm'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('SignupForm', () => {
  it('renders the heading', () => {
    render(<SignupForm />)
    expect(screen.getByText(/create your account/i)).toBeInTheDocument()
  })

  it('renders the Megin logo link', () => {
    render(<SignupForm />)
    const logoLink = screen.getByRole('link', { name: /megin/i })
    expect(logoLink).toHaveAttribute('href', '/')
  })

  it('renders all form fields', () => {
    render(<SignupForm />)
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/gym \/ studio name/i)).toBeInTheDocument()
  })

  it('renders the submit button', () => {
    render(<SignupForm />)
    expect(screen.getByRole('button', { name: /create free account/i })).toBeInTheDocument()
  })

  it('renders the login link', () => {
    render(<SignupForm />)
    const link = screen.getByRole('link', { name: /log in/i })
    expect(link).toHaveAttribute('href', '/login')
  })

  it('renders terms of service link', () => {
    render(<SignupForm />)
    const link = screen.getByRole('link', { name: /terms of service/i })
    expect(link).toHaveAttribute('href', '/legal/terms')
  })

  it('renders privacy policy link', () => {
    render(<SignupForm />)
    const link = screen.getByRole('link', { name: /privacy policy/i })
    expect(link).toHaveAttribute('href', '/legal/privacy')
  })

  it('renders trust signals on right side panel', () => {
    render(<SignupForm />)
    expect(screen.getByText('Free for up to 3 clients')).toBeInTheDocument()
    expect(screen.getByText('No credit card required')).toBeInTheDocument()
    expect(screen.getByText('Cancel anytime')).toBeInTheDocument()
  })

  it('shows success message after form submission', () => {
    render(<SignupForm />)

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { name: 'fullName', value: 'Alex Johnson' },
    })
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { name: 'email', value: 'alex@gym.com' },
    })
    fireEvent.change(screen.getByLabelText(/^password/i), {
      target: { name: 'password', value: 'securepass123' },
    })

    fireEvent.submit(
      screen.getByRole('button', { name: /create free account/i }).closest('form')!
    )

    expect(screen.getByText(/you're on the list!/i)).toBeInTheDocument()
    expect(screen.getByText(/we'll let you know when we launch/i)).toBeInTheDocument()
    expect(screen.getByText(/alex@gym\.com/i)).toBeInTheDocument()
  })

  it('hides the form after submission', () => {
    render(<SignupForm />)
    fireEvent.submit(
      screen.getByRole('button', { name: /create free account/i }).closest('form')!
    )
    expect(screen.queryByRole('button', { name: /create free account/i })).not.toBeInTheDocument()
  })

  it('toggles password visibility', () => {
    render(<SignupForm />)
    const passwordInput = screen.getByLabelText(/^password/i) as HTMLInputElement
    expect(passwordInput.type).toBe('password')

    const toggleBtn = screen.getByRole('button', { name: /show password/i })
    fireEvent.click(toggleBtn)
    expect(passwordInput.type).toBe('text')

    fireEvent.click(screen.getByRole('button', { name: /hide password/i }))
    expect(passwordInput.type).toBe('password')
  })

  it('gym name field is optional', () => {
    render(<SignupForm />)
    const gymInput = screen.getByLabelText(/gym \/ studio name/i)
    expect(gymInput).not.toHaveAttribute('required')
  })

  it('full name, email, and password fields are required', () => {
    render(<SignupForm />)
    expect(screen.getByLabelText(/full name/i)).toHaveAttribute('required')
    expect(screen.getByLabelText(/email address/i)).toHaveAttribute('required')
    expect(screen.getByLabelText(/^password/i)).toHaveAttribute('required')
  })

  it('renders blog link in success state', () => {
    render(<SignupForm />)
    fireEvent.submit(
      screen.getByRole('button', { name: /create free account/i }).closest('form')!
    )
    const blogLink = screen.getByRole('link', { name: /blog/i })
    expect(blogLink).toHaveAttribute('href', '/blog')
  })

  it('updates form state when typing', () => {
    render(<SignupForm />)
    const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement
    fireEvent.change(nameInput, { target: { name: 'fullName', value: 'Jane' } })
    expect(nameInput.value).toBe('Jane')
  })
})
