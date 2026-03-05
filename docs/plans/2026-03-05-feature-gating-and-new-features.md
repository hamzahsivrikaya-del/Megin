# Feature Gating Enforcement + Yeni Ozellikler Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Feature gating'i tum uygulama genelinde enforce et, takvimi Elite'e tasI, blog sistemi ekle, risk skoru/instagram karti/finans tahmini implement et, free planda rapor gonderimini kapat.

**Architecture:** plans.ts'deki mevcut hasFeatureAccess() altyapisini kullanarak Sidebar, ClientNavbar, sayfa ve API seviyesinde gating enforce edilecek. Yeni ozellikler (blog, risk skoru, instagram karti, finans tahmini) Elite pakete eklenecek. FeatureGate wrapper component olusturulacak.

**Tech Stack:** Next.js 15, Supabase (RLS + RPC), TypeScript, Tailwind v4

---

## Ozet: Paket Dagitimi (Yeni)

| Ozellik | FREE (3) | PRO (10) | ELITE (sinirsiz) |
|---------|----------|----------|-------------------|
| Danisan + Davet | ACIK | ACIK | ACIK |
| Antrenman Programi | ACIK | ACIK | ACIK |
| Ders Takibi (Manuel) | ACIK | ACIK | ACIK |
| Paket Yonetimi | ACIK | ACIK | ACIK |
| Temel Olcum (kilo, boy) | ACIK | ACIK | ACIK |
| PT Handle | ACIK | ACIK | ACIK |
| Onboarding + Tour | ACIK | ACIK | ACIK |
| Egzersiz Autocomplete | ACIK | ACIK | ACIK |
| Detayli Olcum + Grafik | KAPALI | ACIK | ACIK |
| Beslenme Takibi | KAPALI | ACIK | ACIK |
| Haftalik Raporlar | KAPALI | ACIK | ACIK |
| Push Bildirimler | KAPALI | ACIK | ACIK |
| Finans Ekrani | KAPALI | ACIK | ACIK |
| Rozet Sistemi | KAPALI | ACIK | ACIK |
| Hedef Belirleme | KAPALI | ACIK | ACIK |
| PDF Rapor Export | KAPALI | ACIK | ACIK |
| Takvim | KAPALI | KAPALI | ACIK |
| Ilerleme Fotolari | KAPALI | KAPALI | ACIK |
| Blog | KAPALI | KAPALI | ACIK |
| Bagli Uyeler | KAPALI | KAPALI | ACIK |
| Risk Skoru | KAPALI | KAPALI | ACIK |
| Instagram Karti | KAPALI | KAPALI | ACIK |
| Finans Tahmini | KAPALI | KAPALI | ACIK |

---

## Task 1: plans.ts Guncelle

**Files:**
- Modify: `src/lib/plans.ts`

**Step 1: plans.ts'i guncelle**

```typescript
import { SubscriptionPlan } from './types'

export interface PlanConfig {
  name: string
  clientLimit: number
  price: number | null
  features: string[]
  lockedFeatures: string[]
}

export const PLAN_CONFIGS: Record<SubscriptionPlan, PlanConfig> = {
  free: {
    name: 'Free',
    clientLimit: 3,
    price: null,
    features: [
      'Danisan ekleme + davet linki',
      'Temel antrenman programi',
      'Ders sayisi takibi',
      'Temel olcum (kilo, boy)',
      'PT Handle (public profil)',
    ],
    lockedFeatures: [
      'measurement_charts',
      'nutrition',
      'weekly_reports',
      'push_notifications',
      'finance',
      'badges',
      'goals',
      'pdf_export',
      'calendar',
      'progress_photos',
      'blog',
      'dependents',
      'risk_score',
      'instagram_card',
      'finance_forecast',
    ],
  },
  pro: {
    name: 'Pro',
    clientLimit: 10,
    price: null,
    features: [
      'Olcum grafikleri + trend analizi',
      'Beslenme takibi (ogun + foto)',
      'Haftalik otomatik raporlar',
      'Push bildirimler',
      'Finans ekrani (gelir ozeti)',
      'Rozet sistemi',
      'Hedef belirleme',
      'PDF rapor export',
    ],
    lockedFeatures: [
      'calendar',
      'progress_photos',
      'blog',
      'dependents',
      'risk_score',
      'instagram_card',
      'finance_forecast',
    ],
  },
  elite: {
    name: 'Elite',
    clientLimit: -1,
    price: null,
    features: [
      'Takvim (ders planlama)',
      'Ilerleme fotolari + slider',
      'Blog sistemi',
      'Bagli uye (veli-cocuk)',
      'Risk skoru',
      'Instagram paylasim karti',
      'Finans tahmini',
    ],
    lockedFeatures: [],
  },
}

// Mevcut fonksiyonlar ayni kalacak
export function canAddClient(plan: SubscriptionPlan, currentClientCount: number): boolean {
  const config = PLAN_CONFIGS[plan]
  if (config.clientLimit === -1) return true
  return currentClientCount < config.clientLimit
}

export function hasFeatureAccess(plan: SubscriptionPlan, feature: string): boolean {
  const config = PLAN_CONFIGS[plan]
  return !config.lockedFeatures.includes(feature)
}

export function getUpgradePlan(currentPlan: SubscriptionPlan): SubscriptionPlan | null {
  if (currentPlan === 'free') return 'pro'
  if (currentPlan === 'pro') return 'elite'
  return null
}
```

