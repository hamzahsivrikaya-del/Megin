import { createAdminClient } from '@/lib/supabase/admin'
import { sendPushNotification } from '@/lib/push'
import { NotificationType } from '@/lib/types'

const TYPE_TO_PREF: Record<string, string> = {
  client_habits_completed: 'client_habits_completed',
  client_streak_milestone: 'client_streak_milestone',
  client_inactive: 'client_inactive',
  daily_summary: 'daily_summary',
  trainer_nutrition_summary: 'trainer_nutrition_summary',
  low_lessons: 'low_lessons',
}

export async function notifyTrainer({
  trainerId,
  trainerUserId,
  type,
  title,
  message,
  clientId,
  data,
}: {
  trainerId: string
  trainerUserId: string
  type: NotificationType
  title: string
  message: string
  clientId?: string
  data?: Record<string, unknown>
}) {
  const admin = createAdminClient()

  // Tercih kontrolu
  const prefColumn = TYPE_TO_PREF[type]
  if (prefColumn) {
    const { data: pref } = await admin
      .from('trainer_notification_preferences')
      .select(prefColumn)
      .eq('trainer_id', trainerId)
      .maybeSingle()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (pref && (pref as any)[prefColumn] === false) return
  }

  // DB'ye kaydet
  await admin.from('notifications').insert({
    user_id: trainerUserId,
    trainer_id: trainerId,
    client_id: clientId || null,
    type,
    title,
    message,
    data: data || null,
  })

  // Push gonder
  await sendPushNotification({
    userIds: [trainerUserId],
    title,
    message,
    url: '/dashboard/notifications',
  })
}

export async function notifyClient({
  clientUserId,
  trainerId,
  clientId,
  type,
  title,
  message,
  data,
}: {
  clientUserId: string
  trainerId: string
  clientId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, unknown>
}) {
  const admin = createAdminClient()

  await admin.from('notifications').insert({
    user_id: clientUserId,
    trainer_id: trainerId,
    client_id: clientId,
    type,
    title,
    message,
    data: data || null,
  })

  await sendPushNotification({
    userIds: [clientUserId],
    title,
    message,
    url: '/app/notifications',
  })
}
