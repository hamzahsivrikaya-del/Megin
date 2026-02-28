import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { BADGE_DEFINITIONS } from '@/lib/badges'
import { sendPushNotification } from '@/lib/push'
import { safeCompare } from '@/lib/auth-utils'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization') || ''
  const expected = `Bearer ${process.env.CRON_SECRET}`
  if (!safeCompare(authHeader, expected)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const admin = createAdminClient()

  // notified: false olan rozetleri bul
  const { data: unnotified } = await admin
    .from('member_badges')
    .select('id, user_id, badge_id')
    .eq('notified', false)

  if (!unnotified || unnotified.length === 0) {
    return NextResponse.json({ message: 'Bildirilecek rozet yok', count: 0 })
  }

  // Kullanici bazinda grupla
  const byUser = new Map<string, string[]>()
  for (const row of unnotified) {
    const list = byUser.get(row.user_id) || []
    list.push(row.badge_id)
    byUser.set(row.user_id, list)
  }

  let notified = 0

  for (const [userId, badgeIds] of byUser) {
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
      type: 'badge_earned',
      title: 'Yeni Rozet!',
      message,
    })

    // Push bildirim
    await sendPushNotification({
      userIds: [userId],
      title: 'Yeni Rozet!',
      message,
      url: '/dashboard/rozetler',
    })

    notified += badgeIds.length
  }

  // Hepsini notified: true yap
  const ids = unnotified.map(r => r.id)
  await admin
    .from('member_badges')
    .update({ notified: true })
    .in('id', ids)

  return NextResponse.json({ message: `${notified} rozet bildirimi gonderildi`, count: notified })
}
