import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPushNotification } from '@/lib/push'
import { safeCompare } from '@/lib/auth-utils'

export const dynamic = 'force-dynamic'

function verifyCronSecret(request: NextRequest): boolean {
  const auth = request.headers.get('authorization') || ''
  return safeCompare(auth, `Bearer ${process.env.CRON_SECRET}`)
}

// ── GET: Eğitmene günlük beslenme özeti gönder (Cron - Günlük Akşam) ──
export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  // Saat kontrolü: sadece 15:00-20:00 UTC (TR 18:00-23:00) arasında gönder
  const nowUTC = new Date().getUTCHours()
  if (nowUTC < 15 || nowUTC >= 20) {
    return NextResponse.json({ ok: true, sent: 0, skipped: 'outside-time-window' })
  }

  const admin = createAdminClient()

  // Türkiye tarihi
  const turkeyNow = new Date(Date.now() + 3 * 60 * 60 * 1000)
  const todayStr = turkeyNow.toISOString().slice(0, 10)
  const turkeyHour = turkeyNow.getHours()

  // Bugün zaten gönderildi mi?
  const { count: existingCount } = await admin
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('type', 'trainer_nutrition_summary')
    .gte('sent_at', `${todayStr}T00:00:00+03:00`)
    .lt('sent_at', `${todayStr}T23:59:59+03:00`)

  if (existingCount && existingCount > 0) {
    return NextResponse.json({ ok: true, sent: 0, skipped: 'already-sent-today' })
  }

  let trainersSent = 0

  try {
    // Aktif eğitmenleri al
    const { data: trainers, error: trainersError } = await admin
      .from('trainers')
      .select('id, user_id, full_name')
      .eq('is_active', true)

    if (trainersError || !trainers?.length) {
      return NextResponse.json({ ok: true, sent: 0 })
    }

    for (const trainer of trainers) {
      // Bu eğitmenin aktif paketli danışanlarını al
      const { data: packages } = await admin
        .from('packages')
        .select('client_id, clients!inner(id, full_name, is_active)')
        .eq('trainer_id', trainer.id)
        .eq('status', 'active')

      if (!packages?.length) continue

      // Benzersiz aktif danışanlar
      const seen = new Set<string>()
      const clients: Array<{ id: string; full_name: string }> = []
      for (const pkg of packages) {
        const client = pkg.clients as unknown as { id: string; full_name: string; is_active: boolean }
        if (!seen.has(client.id) && client.is_active) {
          seen.add(client.id)
          clients.push({ id: client.id, full_name: client.full_name })
        }
      }

      if (!clients.length) continue

      // Bugünün beslenme kayıtlarını al
      const clientIds = clients.map((c) => c.id)
      const { data: mealLogs } = await admin
        .from('meal_logs')
        .select('client_id')
        .in('client_id', clientIds)
        .eq('date', todayStr)

      const loggedClientIds = new Set((mealLogs ?? []).map((l) => l.client_id))

      const entered = clients.filter((c) => loggedClientIds.has(c.id))
      const notEntered = clients.filter((c) => !loggedClientIds.has(c.id))
      const total = clients.length
      const enteredCount = entered.length

      // Mesaj oluştur
      let message = `${enteredCount}/${total} danışan beslenme girdi.`

      if (entered.length > 0) {
        message += `\nGirenler: ${entered.map((m) => m.full_name).join(', ')}`
      }
      if (notEntered.length > 0) {
        message += `\nGirmeyenler: ${notEntered.map((m) => m.full_name).join(', ')}`
      }

      const title = `Beslenme Durumu (${String(turkeyHour).padStart(2, '0')}:00)`

      // DB'ye kaydet
      await admin.from('notifications').insert({
        user_id: trainer.user_id,
        trainer_id: trainer.id,
        type: 'trainer_nutrition_summary',
        title,
        message,
        is_read: false,
      })

      // Push gönder
      await sendPushNotification({
        userIds: [trainer.user_id],
        title,
        message: `${enteredCount}/${total} danışan beslenme girdi.`,
        url: '/dashboard/notifications',
      })

      trainersSent++
    }

    return NextResponse.json({ ok: true, sent: trainersSent })
  } catch (error) {
    console.error('GET /api/cron/trainer-nutrition-summary error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
