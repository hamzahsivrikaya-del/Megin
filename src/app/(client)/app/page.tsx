import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Link from 'next/link'
import { formatDate, formatPrice } from '@/lib/utils'

function SectionSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-surface rounded-2xl border border-border p-5 space-y-3">
        <div className="h-5 bg-border rounded w-36" />
        <div className="h-4 bg-border rounded w-full" />
        <div className="h-4 bg-border rounded w-2/3" />
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

  // Kritik veri — hemen render
  const [
    { data: activePackage },
    { data: firstLesson },
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
  ])

  const remaining = activePackage
    ? activePackage.total_lessons - activePackage.used_lessons
    : 0

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
      {/* Hoşgeldin kartı */}
      <Card className="border-primary/20 gradient-border animate-fade-up">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full bg-surface-hover border-2 border-border overflow-hidden flex-shrink-0">
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-lg font-bold text-text-secondary">
                  {firstName.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold">
                Hoş geldin, {firstName.charAt(0).toUpperCase() + firstName.slice(1)}
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                Üyelik başlangıcı: {firstLesson?.date ? formatDate(firstLesson.date) : '-'}
              </p>
            </div>
          </div>
          {statusVariant !== 'danger' && (
            <Badge variant={statusVariant}>{statusLabel}</Badge>
          )}
        </div>

        {/* Son ders uyarısı */}
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
          </div>
        )}
      </Card>

      {/* Hızlı linkler */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/app/program">
          <Card className="hover-lift card-glow text-center cursor-pointer animate-fade-up delay-200">
            <svg className="w-6 h-6 mx-auto text-primary mb-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
            </svg>
            <span className="text-sm font-medium">Programım</span>
          </Card>
        </Link>
        <Link href="/app/progress">
          <Card className="hover-lift card-glow text-center cursor-pointer animate-fade-up delay-300">
            <svg className="w-6 h-6 mx-auto text-primary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-sm font-medium">İlerleme</span>
          </Card>
        </Link>
        <Link href="/app/packages">
          <Card className="hover-lift card-glow text-center cursor-pointer animate-fade-up delay-400">
            <svg className="w-6 h-6 mx-auto text-primary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-sm font-medium">Paketlerim</span>
          </Card>
        </Link>
        <Link href="/app/haftalik-ozet">
          <Card className="hover-lift card-glow text-center cursor-pointer animate-fade-up delay-500">
            <svg className="w-6 h-6 mx-auto text-primary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-sm font-medium">Haftalık Özet</span>
          </Card>
        </Link>
      </div>

      {/* Ertelenmiş bölümler */}
      <Suspense fallback={<SectionSkeleton />}>
        <DeferredSections clientId={client.id} />
      </Suspense>
    </div>
  )
}

async function DeferredSections({ clientId }: { clientId: string }) {
  const supabase = await createClient()

  const [
    { data: pastPackages },
    { data: recentMeasurement },
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
  ])

  return (
    <>
      {/* Geçmiş Paketler */}
      {pastPackages && pastPackages.length > 0 && (
        <Card>
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
                    {pkg.status === 'completed' ? 'Tamamlandı' : pkg.status === 'expired' ? 'Süresi Doldu' : pkg.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-text-secondary">
                    {pkg.used_lessons}/{pkg.total_lessons} ders tamamlandı
                  </span>
                  {pkg.price !== null && (
                    <span className="text-xs font-medium">{formatPrice(pkg.price)}</span>
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

      {/* Son ölçüm */}
      {recentMeasurement && (
        <Card>
          <CardHeader><CardTitle>Son Ölçüm</CardTitle></CardHeader>
          <div className="text-xs text-text-secondary mb-3">{formatDate(recentMeasurement.date)}</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {([
              { key: 'weight' as const, label: 'Kilo', unit: 'kg' },
              { key: 'chest' as const, label: 'Göğüs', unit: 'cm' },
              { key: 'waist' as const, label: 'Bel', unit: 'cm' },
              { key: 'arm' as const, label: 'Kol', unit: 'cm' },
              { key: 'leg' as const, label: 'Bacak', unit: 'cm' },
              { key: 'body_fat_pct' as const, label: 'Yağ', unit: '%' },
            ]).map(({ key, label, unit }) => {
              const value = recentMeasurement[key]
              if (!value) return null
              return (
                <div key={key} className="bg-surface rounded-xl overflow-hidden border border-border">
                  <div className="h-1 bg-primary" />
                  <div className="p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-[11px] font-medium text-text-secondary">{label}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-text-primary">{value}</span>
                      <span className="text-xs text-text-secondary">{unit}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <Link href="/app/progress" className="text-sm text-primary mt-3 inline-block hover:underline">
            Tüm ölçümleri gör →
          </Link>
        </Card>
      )}
    </>
  )
}
