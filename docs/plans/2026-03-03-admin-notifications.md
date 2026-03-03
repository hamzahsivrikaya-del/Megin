# Admin Bildirim Sistemi Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Antrenöre (admin) üye aksiyonları hakkında push bildirim göndermek — beslenme durumu (3 saatte bir), ölçüm girişi (anlık), paket uyarısı (ders eklendiğinde).

**Architecture:** Mevcut `notifications` tablosu + `sendPushNotification()` altyapısı kullanılarak admin user_id'sine bildirim kaydedilir ve push gönderilir. Beslenme durumu için yeni cron endpoint, ölçüm için yeni server action, paket için mevcut action'a ekleme. Admin sidebar'a NotificationBell eklenir, bildirim sayfasına "Bildirimlerim" sekmesi eklenir.

**Tech Stack:** Next.js 16, Supabase (pg_cron + pg_net), web-push (VAPID), TypeScript

---

## Bağlam & Konvansiyonlar

- **Admin user:** `role = 'admin'` olan kullanıcı. Admin user_id'yi almak için: `supabase.from('users').select('id').eq('role', 'admin').single()`
- **Push pattern:** `sendPushNotification({ userIds, title, message, url })` — `src/lib/push.ts`
- **Bildirim kayıt:** `supabase.from('notifications').insert({ user_id, type, title, message })`
- **Cron auth:** `Bearer ${process.env.CRON_SECRET}` + `safeCompare()`
- **Timezone:** Türkiye = UTC+3. Cron saatleri UTC'de: 07:00, 10:00, 13:00, 16:00 (TR 10-13-16-19)
- **Server component'te** `getSession()` kullan, `getUser()` ASLA
- **Ölçüm kaydı:** Şu an `MeasurementForm.tsx` client-side insert yapıyor, server action yok

---

### Task 1: Migration — Yeni bildirim tipleri + cron job'lar

**Files:**
- Create: `supabase/migrations/044_admin_notification_types_and_cron.sql`
- Modify: `src/lib/types.ts:157`

**Step 1: Migration dosyası oluştur**

```sql
-- 1) Yeni admin bildirim tiplerini CHECK constraint'e ekle
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'low_lessons', 'weekly_report', 'inactive', 'manual',
    'nutrition_reminder', 'badge_earned',
    'admin_nutrition_summary', 'admin_measurement', 'admin_low_lessons'
  ));

-- 2) Admin beslenme durum cron job'lari (4x/gun: 07:00, 10:00, 13:00, 16:00 UTC = TR 10-13-16-19)
SELECT cron.schedule(
  'admin-nutrition-summary-10',
  '0 7 * * *',
  $$
  SELECT net.http_get(
    url := 'https://hamzasivrikaya.com/api/cron/admin-nutrition-summary',
    headers := jsonb_build_object(
      'Authorization', 'Bearer nY51nHFHOzt+hLx0zdqAXxltyHH3rWHrTefX0sdkJfs='
    )
  );
  $$
);

SELECT cron.schedule(
  'admin-nutrition-summary-13',
  '0 10 * * *',
  $$
  SELECT net.http_get(
    url := 'https://hamzasivrikaya.com/api/cron/admin-nutrition-summary',
    headers := jsonb_build_object(
      'Authorization', 'Bearer nY51nHFHOzt+hLx0zdqAXxltyHH3rWHrTefX0sdkJfs='
    )
  );
  $$
);

SELECT cron.schedule(
  'admin-nutrition-summary-16',
  '0 13 * * *',
  $$
  SELECT net.http_get(
    url := 'https://hamzasivrikaya.com/api/cron/admin-nutrition-summary',
    headers := jsonb_build_object(
      'Authorization', 'Bearer nY51nHFHOzt+hLx0zdqAXxltyHH3rWHrTefX0sdkJfs='
    )
  );
  $$
);

SELECT cron.schedule(
  'admin-nutrition-summary-19',
  '0 16 * * *',
  $$
  SELECT net.http_get(
    url := 'https://hamzasivrikaya.com/api/cron/admin-nutrition-summary',
    headers := jsonb_build_object(
      'Authorization', 'Bearer nY51nHFHOzt+hLx0zdqAXxltyHH3rWHrTefX0sdkJfs='
    )
  );
  $$
);
```

**Step 2: types.ts güncelle**

`src/lib/types.ts` satır 157'deki `NotificationType`'a yeni tipleri ekle:

```ts
export type NotificationType = 'low_lessons' | 'weekly_report' | 'inactive' | 'manual' | 'nutrition_reminder' | 'badge_earned' | 'admin_nutrition_summary' | 'admin_measurement' | 'admin_low_lessons'
```

