import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { getTrainerPlan } from '@/lib/subscription'
import FeatureGate from '@/components/shared/FeatureGate'
import HabitsClient from './HabitsClient'

export default async function HabitsPage() {
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

  const admin = createAdminClient()
  const { data: userHabits } = await admin
    .from('client_habits')
    .select('id')
    .eq('client_id', client.id)
    .eq('is_active', true)
    .limit(1)

  // Yoksa setup'a yonlendir
  if (!userHabits || userHabits.length === 0) {
    redirect('/app/aliskanliklar/setup')
  }

  return (
    <FeatureGate plan={plan} feature="habits" role="client">
      <div className="max-w-lg mx-auto px-4 py-6">
        <HabitsClient />
      </div>
    </FeatureGate>
  )
}
