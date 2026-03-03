'use server'

import { notifyAdmin } from '@/lib/admin-notify'
import { createAdminClient } from '@/lib/supabase/admin'

export async function notifyAdminMeasurement(userId: string) {
  const admin = createAdminClient()

  const { data: user } = await admin
    .from('users')
    .select('full_name')
    .eq('id', userId)
    .single()

  if (!user) return

  const { data: measurement } = await admin
    .from('measurements')
    .select('weight')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(1)
    .single()

  const weightText = measurement?.weight ? `: ${measurement.weight} kg` : ''

  await notifyAdmin({
    type: 'admin_measurement',
    title: 'Yeni Ölçüm',
    message: `${user.full_name} yeni ölçüm girdi${weightText}`,
    url: '/admin/notifications',
  })
}
