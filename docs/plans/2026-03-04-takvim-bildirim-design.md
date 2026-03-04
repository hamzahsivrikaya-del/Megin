# Takvim Bildirim Sistemi

> Tarih: 2026-03-04
> Durum: Onaylandı, implementasyon bekliyor

---

## Problem

Admin takvimden ders eklediğinde/düzenlediğinde/sildiğinde üyeye bildirim gitmiyor. Ayrıca toplu ders girişinde her işlem için ayrı bildirim göndermek kötü deneyim yaratır.

## Çözüm

İki katmanlı bildirim sistemi: toplu planlama için 30dk debounce, acil değişiklikler için anında bildirim.

---

## Kurallar

### Kural 1 — Toplu Planlama (30dk debounce)
- Admin takvimde işlem yapar (ekle/düzenle/sil)
- Değişiklikler client-side'da biriktirilir
- Son işlemden **30 dakika** sonra her üyeye tek toplu bildirim gider
- Üye bazlı gruplama: her üye sadece kendi derslerini görür

### Kural 2 — Acil Bildirim (≤24 saat)
- Değiştirilen/silinen ders **24 saat içindeyse** → debounce atlanır
- **Anında** bildirim gider
- Toplu birikimden çıkarılır (duplike bildirim önleme)

---

## Bildirim Mesajları

| Durum | Örnek Mesaj |
|-------|-------------|
| Toplu ekleme | "Bu hafta 3 dersin planlandı: Pzt 10:00, Çar 14:00, Cum 16:00" |
| Toplu karışık (ekleme+güncelleme) | "Ders programında değişiklik: 2 ders eklendi, 1 ders güncellendi" |
| Acil saat değişikliği | "Yarınki dersin 11:00'den 12:00'ye taşındı" |
| Acil tarih değişikliği | "Yarınki 14:00 dersin 6 Mart Perşembe'ye taşındı" |
| Acil silme | "5 Mart Çarşamba 14:00 dersiniz iptal edildi. Detaylar için antrenörünüzle iletişime geçin." |

---

## Teknik Tasarım

### Client-side (CalendarClient.tsx)

```
pendingChanges = Map<userId, Change[]>
debounceTimer = null (30dk setTimeout)

Her ders işleminde:
  1. DB'ye kaydet (mevcut LessonModal mantığı)
  2. Dersin tarihi ≤24 saat mi kontrol et
     → Evet: Anında API çağrısı → /api/calendar-notify (acil mod)
     → Hayır: pendingChanges'a ekle, debounce timer'ı sıfırla (30dk)
  3. Timer dolunca: /api/calendar-notify (toplu mod) çağır, pendingChanges temizle
```

### Change objesi
```typescript
interface LessonChange {
  type: 'create' | 'update' | 'delete'
  userId: string
  memberName: string
  date: string
  startTime: string
  oldDate?: string       // update için
  oldStartTime?: string  // update için
  duration: number
}
```

### API Endpoint: /api/calendar-notify

```
POST /api/calendar-notify
Body: {
  mode: 'urgent' | 'batch'
  changes: LessonChange[]
}

1. Üye bazlı grupla
2. Her üye için:
   a. notifications tablosuna kayıt ekle
   b. Push bildirim gönder (sendPushNotification)
3. Mesaj şablonunu mode + change type'a göre oluştur
```

### Bildirim tipleri (notifications tablosu)
- `lesson_scheduled` — toplu ders planlaması
- `lesson_updated` — ders saati/tarihi değişikliği
- `lesson_cancelled` — ders iptali

### Sayfa terk edilince
- `beforeunload` + `visibilitychange` event'lerinde:
  - pendingChanges varsa hemen API'ye gönder (`navigator.sendBeacon` veya `fetch keepalive`)
  - Timer temizle

---

## Etkilenen Dosyalar

| Dosya | Değişiklik |
|-------|------------|
| `src/app/(admin)/admin/takvim/CalendarClient.tsx` | Debounce mantığı + change biriktirme |
| `src/app/(admin)/admin/takvim/LessonModal.tsx` | onSave'den change bilgisi döndürme |
| `src/app/api/calendar-notify/route.ts` | YENİ — bildirim API endpoint |
| `src/lib/push.ts` | Mevcut, değişiklik yok |
| `supabase/migrations/047_lesson_notification_types.sql` | notifications CHECK constraint güncelleme (gerekirse) |

---

## Dashboard Güncelleme

Toplu bildirim gittikten sonra üyelerin dashboard'u güncel veriyi gösterecek — zaten her sayfa yüklemesinde fresh data çekiliyor, ekstra işlem gerekmez.