**Degisiklikler:**
- `fitness_tools` kaldirildi (gercek bir sayfa yok)
- `blog` kaldirildi (kaldirilmisti, yeniden Elite olarak implement edilecek)
- `goals` eklendi (Free'de kapali, Pro+'da acik)
- `pdf_export` eklendi (Free'de kapali, Pro+'da acik)
- `calendar` eklendi (Free ve Pro'da kapali, Elite'de acik)
- `badges` Free'den Pro'ya tasindi (Pro+'da acik)

**Step 2: Commit**
```bash
git add src/lib/plans.ts
git commit -m "feat: update plan configs with new feature distribution"
```

---

## Task 2: FeatureGate Component Olustur

**Files:**
- Create: `src/components/shared/FeatureGate.tsx`

**Step 1: FeatureGate component yaz**

Bu component kilitli sayfalarda "upgrade" mesaji gosterecek.

```tsx
'use client'

import Link from 'next/link'
import { SubscriptionPlan } from '@/lib/types'
import { hasFeatureAccess, getUpgradePlan, PLAN_CONFIGS } from '@/lib/plans'

interface FeatureGateProps {
  plan: SubscriptionPlan
  feature: string
  children: React.ReactNode
  /** Trainer mi client mi? Upgrade link'i farkli */
  role?: 'trainer' | 'client'
}

export default function FeatureGate({ plan, feature, children, role = 'trainer' }: FeatureGateProps) {
  if (hasFeatureAccess(plan, feature)) {
    return <>{children}</>
  }

  const upgradePlan = getUpgradePlan(plan)
  const upgradeName = upgradePlan ? PLAN_CONFIGS[upgradePlan].name : 'Elite'
  const upgradeLink = role === 'trainer' ? '/dashboard/upgrade' : '/dashboard/upgrade'

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-text-primary mb-2">
        Bu ozellik {upgradeName} paketinde
      </h2>
      <p className="text-text-secondary mb-6 max-w-md">
        Bu ozellige erismek icin planini yukselt.
      </p>
      {role === 'trainer' && (
        <Link
          href={upgradeLink}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
        >
          {upgradeName} Planina Gec
        </Link>
      )}
    </div>
  )
}
```

**Step 2: Commit**
```bash
git add src/components/shared/FeatureGate.tsx
git commit -m "feat: add FeatureGate component for plan-based access control"
```

---

## Task 3: Sidebar Feature Gating

**Files:**
- Modify: `src/components/shared/Sidebar.tsx`

**Step 1: Sidebar menu itemlarini plan'a gore filtrele**

Sidebar'daki her menu ogesine `feature` key ekle. Kilitli olanlari gri goster + kilit ikonu + upgrade link'i yap.

```tsx
// Mevcut menu items array'ini guncelle:
const menuItems = [
  { label: 'Anasayfa', path: '/dashboard', icon: HomeIcon },
  { label: 'Takvim', path: '/dashboard/takvim', icon: CalendarIcon, feature: 'calendar' },
  { label: 'Danisanlar', path: '/dashboard/clients', icon: UsersIcon },
  { label: 'Bugunku Dersler', path: '/dashboard/lessons/today', icon: ClipboardIcon },
  { label: 'Manuel Ders Ekle', path: '/dashboard/lessons/new', icon: PlusIcon },
  { label: 'Paket Olustur', path: '/dashboard/packages/new', icon: PackageIcon },
  { label: 'Olcum Gir', path: '/dashboard/measurements/new', icon: BarChartIcon },
  { label: 'Antrenmanlar', path: '/dashboard/workouts', icon: DumbbellIcon },
  { label: 'Finans', path: '/dashboard/finance', icon: CoinsIcon, feature: 'finance' },
  { label: 'Bildirimler', path: '/dashboard/notifications', icon: BellIcon, feature: 'push_notifications' },
  { label: 'Blog', path: '/dashboard/blog', icon: FileTextIcon, feature: 'blog' },
  { label: 'Profilim', path: '/dashboard/settings', icon: UserIcon },
]
```

Menu render kismi:
```tsx
{menuItems.map((item) => {
  const locked = item.feature && !hasFeatureAccess(plan, item.feature)

  if (locked) {
    return (
      <Link
        key={item.path}
        href="/dashboard/upgrade"
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-text-tertiary opacity-50 hover:opacity-70 transition-opacity text-sm"
      >
        <item.icon size={18} />
        <span>{item.label}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-auto">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </Link>
    )
  }

  return (
    <Link key={item.path} href={item.path} className={/* mevcut stiller */}>
      <item.icon size={18} />
      <span>{item.label}</span>
    </Link>
  )
})}
```

Import ekle: `import { hasFeatureAccess } from '@/lib/plans'`

**Step 2: Commit**
```bash
git add src/components/shared/Sidebar.tsx
git commit -m "feat: add feature gating to sidebar menu items"
```

---

## Task 4: Client Layout + Navbar Feature Gating

**Files:**
- Modify: `src/app/(client)/layout.tsx`
- Modify: `src/components/shared/ClientNavbar.tsx`

**Step 1: Client layout'a trainer plan bilgisi ekle**

Client'in trainer'inin plan bilgisini cekip navbar'a gec:

```typescript
// src/app/(client)/layout.tsx - mevcut client query'den sonra ekle:

// Trainer plan bilgisini cek
let trainerPlan: SubscriptionPlan = 'free'
if (client) {
  const { data: clientFull } = await supabase
    .from('clients')
    .select('trainer_id')
    .eq('user_id', session.user.id)
    .single()

  if (clientFull?.trainer_id) {
    trainerPlan = await getTrainerPlan(supabase, clientFull.trainer_id)
  }
}

// ClientNavbar'a plan prop'u gec
return (
  <div className="min-h-screen bg-background">
    <ClientNavbar userName={client?.full_name || ''} plan={trainerPlan} />
    <main className="p-4 md:p-6 max-w-5xl mx-auto">
      {children}
    </main>
  </div>
)
```

Import ekle:
```typescript
import { SubscriptionPlan } from '@/lib/types'
import { getTrainerPlan } from '@/lib/subscription'
```

**Step 2: ClientNavbar'a plan prop ekle ve menu filtrele**

```tsx
// src/components/shared/ClientNavbar.tsx

interface ClientNavbarProps {
  userName: string
  plan?: SubscriptionPlan
}

const navItems = [
  { label: 'Programim', path: '/app/program' },
  { label: 'Haftalik Ozet', path: '/app/haftalik-ozet', feature: 'weekly_reports' },
  { label: 'Beslenme', path: '/app/beslenme', feature: 'nutrition' },
  { label: 'Rozetler', path: '/app/rozetler', feature: 'badges' },
  { label: 'Blog', path: '/app/blog', feature: 'blog' },
]

// Render'da kilitli olanlari gizle veya kilit ikonu goster:
{navItems.map((item) => {
  const locked = item.feature && !hasFeatureAccess(plan || 'free', item.feature)
  if (locked) return null  // Kilitli olanlari gizle
  return (
    <Link key={item.path} href={item.path}>
      {item.label}
    </Link>
  )
})}
```

Import ekle:
```typescript
import { SubscriptionPlan } from '@/lib/types'
import { hasFeatureAccess } from '@/lib/plans'
```

**Step 3: Commit**
```bash
git add src/app/\(client\)/layout.tsx src/components/shared/ClientNavbar.tsx
git commit -m "feat: add plan-based feature gating to client navbar"
```

---

## Task 5: Trainer Sayfalarina Feature Gate Ekle

**Files:**
- Modify: `src/app/(trainer)/dashboard/finance/page.tsx`
- Modify: `src/app/(trainer)/dashboard/notifications/page.tsx`
- Modify: `src/app/(trainer)/dashboard/takvim/page.tsx`

Her sayfa server component. Sayfanin basinda plan kontrolu yapip FeatureGate wrapper'i ekle.

**Step 1: Her sayfaya plan check pattern'i ekle**

Ortak pattern (her sayfanin basina):
```typescript
import { createClient } from '@/lib/supabase/server'
import { getTrainerPlan } from '@/lib/subscription'
import FeatureGate from '@/components/shared/FeatureGate'

export default async function PageName() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  const { data: trainer } = await supabase
    .from('trainers')
    .select('id')
    .eq('user_id', session!.user.id)
    .single()

  const plan = await getTrainerPlan(supabase, trainer!.id)

  return (
    <FeatureGate plan={plan} feature="FEATURE_KEY" role="trainer">
      {/* Mevcut sayfa icerigi */}
    </FeatureGate>
  )
}
```

Uygulanacak sayfalar:
- `finance/page.tsx` -> feature: `'finance'`
- `notifications/page.tsx` -> feature: `'push_notifications'`
- `takvim/page.tsx` -> feature: `'calendar'`

**Step 2: Commit**
```bash
git add src/app/\(trainer\)/dashboard/finance/page.tsx src/app/\(trainer\)/dashboard/notifications/page.tsx src/app/\(trainer\)/dashboard/takvim/page.tsx
git commit -m "feat: add feature gating to trainer dashboard pages"
```

---

## Task 6: Client Sayfalarina Feature Gate Ekle

**Files:**
- Modify: `src/app/(client)/app/beslenme/page.tsx`
- Modify: `src/app/(client)/app/rozetler/page.tsx`
- Modify: `src/app/(client)/app/haftalik-ozet/page.tsx`

Client sayfalarinda trainer'in plan bilgisini cekmek gerekiyor:

**Step 1: Her client sayfasina plan check pattern'i ekle**

Ortak pattern:
```typescript
import { createClient } from '@/lib/supabase/server'
import { getTrainerPlan } from '@/lib/subscription'
import FeatureGate from '@/components/shared/FeatureGate'

export default async function PageName() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  // Client'in trainer'ini bul
  const { data: client } = await supabase
    .from('clients')
    .select('trainer_id')
    .eq('user_id', session!.user.id)
    .single()

  const plan = client?.trainer_id
    ? await getTrainerPlan(supabase, client.trainer_id)
    : 'free' as const

  return (
    <FeatureGate plan={plan} feature="FEATURE_KEY" role="client">
      {/* Mevcut sayfa icerigi */}
    </FeatureGate>
  )
}
```

Uygulanacak sayfalar:
- `beslenme/page.tsx` -> feature: `'nutrition'`
- `rozetler/page.tsx` -> feature: `'badges'`
- `haftalik-ozet/page.tsx` -> feature: `'weekly_reports'`

**Step 2: Commit**
```bash
git add src/app/\(client\)/app/beslenme/page.tsx src/app/\(client\)/app/rozetler/page.tsx src/app/\(client\)/app/haftalik-ozet/page.tsx
git commit -m "feat: add feature gating to client pages"
```

---

## Task 7: ClientDetail Tabs Feature Gating

**Files:**
- Modify: `src/app/(trainer)/dashboard/clients/[id]/ClientDetail.tsx`

**Step 1: ClientDetail'a plan prop ekle**

`ClientDetail` component'ine `plan` prop'u ekle ve tab'lari filtrele:

```typescript
interface ClientDetailProps {
  // ... mevcut props
  plan: SubscriptionPlan
}

// Tab tanimlari icinde feature key ekle:
const tabs: { key: Tab; label: string; count?: number; feature?: string }[] = [
  { key: 'overview', label: 'Genel Bakis' },
  { key: 'measurements', label: 'Olcumler', count: measurements.length },
  { key: 'packages', label: 'Paketler', count: packages.length },
  { key: 'lessons', label: 'Dersler', count: lessons.length },
  { key: 'nutrition', label: 'Beslenme', count: mealLogs.length, feature: 'nutrition' },
]

// Tab render'da kilitli olanlari gri goster:
{tabs.map((tab) => {
  const locked = tab.feature && !hasFeatureAccess(plan, tab.feature)
  return (
    <button
      key={tab.key}
      onClick={() => !locked && setActiveTab(tab.key)}
      disabled={locked}
      className={locked ? 'opacity-40 cursor-not-allowed' : '...'}
    >
      {tab.label} {locked && '🔒'}
    </button>
  )
})}
```

**Ayrica overview tab'daki bolumleri gate'le:**
- Bagli Uyeler section (satir ~587): `hasFeatureAccess(plan, 'dependents')` kontrolu
- Progress Photos (measurements tab icinde, satir ~747): `hasFeatureAccess(plan, 'progress_photos')` kontrolu

**Step 2: ClientDetail'i cagiran page.tsx'e plan prop'u ekle**

```typescript
// src/app/(trainer)/dashboard/clients/[id]/page.tsx
const plan = await getTrainerPlan(supabase, trainer.id)

<ClientDetail
  client={client}
  trainerId={trainer.id}
  plan={plan}
  // ... diger props
/>
```

**Step 3: Commit**
```bash
git add src/app/\(trainer\)/dashboard/clients/\[id\]/ClientDetail.tsx src/app/\(trainer\)/dashboard/clients/\[id\]/page.tsx
git commit -m "feat: add feature gating to ClientDetail tabs and sections"
```

---

## Task 8: Cron Job'larda Free Plan Filtreleme

**Files:**
- Modify: `src/app/api/cron/weekly-report/route.ts`
- Modify: `src/app/api/cron/nutrition-reminder/route.ts`
- Modify: `src/app/api/cron/badge-notify/route.ts`
- Modify: `src/app/api/cron/trainer-nutrition-summary/route.ts`

**Step 1: Her cron job'a plan kontrolu ekle**

Ortak pattern — trainer loop'unun basinda:
```typescript
import { hasFeatureAccess } from '@/lib/plans'

// Admin client ile trainer'in plan bilgisini cek
const { data: subscription } = await adminClient
  .from('subscriptions')
  .select('plan')
  .eq('trainer_id', trainerId)
  .eq('status', 'active')
  .single()

const plan = subscription?.plan || 'free'

// Ilgili feature'a erisimi yoksa atla
if (!hasFeatureAccess(plan, 'weekly_reports')) continue  // weekly-report icin
if (!hasFeatureAccess(plan, 'nutrition')) continue        // nutrition-reminder icin
if (!hasFeatureAccess(plan, 'badges')) continue           // badge-notify icin
if (!hasFeatureAccess(plan, 'nutrition')) continue        // trainer-nutrition-summary icin
```

**Dosya bazinda ekleme noktalari:**
- `weekly-report/route.ts`: Satir 102 sonrasi (trainer loop icinde, packages sorgulanmadan once)
- `nutrition-reminder/route.ts`: Satir 95 civarinda (clientsToNotify push'indan once)
- `badge-notify/route.ts`: Satir 32 civarinda (byUser map olusturulurken)
- `trainer-nutrition-summary/route.ts`: Satir 57 civarinda (trainer loop icinde)

**NOT:** `check-packages/route.ts` icin plan kontrolu GEREKMEZ — paket suresi doldu bildirimi tum planlara gider.

**Step 2: Commit**
```bash
git add src/app/api/cron/
git commit -m "feat: filter cron job notifications by trainer plan"
```

---

## Task 9: Blog Sistemi (Elite)

### Task 9a: Blog Migration

**Files:**
- Create: `supabase/migrations/016_blog_system.sql`

```sql
-- Blog Posts tablosu
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_blog_posts_trainer ON blog_posts(trainer_id);
CREATE INDEX idx_blog_posts_published ON blog_posts(published, created_at DESC);

-- RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Trainer kendi blog'larini yonetebilir
CREATE POLICY "Trainers manage own blog posts"
  ON blog_posts FOR ALL
  USING (
    trainer_id IN (
      SELECT id FROM trainers WHERE user_id = auth.uid()
    )
  );

-- Client sadece kendi trainer'inin yayinlanmis blog'larini okuyabilir
CREATE POLICY "Clients read own trainer blog posts"
  ON blog_posts FOR SELECT
  USING (
    published = true
    AND trainer_id IN (
      SELECT trainer_id FROM clients WHERE user_id = auth.uid()
    )
  );
```

### Task 9b: Blog Type

**Files:**
- Modify: `src/lib/types.ts`

```typescript
// types.ts'in sonuna ekle:
export interface BlogPost {
  id: string
  trainer_id: string
  title: string
  content: string
  cover_image_url: string | null
  published: boolean
  created_at: string
  updated_at: string
}
```

### Task 9c: Trainer Blog Sayfasi

**Files:**
- Create: `src/app/(trainer)/dashboard/blog/page.tsx`
- Create: `src/app/(trainer)/dashboard/blog/BlogClient.tsx`

**page.tsx (Server Component):**
```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTrainerPlan } from '@/lib/subscription'
import FeatureGate from '@/components/shared/FeatureGate'
import BlogClient from './BlogClient'

export default async function BlogPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: trainer } = await supabase
    .from('trainers')
    .select('id')
    .eq('user_id', session.user.id)
    .single()

  if (!trainer) redirect('/login')

  const plan = await getTrainerPlan(supabase, trainer.id)

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('trainer_id', trainer.id)
    .order('created_at', { ascending: false })

  return (
    <FeatureGate plan={plan} feature="blog" role="trainer">
      <BlogClient posts={posts || []} trainerId={trainer.id} />
    </FeatureGate>
  )
}
```

**BlogClient.tsx (Client Component):**
```tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BlogPost } from '@/lib/types'

interface Props {
  posts: BlogPost[]
  trainerId: string
}

export default function BlogClient({ posts: initialPosts, trainerId }: Props) {
  const supabase = createClient()
  const [posts, setPosts] = useState(initialPosts)
  const [showEditor, setShowEditor] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      if (editingPost) {
        const { data } = await supabase
          .from('blog_posts')
          .update({ title, content, updated_at: new Date().toISOString() })
          .eq('id', editingPost.id)
          .select()
          .single()
        if (data) setPosts(posts.map(p => p.id === data.id ? data : p))
      } else {
        const { data } = await supabase
          .from('blog_posts')
          .insert({ trainer_id: trainerId, title, content, published: false })
          .select()
          .single()
        if (data) setPosts([data, ...posts])
      }
      setShowEditor(false)
      setEditingPost(null)
      setTitle('')
      setContent('')
    } finally {
      setSaving(false)
    }
  }

  async function togglePublish(post: BlogPost) {
    const { data } = await supabase
      .from('blog_posts')
      .update({ published: !post.published })
      .eq('id', post.id)
      .select()
      .single()
    if (data) setPosts(posts.map(p => p.id === data.id ? data : p))
  }

  async function handleDelete(postId: string) {
    await supabase.from('blog_posts').delete().eq('id', postId)
    setPosts(posts.filter(p => p.id !== postId))
  }

  // UI: Post listesi, editor modal, publish/unpublish toggle, delete
  // Tasarim: Mevcut Card/Button componentlerini kullan
  // ...
}
```

### Task 9d: Client Blog Sayfasi

**Files:**
- Create: `src/app/(client)/app/blog/page.tsx`

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTrainerPlan } from '@/lib/subscription'
import FeatureGate from '@/components/shared/FeatureGate'

export default async function ClientBlogPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: client } = await supabase
    .from('clients')
    .select('trainer_id')
    .eq('user_id', session.user.id)
    .single()

  if (!client) redirect('/login')

  const plan = await getTrainerPlan(supabase, client.trainer_id)

  // Sadece kendi PT'sinin yayinlanmis bloglarini goster (RLS zaten kontrol ediyor)
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('trainer_id', client.trainer_id)
    .eq('published', true)
    .order('created_at', { ascending: false })

  return (
    <FeatureGate plan={plan} feature="blog" role="client">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-text-primary">Blog</h1>
        {(!posts || posts.length === 0) ? (
          <p className="text-text-secondary">Henuz blog yazisi yok.</p>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <article key={post.id} className="rounded-xl border border-border bg-surface p-6">
                <h2 className="text-lg font-bold text-text-primary mb-2">{post.title}</h2>
                <p className="text-xs text-text-tertiary mb-4">
                  {new Date(post.created_at).toLocaleDateString('tr-TR')}
                </p>
                <div className="text-text-secondary whitespace-pre-wrap">{post.content}</div>
              </article>
            ))}
          </div>
        )}
      </div>
    </FeatureGate>
  )
}
```

**Step: Commit**
```bash
git add supabase/migrations/016_blog_system.sql src/lib/types.ts src/app/\(trainer\)/dashboard/blog/ src/app/\(client\)/app/blog/
git commit -m "feat: add blog system (Elite) - trainer writes, client reads own PT's blogs"
```

---

## Task 10: Risk Skoru (Elite)

**Files:**
- Create: `src/lib/risk-score.ts`
- Modify: `src/app/(trainer)/dashboard/clients/[id]/ClientDetail.tsx` (overview tab'a ekle)

**Step 1: Risk skoru hesaplama fonksiyonu**

Risk skoru, daniSanin "birakma riski"ni olcer. Dusuk = iyi, yuksek = riskli.

```typescript
// src/lib/risk-score.ts

