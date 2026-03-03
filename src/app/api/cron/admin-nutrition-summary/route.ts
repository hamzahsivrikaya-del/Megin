import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notifyAdmin } from '@/lib/admin-notify'
import { safeCompare } from '@/lib/auth-utils'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization') || ''
  const expected = `Bearer ${process.env.CRON_SECRET}`
  if (!safeCompare(authHeader, expected)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const admin = createAdminClient()

  // Turkiye tarihi
  const turkeyNow = new Date(Date.now() + 3 * 60 * 60 * 1000)
  const todayStr = turkeyNow.toISOString().slice(0, 10)
  const turkeyHour = turkeyNow.getHours()

  // Tum aktif uyeleri al (bagli uyeler haric)
  const { data: members } = await admin
    .from('users')
    .select('id, full_name')
    .eq('role', 'member')
    .eq('is_active', true)
    .is('parent_id', null)

  if (!members || members.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 })
  }

  // Bugunun beslenme kayitlarini al (is_extra haric)
  const { data: mealLogs } = await admin
    .from('meal_logs')
    .select('user_id')
    .eq('date', todayStr)
    .eq('is_extra', false)

  // Giris yapan unique uye ID'leri
  const loggedUserIds = new Set((mealLogs || []).map(l => l.user_id))

  const entered = members.filter(m => loggedUserIds.has(m.id))
  const notEntered = members.filter(m => !loggedUserIds.has(m.id))

  const total = members.length
  const enteredCount = entered.length

  // Mesaj olustur
  let message = `${enteredCount}/${total} üye beslenme girdi.`

  if (entered.length > 0) {
    const names = entered.map(m => m.full_name).join(', ')
    message += `\nGirenler: ${names}`
  }

  if (notEntered.length > 0) {
    const names = notEntered.map(m => m.full_name).join(', ')
    message += `\nGirmeyenler: ${names}`
  }

  await notifyAdmin({
    type: 'admin_nutrition_summary',
    title: `Beslenme Durumu (${String(turkeyHour).padStart(2, '0')}:00)`,
    message,
    url: '/admin/notifications',
  })

  return NextResponse.json({ ok: true, entered: enteredCount, total })
}
