import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Link from 'next/link'
import { formatDate, daysRemaining, getPackageStatusLabel, formatPrice } from '@/lib/utils'
import type { ClientGoal, TourProgress } from '@/lib/types'
import BadgeStrip from '@/components/shared/BadgeStrip'
import SpotlightTour from '@/components/shared/SpotlightTour'
import { CLIENT_SPOTLIGHT_STEPS } from '@/lib/tour'

function SectionSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-surface rounded-2xl border border-border p-5 space-y-3">
        <div className="h-5 bg-border rounded w-36" />
        <div className="h-4 bg-border rounded w-full" />
        <div className="h-4 bg-border rounded w-2/3" />
      </div>
      <div className="bg-surface rounded-2xl border border-border p-5 space-y-3">
        <div className="h-5 bg-border rounded w-28" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-border rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default async function ClientDashboardPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/login')
  const user = session.user

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!client) redirect('/login')

  const today = new Date().toISOString().split('T')[0]
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Kritik veri — hemen render
  const [
    { data: activePackage },
    { data: firstLesson },
    { data: clientMeals },
    { data: todayMeals },
    { data: upcomingLessons },
  ] = await Promise.all([
    supabase
      .from('packages')
      .select('*')
      .eq('client_id', client.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('lessons')
      .select('date')
      .eq('client_id', client.id)
      .order('date', { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('client_meals')
      .select('*')
      .eq('client_id', client.id)
      .order('order_num'),
    supabase
      .from('meal_logs')
      .select('meal_id, status')
      .eq('client_id', client.id)
      .eq('date', today),
    supabase
      .from('lessons')
      .select('id, date, start_time, duration')
      .eq('client_id', client.id)
      .gte('date', today)
      .lte('date', nextWeek)
      .order('date')
      .order('start_time'),
  ])

  const remaining = activePackage
    ? activePackage.total_lessons - activePackage.used_lessons
    : 0
  const days = activePackage ? daysRemaining(activePackage.expire_date) : 0

  let statusLabel = 'Paket Yok'
  let statusVariant: 'success' | 'warning' | 'danger' | 'default' = 'default'
  if (activePackage) {
    const ratio = remaining / activePackage.total_lessons
    if (remaining <= 0) {
      statusLabel = 'Bitti'
      statusVariant = 'danger'
    } else if (ratio <= 0.25) {
      statusLabel = `Son ${remaining} Ders`
      statusVariant = 'danger'
    } else if (ratio <= 0.5) {
      statusLabel = 'Azalıyor'
      statusVariant = 'warning'
    } else {
      statusLabel = 'Aktif'
      statusVariant = 'success'
    }
  }

  const firstName = client.full_name?.split(' ')[0] || ''

  return (
    <div className="space-y-6">
      {/* Hosgeldin karti */}
      <div data-tour="welcome-card">
      <Card className="border-primary/20 gradient-border animate-fade-up">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full bg-surface-hover border-2 border-border overflow-hidden flex-shrink-0">
              {client.avatar_url ? (
                <Image src={client.avatar_url} alt="" fill className="object-cover" sizes="48px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-lg font-bold text-text-secondary">
                    {firstName.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">
                Hos geldin, {firstName.charAt(0).toUpperCase() + firstName.slice(1)}
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                Uyelik baslangici: {firstLesson?.date ? formatDate(firstLesson.date) : client.start_date ? formatDate(client.start_date) : '-'}
              </p>
            </div>
          </div>
          {statusVariant !== 'danger' && (
            <Badge variant={statusVariant}>{statusLabel}</Badge>
          )}
        </div>

        {/* Son ders uyarisi */}
        {activePackage && statusVariant === 'danger' && (
          <div className="mt-3 flex items-center gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/15">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-lg">
              {remaining <= 0 ? '🎯' : '🚀'}
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">
                {remaining <= 0 ? 'Yeni pakete hazır mısın?' : 'Son düzlüktesin!'}
              </p>
              <p className="text-xs text-text-secondary">
                {remaining <= 0
                  ? 'Yenilemek için antrenörünle iletişime geçmeyi unutma!'
                  : `${remaining} ders kaldı, yeni paket için antrenörünle iletişime geç!`}
              </p>
            </div>
          </div>
        )}

        {activePackage && (
          <div className="mt-4 space-y-3">
            <div>
              <div className="text-sm text-text-secondary">Kalan Ders</div>
              <div className="text-2xl font-bold">{remaining}</div>
            </div>
            <div>
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(activePackage.used_lessons / activePackage.total_lessons) * 100}%` }}
                />
              </div>
              <p className="text-xs text-text-secondary mt-1">
                {activePackage.used_lessons}/{activePackage.total_lessons} ders tamamlandı
              </p>
            </div>
            {activePackage.price !== null && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary">Paket Tutarı</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{formatPrice(activePackage.price)}</span>
                  <Badge variant={activePackage.payment_status === 'paid' ? 'success' : 'danger'}>
                    {activePackage.payment_status === 'paid' ? 'Ödendi' : 'Ödenmedi'}
                  </Badge>
                </div>
              </div>
            )}
            <p className="text-xs text-text-secondary">
              Paketinin bitimine <span className="text-text-primary font-medium">{days} gün</span> kaldı, değerlendir!
            </p>
          </div>
        )}
      </Card>
      </div>

      {/* Rozet Seridi */}
      <BadgeStrip />

      {/* Bugünün Beslenmesi */}
      <Link href="/app/beslenme" className="block">
        <Card className="border-primary/30 hover-lift card-glow animate-fade-up delay-100">
          {clientMeals && clientMeals.length > 0 ? (() => {
            const compliantCount = todayMeals?.filter((m: { status: string }) => m.status === 'compliant').length || 0
            const total = clientMeals.length
            const ratio = total > 0 ? compliantCount / total : 0
            return (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 2v9a3 3 0 003 3v7a1 1 0 002 0v-7a3 3 0 003-3V2h-2v9a1 1 0 01-1 1h-2a1 1 0 01-1-1V2H7zM17 2v20a1 1 0 002 0v-8h1a2 2 0 002-2V5a3 3 0 00-3-3h-2z" />
                    </svg>
                    <h3 className="font-semibold text-text-primary">Beslenme</h3>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    ratio >= 1 ? 'bg-emerald-100 text-emerald-700'
                      : ratio >= 0.5 ? 'bg-amber-100 text-amber-700'
                      : compliantCount > 0 ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-text-secondary'
                  }`}>
                    {compliantCount}/{total}
                  </span>
                </div>
                <div className="space-y-1">
                  {clientMeals.map((meal: { id: string; name: string }) => {
                    const log = todayMeals?.find((m: { meal_id: string; status: string }) => m.meal_id === meal.id)
                    const isCompliant = log?.status === 'compliant'
                    const isNonCompliant = log?.status === 'non_compliant'
                    return (
                      <div key={meal.id} className={`flex items-center justify-between px-3 py-1.5 rounded-lg ${
                        isCompliant ? 'bg-emerald-50'
                          : isNonCompliant ? 'bg-red-50'
                          : 'bg-gray-50'
                      }`}>
                        <span className={`text-sm ${
                          isCompliant ? 'text-emerald-700 font-medium'
                            : isNonCompliant ? 'text-red-600 font-medium'
                            : 'text-text-secondary'
                        }`}>
                          {meal.name}
                        </span>
                        {isCompliant && (
                          <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {isNonCompliant && (
                          <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </div>
                    )
                  })}
                </div>
                {/* Progress bar */}
                <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${ratio * 100}%`,
                      backgroundColor: ratio >= 1 ? '#10b981' : ratio >= 0.5 ? '#f59e0b' : '#ef4444',
                    }}
                  />
                </div>
              </>
            )
          })() : (
            <>
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 2v9a3 3 0 003 3v7a1 1 0 002 0v-7a3 3 0 003-3V2h-2v9a1 1 0 01-1 1h-2a1 1 0 01-1-1V2H7zM17 2v20a1 1 0 002 0v-8h1a2 2 0 002-2V5a3 3 0 00-3-3h-2z" />
                </svg>
                <h3 className="font-semibold text-text-primary">Beslenme</h3>
              </div>
              <p className="text-sm text-text-secondary">Henüz öğün planı atanmadı</p>
            </>
          )}
        </Card>
      </Link>

      {/* Yaklaşan Dersler */}
      {upcomingLessons && upcomingLessons.length > 0 && (
        <Card className="border-primary/30 animate-fade-up delay-150">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-semibold text-text-primary">Yaklaşan Dersler</h3>
          </div>
          <div className="space-y-2">
            {upcomingLessons.map((lesson: { id: string; date: string; start_time: string | null; duration: number | null }) => {
              const lessonDate = new Date(lesson.date + 'T00:00:00')
              const isToday = lesson.date === today
              const dayLabel = isToday
                ? 'Bugün'
                : lessonDate.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' })

              return (
                <div key={lesson.id} className={`flex items-center justify-between px-3 py-2.5 rounded-lg ${
                  isToday ? 'bg-primary/5 border border-primary/20' : 'bg-background'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${isToday ? 'text-primary' : 'text-text-primary'}`}>
                      {dayLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {lesson.start_time && (
                      <span className="text-sm font-semibold text-text-primary">
                        {lesson.start_time.slice(0, 5)}
                      </span>
                    )}
                    {lesson.duration && (
                      <span className="text-xs text-text-secondary bg-surface-hover px-1.5 py-0.5 rounded">
                        {lesson.duration} dk
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Hizli linkler */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" data-tour="quick-links">
        <Link href="/app/program">
          <Card className="border-primary/30 hover-lift card-glow text-center cursor-pointer animate-fade-up delay-200">
            <svg className="w-6 h-6 mx-auto text-primary mb-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
            </svg>
            <span className="text-sm font-medium">Programım</span>
          </Card>
        </Link>
        <Link href="/app/progress">
          <Card className="border-primary/30 hover-lift card-glow text-center cursor-pointer animate-fade-up delay-300">
            <svg className="w-6 h-6 mx-auto text-primary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-sm font-medium">İlerleme</span>
          </Card>
        </Link>
        <Link href="/app/packages">
          <Card className="border-primary/30 hover-lift card-glow text-center cursor-pointer animate-fade-up delay-400">
            <svg className="w-6 h-6 mx-auto text-primary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-sm font-medium">Paketlerim</span>
          </Card>
        </Link>
        <Link href="/app/haftalik-ozet">
          <Card className="border-primary/30 hover-lift card-glow text-center cursor-pointer animate-fade-up delay-500">
            <svg className="w-6 h-6 mx-auto text-primary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-sm font-medium">Haftalık Özet</span>
          </Card>
        </Link>
      </div>

      {/* Ertelenmis bolumler — Suspense ile progressive load */}
      <Suspense fallback={<SectionSkeleton />}>
        <DeferredSections clientId={client.id} />
      </Suspense>

      {/* Spotlight Tour */}
      <SpotlightTour
        steps={CLIENT_SPOTLIGHT_STEPS}
        tourProgress={(client.tour_progress as TourProgress) ?? null}
        table="clients"
      />
    </div>
  )
}

async function DeferredSections({ clientId }: { clientId: string }) {
  const supabase = await createClient()

  const [
    { data: pastPackages },
    { data: recentMeasurement },
    { data: goals },
  ] = await Promise.all([
    supabase
      .from('packages')
      .select('*')
      .eq('client_id', clientId)
      .neq('status', 'active')
      .order('created_at', { ascending: false }),
    supabase
      .from('measurements')
      .select('*')
      .eq('client_id', clientId)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('client_goals')
      .select('*')
      .eq('client_id', clientId),
  ])

  return (
    <>
      {/* Gecmis Paketler */}
      {pastPackages && pastPackages.length > 0 && (
        <Card className="border-primary/30">
          <CardHeader><CardTitle>Geçmiş Paketler</CardTitle></CardHeader>
          <div className="space-y-3 mt-2">
            {pastPackages.map((pkg) => (
              <div key={pkg.id} className="p-3 rounded-lg bg-background">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-sm">{pkg.total_lessons} Ders Paketi</span>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {formatDate(pkg.start_date)} — {formatDate(pkg.expire_date)}
                    </p>
                  </div>
                  <Badge variant={pkg.status === 'completed' ? 'success' : 'danger'}>
                    {getPackageStatusLabel(pkg.status)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-text-secondary">
                    {pkg.used_lessons}/{pkg.total_lessons} ders tamamlandı
                  </span>
                  {pkg.price !== null && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{formatPrice(pkg.price)}</span>
                      <Badge variant={pkg.payment_status === 'paid' ? 'success' : 'danger'}>
                        {pkg.payment_status === 'paid' ? 'Ödendi' : 'Ödenmedi'}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Link href="/app/packages" className="text-sm text-primary mt-3 inline-block hover:underline">
            Tüm paketleri gör →
          </Link>
        </Card>
      )}

      {/* Son olcum */}
      <Card className="border-primary/30">
        <CardHeader><CardTitle>Son Ölçüm</CardTitle></CardHeader>
        {recentMeasurement ? (
          <>
          <div className="text-xs text-text-secondary mb-3">{formatDate(recentMeasurement.date)}</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {([
              { key: 'weight' as const, label: 'Kilo', unit: 'kg', color: '#DC2626' },
              { key: 'chest' as const, label: 'Göğüs', unit: 'cm', color: '#DC2626' },
              { key: 'waist' as const, label: 'Bel', unit: 'cm', color: '#DC2626' },
              { key: 'arm' as const, label: 'Kol', unit: 'cm', color: '#DC2626' },
              { key: 'leg' as const, label: 'Bacak', unit: 'cm', color: '#DC2626' },
              { key: 'body_fat_pct' as const, label: 'Yağ', unit: '%', color: '#DC2626' },
            ]).map(({ key, label, unit, color }) => {
              const value = recentMeasurement[key]
              if (!value) return null
              const goal = (goals as ClientGoal[] | null)?.find(g => g.metric_type === key)

              let pct = 0
              let left = 0
              let done = false
              let nearGoal = false
              if (goal) {
                const current = Number(value)
                left = Math.abs(goal.target_value - current)
                done = left <= 0.1
                pct = done ? 100 : Math.max(8, Math.min(92, 100 - (left / (left + 5)) * 100))
                nearGoal = pct >= 80 && !done
              }

              return (
                <div
                  key={key}
                  className="bg-surface rounded-xl overflow-hidden"
                  style={{
                    border: `1px solid ${done ? 'rgba(34,197,94,0.2)' : goal ? `${color}22` : 'var(--border)'}`,
                    boxShadow: done ? '0 0 12px rgba(34,197,94,0.1)' : nearGoal ? `0 0 12px ${color}15` : 'none',
                  }}
                >
                  <div className="h-1" style={{ backgroundColor: color }} />
                  <div className="p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-[11px] font-medium text-text-secondary">{label}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-text-primary">{value}</span>
                      <span className="text-xs text-text-secondary">{unit}</span>
                    </div>
                    {goal && (
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="flex items-center gap-1 text-xs text-text-secondary">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                              <circle cx="12" cy="12" r="10" />
                              <line x1="22" y1="12" x2="18" y2="12" />
                              <line x1="6" y1="12" x2="2" y2="12" />
                              <line x1="12" y1="6" x2="12" y2="2" />
                              <line x1="12" y1="22" x2="12" y2="18" />
                            </svg>
                            Hedef
                          </span>
                          <span className="text-xs font-semibold" style={{ color }}>{goal.target_value} {unit}</span>
                        </div>
                        <div className="h-2.5 bg-border rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${done ? 'bg-success' : ''}`}
                            style={{
                              width: `${pct}%`,
                              backgroundColor: done ? undefined : color,
                              boxShadow: nearGoal ? `0 0 8px ${color}66` : 'none',
                            }}
                          />
                        </div>
                        <div className="mt-1.5">
                          {done ? (
                            <span className="text-xs text-success font-semibold flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              Hedefe ulaştın!
                            </span>
                          ) : nearGoal ? (
                            <span className="text-xs font-semibold" style={{ color }}>
                              Son {left.toFixed(1)} {unit}!
                            </span>
                          ) : (
                            <span className="text-xs" style={{ color }}>
                              Hedefe {left.toFixed(1)} {unit} kaldı
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <Link href="/app/progress" className="text-sm text-primary mt-3 inline-block hover:underline">
            Tüm ölçümleri gör →
          </Link>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-text-primary">Henüz ölçüm bilgileriniz yok</p>
            <p className="text-xs text-text-secondary mt-1">Antrenörünüz ilk ölçümünüzü aldığında burada görünecek</p>
          </div>
        )}
      </Card>
    </>
  )
}
