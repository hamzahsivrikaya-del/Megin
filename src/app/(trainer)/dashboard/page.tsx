import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Trainer bilgisi
  const { data: trainer } = await supabase
    .from('trainers')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  // Onboarding tamamlanmamışsa yönlendir
  if (!trainer || !trainer.onboarding_completed) {
    redirect('/onboarding')
  }

  // İstatistikler
  const { count: clientCount } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .eq('trainer_id', trainer.id)
    .eq('is_active', true)

  const { count: activePackages } = await supabase
    .from('packages')
    .select('*', { count: 'exact', head: true })
    .eq('trainer_id', trainer.id)
    .eq('status', 'active')

  const { data: todayLessons } = await supabase
    .from('lessons')
    .select('id')
    .eq('trainer_id', trainer.id)
    .eq('date', new Date().toISOString().split('T')[0])

  const { count: unreadNotifs } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  const hasClients = (clientCount ?? 0) > 0

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">
          Merhaba, {trainer.full_name.split(' ')[0]} 👋
        </h1>
        <p className="mt-1 text-text-secondary">
          İşte bugünkü özet.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Danışan" value={clientCount ?? 0} icon="👥" />
        <StatCard label="Aktif Paket" value={activePackages ?? 0} icon="📦" />
        <StatCard label="Bugün Ders" value={todayLessons?.length ?? 0} icon="🏋️" />
        <StatCard label="Bildirim" value={unreadNotifs ?? 0} icon="🔔" accent />
      </div>

      {/* Empty State veya İçerik */}
      {!hasClients ? (
        <div className="space-y-6">
          {/* Örnek danışan kartı */}
          <div className="card-base border-dashed border-2 border-primary/30 bg-primary-50/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg">
                  🧑
                </div>
                <div>
                  <p className="font-medium text-text-primary">Örnek Danışan</p>
                  <p className="text-xs text-text-tertiary">Bu bir örnek profildir</p>
                </div>
              </div>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-lg font-medium">
                ÖRNEK
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-text-primary">72.5</p>
                <p className="text-xs text-text-tertiary">kg</p>
              </div>
              <div>
                <p className="text-lg font-bold text-text-primary">8/10</p>
                <p className="text-xs text-text-tertiary">ders</p>
              </div>
              <div>
                <p className="text-lg font-bold text-text-primary">%85</p>
                <p className="text-xs text-text-tertiary">beslenme</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="card-base text-center py-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <span className="text-3xl">🚀</span>
            </div>
            <h3 className="text-lg font-bold text-text-primary">İlk danışanını ekle</h3>
            <p className="mt-2 text-sm text-text-secondary max-w-sm mx-auto">
              Danışanını ekle, davet linkini gönder ve yönetmeye başla.
            </p>
            <Link
              href="/dashboard/clients"
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
            >
              + Danışan Ekle
            </Link>
          </div>

          {/* Diğer boş kartlar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EmptyCard
              icon="📊"
              title="Finans"
              description="Danışan ekledikçe gelir ve ödeme takibin burada görünecek."
              href="/dashboard/finance"
            />
            <EmptyCard
              icon="💪"
              title="Antrenmanlar"
              description="Program şablonları oluştur, danışanlarına ata."
              href="/dashboard/workouts"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* TODO: Danışan listesi ve aktif içerik */}
          <div className="card-base">
            <h3 className="font-bold text-text-primary mb-4">Son Aktiviteler</h3>
            <p className="text-sm text-text-secondary">Yakında burada danışan aktiviteleri görünecek.</p>
          </div>
        </div>
      )}
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
  icon: string
  accent?: boolean
}) {
  return (
    <div className="card-base hover-lift">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        {accent && value > 0 && (
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        )}
      </div>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      <p className="text-xs text-text-secondary mt-1">{label}</p>
    </div>
  )
}

function EmptyCard({
  icon,
  title,
  description,
  href,
}: {
  icon: string
  title: string
  description: string
  href: string
}) {
  return (
    <Link href={href} className="card-base hover-lift group">
      <span className="text-2xl">{icon}</span>
      <h4 className="mt-3 font-bold text-text-primary group-hover:text-primary transition-colors">
        {title}
      </h4>
      <p className="mt-1 text-sm text-text-secondary">{description}</p>
    </Link>
  )
}
