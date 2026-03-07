import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notifyClient } from '@/lib/trainer-notify'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  const { data: trainer } = await admin
    .from('trainers')
    .select('id')
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (!trainer) return NextResponse.json({ error: 'Trainer bulunamadı' }, { status: 403 })

  const { clientId } = await request.json()
  if (!clientId) return NextResponse.json({ error: 'clientId gerekli' }, { status: 400 })

  const { data: client } = await admin
    .from('clients')
    .select('id, user_id, full_name, trainer_id')
    .eq('id', clientId)
    .eq('trainer_id', trainer.id)
    .maybeSingle()

  if (!client?.user_id) return NextResponse.json({ error: 'Danışan bulunamadı' }, { status: 404 })

  // Dedup: bugün bu danışana program bildirimi gitti mi?
  const today = new Date().toISOString().slice(0, 10)
  const { data: existing } = await admin
    .from('notifications')
    .select('id')
    .eq('client_id', clientId)
    .eq('type', 'program_assigned')
    .gte('sent_at', `${today}T00:00:00`)
    .limit(1)

  if (existing?.length) return NextResponse.json({ ok: true, skipped: true })

  await notifyClient({
    clientUserId: client.user_id,
    trainerId: trainer.id,
    clientId,
    type: 'program_assigned',
    title: 'Yeni Program',
    message: 'Antrenörün sana yeni bir program atadı. Hemen kontrol et!',
  })

  return NextResponse.json({ ok: true })
}
