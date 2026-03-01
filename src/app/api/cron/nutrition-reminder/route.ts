import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPushNotification } from '@/lib/push'
import { safeCompare } from '@/lib/auth-utils'

export const dynamic = 'force-dynamic'

// Haftanin her gunu icin farkli motivasyon mesajlari
const DAILY_MESSAGES: { title: string; message: string }[] = [
  // 0 = Pazar
  {
    title: 'Dinlenme günü!',
    message: 'Kaslar dinlenirken büyür. Bugün kendine iyi bak, yarın güçlü dön.',
  },
  // 1 = Pazartesi
  {
    title: 'Hadi bakalım!',
    message: 'Yeni hafta, temiz sayfa. İlk öğününü ekle, geri kalanı kolay gelir.',
  },
  // 2 = Sali
  {
    title: 'Hatırlatma!',
    message: 'Neden başladığını hatırla. O hedef hâlâ seni bekliyor.',
  },
  // 3 = Carsamba
  {
    title: 'Yarı yoldayız!',
    message: 'Haftanın zirvesi sensin. Bugünkü öğünlerini ekle, seri devam etsin.',
  },
  // 4 = Persembe
  {
    title: 'Kendine inan!',
    message: 'Sonuçlar sabır ister. Her gün bir öncekinden daha güçlüsün.',
  },
  // 5 = Cuma
  {
    title: 'Haftayı bitir!',
    message: 'Beslenme takibini tamamla, haftalık raporun hazırlansın.',
  },
  // 6 = Cumartesi
  {
    title: 'Hafta sonu!',
    message: 'Konfor alanın seni büyütmez. Bugün de kendini bir adım zorla.',
  },
]

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization') || ''
  const expected = `Bearer ${process.env.CRON_SECRET}`
  if (!safeCompare(authHeader, expected)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  // Saat kontrolu: sadece 06:00-10:00 UTC (TR 09:00-13:00) arasinda gonder
  const nowUTC = new Date().getUTCHours()
  if (nowUTC < 6 || nowUTC >= 10) {
    return NextResponse.json({ ok: true, sent: 0, skipped: 'outside-time-window' })
  }

  const admin = createAdminClient()

  // Tum aktif uyeleri al (bagli uyeler haric — onlar giris yapmaz)
  const { data: members, error: memberError } = await admin
    .from('users')
    .select('id')
    .eq('role', 'member')
    .eq('is_active', true)
    .is('parent_id', null)

  if (memberError || !members?.length) {
    return NextResponse.json({ ok: true, sent: 0 })
  }

  const userIds = members.map((m: { id: string }) => m.id)

  // Turkiye saati ile gunu hesapla (UTC+3)
  const now = new Date()
  const turkeyHour = now.getUTCHours() + 3
  const turkeyDate = new Date(now.getTime() + 3 * 60 * 60 * 1000)
  const dayOfWeek = turkeyDate.getDay() // 0=Pazar, 6=Cumartesi

  const dailyMessage = DAILY_MESSAGES[dayOfWeek]

  // Push bildirim gonder
  await sendPushNotification({
    userIds,
    title: dailyMessage.title,
    message: dailyMessage.message,
    url: '/dashboard/beslenme',
  })

  // DB'ye bildirim kaydet
  const notifications = userIds.map((uid: string) => ({
    user_id: uid,
    type: 'nutrition_reminder' as const,
    title: dailyMessage.title,
    message: dailyMessage.message,
  }))

  await admin.from('notifications').insert(notifications)

  return NextResponse.json({ ok: true, sent: userIds.length, day: dayOfWeek })
}
