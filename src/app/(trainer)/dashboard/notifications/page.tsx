import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NotificationsManager from './NotificationsManager'

export default async function TrainerNotificationsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/login')

  const { data: trainer } = await supabase
    .from('trainers')
    .select('id')
    .eq('user_id', session.user.id)
    .single()

  if (!trainer) redirect('/login')

  const [
    { data: notifications },
    { data: clients },
  ] = await Promise.all([
    supabase
      .from('notifications')
      .select('*, clients(full_name)')
      .eq('trainer_id', trainer.id)
      .order('sent_at', { ascending: false })
      .limit(50),
    supabase
      .from('clients')
      .select('id, user_id, full_name')
      .eq('trainer_id', trainer.id)
      .eq('invite_accepted', true)
      .eq('is_active', true)
      .order('full_name'),
  ])

  return (
    <NotificationsManager
      initialNotifications={notifications || []}
      clients={clients || []}
      trainerId={trainer.id}
    />
  )
}
