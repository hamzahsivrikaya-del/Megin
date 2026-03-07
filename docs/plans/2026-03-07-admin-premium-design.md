# Admin Panel Premium Design Refresh — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Admin panelinin tum gorsel ogelerini LP tasarim diline yukseltmek — bilesen bazli yaklasimla ortak UI'i premium yapip tum sayfalarin otomatik guncellenmesini saglamak.

**Architecture:** Once globals.css'e yeni utility class'lar eklenir, sonra Card/Badge/StatCard gibi ortak bilesenlere variant'lar eklenir. Bu sayede bilesenleri kullanan tum sayfalar otomatik premium gorunum kazanir. Son olarak sayfa-ozel ince ayarlar yapilir (dashboard, sidebar, trainer dashboard).

**Tech Stack:** Next.js 16, Tailwind CSS v4, React 19. Sadece CSS + TSX degisiklikleri — backend/DB degisikligi yok.

**Onemli:** `text-transform: uppercase` KULLANILMAYACAK (Turkce I sorunu). Iki paralel yapi var: `(admin)` ve `(trainer)` — ikisi de guncellenecek.

---

## Mevcut Durum Ozeti

**Zaten var olanlar (dokunulmayacak):**
- `panel-card` — temel card stili (12px radius, warm hover border+shadow)
- `panel-card-interactive` — tiklanabilir card hover-lift
- `panel-stat` — stat pill (warm gradient bg, rounded-full)
- `sidebar-item-active` — aktif menu item (gradient bg + left border)
- `sidebar-logo-gradient` — logo gradient text
- `heading-display` / `heading-display-xl` — display font heading
- `heading-gradient` — gradient text heading
- `cta-gradient` / `cta-ghost` / `cta-primary` — buton stilleri
- `card-glow` / `hover-lift` / `text-gradient` — efekt utility'leri
- `panel-section-enter` — fade-up animasyonu

**Eksik olanlar (bu plan ile eklenecek):**
1. Card component'inde `glow` prop'u (hover glow on/off)
2. StatCard bilesen (gradient icon bg + heading-display deger)
3. Sidebar'da ikon arka plan cercevesi (aktif item icin)
4. Dashboard'da heading-gradient ve gorsel hiyerarsi
5. Trainer dashboard'un (admin) dashboard ile ayni premium yapiya kavusmasi
6. List item hover efektleri
7. Section divider utility

---

### Task 1: globals.css — Yeni utility class'lar ekle

**Files:**
- Modify: `src/app/globals.css` (panel design system bolumu, ~satir 1299-1380)

**Step 1: Asagidaki CSS class'larini `/* -- Panel Design System */` bolumune ekle**

`panel-card:hover` satirindan sonra (satir 1319 civarinda), `.panel-card-interactive`'den ONCE su class'lari ekle:

```css
/* Card with always-on subtle glow */
.panel-card-glow {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255, 45, 45, 0.05);
}
.panel-card-glow:hover {
  border-color: rgba(255, 45, 45, 0.25);
  box-shadow: 0 8px 24px -4px rgba(255, 45, 45, 0.1), 0 4px 12px -2px rgba(249, 115, 22, 0.08);
}

/* Stat card — gradient bg + prominent value */
.stat-card {
  background: linear-gradient(135deg, rgba(255, 45, 45, 0.04), rgba(249, 115, 22, 0.04));
  border: 1px solid rgba(255, 45, 45, 0.12);
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.25s ease;
}
.stat-card:hover {
  border-color: rgba(255, 45, 45, 0.25);
  box-shadow: 0 8px 24px -4px rgba(255, 45, 45, 0.08), 0 4px 12px -2px rgba(249, 115, 22, 0.06);
}

/* Icon circle with warm gradient */
.icon-circle {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #DC2626, #F97316);
  box-shadow: 0 4px 12px -2px rgba(220, 38, 38, 0.2);
}
.icon-circle svg { color: white; }

/* Icon circle — soft/muted variant */
.icon-circle-soft {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255, 45, 45, 0.1), rgba(249, 115, 22, 0.08));
}
.icon-circle-soft svg { color: #FF2D2D; }

/* Section divider — gradient line */
.section-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 45, 45, 0.15), rgba(249, 115, 22, 0.1), transparent);
  border: none;
  margin: 1.5rem 0;
}

/* List item with hover glow */
.list-item-hover {
  padding: 0.5rem 0.75rem;
  margin: 0 -0.25rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}
.list-item-hover:hover {
  background: linear-gradient(135deg, rgba(255, 45, 45, 0.03), rgba(249, 115, 22, 0.02));
}

/* Progress bar with gradient fill */
.progress-warm {
  height: 0.375rem;
  border-radius: 9999px;
  background: var(--color-border-light);
  overflow: hidden;
}
.progress-warm > div {
  height: 100%;
  border-radius: 9999px;
  background: linear-gradient(90deg, #DC2626, #F97316);
  transition: width 0.5s ease;
}
```

