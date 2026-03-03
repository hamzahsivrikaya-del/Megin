import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  BADGE_DEFINITIONS,
  BadgeStats,
  isBadgeEarned,
} from '@/lib/badges'

export async function GET() {
  try {
    const supabase = await createClient()

    // Auth kontrolü
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 })
    }

    // Danışan bilgisini al
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, trainer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Danışan profili bulunamadı' }, { status: 403 })
    }

    // İstatistikleri paralel olarak çek
    const [
      { count: totalLessons },
      { data: weeklyReports },
      { data: goals },
      { data: earnedBadges },
      { count: mealLogCount },
    ] = await Promise.all([
      // Toplam ders sayısı
      supabase
        .from('lessons')
        .select('id', { count: 'exact', head: true })
        .eq('client_id', client.id),

      // Haftalık raporlar (streak ve beslenme uyumu için)
      supabase
        .from('weekly_reports')
        .select('consecutive_weeks, nutrition_compliance')
        .eq('client_id', client.id)
        .order('week_start', { ascending: false }),

      // Hedefler
      supabase
        .from('client_goals')
        .select('id, achieved_at')
        .eq('client_id', client.id),

      // Kazanılmış rozetler
      supabase
        .from('client_badges')
        .select('badge_id, earned_at')
        .eq('client_id', client.id),

      // Beslenme kayıt sayısı
      supabase
        .from('meal_logs')
        .select('id', { count: 'exact', head: true })
        .eq('client_id', client.id),
    ])

    // İstatistikleri hesapla
    const maxStreak = weeklyReports && weeklyReports.length > 0
      ? Math.max(...weeklyReports.map((r) => r.consecutive_weeks ?? 0))
      : 0

    const currentStreak = weeklyReports && weeklyReports.length > 0
      ? (weeklyReports[0]?.consecutive_weeks ?? 0)
      : 0

    const bestNutritionCompliance = weeklyReports && weeklyReports.length > 0
      ? Math.max(...weeklyReports.map((r) => r.nutrition_compliance ?? 0))
      : 0

    const goalsSet = goals?.length ?? 0
    const goalsAchieved = goals?.filter((g) => g.achieved_at !== null).length ?? 0

    const stats: BadgeStats = {
      totalLessons: totalLessons ?? 0,
      weeklyLessons: currentStreak,
      maxStreak,
      currentStreak,
      goalsSet,
      goalsAchieved,
      nutritionEntries: mealLogCount ?? 0,
      bestNutritionCompliance,
    }

    // Kazanılmış rozet ID'leri seti
    const earnedBadgeIds = new Set((earnedBadges ?? []).map((b) => b.badge_id))

    // Admin client (RLS bypass için)
    const adminClient = createAdminClient()

    // Yeni kazanılan rozetleri kontrol et ve kaydet
    const newlyEarned: string[] = []

    for (const badge of BADGE_DEFINITIONS) {
      if (badge.trigger === 'admin') continue
      if (earnedBadgeIds.has(badge.id)) continue

      if (isBadgeEarned(badge, stats)) {
        // Rozeti veritabanına kaydet
        const { error: insertError } = await adminClient
          .from('client_badges')
          .insert({
            client_id: client.id,
            trainer_id: client.trainer_id,
            badge_id: badge.id,
            notified: false,
          })

        if (!insertError) {
          earnedBadgeIds.add(badge.id)
          newlyEarned.push(badge.id)

          // Bildirim oluştur
          await adminClient
            .from('notifications')
            .insert({
              user_id: user.id,
              trainer_id: client.trainer_id,
              type: 'badge_earned',
              title: `Rozet Kazandın: ${badge.name}`,
              message: badge.description,
              is_read: false,
              data: { badge_id: badge.id, badge_emoji: badge.emoji },
            })
        }
      }
    }

    // Tüm rozetleri kazanım durumu ile döndür
    const earnedBadgeMap = new Map(
      (earnedBadges ?? []).map((b) => [b.badge_id, b.earned_at])
    )

    const badges = BADGE_DEFINITIONS.map((badge) => {
      const isEarned = earnedBadgeIds.has(badge.id)
      return {
        ...badge,
        earned: isEarned,
        earnedAt: isEarned ? (earnedBadgeMap.get(badge.id) ?? null) : null,
      }
    })

    return NextResponse.json({ badges, stats, newlyEarned })
  } catch (error) {
    console.error('GET /api/badges error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
