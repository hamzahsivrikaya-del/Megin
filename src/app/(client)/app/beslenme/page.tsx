import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BeslenmeClient from './BeslenmeClient'

export default async function BeslenmePage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/login')

  const { data: client } = await supabase
    .from('clients')
    .select('id, nutrition_note')
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (!client) redirect('/login')

  const [
    { data: memberMeals },
    { data: mealLogs },
  ] = await Promise.all([
    supabase
      .from('client_meals')
      .select('*')
      .eq('client_id', client.id)
      .order('order_num'),
    supabase
      .from('meal_logs')
      .select('*')
      .eq('client_id', client.id)
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: false }),
  ])

  return (
    <BeslenmeClient
      clientId={client.id}
      nutritionNote={client.nutrition_note}
      memberMeals={memberMeals || []}
      initialLogs={mealLogs || []}
    />
  )
}