**Step 2: Build ile dogrula**

Run: `npx next build 2>&1 | head -5`
Expected: Build baslar (mevcut module-not-found hatalari haricinde yeni hata olmamali)

**Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "style: add premium panel utility classes (stat-card, icon-circle, section-divider, progress-warm)"
```

---

### Task 2: Card component — `glow` prop ekle

**Files:**
- Modify: `src/components/ui/Card.tsx`

**Step 1: Card component'ine `glow` prop ekle**

Mevcut `Card.tsx` icerigi:

```tsx
export interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export default function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      className={`panel-card ${onClick ? 'panel-card-interactive' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {children}
    </div>
  )
}
```

Yeni hali:

```tsx
export interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  glow?: boolean
}

export default function Card({ children, className = '', onClick, glow }: CardProps) {
  return (
    <div
      className={`panel-card ${glow ? 'panel-card-glow' : ''} ${onClick ? 'panel-card-interactive' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {children}
    </div>
  )
}
```

**Step 2: CardHeader ve CardTitle'a dokunma** — bunlar zaten `heading-display` kullaniyor, degisiklik gerekmiyor.

**Step 3: Commit**

```bash
git add src/components/ui/Card.tsx
git commit -m "feat(Card): add glow prop for premium hover effect"
```

---

### Task 3: StatCard bilesen olustur

**Files:**
- Create: `src/components/ui/StatCard.tsx`

**Step 1: StatCard bilesenini yaz**

```tsx
interface StatCardProps {
  icon: React.ReactNode
  value: string | number
  label: string
  className?: string
}

