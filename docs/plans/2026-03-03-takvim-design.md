# Takvim Sistemi Tasarimi

**Tarih:** 2026-03-03
**Durum:** Onaylandi

---

## Ozet

Admin icin haftalik takvim gorunumu (Apple Calendar tarzi) + uye dashboard'unda ders saatleri karti. Admin takvimden ders ekleyebilir, duzenleyebilir, surukle-birakla tasiyabilir. Uye sadece kendi derslerini gorur.

---

## Veritabani Degisiklikleri

### Migration: `lessons` tablosuna saat bilgisi

```sql
ALTER TABLE lessons ADD COLUMN start_time TEXT;        -- "10:00" formati
ALTER TABLE lessons ADD COLUMN duration INTEGER DEFAULT 60;  -- dakika
```

- Mevcut `user_id + date` unique constraint KALIR (gunde 1 ders/uye)
- Mevcut dersler: `start_time = NULL`, `duration = 60`
- Takvimde `start_time = NULL` olan dersler "saat belirsiz" olarak gosterilir

---

## Admin Takvimi

### Sayfa: `/admin/takvim`

**Kutupliane:** `@fullcalendar/react` (lazy load — agir kutupliane)
- `@fullcalendar/timegrid` — haftalik zaman cizelgesi
- `@fullcalendar/interaction` — surukle-birak + tikla

**Gorunum:**
- Haftalik gorunum (Pazartesi-Pazar)
- Saat araligi: 07:00 - 21:00
- Her ders = renkli blok, uye ismi yazili
- Bugunku gun farkli arka plan rengi (vurgulu)
- Yaklasan ders highlight
- Sol/sag oklar ile hafta gecisi

**Islemler:**

| Islem | Tetikleyici | Sonuc |
|-------|------------|-------|
| Ders ekle | Bos slot'a tikla | Modal: uye sec + saat + sure + not |
| Ders duzenle | Mevcut derse tikla | Modal: saat/sure/not degistir, sil |
| Ders tasi | Surukle-birak (desktop) / uzun bas (mobil) | Gunu/saati degistir |

**Renklendirme:** Her uyeye isim hash'inden sabit renk atanir.

**Mobil:** Surukle-birak yerine uzun bas -> duzenleme modali.

**Sidebar:** Admin sidebar'a "Takvim" linki eklenir (takvim ikonu).

---

## Uye Dashboard Karti

### "Ders Programim" karti

Dashboard'a yeni kart eklenir. Bu haftanin derslerini gosterir:

```
Ders Programim
--------------
Pzt  10:00
Car  14:30
Cum  10:00
```

**Kurallar:**
- Sadece bu haftanin dersleri
- Ders yoksa: "Bu hafta planlanmis ders yok"
- Gecmis dersler soluk renkte
- Bugunki ders primary renk ile vurgulu
- Uye duzenleme yapamaz, sadece goruntuleme
- Sure (dk) gosterilmez, sadece gun + saat

---

## Teknik Notlar

- FullCalendar `dynamic(() => import(...), { ssr: false })` ile lazy load
- Timezone: `toDateStr()` helper kullan, `toISOString()` KULLANMA
- API: Mevcut Supabase client ile direkt sorgu (ayri API endpoint gerekmez)
- Haftalik sorgu: `.gte('date', weekStart).lte('date', weekEnd)`
- RLS: Mevcut policies yeterli (admin all, member own)