export interface RiskFactors {
  lastLessonDaysAgo: number    // Son dersten bu yana gecen gun
  attendanceRate: number       // Son 4 hafta katilim orani (0-1)
  nutritionCompliance: number  // Beslenme uyum orani (0-1)
  packageProgress: number      // Paket ilerleme orani (0-1)
  streakWeeks: number          // Ardisik hafta serisi
}

export interface RiskResult {
  score: number        // 0-100 (0=risk yok, 100=cok riskli)
  level: 'low' | 'medium' | 'high' | 'critical'
  factors: string[]    // Risk faktorleri aciklamalari
}

export function calculateRiskScore(factors: RiskFactors): RiskResult {
  let score = 0
  const riskFactors: string[] = []

  // Son ders uzakligi (max 35 puan)
  if (factors.lastLessonDaysAgo > 14) {
    score += 35
    riskFactors.push(`${factors.lastLessonDaysAgo} gundur ders yapilmadi`)
  } else if (factors.lastLessonDaysAgo > 7) {
    score += 20
    riskFactors.push(`${factors.lastLessonDaysAgo} gundur ders yapilmadi`)
  } else if (factors.lastLessonDaysAgo > 3) {
    score += 10
  }

  // Katilim orani (max 25 puan)
  if (factors.attendanceRate < 0.3) {
    score += 25
    riskFactors.push('Katilim orani cok dusuk')
  } else if (factors.attendanceRate < 0.5) {
    score += 15
    riskFactors.push('Katilim orani dusuk')
  } else if (factors.attendanceRate < 0.7) {
    score += 8
  }

  // Beslenme uyumu (max 20 puan)
  if (factors.nutritionCompliance < 0.3) {
    score += 20
    riskFactors.push('Beslenme uyumu cok dusuk')
  } else if (factors.nutritionCompliance < 0.5) {
    score += 12
  }

  // Paket ilerleme (max 10 puan)
  if (factors.packageProgress > 0.9) {
    score += 10
    riskFactors.push('Paket bitmek uzere')
  } else if (factors.packageProgress > 0.75) {
    score += 5
  }

  // Seri bonus (negatif risk - max -10)
  if (factors.streakWeeks >= 4) {
    score = Math.max(0, score - 10)
  } else if (factors.streakWeeks >= 2) {
    score = Math.max(0, score - 5)
  }

  score = Math.min(100, Math.max(0, score))

  const level: RiskResult['level'] =
    score >= 70 ? 'critical' :
    score >= 45 ? 'high' :
    score >= 20 ? 'medium' : 'low'

  return { score, level, factors: riskFactors }
}
```

**Step 2: ClientDetail overview tab'a risk skoru karti ekle**

`ClientDetail.tsx`'in overview tab'inda (satir ~431) risk skoru karti ekle:

```tsx
// Overview tab icinde, hasFeatureAccess(plan, 'risk_score') kontrolu ile:
{hasFeatureAccess(plan, 'risk_score') && riskResult && (
  <div className="rounded-xl border border-border p-5 bg-surface">
    <h3 className="text-sm font-semibold text-text-primary mb-3">Risk Skoru</h3>
    <div className="flex items-center gap-4">
      <div className={`text-3xl font-bold ${
        riskResult.level === 'critical' ? 'text-danger' :
        riskResult.level === 'high' ? 'text-warning' :
        riskResult.level === 'medium' ? 'text-yellow-500' : 'text-success'
      }`}>
        {riskResult.score}
      </div>
      <div>
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
          riskResult.level === 'critical' ? 'bg-danger/10 text-danger' :
          riskResult.level === 'high' ? 'bg-warning/10 text-warning' :
          riskResult.level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
          'bg-success/10 text-success'
        }`}>
          {riskResult.level === 'critical' ? 'Kritik' :
           riskResult.level === 'high' ? 'Yuksek' :
           riskResult.level === 'medium' ? 'Orta' : 'Dusuk'}
        </span>
        {riskResult.factors.length > 0 && (
          <ul className="mt-2 space-y-1">
            {riskResult.factors.map((f, i) => (
              <li key={i} className="text-xs text-text-tertiary">• {f}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  </div>
)}
```

Risk faktorlerini ClientDetail icinde hesapla (mevcut lessons, mealLogs, packages verisinden).

**Step 3: Commit**
```bash
git add src/lib/risk-score.ts src/app/\(trainer\)/dashboard/clients/\[id\]/ClientDetail.tsx
git commit -m "feat: add risk score calculation and display (Elite)"
```

---

## Task 11: Instagram Paylasim Karti (Elite)

**Files:**
- Create: `src/components/shared/InstagramCard.tsx`
- Modify: `src/app/(trainer)/dashboard/clients/[id]/ClientDetail.tsx` (measurements tab'a ekle)

**Step 1: Instagram karti component'i olustur**

Canvas API ile ilerleme karti olustur (download edilebilir PNG):

```tsx
'use client'

import { useRef, useCallback } from 'react'
import { Measurement } from '@/lib/types'

interface Props {
  clientName: string
  measurements: Measurement[]
  trainerName?: string
}

export default function InstagramCard({ clientName, measurements, trainerName }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateCard = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || measurements.length < 2) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 1080
    canvas.height = 1080

    // Arka plan gradient
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1080)
    gradient.addColorStop(0, '#111827')
    gradient.addColorStop(1, '#1f2937')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 1080, 1080)

    // Baslik
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 48px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('ILERLEME RAPORU', 540, 100)

    // Danisan adi
    ctx.font = 'bold 36px system-ui'
    ctx.fillStyle = '#a78bfa'
    ctx.fillText(clientName, 540, 160)

    // Olcumler (ilk ve son)
    const first = measurements[measurements.length - 1]
    const last = measurements[0]

    const metrics = [
      { label: 'Kilo', before: first.weight, after: last.weight, unit: 'kg' },
      { label: 'Gogus', before: first.chest, after: last.chest, unit: 'cm' },
      { label: 'Bel', before: first.waist, after: last.waist, unit: 'cm' },
      { label: 'Kol', before: first.arm, after: last.arm, unit: 'cm' },
      { label: 'Yag %', before: first.body_fat_pct, after: last.body_fat_pct, unit: '%' },
    ].filter(m => m.before != null && m.after != null)

    let y = 260
    metrics.forEach((metric) => {
      const diff = (metric.after! - metric.before!).toFixed(1)
      const sign = Number(diff) > 0 ? '+' : ''
      const color = metric.label === 'Kilo' || metric.label === 'Bel' || metric.label === 'Yag %'
        ? (Number(diff) < 0 ? '#4ade80' : '#f87171')
        : (Number(diff) > 0 ? '#4ade80' : '#f87171')

      ctx.font = '28px system-ui'
      ctx.fillStyle = '#9ca3af'
      ctx.textAlign = 'left'
      ctx.fillText(metric.label, 100, y)

      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'
      ctx.fillText(`${metric.before} ${metric.unit}`, 450, y)

      ctx.fillText('→', 580, y)

      ctx.fillText(`${metric.after} ${metric.unit}`, 710, y)

      ctx.fillStyle = color
      ctx.font = 'bold 28px system-ui'
      ctx.textAlign = 'right'
      ctx.fillText(`${sign}${diff}`, 980, y)

      y += 70
    })

    // Tarih araligi
    ctx.font = '24px system-ui'
    ctx.fillStyle = '#6b7280'
    ctx.textAlign = 'center'
    const startDate = new Date(first.date).toLocaleDateString('tr-TR')
    const endDate = new Date(last.date).toLocaleDateString('tr-TR')
    ctx.fillText(`${startDate} - ${endDate}`, 540, 900)

    // Trainer + Megin
    if (trainerName) {
      ctx.font = '22px system-ui'
      ctx.fillStyle = '#a78bfa'
      ctx.fillText(`PT: ${trainerName}`, 540, 960)
    }

    ctx.font = 'bold 20px system-ui'
    ctx.fillStyle = '#4b5563'
    ctx.fillText('MEGIN', 540, 1010)

    // Indir
    const link = document.createElement('a')
    link.download = `${clientName}-ilerleme.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [clientName, measurements, trainerName])

  if (measurements.length < 2) return null

  return (
    <>
      <canvas ref={canvasRef} className="hidden" />
      <button
        onClick={generateCard}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        Instagram Karti Olustur
      </button>
    </>
  )
}
```

**Step 2: ClientDetail measurements tab'a ekle**

```tsx
// Measurements tab icinde, hasFeatureAccess(plan, 'instagram_card') ile:
{hasFeatureAccess(plan, 'instagram_card') && measurements.length >= 2 && (
  <InstagramCard
    clientName={client.full_name}
    measurements={measurements}
    trainerName={trainerName}
  />
)}
```

**Step 3: Commit**
```bash
git add src/components/shared/InstagramCard.tsx src/app/\(trainer\)/dashboard/clients/\[id\]/ClientDetail.tsx
git commit -m "feat: add Instagram sharing card (Elite) - canvas-based progress image"
```

---

## Task 12: Finans Tahmini (Elite)

**Files:**
- Create: `src/lib/finance-forecast.ts`
- Modify: `src/app/(trainer)/dashboard/finance/page.tsx`

**Step 1: Finans tahmini hesaplama**

```typescript
// src/lib/finance-forecast.ts

