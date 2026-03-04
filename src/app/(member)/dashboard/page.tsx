import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Link from 'next/link'
import { formatDate, daysRemaining, getPackageStatusLabel, formatPrice, getMonday, getDayName, toDateStr } from '@/lib/utils'
import type { MemberMeal, MemberGoal, Package, Measurement } from '@/lib/types'
import BadgeStrip from '@/components/shared/BadgeStrip'

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

export default async function MemberDashboard() {
  const supabase = await createClient()
  // Middleware zaten getUser() ile token dogruladı — session'dan oku (network call yok)
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/login')
  const user = session.user

  // Onboarding kontrolu
  const { data: onboardingCheck } = await supabase
    .from('users')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()
  if (onboardingCheck && !onboardingCheck.onboarding_completed) {
    redirect('/dashboard/onboarding')
  }

  // Kritik veri — hemen render
  const monday = getMonday()
  const sundayDate = new Date(monday + 'T00:00:00')
  sundayDate.setDate(sundayDate.getDate() + 6)
  const sunday = toDateStr(sundayDate)

  const [
    { data: profile },
    { data: activePackage },
    { data: firstLesson },
    { data: memberMeals },
    { data: todayMeals },
    { data: weekLessons },
  ] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase
      .from('packages')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('lessons')
      .select('date')
      .eq('user_id', user.id)
      .order('date', { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('member_meals')
      .select('*')
      .eq('user_id', user.id)
      .order('order_num'),
    supabase
      .from('meal_logs')
      .select('meal_id, status')
      .eq('user_id', user.id)
      .eq('date', new Date().toISOString().split('T')[0]),
    supabase
      .from('lessons')
      .select('date, start_time')
      .eq('user_id', user.id)
      .gte('date', monday)
      .lte('date', sunday)
      .order('date'),
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

  return (
    <div className="space-y-6">
      {/* Hoşgeldin kartı */}
      <Card className="border-primary/30 gradient-border animate-fade-up">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full bg-surface-hover border-2 border-border overflow-hidden flex-shrink-0">
              {profile?.avatar_url ? (
                <Image src={profile.avatar_url} alt="" fill className="object-cover" sizes="48px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-lg font-bold text-text-secondary">
                    {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">Hoşgeldin, {profile?.full_name?.split(' ')[0]?.charAt(0).toUpperCase() + (profile?.full_name?.split(' ')[0]?.slice(1) || '')}</h2>
              <p className="text-sm text-text-secondary mt-1">
                Üyelik başlangıcı: {firstLesson?.date ? formatDate(firstLesson.date) : profile?.start_date ? formatDate(profile.start_date) : '-'}
              </p>
            </div>
          </div>
          {statusVariant !== 'danger' && (
            <Badge variant={statusVariant}>{statusLabel}</Badge>
          )}
        </div>

        {/* Son ders uyarısı — samimi koç tonu */}
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

      {/* Rozet Seridi */}
      <BadgeStrip />

      {/* Bugünün Beslenmesi */}
      <Link href="/dashboard/beslenme" className="block">
        <Card className="border-primary/30 hover-lift card-glow animate-fade-up delay-100">
          {memberMeals && memberMeals.length > 0 ? (() => {
            const compliantCount = todayMeals?.filter((m: { status: string }) => m.status === 'compliant').length || 0
            const total = memberMeals.length
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
                  {(memberMeals as MemberMeal[]).map((meal) => {
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

      {/* Ders Programım */}
      <Card className="border-primary/30 animate-fade-up delay-100">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="font-semibold text-text-primary">Ders Programım</h3>
        </div>
        {weekLessons && weekLessons.length > 0 ? (
          <div className="space-y-1.5">
            {weekLessons.map((lesson: { date: string; start_time: string | null }, i: number) => {
              const lessonDate = new Date(lesson.date + 'T00:00:00')
              const dayIdx = lessonDate.getDay() === 0 ? 6 : lessonDate.getDay() - 1
              const todayStr = toDateStr(new Date())
              const isPast = lesson.date < todayStr
              const isToday = lesson.date === todayStr

              return (
                <div
                  key={i}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                    isToday ? 'bg-primary/5 border border-primary/15' : 'bg-surface-hover'
                  }`}
                >
                  <span className={`text-sm font-medium ${
                    isToday ? 'text-primary' : isPast ? 'text-text-secondary' : 'text-text-primary'
                  }`}>
                    {getDayName(dayIdx)}
                  </span>
                  <span className={`text-sm ${
                    isToday ? 'text-primary font-semibold' : isPast ? 'text-text-secondary' : 'text-text-primary'
                  }`}>
                    {lesson.start_time || '—'}
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-text-secondary">Bu hafta planlanmış ders yok</p>
        )}
      </Card>

      {/* Hizli linkler */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/dashboard/program">
          <Card className="border-primary/30 hover-lift card-glow text-center cursor-pointer animate-fade-up delay-200">
            <svg className="w-6 h-6 mx-auto text-primary mb-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
            </svg>
            <span className="text-sm font-medium">Programım</span>
          </Card>
        </Link>
        <Link href="/dashboard/progress">
          <Card className="border-primary/30 hover-lift card-glow text-center cursor-pointer animate-fade-up delay-300">
            <svg className="w-6 h-6 mx-auto text-primary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-sm font-medium">İlerleme</span>
          </Card>
        </Link>
        <Link href="/dashboard/packages">
          <Card className="border-primary/30 hover-lift card-glow text-center cursor-pointer animate-fade-up delay-400">
            <svg className="w-6 h-6 mx-auto text-primary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-sm font-medium">Paketlerim</span>
          </Card>
        </Link>
        <Link href="/dashboard/haftalik-ozet">
          <Card className="border-primary/30 hover-lift card-glow text-center cursor-pointer animate-fade-up delay-500">
            <svg className="w-6 h-6 mx-auto text-primary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-sm font-medium">Haftalık Özet</span>
          </Card>
        </Link>
      </div>

      {/* Ertelenmiş bölümler — Suspense ile progressive load */}
      <Suspense fallback={<SectionSkeleton />}>
        <DeferredSections userId={user.id} />
      </Suspense>
    </div>
  )
}

async function DeferredSections({ userId }: { userId: string }) {
  const supabase = await createClient()

  const [
    { data: pastPackages },
    { data: recentMeasurement },
    { data: blogPosts },
    { data: goals },
    { data: dependents },
  ] = await Promise.all([
    supabase
      .from('packages')
      .select('*')
      .eq('user_id', userId)
      .neq('status', 'active')
      .order('created_at', { ascending: false }),
    supabase
      .from('measurements')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('blog_posts')
      .select('id, title, slug, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(3),
    supabase
      .from('member_goals')
      .select('*')
      .eq('user_id', userId),
    supabase
      .from('users')
      .select('id, full_name, gender')
      .eq('parent_id', userId),
  ])

  const dependentData = await Promise.all(
    (dependents || []).map(async (dep) => {
      const [{ data: pkg }, { data: measurement }] = await Promise.all([
        supabase.from('packages').select('*').eq('user_id', dep.id).eq('status', 'active')
          .order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('measurements').select('*').eq('user_id', dep.id)
          .order('date', { ascending: false }).limit(1).maybeSingle(),
      ])
      return { ...dep, activePackage: pkg as Package | null, recentMeasurement: measurement as Measurement | null }
    })
  )

  return (
    <>
      {/* Geçmiş Paketler */}
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
          <Link href="/dashboard/packages" className="text-sm text-primary mt-3 inline-block hover:underline">
            Tüm paketleri gör →
          </Link>
        </Card>
      )}

      {/* Son ölçüm */}
      {recentMeasurement && (
        <Card className="border-primary/30">
          <CardHeader><CardTitle>Son Ölçüm</CardTitle></CardHeader>
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
              const goal = (goals as MemberGoal[] | null)?.find(g => g.metric_type === key)

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
                              🔥 Son {left.toFixed(1)} {unit}!
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
          <Link href="/dashboard/progress" className="text-sm text-primary mt-3 inline-block hover:underline">
            Tüm ölçümleri gör →
          </Link>
        </Card>
      )}

      {/* Blog yazıları */}
      {blogPosts && blogPosts.length > 0 && (
        <Card className="border-primary/30">
          <CardHeader><CardTitle>Son Yazılar</CardTitle></CardHeader>
          <div className="space-y-3">
            {blogPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="block p-3 rounded-lg hover:bg-surface-hover transition-colors"
              >
                <div className="font-medium text-sm">{post.title}</div>
                <div className="text-xs text-text-secondary mt-1">
                  {post.published_at ? formatDate(post.published_at) : ''}
                </div>
              </Link>
            ))}
          </div>
          <Link href="/blog" className="text-sm text-primary mt-3 inline-block hover:underline">
            Tüm yazıları gör →
          </Link>
        </Card>
      )}

      {/* Bağlı Üyeler (Çocuklar) */}
      {dependentData.length > 0 && (
        <div className="space-y-4">
          <p className="text-[10px] text-text-secondary uppercase tracking-[0.2em] font-medium">Bağlı Kişiler</p>
          {dependentData.map((dep) => {
            const depRemaining = dep.activePackage
              ? dep.activePackage.total_lessons - dep.activePackage.used_lessons
              : 0
            const depRatio = dep.activePackage ? depRemaining / dep.activePackage.total_lessons : 0
            const depPct = dep.activePackage
              ? Math.round((dep.activePackage.used_lessons / dep.activePackage.total_lessons) * 100)
              : 0
            let depStatusLabel = 'Paket Yok'
            let depStatusVariant: 'success' | 'warning' | 'danger' | 'default' = 'default'
            if (dep.activePackage) {
              if (depRemaining <= 0) { depStatusLabel = 'Bitti'; depStatusVariant = 'danger' }
              else if (depRatio <= 0.25) { depStatusLabel = `Son ${depRemaining} Ders`; depStatusVariant = 'danger' }
              else if (depRatio <= 0.5) { depStatusLabel = 'Azalıyor'; depStatusVariant = 'warning' }
              else { depStatusLabel = 'Aktif'; depStatusVariant = 'success' }
            }
            const initials = dep.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

            return (
              <Card key={dep.id} className="border-primary/30 overflow-hidden animate-fade-up">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary tracking-tight">{initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-primary text-[15px] truncate">{dep.full_name}</h3>
                    <p className="text-xs text-text-secondary">Bağlı Üye</p>
                  </div>
                  <Badge variant={depStatusVariant}>{depStatusLabel}</Badge>
                </div>

                {dep.activePackage && (
                  <div className="bg-background rounded-xl p-3.5 mb-3">
                    {depRemaining <= 2 && depRemaining > 0 && (
                      <div className="flex items-center gap-2 p-2.5 mb-3 rounded-lg bg-red-50 border border-red-200">
                        <svg className="w-4 h-4 text-danger shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="text-xs text-danger font-medium">
                          {depRemaining === 1 ? `${dep.full_name} için son ders! Yeni paket gerekiyor.` : `${dep.full_name} için son ${depRemaining} ders kaldı.`}
                        </p>
                      </div>
                    )}
                    {depRemaining <= 0 && dep.activePackage && (
                      <div className="flex items-center gap-2 p-2.5 mb-3 rounded-lg bg-red-50 border border-red-200">
                        <svg className="w-4 h-4 text-danger shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        <p className="text-xs text-danger font-medium">{dep.full_name} paketi bitti. Yeni paket alınmalı.</p>
                      </div>
                    )}
                    <div className="flex items-end justify-between mb-2.5">
                      <div>
                        <p className="text-[10px] text-text-secondary uppercase tracking-widest">Kalan Ders</p>
                        <p className="text-2xl font-bold text-text-primary -mt-0.5">{depRemaining}</p>
                      </div>
                      <p className="text-xs text-text-secondary">
                        {dep.activePackage.used_lessons}/{dep.activePackage.total_lessons} tamamlandı
                      </p>
                    </div>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${depPct}%` }}
                      />
                    </div>
                  </div>
                )}

                {dep.recentMeasurement && (
                  <div className="flex gap-3 mb-3">
                    {dep.recentMeasurement.weight && (
                      <div className="flex-1 bg-background rounded-lg p-2.5 text-center">
                        <p className="text-base font-bold text-text-primary">{dep.recentMeasurement.weight}</p>
                        <p className="text-[10px] text-text-secondary">kg</p>
                      </div>
                    )}
                    {dep.recentMeasurement.body_fat_pct && (
                      <div className="flex-1 bg-background rounded-lg p-2.5 text-center">
                        <p className="text-base font-bold text-orange-500">{dep.recentMeasurement.body_fat_pct}%</p>
                        <p className="text-[10px] text-text-secondary">yağ</p>
                      </div>
                    )}
                  </div>
                )}

                <Link
                  href={`/dashboard/cocuk/${dep.id}`}
                  className="flex items-center justify-between p-2.5 -mx-1 rounded-lg hover:bg-surface-hover transition-colors group"
                >
                  <span className="text-sm text-primary font-medium">Detayları gör</span>
                  <svg className="w-4 h-4 text-primary transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </Card>
            )
          })}
        </div>
      )}
    </>
  )
}
