import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import Card from '@/components/ui/Card'
import { formatPrice } from '@/lib/utils'
import FinanceClient, { type MonthlyData, type ProjectionMonth, type RiskMember, type RiskReason } from './FinanceClient'

function FinanceSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Table skeleton */}
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

  const { data: packages } = await supabase
    .from('packages')
    .select('id, price, payment_status, status, start_date, user_id, total_lessons, used_lessons')

  const allPackages = packages || []

  // Ozet istatistikleri
  const totalRevenue = allPackages
    .filter(pkg => pkg.price !== null)
    .reduce((sum, pkg) => sum + (pkg.price as number), 0)
  const paidRevenue = allPackages
    .filter(pkg => pkg.payment_status === 'paid' && pkg.price !== null)
    .reduce((sum, pkg) => sum + (pkg.price ?? 0), 0)
  const pendingRevenue = allPackages
    .filter(pkg => pkg.payment_status === 'unpaid' && pkg.price !== null)
    .reduce((sum, pkg) => sum + (pkg.price ?? 0), 0)
  const activeMembers = new Set(
    allPackages.filter(pkg => pkg.status === 'active').map(pkg => pkg.user_id)
  ).size

  return (
    <div className="space-y-6">
      <h1 className="text-2xl heading-display">Finans</h1>

      {/* Ozet Kartlari */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="text-text-secondary text-sm">Toplam Gelir</div>
          <div className="text-2xl font-bold mt-1">
            {formatPrice(totalRevenue) || '0 TL'}
          </div>
        </Card>
        <Card>
          <div className="text-text-secondary text-sm">Ödenen</div>
          <div className="text-2xl font-bold mt-1 text-success">
            {formatPrice(paidRevenue) || '0 TL'}
          </div>
        </Card>
        <Card>
          <div className="text-text-secondary text-sm">Bekleyen</div>
          <div className="text-2xl font-bold mt-1 text-warning">
            {formatPrice(pendingRevenue) || '0 TL'}
          </div>
        </Card>
        <Card>
          <div className="text-text-secondary text-sm">Aktif Üyeler</div>
          <div className="text-2xl font-bold mt-1">{activeMembers}</div>
        </Card>
      </div>

      {/* Aylik Gelir Tablosu — ertelenmis */}
      <Suspense fallback={<FinanceSkeleton />}>
        <DeferredFinance />
      </Suspense>
    </div>
  )
}

