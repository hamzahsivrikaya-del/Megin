import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const rawNext = searchParams.get('next') ?? '/dashboard'
  // Open redirect koruması: sadece relative path kabul et
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/dashboard'

  const type = searchParams.get('type')

  if (code) {
    const cookieStore = await cookies()

    // Cookie'leri redirect response'a aktarmak icin takip et
    const pendingCookies: Array<{ name: string; value: string; options: Record<string, unknown> }> = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
              pendingCookies.push({ name, value, options })
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Sifre sifirlama flow'u — reset sayfasina yonlendir
      const redirectPath = (type === 'recovery' || next === '/login/reset-password')
        ? '/login/reset-password'
        : next

      const response = NextResponse.redirect(`${origin}${redirectPath}`)

      // Session cookie'lerini redirect response'a aktar
      pendingCookies.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
      })

      return response
    }

    console.error('[auth/callback] exchangeCodeForSession error:', error.message)
  }

  // Token hash fallback — Supabase bazi durumlarda code yerine token_hash gonderir
  const tokenHash = searchParams.get('token_hash')
  if (tokenHash && type === 'recovery') {
    const cookieStore = await cookies()
    const pendingCookies: Array<{ name: string; value: string; options: Record<string, unknown> }> = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
              pendingCookies.push({ name, value, options })
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'recovery',
    })
    if (!error) {
      const response = NextResponse.redirect(`${origin}/login/reset-password`)
      pendingCookies.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
      })
      return response
    }

    console.error('[auth/callback] verifyOtp error:', error.message)
  }

  return NextResponse.redirect(`${origin}/login?error=link_gecersiz`)
}
