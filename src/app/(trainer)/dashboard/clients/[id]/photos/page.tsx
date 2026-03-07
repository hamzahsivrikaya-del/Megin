import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import ProgressPhotosManager from './ProgressPhotosManager'
import type { ProgressPhoto } from '@/lib/types'

export default async function ClientPhotosPage({
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
    .select('id, full_name')
    .eq('id', id)
    .eq('trainer_id', trainer.id)
    .maybeSingle()

  if (!client) notFound()

  const { data: photos } = await supabase
    .from('progress_photos')
    .select('*')
    .eq('client_id', client.id)
    .order('taken_at', { ascending: false })

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          href={`/dashboard/clients/${id}`}
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {client.full_name}
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold">İlerleme Fotoğrafları</h1>
        <p className="text-sm text-text-secondary mt-1">{client.full_name} için fotoğraf yönetimi</p>
      </div>

      <ProgressPhotosManager
        clientId={client.id}
        clientName={client.full_name}
        initialPhotos={(photos ?? []) as ProgressPhoto[]}
      />
    </div>
  )
}
