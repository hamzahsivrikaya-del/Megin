import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Link from 'next/link'
import { formatDate, formatPrice } from '@/lib/utils'

export default async function PackagesPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/login')

  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (!client) redirect('/login')

  const { data: packages } = await supabase
    .from('packages')
    .select('*')
    .eq('client_id', client.id)
    .order('created_at', { ascending: false })

  const activePackage = packages?.find((p) => p.status === 'active')
  const pastPackages = packages?.filter((p) => p.status !== 'active') || []

  return (
    <div className="space-y-6">
      <div>
        <Link href="/app" className="text-sm text-text-secondary hover:text-primary transition-colors">
          ← Geri
        </Link>
        <h1 className="text-2xl font-bold mt-1">Paketlerim</h1>
      </div>

      {/* Aktif paket */}
      {activePackage ? (
        <Card className="border-primary/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-text-primary">{activePackage.total_lessons} Ders Paketi</h3>
            <Badge variant="success">Aktif</Badge>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-text-secondary">Kalan Ders</div>
              <div className="text-3xl font-bold">{activePackage.total_lessons - activePackage.used_lessons}</div>
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
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-text-secondary">Başlangıç:</span>
                <span className="ml-1 font-medium">{formatDate(activePackage.start_date)}</span>
              </div>
              <div>
                <span className="text-text-secondary">Bitiş:</span>
                <span className="ml-1 font-medium">{formatDate(activePackage.expire_date)}</span>
              </div>
            </div>
            {activePackage.price !== null && (
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-sm text-text-secondary">Paket Tutarı</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{formatPrice(activePackage.price)}</span>
                  <Badge variant={activePackage.payment_status === 'paid' ? 'success' : 'danger'}>
                    {activePackage.payment_status === 'paid' ? 'Ödendi' : 'Ödenmedi'}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card className="text-center py-6">
          <p className="text-text-secondary">Aktif paketiniz bulunmuyor.</p>
        </Card>
      )}

      {/* Geçmiş paketler */}
      {pastPackages.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Geçmiş Paketler</CardTitle></CardHeader>
          <div className="space-y-3">
            {pastPackages.map((pkg) => (
              <div key={pkg.id} className="p-3 rounded-lg bg-background">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{pkg.total_lessons} Ders Paketi</span>
                  <Badge variant={pkg.status === 'completed' ? 'success' : 'danger'}>
                    {pkg.status === 'completed' ? 'Tamamlandı' : pkg.status === 'expired' ? 'Süresi Doldu' : pkg.status}
                  </Badge>
                </div>
                <p className="text-xs text-text-secondary mt-1">
                  {formatDate(pkg.start_date)} — {formatDate(pkg.expire_date)}
                </p>
                <p className="text-xs text-text-secondary mt-0.5">
                  {pkg.used_lessons}/{pkg.total_lessons} ders tamamlandı
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
