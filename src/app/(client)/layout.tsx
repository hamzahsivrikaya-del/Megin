import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ClientNavbar from '@/components/shared/ClientNavbar'
import Heartbeat from '@/components/shared/Heartbeat'
import { getTrainerPlan } from '@/lib/subscription'

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/login')

  const { data: client } = await supabase
    .from('clients')
    .select('full_name, onboarding_completed, trainer_id')
    .eq('user_id', session.user.id)
    .maybeSingle()

  // Trainer plan'ını getir (feature gating için)
  const plan = client?.trainer_id
    ? await getTrainerPlan(supabase, client.trainer_id)
    : 'free' as const

  // Onboarding sayfasında navbar gösterme (middleware redirect zaten hallediyor)
  if (client && !client.onboarding_completed) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Heartbeat />
      <ClientNavbar userName={client?.full_name || ''} plan={plan} />
      <main className="p-4 md:p-6 max-w-5xl mx-auto">
        {children}
      </main>
    </div>
  )
}
