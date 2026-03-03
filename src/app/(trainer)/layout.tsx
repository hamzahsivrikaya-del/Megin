import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TrainerLayoutClient from './TrainerLayoutClient'

export default async function TrainerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/login')

  const { data: trainer } = await supabase
    .from('trainers')
    .select('full_name')
    .eq('user_id', session.user.id)
    .single()

  return (
    <TrainerLayoutClient trainerName={trainer?.full_name || 'MEGIN'}>
      {children}
    </TrainerLayoutClient>
  )
}
