import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPushNotification } from '@/lib/push'

// ── POST: Eğitmen manuel push bildirimi gönder ──
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 })
    }

    // Trainer kontrolü
    const { data: trainer, error: trainerError } = await supabase
      .from('trainers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (trainerError || !trainer) {
      return NextResponse.json({ error: 'Bu işlem yalnızca eğitmenler tarafından yapılabilir' }, { status: 403 })
    }

    const body = await request.json()
    const { client_ids, title, message } = body

    if (!client_ids?.length || !title || !message) {
      return NextResponse.json({ error: 'client_ids, title ve message zorunludur' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Danışanların user_id'lerini al
    const { data: clients, error: clientsError } = await admin
      .from('clients')
      .select('user_id')
      .in('id', client_ids)
      .eq('trainer_id', trainer.id)
      .not('user_id', 'is', null)

    if (clientsError) {
      console.error('Clients fetch error:', clientsError)
      return NextResponse.json({ error: 'Danışanlar getirilemedi' }, { status: 500 })
    }

    const userIds = (clients ?? [])
      .map((c) => c.user_id as string)
      .filter(Boolean)

    if (!userIds.length) {
      return NextResponse.json({ sent: 0, message: 'Bildirim gönderilecek aktif kullanıcı bulunamadı' })
    }

    await sendPushNotification({ userIds, title, message })

    // Bildirim kayıtları oluştur (user_id'si olan danışanlar için)
    const notifications = userIds.map((userId) => ({
      user_id: userId,
      trainer_id: trainer.id,
      type: 'manual' as const,
      title,
      message,
      is_read: false,
      data: null,
    }))

    if (notifications.length) {
      await admin.from('notifications').insert(notifications)
    }

    return NextResponse.json({ sent: userIds.length })
  } catch (error) {
    console.error('POST /api/push/send error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
