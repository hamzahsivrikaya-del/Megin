import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const admin = createAdminClient()
  await admin
    .from('users')
    .update({ onboarding_completed: true })
    .eq('id', session.user.id)

  return NextResponse.json({ ok: true })
}
