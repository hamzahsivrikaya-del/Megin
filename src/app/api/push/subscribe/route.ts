import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// ── POST: Push aboneliği kaydet ──
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 })
    }

    const body = await request.json()
    const { endpoint, p256dh, auth } = body

    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json({ error: 'Geçersiz abonelik verisi' }, { status: 400 })
    }

    const admin = createAdminClient()

    const { error: upsertError } = await admin
      .from('push_subscriptions')
      .upsert(
        { user_id: user.id, endpoint, p256dh, auth },
        { onConflict: 'user_id,endpoint' }
      )

    if (upsertError) {
      console.error('Push subscribe upsert error:', upsertError)
      return NextResponse.json({ error: 'Abonelik kaydedilemedi' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('POST /api/push/subscribe error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
