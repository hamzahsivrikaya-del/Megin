import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPushNotification } from '@/lib/push'

function verifyCronSecret(request: NextRequest): boolean {
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${process.env.CRON_SECRET}`
}

// ── GET: Kazanılan rozetleri bildir (Cron - Günlük) ──
export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  const admin = createAdminClient()
  let notified = 0
  let errors = 0

  try {
    // Henüz bildirilmemiş rozetleri al (client ve badge bilgileriyle birlikte)
    const { data: unnotifiedBadges, error: badgesError } = await admin
      .from('client_badges')
      .select(`
        id,
        trainer_id,
        client_id,
        badge_id,
        earned_at,
        clients!inner(user_id, full_name),
        badges(name, description)
      `)
      .eq('notified', false)

    if (badgesError) {
      console.error('client_badges fetch error:', badgesError)
      return NextResponse.json({ error: 'Rozetler getirilemedi' }, { status: 500 })
    }

    if (!unnotifiedBadges?.length) {
      return NextResponse.json({ notified: 0, message: 'Bildirim bekleyen rozet yok' })
    }

    for (const badge of unnotifiedBadges) {
      try {
        const client = badge.clients as unknown as { user_id: string | null; full_name: string }
        const badgeInfo = badge.badges as unknown as { name: string; description: string } | null

        const badgeName = badgeInfo?.name ?? 'Yeni Rozet'
        const badgeDesc = badgeInfo?.description ?? 'Bir başarı kazandın!'

        if (!client.user_id) {
          // user_id yoksa yine de notified işaretle
          await admin
            .from('client_badges')
            .update({ notified: true })
            .eq('id', badge.id)
          continue
        }

        // Bildirim oluştur
        const { error: notifError } = await admin.from('notifications').insert({
          user_id: client.user_id,
          trainer_id: badge.trainer_id,
          type: 'badge_earned',
          title: `Rozet Kazandın: ${badgeName}`,
          message: badgeDesc,
          is_read: false,
          data: { badge_id: badge.badge_id, earned_at: badge.earned_at },
        })

        if (notifError) {
          console.error('notification insert error:', notifError)
          errors++
          continue
        }

        // Push bildirimi gönder
        await sendPushNotification({
          userIds: [client.user_id],
          title: `Rozet Kazandın! ${badgeName}`,
          message: badgeDesc,
          url: '/dashboard/badges',
        })

        // Notified işaretle
        await admin
          .from('client_badges')
          .update({ notified: true })
          .eq('id', badge.id)

        notified++
      } catch (err) {
        console.error(`Rozet bildirim hatası (id: ${badge.id}):`, err)
        errors++
      }
    }

    return NextResponse.json({ notified, errors })
  } catch (error) {
    console.error('GET /api/cron/badge-notify error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
