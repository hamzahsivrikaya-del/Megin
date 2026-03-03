'use server'

import { sendPushNotification } from '@/lib/push'
import { notifyAdmin } from '@/lib/admin-notify'
import { createAdminClient } from '@/lib/supabase/admin'

export async function sendLessonCompletedPush(userId: string) {
  await sendPushNotification({
    userIds: [userId],
    title: 'Ders Tamamlandı!',
    message: 'Harika bir iş çıkardın! Şimdi dinlenme ve toparlanma zamanı. Bir sonraki derste görüşmek üzere!',
    url: '/dashboard',
  })
}

export async function sendLowLessonPush(userId: string, remaining: number) {
  const title = remaining === 1 ? 'Son Dersiniz!' : 'Son 2 Dersiniz Kaldı'
  const message =
    remaining === 1
      ? 'Paketinizde yalnızca 1 ders kaldı. Hemen yeni paket alarak kesintisiz devam edin.'
      : 'Paketinizde yalnızca 2 ders kaldı. Yeni paket almak için antrenörünüzle iletişime geçebilirsiniz.'

  await sendPushNotification({
    userIds: [userId],
    title,
    message,
    url: '/dashboard/notifications',
  })

  // Admin'e de bildir
  const adminClient = createAdminClient()
  const { data: user } = await adminClient
    .from('users')
    .select('full_name')
    .eq('id', userId)
    .single()

  if (user) {
    await notifyAdmin({
      type: 'admin_low_lessons',
      title: 'Paket Uyarısı',
      message: `${user.full_name}'${remaining === 1 ? 'in son dersi kaldı' : `in ${remaining} dersi kaldı`}`,
      url: '/admin/notifications',
    })
  }
}
