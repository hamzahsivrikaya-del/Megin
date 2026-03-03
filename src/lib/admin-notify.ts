import { createAdminClient } from '@/lib/supabase/admin'
import { sendPushNotification } from '@/lib/push'
import type { NotificationType } from '@/lib/types'

/**
 * Admin kullaniciya bildirim gonder (DB + push)
 */
export async function notifyAdmin({
  type,
  title,
  message,
  url = '/admin/notifications',
}: {
  type: NotificationType
  title: string
  message: string
  url?: string
}) {
  const admin = createAdminClient()

  // Admin user_id'yi bul
  const { data: adminUser } = await admin
    .from('users')
    .select('id')
    .eq('role', 'admin')
    .single()

  if (!adminUser) return

  // DB'ye kaydet
  await admin.from('notifications').insert({
    user_id: adminUser.id,
    type,
    title,
    message,
  })

  // Push gonder
  await sendPushNotification({
    userIds: [adminUser.id],
    title,
    message,
    url,
  })
}
