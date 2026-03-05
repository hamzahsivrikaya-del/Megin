import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTrainerPlan } from '@/lib/subscription'
import { SubscriptionPlan } from '@/lib/types'
import TrainerLayoutClient from './TrainerLayoutClient'

export default async function TrainerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/login')

  const { data: trainer } = await supabase
    .from('trainers')
    .select('id, full_name')
    .eq('user_id', session.user.id)
    .single()

  if (!trainer) redirect('/login')

  let plan: SubscriptionPlan = 'free'
  try {
    plan = await getTrainerPlan(supabase, trainer.id)
  } catch { /* fallback free */ }

  return (
    <TrainerLayoutClient trainerName={trainer.full_name || 'MEGIN'} plan={plan}>
      {children}
    </TrainerLayoutClient>
  )
}
