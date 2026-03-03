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
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // next parametresi varsa oraya yönlendir (örn: davet linki)
      if (safeNext) {
        return NextResponse.redirect(`${origin}${safeNext}`)
      }

      // Rol bazlı yönlendirme
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: trainer } = await supabase
          .from('trainers')
          .select('id, onboarding_completed')
          .eq('user_id', user.id)
          .maybeSingle()

        if (trainer) {
          // Trainer: onboarding tamamlandıysa dashboard, yoksa onboarding
          const destination = trainer.onboarding_completed
            ? '/dashboard'
            : '/onboarding'
          return NextResponse.redirect(`${origin}${destination}`)
        }

        // Trainer değil — client olarak /app'e yönlendir
        return NextResponse.redirect(`${origin}/app`)
      }

      // Fallback: yeni kayıt — onboarding'e yönlendir
      return NextResponse.redirect(`${origin}/onboarding`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