export default function StatCard({ icon, value, label, className = '' }: StatCardProps) {
  return (
    <div className={`stat-card text-center ${className}`}>
      <div className="icon-circle mx-auto mb-2">
        {icon}
      </div>
      <span className="text-2xl font-bold text-text-primary heading-display">{value}</span>
      <span className="block text-xs text-text-secondary mt-0.5">{label}</span>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/ui/StatCard.tsx
git commit -m "feat: create StatCard component with gradient icon and heading-display value"
```

---

### Task 4: Admin dashboard'u premium bilesenlere refactor et

**Files:**
- Modify: `src/app/(admin)/admin/page.tsx`

**Step 1: Import'lari guncelle**

Mevcut satirlar (1-9):
```tsx
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { toDateStr } from '@/lib/utils'
import NutritionCard from './NutritionCard'
import MemberSearch from '@/components/shared/MemberSearch'
```

Yeni import'lar (StatCard eklenir):
```tsx
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import StatCard from '@/components/ui/StatCard'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { toDateStr } from '@/lib/utils'
import NutritionCard from './NutritionCard'
import MemberSearch from '@/components/shared/MemberSearch'
```

**Step 2: Istatistik kartlarini StatCard'a cevir**

Mevcut blok (satir 58-80 arasi — 3 Card ile stat gosterimi):
```tsx
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center !p-4">
          <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br from-primary/10 to-orange-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" ...>...</svg>
          </div>
          <span className="text-2xl font-bold text-text-primary">{activeMembers || 0}</span>
          <span className="block text-xs text-text-secondary mt-0.5">Danisan</span>
        </Card>
        <!-- ayni pattern 2 kez daha -->
      </div>
```

Yeni hali:
```tsx
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          value={activeMembers || 0}
          label="Danisan"
        />
        <StatCard
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
          value={weeklyLessons?.length || 0}
          label="Haftalik Ders"
        />
        <StatCard
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          value={todayLessons?.length || 0}
          label="Bugun"
        />
      </div>
```

**Step 3: Card'lara glow prop ekle**

Mevcut (satir 126): `<Card className="">`
Yeni: `<Card glow>`

Mevcut (satir 265): `<Card className="">`
Yeni: `<Card glow>`

Mevcut (satir 293): `<Card className="">`
Yeni: `<Card glow>`

**Step 4: Ders programi list item'larina hover efekti ekle**

Mevcut (satir 140):
```tsx
<div key={lesson.id as string} className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-hover">
```

Yeni:
```tsx
<div key={lesson.id as string} className="flex items-center justify-between list-item-hover bg-surface-hover/50">
```

**Step 5: Uyari listesi item'larina hover efekti ekle**

Mevcut (satir 276):
```tsx
<Link href={...} className="flex items-center justify-between py-2 px-1 -mx-1 rounded-lg hover:bg-surface-hover active:bg-surface-hover transition-colors">
```

Yeni:
```tsx
<Link href={...} className="flex items-center justify-between list-item-hover">
```

**Step 6: Build dogrula ve commit**

Run: `npx next build 2>&1 | head -5`

```bash
git add src/app/(admin)/admin/page.tsx
git commit -m "refactor(admin-dashboard): use StatCard + Card glow + list-item-hover"
```

---

### Task 5: Trainer dashboard'u admin ile ayni premium yapiya getir

**Files:**
- Modify: `src/app/(trainer)/dashboard/page.tsx`

**Step 1: Import StatCard**

Ekle: `import StatCard from '@/components/ui/StatCard'`

**Step 2: Stat chip'leri StatCard'a cevir**

Mevcut blok (satir 78-91 — 3 inline-flex span):
```tsx
      <div className="flex items-center justify-center gap-3 flex-wrap" data-tour="stat-clients">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-primary/30 rounded-full text-sm font-medium text-text-primary">
          <svg ...>...</svg>
          {clientCount || 0} Danisan
        </span>
        <!-- ayni pattern 2 kez daha -->
      </div>
```

Yeni hali:
```tsx
      <div className="grid grid-cols-3 gap-3" data-tour="stat-clients">
        <StatCard
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          value={clientCount || 0}
          label="Danisan"
        />
        <StatCard
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
          value={weeklyLessons?.length || 0}
          label="Haftalik"
        />
        <StatCard
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          value={todayLessons?.length || 0}
          label="Bugun"
        />
      </div>
```

**Step 3: Heading'i gradient yap**

Mevcut (satir 75): `<h1 className="text-2xl font-bold">Anasayfa</h1>`
Yeni: `<h1 className="text-2xl heading-gradient">Anasayfa</h1>`

**Step 4: Card'lara glow + border temizligi**

Mevcut (satir 100): `<Card className="border-primary/30">`
Yeni: `<Card glow>`

Mevcut (satir 234): `<Card className="border-primary/30">`
Yeni: `<Card glow>`

**Step 5: Ders programi list item hover**

Mevcut (satir 107):
```tsx
<div key={...} className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-hover">
```
Yeni:
```tsx
<div key={...} className="flex items-center justify-between list-item-hover bg-surface-hover/50">
```

**Step 6: Uyari listesi item hover**

Mevcut (satir 247):
```tsx
className="flex items-center justify-between py-2 px-1 -mx-1 rounded-lg hover:bg-surface-hover active:bg-surface-hover transition-colors"
```
Yeni:
```tsx
className="flex items-center justify-between list-item-hover"
```

**Step 7: Commit**

```bash
git add src/app/(trainer)/dashboard/page.tsx
git commit -m "refactor(trainer-dashboard): use StatCard + Card glow + heading-gradient + list-item-hover"
```

---

### Task 6: Sidebar premium iyilestirme

**Files:**
- Modify: `src/components/shared/Sidebar.tsx`
- Modify: `src/app/globals.css`

**Step 1: Sidebar aktif item'a icon arka plan ekle**

Mevcut aktif item (satir 76-91):
```tsx
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg mb-0.5 text-sm transition-colors active:bg-surface-hover
                ${isActive
                  ? 'sidebar-item-active'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                }`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
              </svg>
              {item.label}
            </Link>
          )
```

Yeni hali — aktif item'da icon'a soft gradient bg:
```tsx
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg mb-0.5 text-sm transition-all
                ${isActive
                  ? 'sidebar-item-active'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${isActive ? 'bg-gradient-to-br from-[#DC2626] to-[#F97316] shadow-sm shadow-red-500/20' : ''}`}>
                <svg className={`w-4.5 h-4.5 ${isActive ? 'text-white' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
              </div>
              {item.label}
            </Link>
          )
```

**Step 2: Upgrade CTA'ya hover glow ekle**

Mevcut (satir 100):
```tsx
className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg cta-gradient text-white text-sm font-semibold"
```

Yeni:
```tsx
className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg cta-gradient text-white text-sm font-semibold hover:shadow-lg hover:shadow-red-500/20 transition-all"
```

**Step 3: Locked item'lara da icon bg ekle**

Mevcut locked item icon (satir 64-66):
```tsx
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
```

Yeni:
```tsx
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                  </svg>
                </div>
```

**Step 4: Commit**

```bash
git add src/components/shared/Sidebar.tsx
git commit -m "style(sidebar): premium icon backgrounds, upgrade CTA hover glow"
```

---

### Task 7: Trainer QuickActions — secondary butonlara hover glow ekle

**Files:**
- Modify: `src/app/(trainer)/dashboard/QuickActions.tsx`

**Step 1: Secondary butonlarin class'ini guncelle**

Mevcut secondary buton pattern (satir 82, 92, 102):
```tsx
className={`${btnBase} bg-surface border border-border text-text-primary hover:bg-surface-hover active:bg-surface-hover`}
```

Yeni — hover'da subtle warm glow:
```tsx
className={`${btnBase} bg-surface border border-border text-text-primary hover:border-primary/20 hover:bg-surface-hover hover:shadow-sm hover:shadow-primary/5 active:bg-surface-hover`}
```

**Step 2: Commit**

```bash
git add src/app/(trainer)/dashboard/QuickActions.tsx
git commit -m "style(quick-actions): add warm hover glow to secondary buttons"
```

---

### Task 8: Finance sayfasi — stat kartlari ve tablo hover

**Files:**
- Modify: `src/app/(admin)/admin/finance/page.tsx`
- Modify: `src/app/(trainer)/dashboard/finance/page.tsx` (eger varsa)

**Step 1: Oku ve analiz et**

Once dosyayi oku: `src/app/(admin)/admin/finance/page.tsx`
Trainer versiyonunu da kontrol et: `src/app/(trainer)/dashboard/finance/page.tsx`

**Step 2: Stat kartlari icin Card glow ekle**

Stat kartlarinda `<Card>` kullaniliyorsa `glow` prop ekle.
Eger inline `<div>` ile yazilmissa `stat-card` class'i ile degistir.

**Step 3: Tablo satirlarina hover efekti**

Mevcut tablo satirlarinda `hover:bg-surface-hover` varsa `list-item-hover` ile degistir.
Yoksa `list-item-hover` class'ini ekle.

**Step 4: Heading'lere heading-gradient ekle**

Sayfa basliginda `heading-gradient` kullan.

**Step 5: Commit**

```bash
git add src/app/(admin)/admin/finance/page.tsx src/app/(trainer)/dashboard/finance/page.tsx
git commit -m "style(finance): stat-card glow, table hover, heading-gradient"
```

---

### Task 9: Members/Clients list sayfasi — card hover ve avatar gradient

**Files:**
- Modify: `src/app/(admin)/admin/members/MembersList.tsx`
- Modify: `src/app/(trainer)/dashboard/clients/ClientsPage.tsx`

**Step 1: Oku ve analiz et**

Her iki dosyayi oku.

**Step 2: Uye/danisan kartlarina hover efekti**

Kartlarda `card-base` veya inline styling varsa:
- `hover:-translate-y-0.5` ekle
- `hover:shadow-md hover:shadow-primary/5` ekle
- Veya `panel-card panel-card-interactive` class'lari kullan

**Step 3: Avatar circle'lara gradient**

Mevcut avatar bg'leri `bg-primary/10` ise `icon-circle-soft` class'ina cevir.

**Step 4: Empty state icon'u gelistir**

Mevcut: `<div className="... bg-primary/10 ...">`
Yeni: `<div className="icon-circle mx-auto">` (gradient bg)

**Step 5: Heading-gradient ekle**

Sayfa basligina `heading-gradient` class'i ekle.

**Step 6: Commit**

```bash
git add src/app/(admin)/admin/members/MembersList.tsx src/app/(trainer)/dashboard/clients/ClientsPage.tsx
git commit -m "style(members): card hover, avatar gradient, empty state polish"
```

---

### Task 10: Diger admin sayfalari — toplu gorsel guncelleme

Bu task daha buyuk — asagidaki dosyalarda ayni pattern'i uygula:

**Files (toplu):**
- `src/app/(admin)/admin/workouts/WorkoutManager.tsx` + `src/app/(trainer)/dashboard/workouts/WorkoutManager.tsx`
- `src/app/(admin)/admin/takvim/CalendarClient.tsx` + `src/app/(trainer)/dashboard/takvim/CalendarClient.tsx`
- `src/app/(admin)/admin/notifications/NotificationsManager.tsx`
- `src/app/(admin)/admin/settings/page.tsx` + `src/app/(trainer)/dashboard/settings/page.tsx`
- `src/app/(admin)/admin/blog/BlogClient.tsx` + `src/app/(trainer)/dashboard/blog/BlogClient.tsx`

**Her dosya icin ayni 3 degisiklik:**

1. **Sayfa basligini bul**, `heading-gradient` class'i ekle (varsa `text-2xl font-bold` yerine `text-2xl heading-gradient`)

2. **Card kullanimlarini bul**, uygun olanlara `glow` prop ekle

3. **Tab/toggle butonlarinda** aktif state'i `bg-primary text-white` yerine `bg-gradient-to-r from-[#DC2626] to-[#F97316] text-white shadow-sm` yap (toggle/tab butonlari icin — NOT regular buttons, those are already done)

**Step: Commit**

```bash
git add -A
git commit -m "style(admin-pages): heading-gradient, card glow, tab gradient across all admin pages"
```

---

### Task 11: Client (danisan) paneli — ayni gorsel dil

**Files:**
- `src/app/(client)/app/page.tsx` — client dashboard
- `src/app/(client)/app/beslenme/BeslenmeClient.tsx`
- `src/app/(client)/app/progress/` (GoalSetter, ProgressChart vb.)
- `src/app/(client)/app/program/page.tsx`
- `src/app/(client)/app/packages/page.tsx`
- `src/app/(client)/app/settings/page.tsx`

**Ayni 3 pattern:**
1. Sayfa basliklarinda `heading-gradient` kullan
2. Card'lara `glow` prop ekle
3. Progress bar'lari `progress-warm` class'ina cevir (eger uygunsa)

**Step: Commit**

```bash
git add -A
git commit -m "style(client-panel): heading-gradient, card glow, progress-warm across client pages"
```

---

## Kontrol Listesi

Her task'tan sonra su soruyu sor:
- [ ] Yeni `uppercase` eklendi mi? HAYIR olmali!
- [ ] Fonksiyonellik bozuldu mu? Build hatasi var mi?
- [ ] Gradient renkleri dogru mu? (`#DC2626` → `#F97316`)
- [ ] Her iki paralel yapi da guncellendi mi? (`(admin)` + `(trainer)`)
