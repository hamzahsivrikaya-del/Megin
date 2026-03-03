import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPushNotification } from '@/lib/push'

function verifyCronSecret(request: NextRequest): boolean {
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${process.env.CRON_SECRET}`
}

function getWeekStart(): string {
  const now = new Date()
  const day = now.getDay() // 0=Pazar, 1=Pazartesi, ...
  const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Pazartesi'ye getir
  const monday = new Date(now.setDate(diff))
  return monday.toISOString().split('T')[0]
}

function generateSummary(lessonsCount: number, nutritionCompliance: number | null, consecutiveWeeks: number): string {
  const parts: string[] = []

  if (lessonsCount === 0) {
    parts.push('Bu hafta hiç antrenman yapılmadı.')
  } else if (lessonsCount === 1) {
    parts.push('Bu hafta 1 antrenman tamamlandı.')
  } else {
    parts.push(`Bu hafta ${lessonsCount} antrenman tamamlandı.`)
  }

  if (nutritionCompliance !== null) {
    const pct = Math.round(nutritionCompliance)
    if (pct >= 80) {
      parts.push(`Beslenme uyumu mükemmel: %${pct}.`)
    } else if (pct >= 50) {
      parts.push(`Beslenme uyumu orta düzeyde: %${pct}.`)
    } else {
      parts.push(`Beslenme uyumu düşük: %${pct}. Gelişime ihtiyaç var.`)
    }
  }

  if (consecutiveWeeks >= 4) {
    parts.push(`${consecutiveWeeks} hafta üst üste aktif - harika bir çalışma serisi!`)
  } else if (consecutiveWeeks >= 2) {
    parts.push(`${consecutiveWeeks} haftadır düzenli devam ediyor.`)
  }

  return parts.join(' ')
}

// ── GET: Haftalık rapor oluştur (Cron - Her Pazar) ──
export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  const admin = createAdminClient()
  const weekStart = getWeekStart()
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  const weekEndStr = weekEnd.toISOString().split('T')[0]

  let reportsGenerated = 0
  let errors = 0

  try {
    // Aktif eğitmenleri al
    const { data: trainers, error: trainersError } = await admin
      .from('trainers')
      .select('id')
      .eq('is_active', true)

    if (trainersError || !trainers?.length) {
      return NextResponse.json({ reportsGenerated: 0, message: 'Aktif eğitmen bulunamadı' })
    }

    for (const trainer of trainers) {
      // Bu eğitmenin aktif paketi olan danışanlarını al
      const { data: packages, error: packagesError } = await admin
        .from('packages')
        .select('client_id, clients!inner(id, user_id, full_name, is_active)')
        .eq('trainer_id', trainer.id)
        .eq('status', 'active')

      if (packagesError || !packages?.length) continue

      // Benzersiz danışanlar
      const seen = new Set<string>()
      const uniqueClients: Array<{ id: string; user_id: string | null; full_name: string }> = []

      for (const pkg of packages) {
        const client = pkg.clients as unknown as { id: string; user_id: string | null; full_name: string; is_active: boolean }
        if (!seen.has(client.id) && client.is_active) {
          seen.add(client.id)
          uniqueClients.push({ id: client.id, user_id: client.user_id, full_name: client.full_name })
        }
      }

      for (const client of uniqueClients) {
        try {
          // Bu haftaki ders sayısı
          const { count: lessonsCount } = await admin
            .from('lessons')
            .select('id', { count: 'exact', head: true })
            .eq('trainer_id', trainer.id)
            .eq('client_id', client.id)
            .gte('date', weekStart)
            .lte('date', weekEndStr)

          // Bu haftaki beslenme uyumu
          const { data: mealLogs } = await admin
            .from('meal_logs')
            .select('status')
            .eq('trainer_id', trainer.id)
            .eq('client_id', client.id)
            .gte('date', weekStart)
            .lte('date', weekEndStr)

          let nutritionCompliance: number | null = null
          if (mealLogs && mealLogs.length > 0) {
            const compliantCount = mealLogs.filter((l) => l.status === 'compliant').length
            nutritionCompliance = (compliantCount / mealLogs.length) * 100
          }

          // Önceki rapordan ardışık hafta sayısı
          const { data: prevReport } = await admin
            .from('weekly_reports')
            .select('consecutive_weeks')
            .eq('trainer_id', trainer.id)
            .eq('client_id', client.id)
            .order('week_start', { ascending: false })
            .limit(1)
            .single()

          const prevConsecutive = prevReport?.consecutive_weeks ?? 0
          const currentLessons = lessonsCount ?? 0
          const consecutiveWeeks = currentLessons > 0 ? prevConsecutive + 1 : 0

          const summary = generateSummary(currentLessons, nutritionCompliance, consecutiveWeeks)

          // Rapor ekle
          const { error: insertError } = await admin
            .from('weekly_reports')
            .insert({
              trainer_id: trainer.id,
              client_id: client.id,
              week_start: weekStart,
              lessons_count: currentLessons,
              nutrition_compliance: nutritionCompliance,
              consecutive_weeks: consecutiveWeeks,
              summary,
            })

          if (insertError) {
            console.error('weekly_reports insert error:', insertError)
            errors++
            continue
          }

          // Danışana bildirim oluştur
          if (client.user_id) {
            await admin.from('notifications').insert({
              user_id: client.user_id,
              trainer_id: trainer.id,
              type: 'weekly_report',
              title: 'Haftalık Raporun Hazır',
              message: summary,
              is_read: false,
              data: { week_start: weekStart, lessons_count: currentLessons },
            })

            await sendPushNotification({
              userIds: [client.user_id],
              title: 'Haftalık Raporun Hazır',
              message: `${client.full_name}, bu haftaki performans raporunu görüntüle.`,
              url: '/dashboard',
            })
          }

          reportsGenerated++
        } catch (err) {
          console.error(`Rapor oluşturma hatası (client: ${client.id}):`, err)
          errors++
        }
      }
    }

    return NextResponse.json({ reportsGenerated, errors, weekStart })
  } catch (error) {
    console.error('GET /api/cron/weekly-report error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
