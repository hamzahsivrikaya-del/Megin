import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { formatDate, getPackageStatusLabel, daysRemaining, formatPrice } from '@/lib/utils'

export default async function PackagesPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/login')
  const user = session.user

  const { data: packages } = await supabase
    .from('packages')
    .select('*, lessons(id, date, notes)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const activePackage = packages?.find((p) => p.status === 'active')
  const pastPackages = packages?.filter((p) => p.status !== 'active') || []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="p-2 -ml-2 text-text-secondary hover:text-text-primary transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold">Paketlerim</h1>
      </div>

      {/* Aktif Paket */}
      {activePackage && (
        <Card className="border-primary/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Aktif Paket</CardTitle>
              <Badge variant="success">Aktif</Badge>
            </div>
          </CardHeader>

          {/* Fiyat + Ödeme */}
          {activePackage.price !== null && (
            <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-background">
              <div>
                <div className="text-sm text-text-secondary">Paket Tutarı</div>
                <div className="text-lg font-bold">{formatPrice(activePackage.price)}</div>
              </div>
              <Badge variant={activePackage.payment_status === 'paid' ? 'success' : 'danger'}>
                {activePackage.payment_status === 'paid' ? 'Ödendi' : 'Ödenmedi'}
              </Badge>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div>
              <div className="text-sm text-text-secondary">Toplam</div>
              <div className="text-xl font-bold">{activePackage.total_lessons}</div>
            </div>
            <div>
              <div className="text-sm text-text-secondary">Kullanılan</div>
              <div className="text-xl font-bold">{activePackage.used_lessons}</div>
            </div>
            <div>
              <div className="text-sm text-text-secondary">Kalan</div>
              <div className="text-xl font-bold">{activePackage.total_lessons - activePackage.used_lessons}</div>
            </div>
            <div>
              <div className="text-sm text-text-secondary">Kalan Gün</div>
              <div className="text-xl font-bold">{daysRemaining(activePackage.expire_date)}</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${(activePackage.used_lessons / activePackage.total_lessons) * 100}%` }}
            />
          </div>

          {/* Ders listesi */}
          {activePackage.lessons && activePackage.lessons.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-text-secondary mb-2">Dersler</h4>
              <div className="space-y-1">
                {activePackage.lessons
                  .sort((a: { date: string }, b: { date: string }) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((lesson: { id: string; date: string; notes: string | null }, i: number) => (
                    <div key={lesson.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border/50 last:border-0">
                      <span className="text-text-secondary">#{activePackage.lessons!.length - i}</span>
                      <span>{formatDate(lesson.date)}</span>
                      {lesson.notes && <span className="text-text-secondary text-xs">{lesson.notes}</span>}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {!activePackage && (
        <Card>
          <p className="text-text-secondary text-center py-8">Aktif paketiniz bulunmuyor</p>
        </Card>
      )}

      {/* Geçmiş Paketler */}
      {pastPackages.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-text-secondary">Geçmiş Paketler</h2>
          <div className="space-y-3">
            {pastPackages.map((pkg) => (
              <Card key={pkg.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{pkg.total_lessons} Ders Paketi</span>
                    <p className="text-sm text-text-secondary mt-0.5">
                      {formatDate(pkg.start_date)} — {formatDate(pkg.expire_date)}
                    </p>
                  </div>
                  <Badge variant={pkg.status === 'completed' ? 'success' : 'danger'}>
                    {getPackageStatusLabel(pkg.status)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-text-secondary">
                    {pkg.used_lessons}/{pkg.total_lessons} ders tamamlandı
                  </span>
                  {pkg.price !== null && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{formatPrice(pkg.price)}</span>
                      <Badge variant={pkg.payment_status === 'paid' ? 'success' : 'danger'}>
                        {pkg.payment_status === 'paid' ? 'Ödendi' : 'Ödenmedi'}
                      </Badge>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
