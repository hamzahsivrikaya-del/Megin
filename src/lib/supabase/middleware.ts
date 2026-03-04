import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Public rotalar - auth gerektirmez (Supabase client'tan önce kontrol et)
  const isPublicRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/features') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/use-cases') ||
    pathname.startsWith('/contact') ||
    pathname.startsWith('/tools') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/tr') ||
    pathname.startsWith('/legal') ||
    pathname.startsWith('/blog') ||
    pathname.startsWith('/araclar') ||
    pathname.startsWith('/antrenmanlar') ||
    pathname.startsWith('/yasal') ||
    pathname === '/' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/cron') ||
    pathname.startsWith('/api/push') ||
    pathname.startsWith('/api/share') ||
    pathname.includes('.')

  // Supabase env yoksa public route'ları direkt geçir, auth route'ları login'e yönlendir
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    if (isPublicRoute) return NextResponse.next({ request })
    return NextResponse.redirect(new URL('/login', request.url))
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
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

  if (isPublicRoute) {
    // Giriş yapmış kullanıcıyı login veya landing page'den yönlendir
    if (pathname === '/login' && user) {
      const cachedRole = request.cookies.get('x-user-role')?.value
      let role: string | null = null

      if (cachedRole === 'admin' || cachedRole === 'member') {
        role = cachedRole
      } else {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()
        role = profile?.role || null

        if (role) {
          supabaseResponse.cookies.set('x-user-role', role, {
            httpOnly: true,
            sameSite: 'lax',
            secure: true,
            maxAge: 3600,
            path: '/',
          })
        }
      }

      const redirectUrl = role === 'admin' ? '/admin' : '/dashboard'
      const response = NextResponse.redirect(new URL(redirectUrl, request.url))
      // Cache cookie'sini redirect response'a da ekle
      if (role && !(cachedRole === 'admin' || cachedRole === 'member')) {
        response.cookies.set('x-user-role', role, {
          httpOnly: true,
          sameSite: 'lax',
          secure: true,
          maxAge: 3600,
          path: '/',
        })
      }
      return response
    }
    return supabaseResponse
  }

  // Auth gerektiren rotalar
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Rol kontrolü — cookie cache ile
  const cachedRole = request.cookies.get('x-user-role')?.value
  let role: string | null = null

  if (cachedRole === 'admin' || cachedRole === 'member') {
    role = cachedRole
  } else {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    role = profile?.role || null

    if (role) {
      supabaseResponse.cookies.set('x-user-role', role, {
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        maxAge: 3600,
        path: '/',
      })
    }
  }

  // Admin rotaları
  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Üye rotaları
  if (pathname.startsWith('/dashboard') && role === 'admin') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return supabaseResponse
}
