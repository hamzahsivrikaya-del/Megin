import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PLAN_CONFIGS } from '@/lib/plans'
import { getTrainerPlan } from '@/lib/subscription'
import UpgradeClient from './UpgradeClient'

export default async function UpgradePage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/login')

  const { data: trainer } = await supabase
    .from('trainers')
    .select('id')
    .eq('user_id', session.user.id)
    .single()

  if (!trainer) redirect('/login')

  const currentPlan = await getTrainerPlan(supabase, trainer.id)

  return <UpgradeClient currentPlan={currentPlan} plans={PLAN_CONFIGS} />
}
