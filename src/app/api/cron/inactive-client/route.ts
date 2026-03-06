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

  // 09:00-10:00 TR arasi
  if (turkeyHour < 9 || turkeyHour > 9) {
    return NextResponse.json({ message: 'Saat araligi disinda', hour: turkeyHour })
  }

  const admin = createAdminClient()
  const today = turkeyNow.toISOString().slice(0, 10)
  const threeDaysAgo = new Date(turkeyNow.getTime() - 3 * 86400000).toISOString()

  // 3+ gundur giris yapmayan danisanlar
  const { data: inactiveClients } = await admin
    .from('clients')
    .select('id, full_name, trainer_id, user_id, last_seen_at')
    .not('last_seen_at', 'is', null)
    .lt('last_seen_at', threeDaysAgo)

  if (!inactiveClients?.length) return NextResponse.json({ message: 'Inaktif danisan yok' })

  // Trainer'lari grupla
  const trainerMap = new Map<string, typeof inactiveClients>()
  for (const client of inactiveClients) {
    if (!client.trainer_id) continue
    const list = trainerMap.get(client.trainer_id) || []
    list.push(client)
    trainerMap.set(client.trainer_id, list)
  }

  let sent = 0
  for (const [trainerId, clients] of trainerMap) {
    const { data: trainer } = await admin
      .from('trainers')
      .select('id, user_id')
      .eq('id', trainerId)
      .maybeSingle()

    if (!trainer?.user_id) continue

    for (const client of clients) {
      // Dedup: son 3 gun icinde ayni danisan icin bildirim gitmemisse
      const threeDaysAgoDate = new Date(turkeyNow.getTime() - 3 * 86400000).toISOString().slice(0, 10)
      const { data: existing } = await admin
        .from('notifications')
        .select('id')
        .eq('trainer_id', trainerId)
        .eq('client_id', client.id)
        .eq('type', 'client_inactive')
        .gte('sent_at', `${threeDaysAgoDate}T00:00:00`)
        .limit(1)

      if (existing?.length) continue

      const daysSince = Math.floor(
        (turkeyNow.getTime() - new Date(client.last_seen_at!).getTime()) / 86400000
      )

      await notifyTrainer({
        trainerId: trainer.id,
        trainerUserId: trainer.user_id,
        type: 'client_inactive',
        title: 'İnaktif Danışan',
        message: `${client.full_name} ${daysSince} gündür giriş yapmadı.`,
        clientId: client.id,
        data: { days_inactive: daysSince },
      })
      sent++
    }
  }

  return NextResponse.json({ ok: true, sent })
}
