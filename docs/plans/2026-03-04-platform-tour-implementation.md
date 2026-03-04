# Platform Turu (Onboarding Gezinti) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Onboarding sonrasına platform tanıtım turu ekleyerek kullanıcıları gerçek aksiyonlara yönlendirmek.

**Architecture:** Mevcut onboarding wizard'ları (PT: 7 adım, Üye: 4 adım) tour adımlarıyla genişletilir. Tour state `tour_progress` JSONB kolonu ile DB'de tutulur. Tamamlanmamış adımlar Ayarlar sayfasında checklist olarak görünür. Plan kısıtlı adımlar `plans.ts` → `lockedFeatures` ile kontrol edilir.

**Tech Stack:** Next.js 16 App Router, React 19, Supabase, TypeScript, Tailwind CSS v4

**Design Doc:** `docs/plans/2026-03-04-platform-tour-design.md`

---

### Task 1: DB Migration — tour_progress kolonu

**Files:**
- Create: `supabase/migrations/007_tour_progress.sql`

**Step 1: Migration dosyasını oluştur**

```sql
-- Tour progress tracking
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS tour_progress JSONB DEFAULT NULL;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tour_progress JSONB DEFAULT NULL;

COMMENT ON COLUMN trainers.tour_progress IS 'Platform tour tracking: {completed: string[], skipped: string[], dismissed: boolean}';
COMMENT ON COLUMN clients.tour_progress IS 'Platform tour tracking: {completed: string[], skipped: string[], dismissed: boolean}';
```

**Step 2: Build doğrula**

