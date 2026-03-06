# Bildirim Sistemi Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Trainer'a danisan aksiyonlari hakkinda otomatik bildirimler + danisana devamliligi artiran hatirlatmalar gondermek. Trainer kendi bildirim tercihlerini yonetebilir.

**Architecture:** Mevcut notification + push altyapisi uzerine insa edilir. Yeni `trainer_notification_preferences` tablosu ile trainer bazli toggle. Anlik bildirimler API route'larinda tetiklenir, periyodik bildirimler cron job ile calisir. Danisan bildirimleri sabit — push izni verdiyse hepsini alir.

**Tech Stack:** Next.js API routes, Supabase (admin client), web-push, cron endpoints

---

## Mevcut Altyapi Ozeti

- `notifications` tablosu + `push_subscriptions` tablosu var
- `NotificationBell`, `ServiceWorkerRegistration`, `sw.js` var
- `src/lib/push.ts` (sendPushNotification) var
- 6 cron job zaten calisiyor (nutrition-reminder, trainer-nutrition-summary, admin-nutrition-summary, weekly-report, check-packages, badge-notify)
- Bildirim tipleri: low_lessons, weekly_report, inactive, manual, nutrition_reminder, badge_earned, client_action, lesson_scheduled, lesson_updated, lesson_cancelled, trainer_nutrition_summary

## Yeni Bildirim Tipleri

### Trainer'a giden:
| Tip | Tetiklenme | Aciklama |
|-----|-----------|----------|
| `client_habits_completed` | Aninda | Danisan gunun tum aliskanliklarini tamamladi |
| `client_streak_milestone` | Aninda | Danisan 7, 14, 30 gun streak'e ulasti |
| `client_meal_logged` | Aninda | Danisan ogun fotografini yukledi |
| `client_inactive` | Cron 09:00 | 3+ gundur giris yapmayan danisan |
| `daily_summary` | Cron 21:00 | Gunluk aktivite ozeti |

### Danisana giden:
| Tip | Tetiklenme | Aciklama |
|-----|-----------|----------|
| `habit_reminder` | Cron 20:00 | Bugun tamamlanmamis aliskanliklar var |
| `streak_at_risk` | Cron 21:00 | Serin var ama bugun tamamlamadin |
| `streak_celebration` | Aninda | 7, 14, 30 gune ulastin |
| `program_assigned` | Aninda | Trainer yeni program atadi |

## Olasi Problemler ve Cozumler

### Problem 1: Bildirim spam'i
Trainer'in 20 danisani varsa ve her biri 3 ogun yuklerse = 60 bildirim/gun.
**Cozum:** `client_meal_logged` icin batch: her ogun aninda degil, trainer-nutrition-summary zaten aksamustu topluca bildiriyor. Ogun bildirimini atlayalim, yerine mevcut `trainer_nutrition_summary` cron'unu kullanalim. Trainer bunu kapatabilir.

### Problem 2: last_seen takibi yok
`client_inactive` icin danisanin son giris zamani gerekiyor ama DB'de `last_seen` yok.
**Cozum:** `clients` tablosuna `last_seen_at TIMESTAMPTZ` kolonu ekle. Client layout'ta (her sayfa yuklendiginde) guncelle.

### Problem 3: Streak milestone tespiti
Streak 7'ye ulastiginda bildirim gitmeli ama ayni gun icerisinde birden fazla kez tetiklenmemeli.
**Cozum:** Habit toggle API'sinde streak hesapla, 7/14/30'a esitse ve bugun bu milestone icin bildirim gitmemisse gonder. `data` JSONB'de `{milestone: 7, date: "2026-03-06"}` ile dedup yap.

### Problem 4: "Tum aliskanliklar tamamlandi" tespiti
Her toggle'da kontrol etmek gerekiyor — tamamlanan sayisi = toplam aktif aliskanlik sayisi mi?
**Cozum:** Habit toggle API'sinde (POST action=log) completed toggle'dan sonra bugunun loglarini say, toplam aktif habit sayisiyla karsilastir. Esitse ve bugun bu bildirim gitmemisse trainer'a bildir.

### Problem 5: Cron job zamanlama
Turkiye saat dilimi UTC+3. Cron'lar UTC ile calisir.
- 20:00 TR = 17:00 UTC
- 21:00 TR = 18:00 UTC
- 09:00 TR = 06:00 UTC

