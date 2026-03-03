import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ClientDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Danışan bilgisi
  const { data: client } = await supabase
    .from('clients')
    .select('id, full_name')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!client) redirect('/login')

  const firstName = client.full_name.split(' ')[0]

  return (
    <div className="text-center space-y-8">
      {/* Logo */}
      <h1 className="font-display text-3xl font-bold text-primary tracking-tight">
        MEGIN
      </h1>

      {/* Karşılama Kartı */}
      <div className="card-base py-10 space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <span className="text-3xl">💪</span>
        </div>
        <h2 className="text-xl font-bold text-text-primary">
          Hoş geldin, {firstName}!
        </h2>
        <p className="text-sm text-text-secondary max-w-xs mx-auto">
          Danışan panelin yakında burada olacak.
        </p>
      </div>
    </div>
  )
}