Run: `cd /Users/hamzasivrikaya/Projects/Megin && npx next build 2>&1 | tail -5`
Expected: Build success (migration dosyası runtime'ı etkilemez)

**Step 3: Commit**

```bash
git add supabase/migrations/007_tour_progress.sql
git commit -m "feat: add tour_progress column to trainers and clients tables"
```

---

### Task 2: Types ve Tour Config

**Files:**
- Modify: `src/lib/types.ts` — TourProgress type ekle
- Create: `src/lib/tour.ts` — Tour adım tanımları ve yardımcı fonksiyonlar

**Step 1: `src/lib/types.ts`'e TourProgress type ekle**

Dosyanın sonuna ekle:

```typescript
// ── Platform Turu ──
export interface TourProgress {
  completed: string[]
  skipped: string[]
  dismissed: boolean
}
```

`Trainer` interface'ine ekle:
```typescript
tour_progress: TourProgress | null
```

`Client` interface'ine ekle:
```typescript
tour_progress: TourProgress | null
```

**Step 2: `src/lib/tour.ts` oluştur**

```typescript
import { SubscriptionPlan } from './types'
import { hasFeatureAccess } from './plans'

export interface TourStep {
  key: string
  title: string
  icon: string
  description: string
  ctaLabel: string
  ctaPath: string
  lockedFeature?: string // plans.ts'teki feature key, varsa plan kontrolü yapılır
}

export const TRAINER_TOUR_STEPS: TourStep[] = [
  {
    key: 'invite_client',
    title: 'Üye Davet Et',
    icon: '👥',
    description: 'Davet linki oluştur, üyenle paylaş. WhatsApp veya kopyala-yapıştır ile gönder.',
    ctaLabel: 'Üye Ekle',
    ctaPath: '/dashboard/clients',
  },
  {
    key: 'create_workout',
    title: 'Antrenman Oluştur',
    icon: '🏋️',
    description: 'Üyene özel antrenman programı oluştur. Egzersiz, set, tekrar belirle.',
    ctaLabel: 'Antrenman Oluştur',
    ctaPath: '/dashboard/workouts',
  },
  {
    key: 'record_measurement',
    title: 'Ölçüm Kaydet',
    icon: '📏',
    description: 'Üyenin kilo, boy ve vücut ölçümlerini takip et.',
    ctaLabel: 'Ölçüm Kaydet',
    ctaPath: '/dashboard/clients',
  },
  {
    key: 'send_notification',
    title: 'Bildirim Gönder',
    icon: '🔔',
    description: 'Üyelerine motivasyon mesajı veya hatırlatma gönder.',
    ctaLabel: 'Pro ile Aç',
    ctaPath: '/dashboard/upgrade',
    lockedFeature: 'push_notifications',
  },
  {
    key: 'complete_profile',
    title: 'Profilini Tamamla',
    icon: '⚙️',
    description: 'Bio, telefon, sosyal medya linklerini ekle. Davet sayfan daha profesyonel görünsün.',
    ctaLabel: 'Ayarlara Git',
    ctaPath: '/dashboard/settings',
  },
]

export const CLIENT_TOUR_STEPS: TourStep[] = [
  {
    key: 'view_profile',
    title: 'Profilini İncele',
    icon: '👤',
    description: 'Ayarlardan fotoğrafını, bilgilerini düzenleyebilirsin.',
    ctaLabel: 'Ayarlara Git',
    ctaPath: '/app/settings',
  },
  {
    key: 'view_measurements',
    title: 'Ölçümlerini Gör',
    icon: '📏',
    description: 'Antrenörünün kaydettiği ölçümlerin burada. Kilo, boy, vücut ölçüleri.',
    ctaLabel: 'Ölçümlere Git',
    ctaPath: '/app/progress',
  },
  {
    key: 'explore_badges',
    title: 'Rozetlerini Keşfet',
    icon: '🏅',
    description: 'Antrenmanlarını tamamladıkça rozetler kazan!',
    ctaLabel: 'Pro ile Aç',
    ctaPath: '/app/rozetler',
    lockedFeature: 'badges',
  },
  {
    key: 'view_progress',
    title: 'İlerleme Sayfan',
    icon: '📊',
    description: 'Genel gelişimini ve istatistiklerini buradan takip et.',
    ctaLabel: 'İlerlemene Bak',
    ctaPath: '/app/progress',
  },
]

/** Adım bu plan için kilitli mi? */
export function isTourStepLocked(step: TourStep, plan: SubscriptionPlan): boolean {
  if (!step.lockedFeature) return false
  return !hasFeatureAccess(plan, step.lockedFeature)
}

/** Tour tamamlandı mı? (tüm adımlar completed veya skipped veya locked) */
export function isTourComplete(
  steps: TourStep[],
  completed: string[],
  skipped: string[],
  plan: SubscriptionPlan
): boolean {
  return steps.every(step =>
    completed.includes(step.key) ||
    skipped.includes(step.key) ||
    isTourStepLocked(step, plan)
  )
}
```

**Step 3: Build doğrula**

Run: `cd /Users/hamzasivrikaya/Projects/Megin && npx next build 2>&1 | tail -5`
Expected: Build success

**Step 4: Commit**

```bash
git add src/lib/types.ts src/lib/tour.ts
git commit -m "feat: add tour types and step definitions"
```

---

### Task 3: Trainer Onboarding — Tour adımlarını ekle

**Files:**
- Modify: `src/app/onboarding/page.tsx`

**Mevcut durum:**
- 7 adımlı wizard (TOTAL_STEPS = 7)
- Step 7 = "Hazırsın!" → `handleComplete()` → trainer record insert → confetti → `/dashboard` redirect

**Yapılacak değişiklikler:**
- TOTAL_STEPS'i 7'den 7 + TRAINER_TOUR_STEPS.length'e çıkar (7+5=12)
- Step 7 ("Hazırsın!") sonrasında "Platformu Tanıyalım" geçiş ekranı (step 8)
- Step 9-12: Tour adımları
- `handleComplete()` step 7'de çalışır (trainer record oluşturulur, onboarding_completed: true)
- Tour adımlarında "Şimdi Dene", "Bu Adımı Atla", "Turu Bitir" butonları
- Tour biterken `tour_progress` DB'ye kaydedilir

**Step 1: Import'ları güncelle**

Dosyanın başına ekle:
```typescript
import { TRAINER_TOUR_STEPS, isTourStepLocked } from '@/lib/tour'
import type { TourProgress } from '@/lib/types'
import type { SubscriptionPlan } from '@/lib/types'
```

**Step 2: TOTAL_STEPS ve tour state ekle**

```typescript
const ONBOARDING_STEPS = 7
const TOUR_INTRO_STEP = ONBOARDING_STEPS + 1 // step 8: "Platformu Tanıyalım"
const TOUR_START = TOUR_INTRO_STEP + 1        // step 9: ilk tour adımı
const TOTAL_STEPS = TOUR_START + TRAINER_TOUR_STEPS.length - 1

// Tour state (component içinde)
const [tourProgress, setTourProgress] = useState<TourProgress>({
  completed: [],
  skipped: [],
  dismissed: false,
})
const [trainerPlan, setTrainerPlan] = useState<SubscriptionPlan>('free')
```

**Step 3: handleComplete() düzenle**

Step 7'de trainer record'u oluşturulduktan sonra confetti göster ama dashboard'a redirect ETME. Bunun yerine step 8'e (Platformu Tanıyalım) geç:

```typescript
const handleComplete = async () => {
  setLoading(true)
  // ... mevcut trainer record insert kodu aynen kalır ...

  if (error) {
    console.error('Onboarding error:', error)
    setLoading(false)
    return
  }

  setShowConfetti(true)
  setTimeout(() => {
    setShowConfetti(false)
    setStep(TOUR_INTRO_STEP) // dashboard yerine tour'a geç
    setLoading(false)
  }, 2500)
}
```

**Step 4: Tour helper fonksiyonları ekle**

```typescript
function getCurrentTourStep() {
  const tourIndex = step - TOUR_START
  return TRAINER_TOUR_STEPS[tourIndex]
}

async function saveTourProgress(progress: TourProgress) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase
    .from('trainers')
    .update({ tour_progress: progress })
    .eq('user_id', user.id)
}

function handleTourSkip() {
  const currentStep = getCurrentTourStep()
  if (!currentStep) return
  const updated = {
    ...tourProgress,
    skipped: [...tourProgress.skipped, currentStep.key],
  }
  setTourProgress(updated)

  if (step >= TOUR_START + TRAINER_TOUR_STEPS.length - 1) {
    // Son adım, turu bitir
    saveTourProgress(updated)
    router.push('/dashboard')
  } else {
    setStep(step + 1)
  }
}

function handleTourTry() {
  const currentStep = getCurrentTourStep()
  if (!currentStep) return
  // Mevcut progress'i kaydet ve sayfaya yönlendir
  saveTourProgress(tourProgress)
  router.push(currentStep.ctaPath)
}

function handleTourDismiss() {
  const updated = { ...tourProgress, dismissed: true }
  saveTourProgress(updated)
  router.push('/dashboard')
}
```

**Step 5: Tour adımları UI — step 8 (Platformu Tanıyalım)**

```tsx
{step === TOUR_INTRO_STEP && (
  <div className="text-center">
    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
      <span className="text-4xl">🗺️</span>
    </div>
    <h1 className="font-display text-4xl font-bold text-text-primary tracking-tight">
      Platformu Tanıyalım
    </h1>
    <p className="mt-4 text-lg text-text-secondary max-w-sm mx-auto">
      Megin&apos;in temel özelliklerini keşfet. Her adımı deneyebilir veya atlayabilirsin.
    </p>
    <Button onClick={() => setStep(TOUR_START)} size="lg" className="mt-8">
      Başlayalım
    </Button>
    <button
      onClick={handleTourDismiss}
      className="block mx-auto mt-4 text-sm text-text-tertiary hover:text-text-secondary transition-colors"
    >
      Turu Atla
    </button>
  </div>
)}
```

**Step 6: Tour adımları UI — step 9-12 (dinamik)**

```tsx
{step >= TOUR_START && step < TOUR_START + TRAINER_TOUR_STEPS.length && (() => {
  const tourStep = getCurrentTourStep()
  if (!tourStep) return null
  const locked = isTourStepLocked(tourStep, trainerPlan)
  return (
    <div className="text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
        <span className="text-4xl">{tourStep.icon}</span>
      </div>
      <h2 className="font-display text-3xl font-bold text-text-primary tracking-tight">
        {tourStep.title}
      </h2>
      <p className="mt-4 text-lg text-text-secondary max-w-sm mx-auto">
        {tourStep.description}
      </p>
      {locked && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm text-amber-700">
          🔒 Bu özellik Pro planıyla açılır
        </div>
      )}
      <div className="mt-8 flex flex-col gap-3 max-w-xs mx-auto">
        <Button onClick={locked ? () => router.push('/dashboard/upgrade') : handleTourTry} size="lg">
          {locked ? 'Pro ile Aç' : tourStep.ctaLabel}
        </Button>
        <button
          onClick={handleTourSkip}
          className="text-sm text-text-tertiary hover:text-text-secondary transition-colors"
        >
          Bu Adımı Atla →
        </button>
      </div>
      <button
        onClick={handleTourDismiss}
        className="block mx-auto mt-6 text-xs text-text-tertiary/60 hover:text-text-tertiary transition-colors"
      >
        Turu Bitir
      </button>
    </div>
  )
})()}
```

**Step 7: Progress bar güncelle**

Mevcut progress bar TOTAL_STEPS kullanıyor — otomatik olarak tour adımlarını da kapsayacak. Tour adımlarının progress'te farklı renkte gösterilmesi opsiyonel (basic halde aynı renk yeterli).

**Step 8: nextStep fonksiyonunu güncelle**

```typescript
const nextStep = () => {
  if (step === ONBOARDING_STEPS) {
    handleComplete() // step 7'de trainer kaydı oluştur
  } else if (step >= TOUR_START + TRAINER_TOUR_STEPS.length - 1) {
    // Son tour adımı
    saveTourProgress(tourProgress)
    router.push('/dashboard')
  } else {
    setStep(step + 1)
  }
}
```

**Step 9: Build doğrula**

Run: `cd /Users/hamzasivrikaya/Projects/Megin && npx next build 2>&1 | tail -5`
Expected: Build success

**Step 10: Commit**

```bash
git add src/app/onboarding/page.tsx
git commit -m "feat: add platform tour steps to trainer onboarding"
```

---

### Task 4: Client Onboarding — Tour adımlarını ekle

**Files:**
- Modify: `src/app/(client)/app/onboarding/page.tsx`

**Mevcut durum:**
- 4 adımlı wizard (step 0-3)
- Step 3 = "Hazırsın!" → `completeOnboarding()` → clients update → confetti → `/app` redirect

**Yapılacak değişiklikler:**
- Onboarding bittikten sonra (step 3 tamamlanınca) tour adımlarına geçiş
- Step 4: "Platformu Tanıyalım" intro
- Step 5-8: CLIENT_TOUR_STEPS (4 adım)
- `completeOnboarding()` step 3'te çalışır (onboarding_completed: true) ama redirect ETMEz
- Tour sonunda `/app`'e yönlendir

**Step 1: Import'ları ekle**

```typescript
import { CLIENT_TOUR_STEPS, isTourStepLocked } from '@/lib/tour'
import type { TourProgress, SubscriptionPlan } from '@/lib/types'
```

**Step 2: Sabitleri ve state'leri ekle**

```typescript
const ONBOARDING_STEPS = 4 // 0-3
const TOUR_INTRO_STEP = ONBOARDING_STEPS   // step 4
const TOUR_START = TOUR_INTRO_STEP + 1      // step 5
const TOTAL_STEPS = TOUR_START + CLIENT_TOUR_STEPS.length // toplam adım sayısı

const [tourProgress, setTourProgress] = useState<TourProgress>({
  completed: [],
  skipped: [],
  dismissed: false,
})
const [clientPlan, setClientPlan] = useState<SubscriptionPlan>('free')
```

**Step 3: completeOnboarding() düzenle**

Mevcut redirect yerine tour intro'ya geç:

```typescript
async function completeOnboarding() {
  setSaving(true)
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  let avatarUrl: string | null = null
  if (avatarFile) {
    avatarUrl = await uploadAvatar(user.id)
  }

  const updateData: Record<string, unknown> = {
    onboarding_completed: true,
  }
  if (fullName.trim()) updateData.full_name = fullName.trim()
  if (avatarUrl) updateData.avatar_url = avatarUrl
  if (selectedGoal) updateData.fitness_goal = selectedGoal

  await supabase
    .from('clients')
    .update(updateData)
    .eq('user_id', user.id)

  // Antrenörün planını öğren (kilitli adımlar için)
  const { data: client } = await supabase
    .from('clients')
    .select('trainer_id')
    .eq('user_id', user.id)
    .single()

  if (client) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('trainer_id', client.trainer_id)
      .eq('status', 'active')
      .maybeSingle()
    if (sub) setClientPlan(sub.plan as SubscriptionPlan)
  }

  setShowConfetti(true)
  setTimeout(() => {
    setShowConfetti(false)
    setStep(TOUR_INTRO_STEP) // /app yerine tour'a geç
    setSaving(false)
  }, 2500)
}
```

**Step 4: Tour helper fonksiyonları ekle**

```typescript
function getCurrentTourStep() {
  const tourIndex = step - TOUR_START
  return CLIENT_TOUR_STEPS[tourIndex]
}

async function saveTourProgress(progress: TourProgress) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase
    .from('clients')
    .update({ tour_progress: progress })
    .eq('user_id', user.id)
}

function handleTourSkip() {
  const currentStep = getCurrentTourStep()
  if (!currentStep) return
  const updated = {
    ...tourProgress,
    skipped: [...tourProgress.skipped, currentStep.key],
  }
  setTourProgress(updated)

  if (step >= TOUR_START + CLIENT_TOUR_STEPS.length - 1) {
    saveTourProgress(updated)
    router.push('/app')
  } else {
    setStep(step + 1)
  }
}

function handleTourTry() {
  const currentStep = getCurrentTourStep()
  if (!currentStep) return
  saveTourProgress(tourProgress)
  router.push(currentStep.ctaPath)
}

function handleTourDismiss() {
  const updated = { ...tourProgress, dismissed: true }
  saveTourProgress(updated)
  router.push('/app')
}
```

**Step 5: Tour intro ve adım UI ekle**

Step 3 ("Hazırsın!") sonraki adımlar olarak Tour Intro (step 4) ve Tour adımları (step 5-8) eklenir. Trainer onboarding'deki aynı pattern kullanılır — sadece `TRAINER_TOUR_STEPS` → `CLIENT_TOUR_STEPS`, `trainerPlan` → `clientPlan`, redirect hedefi `/dashboard` → `/app`.

**Step 6: Progress bar ve navigation güncelle**

Mevcut progress bar steps.map ile 4 adım gösteriyor — TOTAL_STEPS'e göre güncelle. Navigation butonları tour adımlarında farklı (Şimdi Dene / Bu Adımı Atla / Turu Bitir).

**Step 7: Build doğrula**

Run: `cd /Users/hamzasivrikaya/Projects/Megin && npx next build 2>&1 | tail -5`
Expected: Build success

**Step 8: Commit**

```bash
git add src/app/(client)/app/onboarding/page.tsx
git commit -m "feat: add platform tour steps to client onboarding"
```

---

### Task 5: Trainer Settings — Platform Rehberi bölümü

**Files:**
- Modify: `src/app/(trainer)/dashboard/settings/page.tsx`

**Yapılacak:**
- Mevcut bölümlerin altına "Platform Rehberi" kartı ekle
- Trainer'ın `tour_progress`'ini DB'den oku
- Her adım için tamamlanma durumunu hesapla:
  - `invite_client`: `clients` tablosunda kayıt var mı?
  - `create_workout`: `workouts` tablosunda kayıt var mı?
  - `record_measurement`: `measurements` tablosunda kayıt var mı?
  - `send_notification`: Plan kontrolü (locked?)
  - `complete_profile`: `bio` veya `phone` dolu mu?
- Tamamlanmış adımlar ✅, bekleyenler ◻️ [→ Git], kilitliler 🔒 [Pro ile Aç]
- Tüm adımlar tamamlanırsa "Tebrikler!" mesajı
- İlerleme barı: "2/5 tamamlandı"

**Step 1: Import ekle**

```typescript
import { TRAINER_TOUR_STEPS, isTourStepLocked } from '@/lib/tour'
import type { TourProgress, SubscriptionPlan } from '@/lib/types'
```

**Step 2: Tour completion state ekle**

Component içinde:
```typescript
const [tourStepStatus, setTourStepStatus] = useState<Record<string, boolean>>({})
const [tourProgress, setTourProgress] = useState<TourProgress | null>(null)
const [trainerPlan, setTrainerPlan] = useState<SubscriptionPlan>('free')
```

**Step 3: useEffect ile tour durumunu hesapla**

```typescript
useEffect(() => {
  async function checkTourStatus() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: trainer } = await supabase
      .from('trainers')
      .select('id, tour_progress, bio, phone')
      .eq('user_id', user.id)
      .single()
    if (!trainer) return

    setTourProgress(trainer.tour_progress as TourProgress | null)

    // Aktif plan
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('trainer_id', trainer.id)
      .eq('status', 'active')
      .maybeSingle()
    const plan = (sub?.plan || 'free') as SubscriptionPlan
    setTrainerPlan(plan)

    // Gerçek aksiyonları kontrol et
    const [clients, workouts, measurements] = await Promise.all([
      supabase.from('clients').select('id').eq('trainer_id', trainer.id).limit(1),
      supabase.from('workouts').select('id').eq('trainer_id', trainer.id).limit(1),
      supabase.from('measurements').select('id').eq('trainer_id', trainer.id).limit(1),
    ])

    setTourStepStatus({
      invite_client: (clients.data?.length ?? 0) > 0,
      create_workout: (workouts.data?.length ?? 0) > 0,
      record_measurement: (measurements.data?.length ?? 0) > 0,
      send_notification: false, // plan kontrolü ayrı
      complete_profile: !!(trainer.bio || trainer.phone),
    })
  }
  checkTourStatus()
}, [])
```

**Step 4: Platform Rehberi UI**

Mevcut bölümlerin altına (Şifre Değiştir'den sonra) ekle:

```tsx
{/* Platform Rehberi */}
{tourProgress && !tourProgress.dismissed && (
  <Card>
    <CardHeader>
      <CardTitle>Platform Rehberi</CardTitle>
    </CardHeader>
    <div className="p-4 pt-0 space-y-3">
      {(() => {
        const completedCount = TRAINER_TOUR_STEPS.filter(s =>
          tourStepStatus[s.key] || isTourStepLocked(s, trainerPlan)
        ).length
        return (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-text-secondary mb-2">
              <span>İlerleme</span>
              <span>{completedCount}/{TRAINER_TOUR_STEPS.length} tamamlandı</span>
            </div>
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(completedCount / TRAINER_TOUR_STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        )
      })()}
      {TRAINER_TOUR_STEPS.map(step => {
        const locked = isTourStepLocked(step, trainerPlan)
        const completed = tourStepStatus[step.key]
        return (
          <div key={step.key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
            <div className="flex items-center gap-3">
              <span className="text-lg">
                {locked ? '🔒' : completed ? '✅' : '◻️'}
              </span>
              <span className={`text-sm ${completed ? 'text-text-tertiary line-through' : 'text-text-primary'}`}>
                {step.title}
              </span>
            </div>
            {!completed && (
              <Link
                href={locked ? '/dashboard/upgrade' : step.ctaPath}
                className="text-xs text-primary hover:text-primary/80 font-medium"
              >
                {locked ? 'Pro ile Aç' : '→ Git'}
              </Link>
            )}
          </div>
        )
      })}
    </div>
  </Card>
)}
```

**Step 5: Build doğrula**

Run: `cd /Users/hamzasivrikaya/Projects/Megin && npx next build 2>&1 | tail -5`
Expected: Build success

**Step 6: Commit**

```bash
git add src/app/(trainer)/dashboard/settings/page.tsx
git commit -m "feat: add Platform Rehberi checklist to trainer settings"
```

---

### Task 6: Client Settings — Platform Rehberi bölümü

**Files:**
- Modify: `src/app/(client)/app/settings/page.tsx`

**Yapılacak:**
Trainer settings ile aynı pattern, farklılıklar:
- `CLIENT_TOUR_STEPS` kullanılır
- Tamamlanma: Sayfa ziyareti bazlı (tour_progress.completed array'inden kontrol)
- Kilitli adımlar: Antrenörün planına göre (`subscriptions` tablosundan trainer'ın planını çek)

**Step 1: Import'ları ekle**

```typescript
import { CLIENT_TOUR_STEPS, isTourStepLocked } from '@/lib/tour'
import type { TourProgress, SubscriptionPlan } from '@/lib/types'
```

**Step 2: Tour state ekle**

```typescript
const [tourProgress, setTourProgress] = useState<TourProgress | null>(null)
const [clientPlan, setClientPlan] = useState<SubscriptionPlan>('free')
```

**Step 3: useEffect ile oku**

Mevcut profil yükleme useEffect'ine ekle veya ayrı useEffect:

```typescript
useEffect(() => {
  async function loadTourProgress() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: client } = await supabase
      .from('clients')
      .select('tour_progress, trainer_id')
      .eq('user_id', user.id)
      .single()
    if (!client) return

    setTourProgress(client.tour_progress as TourProgress | null)

    // Antrenörün planı
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('trainer_id', client.trainer_id)
      .eq('status', 'active')
      .maybeSingle()
    if (sub) setClientPlan(sub.plan as SubscriptionPlan)
  }
  loadTourProgress()
}, [])
```

**Step 4: Platform Rehberi UI**

Aynı Card pattern, `CLIENT_TOUR_STEPS` ile. Üye tarafında tamamlanma = `tourProgress.completed` array'inde key var mı:

```tsx
const isStepCompleted = (key: string) => tourProgress?.completed?.includes(key) ?? false
```

**Step 5: Sayfa ziyareti tracking**

Üye tarafında tour adımları sayfa ziyareti bazlı. Her sayfa yüklendiğinde (progress, rozetler, settings) tour_progress güncellenmeli. Bu tracking'i ilgili sayfalara eklemek yerine, basit bir approach: Settings sayfasında Platform Rehberi'ndeki "→ Git" linkine tıklayınca `tour_progress.completed`'a ekle.

```typescript
async function markTourStepComplete(key: string) {
  if (!tourProgress || tourProgress.completed.includes(key)) return
  const updated = {
    ...tourProgress,
    completed: [...tourProgress.completed, key],
  }
  setTourProgress(updated)
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('clients').update({ tour_progress: updated }).eq('user_id', user.id)
}
```

Link'e onClick ekle:
```tsx
<Link
  href={step.ctaPath}
  onClick={() => markTourStepComplete(step.key)}
  className="text-xs text-primary hover:text-primary/80 font-medium"
>
  → Git
</Link>
```

**Step 6: Build doğrula**

Run: `cd /Users/hamzasivrikaya/Projects/Megin && npx next build 2>&1 | tail -5`
Expected: Build success

**Step 7: Commit**

```bash
git add src/app/(client)/app/settings/page.tsx
git commit -m "feat: add Platform Rehberi checklist to client settings"
```

---

### Task 7: Final Build & Doğrulama

**Step 1: Tam build**

Run: `cd /Users/hamzasivrikaya/Projects/Megin && npx next build 2>&1 | tail -20`
Expected: Build success, no TypeScript errors

**Step 2: Kontrol listesi**
- [ ] Migration dosyası oluşturuldu (007_tour_progress.sql)
- [ ] TourProgress type eklendi
- [ ] Tour step tanımları oluşturuldu (tour.ts)
- [ ] Trainer onboarding tour adımları eklendi (step 8-12)
- [ ] Client onboarding tour adımları eklendi (step 4-8)
- [ ] Trainer settings'te Platform Rehberi var
- [ ] Client settings'te Platform Rehberi var
- [ ] Kilitli adımlar plan kontrolü ile gösteriliyor
- [ ] "Turu Bitir" / "Bu Adımı Atla" çalışıyor
- [ ] Build başarılı