### Problem 6: Trainer kendi bildirimlerini almiyor
Mevcut sistemde trainer'a giden bildirimler `user_id` + `trainer_id` ile kaydediliyor.
**Cozum:** Trainer'a bildirim gonderirken `user_id = trainer.user_id` kullan. Mevcut NotificationBell zaten user_id ile sorguluyor.

### Problem 7: Feature gating
Habit bildirimleri habits feature'a, beslenme bildirimleri nutrition feature'a bagli olmali.
**Cozum:** Her bildirim tetiklendiginde trainer'in planini kontrol et (hasFeatureAccess).

### Problem 8: Preferences yoksa varsayilan
Trainer henuz preferences kaydi olusturmamissa ne olacak?
**Cozum:** Preferences tablosunda `DEFAULT true` kullan. Kayit yoksa = hepsi acik kabul et. Tercih kontrolu: `SELECT COALESCE(pref.client_habits_completed, true)`.

---

## Task 1: Migration — trainer_notification_preferences + last_seen_at

**Files:**
- Create: `supabase/migrations/018_notification_preferences.sql`

**Icerik:**

```sql
-- Trainer bildirim tercihleri
CREATE TABLE trainer_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE UNIQUE,
  -- Trainer'a giden
  client_habits_completed BOOLEAN NOT NULL DEFAULT true,
  client_streak_milestone BOOLEAN NOT NULL DEFAULT true,
  client_inactive BOOLEAN NOT NULL DEFAULT true,
  daily_summary BOOLEAN NOT NULL DEFAULT true,
  -- Mevcut olanlari da ekle (toggle icin)
  trainer_nutrition_summary BOOLEAN NOT NULL DEFAULT true,
  low_lessons BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE trainer_notification_preferences ENABLE ROW LEVEL SECURITY;

-- last_seen_at kolonu
ALTER TABLE clients ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

-- Yeni bildirim tipleri
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (
  type IN (
    'low_lessons', 'weekly_report', 'inactive', 'manual',
    'nutrition_reminder', 'badge_earned', 'client_action',
    'lesson_scheduled', 'lesson_updated', 'lesson_cancelled',
    'trainer_nutrition_summary',
    'admin_nutrition_summary', 'admin_measurement', 'admin_low_lessons',
    'client_habits_completed', 'client_streak_milestone',
    'client_inactive', 'daily_summary',
    'habit_reminder', 'streak_at_risk', 'streak_celebration',
    'program_assigned'
  )
);
```

**Verify:** `npx supabase db push` basarili olmali.

---

## Task 2: TypeScript tipleri guncelle

**Files:**
- Modify: `src/lib/types.ts`

**Degisiklikler:**

NotificationType'a yeni tipleri ekle:
```typescript
export type NotificationType =
  | 'low_lessons'
  | 'weekly_report'
  | 'inactive'
  | 'manual'
  | 'nutrition_reminder'
  | 'badge_earned'
  | 'client_action'
  | 'lesson_scheduled'
  | 'lesson_updated'
  | 'lesson_cancelled'
  | 'trainer_nutrition_summary'
  // Yeni trainer bildirimleri
  | 'client_habits_completed'
  | 'client_streak_milestone'
  | 'client_inactive'
  | 'daily_summary'
  // Yeni danisan bildirimleri
  | 'habit_reminder'
  | 'streak_at_risk'
  | 'streak_celebration'
  | 'program_assigned'
```

TrainerNotificationPreferences interface ekle:
```typescript
export interface TrainerNotificationPreferences {
  id: string
  trainer_id: string
  client_habits_completed: boolean
  client_streak_milestone: boolean
  client_inactive: boolean
  daily_summary: boolean
  trainer_nutrition_summary: boolean
  low_lessons: boolean
}
```

---

## Task 3: Trainer bildirim tercihleri helper + API

**Files:**
- Create: `src/lib/trainer-notify.ts`
- Create: `src/app/api/notification-preferences/route.ts`

### trainer-notify.ts

Trainer'a bildirim gondermeden once tercihini kontrol eden helper:

