import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PackageForm from './PackageForm'

export default async function NewPackagePage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/login')

  const { data: trainer } = await supabase
    .from('trainers')
    .select('id')
    .eq('user_id', session.user.id)
    .single()

  if (!trainer) redirect('/login')

  const { data: clients } = await supabase
    .from('clients')
    .select('id, full_name, is_active')
    .eq('trainer_id', trainer.id)
    .eq('invite_accepted', true)
    .order('full_name')

  // Aktif paketi olan danışanları bul
  const { data: activePackages } = await supabase
    .from('packages')
    .select('client_id')
    .eq('trainer_id', trainer.id)
    .eq('status', 'active')

  const activePackageClientIds = new Set((activePackages || []).map((p) => p.client_id))

  const clientsWithInfo = (clients || []).map((c) => ({
    ...c,
    hasActivePackage: activePackageClientIds.has(c.id),
  }))

  return <PackageForm clients={clientsWithInfo} trainerId={trainer.id} />
}
