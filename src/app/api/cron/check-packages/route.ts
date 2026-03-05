import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPushNotification } from '@/lib/push'
import { safeCompare } from '@/lib/auth-utils'

function verifyCronSecret(request: NextRequest): boolean {
  const auth = request.headers.get('authorization') || ''
  return safeCompare(auth, `Bearer ${process.env.CRON_SECRET}`)
}

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0]
}

// ── GET: Paket kontrol ve bildirim (Cron - Günlük) ──
export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  const admin = createAdminClient()
  const today = getTodayStr()

  let expiredCount = 0
  let completedCount = 0
  let errors = 0

  try {
    // Süresi dolmuş paketler (expire_date geçmiş, hâlâ active)
    const { data: expiredPackages, error: expiredError } = await admin
      .from('packages')
      .select(`
        id,
        trainer_id,
        client_id,
        expire_date,
        clients!inner(user_id, full_name),
        trainers!inner(user_id, full_name)
      `)
      .eq('status', 'active')
      .lt('expire_date', today)

    if (expiredError) {
      console.error('Expired packages fetch error:', expiredError)
      return NextResponse.json({ error: 'Süresi dolmuş paketler getirilemedi' }, { status: 500 })
    }

    // Ders limiti dolmuş paketler (used_lessons >= total_lessons, hâlâ active)
    const { data: completedPackages, error: completedError } = await admin
      .from('packages')
      .select(`
        id,
        trainer_id,
        client_id,
        total_lessons,
        used_lessons,
        clients!inner(user_id, full_name),
        trainers!inner(user_id, full_name)
      `)
      .eq('status', 'active')
      .filter('used_lessons', 'gte', 'total_lessons')

    if (completedError) {
      console.error('Completed packages fetch error:', completedError)
      return NextResponse.json({ error: 'Tamamlanan paketler getirilemedi' }, { status: 500 })
    }

    // ── Süresi dolmuş paketleri işle ──
    for (const pkg of expiredPackages ?? []) {
      try {
        const client = pkg.clients as unknown as { user_id: string | null; full_name: string }
        const trainer = pkg.trainers as unknown as { user_id: string; full_name: string }

        await admin
          .from('packages')
          .update({ status: 'expired' })
          .eq('id', pkg.id)

        // Danışana bildirim
        if (client.user_id) {
          await admin.from('notifications').insert({
            user_id: client.user_id,
            trainer_id: pkg.trainer_id,
            type: 'low_lessons',
            title: 'Paket Süresi Doldu',
            message: `Paketinizin süresi ${pkg.expire_date} tarihinde dolmuştur. Eğitmeninizle iletişime geçin.`,
            is_read: false,
            data: { package_id: pkg.id, expire_date: pkg.expire_date },
          })

          await sendPushNotification({
            userIds: [client.user_id],
            title: 'Paket Süresi Doldu',
            message: 'Paketinizin süresi dolmuştur. Devam etmek için eğitmeninizle iletişime geçin.',
            url: '/dashboard',
          })
        }

        // Eğitmene bildirim
        await admin.from('notifications').insert({
          user_id: trainer.user_id,
          trainer_id: pkg.trainer_id,
          type: 'low_lessons',
          title: 'Danışan Paketi Süresi Doldu',
          message: `${client.full_name} adlı danışanın paketi ${pkg.expire_date} tarihinde sona erdi.`,
          is_read: false,
          data: { package_id: pkg.id, client_id: pkg.client_id, expire_date: pkg.expire_date },
        })

        await sendPushNotification({
          userIds: [trainer.user_id],
          title: 'Danışan Paketi Süresi Doldu',
          message: `${client.full_name} adlı danışanın paketi sona erdi.`,
          url: `/dashboard/clients/${pkg.client_id}`,
        })

        expiredCount++
      } catch (err) {
        console.error(`Expired package işleme hatası (id: ${pkg.id}):`, err)
        errors++
      }
    }

    // ── Ders limiti dolmuş paketleri işle ──
    for (const pkg of completedPackages ?? []) {
      try {
        const client = pkg.clients as unknown as { user_id: string | null; full_name: string }
        const trainer = pkg.trainers as unknown as { user_id: string; full_name: string }

        await admin
          .from('packages')
          .update({ status: 'completed' })
          .eq('id', pkg.id)

        // Danışana bildirim
        if (client.user_id) {
          await admin.from('notifications').insert({
            user_id: client.user_id,
            trainer_id: pkg.trainer_id,
            type: 'low_lessons',
            title: 'Paket Tamamlandı',
            message: `Tebrikler! ${pkg.total_lessons} derslik paketinizi tamamladınız. Devam etmek için eğitmeninizle iletişime geçin.`,
            is_read: false,
            data: { package_id: pkg.id, total_lessons: pkg.total_lessons },
          })

          await sendPushNotification({
            userIds: [client.user_id],
            title: 'Paket Tamamlandı',
            message: `Tebrikler! ${pkg.total_lessons} derslik paketinizi tamamladınız.`,
            url: '/dashboard',
          })
        }

        // Eğitmene bildirim
        await admin.from('notifications').insert({
          user_id: trainer.user_id,
          trainer_id: pkg.trainer_id,
          type: 'low_lessons',
          title: 'Danışan Paketi Tamamlandı',
          message: `${client.full_name} adlı danışan ${pkg.total_lessons} derslik paketini tamamladı.`,
          is_read: false,
          data: { package_id: pkg.id, client_id: pkg.client_id, total_lessons: pkg.total_lessons },
        })

        await sendPushNotification({
          userIds: [trainer.user_id],
          title: 'Danışan Paketi Tamamlandı',
          message: `${client.full_name} adlı danışan paketini tamamladı.`,
          url: `/dashboard/clients/${pkg.client_id}`,
        })

        completedCount++
      } catch (err) {
        console.error(`Completed package işleme hatası (id: ${pkg.id}):`, err)
        errors++
      }
    }

    return NextResponse.json({
      expiredCount,
      completedCount,
      errors,
      date: today,
    })
  } catch (error) {
    console.error('GET /api/cron/check-packages error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
