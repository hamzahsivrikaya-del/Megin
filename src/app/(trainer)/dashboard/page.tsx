import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Link from 'next/link'
import QuickActions from './QuickActions'

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
    { count: activePackages },
    { data: todayLessons },
    { count: unreadNotifs },
  ] = await Promise.all([
    supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('trainer_id', trainer.id)
      .eq('is_active', true),
    supabase
      .from('packages')
      .select('*', { count: 'exact', head: true })
      .eq('trainer_id', trainer.id)
      .eq('status', 'active'),
    supabase
      .from('lessons')
      .select('id, clients(full_name)')
      .eq('trainer_id', trainer.id)
      .eq('date', new Date().toISOString().split('T')[0]),
    supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Danışan"
          value={clientCount ?? 0}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          label="Aktif Paket"
          value={activePackages ?? 0}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
        <StatCard
          label="Bugün Ders"
          value={todayLessons?.length ?? 0}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          label="Bildirim"
          value={unreadNotifs ?? 0}
          accent
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          }
        />
      </div>

      {/* Hızlı Aksiyonlar */}
      <QuickActions trainerUsername={trainer.username} />

      {/* Uyarılar */}
      <Suspense fallback={<AlertsSkeleton />}>
        <DeferredAlerts trainerId={trainer.id} todayLessons={todayLessons} />
      </Suspense>
    </div>
  )
}

async function DeferredAlerts({
  trainerId,
  todayLessons,
}: {
  trainerId: string
  todayLessons: Record<string, unknown>[] | null
}) {
  const supabase = await createClient()

  const { data: packagesRaw } = await supabase
    .from('packages')
    .select('client_id, total_lessons, used_lessons, status, clients(full_name)')
    .eq('trainer_id', trainerId)
    .in('status', ['active', 'completed'])

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
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
                    className="flex items-center justify-between py-2 px-1 -mx-1 rounded-lg hover:bg-surface-hover active:bg-surface-hover transition-colors"
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

      <Card>
        <CardHeader>
          <CardTitle>Bugünkü Dersler</CardTitle>
        </CardHeader>
        {todayLessons && todayLessons.length > 0 ? (
          <ul className="space-y-2">
            {todayLessons.map((lesson: Record<string, unknown>) => (
              <li key={lesson.id as string} className="text-sm text-text-primary">
                {(lesson.clients as Record<string, string>)?.full_name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-text-secondary">Bugün henüz ders yok</p>
        )}
      </Card>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string
  value: number
  icon: React.ReactNode
  accent?: boolean
}) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-2">
        <span className="text-text-secondary">{icon}</span>
        {accent && value > 0 && (
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        )}
      </div>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      <p className="text-xs text-text-secondary mt-1">{label}</p>
    </Card>
  )
}