async function DeferredFinance() {
  const supabase = await createClient()

  const { data: packages } = await supabase
    .from('packages')
    .select('id, price, payment_status, start_date, status, user_id, total_lessons, used_lessons')

  const allPackages = packages || []

  // Aylara gore grupla
  const monthMap = new Map<string, MonthlyData>()

  for (const pkg of allPackages) {
    const monthKey = pkg.start_date?.substring(0, 7)
    if (!monthKey) continue

    const existing = monthMap.get(monthKey) || {
      month: monthKey,
      revenue: 0,
      paid: 0,
      pending: 0,
      count: 0,
    }

    const price = pkg.price ?? 0
    existing.revenue += price
    existing.count += 1

    if (pkg.price !== null) {
      if (pkg.payment_status === 'paid') {
        existing.paid += price
      } else {
        existing.pending += price
      }
    }

    monthMap.set(monthKey, existing)
  }

  // Yeniden eskiye sirala
  const monthlyData = Array.from(monthMap.values()).sort((a, b) => b.month.localeCompare(a.month))

  // --- PROJEKSIYON HESAPLAMA ---
  const now = new Date()
  const fourWeeksAgoStr = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Aktif paketler
  const activePackages = allPackages.filter(p => p.status === 'active')
  const activeUserIds = activePackages.map(p => p.user_id)

  // Son 4 haftanin dersleri
  const { data: recentLessons } = await supabase
    .from('lessons')
    .select('user_id, date')
    .in('user_id', activeUserIds.length > 0 ? activeUserIds : ['_none_'])
    .gte('date', fourWeeksAgoStr)

  // Uye isimleri
  const { data: users } = await supabase
    .from('users')
    .select('id, full_name')
    .in('id', activeUserIds.length > 0 ? activeUserIds : ['_none_'])

  const userMap = new Map((users || []).map(u => [u.id, u.full_name]))

  // Her aktif uye icin tahmini bitis hesapla
  const projectionMap = new Map<string, ProjectionMonth>()

  for (const pkg of activePackages) {
    const userLessons = (recentLessons || []).filter(l => l.user_id === pkg.user_id)
    const weeklyRate = userLessons.length / 4

    if (weeklyRate === 0) continue // Son 4 haftada ders yok — belirsiz

    const remaining = pkg.total_lessons - pkg.used_lessons
    if (remaining <= 0) continue

    const weeksLeft = remaining / weeklyRate
    const estimatedEnd = new Date(now.getTime() + weeksLeft * 7 * 24 * 60 * 60 * 1000)

    // Bu ay dahil 3 ay icinde mi?
    const threeMonthsLater = new Date(now.getFullYear(), now.getMonth() + 3, 0)
    if (estimatedEnd > threeMonthsLater) continue

    const endMonth = `${estimatedEnd.getFullYear()}-${String(estimatedEnd.getMonth() + 1).padStart(2, '0')}`

    const entry = projectionMap.get(endMonth) || { month: endMonth, renewals: 0, revenue: 0, members: [] }
    entry.renewals++
    if (pkg.price) entry.revenue += pkg.price
    entry.members.push({ id: pkg.user_id, name: userMap.get(pkg.user_id) || '' })
    projectionMap.set(endMonth, entry)
  }

  // Bu ay dahil gelecek 3 ayi goster (bu ayki bitisler de onemli)
  const projectionData: ProjectionMonth[] = []
  for (let i = 0; i <= 2; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const entry = projectionMap.get(key) || { month: key, renewals: 0, revenue: 0, members: [] }
    projectionData.push(entry)
  }

  // --- RISK HESAPLAMA ---

  // Tum aktif uyeler (sadece aktif paketi olanlar degil, tum aktif uyeler)
  const { data: allActiveUsers } = await supabase
    .from('users')
    .select('id, full_name')
    .eq('role', 'member')
    .eq('is_active', true)

  // Son 4 hafta beslenme verileri (ekstra ogunler haric)
  const allActiveUserIds = (allActiveUsers || []).map(u => u.id)
  const { data: recentMealLogs } = await supabase
    .from('meal_logs')
    .select('user_id, date, status, is_extra')
    .in('user_id', allActiveUserIds.length > 0 ? allActiveUserIds : ['_none_'])
    .gte('date', fourWeeksAgoStr)
    .eq('is_extra', false)

  // Son 4 hafta olcumleri
  const { data: recentMeasurements } = await supabase
    .from('measurements')
    .select('user_id, date, weight')
    .in('user_id', allActiveUserIds.length > 0 ? allActiveUserIds : ['_none_'])
    .gte('date', fourWeeksAgoStr)
    .order('date', { ascending: true })

  // Hedefler
  const { data: goals } = await supabase
    .from('member_goals')
    .select('user_id, metric_type, target_value')
    .in('user_id', allActiveUserIds.length > 0 ? allActiveUserIds : ['_none_'])

  // Son 4 hafta dersleri — tum aktif uyeler icin (recentLessons sadece aktif paketli uyeler icin)
  const { data: allRecentLessons } = await supabase
    .from('lessons')
    .select('user_id, date')
    .in('user_id', allActiveUserIds.length > 0 ? allActiveUserIds : ['_none_'])
    .gte('date', fourWeeksAgoStr)

  const riskyMembers: RiskMember[] = []

  const twoWeeksAgoDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  for (const user of (allActiveUsers || [])) {
    const reasons: RiskReason[] = []

    // 1. Ders sikligi dususu
    const userLessons = (allRecentLessons || []).filter(l => l.user_id === user.id)
    const recent2wLessons = userLessons.filter(l => new Date(l.date) >= twoWeeksAgoDate)
    const prev2wLessons = userLessons.filter(l => new Date(l.date) < twoWeeksAgoDate)
    const recent2wRate = recent2wLessons.length / 2 // haftalik ortalama
    const prev2wRate = prev2wLessons.length / 2

    if (prev2wRate > 0) {
      const ratio = recent2wRate / prev2wRate
      if (ratio < 0.5) {
        reasons.push({ signal: 'Ders sıklığı düştü', detail: `Haftalık: ${prev2wRate} → ${recent2wRate} ders` })
      } else if (ratio < 0.7) {
        reasons.push({ signal: 'Ders sıklığı azalıyor', detail: `Haftalık: ${prev2wRate} → ${recent2wRate} ders` })
      }
    }

    // 2. Beslenme uyumu dususu
    const userMeals = (recentMealLogs || []).filter(m => m.user_id === user.id)
    if (userMeals.length > 0) {
      const recent2wMeals = userMeals.filter(m => new Date(m.date) >= twoWeeksAgoDate)
      if (recent2wMeals.length > 0) {
        const compliant = recent2wMeals.filter(m => m.status === 'compliant').length
        const complianceRate = compliant / recent2wMeals.length

        if (complianceRate < 0.3) {
          reasons.push({ signal: 'Beslenme koptu', detail: `Uyum: %${Math.round(complianceRate * 100)}` })
        } else if (complianceRate < 0.5) {
          reasons.push({ signal: 'Beslenme düşüşte', detail: `Uyum: %${Math.round(complianceRate * 100)}` })
        }
      }
    }

    // 3. Hedef ilerlemesi duraganligi
    const userGoals = (goals || []).filter(g => g.user_id === user.id)
    const userMeasures = (recentMeasurements || []).filter(m => m.user_id === user.id)
    if (userGoals.some(g => g.metric_type === 'weight') && userMeasures.length >= 2) {
      const firstWeight = userMeasures[0]?.weight
      const lastWeight = userMeasures[userMeasures.length - 1]?.weight
      if (firstWeight !== null && lastWeight !== null && firstWeight === lastWeight) {
        reasons.push({ signal: 'Hedef durağanlaştı', detail: `Kilo değişmedi (${lastWeight} kg)` })
      }
    }

    if (reasons.length > 0) {
      const hasHigh = reasons.some(r =>
        r.signal === 'Ders sıklığı düştü' ||
        r.signal === 'Beslenme koptu' ||
        r.signal === 'Hedef durağanlaştı'
      )
      riskyMembers.push({
        id: user.id,
        name: user.full_name,
        level: hasHigh ? 'high' : 'medium',
        reasons,
      })
    }
  }

  // Yuksek risk once sirala
  riskyMembers.sort((a, b) => {
    if (a.level === b.level) return 0
    return a.level === 'high' ? -1 : 1
  })

  return <FinanceClient monthlyData={monthlyData} projectionData={projectionData} riskyMembers={riskyMembers} />
}
