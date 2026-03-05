import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect, notFound } from 'next/navigation'
import { getTrainerPlan } from '@/lib/subscription'
import ClientDetail from './ClientDetail'

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/login')

  const { data: trainer } = await supabase
    .from('trainers')
    .select('id')
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (!trainer) redirect('/onboarding')

  const plan = await getTrainerPlan(supabase, trainer.id)

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .eq('trainer_id', trainer.id)
    .maybeSingle()

  if (!client) notFound()

  const admin = createAdminClient()

  const [
    { data: packages },
    { data: measurements },
    { data: lessons },
    { data: clientMeals },
    { data: mealLogs },
    { data: photos },
    { data: goals },
    { data: dependents },
  ] = await Promise.all([
    admin
      .from('packages')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false }),
    admin
      .from('measurements')
      .select('*')
      .eq('client_id', client.id)
      .order('date', { ascending: false }),
    admin
      .from('lessons')
      .select('*')
      .eq('client_id', client.id)
      .order('date', { ascending: false }),
    admin
      .from('client_meals')
      .select('*')
      .eq('client_id', client.id)
      .order('order_num'),
    admin
      .from('meal_logs')
      .select('*, client_meal:client_meals(*)')
      .eq('client_id', client.id)
      .order('date', { ascending: false }),
    admin
      .from('progress_photos')
      .select('*')
      .eq('client_id', client.id)
      .order('taken_at', { ascending: false }),
    admin
      .from('client_goals')
      .select('*')
      .eq('client_id', client.id),
    admin
      .from('clients')
      .select('id, full_name, avatar_url, created_at')
      .eq('parent_id', client.id)
      .order('created_at', { ascending: true }),
  ])

  return (
    <ClientDetail
      client={client}
      trainerId={trainer.id}
      packages={packages || []}
      measurements={measurements || []}
      lessons={lessons || []}
      clientMeals={clientMeals || []}
      mealLogs={mealLogs || []}
      photos={photos || []}
      goals={goals || []}
      dependents={dependents || []}
      plan={plan}
    />
  )
}
