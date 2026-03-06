'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    fetch('/api/error-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        level: 'fatal',
        message: error.message,
        stack: error.stack,
        path: window.location.pathname,
        metadata: { digest: error.digest },
      }),
    }).catch(() => {})
  }, [error])

  return (
    <html lang="tr">
      <body style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui', background: '#FAFAFA' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Bir sorun olustu</h2>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>Sayfa yuklenirken beklenmeyen bir hata meydana geldi.</p>
          <button
            onClick={reset}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#6B5CE7',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            Tekrar dene
          </button>
        </div>
      </body>
    </html>
  )
}
