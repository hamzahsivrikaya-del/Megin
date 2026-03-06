import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notifyTrainer } from '@/lib/trainer-notify'
import { safeCompare } from '@/lib/auth-utils'

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

  // Tum aktif trainer'lar
  const { data: trainers } = await admin
    .from('trainers')
    .select('id, user_id')
    .eq('is_active', true)

  if (!trainers?.length) return NextResponse.json({ message: 'Trainer yok' })

  let sent = 0
  for (const trainer of trainers) {
    if (!trainer.user_id) continue

    // Dedup
    const { data: existing } = await admin
      .from('notifications')
      .select('id')
      .eq('trainer_id', trainer.id)
      .eq('type', 'daily_summary')
      .gte('sent_at', `${today}T00:00:00`)
      .limit(1)

    if (existing?.length) continue

    // Trainer'in danisanlari
    const { data: clients } = await admin
      .from('clients')
      .select('id')
      .eq('trainer_id', trainer.id)

    if (!clients?.length) continue

    const clientIds = clients.map(c => c.id)
    const totalClients = clientIds.length

    // Bugun aliskanlik tamamlayan danisan sayisi
    const { data: habitLogs } = await admin
      .from('habit_logs')
      .select('client_id')
      .in('client_id', clientIds)
      .eq('date', today)
      .eq('completed', true)

    const habitsCompletedClients = new Set(habitLogs?.map(l => l.client_id) || []).size

    // Bugun beslenme giren danisan sayisi
    const { data: mealLogs } = await admin
      .from('meal_logs')
      .select('client_id')
      .in('client_id', clientIds)
      .gte('created_at', `${today}T00:00:00`)

    const nutritionClients = new Set(mealLogs?.map(l => l.client_id) || []).size

    const parts: string[] = []
    parts.push(`${habitsCompletedClients}/${totalClients} danışan alışkanlık girdi`)
    parts.push(`${nutritionClients}/${totalClients} danışan beslenme girdi`)

    await notifyTrainer({
      trainerId: trainer.id,
      trainerUserId: trainer.user_id,
      type: 'daily_summary',
      title: 'Günlük Özet',
      message: parts.join(', ') + '.',
    })
    sent++
  }

  return NextResponse.json({ ok: true, sent })
}
