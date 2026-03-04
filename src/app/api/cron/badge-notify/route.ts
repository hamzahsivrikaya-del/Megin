import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { BADGE_DEFINITIONS } from '@/lib/badges'
import { sendPushNotification } from '@/lib/push'

export const dynamic = 'force-dynamic'

function verifyCronSecret(request: NextRequest): boolean {
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${process.env.CRON_SECRET}`
}

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  const admin = createAdminClient()

  // notified: false olan rozetleri bul
  const { data: unnotified } = await admin
    .from('client_badges')
    .select('id, client_id, trainer_id, badge_id, clients!inner(user_id)')
    .eq('notified', false)

  if (!unnotified || unnotified.length === 0) {
    return NextResponse.json({ message: 'Bildirilecek rozet yok', count: 0 })
  }

  // Kullanici bazinda grupla
  const byUser = new Map<string, { userId: string; trainerId: string; badgeIds: string[] }>()
  for (const row of unnotified) {
    const client = row.clients as unknown as { user_id: string | null }
    if (!client?.user_id) continue

    const existing = byUser.get(client.user_id)
    if (existing) {
      existing.badgeIds.push(row.badge_id)
    } else {
      byUser.set(client.user_id, {
        userId: client.user_id,
        trainerId: row.trainer_id,
        badgeIds: [row.badge_id],
      })
    }
  }

  let notified = 0

  for (const [, { userId, trainerId, badgeIds }] of byUser) {
    const badgeNames = badgeIds
      .map(id => BADGE_DEFINITIONS.find(b => b.id === id)?.name)
      .filter(Boolean)

    if (badgeNames.length === 0) continue

    const message = badgeNames.length === 1
      ? `"${badgeNames[0]}" rozetini kazandın!`
      : `${badgeNames.length} yeni rozet kazandın: ${badgeNames.join(', ')}`

    // In-app bildirim
    await admin.from('notifications').insert({
      user_id: userId,
      trainer_id: trainerId,
      type: 'badge_earned',
      title: 'Yeni Rozet!',
      message,
      is_read: false,
    })

    // Push bildirim
    await sendPushNotification({
      userIds: [userId],
      title: 'Yeni Rozet!',
      message,
      url: '/app/rozetler',
    })

    notified += badgeIds.length
  }

  // Hepsini notified: true yap
  const ids = unnotified.map(r => r.id)
  await admin
    .from('client_badges')
    .update({ notified: true })
    .in('id', ids)

  return NextResponse.json({ message: `${notified} rozet bildirimi gönderildi`, count: notified })
}
