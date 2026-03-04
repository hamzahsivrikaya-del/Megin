# Takvim Bildirim Sistemi — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Admin takvimden ders ekle/düzenle/sildiğinde üyelere akıllı bildirim gönder (30dk debounce toplu + ≤24 saat acil).

**Architecture:** Client-side debounce ile değişiklikler biriktirilir, `/api/calendar-notify` endpoint'ine gönderilir. Endpoint üye bazlı gruplar, notifications tablosuna yazar ve push gönderir. ≤24 saat kuralı client'ta kontrol edilir.

**Tech Stack:** Next.js API route, Supabase (notifications + push_subscriptions), sendPushNotification helper, client-side setTimeout debounce.

---

### Task 1: Migration — Yeni bildirim tiplerini ekle

**Files:**
- Create: `supabase/migrations/047_lesson_notification_types.sql`
- Modify: `src/lib/types.ts:159`

**Step 1: Migration dosyası oluştur**

```sql
-- Takvim bildirim tipleri
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'low_lessons', 'weekly_report', 'inactive', 'manual',
    'nutrition_reminder', 'badge_earned',
    'admin_nutrition_summary', 'admin_measurement', 'admin_low_lessons',
    'lesson_scheduled', 'lesson_updated', 'lesson_cancelled'
  ));
```

**Step 2: TypeScript tipini güncelle**

`src/lib/types.ts:159` — NotificationType'a 3 yeni tip ekle:

```typescript
export type NotificationType = 'low_lessons' | 'weekly_report' | 'inactive' | 'manual' | 'nutrition_reminder' | 'badge_earned' | 'admin_nutrition_summary' | 'admin_measurement' | 'admin_low_lessons' | 'lesson_scheduled' | 'lesson_updated' | 'lesson_cancelled'
```

**Step 3: Migration'ı push et**

```bash
npx supabase db push --linked
```

**Step 4: Commit**

```bash
git add supabase/migrations/047_lesson_notification_types.sql src/lib/types.ts
git commit -m "feat: takvim bildirim tipleri — lesson_scheduled/updated/cancelled"
```

---

### Task 2: API Endpoint — /api/calendar-notify

**Files:**
- Create: `src/app/api/calendar-notify/route.ts`

**Step 1: Endpoint oluştur**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPushNotification } from '@/lib/push'

interface LessonChange {
  type: 'create' | 'update' | 'delete'
  userId: string
  memberName: string
  date: string
  startTime: string
  oldDate?: string
  oldStartTime?: string
  duration: number
}

interface RequestBody {
  mode: 'urgent' | 'batch'
  changes: LessonChange[]
}

const DAYS_TR = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
const MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']

function formatDateTR(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getDate()} ${MONTHS_TR[d.getMonth()]} ${DAYS_TR[d.getDay()]}`
}

function buildUrgentMessage(change: LessonChange): { title: string; message: string; notifType: string } {
  if (change.type === 'delete') {
    return {
      title: 'Ders İptali',
      message: `${formatDateTR(change.date)} ${change.startTime} dersiniz iptal edildi. Detaylar için antrenörünüzle iletişime geçin.`,
      notifType: 'lesson_cancelled',
    }
  }
  if (change.type === 'update') {
    const parts: string[] = []
    if (change.oldStartTime && change.oldStartTime !== change.startTime) {
      parts.push(`${change.oldStartTime}'den ${change.startTime}'e taşındı`)
    }
    if (change.oldDate && change.oldDate !== change.date) {
      parts.push(`${formatDateTR(change.date)}'e taşındı`)
    }
    return {
      title: 'Ders Değişikliği',
      message: parts.length > 0
        ? `Dersiniz ${parts.join(', ')}.`
        : `${formatDateTR(change.date)} ${change.startTime} dersinde değişiklik yapıldı.`,
      notifType: 'lesson_updated',
    }
  }
  // create — acil ekleme (24 saat içinde)
  return {
    title: 'Yeni Ders',
    message: `${formatDateTR(change.date)} ${change.startTime}'de dersiniz var.`,
    notifType: 'lesson_scheduled',
  }
}

