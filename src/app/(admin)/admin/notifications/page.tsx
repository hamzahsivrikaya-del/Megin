import { createClient } from '@/lib/supabase/server'
import NotificationsManager from './NotificationsManager'

export default async function AdminNotificationsPage() {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  const adminUserId = session?.user?.id || ''

  const [
    { data: notifications },
    { data: members },
    { data: adminNotifications },
  ] = await Promise.all([
    supabase
      .from('notifications')
      .select('*, users(full_name)')
      .order('sent_at', { ascending: false })
      .limit(50),
    supabase
      .from('users')
      .select('id, full_name')
      .eq('role', 'member')
      .eq('is_active', true)
      .order('full_name'),
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', adminUserId)
      .order('sent_at', { ascending: false })
      .limit(50),
  ])

  return (
    <NotificationsManager
      initialNotifications={notifications || []}
      members={members || []}
      adminNotifications={adminNotifications || []}
    />
  )
}
