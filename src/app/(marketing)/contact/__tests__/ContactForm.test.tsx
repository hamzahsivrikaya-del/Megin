import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ContactForm from '../ContactForm'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('ContactForm', () => {
  it('renders the page heading', () => {
    render(<ContactForm />)
    expect(screen.getByText("LET'S TALK")).toBeInTheDocument()
  })

  it('renders all form fields', () => {
    render(<ContactForm />)
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/how many clients/i)).toBeInTheDocument()
  })

  it('renders client count dropdown with correct options', () => {
    render(<ContactForm />)
    const select = screen.getByLabelText(/how many clients/i)
    expect(select).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '1 – 5 clients' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '6 – 15 clients' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '16 – 30 clients' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '30+ clients' })).toBeInTheDocument()
  })

  it('renders the submit button', () => {
    render(<ContactForm />)
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument()
  })

  it('renders the contact email', () => {
    render(<ContactForm />)
    const emailLink = screen.getByRole('link', { name: 'hello@megin.io' })
    expect(emailLink).toHaveAttribute('href', 'mailto:hello@megin.io')
  })

  it('renders the "get started free" link', () => {
    render(<ContactForm />)
    const link = screen.getByRole('link', { name: /get started free/i })
    expect(link).toHaveAttribute('href', '/signup')
  })

  it('renders the FAQ link', () => {
    render(<ContactForm />)
    const link = screen.getByRole('link', { name: /view faq/i })
    expect(link).toHaveAttribute('href', '/pricing#faq')
  })

  it('shows success message after form submission', () => {
    render(<ContactForm />)

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { name: 'name', value: 'Jane Smith' },
    })
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { name: 'email', value: 'jane@gym.com' },
    })
    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { name: 'message', value: 'Hello there!' },
    })

    fireEvent.submit(screen.getByRole('button', { name: /send message/i }).closest('form')!)

    expect(screen.getByText('Message sent!')).toBeInTheDocument()
    expect(screen.getByText(/thanks for reaching out, jane/i)).toBeInTheDocument()
  })

  it('shows "Send another message" button after submission', () => {
    render(<ContactForm />)
    fireEvent.submit(screen.getByRole('button', { name: /send message/i }).closest('form')!)
    expect(screen.getByRole('button', { name: /send another message/i })).toBeInTheDocument()
  })

  it('resets form when "Send another message" is clicked', () => {
    render(<ContactForm />)

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { name: 'name', value: 'Jane Smith' },
    })
    fireEvent.submit(screen.getByRole('button', { name: /send message/i }).closest('form')!)

    fireEvent.click(screen.getByRole('button', { name: /send another message/i }))

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.queryByText('Message sent!')).not.toBeInTheDocument()
  })

  it('hides "get started free" link after submission', () => {
    render(<ContactForm />)
    fireEvent.submit(screen.getByRole('button', { name: /send message/i }).closest('form')!)
    expect(screen.queryByRole('link', { name: /get started free/i })).not.toBeInTheDocument()
  })

  it('updates form state on input change', () => {
    render(<ContactForm />)
    const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement
    fireEvent.change(nameInput, { target: { name: 'name', value: 'Alex' } })
    expect(nameInput.value).toBe('Alex')
  })

  it('client count dropdown is optional (empty default)', () => {
    render(<ContactForm />)
    const select = screen.getByLabelText(/how many clients/i) as HTMLSelectElement
    expect(select.value).toBe('')
  })

  it('renders response time info', () => {
    render(<ContactForm />)
    expect(screen.getByText('Within 1–2 business days')).toBeInTheDocument()
  })
})