**Step 3: Migration'ı push et**

```bash
npx supabase db push --linked
```

**Step 4: Commit**

```bash
git add supabase/migrations/044_admin_notification_types_and_cron.sql src/lib/types.ts
git commit -m "feat: admin bildirim tipleri + beslenme durum cron job'ları"
```

---

### Task 2: Admin bildirim helper fonksiyonu

**Files:**
- Create: `src/lib/admin-notify.ts`

**Step 1: Helper oluştur**

Admin'e bildirim göndermeyi tekrar etmemek için tek fonksiyon:

```ts
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPushNotification } from '@/lib/push'
import type { NotificationType } from '@/lib/types'

/**
 * Admin kullaniciya bildirim gonder (DB + push)
 */
export async function notifyAdmin({
  type,
  title,
  message,
  url = '/admin/notifications',
}: {
  type: NotificationType
  title: string
  message: string
  url?: string
}) {
  const admin = createAdminClient()

  // Admin user_id'yi bul
  const { data: adminUser } = await admin
    .from('users')
    .select('id')
    .eq('role', 'admin')
    .single()

  if (!adminUser) return

  // DB'ye kaydet
  await admin.from('notifications').insert({
    user_id: adminUser.id,
    type,
    title,
    message,
  })

  // Push gonder
  await sendPushNotification({
    userIds: [adminUser.id],
    title,
    message,
    url,
  })
}
```

**Step 2: Commit**

```bash
git add src/lib/admin-notify.ts
git commit -m "feat: admin bildirim helper fonksiyonu"
```

---

### Task 3: Beslenme durum cron endpoint'i

**Files:**
- Create: `src/app/api/cron/admin-nutrition-summary/route.ts`

**Step 1: Endpoint oluştur**

```ts
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notifyAdmin } from '@/lib/admin-notify'
import { safeCompare } from '@/lib/auth-utils'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization') || ''
  const expected = `Bearer ${process.env.CRON_SECRET}`
  if (!safeCompare(authHeader, expected)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const admin = createAdminClient()

  // Turkiye tarihi
  const turkeyNow = new Date(Date.now() + 3 * 60 * 60 * 1000)
  const todayStr = turkeyNow.toISOString().slice(0, 10)
  const turkeyHour = turkeyNow.getHours()

  // Tum aktif uyeleri al (bagli uyeler haric)
  const { data: members } = await admin
    .from('users')
    .select('id, full_name')
    .eq('role', 'member')
    .eq('is_active', true)
    .is('parent_id', null)

  if (!members || members.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 })
  }

  // Bugunun beslenme kayitlarini al (is_extra haric)
  const { data: mealLogs } = await admin
    .from('meal_logs')
    .select('user_id')
    .eq('date', todayStr)
    .eq('is_extra', false)

  // Giris yapan unique uye ID'leri
  const loggedUserIds = new Set((mealLogs || []).map(l => l.user_id))

  const entered = members.filter(m => loggedUserIds.has(m.id))
  const notEntered = members.filter(m => !loggedUserIds.has(m.id))

  const total = members.length
  const enteredCount = entered.length

  // Mesaj olustur
  let message = `${enteredCount}/${total} üye beslenme girdi.`

  if (entered.length > 0) {
    const names = entered.map(m => m.full_name).join(', ')
    message += `\nGirenler: ${names}`
  }

  if (notEntered.length > 0) {
    const names = notEntered.map(m => m.full_name).join(', ')
    message += `\nGirmeyenler: ${names}`
  }

  await notifyAdmin({
    type: 'admin_nutrition_summary',
    title: `Beslenme Durumu (${String(turkeyHour).padStart(2, '0')}:00)`,
    message,
    url: '/admin/notifications',
  })

  return NextResponse.json({ ok: true, entered: enteredCount, total })
}
```

**Step 2: Commit**

```bash
git add src/app/api/cron/admin-nutrition-summary/route.ts
git commit -m "feat: admin beslenme durum cron endpoint'i (4x/gün)"
```

---

### Task 4: Ölçüm girişinde admin'e anlık bildirim

**Files:**
- Create: `src/app/(admin)/admin/measurements/new/actions.ts`
- Modify: `src/app/(admin)/admin/measurements/new/MeasurementForm.tsx`

**Step 1: Server action oluştur**

`MeasurementForm.tsx` şu an client-side insert yapıyor. Ölçüm kaydından sonra çağrılacak bir server action ekle:

