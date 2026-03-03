import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPushNotification } from '@/lib/push'

function verifyCronSecret(request: NextRequest): boolean {
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${process.env.CRON_SECRET}`
}

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0]
}

// ── GET: Beslenme hatırlatıcısı (Cron - Günlük Akşam) ──
export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  const admin = createAdminClient()
  const today = getTodayStr()
  let remindersSent = 0
  let errors = 0

  try {
    // Aktif paketi olan ve öğün planı bulunan danışanları al
    const { data: packages, error: packagesError } = await admin
      .from('packages')
      .select(`
        client_id,
        trainer_id,
        clients!inner(id, user_id, full_name, is_active, trainer_id)
      `)
      .eq('status', 'active')

    if (packagesError) {
      console.error('packages fetch error:', packagesError)
      return NextResponse.json({ error: 'Paketler getirilemedi' }, { status: 500 })
    }

    if (!packages?.length) {
      return NextResponse.json({ remindersSent: 0, message: 'Aktif paket bulunamadı' })
    }

    // Benzersiz danışanları topla
    const seen = new Set<string>()
    const clientsToCheck: Array<{
      clientId: string
      userId: string | null
      fullName: string
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
        clientsToCheck.push({
          clientId: client.id,
          userId: client.user_id,
          fullName: client.full_name,
          trainerId: client.trainer_id,
        })
      }
    }

    for (const client of clientsToCheck) {
      try {
        // Bu danışanın öğün planı var mı?
        const { count: mealPlanCount } = await admin
          .from('client_meals')
          .select('id', { count: 'exact', head: true })
          .eq('client_id', client.clientId)

        if (!mealPlanCount || mealPlanCount === 0) continue

        // Bugün öğün kaydı girmiş mi?
        const { count: logCount } = await admin
          .from('meal_logs')
          .select('id', { count: 'exact', head: true })
          .eq('client_id', client.clientId)
          .eq('date', today)

        if (logCount && logCount > 0) continue

        // Öğün kaydı yok → hatırlatıcı gönder
        const { error: notifError } = await admin.from('notifications').insert({
          user_id: client.userId!,
          trainer_id: client.trainerId,
          type: 'nutrition_reminder',
          title: 'Öğün Kaydı Hatırlatıcısı',
          message: "Bugünkü öğün kaydını girmeyi unutma!",
          is_read: false,
          data: { date: today },
        })

        if (notifError) {
          console.error('notification insert error:', notifError)
          errors++
          continue
        }

        await sendPushNotification({
          userIds: [client.userId!],
          title: 'Öğün Kaydı Hatırlatıcısı',
          message: "Bugünkü öğün kaydını girmeyi unutma!",
          url: '/dashboard/nutrition',
        })

        remindersSent++
      } catch (err) {
        console.error(`Hatırlatıcı hatası (client: ${client.clientId}):`, err)
        errors++
      }
    }

    return NextResponse.json({ remindersSent, errors, date: today })
  } catch (error) {
    console.error('GET /api/cron/nutrition-reminder error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
