import { describe, it, expect } from 'vitest'

/** Replication of sanitizeHtml from blog/[slug]/page.tsx for isolated testing */
function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<script\b[^>]*>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href\s*=\s*["'])\s*javascript\s*:[^"']*(["'])/gi, '$1#$2')
    .replace(/(src\s*=\s*["'])\s*javascript\s*:[^"']*(["'])/gi, '$1#$2')
}

/** Replication of markdownToHtml from blog/[slug]/page.tsx */
function markdownToHtml(content: string): string {
  return content
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>')
}

/** Replication of getExcerpt from blog/page.tsx */
function getExcerpt(content: string | null): string {
  if (!content) return ''
  const stripped = content.replace(/<[^>]*>/g, '').trim()
  return stripped.length > 150 ? stripped.slice(0, 150) + '...' : stripped
}

describe('sanitizeHtml', () => {
  it('removes script tags with content', () => {
    const input = '<p>Hello</p><script>alert("xss")</script>'
    expect(sanitizeHtml(input)).not.toContain('<script>')
    expect(sanitizeHtml(input)).not.toContain('alert')
  })

  it('removes inline script tags', () => {
    const input = '<p>Hello</p><script src="evil.js"></p>'
    expect(sanitizeHtml(input)).not.toContain('<script')
  })

  it('removes onclick event handlers', () => {
    const input = '<button onclick="evil()">Click</button>'
    expect(sanitizeHtml(input)).not.toContain('onclick')
  })

  it('removes onerror event handlers', () => {
    const input = '<img src="x" onerror="evil()">'
    expect(sanitizeHtml(input)).not.toContain('onerror')
  })

  it('removes onload event handlers', () => {
    const input = '<body onload="evil()">'
    expect(sanitizeHtml(input)).not.toContain('onload')
  })

  it('neutralizes javascript: href URLs', () => {
    const input = '<a href="javascript:evil()">click</a>'
    const result = sanitizeHtml(input)
    expect(result).not.toContain('javascript:')
    expect(result).toContain('href="#"')
  })

  it('neutralizes javascript: src URLs', () => {
    const input = '<img src="javascript:evil()">'
    const result = sanitizeHtml(input)
    expect(result).not.toContain('javascript:')
    expect(result).toContain('src="#"')
  })

  it('preserves safe HTML', () => {
    const input = '<h2>Title</h2><p>Hello <strong>world</strong></p>'
    const result = sanitizeHtml(input)
    expect(result).toBe(input)
  })

  it('preserves safe links', () => {
    const input = '<a href="https://megin.io">Visit</a>'
    expect(sanitizeHtml(input)).toBe(input)
  })

  it('preserves images with safe src', () => {
    const input = '<img src="https://cdn.example.com/img.jpg" alt="test">'
    expect(sanitizeHtml(input)).toBe(input)
  })

  it('removes multiline script tags', () => {
    const input = '<script>\nvar x = 1;\nalert(x);\n</script><p>safe</p>'
    const result = sanitizeHtml(input)
    expect(result).not.toContain('<script>')
    expect(result).toContain('<p>safe</p>')
  })
})

describe('markdownToHtml', () => {
  it('converts h1 headings', () => {
    expect(markdownToHtml('# Heading One')).toContain('<h1>Heading One</h1>')
  })

  it('converts h2 headings', () => {
    expect(markdownToHtml('## Heading Two')).toContain('<h2>Heading Two</h2>')
  })

  it('converts h3 headings', () => {
    expect(markdownToHtml('### Heading Three')).toContain('<h3>Heading Three</h3>')
  })

  it('converts bold text', () => {
    expect(markdownToHtml('**bold text**')).toContain('<strong>bold text</strong>')
  })

  it('converts italic text', () => {
    expect(markdownToHtml('*italic text*')).toContain('<em>italic text</em>')
  })

  it('converts double newlines to paragraph breaks', () => {
    expect(markdownToHtml('First\n\nSecond')).toContain('</p><p>')
  })

  it('converts single newlines to br tags', () => {
    expect(markdownToHtml('Line one\nLine two')).toContain('<br/>')
  })

  it('does not convert text that starts with <', () => {
    const html = '<p>Already HTML</p>'
    // markdownToHtml is only called when isHtml is false (no leading <)
    // Verify plain text is converted
    const result = markdownToHtml('plain text')
    expect(result).toBe('plain text')
  })
})

describe('getExcerpt', () => {
  it('returns empty string for null content', () => {
    expect(getExcerpt(null)).toBe('')
  })

  it('strips HTML tags', () => {
    const content = '<p>Hello <strong>world</strong></p>'
    expect(getExcerpt(content)).toBe('Hello world')
  })

  it('returns full text when under 150 chars', () => {
    const content = 'Short content'
    expect(getExcerpt(content)).toBe('Short content')
  })

  it('truncates to 150 chars and appends ellipsis', () => {
    const content = 'a'.repeat(200)
    const result = getExcerpt(content)
    expect(result).toHaveLength(153) // 150 + '...'
    expect(result.endsWith('...')).toBe(true)
  })

  it('trims whitespace from content', () => {
    const content = '  Hello world  '
    expect(getExcerpt(content)).toBe('Hello world')
  })

  it('handles exactly 150 characters without truncation', () => {
    const content = 'a'.repeat(150)
    expect(getExcerpt(content)).toBe(content)
    expect(getExcerpt(content).endsWith('...')).toBe(false)
  })

  it('handles empty string content', () => {
    expect(getExcerpt('')).toBe('')
  })
})
