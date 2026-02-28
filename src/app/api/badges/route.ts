import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { BADGE_DEFINITIONS, isBadgeEarned, type BadgeStats } from '@/lib/badges'
import { sendPushNotification } from '@/lib/push'

export async function GET() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const userId = session.user.id
  const admin = createAdminClient()

  // Bu haftanin baslangici (Pazartesi)
  const now = new Date()
  const dayOfWeek = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7))
  monday.setHours(0, 0, 0, 0)
  const mondayStr = monday.toISOString().split('T')[0]

  // Paralel veri cekimi
  const [
    { count: totalLessons },
    { count: weeklyLessons },
    { data: reports },
    { data: goals },
    { data: earnedBadges },
    { count: nutritionEntries },
  ] = await Promise.all([
    supabase.from('lessons').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('lessons').select('*', { count: 'exact', head: true }).eq('user_id', userId).gte('date', mondayStr),
    supabase.from('weekly_reports').select('consecutive_weeks, nutrition_compliance').eq('user_id', userId).order('week_start', { ascending: false }),
    supabase.from('member_goals').select('*').eq('user_id', userId),
    admin.from('member_badges').select('*').eq('user_id', userId),
    supabase.from('meal_logs').select('*', { count: 'exact', head: true }).eq('user_id', userId),
  ])

  // Istatistikleri hesapla
  const maxStreak = reports?.reduce((max, r) => Math.max(max, r.consecutive_weeks || 0), 0) || 0
  const currentStreak = reports?.[0]?.consecutive_weeks || 0
  const bestNutritionCompliance = reports?.reduce((max, r) => Math.max(max, r.nutrition_compliance || 0), 0) || 0
  const goalsSet = goals?.length || 0
  const goalsAchieved = goals?.filter(g => g.achieved_at !== null).length || 0

  const stats: BadgeStats = {
    totalLessons: totalLessons || 0,
    weeklyLessons: weeklyLessons || 0,
    maxStreak,
    currentStreak,
    goalsSet,
    goalsAchieved,
    nutritionEntries: nutritionEntries || 0,
    bestNutritionCompliance,
  }

  // Yeni kazanilan rozetleri kontrol et ve kaydet
  const earnedBadgeIds = new Set((earnedBadges || []).map(b => b.badge_id))
  const newBadges: string[] = []

  for (const badge of BADGE_DEFINITIONS) {
    if (!earnedBadgeIds.has(badge.id) && isBadgeEarned(badge, stats)) {
      newBadges.push(badge.id)
    }
  }

  // Yeni rozetleri kaydet
  if (newBadges.length > 0) {
    const inserts = newBadges.map(badgeId => ({
      user_id: userId,
      badge_id: badgeId,
      notified: true,
    }))

    await admin.from('member_badges').insert(inserts)

    // Bildirim gonder
    for (const badgeId of newBadges) {
      const badge = BADGE_DEFINITIONS.find(b => b.id === badgeId)
      if (badge) {
        await admin.from('notifications').insert({
          user_id: userId,
          type: 'badge_earned',
          title: 'Yeni Rozet!',
          message: `"${badge.name}" rozetini kazandın! ${badge.description}`,
        })

        await sendPushNotification({
          userIds: [userId],
          title: 'Yeni Rozet!',
          message: `"${badge.name}" rozetini kazandın!`,
          url: '/dashboard/rozetler',
        })
      }
    }
  }

  // Yeni eklenen rozetlerin DB id'lerini al
  let newBadgeRecords: { id: string; badge_id: string; earned_at: string }[] = []
  if (newBadges.length > 0) {
    const { data: freshRecords } = await admin
      .from('member_badges')
      .select('id, badge_id, earned_at')
      .eq('user_id', userId)
      .in('badge_id', newBadges)
    newBadgeRecords = freshRecords || []
  }

  // Guncel earned badges listesi — DB id dahil
  const allEarnedBadgeIds = new Set([...earnedBadgeIds, ...newBadges])
  const earnedMap = new Map((earnedBadges || []).map(b => [b.badge_id, { dbId: b.id, earnedAt: b.earned_at }]))
  for (const rec of newBadgeRecords) {
    earnedMap.set(rec.badge_id, { dbId: rec.id, earnedAt: rec.earned_at })
  }

  const badges = BADGE_DEFINITIONS.map(badge => ({
    ...badge,
    earned: allEarnedBadgeIds.has(badge.id),
    earnedAt: earnedMap.get(badge.id)?.earnedAt || null,
    dbId: earnedMap.get(badge.id)?.dbId || null,
  }))

  return NextResponse.json({ badges, stats, newBadges, userId })
}