function buildBatchMessage(changes: LessonChange[]): { title: string; message: string; notifType: string } {
  const creates = changes.filter(c => c.type === 'create')
  const updates = changes.filter(c => c.type === 'update')
  const deletes = changes.filter(c => c.type === 'delete')

  // Sadece ekleme varsa detaylı liste
  if (creates.length > 0 && updates.length === 0 && deletes.length === 0) {
    const list = creates
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
      .map(c => {
        const d = new Date(c.date + 'T00:00:00')
        return `${DAYS_TR[d.getDay()].slice(0, 3)} ${c.startTime}`
      })
      .join(', ')
    return {
      title: 'Ders Programı',
      message: `Bu hafta ${creates.length} dersin planlandı: ${list}`,
      notifType: 'lesson_scheduled',
    }
  }

  // Karışık değişiklikler
  const parts: string[] = []
  if (creates.length > 0) parts.push(`${creates.length} ders eklendi`)
  if (updates.length > 0) parts.push(`${updates.length} ders güncellendi`)
  if (deletes.length > 0) parts.push(`${deletes.length} ders iptal edildi`)

  return {
    title: 'Ders Programı Güncellendi',
    message: `Programında değişiklik: ${parts.join(', ')}. Dashboard'undan kontrol et.`,
    notifType: creates.length >= updates.length && creates.length >= deletes.length
      ? 'lesson_scheduled'
      : updates.length >= deletes.length ? 'lesson_updated' : 'lesson_cancelled',
  }
}

export async function POST(req: NextRequest) {
  // Auth kontrolü — sadece admin
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body: RequestBody = await req.json()
  const { mode, changes } = body

  if (!changes || changes.length === 0) {
    return NextResponse.json({ ok: true })
  }

  const admin = createAdminClient()

  // Üye bazlı grupla
  const byUser = new Map<string, LessonChange[]>()
  for (const c of changes) {
    const arr = byUser.get(c.userId) || []
    arr.push(c)
    byUser.set(c.userId, arr)
  }

  // Her üye için bildirim oluştur
  for (const [userId, userChanges] of byUser) {
    let title: string
    let message: string
    let notifType: string

    if (mode === 'urgent') {
      // Acil modda her değişiklik için ayrı mesaj (genelde tek değişiklik)
      const result = buildUrgentMessage(userChanges[0])
      title = result.title
      message = result.message
      notifType = result.notifType
    } else {
      const result = buildBatchMessage(userChanges)
      title = result.title
      message = result.message
      notifType = result.notifType
    }

    // DB'ye kaydet
    await admin.from('notifications').insert({
      user_id: userId,
      type: notifType,
      title,
      message,
    })

    // Push gönder
    await sendPushNotification({
      userIds: [userId],
      title,
      message,
      url: '/dashboard',
    })
  }

  return NextResponse.json({ ok: true, notified: byUser.size })
}
```

**Step 2: Commit**

```bash
git add src/app/api/calendar-notify/route.ts
git commit -m "feat: calendar-notify API — toplu ve acil ders bildirimi"
```

---

### Task 3: CalendarClient — Debounce mantığı

**Files:**
- Modify: `src/app/(admin)/admin/takvim/CalendarClient.tsx`
- Modify: `src/app/(admin)/admin/takvim/LessonModal.tsx`

**Step 1: LessonModal'a change callback ekle**

`LessonModal.tsx` — `onSave` prop'unu `onSave(change: LessonChange)` olarak güncelle.

`handleSave` fonksiyonunda, DB işlemi başarılı olduktan sonra change bilgisini döndür:

```typescript
// LessonModalProps interface'ine ekle:
onSave: (change: LessonChange) => void

// LessonChange export et (dosya başına ekle):
export interface LessonChange {
  type: 'create' | 'update' | 'delete'
  userId: string
  memberName: string
  date: string
  startTime: string
  oldDate?: string
  oldStartTime?: string
  duration: number
}
```

`handleSave` fonksiyonu create başarılıysa:
```typescript
onSave({
  type: 'create',
  userId: memberId,
  memberName: selectedMember?.fullName || '',
  date,
  startTime: time,
  duration: Number(duration),
})
```

Edit başarılıysa:
```typescript
onSave({
  type: 'update',
  userId: event.extendedProps.userId,
  memberName: event.extendedProps.memberName,
  date,
  startTime: time,
  oldDate: event.extendedProps.date,
  oldStartTime: event.extendedProps.startTime || undefined,
  duration: Number(duration),
})
```

`handleDelete` başarılıysa:
```typescript
onSave({
  type: 'delete',
  userId: event!.extendedProps.userId,
  memberName: event!.extendedProps.memberName,
  date: event!.extendedProps.date,
  startTime: event!.extendedProps.startTime || '10:00',
  duration: event!.extendedProps.duration || 60,
})
```

**Step 2: CalendarClient'a debounce sistemi ekle**

`CalendarClient.tsx` — `handleModalSave` fonksiyonunu güncelle:

```typescript
// State ekle:
const pendingChangesRef = useRef<LessonChange[]>([])
const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

const DEBOUNCE_MS = 30 * 60 * 1000 // 30 dakika
const URGENT_HOURS = 24

