import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ClientGoal, Measurement } from '@/lib/types'
import GoalsManager from './GoalsManager'

export default async function GoalsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/login')

  const { data: trainer } = await supabase
    .from('trainers')
    .select('id')
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (!trainer) redirect('/onboarding')

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .eq('trainer_id', trainer.id)
    .maybeSingle()

  if (!client) notFound()

  const admin = createAdminClient()

  const [
    { data: goals },
    { data: measurements },
  ] = await Promise.all([
    admin
      .from('client_goals')
      .select('*')
      .eq('client_id', client.id)
      .eq('trainer_id', trainer.id)
      .order('created_at', { ascending: true }),
    admin
      .from('measurements')
      .select('*')
      .eq('client_id', client.id)
      .order('date', { ascending: false })
      .limit(1),
  ])

  const latestMeasurement: Measurement | null = measurements?.[0] ?? null

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Link
        href={`/dashboard/clients/${id}`}
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {client.full_name}
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-text-primary">Hedefler</h1>
        <p className="text-sm text-text-secondary mt-1">{client.full_name} için hedef yönetimi</p>
      </div>

      <GoalsManager
        clientId={client.id}
        initialGoals={(goals as ClientGoal[]) ?? []}
        latestMeasurement={latestMeasurement}
      />
    </div>
  )
}
