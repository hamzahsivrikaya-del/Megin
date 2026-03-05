import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { formatPrice, formatDate } from '@/lib/utils'
import { getTrainerPlan } from '@/lib/subscription'
import FeatureGate from '@/components/shared/FeatureGate'
import { hasFeatureAccess } from '@/lib/plans'
import { calculateForecast } from '@/lib/finance-forecast'
import type { SubscriptionPlan } from '@/lib/types'

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
          <DeferredFinance trainerId={trainer.id} plan={plan} />
        </Suspense>
      </div>
    </FeatureGate>
  )
}

async function DeferredFinance({ trainerId, plan }: { trainerId: string; plan: SubscriptionPlan }) {
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

  // Forecast hesaplama
  const activeClientCount = new Set(
    allPackages.filter(pkg => pkg.status === 'active').map(pkg => pkg.client_id)
  ).size

  const forecastInput = monthlyData.map(m => ({
    month: m.month,
    total: m.revenue,
    paid: m.paid,
    pending: m.pending,
  }))

  const forecast = calculateForecast(forecastInput, activeClientCount)

  return (
    <>
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

      {hasFeatureAccess(plan, 'finance_forecast') && (
        <>
          <h3 className="text-lg font-semibold text-text-primary">Finansal Tahmin</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <div className="flex items-center justify-between mb-2">
                <div className="text-text-secondary text-sm">Gelecek Ay Tahmini</div>
                {forecast.trend !== 'stable' && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    forecast.trend === 'up'
                      ? 'bg-success/10 text-success'
                      : 'bg-error/10 text-error'
                  }`}>
                    {forecast.trend === 'up' ? '\u2191' : '\u2193'} %{Math.abs(forecast.trendPercent)}
                  </span>
                )}
              </div>
              <div className={`text-2xl font-bold ${
                forecast.trend === 'up'
                  ? 'text-success'
                  : forecast.trend === 'down'
                    ? 'text-error'
                    : 'text-text-primary'
              }`}>
                {formatPrice(forecast.nextMonth) || '0 TL'}
              </div>
              <div className="text-xs text-text-secondary mt-1">
                Danışan başına ort. {formatPrice(forecast.avgRevenuePerClient) || '0 TL'}
              </div>
            </Card>

            <Card>
              <div className="text-text-secondary text-sm mb-2">3 Aylık Tahmin</div>
              <div className="text-2xl font-bold text-text-primary">
                {formatPrice(forecast.nextThreeMonths) || '0 TL'}
              </div>
              <div className="text-xs text-text-secondary mt-1">
                Aylık ort. {formatPrice(Math.round(forecast.nextThreeMonths / 3)) || '0 TL'}
              </div>
            </Card>

            <Card>
              <div className="text-text-secondary text-sm mb-2">Tahsilat Riski</div>
              <div className={`text-2xl font-bold ${
                forecast.churnRisk > 30
                  ? 'text-error'
                  : forecast.churnRisk > 15
                    ? 'text-warning'
                    : 'text-success'
              }`}>
                %{forecast.churnRisk}
              </div>
              <div className="text-xs text-text-secondary mt-1">
                {forecast.churnRisk > 30
                  ? 'Yüksek risk - tahsilat takibi önerilir'
                  : forecast.churnRisk > 15
                    ? 'Orta risk - takip edin'
                    : 'Düşük risk'}
              </div>
            </Card>
          </div>
        </>
      )}
    </>
  )
}
