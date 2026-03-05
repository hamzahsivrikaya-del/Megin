import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { formatPrice, formatDate } from '@/lib/utils'
import { getTrainerPlan } from '@/lib/subscription'
import FeatureGate from '@/components/shared/FeatureGate'

function FinanceSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
        <div className="h-5 bg-border rounded w-36" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 bg-border rounded" />
        ))}
      </div>
    </div>
  )
}

export default async function FinancePage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/login')

  const { data: trainer } = await supabase
    .from('trainers')
    .select('id')
    .eq('user_id', session.user.id)
    .single()

  if (!trainer) redirect('/login')

  const plan = await getTrainerPlan(supabase, trainer.id)

  const { data: packages } = await supabase
    .from('packages')
    .select('id, price, payment_status, status, start_date, client_id, total_lessons, used_lessons')
    .eq('trainer_id', trainer.id)

  const allPackages = packages || []

  const totalRevenue = allPackages
    .filter(pkg => pkg.price !== null)
    .reduce((sum, pkg) => sum + (pkg.price as number), 0)
  const paidRevenue = allPackages
    .filter(pkg => pkg.payment_status === 'paid' && pkg.price !== null)
    .reduce((sum, pkg) => sum + (pkg.price ?? 0), 0)
  const pendingRevenue = allPackages
    .filter(pkg => pkg.payment_status === 'unpaid' && pkg.price !== null)
    .reduce((sum, pkg) => sum + (pkg.price ?? 0), 0)
  const activeClients = new Set(
    allPackages.filter(pkg => pkg.status === 'active').map(pkg => pkg.client_id)
  ).size

  return (
    <FeatureGate plan={plan} feature="finance" role="trainer">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Finans</h1>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="text-text-secondary text-sm">Toplam Gelir</div>
            <div className="text-2xl font-bold mt-1">{formatPrice(totalRevenue) || '0 TL'}</div>
          </Card>
          <Card>
            <div className="text-text-secondary text-sm">Ödenen</div>
            <div className="text-2xl font-bold mt-1 text-success">{formatPrice(paidRevenue) || '0 TL'}</div>
          </Card>
          <Card>
            <div className="text-text-secondary text-sm">Bekleyen</div>
            <div className="text-2xl font-bold mt-1 text-warning">{formatPrice(pendingRevenue) || '0 TL'}</div>
          </Card>
          <Card>
            <div className="text-text-secondary text-sm">Aktif Danışanlar</div>
            <div className="text-2xl font-bold mt-1">{activeClients}</div>
          </Card>
        </div>

        <Suspense fallback={<FinanceSkeleton />}>
          <DeferredFinance trainerId={trainer.id} />
        </Suspense>
      </div>
    </FeatureGate>
  )
}

async function DeferredFinance({ trainerId }: { trainerId: string }) {
  const supabase = await createClient()

  const { data: packages } = await supabase
    .from('packages')
    .select('id, price, payment_status, start_date, status, client_id, total_lessons, used_lessons, clients(full_name)')
    .eq('trainer_id', trainerId)

  const allPackages = packages || []

  // Aylara göre grupla
  const monthMap = new Map<string, { month: string; revenue: number; paid: number; pending: number; count: number }>()

  for (const pkg of allPackages) {
    const monthKey = pkg.start_date?.substring(0, 7)
    if (!monthKey) continue

    const existing = monthMap.get(monthKey) || { month: monthKey, revenue: 0, paid: 0, pending: 0, count: 0 }
    const price = pkg.price ?? 0
    existing.revenue += price
    existing.count += 1
    if (pkg.price !== null) {
      if (pkg.payment_status === 'paid') existing.paid += price
      else existing.pending += price
    }
    monthMap.set(monthKey, existing)
  }

  const monthlyData = Array.from(monthMap.values()).sort((a, b) => b.month.localeCompare(a.month))

  return (
    <Card>
      <h3 className="text-lg font-semibold text-text-primary mb-4">Aylık Gelir</h3>
      {monthlyData.length === 0 ? (
        <p className="text-sm text-text-secondary">Henüz paket verisi yok.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-text-secondary font-medium">Ay</th>
                <th className="text-right py-2 text-text-secondary font-medium">Gelir</th>
                <th className="text-right py-2 text-text-secondary font-medium">Ödenen</th>
                <th className="text-right py-2 text-text-secondary font-medium">Bekleyen</th>
                <th className="text-right py-2 text-text-secondary font-medium">Paket</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((row) => (
                <tr key={row.month} className="border-b border-border/50">
                  <td className="py-3 font-medium">{row.month}</td>
                  <td className="py-3 text-right font-medium">{formatPrice(row.revenue)}</td>
                  <td className="py-3 text-right text-success">{formatPrice(row.paid)}</td>
                  <td className="py-3 text-right text-warning">{formatPrice(row.pending)}</td>
                  <td className="py-3 text-right">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