```ts
'use server'

import { notifyAdmin } from '@/lib/admin-notify'
import { createAdminClient } from '@/lib/supabase/admin'

export async function notifyAdminMeasurement(userId: string) {
  const admin = createAdminClient()

  // Uye adini al
  const { data: user } = await admin
    .from('users')
    .select('full_name')
    .eq('id', userId)
    .single()

  if (!user) return

  // Son olcumu al
  const { data: measurement } = await admin
    .from('measurements')
    .select('weight')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(1)
    .single()

  const weightText = measurement?.weight ? `: ${measurement.weight} kg` : ''

  await notifyAdmin({
    type: 'admin_measurement',
    title: 'Yeni Ölçüm',
    message: `${user.full_name} yeni ölçüm girdi${weightText}`,
    url: '/admin/notifications',
  })
}
```

**Step 2: MeasurementForm.tsx'de action'ı çağır**

`MeasurementForm.tsx`'deki `handleSubmit` fonksiyonunda başarılı insert'ten sonra, `router.refresh()`'ten önce ekle:

```ts
import { notifyAdminMeasurement } from './actions'

// handleSubmit icinde, basarili insert'ten sonra:
notifyAdminMeasurement(selectedUser) // await etmeye gerek yok, fire-and-forget
```

**Step 3: Commit**

```bash
git add "src/app/(admin)/admin/measurements/new/actions.ts" "src/app/(admin)/admin/measurements/new/MeasurementForm.tsx"
git commit -m "feat: ölçüm girişinde admin'e anlık bildirim"
```

---

### Task 5: Paket uyarısında admin'e bildirim

**Files:**
- Modify: `src/app/(admin)/admin/lessons/new/actions.ts`

**Step 1: Mevcut sendLowLessonPush'a admin bildirimi ekle**

`actions.ts`'de `sendLowLessonPush` fonksiyonuna admin bildirim ekle. Bu fonksiyon zaten üyeye push gönderiyor, admin'e de göndereceğiz:

```ts
import { notifyAdmin } from '@/lib/admin-notify'

export async function sendLowLessonPush(userId: string, remaining: number) {
  // Mevcut uye push kodu aynen kalsin...

  // Admin'e de bildir
  const admin = createAdminClient()
  const { data: user } = await admin
    .from('users')
    .select('full_name')
    .eq('id', userId)
    .single()

  if (user) {
    await notifyAdmin({
      type: 'admin_low_lessons',
      title: 'Paket Uyarısı',
      message: `${user.full_name}'${remaining === 1 ? 'in son dersi kaldı' : `in ${remaining} dersi kaldı`}`,
      url: '/admin/notifications',
    })
  }
}
```

**Not:** `sendPushNotification` ve `createAdminClient` import'larını kontrol et, eksikse ekle.

**Step 2: Commit**

```bash
git add "src/app/(admin)/admin/lessons/new/actions.ts"
git commit -m "feat: paket uyarısında admin'e de bildirim"
```

---

### Task 6: Sidebar'a NotificationBell ekleme

**Files:**
- Modify: `src/components/shared/Sidebar.tsx`

**Step 1: Sidebar'a okunmamış bildirim sayacı ekle**

Sidebar'daki "Bildirimler" menü item'ına okunmamış bildirim sayısını gösteren badge ekle. Admin'in kendi bildirimlerini sayacak:

```tsx
// Sidebar.tsx'de state ve effect ekle:
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

// Component icinde:
const [unreadCount, setUnreadCount] = useState(0)

useEffect(() => {
  const supabase = createClient()

  async function fetchUnread() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user?.id) return

    const { count } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .eq('is_read', false)

    setUnreadCount(count || 0)
  }

  fetchUnread()
  const interval = setInterval(fetchUnread, 60_000)
  return () => clearInterval(interval)
}, [])
```

Bildirimler menü item'ının yanına badge ekle:

```tsx
{item.label}
{item.href === '/admin/notifications' && unreadCount > 0 && (
  <span className="ml-auto bg-primary text-white text-xs font-medium rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
    {unreadCount > 9 ? '9+' : unreadCount}
  </span>
)}
```

**Step 2: Commit**

```bash
git add src/components/shared/Sidebar.tsx
git commit -m "feat: sidebar bildirimler menüsüne okunmamış sayacı"
```

---

### Task 7: Admin bildirim sayfasına "Bildirimlerim" sekmesi

**Files:**
- Modify: `src/app/(admin)/admin/notifications/page.tsx`
- Modify: `src/app/(admin)/admin/notifications/NotificationsManager.tsx`

**Step 1: Server page'de admin bildirimlerini de çek**

`page.tsx`'de admin'in kendi bildirimlerini ayrıca sorgula:

```tsx
// Mevcut sorgudan sonra:
const { data: { session } } = await supabase.auth.getSession()
const adminUserId = session?.user?.id || ''

