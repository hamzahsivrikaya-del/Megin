# Notification System Upgrade — hamza-web-site → Megin Entegrasyonu

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Megin'e eksik 6 bildirim özelliğini hamza-web-site'den port ederek tam çalışan push notification sistemi kurmak.

**Architecture:** Service Worker + Web Manifest ile PWA push desteği, safeCompare ile güvenli cron auth, takvim/ders CRUD sonrası notification API çağrısı, günlük motivasyon mesajları, saat kontrolü + dedup, eğitmene beslenme özeti.

**Tech Stack:** web-push (mevcut), Next.js API routes, Service Worker API

---

## Task 1: safeCompare utility + Cron auth güçlendirme

**Files:**
- Create: `src/lib/auth-utils.ts`
- Modify: `src/app/api/cron/badge-notify/route.ts`
- Modify: `src/app/api/cron/check-packages/route.ts`
- Modify: `src/app/api/cron/nutrition-reminder/route.ts`
- Modify: `src/app/api/cron/weekly-report/route.ts`

**Step 1:** `src/lib/auth-utils.ts` oluştur:

```typescript
import { timingSafeEqual } from 'crypto'

export function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return timingSafeEqual(Buffer.from(a), Buffer.from(b))
}
```

**Step 2:** Tüm cron route'larda `verifyCronSecret` fonksiyonunu güncelle:

```typescript
import { safeCompare } from '@/lib/auth-utils'

function verifyCronSecret(request: NextRequest): boolean {
  const auth = request.headers.get('authorization') || ''
  return safeCompare(auth, `Bearer ${process.env.CRON_SECRET}`)
}
```

**Step 3:** Commit

---

## Task 2: Service Worker + Web Manifest + PWA Icons

**Files:**
- Create: `public/sw.js`
- Create: `public/manifest.json`
- Copy: `public/icons/icon-192.png` ve `public/icons/icon-512.png` (hamza-web-site'den)
- Modify: `src/app/layout.tsx` (manifest link)

**Step 1:** `public/sw.js` oluştur:

```javascript
const CACHE_NAME = 'megin-v1'

const STATIC_ASSETS = [
  '/',
  '/login',
  '/manifest.json',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/') || event.request.url.includes('supabase')) return
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return response
      })
      .catch(() => caches.match(event.request))
  )
})

self.addEventListener('push', (event) => {
  if (!event.data) return
  const data = event.data.json()
  event.waitUntil(
    self.registration.showNotification(data.title || 'Megin', {
      body: data.body || data.message || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url: data.url || '/dashboard' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      return self.clients.openWindow(url)
    })
  )
})
```

**Step 2:** `public/manifest.json` oluştur:

```json
{
  "name": "Megin — Personal Trainer Platformu",
  "short_name": "Megin",
  "description": "Kişisel antrenör platformu",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#FAFAFA",
  "theme_color": "#DC2626",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

**Step 3:** Icon'ları kopyala:

```bash
mkdir -p public/icons
cp /Users/hamzasivrikaya/Projects/hamza-web-site/public/icons/icon-192.png public/icons/
cp /Users/hamzasivrikaya/Projects/hamza-web-site/public/icons/icon-512.png public/icons/
```

**Step 4:** `src/app/layout.tsx` head'e manifest link ekle:

```html
<link rel="manifest" href="/manifest.json" />
```

**Step 5:** Commit

---

## Task 3: ServiceWorkerRegistration component

**Files:**
- Create: `src/components/shared/ServiceWorkerRegistration.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/api/push/subscribe/route.ts` (keys format desteği ekle)

**Step 1:** `src/components/shared/ServiceWorkerRegistration.tsx` oluştur:

```typescript
'use client'

import { useEffect } from 'react'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

async function saveSubscription(subscription: PushSubscription) {
  const { endpoint, keys } = subscription.toJSON() as {
    endpoint: string
    keys: { p256dh: string; auth: string }
  }

  await fetch('/api/push/subscribe', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint, p256dh: keys.p256dh, auth: keys.auth }),
  })
}

async function subscribeToPush(registration: ServiceWorkerRegistration) {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  if (!vapidPublicKey) return

  const existing = await registration.pushManager.getSubscription()
  if (existing) {
    await saveSubscription(existing)
    return
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as unknown as ArrayBuffer,
  })

  await saveSubscription(subscription)
}

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.register('/sw.js').then(async (registration) => {
      if ('Notification' in window && Notification.permission === 'granted') {
        await subscribeToPush(registration)
      }
    }).catch(() => {})
  }, [])

  return null
}
```

**Step 2:** `src/app/layout.tsx` body'ye ekle:

```tsx
import ServiceWorkerRegistration from '@/components/shared/ServiceWorkerRegistration'
// ...
<body>
  {children}
  <ServiceWorkerRegistration />
  {/* Clarity script */}
</body>
```

**Step 3:** Commit

---

## Task 4: Nutrition Reminder — Günlük motivasyon mesajları + saat kontrolü + dedup

**Files:**
- Modify: `src/app/api/cron/nutrition-reminder/route.ts`

**Değişiklikler:**
1. 7 günlük motivasyon mesajları (her gün farklı)
2. Saat kontrolü: sadece 06:00-10:00 UTC (TR 09:00-13:00)
3. Tekrar önleme: bugün zaten gönderildiyse skip
4. Tüm aktif paketli danışanlara gönder (kayıt girip girmemesine bakmaksızın — motivasyon mesajı olduğu için)

**Tam yeni dosya içeriği plan'da belirtilecek — hamza-web-site'deki DAILY_MESSAGES array'i ve saat/dedup kontrolleri adapte edilecek, Megin multi-tenant yapısına uyarlanacak.**

**Step 1:** route.ts'i güncelle, **Step 2:** Commit

---

## Task 5: Weekly Report — Saat kontrolü + tekrar önleme

**Files:**
- Modify: `src/app/api/cron/weekly-report/route.ts`

**Değişiklikler:**
1. Saat kontrolü: 11:00-19:00 UTC (TR 14:00-22:00)
2. Tekrar önleme: bu hafta zaten üretildiyse skip

**Step 1:** GET handler başına saat kontrolü + dedup ekle, **Step 2:** Commit

---

## Task 6: Takvim/Ders Bildirim API

**Files:**
- Create: `src/app/api/calendar-notify/route.ts`
- Modify: `src/app/(trainer)/dashboard/takvim/LessonModal.tsx` (onSave sonrası notify call)

**API route hamza-web-site'dekine benzer:** urgent/batch mode, ders ekleme/güncelleme/silme için farklı mesajlar, Megin multi-tenant yapısına uygun (trainer session auth).

**LessonModal.tsx:** handleSave ve handleDelete sonrası `/api/calendar-notify` POST çağrısı.

**Step 1:** API route oluştur, **Step 2:** LessonModal'a notify ekle, **Step 3:** Commit

---

## Task 7: Admin (Eğitmen) Beslenme Özeti Cron

**Files:**
- Create: `src/app/api/cron/trainer-nutrition-summary/route.ts`

**Her eğitmene kendi danışanlarının günlük beslenme durumunu özetle gönder:** "3/5 üye beslenme girdi — Girenler: X, Y, Z — Girmeyenler: A, B"

**Step 1:** Route oluştur, **Step 2:** Commit

---

## Sıralama

Task 1 → 2 → 3 → 4 → 5 → 6 → 7 (sıralı, her biri bir öncekine bağımlı olabilir)
