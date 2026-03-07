import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import StatCard from '@/components/ui/StatCard'
import Badge from '@/components/ui/Badge'
import Link from 'next/link'
import QuickActions from './QuickActions'
import ClientSearch from '@/components/shared/ClientSearch'
import NutritionCard from './NutritionCard'
import SpotlightTour from '@/components/shared/SpotlightTour'
import { TRAINER_SPOTLIGHT_STEPS } from '@/lib/tour'
import { toDateStr } from '@/lib/utils'
import type { TourProgress } from '@/lib/types'
import type { NutritionSummary } from './NutritionCard'

function AlertsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-pulse">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-surface rounded-xl border border-border p-5 space-y-3">
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

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: trainer } = await supabase
    .from('trainers')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!trainer || !trainer.onboarding_completed) {
    redirect('/onboarding')
  }

  const [
    { count: clientCount },
    { data: todayLessons },
    { data: weeklyLessons },
  ] = await Promise.all([
    supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('trainer_id', trainer.id)
      .eq('is_active', true),
    supabase
      .from('lessons')
      .select('id, clients(full_name)')
      .eq('trainer_id', trainer.id)
      .eq('date', new Date().toISOString().split('T')[0]),
    supabase
      .from('lessons')
      .select('id')
      .eq('trainer_id', trainer.id)
      .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .lte('date', new Date().toISOString().split('T')[0]),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl heading-gradient">Anasayfa</h1>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-3 gap-3" data-tour="stat-clients">
        <StatCard
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          value={clientCount || 0}
          label="Danışan"
        />
        <StatCard
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
          value={weeklyLessons?.length || 0}
          label="Haftalık"
        />
        <StatCard
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          value={todayLessons?.length || 0}
          label="Bugün"
        />
      </div>

      {/* Hızlı Aksiyonlar */}
      <QuickActions trainerUsername={trainer.username} />

      {/* Danışan Arama */}
      <ClientSearch trainerId={trainer.id} />

      {/* Bugünün Programı */}
      <Card glow>
        <CardHeader>
          <CardTitle>Bugünün Programı</CardTitle>
        </CardHeader>
        {todayLessons && todayLessons.length > 0 ? (
          <div className="space-y-1.5">
            {todayLessons.map((lesson: Record<string, unknown>) => (
              <div key={lesson.id as string} className="flex items-center justify-between list-item-hover bg-surface-hover/50">
                <span className="text-sm font-medium text-text-primary">
                  {(lesson.clients as Record<string, string>)?.full_name}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary">Bugün henüz ders planlanmamış</p>
        )}
      </Card>

      {/* Uyarılar + Beslenme */}
      <Suspense fallback={<AlertsSkeleton />}>
        <DeferredAlerts trainerId={trainer.id} />
      </Suspense>

      {/* Spotlight Tour */}
      <SpotlightTour
        steps={TRAINER_SPOTLIGHT_STEPS}
        tourProgress={(trainer.tour_progress as TourProgress) ?? null}
        table="trainers"
      />
    </div>
  )
}

async function DeferredAlerts({
  trainerId,
}: {
  trainerId: string
}) {
  const supabase = await createClient()
  const today = toDateStr(new Date())

  const [
    { data: packagesRaw },
    { data: activeClients },
    { data: clientMealsRaw },
    { data: todayMealLogsRaw },
  ] = await Promise.all([
    supabase
      .from('packages')
      .select('client_id, total_lessons, used_lessons, status, clients(full_name)')
      .eq('trainer_id', trainerId)
      .in('status', ['active', 'completed']),
    supabase
      .from('clients')
      .select('id, full_name')
      .eq('trainer_id', trainerId)
      .eq('is_active', true),
    supabase
      .from('client_meals')
      .select('client_id, id, name, order_num')
      .order('order_num'),
    supabase
      .from('meal_logs')
      .select('client_id, meal_id, status, photo_url, is_extra')
      .eq('date', today)
      .eq('is_extra', false),
  ])

  // Yenilenmiş paketleri filtrele
  const renewedClientIds = new Set(
    (packagesRaw || [])
      .filter(pkg => pkg.status === 'active')
      .map(pkg => pkg.client_id)
  )

  const alertPackages = (packagesRaw || [])
    .filter((pkg) => {
      if (pkg.status === 'completed' && renewedClientIds.has(pkg.client_id)) return false
      return pkg.status === 'completed' || (pkg.total_lessons - pkg.used_lessons) <= 2
    })
    .sort((a, b) => {
      const remA = a.status === 'completed' ? -1 : (a.total_lessons - a.used_lessons)
      const remB = b.status === 'completed' ? -1 : (b.total_lessons - b.used_lessons)
      return remA - remB
    })

  // Beslenme veri dönüşümü
  const mealsMap = new Map<string, { id: string; name: string }[]>()
  for (const m of clientMealsRaw || []) {
    if (!mealsMap.has(m.client_id)) mealsMap.set(m.client_id, [])
    mealsMap.get(m.client_id)!.push({ id: m.id, name: m.name })
  }

  const logsMap = new Map<string, Map<string, { status: string; photoUrl: string | null }>>()
  for (const log of todayMealLogsRaw || []) {
    if (!logsMap.has(log.client_id)) logsMap.set(log.client_id, new Map())
    logsMap.get(log.client_id)!.set(log.meal_id, {
      status: log.status,
      photoUrl: log.photo_url,
    })
  }

  const nutritionData: NutritionSummary[] = (activeClients || [])
    .filter(c => mealsMap.has(c.id))
    .map(c => {
      const clientMeals = mealsMap.get(c.id)!
      const clientLogs = logsMap.get(c.id)
      const meals = clientMeals.map(m => {
        const log = clientLogs?.get(m.id)
        return {
          name: m.name,
          completed: log?.status === 'compliant',
          photoUrl: log?.photoUrl ?? null,
        }
      })
      return {
        clientId: c.id,
        fullName: c.full_name,
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
      <Card glow>
        <CardHeader>
          <CardTitle>Paket Uyarıları</CardTitle>
        </CardHeader>
        {alertPackages.length > 0 ? (
          <ul className="space-y-1">
            {alertPackages.map((pkg) => {
              const remaining = pkg.total_lessons - pkg.used_lessons
              const isCompleted = pkg.status === 'completed'
              return (
                <li key={pkg.client_id}>
                  <Link
                    href={`/dashboard/clients/${pkg.client_id}`}
                    className="flex items-center justify-between list-item-hover"
                  >
                    <span className="text-sm text-text-primary">
                      {((pkg.clients as unknown) as { full_name: string })?.full_name}
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

      {nutritionData.length > 0 && (
        <div className="lg:col-span-2">
          <NutritionCard data={nutritionData} enteredCount={enteredCount} />
        </div>
      )}
    </div>
  )
}
