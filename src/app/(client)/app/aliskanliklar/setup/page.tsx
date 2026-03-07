import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { getTrainerPlan } from '@/lib/subscription'
import FeatureGate from '@/components/shared/FeatureGate'
import SetupClient from './SetupClient'

export default async function HabitSetupPage() {
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

  const { data: definitions } = await admin
    .from('habit_definitions')
    .select('*')
    .order('category')
    .order('order_num')

  const { data: existing } = await admin
    .from('client_habits')
    .select('habit_id')
    .eq('client_id', client.id)
    .eq('is_active', true)
    .is('assigned_by', null)

  const existingIds = (existing || []).map(e => e.habit_id).filter(Boolean)

  return (
    <FeatureGate plan={plan} feature="habits" role="client">
      <div className="max-w-lg mx-auto px-4 py-6 panel-section-enter">
        <SetupClient definitions={definitions || []} existingIds={existingIds} hasExisting={existingIds.length > 0} />
      </div>
    </FeatureGate>
  )
}
