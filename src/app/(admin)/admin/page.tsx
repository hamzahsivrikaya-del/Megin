import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Link from 'next/link'
import { toDateStr } from '@/lib/utils'
import NutritionCard from './NutritionCard'
import MemberSearch from '@/components/shared/MemberSearch'

function AlertsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-pulse">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-surface rounded-2xl border border-border p-5 space-y-3">
          <div className="h-5 bg-border rounded w-36" />
          {[...Array(3)].map((_, j) => (
            <div key={j} className="flex items-center justify-between">
              <div className="h-4 bg-border rounded w-32" />
              <div className="h-5 bg-border rounded-full w-20" />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Kritik: istatistik kartları — hemen render
  const [
    { count: activeMembers },
    { data: weeklyLessons },
    { data: todayLessons },
  ] = await Promise.all([
    supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'member')
      .eq('is_active', true),
    supabase
      .from('lessons')
      .select('id')
      .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
    supabase
      .from('lessons')
      .select('id, users(full_name), date, start_time')
      .eq('date', new Date().toISOString().split('T')[0]),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Anasayfa</h1>

      {/* İstatistik Çipleri — kompakt tek satır */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-primary/30 rounded-full text-sm font-medium text-text-primary">
          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          {activeMembers || 0} Üye
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-primary/30 rounded-full text-sm font-medium text-text-primary">
          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          {weeklyLessons?.length || 0} Haftalık
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-primary/30 rounded-full text-sm font-medium text-text-primary">
          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          {todayLessons?.length || 0} Bugün
        </span>
      </div>

      {/* Hızlı Aksiyonlar — hemen render */}
      <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2 sm:gap-3">
        <Link
          href="/admin/takvim"
          className="inline-flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-3 sm:py-2.5 bg-primary text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-primary-hover active:bg-primary-hover transition-colors"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Takvim</span>
        </Link>
        <Link
          href="/admin/lessons/new"
          className="inline-flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-3 sm:py-2.5 bg-surface border border-border text-text-primary rounded-lg text-xs sm:text-sm font-medium hover:bg-surface-hover active:bg-surface-hover transition-colors"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Ders Ekle</span>
        </Link>
        <Link
          href="/admin/members?action=new"
          className="inline-flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-3 sm:py-2.5 bg-surface border border-border text-text-primary rounded-lg text-xs sm:text-sm font-medium hover:bg-surface-hover active:bg-surface-hover transition-colors"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <span>Yeni Üye</span>
        </Link>
      </div>

      {/* Üye Arama */}
      <MemberSearch />

      {/* Bugünün Ders Programı */}
      <Card className="border-primary/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Bugünün Programı</CardTitle>
            <Link href="/admin/takvim" className="text-xs text-primary font-medium hover:underline">
              Takvime git →
            </Link>
          </div>
        </CardHeader>
        {todayLessons && todayLessons.length > 0 ? (
          <div className="space-y-1.5">
            {[...todayLessons]
              .sort((a, b) => (String((a as Record<string, unknown>).start_time || '')).localeCompare(String((b as Record<string, unknown>).start_time || '')))
              .map((lesson: Record<string, unknown>) => (
                <div key={lesson.id as string} className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-hover">
                  <span className="text-sm font-medium text-text-primary">
                    {(lesson.users as Record<string, string>)?.full_name}
                  </span>
                  <span className="text-sm text-primary font-semibold">
                    {(lesson.start_time as string) || '—'}
                  </span>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary">Bugün henüz ders planlanmamış</p>
        )}
      </Card>

      {/* Uyarılar — ertelenmiş */}
      <Suspense fallback={<AlertsSkeleton />}>
        <DeferredAlerts todayLessons={todayLessons} />
      </Suspense>
    </div>
  )
}

async function DeferredAlerts({ todayLessons }: { todayLessons: Record<string, unknown>[] | null }) {
  const supabase = await createClient()
  const today = toDateStr(new Date())

  const [
    { data: lowLessonMembers_raw },
    { data: activeMembers_raw },
    { data: memberMeals_raw },
    { data: todayMealLogs_raw },
  ] = await Promise.all([
    supabase
      .from('packages')
      .select('user_id, total_lessons, used_lessons, status, users(full_name)')
      .in('status', ['active', 'completed']),
    supabase
      .from('users')
      .select('id, full_name')
      .eq('role', 'member')
      .eq('is_active', true),
    supabase
      .from('member_meals')
      .select('user_id, id, name, order_num')
      .order('order_num'),
    supabase
      .from('meal_logs')
      .select('user_id, meal_id, status, photo_url, is_extra')
      .eq('date', today)
      .eq('is_extra', false),
  ])

  const renewedUserIds = new Set(
    (lowLessonMembers_raw || [])
      .filter(pkg => pkg.status === 'active')
      .map(pkg => pkg.user_id)
  )

  const alertMembers = (lowLessonMembers_raw || [])
    .filter((pkg) => {
      if (pkg.status === 'completed' && renewedUserIds.has(pkg.user_id)) return false
      return pkg.status === 'completed' || (pkg.total_lessons - pkg.used_lessons) <= 2
    })
    .sort((a, b) => {
      const remA = a.status === 'completed' ? -1 : (a.total_lessons - a.used_lessons)
      const remB = b.status === 'completed' ? -1 : (b.total_lessons - b.used_lessons)
      return remA - remB
    })

  // Beslenme veri dönüşümü
  const mealsMap = new Map<string, { id: string; name: string }[]>()
  for (const m of memberMeals_raw || []) {
    if (!mealsMap.has(m.user_id)) mealsMap.set(m.user_id, [])
    mealsMap.get(m.user_id)!.push({ id: m.id, name: m.name })
  }

  const logsMap = new Map<string, Map<string, { status: string; photoUrl: string | null }>>()
  for (const log of todayMealLogs_raw || []) {
    if (!logsMap.has(log.user_id)) logsMap.set(log.user_id, new Map())
    logsMap.get(log.user_id)!.set(log.meal_id, {
      status: log.status,
      photoUrl: log.photo_url,
    })
  }

  type NutritionSummary = {
    userId: string
    fullName: string
    meals: { name: string; completed: boolean; photoUrl: string | null }[]
    completedCount: number
    totalCount: number
  }

  const nutritionData: NutritionSummary[] = (activeMembers_raw || [])
    .filter(u => mealsMap.has(u.id))
    .map(u => {
      const userMeals = mealsMap.get(u.id)!
      const userLogs = logsMap.get(u.id)
      const meals = userMeals.map(m => {
        const log = userLogs?.get(m.id)
        return {
          name: m.name,
          completed: log?.status === 'compliant',
          photoUrl: log?.photoUrl ?? null,
        }
      })
      return {
        userId: u.id,
        fullName: u.full_name,
        meals,
        completedCount: meals.filter(m => m.completed).length,
        totalCount: meals.length,
      }
    })
    .sort((a, b) => {
      const pctA = a.totalCount > 0 ? a.completedCount / a.totalCount : 0
      const pctB = b.totalCount > 0 ? b.completedCount / b.totalCount : 0
      return pctA - pctB
    })

  const enteredCount = nutritionData.filter(n => n.completedCount > 0).length

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle>Paket Uyarıları</CardTitle>
        </CardHeader>
        {alertMembers.length > 0 ? (
          <ul className="space-y-1">
            {alertMembers.map((pkg) => {
              const remaining = pkg.total_lessons - pkg.used_lessons
              const isCompleted = pkg.status === 'completed'
              return (
                <li key={pkg.user_id}>
                  <Link href={`/admin/members/${pkg.user_id}`} className="flex items-center justify-between py-2 px-1 -mx-1 rounded-lg hover:bg-surface-hover active:bg-surface-hover transition-colors">
                    <span className="text-sm text-text-primary">
                      {((pkg.users as unknown) as { full_name: string })?.full_name}
                    </span>
                    <Badge variant={isCompleted || remaining <= 1 ? 'danger' : 'warning'}>
                      {isCompleted ? 'Paket Bitti' : remaining === 1 ? 'Son 1 Ders' : 'Son 2 Ders'}
                    </Badge>
                  </Link>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-sm text-text-secondary">Uyarı yok</p>
        )}
      </Card>

      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle>Bugün Gelen Üyeler</CardTitle>
        </CardHeader>
        {todayLessons && todayLessons.length > 0 ? (
          <ul className="space-y-2">
            {todayLessons.map((lesson: Record<string, unknown>) => (
              <li key={lesson.id as string} className="text-sm">
                {(lesson.users as Record<string, string>)?.full_name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-text-secondary">Bugün henüz ders yok</p>
        )}
      </Card>

      {nutritionData.length > 0 && (
        <div className="lg:col-span-2">
          <NutritionCard data={nutritionData} enteredCount={enteredCount} />
        </div>
      )}
    </div>
  )
}
