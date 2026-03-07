import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTrainerPlan } from '@/lib/subscription'
import FeatureGate from '@/components/shared/FeatureGate'
import RozetlerClient from './RozetlerClient'

export default async function RozetlerPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/login')

  const { data: client } = await supabase
    .from('clients')
    .select('id, trainer_id')
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (!client) redirect('/login')

  const plan = await getTrainerPlan(supabase, client.trainer_id)

  return (
    <FeatureGate plan={plan} feature="badges" role="client">
      <RozetlerClient />
    </FeatureGate>
  )
}
