import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TodayAttendance from './TodayAttendance'

export const dynamic = 'force-dynamic'

export default async function TodayPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/login')

  const { data: trainer } = await supabase
    .from('trainers')
    .select('id')
    .eq('user_id', session.user.id)
    .single()

  if (!trainer) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  const { data: packages } = await supabase
    .from('packages')
    .select('id, client_id, total_lessons, used_lessons, clients(full_name)')
    .eq('trainer_id', trainer.id)
    .eq('status', 'active')

  const { data: todayLessons } = await supabase
    .from('lessons')
    .select('id, package_id')
    .eq('trainer_id', trainer.id)
    .eq('date', today)

  const doneLessonsMap = new Map((todayLessons || []).map((l) => [l.package_id, l.id]))

  const attendees = (packages || [])
    .map((pkg) => ({
      packageId: pkg.id,
      clientId: pkg.client_id,
      clientName: ((pkg.clients as unknown as { full_name: string })?.full_name) || '?',
      totalLessons: pkg.total_lessons,
      usedLessons: pkg.used_lessons,
      doneToday: doneLessonsMap.has(pkg.id),
      lessonId: doneLessonsMap.get(pkg.id) ?? null,
    }))
    .sort((a, b) => {
      if (a.doneToday !== b.doneToday) return a.doneToday ? 1 : -1
      return a.clientName.localeCompare(b.clientName, 'tr')
    })

  return <TodayAttendance attendees={attendees} today={today} trainerId={trainer.id} />
}
