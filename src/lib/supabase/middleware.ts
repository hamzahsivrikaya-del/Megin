import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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

  // Public rotalar — auth gerektirmeyen sayfalar
  const publicPaths = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/auth/callback',
  ]

  const isPublicPath = publicPaths.some(
    (path) =>
      request.nextUrl.pathname === path ||
      request.nextUrl.pathname.startsWith('/api/') ||
      request.nextUrl.pathname.match(/^\/[a-z0-9_-]+$/) || // /<username> public profil
      request.nextUrl.pathname.match(/^\/[a-z0-9_-]+\/davet\/[a-z0-9]+$/) // /<handle>/davet/<token>
  )

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Onboarding redirect — /app/* rotaları için
  if (user && request.nextUrl.pathname.startsWith('/app') && request.nextUrl.pathname !== '/app/onboarding') {
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
