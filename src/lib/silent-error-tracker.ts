/**
 * Client-side sessiz hata yakalayici
 *
 * Yakaladigi durumlar:
 * - Beklenmeyen logout (session varken login'e redirect)
 * - API 401 hatalari (token expired)
 * - Fetch/network hatalari
 * - Unhandled promise rejection
 */

const ERROR_LOG_URL = '/api/error-log'

function report(type: string, detail: Record<string, unknown> = {}) {
  fetch(ERROR_LOG_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      level: 'error',
      message: `[silent] ${type}`,
      path: window.location.pathname,
      metadata: { type, ...detail, userAgent: navigator.userAgent },
    }),
  }).catch(() => {})
}

export function initSilentErrorTracker() {
  // 1. Beklenmeyen logout tespiti
  // Login sayfasina gelindiyse ama daha once giris yapilmissa
  if (window.location.pathname === '/login') {
    const hadSession = document.cookie.includes('sb-')
    const isRedirected = document.referrer && !document.referrer.includes('/login')
    if (hadSession || isRedirected) {
      report('unexpected_logout', {
        hadCookie: hadSession,
        referrer: document.referrer || 'direct',
      })
    }
  }

  // 2. Global fetch interceptor — 401 yakalama
  const originalFetch = window.fetch
  window.fetch = async function (...args) {
    try {
      const response = await originalFetch.apply(this, args)
      const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request)?.url || ''

      if (response.status === 401 && url.startsWith('/api/')) {
        report('api_401', { url })
      }

      return response
    } catch (err) {
      const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request)?.url || ''
      if (url.startsWith('/api/')) {
        report('fetch_error', { url, error: (err as Error).message })
      }
      throw err
    }
  }

  // 3. Unhandled promise rejection
  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message || event.reason?.toString() || 'unknown'
    // Chunk load hatasi (deploy sonrasi eski JS)
    if (message.includes('Loading chunk') || message.includes('ChunkLoadError')) {
      report('chunk_load_error', { error: message })
      return
    }
    report('unhandled_rejection', { error: message })
  })

  // 4. Global error handler (yakalanmamis JS hatalari)
  window.addEventListener('error', (event) => {
    // CORS script hatalari (3rd party)
    if (!event.filename || event.filename === '') return
    report('js_error', {
      error: event.message,
      file: event.filename,
      line: event.lineno,
      col: event.colno,
    })
  })
}
