# Admin Finans Dashboard — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Admin sidebar'a Finans sayfasi ekle — gelir ozeti, aylik tablo + grafik, 3 ay projeksiyon ve riskli uye listesi.

**Architecture:** Server component veri ceker, client component'e prop olarak aktarir. Recharts lazy-loaded. Suspense ile ozet kartlari hemen, geri kalan ertelenmis render edilir.

**Tech Stack:** Next.js 16 App Router, Supabase server client, Recharts (lazy), Tailwind CSS v4

---

### Task 1: Sidebar'a Finans menu ogesi ekle

**Files:**
- Modify: `src/components/shared/Sidebar.tsx:7-18`

**Step 1: menuItems array'ine Finans ekle**

Dashboard'dan sonra, Uyeler'den once:

```typescript
const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/admin/finance', label: 'Finans', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { href: '/admin/members', label: 'Uyeler', icon: '...' },
  // ... geri kalan ayni
]
```

Ikon: dolar/TL daire ikonu (heroicons currency-dollar path).

**Step 2: Dogrula**

Run: `npm run dev`
Tarayicida `/admin` ac, sidebar'da Dashboard ile Uyeler arasinda "Finans" menusu gorunmeli.

**Step 3: Commit**

```bash
git add src/components/shared/Sidebar.tsx
git commit -m "feat: sidebar'a Finans menu ogesi eklendi"
```

---

### Task 2: loading.tsx skeleton olustur

**Files:**
- Create: `src/app/(admin)/admin/finance/loading.tsx`

**Step 1: Skeleton component yaz**

```tsx
export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-border rounded w-32" />
      {/* Ozet kartlari */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface rounded-xl border border-border p-4 space-y-2">
            <div className="h-3 bg-border rounded w-20" />
            <div className="h-8 bg-border rounded w-24" />
          </div>
        ))}
      </div>
      {/* Grafik alani */}
      <div className="bg-surface rounded-xl border border-border p-4">
        <div className="h-5 bg-border rounded w-40 mb-4" />
        <div className="h-64 bg-border rounded" />
      </div>
      {/* Tablo */}
      <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
        <div className="h-5 bg-border rounded w-36" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 bg-border rounded" />
        ))}
      </div>
    </div>
  )
}
```

**Step 2: Dogrula**

`/admin/finance` sayfasi henuz yok, loading.tsx yalniz basina hata vermez. Sonraki task'ta page.tsx ile birlikte gorunecek.

**Step 3: Commit**

```bash
git add src/app/(admin)/admin/finance/loading.tsx
git commit -m "feat: finans sayfasi loading skeleton"
```

---

### Task 3: Server page — veri cekme + ozet kartlari

**Files:**
- Create: `src/app/(admin)/admin/finance/page.tsx`

**Step 1: Server component yaz — tum verileri cek**

```tsx
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import { formatPrice } from '@/lib/utils'

export default async function FinancePage() {
  const supabase = await createClient()

  // Ozet icin tum paketler
  const { data: allPackages } = await supabase
    .from('packages')
    .select('price, payment_status, status, start_date, user_id, total_lessons, used_lessons')

  const packages = allPackages || []

  // Ozet hesaplamalari
  const totalRevenue = packages
    .filter(p => p.price !== null)
    .reduce((sum, p) => sum + (p.price as number), 0)
  const paidRevenue = packages
    .filter(p => p.price !== null && p.payment_status === 'paid')
    .reduce((sum, p) => sum + (p.price as number), 0)
  const pendingRevenue = packages
    .filter(p => p.price !== null && p.payment_status === 'unpaid')
    .reduce((sum, p) => sum + (p.price as number), 0)
  const activeMembers = new Set(
    packages.filter(p => p.status === 'active').map(p => p.user_id)
  ).size

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Finans</h1>

      {/* Ozet Kartlari */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="text-text-secondary text-sm">Toplam Gelir</div>
          <div className="text-2xl font-bold mt-1">{formatPrice(totalRevenue) || '0 TL'}</div>
        </Card>
        <Card>
          <div className="text-text-secondary text-sm">Odenen</div>
          <div className="text-2xl font-bold mt-1 text-success">{formatPrice(paidRevenue) || '0 TL'}</div>
        </Card>
        <Card>
          <div className="text-text-secondary text-sm">Bekleyen</div>
          <div className="text-2xl font-bold mt-1 text-warning">{formatPrice(pendingRevenue) || '0 TL'}</div>
        </Card>
        <Card>
          <div className="text-text-secondary text-sm">Aktif Uye</div>
          <div className="text-2xl font-bold mt-1">{activeMembers}</div>
        </Card>
      </div>

      {/* Ertelenmis bolumler — Task 4-7'de doldurulacak */}
      <Suspense fallback={<FinanceSkeleton />}>
        <DeferredFinance packages={packages} />
      </Suspense>
    </div>
  )
}

function FinanceSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-surface rounded-xl border border-border p-4">
        <div className="h-5 bg-border rounded w-40 mb-4" />
        <div className="h-64 bg-border rounded" />
      </div>
    </div>
  )
}

async function DeferredFinance({ packages }: { packages: Record<string, unknown>[] }) {
  // Placeholder — Task 4'te FinanceClient'a donusecek
  return <div />
}
```

