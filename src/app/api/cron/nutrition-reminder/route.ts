import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPushNotification } from '@/lib/push'
import { safeCompare } from '@/lib/auth-utils'

export const dynamic = 'force-dynamic'

function verifyCronSecret(request: NextRequest): boolean {
  const auth = request.headers.get('authorization') || ''
  return safeCompare(auth, `Bearer ${process.env.CRON_SECRET}`)
}

// Her gün için farklı motivasyon mesajları
const DAILY_MESSAGES: { title: string; message: string }[] = [
  // 0 = Pazar
  { title: 'Dinlenme günü!', message: 'Kaslar dinlenirken büyür. Bugün kendine iyi bak, yarın güçlü dön.' },
  // 1 = Pazartesi
  { title: 'Hadi bakalım!', message: 'Yeni hafta, temiz sayfa. İlk öğününü ekle, geri kalanı kolay gelir.' },
  // 2 = Salı
  { title: 'Hatırlatma!', message: 'Neden başladığını hatırla. O hedef hâlâ seni bekliyor.' },
  // 3 = Çarşamba
  { title: 'Yarı yoldayız!', message: 'Haftanın zirvesi sensin. Bugünkü öğünlerini ekle, seri devam etsin.' },
  // 4 = Perşembe
  { title: 'Kendine inan!', message: 'Sonuçlar sabır ister. Her gün bir öncekinden daha güçlüsün.' },
  // 5 = Cuma
  { title: 'Haftayı bitir!', message: 'Beslenme takibini tamamla, haftalık raporun hazırlansın.' },
  // 6 = Cumartesi
  { title: 'Hafta sonu!', message: 'Konfor alanın seni büyütmez. Bugün de kendini bir adım zorla.' },
]

// ── GET: Beslenme hatırlatıcısı (Cron - Günlük Sabah) ──
export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  // Saat kontrolü: sadece 06:00-10:00 UTC (TR 09:00-13:00) arasında gönder
  const nowUTC = new Date().getUTCHours()
  if (nowUTC < 6 || nowUTC >= 10) {
    return NextResponse.json({ ok: true, sent: 0, skipped: 'outside-time-window' })
  }

  const admin = createAdminClient()

  // Bugün zaten gönderildi mi? (tekrar önleme)
  const turkeyNow = new Date(Date.now() + 3 * 60 * 60 * 1000)
  const todayStr = turkeyNow.toISOString().slice(0, 10)

  const { count: existingCount, error: dedupError } = await admin
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('type', 'nutrition_reminder')
    .gte('sent_at', `${todayStr}T00:00:00+03:00`)
    .lt('sent_at', `${todayStr}T23:59:59+03:00`)

  if (dedupError) {
    return NextResponse.json({ ok: false, error: 'dedup-check-failed' }, { status: 500 })
  }

  if (existingCount && existingCount > 0) {
    return NextResponse.json({ ok: true, sent: 0, skipped: 'already-sent-today' })
  }

  // Türkiye saati ile günü hesapla
  const turkeyDate = new Date(Date.now() + 3 * 60 * 60 * 1000)
  const dayOfWeek = turkeyDate.getDay()
  const dailyMessage = DAILY_MESSAGES[dayOfWeek]

  let remindersSent = 0
  let errors = 0

  try {
    // Aktif paketi olan danışanları al
    const { data: packages, error: packagesError } = await admin
      .from('packages')
      .select(`
        client_id,
        trainer_id,
        clients!inner(id, user_id, full_name, is_active, trainer_id)
      `)
      .eq('status', 'active')

    if (packagesError || !packages?.length) {
      return NextResponse.json({ ok: true, sent: 0 })
    }

    // Benzersiz danışanları topla
    const seen = new Set<string>()
    const clientsToNotify: Array<{
      clientId: string
      userId: string
      trainerId: string
    }> = []

    for (const pkg of packages) {
      const client = pkg.clients as unknown as {
        id: string
        user_id: string | null
        full_name: string
        is_active: boolean
        trainer_id: string
      }

      if (!seen.has(client.id) && client.is_active && client.user_id) {
        seen.add(client.id)
        clientsToNotify.push({
          clientId: client.id,
          userId: client.user_id,
          trainerId: client.trainer_id,
        })
      }
    }

    if (!clientsToNotify.length) {
      return NextResponse.json({ ok: true, sent: 0 })
    }

    // Toplu bildirim kayıtları oluştur
    const notifications = clientsToNotify.map((c) => ({
      user_id: c.userId,
      trainer_id: c.trainerId,
      type: 'nutrition_reminder' as const,
      title: dailyMessage.title,
      message: dailyMessage.message,
      is_read: false,
    }))

    const { error: insertError } = await admin.from('notifications').insert(notifications)
    if (insertError) {
      console.error('Nutrition reminder notification insert error:', insertError)
      errors++
    }

    // Push bildirim gönder
    const userIds = clientsToNotify.map((c) => c.userId)
    await sendPushNotification({
      userIds,
      title: dailyMessage.title,
      message: dailyMessage.message,
      url: '/app/beslenme',
    })

    remindersSent = clientsToNotify.length

    return NextResponse.json({ ok: true, sent: remindersSent, errors, day: dayOfWeek })
  } catch (error) {
    console.error('GET /api/cron/nutrition-reminder error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
