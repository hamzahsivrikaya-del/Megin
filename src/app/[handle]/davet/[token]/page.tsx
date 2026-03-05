import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import InviteForm from './InviteForm'

interface PageProps {
  params: Promise<{ handle: string; token: string }>
}

export default async function InvitePage({ params }: PageProps) {
  const { handle, token } = await params

  const adminClient = createAdminClient()

  // Trainer'i username ile bul
  const { data: trainer, error: trainerError } = await adminClient
    .from('trainers')
    .select('id, full_name, username')
    .eq('username', handle)
    .single()

  if (trainerError || !trainer) {
    notFound()
  }

  // Client'i invite_token + trainer_id ile bul
  const { data: client, error: clientError } = await adminClient
    .from('clients')
    .select('id, full_name, email, invite_accepted')
    .eq('invite_token', token)
    .eq('trainer_id', trainer.id)
    .single()

  if (clientError || !client) {
    notFound()
  }

  // Zaten kabul edilmiş
  if (client.invite_accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center">
          <h1 className="font-display text-4xl font-bold text-primary tracking-tight mb-8">
            MEGIN
          </h1>
          <div className="rounded-xl border border-border bg-surface p-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">
              Davet Zaten Kullanılmış
            </h2>
            <p className="text-text-secondary mb-6">
              Bu davet bağlantısı daha önce kullanılmış. Hesabına giriş yaparak devam edebilirsin.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full rounded-xl bg-primary px-6 py-3 text-base font-medium text-white hover:bg-primary-dark transition-colors"
            >
              Giriş Yap
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <InviteForm
      token={token}
      trainerName={trainer.full_name}
      clientName={client.full_name}
      clientEmail={client.email}
    />
  )
}
