import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MeasurementForm from './MeasurementForm'

export default async function NewMeasurementPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/login')

  const { data: trainer } = await supabase
    .from('trainers')
    .select('id')
    .eq('user_id', session.user.id)
    .single()

  if (!trainer) redirect('/login')

  const { data: clients } = await supabase
    .from('clients')
    .select('id, full_name')
    .eq('trainer_id', trainer.id)
    .eq('invite_accepted', true)
    .eq('is_active', true)
    .order('full_name')

  return <MeasurementForm clients={clients || []} trainerId={trainer.id} />
}
