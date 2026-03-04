import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import StorySection from '../StorySection'
import { en } from '@/lib/i18n/en'

describe('StorySection', () => {
  it('renders heading1 and heading2', () => {
    render(<StorySection t={en} />)
    expect(screen.getByText(en.story.heading1)).toBeInTheDocument()
    expect(screen.getByText(en.story.heading2)).toBeInTheDocument()
  })

  it('renders the founder quote', () => {
    render(<StorySection t={en} />)
    // Quote is wrapped with typographic quotes
    expect(screen.getByText(new RegExp(en.story.quote.slice(0, 30)))).toBeInTheDocument()
  })

  it('renders the author name', () => {
    render(<StorySection t={en} />)
    expect(screen.getByText(en.story.author)).toBeInTheDocument()
  })

  it('renders a blockquote element', () => {
    const { container } = render(<StorySection t={en} />)
    expect(container.querySelector('blockquote')).toBeInTheDocument()
  })

  it('renders blockquote with quote text', () => {
    const { container } = render(<StorySection t={en} />)
    const blockquote = container.querySelector('blockquote')
    expect(blockquote).toBeInTheDocument()
    expect(blockquote?.textContent).toContain(en.story.quote.slice(0, 20))
  })
})
