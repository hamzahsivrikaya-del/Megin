import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ClientsPage from './ClientsPage'

export default async function ClientsRoute() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: trainer } = await supabase
    .from('trainers')
    .select('id, username')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!trainer) redirect('/onboarding')

  const { data: clients } = await supabase
    .from('clients')
    .select('*, packages(id, total_lessons, used_lessons, status)')
    .eq('trainer_id', trainer.id)
    .order('created_at', { ascending: false })

  return <ClientsPage clients={clients ?? []} trainerUsername={trainer.username} />
}