**Step 2: Dogrula**

Run: `npm run dev`
`/admin/finance` ac — 4 ozet karti gorunmeli. Degerler gercek veritabanindan gelmeli.

**Step 3: Commit**

```bash
git add src/app/(admin)/admin/finance/page.tsx
git commit -m "feat: finans sayfasi — ozet kartlari"
```

---

### Task 4: FinanceClient — aylik gelir tablosu

**Files:**
- Create: `src/app/(admin)/admin/finance/FinanceClient.tsx`
- Modify: `src/app/(admin)/admin/finance/page.tsx` — DeferredFinance'i guncelle

**Step 1: Aylik gelir verisini hazirla**

page.tsx'teki `DeferredFinance` icinde aylik gruplama yap ve FinanceClient'a aktar:

```tsx
// page.tsx icerisinde DeferredFinance'i guncelle:

async function DeferredFinance({ packages }: { packages: { price: number | null, payment_status: string, status: string, start_date: string, user_id: string, total_lessons: number, used_lessons: number }[] }) {
  const supabase = await createClient()

  // Aylik gelir hesapla — paketleri start_date ay bazinda grupla
  const monthlyMap = new Map<string, { revenue: number, paid: number, pending: number, count: number }>()

  for (const pkg of packages) {
    if (pkg.price === null) continue
    const monthKey = pkg.start_date.substring(0, 7) // "2026-03"
    const entry = monthlyMap.get(monthKey) || { revenue: 0, paid: 0, pending: 0, count: 0 }
    entry.revenue += pkg.price
    if (pkg.payment_status === 'paid') entry.paid += pkg.price
    else entry.pending += pkg.price
    entry.count++
    monthlyMap.set(monthKey, entry)
  }

  const monthlyData = Array.from(monthlyMap.entries())
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => b.month.localeCompare(a.month))

  return <FinanceClient monthlyData={monthlyData} />
}
```

**Step 2: FinanceClient.tsx — aylik tablo**

```tsx
'use client'

import { useState } from 'react'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import { formatPrice } from '@/lib/utils'

interface MonthlyData {
  month: string
  revenue: number
  paid: number
  pending: number
  count: number
}

interface FinanceClientProps {
  monthlyData: MonthlyData[]
  // Diger prop'lar sonraki task'larda eklenecek
}

const MONTH_NAMES = ['Ocak', 'Subat', 'Mart', 'Nisan', 'Mayis', 'Haziran', 'Temmuz', 'Agustos', 'Eylul', 'Ekim', 'Kasim', 'Aralik']

function formatMonth(monthKey: string): string {
  const [year, month] = monthKey.split('-')
  return `${MONTH_NAMES[parseInt(month) - 1]} ${year}`
}

export default function FinanceClient({ monthlyData }: FinanceClientProps) {
  return (
    <div className="space-y-6">
      {/* Aylik Gelir Tablosu */}
      <Card>
        <CardHeader>
          <CardTitle>Aylik Gelir</CardTitle>
        </CardHeader>
        {monthlyData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-text-secondary">
                  <th className="pb-2 font-medium">Ay</th>
                  <th className="pb-2 font-medium text-right">Gelir</th>
                  <th className="pb-2 font-medium text-right">Odenen</th>
                  <th className="pb-2 font-medium text-right">Bekleyen</th>
                  <th className="pb-2 font-medium text-right">Paket</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((row) => (
                  <tr key={row.month} className="border-b border-border/50 last:border-0">
                    <td className="py-3 font-medium">{formatMonth(row.month)}</td>
                    <td className="py-3 text-right">{formatPrice(row.revenue)}</td>
                    <td className="py-3 text-right text-success">{formatPrice(row.paid)}</td>
                    <td className="py-3 text-right text-warning">{formatPrice(row.pending)}</td>
                    <td className="py-3 text-right">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-text-secondary">Henuz paket verisi yok</p>
        )}
      </Card>
    </div>
  )
}
```

