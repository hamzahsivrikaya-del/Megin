import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LessonForm from './LessonForm'

export default async function NewLessonPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/login')

  const { data: trainer } = await supabase
    .from('trainers')
    .select('id')
    .eq('user_id', session.user.id)
    .single()

  if (!trainer) redirect('/login')

  const { data: activePackages } = await supabase
    .from('packages')
    .select('id, client_id, total_lessons, used_lessons, clients(full_name)')
    .eq('trainer_id', trainer.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const mapped = (activePackages || []).map((pkg) => ({
    id: pkg.id as string,
    client_id: pkg.client_id as string,
    total_lessons: pkg.total_lessons as number,
    used_lessons: pkg.used_lessons as number,
    clientName: ((pkg.clients as unknown as { full_name: string })?.full_name) || 'Bilinmeyen',
  }))

  return <LessonForm activePackages={mapped} trainerId={trainer.id} />
}
