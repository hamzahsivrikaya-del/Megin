import { createAdminClient } from '@/lib/supabase/admin'

let webpushModule: typeof import('web-push') | null = null

async function getWebPush() {
  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return null
  }
  if (!webpushModule) {
    webpushModule = (await import('web-push')).default
    webpushModule.setVapidDetails(
      `mailto:${process.env.VAPID_EMAIL || 'noreply@megin.app'}`,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    )
  }
  return webpushModule
}

interface SendPushOptions {
  userIds: string[]
  title: string
  message: string
  url?: string
}

export async function sendPushNotification({ userIds, title, message, url }: SendPushOptions): Promise<void> {
  if (!userIds.length) return

  const webpush = await getWebPush()
  if (!webpush) return // VAPID keys not configured, skip silently

  const admin = createAdminClient()

  const { data: subscriptions, error } = await admin
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .in('user_id', userIds)

  if (error || !subscriptions?.length) return

  const payload = JSON.stringify({ title, body: message, url: url ?? '/' })

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      )
    )
  )

  // Geçersiz abonelikleri temizle (410 Gone veya 404 Not Found)
  const invalidIds: string[] = []
  results.forEach((result, idx) => {
    if (result.status === 'rejected') {
      const err = result.reason as { statusCode?: number }
      if (err?.statusCode === 410 || err?.statusCode === 404) {
        invalidIds.push(subscriptions[idx].id)
      }
    }
  })

  if (invalidIds.length) {
    await admin.from('push_subscriptions').delete().in('id', invalidIds)
  }
}