**Step 3: Dogrula**

`/admin/finance` — ozet kartlari + aylik tablo gorunmeli. Gercek paket verisi ay bazinda grupli.

**Step 4: Commit**

```bash
git add src/app/(admin)/admin/finance/FinanceClient.tsx src/app/(admin)/admin/finance/page.tsx
git commit -m "feat: finans — aylik gelir tablosu"
```

---

### Task 5: Gelir grafigi (Recharts Line Chart)

**Files:**
- Modify: `src/app/(admin)/admin/finance/FinanceClient.tsx`

**Step 1: Recharts lazy-load import ekle**

```tsx
import dynamic from 'next/dynamic'

const RevenueChart = dynamic(() => import('./RevenueChart'), { ssr: false })
```

**Step 2: RevenueChart component'i olustur**

Create: `src/app/(admin)/admin/finance/RevenueChart.tsx`

```tsx
'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

interface ChartDataPoint {
  month: string
  label: string
  revenue: number
  projected: number | null
}

interface RevenueChartProps {
  data: ChartDataPoint[]
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const formatTL = (value: number) =>
    value >= 1000 ? `${(value / 1000).toFixed(0)}K` : `${value}`

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: '#57534E' }}
          axisLine={{ stroke: '#E5E5E5' }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatTL}
          tick={{ fontSize: 12, fill: '#57534E' }}
          axisLine={false}
          tickLine={false}
          width={50}
        />
        <Tooltip
          formatter={(value: number) => [`${value.toLocaleString('tr-TR')} TL`, '']}
          labelFormatter={(label: string) => label}
          contentStyle={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E5E5',
            borderRadius: '8px',
            fontSize: '13px',
          }}
        />
        {/* Gercek gelir — duz cizgi */}
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#DC2626"
          strokeWidth={2}
          dot={{ r: 4, fill: '#DC2626' }}
          name="Gelir"
          connectNulls={false}
        />
        {/* Tahmini gelir — kesikli cizgi */}
        <Line
          type="monotone"
          dataKey="projected"
          stroke="#DC2626"
          strokeWidth={2}
          strokeDasharray="6 4"
          dot={{ r: 4, fill: '#FFFFFF', stroke: '#DC2626', strokeWidth: 2 }}
          name="Tahmini"
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

**Step 3: FinanceClient'ta grafik verisini hazirla ve render et**

FinanceClient'a `projectionData` prop'u eklenecek (Task 6'da gelecek). Simdilik sadece gecmis veriyi goster:

```tsx
// FinanceClient return icinde, tablodan ONCE:
<Card>
  <CardHeader>
    <CardTitle>Gelir Trendi</CardTitle>
  </CardHeader>
  <RevenueChart data={chartData} />
</Card>
```

`chartData` olusturma: `monthlyData`'yi ters cevir (eski->yeni sira) ve chart formatina donustur:

```tsx
const chartData = [...monthlyData]
  .reverse()
  .map(d => ({
    month: d.month,
    label: formatMonth(d.month),
    revenue: d.revenue,
    projected: null,
  }))
```

**Step 4: Dogrula**

`/admin/finance` — ozet kartlari + cizgi grafik + tablo gorunmeli. Grafik gercek verileri gostermeli.

**Step 5: Commit**

```bash
git add src/app/(admin)/admin/finance/RevenueChart.tsx src/app/(admin)/admin/finance/FinanceClient.tsx
git commit -m "feat: finans — aylik gelir cizgi grafigi"
```

---

### Task 6: 3 ay projeksiyon hesaplama + tahmin tablosu

**Files:**
- Modify: `src/app/(admin)/admin/finance/page.tsx` — DeferredFinance'te projeksiyon verisi hesapla
- Modify: `src/app/(admin)/admin/finance/FinanceClient.tsx` — tahmin tablosu + grafige kesikli cizgi

**Step 1: page.tsx — projeksiyon verisi hesapla**

DeferredFinance icinde:

```tsx
// Son 4 haftanin baslangic tarihi
const fourWeeksAgo = new Date()
fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)
const fourWeeksAgoStr = fourWeeksAgo.toISOString().split('T')[0]