interface MonthlyRevenue {
  month: string       // YYYY-MM
  total: number       // TL
  paid: number
  pending: number
}

export interface ForecastResult {
  nextMonth: number
  nextThreeMonths: number
  trend: 'up' | 'down' | 'stable'
  trendPercent: number
  churnRisk: number          // Paket yenilememe riski (0-100)
  avgRevenuePerClient: number
}

export function calculateForecast(
  monthlyData: MonthlyRevenue[],
  activeClientCount: number
): ForecastResult {
  if (monthlyData.length === 0) {
    return {
      nextMonth: 0,
      nextThreeMonths: 0,
      trend: 'stable',
      trendPercent: 0,
      churnRisk: 0,
      avgRevenuePerClient: 0,
    }
  }

  // Son 3 ayin ortalamasi
  const recent = monthlyData.slice(0, 3)
  const avgRevenue = recent.reduce((sum, m) => sum + m.total, 0) / recent.length

  // Trend hesapla (son 3 ay vs onceki 3 ay)
  const older = monthlyData.slice(3, 6)
  const olderAvg = older.length > 0
    ? older.reduce((sum, m) => sum + m.total, 0) / older.length
    : avgRevenue

  const trendPercent = olderAvg > 0
    ? ((avgRevenue - olderAvg) / olderAvg) * 100
    : 0

  const trend: ForecastResult['trend'] =
    trendPercent > 5 ? 'up' :
    trendPercent < -5 ? 'down' : 'stable'

  // Tahmin (basit linear)
  const nextMonth = Math.round(avgRevenue * (1 + trendPercent / 100))
  const nextThreeMonths = Math.round(nextMonth * 3)

  // Odenmemis oran = churn riski
  const pendingRate = recent.reduce((sum, m) => sum + m.pending, 0) /
    Math.max(1, recent.reduce((sum, m) => sum + m.total, 0))
  const churnRisk = Math.round(pendingRate * 100)

  const avgRevenuePerClient = activeClientCount > 0
    ? Math.round(avgRevenue / activeClientCount)
    : 0

  return {
    nextMonth,
    nextThreeMonths,
    trend,
    trendPercent: Math.round(trendPercent),
    churnRisk,
    avgRevenuePerClient,
  }
}
```

**Step 2: Finans sayfasina tahmin kartlari ekle**

Finance page'in alt kismina (FeatureGate icinde zaten):

```tsx
{hasFeatureAccess(plan, 'finance_forecast') && forecast && (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
    <div className="rounded-xl border border-border p-5 bg-surface">
      <p className="text-sm text-text-secondary">Gelecek Ay Tahmini</p>
      <p className="text-2xl font-bold text-text-primary mt-1">
        {forecast.nextMonth.toLocaleString('tr-TR')} TL
      </p>
      <span className={`text-xs font-medium ${
        forecast.trend === 'up' ? 'text-success' :
        forecast.trend === 'down' ? 'text-danger' : 'text-text-tertiary'
      }`}>
        {forecast.trend === 'up' ? '↑' : forecast.trend === 'down' ? '↓' : '→'}
        {' '}{Math.abs(forecast.trendPercent)}% trend
      </span>
    </div>
    <div className="rounded-xl border border-border p-5 bg-surface">
      <p className="text-sm text-text-secondary">3 Aylik Tahmin</p>
      <p className="text-2xl font-bold text-text-primary mt-1">
        {forecast.nextThreeMonths.toLocaleString('tr-TR')} TL
      </p>
      <p className="text-xs text-text-tertiary mt-1">
        Danisan basi ort: {forecast.avgRevenuePerClient.toLocaleString('tr-TR')} TL/ay
      </p>
    </div>
    <div className="rounded-xl border border-border p-5 bg-surface">
      <p className="text-sm text-text-secondary">Tahsilat Riski</p>
      <p className={`text-2xl font-bold mt-1 ${
        forecast.churnRisk > 30 ? 'text-danger' :
        forecast.churnRisk > 15 ? 'text-warning' : 'text-success'
      }`}>
        %{forecast.churnRisk}
      </p>
      <p className="text-xs text-text-tertiary mt-1">Odenmemis oran</p>
    </div>
  </div>
)}
```

**Step 3: Commit**
```bash
git add src/lib/finance-forecast.ts src/app/\(trainer\)/dashboard/finance/
git commit -m "feat: add finance forecast cards (Elite)"
```

---

## Task 13: Upgrade Sayfasini Guncelle

**Files:**
- Modify: `src/app/(trainer)/dashboard/upgrade/UpgradeClient.tsx`

**Step 1: Yeni ozellik listesini guncelle**

UpgradeClient icindeki `ALL_FEATURES` mapping'ini yeni paket dagitimina gore guncelle. Ozellikle:
- Takvim -> Elite
- Blog -> Elite
- Rozet -> Pro
- Hedef Belirleme -> Pro
- PDF Export -> Pro
- Risk Skoru -> Elite
- Instagram Karti -> Elite
- Finans Tahmini -> Elite
- `fitness_tools` kaldir
- `blog` ekle (Elite)
- `calendar` ekle (Elite)

**Step 2: Commit**
```bash
git add src/app/\(trainer\)/dashboard/upgrade/UpgradeClient.tsx
git commit -m "feat: update upgrade page with new feature distribution"
```

---

## Task 14: Temizlik

**Files:**
- Modify: `src/lib/tour.ts` — Tour step'lerindeki `lockedFeature` degerlerini yeni plana gore guncelle
- Modify: `src/components/shared/Sidebar.tsx` — Blog menu item'ini ekle (feature: 'blog')

**Step 1: Tour guncelle**

```typescript
// Client tour'daki badges step'i artik Pro'da acik:
{
  key: 'explore_badges',
  title: 'Rozetlerini Kesfet',
  lockedFeature: 'badges', // Free'de kapali, Pro+'da acik
}
```

**Step 2: Commit**
```bash
git add src/lib/tour.ts src/components/shared/Sidebar.tsx
git commit -m "chore: update tour steps and sidebar for new plan distribution"
```

---

## Uygulama Sirasi

1. **Task 1** — plans.ts guncelle (temel)
2. **Task 2** — FeatureGate component (altyapi)
3. **Task 3** — Sidebar gating (trainer UI)
4. **Task 4** — Client layout + navbar gating (client UI)
5. **Task 5** — Trainer sayfalari gate (finance, notifications, takvim)
6. **Task 6** — Client sayfalari gate (beslenme, rozetler, haftalik-ozet)
7. **Task 7** — ClientDetail tabs gate (photos, dependents, nutrition)
8. **Task 8** — Cron job filtreleme (free plan)
9. **Task 9** — Blog sistemi (migration + sayfalar)
10. **Task 10** — Risk skoru
11. **Task 11** — Instagram karti
12. **Task 12** — Finans tahmini
13. **Task 13** — Upgrade sayfasi guncelle
14. **Task 14** — Temizlik + tour guncelle
