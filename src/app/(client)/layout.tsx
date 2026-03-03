import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ClientNavbar from '@/components/shared/ClientNavbar'

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/login')

  const { data: client } = await supabase
    .from('clients')
    .select('full_name')
    .eq('user_id', session.user.id)
    .maybeSingle()

  return (
    <div className="min-h-screen bg-background">
      <ClientNavbar userName={client?.full_name || ''} />
      <main className="p-4 md:p-6 max-w-5xl mx-auto">
        {children}
      </main>
    </div>
  )
}
