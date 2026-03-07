import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const LOCALE_COOKIE = 'megin-locale'

function detectLocale(request: NextRequest): 'tr' | 'en' {
  // 1. Cookie (user preference)
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value
  if (cookie === 'tr' || cookie === 'en') return cookie

  // 2. Vercel Geo header
  const country = request.headers.get('x-vercel-ip-country')
  if (country === 'TR') return 'tr'

  // 3. Accept-Language header
  const acceptLang = request.headers.get('accept-language') ?? ''
  if (acceptLang.match(/\btr\b/)) return 'tr'

  return 'en'
}

// Marketing paths that should be locale-redirected
const marketingRoutes = ['/', '/features', '/pricing', '/use-cases', '/blog', '/tools', '/contact', '/legal']

function isMarketingPath(pathname: string): boolean {
  if (pathname === '/') return true
  // /tr or /tr/... are TR marketing paths
  if (pathname === '/tr' || pathname.startsWith('/tr/')) return true
  return marketingRoutes.some((r) => r !== '/' && (pathname === r || pathname.startsWith(r + '/')))
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // --- Locale redirect for marketing pages ---
  if (isMarketingPath(pathname)) {
    const locale = detectLocale(request)
    const hasCookie = !!request.cookies.get(LOCALE_COOKIE)?.value
    const isOnTr = pathname === '/tr' || pathname.startsWith('/tr/')

    if (locale === 'tr' && !isOnTr) {
      // Should be on /tr/... but isn't
      const url = request.nextUrl.clone()
      url.pathname = pathname === '/' ? '/tr' : `/tr${pathname}`
      const response = NextResponse.redirect(url)
      if (!hasCookie) response.cookies.set(LOCALE_COOKIE, 'tr', { path: '/', maxAge: 60 * 60 * 24 * 365 })
      return response
    }

    if (locale === 'en' && isOnTr) {
      // Should be on /... but is on /tr/...
      const url = request.nextUrl.clone()
      const stripped = pathname.replace(/^\/tr\/?/, '/')
      url.pathname = stripped === '' ? '/' : stripped
      const response = NextResponse.redirect(url)
      if (!hasCookie) response.cookies.set(LOCALE_COOKIE, 'en', { path: '/', maxAge: 60 * 60 * 24 * 365 })
      return response
    }
  }

  // Public rotalar — auth gerektirmeyen sayfalar
  const publicPaths = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/auth/callback',
    '/onboarding',
  ]

  const marketingPrefixes = [
    '/features',
    '/pricing',
    '/use-cases',
    '/blog',
    '/tools',
    '/contact',
    '/legal',
    '/tr',
    '/araclar',
    '/antrenmanlar',
    '/yasal',
  ]

  // Korumalı tek-segmentli path'ler — username regex'ten hariç tutulmalı
  const reservedPaths = ['/dashboard', '/app', '/settings', '/admin']
  const isReservedPath = reservedPaths.some((p) =>
    pathname === p || pathname.startsWith(p + '/')
  )

  const isPublicPath =
    publicPaths.includes(pathname) ||
    pathname.startsWith('/api/') ||
    marketingPrefixes.some((p) => pathname.startsWith(p)) ||
    (!isReservedPath && pathname.match(/^\/[a-z0-9_-]+$/) !== null) || // /<username> public profil
    pathname.match(/^\/[a-z0-9_-]+\/davet\/[a-z0-9]+$/) !== null // /<handle>/davet/<token>

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Onboarding redirect — /app/* rotaları için
  if (user && pathname.startsWith('/app') && pathname !== '/app/onboarding') {
    const { data: client } = await supabase
      .from('clients')
      .select('onboarding_completed')
      .eq('user_id', user.id)
      .maybeSingle()

    if (client && client.onboarding_completed === false) {
      const url = request.nextUrl.clone()
      url.pathname = '/app/onboarding'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
