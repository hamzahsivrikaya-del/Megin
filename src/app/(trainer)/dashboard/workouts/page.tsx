import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import WorkoutManager from './WorkoutManager'

export default async function AdminWorkoutsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/login')

  const { data: trainer } = await supabase
    .from('trainers')
    .select('id')
    .eq('user_id', session.user.id)
    .single()

  if (!trainer) redirect('/login')

  // Bu haftanın pazartesi günü
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now.setDate(diff))
  const mondayStr = monday.toISOString().split('T')[0]

  const [{ data: workouts }, { data: clients }] = await Promise.all([
    supabase
      .from('workouts')
      .select('*, exercises:workout_exercises(*)')
      .eq('trainer_id', trainer.id)
      .eq('type', 'public')
      .eq('week_start', mondayStr)
      .order('day_index'),
    supabase
      .from('clients')
      .select('id, full_name')
      .eq('trainer_id', trainer.id)
      .eq('invite_accepted', true)
      .eq('is_active', true)
      .order('full_name'),
  ])

  return (
    <WorkoutManager
      initialWorkouts={workouts || []}
      clients={clients || []}
      initialWeek={mondayStr}
      trainerId={trainer.id}
    />
  )
}