// Aktif paketlerin ders gecmisini al
const activePackages = packages.filter(p => p.status === 'active')
const activeUserIds = activePackages.map(p => p.user_id)

const { data: recentLessons } = await supabase
  .from('lessons')
  .select('user_id, date')
  .in('user_id', activeUserIds.length > 0 ? activeUserIds : ['_'])
  .gte('date', fourWeeksAgoStr)

// Her uye icin projeksiyon hesapla
const projections: { userId: string, userName: string, month: string, expectedRevenue: number | null }[] = []

// Uye isimlerini al
const { data: users } = await supabase
  .from('users')
  .select('id, full_name')
  .in('id', activeUserIds.length > 0 ? activeUserIds : ['_'])

const userMap = new Map((users || []).map(u => [u.id, u.full_name]))

for (const pkg of activePackages) {
  const userLessons = (recentLessons || []).filter(l => l.user_id === pkg.user_id)
  const weeklyRate = userLessons.length / 4

  if (weeklyRate === 0) continue // Belirsiz — son 4 haftada ders yok

  const remaining = pkg.total_lessons - pkg.used_lessons
  const weeksLeft = remaining / weeklyRate
  const estimatedEndDate = new Date()
  estimatedEndDate.setDate(estimatedEndDate.getDate() + weeksLeft * 7)
  const endMonth = estimatedEndDate.toISOString().substring(0, 7) // "2026-04"

  // Gelecek 3 ay icinde mi?
  const now = new Date()
  const threeMonthsLater = new Date(now.getFullYear(), now.getMonth() + 3, 1)
  if (estimatedEndDate < threeMonthsLater) {
    projections.push({
      userId: pkg.user_id,
      userName: userMap.get(pkg.user_id) || '',
      month: endMonth,
      expectedRevenue: pkg.price,
    })
  }
}

// Ay bazinda grupla
const projectionMap = new Map<string, { renewals: number, revenue: number, members: { id: string, name: string }[] }>()

for (const proj of projections) {
  const entry = projectionMap.get(proj.month) || { renewals: 0, revenue: 0, members: [] }
  entry.renewals++
  if (proj.expectedRevenue) entry.revenue += proj.expectedRevenue
  entry.members.push({ id: proj.userId, name: proj.userName })
  projectionMap.set(proj.month, entry)
}

