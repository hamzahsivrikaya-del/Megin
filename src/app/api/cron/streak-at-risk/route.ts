import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notifyClient } from '@/lib/trainer-notify'
import { safeCompare } from '@/lib/auth-utils'
import { hasFeatureAccess } from '@/lib/plans'
import { SubscriptionPlan } from '@/lib/types'

export const dynamic = 'force-dynamic'

function verifyCronSecret(request: NextRequest): boolean {
  const auth = request.headers.get('authorization') || ''
  return safeCompare(auth, `Bearer ${process.env.CRON_SECRET}`)
}

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const turkeyNow = new Date(Date.now() + 3 * 60 * 60 * 1000)
  const turkeyHour = turkeyNow.getUTCHours()

  // 21:00-22:00 TR arasi
  if (turkeyHour < 21 || turkeyHour > 21) {
    return NextResponse.json({ message: 'Saat araligi disinda', hour: turkeyHour })
  }

  const admin = createAdminClient()
  const today = turkeyNow.toISOString().slice(0, 10)
  const yesterday = new Date(turkeyNow.getTime() - 86400000).toISOString().slice(0, 10)

  // Dun tum aliskanliklari tamamlamis danisanlari bul (streak > 0 potansiyeli)
  const { data: clientHabits } = await admin
    .from('client_habits')
    .select('client_id')
    .eq('is_active', true)

  if (!clientHabits?.length) return NextResponse.json({ message: 'Danisan yok' })

  const clientIds = [...new Set(clientHabits.map(h => h.client_id))]

  let sent = 0
  for (const clientId of clientIds) {
    const { data: client } = await admin
      .from('clients')
      .select('id, user_id, trainer_id')
      .eq('id', clientId)
      .maybeSingle()

    if (!client?.user_id || !client.trainer_id) continue

    const { data: sub } = await admin
      .from('subscriptions')
      .select('plan')
      .eq('trainer_id', client.trainer_id)
      .maybeSingle()

    const plan = (sub?.plan || 'free') as SubscriptionPlan
    if (!hasFeatureAccess(plan, 'habits')) continue

    // Aktif habit sayisi
    const { count: totalHabits } = await admin
      .from('client_habits')
      .select('id', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .eq('is_active', true)

    if (!totalHabits) continue

    // Dun tamamlanan (streak kontrolu - dun full mu?)
    const { count: yesterdayCompleted } = await admin
      .from('habit_logs')
      .select('id', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .eq('date', yesterday)
      .eq('completed', true)

    // Dun tamamlanmadiysa streak zaten yok
    if ((yesterdayCompleted || 0) < totalHabits) continue

    // Bugun tamamlanan
    const { count: todayCompleted } = await admin
      .from('habit_logs')
      .select('id', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .eq('date', today)
      .eq('completed', true)

    // Bugun zaten tamamladiysa risk yok
    if ((todayCompleted || 0) >= totalHabits) continue

    // Dedup
    const { data: existing } = await admin
      .from('notifications')
      .select('id')
      .eq('client_id', clientId)
      .eq('type', 'streak_at_risk')
      .gte('sent_at', `${today}T00:00:00`)
      .limit(1)

    if (existing?.length) continue

    await notifyClient({
      clientUserId: client.user_id,
      trainerId: client.trainer_id,
      clientId,
      type: 'streak_at_risk',
      title: 'Serin Tehlikede!',
      message: 'Bugün tüm alışkanlıklarını tamamla, yoksa serin sıfırlanacak!',
    })
    sent++
  }

  return NextResponse.json({ ok: true, sent })
}
