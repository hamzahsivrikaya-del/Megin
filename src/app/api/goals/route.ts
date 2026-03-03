import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function getTrainer() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return { error: 'Yetkisiz erişim', status: 401 }

  const { data: trainer } = await supabase
    .from('trainers')
    .select('id')
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (!trainer) return { error: 'Antrenör bulunamadı', status: 403 }

  return { trainer, session }
}

// GET /api/goals?client_id=xxx
export async function GET(req: NextRequest) {
  const result = await getTrainer()
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  const clientId = req.nextUrl.searchParams.get('client_id')
  if (!clientId) {
    return NextResponse.json({ error: 'client_id gerekli' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: goals, error } = await admin
    .from('client_goals')
    .select('*')
    .eq('client_id', clientId)
    .eq('trainer_id', result.trainer.id)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ goals })
}

// POST /api/goals
// Body: { client_id, metric_type, target_value }
export async function POST(req: NextRequest) {
  const result = await getTrainer()
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  const body = await req.json()
  const { client_id, metric_type, target_value } = body

  if (!client_id || !metric_type || target_value === undefined) {
    return NextResponse.json({ error: 'client_id, metric_type ve target_value gerekli' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: goal, error } = await admin
    .from('client_goals')
    .upsert(
      {
        trainer_id: result.trainer.id,
        client_id,
        metric_type,
        target_value: Number(target_value),
        achieved_at: null,
      },
      { onConflict: 'client_id,metric_type' }
    )
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ goal })
}

// DELETE /api/goals
// Body: { client_id, metric_type }
export async function DELETE(req: NextRequest) {
  const result = await getTrainer()
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  const body = await req.json()
  const { client_id, metric_type } = body

  if (!client_id || !metric_type) {
    return NextResponse.json({ error: 'client_id ve metric_type gerekli' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('client_goals')
    .delete()
    .eq('client_id', client_id)
    .eq('metric_type', metric_type)
    .eq('trainer_id', result.trainer.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