const { data: adminNotifications } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', adminUserId)
  .order('sent_at', { ascending: false })
  .limit(50)
```

`NotificationsManager`'a yeni prop olarak geçir:

```tsx
<NotificationsManager
  initialNotifications={notifications || []}
  members={activeMembers || []}
  adminNotifications={adminNotifications || []}
  adminUserId={adminUserId}
/>
```

**Step 2: NotificationsManager'a tab sistemi ekle**

İki sekme: "Gönder" (mevcut) ve "Bildirimlerim" (yeni). Component'in başına tab state ekle:

```tsx
const [activeTab, setActiveTab] = useState<'send' | 'mine'>('mine')
```

Tab header:

```tsx
<div className="flex gap-1 bg-surface-hover rounded-lg p-1 mb-6">
  <button
    onClick={() => setActiveTab('mine')}
    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
      activeTab === 'mine'
        ? 'bg-surface text-text-primary shadow-sm'
        : 'text-text-secondary hover:text-text-primary'
    }`}
  >
    Bildirimlerim
    {unreadAdminCount > 0 && (
      <span className="ml-2 bg-primary text-white text-xs rounded-full px-1.5 py-0.5">
        {unreadAdminCount}
      </span>
    )}
  </button>
  <button
    onClick={() => setActiveTab('send')}
    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
      activeTab === 'send'
        ? 'bg-surface text-text-primary shadow-sm'
        : 'text-text-secondary hover:text-text-primary'
    }`}
  >
    Gönder
  </button>
</div>
```

"Bildirimlerim" sekmesi: admin bildirimlerini listele (en yeniden eskiye), okunmamışları otomatik okundu işaretle:

```tsx
{activeTab === 'mine' && (
  <div className="space-y-2">
    {myNotifications.length === 0 ? (
      <p className="text-sm text-text-secondary text-center py-8">Henüz bildirim yok</p>
    ) : (
      myNotifications.map((n) => (
        <div
          key={n.id}
          className={`p-3 rounded-lg border ${
            n.is_read ? 'border-border bg-surface' : 'border-primary/20 bg-primary/5'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{n.title}</p>
              <p className="text-sm text-text-secondary mt-0.5 whitespace-pre-line">{n.message}</p>
            </div>
            <span className="text-xs text-text-secondary whitespace-nowrap">
              {formatTimeAgo(n.sent_at)}
            </span>
          </div>
        </div>
      ))
    )}
  </div>
)}
```

"Bildirimlerim" sekmesi açıldığında okunmamışları okundu olarak işaretle:

```tsx
useEffect(() => {
  if (activeTab !== 'mine') return
  const unreadIds = myNotifications.filter(n => !n.is_read).map(n => n.id)
  if (unreadIds.length === 0) return

  const supabase = createClient()
  supabase
    .from('notifications')
    .update({ is_read: true })
    .in('id', unreadIds)
    .then(() => {
      setMyNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    })
}, [activeTab])
```

**Bildirim tipi label fonksiyonu** (NotificationsManager'da mevcut olan `typeLabel` fonksiyonuna yeni tipler ekle):

```ts
case 'admin_nutrition_summary': return 'Beslenme Durumu'
case 'admin_measurement': return 'Ölçüm'
case 'admin_low_lessons': return 'Paket Uyarısı'
```

**Step 3: Commit**

```bash
git add "src/app/(admin)/admin/notifications/page.tsx" "src/app/(admin)/admin/notifications/NotificationsManager.tsx"
git commit -m "feat: admin bildirim sayfasına Bildirimlerim sekmesi"
```

---

### Task 8: Final doğrulama ve deploy

**Step 1: Build kontrolü**

```bash
npm run build
```

Hata yoksa devam.

**Step 2: Migration push**

```bash
npx supabase db push --linked
```

**Step 3: Deploy**

```bash
npx vercel --prod
```

**Step 4: Manuel test**

1. Beslenme cron'u test et:
```bash
curl -s "https://hamzasivrikaya.com/api/cron/admin-nutrition-summary" \
  -H "Authorization: Bearer nY51nHFHOzt+hLx0zdqAXxltyHH3rWHrTefX0sdkJfs="
```

2. Admin bildirim sayfasını kontrol et — "Bildirimlerim" sekmesinde beslenme durumu görünmeli
3. Sidebar'da bildirim badge'i görünmeli

**Step 5: Commit (varsa son düzeltmeler)**

```bash
git add -A
git commit -m "feat: admin bildirim sistemi tamamlandı"
```