// Gelecek 3 ay garantili goster (veri olmasa bile satir olsun)
const projectionData = []
for (let i = 1; i <= 3; i++) {
  const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  const entry = projectionMap.get(key) || { renewals: 0, revenue: 0, members: [] }
  projectionData.push({ month: key, ...entry })
}
```

Sonra `FinanceClient`'a `projectionData` prop'u olarak aktar.

**Step 2: FinanceClient — tahmin tablosu ekle**

Aylik gelir tablosundan sonra:

```tsx
{/* 3 Ay Projeksiyon */}
<Card>
  <CardHeader>
    <CardTitle>Gelecek 3 Ay Tahmini</CardTitle>
  </CardHeader>
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border text-left text-text-secondary">
          <th className="pb-2 font-medium">Ay</th>
          <th className="pb-2 font-medium text-right">Beklenen Yenileme</th>
          <th className="pb-2 font-medium text-right">Beklenen Gelir</th>
          <th className="pb-2 font-medium">Uyeler</th>
        </tr>
      </thead>
      <tbody>
        {projectionData.map((row) => (
          <tr key={row.month} className="border-b border-border/50 last:border-0">
            <td className="py-3 font-medium">{formatMonth(row.month)}</td>
            <td className="py-3 text-right">{row.renewals} uye</td>
            <td className="py-3 text-right">{row.revenue > 0 ? `~${formatPrice(row.revenue)}` : '—'}</td>
            <td className="py-3">
              <div className="flex flex-wrap gap-1">
                {row.members.map(m => (
                  <a key={m.id} href={`/admin/members/${m.id}`} className="text-primary hover:underline">
                    {m.name}
                  </a>
                ))}
                {row.members.length === 0 && <span className="text-text-secondary">—</span>}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</Card>
```

**Step 3: Grafige kesikli cizgi ekle**

`chartData`'ya projeksiyon verisi ekle — son gercek ayin degerini baslangic noktasi yap, sonra 3 ay tahmini:

```tsx
// chartData olusturulduktan sonra:
const lastRealMonth = chartData[chartData.length - 1]

const fullChartData = [
  ...chartData,
  // Son gercek ay hem duz hem kesikli cizgide gorunur (birlestirme noktasi)
  ...projectionData.map(d => ({
    month: d.month,
    label: formatMonth(d.month),
    revenue: null as number | null,
    projected: d.revenue,
  }))
]

// Son gercek aya projected degeri de ekle (cizgilerin birlesme noktasi)
if (lastRealMonth && fullChartData.length > chartData.length) {
  lastRealMonth.projected = lastRealMonth.revenue
}
```

**Step 4: Dogrula**

`/admin/finance` — grafik gercek (duz) + tahmini (kesikli) gostermeli. Tablo 3 ay gostermeli. Uye isimlerine tikla -> uye detaya gitmeli.

**Step 5: Commit**

```bash
git add src/app/(admin)/admin/finance/page.tsx src/app/(admin)/admin/finance/FinanceClient.tsx
git commit -m "feat: finans — 3 ay projeksiyon tablosu + grafik"
```

---

### Task 7: Riskli uyeler bolumu

**Files:**
- Modify: `src/app/(admin)/admin/finance/page.tsx` — risk verisi hesapla
- Modify: `src/app/(admin)/admin/finance/FinanceClient.tsx` — risk kartlari ekle

**Step 1: page.tsx — risk sinyallerini hesapla**

DeferredFinance icinde, tum aktif uyeleri tara:

```tsx
// Aktif uyeler (paketi olan)
const { data: activeUsers } = await supabase
  .from('users')
  .select('id, full_name')
  .eq('role', 'member')
  .eq('is_active', true)

const twoWeeksAgo = new Date()
twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
const twoWeeksAgoStr = twoWeeksAgo.toISOString().split('T')[0]

// Son 4 hafta dersleri (zaten cekildi: recentLessons)
// Son 2 hafta beslenme verileri
const { data: recentMeals } = await supabase
  .from('meal_logs')
  .select('user_id, date, status, is_extra')
  .gte('date', fourWeeksAgoStr)
  .eq('is_extra', false)

// Son 4 hafta olcumleri
const { data: recentMeasurements } = await supabase
  .from('measurements')
  .select('user_id, date, weight')
  .gte('date', fourWeeksAgoStr)
  .order('date', { ascending: true })

// Hedefler
const { data: goals } = await supabase
  .from('member_goals')
  .select('user_id, metric_type, target_value')

// Member meals (ogun sayisi — tamamlanma orani icin)
const { data: memberMeals } = await supabase
  .from('member_meals')
  .select('user_id, id')

// Risk hesapla
interface RiskMember {
  id: string
  name: string
  level: 'high' | 'medium'
  reasons: { signal: string, detail: string }[]
}

const riskyMembers: RiskMember[] = []

for (const user of (activeUsers || [])) {
  const reasons: { signal: string, detail: string }[] = []

  // 1. Ders sikligi dususu
  const userLessonsAll = (recentLessons || []).filter(l => l.user_id === user.id)
  const twoWeeksAgoDate = new Date()
  twoWeeksAgoDate.setDate(twoWeeksAgoDate.getDate() - 14)
  const recent2w = userLessonsAll.filter(l => new Date(l.date) >= twoWeeksAgoDate).length / 2
  const prev2w = userLessonsAll.filter(l => new Date(l.date) < twoWeeksAgoDate).length / 2

  if (prev2w > 0) {
    const ratio = recent2w / prev2w
    if (ratio < 0.5) {
      reasons.push({ signal: 'Ders sikligi dustu', detail: `Haftalik: ${prev2w} → ${recent2w} ders` })
    } else if (ratio < 0.7) {
      reasons.push({ signal: 'Ders sikligi azaliyor', detail: `Haftalik: ${prev2w} → ${recent2w} ders` })
    }
  }

  // 2. Beslenme uyumu dususu
  const userMeals = (recentMeals || []).filter(m => m.user_id === user.id)
  const userMealCount = (memberMeals || []).filter(m => m.user_id === user.id).length
  if (userMealCount > 0 && userMeals.length > 0) {
    const recent2wMeals = userMeals.filter(m => new Date(m.date) >= twoWeeksAgoDate)
    const compliant = recent2wMeals.filter(m => m.status === 'compliant').length
    const total = recent2wMeals.length
    const complianceRate = total > 0 ? compliant / total : 1

    if (complianceRate < 0.3) {
      reasons.push({ signal: 'Beslenme koptu', detail: `Uyum: %${Math.round(complianceRate * 100)}` })
    } else if (complianceRate < 0.5) {
      reasons.push({ signal: 'Beslenme dususte', detail: `Uyum: %${Math.round(complianceRate * 100)}` })
    }
  }

  // 3. Hedef ilerlemesi
  const userGoals = (goals || []).filter(g => g.user_id === user.id)
  const userMeasures = (recentMeasurements || []).filter(m => m.user_id === user.id)

  if (userGoals.length > 0 && userMeasures.length >= 2) {
    const weightGoal = userGoals.find(g => g.metric_type === 'weight')
    if (weightGoal) {
      const first = userMeasures[0]?.weight
      const last = userMeasures[userMeasures.length - 1]?.weight
      if (first !== null && last !== null && first === last) {
        reasons.push({ signal: 'Hedef duraganlasti', detail: `Kilo degismedi (${last} kg)` })
      }
    }
  }

  if (reasons.length > 0) {
    const hasHigh = reasons.some(r =>
      r.signal === 'Ders sikligi dustu' || r.signal === 'Beslenme koptu' || r.signal === 'Hedef duraganlasti'
    )
    riskyMembers.push({
      id: user.id,
      name: user.full_name,
      level: hasHigh ? 'high' : 'medium',
      reasons,
    })
  }
}

// Yuksek risk once
riskyMembers.sort((a, b) => (a.level === 'high' ? -1 : 1) - (b.level === 'high' ? -1 : 1))
```

`riskyMembers`'i FinanceClient'a prop olarak aktar.

**Step 2: FinanceClient — risk kartlari**

Projeksiyon tablosundan sonra:

```tsx
{/* Riskli Uyeler */}
{riskyMembers.length > 0 && (
  <Card>
    <CardHeader>
      <CardTitle>Riskli Uyeler</CardTitle>
    </CardHeader>
    <ul className="space-y-1">
      {riskyMembers.map((member) => (
        <li key={member.id}>
          <a
            href={`/admin/members/${member.id}`}
            className="flex items-start gap-3 py-3 px-2 -mx-2 rounded-lg hover:bg-surface-hover active:bg-surface-hover transition-colors"
          >
            <span className={`mt-0.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${
              member.level === 'high' ? 'bg-danger' : 'bg-warning'
            }`} />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{member.name}</div>
              <div className="text-xs text-text-secondary mt-0.5">
                {member.reasons.map(r => r.detail).join(' · ')}
              </div>
            </div>
            <Badge variant={member.level === 'high' ? 'danger' : 'warning'}>
              {member.reasons[0].signal}
            </Badge>
          </a>
        </li>
      ))}
    </ul>
  </Card>
)}
```

**Step 3: Dogrula**

`/admin/finance` — risk bolumu en altta gorunmeli. Ders sikligi veya beslenme dususu olan uyeler listelenmeli. Uyeye tikla -> detay sayfasina gitmeli.

**Step 4: Commit**

```bash
git add src/app/(admin)/admin/finance/page.tsx src/app/(admin)/admin/finance/FinanceClient.tsx
git commit -m "feat: finans — riskli uyeler bolumu"
```

---

### Task 8: Son duzeltmeler + dogrulama

**Files:**
- Tum finance dosyalari

**Step 1: TypeScript hata kontrolu**

Run: `npx tsc --noEmit`
Hata varsa duzelt.

**Step 2: Build kontrolu**

Run: `npm run build`
Hata varsa duzelt.

**Step 3: Manuel test**

- `/admin/finance` sayfasini ac
- 4 ozet karti dolu mu?
- Grafik gorunuyor mu? Hover calisiyor mu?
- Aylik tablo siralama dogru mu? (yeni ay ustte)
- Projeksiyon tablosu 3 ay gosteriyor mu?
- Riskli uyeler (varsa) gorunuyor mu?
- Sidebar'da Finans linki aktif (kirmizi) gozukuyor mu?
- Mobilde hamburger menu'den Finans'a erisiliyor mu?

**Step 4: Commit**

```bash
git add .
git commit -m "feat: admin finans dashboard tamamlandi"
```
