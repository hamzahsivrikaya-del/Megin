import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OnboardingClient from './OnboardingClient'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: client } = await supabase
    .from('clients')
    .select('onboarding_completed')
    .eq('user_id', user.id)
    .maybeSingle()

  // Onboarding zaten tamamlandıysa ana sayfaya yönlendir
  if (!client || client.onboarding_completed === true) {
    redirect('/app')
  }

  return <OnboardingClient />
}
