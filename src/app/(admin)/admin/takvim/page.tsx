import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CalendarClient from './CalendarClient'

export default async function AdminCalendarPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/login')

  // Aktif paketli üyeleri çek
  const { data: activePackages } = await supabase
    .from('packages')
    .select('id, user_id, total_lessons, used_lessons, users(id, full_name)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const members = (activePackages || []).map((pkg) => {
    const user = pkg.users as unknown as { id: string; full_name: string }
    return {
      packageId: pkg.id as string,
      userId: user?.id || (pkg.user_id as string),
      fullName: user?.full_name || 'Bilinmeyen',
      totalLessons: pkg.total_lessons as number,
      usedLessons: pkg.used_lessons as number,
    }
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl heading-display">Takvim</h1>
      <CalendarClient members={members} />
    </div>
  )
}