function isUrgent(change: LessonChange): boolean {
  const now = new Date()
  const lessonDate = new Date(change.date + 'T' + change.startTime)
  const diffMs = lessonDate.getTime() - now.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  // ≤24 saat içindeki ders veya geçmiş ders
  return diffHours <= URGENT_HOURS
}

async function sendNotifications(mode: 'urgent' | 'batch', changes: LessonChange[]) {
  if (changes.length === 0) return
  try {
    await fetch('/api/calendar-notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, changes }),
    })
  } catch {
    // Push başarısız olsa bile ana akışı bozmayalım
  }
}

function flushPendingChanges() {
  if (pendingChangesRef.current.length === 0) return
  const changes = [...pendingChangesRef.current]
  pendingChangesRef.current = []
  sendNotifications('batch', changes)
}

function handleModalSave(change: LessonChange) {
  setModalOpen(false)
  setSelectedEvent(null)
  fetchLessons()

  // Acil mi kontrol et
  if (isUrgent(change)) {
    sendNotifications('urgent', [change])
    return
  }

  // Toplu birikime ekle
  pendingChangesRef.current.push(change)

  // Debounce timer sıfırla
  if (debounceTimerRef.current) {
    clearTimeout(debounceTimerRef.current)
  }
  debounceTimerRef.current = setTimeout(flushPendingChanges, DEBOUNCE_MS)
}

// Sayfa terk edilince biriken bildirimleri gönder
useEffect(() => {
  function handleBeforeUnload() {
    if (pendingChangesRef.current.length > 0) {
      const data = JSON.stringify({
        mode: 'batch',
        changes: pendingChangesRef.current,
      })
      navigator.sendBeacon('/api/calendar-notify', new Blob([data], { type: 'application/json' }))
      pendingChangesRef.current = []
    }
  }

  window.addEventListener('beforeunload', handleBeforeUnload)
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
    // Component unmount'ta da flush
    flushPendingChanges()
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
  }
}, [])
```

**Step 3: LessonModal onSave prop'unu bağla**

```tsx
<LessonModal
  ...
  onSave={handleModalSave}
/>
```

**Step 4: Build kontrol**

```bash
npx next build 2>&1 | tail -10
```

**Step 5: Commit**

```bash
git add src/app/(admin)/admin/takvim/CalendarClient.tsx src/app/(admin)/admin/takvim/LessonModal.tsx
git commit -m "feat: takvim bildirim debounce — 30dk toplu + 24 saat acil"
```

---

### Task 4: sendBeacon auth sorunu — API'de fallback

**Files:**
- Modify: `src/app/api/calendar-notify/route.ts`

**Sorun:** `navigator.sendBeacon` cookie gönderir ama Supabase auth header'ı olmayabilir.

**Step 1: API'de beacon fallback ekle**

`route.ts`'de auth kontrolünü güncelle — beacon'dan gelen isteklerde cookie'den session kontrol et. Mevcut `createClient()` + `getSession()` zaten cookie-based çalışıyor, ek işlem gerekmez.

Ancak `sendBeacon` POST body'si `Blob` olarak gider, `Content-Type` header'ı olmayabilir. Bunu handle et:

```typescript
// route.ts başındaki body parse kısmını güncelle:
export async function POST(req: NextRequest) {
  // Auth kontrolü — sadece admin
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ... geri kalanı aynı
```

**Not:** `sendBeacon` ile gönderilen `Blob` content-type'ı `application/json` olarak set ediliyor (Task 3'te), Next.js `req.json()` bunu parse eder. Ek işlem gerekmez.

**Step 2: Test et — build kontrol**

```bash
npx next build 2>&1 | tail -10
```

---

### Task 5: Deploy & Test

**Step 1: Preview deploy**

```bash
npx vercel 2>&1 | tail -5
```

**Step 2: Preview linki Telegram'a gönder**

```bash
curl -s -X POST "https://api.telegram.org/bot8772165410:AAGdIm8MPL9ZL05Piz7fxlHlHIfGMiQUU6I/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{"chat_id": 7705344733, "text": "🔔 Takvim Bildirim Testi:\n<PREVIEW_URL>/admin/takvim"}'
```

**Step 3: Test senaryoları**

1. **Toplu test:** Bir üyeye 3 ders ekle → 30dk bekle → tek bildirim gelmeli
2. **Acil test:** Yarınki bir dersin saatini değiştir → anında bildirim gelmeli
3. **Silme test:** Yarınki dersi sil → anında iptal bildirimi gelmeli
4. **Sayfa terk:** 2 ders ekle, sayfadan çık → beacon ile bildirim gitmeli

**Step 4: Başarılıysa production deploy**

```bash
npx vercel --prod
```

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat: takvim bildirim sistemi — 30dk debounce + acil bildirim"
```
