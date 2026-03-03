import { SupabaseClient } from '@supabase/supabase-js'
import { Subscription, SubscriptionPlan } from './types'

/** Trainer'ın aktif subscription'ını getir */
export async function getTrainerSubscription(
  supabase: SupabaseClient,
  trainerId: string
): Promise<Subscription | null> {
  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('trainer_id', trainerId)
    .single()

  return data
}

/** Trainer'ın aktif plan'ını getir (fallback: free) */
export async function getTrainerPlan(
  supabase: SupabaseClient,
  trainerId: string
): Promise<SubscriptionPlan> {
  const sub = await getTrainerSubscription(supabase, trainerId)
  if (!sub || sub.status !== 'active') return 'free'
  return sub.plan
}

/** Trainer'ın aktif danışan sayısını getir */
export async function getActiveClientCount(
  supabase: SupabaseClient,
  trainerId: string
): Promise<number> {
  const { count } = await supabase
    .from('clients')
    .select('id', { count: 'exact', head: true })
    .eq('trainer_id', trainerId)
    .eq('is_active', true)

  return count || 0
}