```typescript
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPushNotification } from '@/lib/push'
import { NotificationType } from '@/lib/types'

// Bildirim tipi -> preference kolonu eslestirmesi
const TYPE_TO_PREF: Record<string, string> = {
  client_habits_completed: 'client_habits_completed',
  client_streak_milestone: 'client_streak_milestone',
  client_inactive: 'client_inactive',
  daily_summary: 'daily_summary',
  trainer_nutrition_summary: 'trainer_nutrition_summary',
  low_lessons: 'low_lessons',
}

export async function notifyTrainer({
  trainerId,
  trainerUserId,
  type,
  title,
  message,
  clientId,
  data,
}: {
  trainerId: string
  trainerUserId: string
  type: NotificationType
  title: string
  message: string
  clientId?: string
  data?: Record<string, unknown>
}) {
  const admin = createAdminClient()

  // Tercih kontrolu
  const prefColumn = TYPE_TO_PREF[type]
  if (prefColumn) {
    const { data: pref } = await admin
      .from('trainer_notification_preferences')
      .select(prefColumn)
      .eq('trainer_id', trainerId)
      .maybeSingle()

    // Kayit varsa ve false ise gonderme
    if (pref && pref[prefColumn] === false) return
  }

  // DB'ye kaydet
  await admin.from('notifications').insert({
    user_id: trainerUserId,
    trainer_id: trainerId,
    client_id: clientId || null,
    type,
    title,
    message,
    data: data || null,
  })

  // Push gonder
  await sendPushNotification({
    userIds: [trainerUserId],
    title,
    message,
    url: '/dashboard/notifications',
  })
}
```

### notification-preferences API

GET: Trainer'in mevcut tercihlerini getir
POST: Tercihleri guncelle

```typescript
// GET — mevcut tercihleri getir (yoksa hepsi true varsayilan)
// POST — { key: value } seklinde guncelle, upsert yap
```

---

## Task 4: last_seen_at guncelleme

**Files:**
- Modify: `src/app/(client)/app/layout.tsx`
- Create: `src/app/api/heartbeat/route.ts`

### Yaklasim:
Client layout'ta component mount oldugunda `/api/heartbeat` cagir. Bu endpoint `clients.last_seen_at = now()` yapar.

### heartbeat API:
- POST, auth gerekli
- Client'in `last_seen_at` kolonunu gunceller
- Throttle: son 5 dakika icinde guncellendiyse tekrar guncellemez (gereksiz DB yazimi onlenir)

---

## Task 5: Anlik bildirimler — Habit toggle'da trainer bildirimi

**Files:**
- Modify: `src/app/api/habits/route.ts` (POST action=log icinde)

### Mantik:
1. Habit toggle basarili olduktan sonra
2. Bugunun loglarini say (completed=true)
3. Toplam aktif habit sayisiyla karsilastir
4. Esitse → `client_habits_completed` bildirimi trainer'a (dedup: bugun gitmemisse)
5. Streak hesapla, 7/14/30'a esitse → `client_streak_milestone` bildirimi trainer'a + `streak_celebration` danisana (dedup)

### Dedup kontrolu:
```sql
SELECT id FROM notifications
WHERE trainer_id = $1
  AND type = 'client_habits_completed'
  AND client_id = $2
  AND sent_at::date = CURRENT_DATE
LIMIT 1
```

---

## Task 6: Anlik bildirimler — Program atama bildirimi

**Files:**
- Modify: `src/app/(trainer)/dashboard/clients/[id]/ClientDetail.tsx` veya ilgili API
- Gerekirse: `src/app/api/workouts/route.ts` veya program atama endpoint'i

### Mantik:
Trainer danisana program atadigi anda (save) → danisana `program_assigned` bildirimi gonder.

**Not:** Once program atama flow'unu incelemek lazim — WorkoutManager'da nasil calisiyor.

---

## Task 7: Cron — Habit reminder (20:00 TR)

**Files:**
- Create: `src/app/api/cron/habit-reminder/route.ts`

### Mantik:
1. Auth: CRON_SECRET bearer token
2. Saat kontrolu: 17:00-18:00 UTC (20:00-21:00 TR)
3. Tum aktif danisanlari bul (client_habits.is_active = true, en az 1 habit var)
4. Her danisan icin: bugunun loglarindan completed sayisini al
5. Toplam habit < completed ise → `habit_reminder` bildirimi gonder
6. Dedup: bugun gitmemisse

