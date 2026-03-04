import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ProblemStrip from '../ProblemStrip'
import { en } from '@/lib/i18n/en'

describe('ProblemStrip', () => {
  it('renders all three problem lines', () => {
    render(<ProblemStrip t={en} />)
    expect(screen.getByText(en.problem.line1)).toBeInTheDocument()
    expect(screen.getByText(en.problem.line2)).toBeInTheDocument()
    expect(screen.getByText(en.problem.line3)).toBeInTheDocument()
  })

  it('has dark warm section styling', () => {
    const { container } = render(<ProblemStrip t={en} />)
    const section = container.querySelector('section')
    expect(section).toHaveClass('mkt-section-dark-warm')
  })

  it('line3 uses gradient text', () => {
    render(<ProblemStrip t={en} />)
    expect(screen.getByText(en.problem.line3)).toBeInTheDocument()
  })
})
