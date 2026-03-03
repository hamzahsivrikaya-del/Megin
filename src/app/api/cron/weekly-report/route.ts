import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getWeekRange, generateMessage } from '@/lib/weekly-report'
import { sendPushNotification } from '@/lib/push'
import { safeCompare } from '@/lib/auth-utils'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization') || ''
  const expected = `Bearer ${process.env.CRON_SECRET}`
  if (!safeCompare(authHeader, expected)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  // Saat kontrolü: sadece 11:00-19:00 UTC (TR 14:00-22:00) arasında gönder
  const nowUTC = new Date().getUTCHours()
  if (nowUTC < 11 || nowUTC >= 19) {
    return NextResponse.json({ ok: true, generated: 0, skipped: 'outside-time-window' })
  }

  const admin = createAdminClient()
  const { weekStart, weekEnd } = getWeekRange(new Date())

  // Bu hafta zaten gonderildi mi? (tekrar onleme)
  const { count: existingCount } = await admin
    .from('weekly_reports')
    .select('id', { count: 'exact', head: true })
    .eq('week_start', weekStart)

  if (existingCount && existingCount > 0) {
    return NextResponse.json({ ok: true, generated: 0, skipped: 'already-generated-this-week' })
  }

  // Aktif üyeleri al
  const { data: members, error: memberError } = await admin
    .from('users')
    .select('id')
    .eq('role', 'member')
    .eq('is_active', true)

  if (memberError || !members?.length) {
    return NextResponse.json({ ok: true, generated: 0, total: 0 })
  }

  const results = await Promise.allSettled(
    members.map((member) => generateReport(admin, member.id, weekStart, weekEnd))
  )

  // Push bildirim gönder
  const userIds = members.map((m) => m.id)
  await sendPushNotification({
    userIds,
    title: 'Haftalık Raporun Hazır!',
    message: 'Bu haftaki performansını görmek için tıkla 💪',
    url: '/dashboard/haftalik-ozet',
  })

  const succeeded = results.filter((r) => r.status === 'fulfilled').length
  return NextResponse.json({ ok: true, generated: succeeded, total: members.length })
}

async function generateReport(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  weekStart: string,
  weekEnd: string
) {
  // Bu haftaki dersler
  const { count: lessonsCount } = await admin
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('date', weekStart)
    .lte('date', weekEnd)

  const count = lessonsCount ?? 0
  const totalHours = parseFloat((count * 1).toFixed(1))

  // Streak hesapla
  const consecutiveWeeks = await calculateStreak(admin, userId, weekStart)

  // Beslenme uyumu hesapla
  const { data: weekMeals } = await admin
    .from('meal_logs')
    .select('status')
    .eq('user_id', userId)
    .eq('is_extra', false)
    .gte('date', weekStart)
    .lte('date', weekEnd)

  const nutritionCompliance = weekMeals && weekMeals.length > 0
    ? Math.round((weekMeals.filter((m: { status: string }) => m.status === 'compliant').length / weekMeals.length) * 100)
    : null

  const message = generateMessage(count, consecutiveWeeks, nutritionCompliance)

  // Upsert — aynı hafta için tekrar çalışırsa günceller
  await admin.from('weekly_reports').upsert(
    {
      user_id: userId,
      week_start: weekStart,
      week_end: weekEnd,
      lessons_count: count,
      total_hours: totalHours,
      consecutive_weeks: consecutiveWeeks,
      nutrition_compliance: nutritionCompliance,
      message,
    },
    { onConflict: 'user_id,week_start' }
  )
}

async function calculateStreak(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  currentWeekStart: string
): Promise<number> {
  let streak = 0
  const checkDate = new Date(currentWeekStart)

  for (let i = 0; i < 52; i++) {
    const wStart = checkDate.toISOString().split('T')[0]
    const wEnd = new Date(checkDate)
    wEnd.setDate(checkDate.getDate() + 6)
    const wEndStr = wEnd.toISOString().split('T')[0]

    const { count } = await admin
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('date', wStart)
      .lte('date', wEndStr)

    if ((count ?? 0) > 0) {
      streak++
      checkDate.setDate(checkDate.getDate() - 7) // Önceki haftaya git
    } else {
      break // Seri bozuldu
    }
  }

  return streak
}