### Mesaj:
"Bugun [X] aliskanligin tamamlanmadi. Serini korumak icin simdi tamamla!"

---

## Task 8: Cron — Streak at risk (21:00 TR)

**Files:**
- Create: `src/app/api/cron/streak-at-risk/route.ts`

### Mantik:
1. Auth + saat kontrolu: 18:00-19:00 UTC
2. Aktif danisanlari bul (streak > 0 olan)
3. Her danisan icin: bugunun tum habit'leri tamamlanmis mi kontrol et
4. Streak > 0 ama bugun tamamlanmamis → `streak_at_risk` gonder
5. Dedup: bugun gitmemisse

### Mesaj:
"[X] gunluk serin tehlikede! Bugun tum aliskanliklarini tamamla."

---

## Task 9: Cron — Inactive client (09:00 TR)

**Files:**
- Create: `src/app/api/cron/inactive-client/route.ts`

### Mantik:
1. Auth + saat kontrolu: 06:00-07:00 UTC
2. `clients` tablosundan `last_seen_at < NOW() - INTERVAL '3 days'` olanlari bul
3. Her biri icin trainer'ini bul
4. `notifyTrainer()` ile `client_inactive` bildirimi gonder
5. Dedup: son 3 gun icinde ayni danisan icin gitmemisse

### Mesaj:
"[Danisan Adi] 3+ gundur giris yapmadi."

---

## Task 10: Cron — Daily summary (21:00 TR)

**Files:**
- Create: `src/app/api/cron/daily-summary/route.ts`

### Mantik:
1. Auth + saat kontrolu: 18:00-19:00 UTC
2. Tum aktif trainer'lari bul
3. Her trainer icin:
   - Bugun kac danisan habit tamamladi
   - Bugun kac danisan beslenme girdi
   - Aktif streak'i olan danisan sayisi
4. `notifyTrainer()` ile `daily_summary` gonder
5. Dedup: bugun gitmemisse

### Mesaj:
"Gunluk Ozet: [X]/[Y] danisan aliskanlik tamamladi, [Z] danisan beslenme girdi, [W] danisanin aktif serisi var."

---

## Task 11: Trainer Settings — Bildirim tercihleri UI

**Files:**
- Modify: `src/app/(trainer)/dashboard/settings/page.tsx`

### Icerik:
Mevcut settings sayfasina yeni section ekle: "Bildirim Tercihleri"

Toggle listesi:
- Aliskanlik tamamlama bildirimi
- Streak milestone bildirimi
- Inaktif danisan uyarisi
- Gunluk ozet
- Beslenme ozeti
- Ders paketi uyarisi

Her toggle icin label + aciklama + switch. Degisiklikleri aninda `/api/notification-preferences` POST ile kaydet (optimistic update).

---

## Task 12: Client bildirim sayfasi guncelleme

**Files:**
- Modify: `src/app/(client)/app/notifications/page.tsx`

### Icerik:
Yeni bildirim tiplerinin label'larini ekle:
- habit_reminder → "Hatirlatma"
- streak_at_risk → "Seri Uyarisi"
- streak_celebration → "Tebrikler"
- program_assigned → "Yeni Program"

---

## Task Ozeti

| # | Task | Tip | Bagimlilik |
|---|------|-----|-----------|
| 1 | Migration | DB | - |
| 2 | TypeScript tipleri | Kod | 1 |
| 3 | trainer-notify helper + preferences API | Kod | 1, 2 |
| 4 | last_seen_at guncelleme | Kod | 1 |
| 5 | Habit toggle bildirimleri (anlik) | Kod | 2, 3 |
| 6 | Program atama bildirimi (anlik) | Kod | 2 |
| 7 | Habit reminder cron (20:00) | Cron | 2 |
| 8 | Streak at risk cron (21:00) | Cron | 2 |
| 9 | Inactive client cron (09:00) | Cron | 2, 4 |
| 10 | Daily summary cron (21:00) | Cron | 2, 3 |
| 11 | Trainer settings UI | UI | 3 |
| 12 | Client notification labels | UI | 2 |

Siralama: 1 → 2 → 3,4 (paralel) → 5,6,7,8 (paralel) → 9,10 → 11,12 (paralel)
