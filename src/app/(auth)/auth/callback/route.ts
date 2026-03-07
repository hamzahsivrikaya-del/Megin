import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  // Open redirect koruması — sadece relative path
  const safeNext = next && next.startsWith('/') ? next : null

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[auth/callback] exchangeCodeForSession failed:', error.message, error.status)
    }

    if (!error && data.session) {
      // next parametresi varsa oraya yönlendir (örn: davet linki)
      if (safeNext) {
        return NextResponse.redirect(`${origin}${safeNext}`)
      }

      // Rol bazlı yönlendirme
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Trainer mı kontrol et
        const { data: trainer } = await supabase
          .from('trainers')
          .select('id, onboarding_completed')
          .eq('user_id', user.id)
          .maybeSingle()

        if (trainer) {
          const destination = trainer.onboarding_completed
            ? '/dashboard'
            : '/onboarding'
          return NextResponse.redirect(`${origin}${destination}`)
        }

        // Client mı kontrol et
        const { data: client } = await supabase
          .from('clients')
          .select('id, onboarding_completed')
          .eq('user_id', user.id)
          .maybeSingle()

        if (client) {
          const destination = client.onboarding_completed
            ? '/app'
            : '/app/onboarding'
          return NextResponse.redirect(`${origin}${destination}`)
        }

        // Ne trainer ne client — yeni kullanıcı, trainer onboarding'e yönlendir
        return NextResponse.redirect(`${origin}/onboarding`)
      }

      return NextResponse.redirect(`${origin}/onboarding`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
