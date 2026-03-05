import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CalendarClient from './CalendarClient'
import { getTrainerPlan } from '@/lib/subscription'
import FeatureGate from '@/components/shared/FeatureGate'

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: trainer } = await supabase
    .from('trainers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!trainer) redirect('/login')

  const plan = await getTrainerPlan(supabase, trainer.id)

  // Aktif paketli danışanları çek
  const { data: activePackages } = await supabase
    .from('packages')
    .select('id, client_id, total_lessons, used_lessons, clients(id, full_name)')
    .eq('trainer_id', trainer.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const clients = (activePackages || []).map((pkg) => {
    const client = pkg.clients as unknown as { id: string; full_name: string }
    return {
      packageId: pkg.id as string,
      clientId: client?.id || (pkg.client_id as string),
      fullName: client?.full_name || 'Bilinmeyen',
      totalLessons: pkg.total_lessons as number,
      usedLessons: pkg.used_lessons as number,
    }
  })

  return (
    <FeatureGate plan={plan} feature="calendar" role="trainer">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Takvim</h1>
        <CalendarClient clients={clients} trainerId={trainer.id} />
      </div>
    </FeatureGate>
  )
}
