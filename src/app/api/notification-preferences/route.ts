import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  const { data: trainer } = await admin
    .from('trainers')
    .select('id')
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (!trainer) return NextResponse.json({ error: 'Trainer bulunamadı' }, { status: 404 })

  const { data: prefs } = await admin
    .from('trainer_notification_preferences')
    .select('*')
    .eq('trainer_id', trainer.id)
    .maybeSingle()

  // Yoksa varsayılan (hepsi açık)
  return NextResponse.json({
    preferences: prefs || {
      client_habits_completed: true,
      client_streak_milestone: true,
      client_inactive: true,
      daily_summary: true,
      trainer_nutrition_summary: true,
      low_lessons: true,
    },
  })
}

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

  if (!trainer) return NextResponse.json({ error: 'Trainer bulunamadı' }, { status: 404 })

  const body = await request.json()

  const allowedKeys = [
    'client_habits_completed',
    'client_streak_milestone',
    'client_inactive',
    'daily_summary',
    'trainer_nutrition_summary',
    'low_lessons',
  ]

  const updates: Record<string, boolean> = {}
  for (const key of allowedKeys) {
    if (typeof body[key] === 'boolean') {
      updates[key] = body[key]
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Geçersiz veri' }, { status: 400 })
  }

  const { error } = await admin
    .from('trainer_notification_preferences')
    .upsert(
      { trainer_id: trainer.id, ...updates, updated_at: new Date().toISOString() },
      { onConflict: 'trainer_id' }
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
