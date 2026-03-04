# Hamza PT — Kisisel Antrenor Uye Takip Platformu

> **Site:** https://hamzasivrikaya.com | **Repo:** github.com/hamzahsivrikaya-del/hamza-web-site (private)
> **Deploy:** Vercel Hobby | **DB:** Supabase Cloud | **Dil:** Turkce

---

## Vizyon

Kisisel antrenorlerin uye takibini dijitallestiren platform. Su an tek antrenor (Hamza) icin calisiyor, hedef: **multi-tenant SaaS** olarak tum PT'lere acmak.

**Asama 1:** Kendi isinde mukemmellestir, uye tutma ve paket yenilemeyi optimize et, 10-20 uyeyle kanit verisi olustur.
**Asama 2:** SaaS olarak PT'lere ve salonlara sat. Aylik abonelik modeli. "Bu sistemle uye kaybimi %X azalttim" = satis argumani.

---

## Teknoloji Stack

- **Framework:** Next.js 16 (App Router) + TypeScript + React 19
- **Styling:** Tailwind CSS v4
- **Backend:** Supabase (Auth + PostgreSQL + Storage + Realtime)
- **Grafikler:** Recharts (lazy-loaded)
- **Editor:** Tiptap (blog yazimi)
- **PDF:** jspdf + jspdf-autotable (olcum raporlari)
- **Push:** web-push (VAPID)
- **PWA:** manifest.json + sw.js (v3 cache)

---

## Proje Yapisi

```
src/
├── app/
│   ├── (auth)/login/              # Giris, sifre sifirlama
│   ├── (admin)/admin/             # Admin paneli (sidebar layout)
│   │   ├── members/[id]/          # Uye detay (4 tab)
│   │   ├── takvim/                # Takvim (haftalik ders planlama + surukle-birak)
│   │   ├── lessons/new|today/     # Ders olustur / gunluk yoklama
│   │   ├── measurements/new/      # Olcum girisi
│   │   ├── packages/new/          # Paket olustur
│   │   ├── workouts/              # Antrenman yonetimi
│   │   ├── blog/                  # Blog yonetimi
│   │   ├── notifications/         # Manuel bildirim gonder
│   │   └── settings/              # Cron tetikleyiciler
│   ├── (member)/dashboard/        # Uye paneli (navbar layout)
│   │   ├── beslenme/              # Beslenme takibi (14 gun grid)
│   │   ├── program/               # Haftalik antrenman
│   │   ├── progress/              # Olcum + grafik + hedefler
│   │   ├── haftalik-ozet/         # Haftalik rapor listesi
│   │   ├── notifications/         # Bildirim gecmisi
│   │   ├── packages/              # Paket bilgileri
│   │   ├── settings/              # Profil ayarlari
│   │   ├── rozetler/              # Basari rozetleri
│   │   └── cocuk/[id]/            # Bagli uye dashboard
│   ├── blog/[slug]/               # Public blog
│   ├── araclar/                   # 7 fitness hesaplayici
│   ├── antrenmanlar/              # Public haftalik antrenmanlar
│   ├── yasal/                     # Yasal sayfalar
│   └── api/
│       ├── auth/callback/         # OAuth callback
│       ├── push/subscribe|send/   # Push bildirim API
│       ├── cron/                  # weekly-report, nutrition-reminder, badge-notify
│       ├── admin/members/         # Uye CRUD
│       ├── goals/                 # Hedef CRUD
│       ├── badges/                # Rozet sorgulama
│       ├── calendar-notify/       # Takvim bildirim API (urgent + batch)
│       ├── progress-photos/       # Ilerleme fotografi
│       └── share/                 # OG image olusturma (Instagram kart)
├── components/
│   ├── ui/                        # Button, Card, Input, Modal, Badge, Select, Textarea
│   └── shared/                    # Navbar, Sidebar, NotificationBell, hesaplayicilar
└── lib/
    ├── supabase/                  # client.ts, server.ts, middleware.ts, admin.ts
    ├── types.ts                   # Tum TypeScript tipleri
    ├── utils.ts                   # Tarih, format, yardimci fonksiyonlar
    ├── auth-utils.ts              # Timing-safe karsilastirma
    ├── push.ts                    # Push gonderme wrapper
    ├── badges.ts                  # 23 rozet tanimi + hesaplama
    ├── weekly-report.ts           # Haftalik rapor hesaplama
    └── generateMeasurementPdf.ts  # PDF olusturma (Noto Sans TTF)
```

---

## Veritabani Tablolari

| Tablo | Aciklama | Onemli Sutunlar |
|-------|----------|-----------------|
| `users` | Kullanicilar (auth.users FK) | `role`, `parent_id`, `avatar_url`, `nutrition_note`, `is_active`, `onboarding_completed` |
| `packages` | Ders paketleri | `total_lessons`, `used_lessons`, `price`, `payment_status`, `status` |
| `lessons` | Yapilan dersler | `package_id`, `user_id`, `date` |
| `measurements` | Vucut olcumleri | `weight`, `chest/waist/arm/leg`, `sf_chest/abdomen/thigh`, `body_fat_pct` |
| `workouts` | Antrenman programlari | `type` (public/member), `day_index`, `week_start` |
| `workout_exercises` | Egzersizler | `section` (warmup/strength/accessory/cardio), `superset_group` |
| `blog_posts` | Blog yazilari | `slug`, `content` (HTML), `status` (draft/published) |
| `meal_logs` | Beslenme kayitlari | `status`, `photo_url`, `is_extra`, `extra_name` |
| `member_meals` | Ogun sablonlari | `user_id`, `name`, `order_num` |
| `notifications` | Bildirimler | `type`, `title`, `message`, `is_read` |
| `push_subscriptions` | Push abonelikleri | `endpoint`, `p256dh`, `auth` |
| `weekly_reports` | Haftalik raporlar | `lessons_count`, `nutrition_compliance`, `consecutive_weeks` |
| `member_goals` | Kisisel hedefler | `metric_type`, `target_value` |
| `member_badges` | Kazanilan rozetler | `badge_id`, `earned_at`, `notified` |
| `progress_photos` | Ilerleme fotograflari | `photo_url`, `angle` (front/side/back), `taken_at`, `comment` |

**Storage Buckets:** `avatars` (public, 15MB), `progress-photos` (private), `meal-logs` (private), `blog-images` (public)

**Migrations:** `supabase/migrations/` altinda 001-042 arasi. Push ile: `npx supabase db push --linked`

---

## Kimlik Dogrulama & Guvenlik

- **Auth:** Supabase email/password. `role` sutunu ile admin/member ayrimi
- **Middleware:** `src/middleware.ts` — her istekte `getUser()`, role cache (`x-user-role` cookie, 1 saat TTL)
- **RLS:** Tum tablolarda aktif. `is_admin()` ve `child_ids()` SECURITY DEFINER fonksiyonlari (recursion onleme)
- **API guvenlik:** Cron -> `CRON_SECRET` (timing-safe), Service -> `SERVICE_ROLE_KEY`
- **CSP:** `next.config.ts`'de Content-Security-Policy header'i
- **Email:** Turkce karakter normalizasyonu (i->i, s->s, c->c, g->g, u->u, o->o)
- **Security headers:** HSTS, Permissions-Policy, X-DNS-Prefetch-Control
- **Auth callback:** Open redirect korumasi (sadece relative path'ler)

---

## Cron Jobs (pg_cron)

| Job | Zamanlama | Islev |
|-----|-----------|-------|
| Haftalik rapor | Pazar 18:00 TR | Ders sayisi, beslenme uyumu, streak hesapla + push |
| Beslenme / motivasyon hatirlatma | Her gun 09:00 TR | Gun bazli mesaj (Pzt/Car/Cum: beslenme, diger gunler: motivasyon) |
| Rozet bildirimi | Her gun 10:00 TR | Yeni kazanilan rozetleri kontrol et + push |

**Not:** Vercel Hobby cron desteklemez -> Supabase pg_cron + pg_net kullaniliyor.

---

## Renk Paleti

| Amac | Renk | Hex |
|------|------|-----|
| Background | Acik gri | `#FAFAFA` |
| Surface | Beyaz | `#FFFFFF` |
| Primary | Kirmizi | `#DC2626` |
| Text | Koyu | `#1A1A1A` |
| Text Secondary | Taupe | `#57534E` |

**Fontlar:** Geist (body), Oswald/Teko (basliklar), Lora (serif), Geist Mono (kod), Noto Sans (PDF), Nunito (rozetler)

**CSS siniflari:** `gradient-border`, `hover-lift`, `card-glow`

**Theme tokens:** `bg-surface`, `text-text-primary`, `border-border`, `text-primary`

---

## Gelistirme Akisi

```
npm run dev -> localhost:3000
Yeni branch -> kod yaz -> push -> Vercel preview URL -> mobilde test -> merge -> vercel --prod
```

- Deploy ~5-10sn gecis suresi var (uyeler logout olabilir) -> gunde 1-2 deploy
- Yeni ozellikler once test uyesiyle dogrulanmali, onaydan sonra herkese acilmali
- Her buyuk deploy sonrasi bu dosya guncellenecek

---

## Kritik Kurallar & Gotcha'lar

### Next.js 16
- `params` Promise olarak gelir: `const { id } = await params`
- `next/og` (Satori): Her div'e `display: flex` zorunlu, JSX fragment `<>` kullanma

### Supabase
- Join tipleri: many-to-one -> obje doner, one-to-many -> array doner. `[0]` hatasi yapma!
- CLI v2.75: `db execute --sql` YOK. `npx supabase db push --linked` kullan
- RLS'de `users` tablosunda subquery ile admin kontrolu -> infinite recursion! `is_admin()` fonksiyonunu kullan

### Performans
- Layout/page'de **ASLA** `getUser()` cagirma -> `getSession()` kullan (middleware zaten dogruladi)
- Agir kutuphaneler (Recharts, Tiptap): `dynamic(() => import(...), { ssr: false })` ile lazy load
- `next/image` kullan (`<img>` degil), `fill` + `sizes` prop zorunlu

### UI
- Select component: `children` degil `options` prop kullanir
- Modal: `size` prop -> sm/md/lg/xl
- Uye panelinde geri butonlari: `<a>` degil `<Link>` kullan (PWA full reload sorunu)
- Blog HTML: `dangerouslySetInnerHTML` -> `sanitizeHtml()` ile sarma
- Mobil oncelikli tasarim — hover yerine her zaman gorunur butonlar

### Beslenme
- `is_extra` ogunler tamamlanma oranini ETKILEMEZ
- 14 gunluk kompakt grid + detay modali
- Fotograf limiti: 10MB (beslenme), 15MB (profil)

### Push Bildirimleri
- iOS: PWA olarak ana ekrana eklenmeli + kullanici etkilesimi ile izin istenmeli
- `push_subscriptions`: `p256dh` + `auth` ayri sutunlar (eski `keys` JSONB degil)

### Timezone
- `toISOString()` UTC'ye cevirir -> `toDateStr()` helper kullan
- Tum tarihler YYYY-MM-DD formatinda saklanir

### Genel
- `new Date(invalidStr).toISOString()` -> RangeError! Her zaman `isNaN(d.getTime())` kontrolu yap
- API fetch sonrasi HER ZAMAN `res.ok` kontrol et
- Env var ekleme: `echo` degil `printf` kullan (trailing newline sorunu)
- Middleware public rotalar: `/login`, `/blog`, `/araclar`, `/antrenmanlar`, `/yasal`, `/` — yeni public sayfa -> middleware.ts'e ekle!
- CSP header: Yeni harici kaynak -> `next.config.ts` guncelle
- Node.js v25.6 — inline eval'da `!` escape sorunu var, `.mjs` dosya kullan
- Supabase keys yeni format: `sb_publishable_`, `sb_secret_` (JWT degil)

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=
NEXT_PUBLIC_SITE_URL=       # http://localhost:3000 (dev) | https://hamzasivrikaya.com (prod)
CRON_SECRET=
```

---

## Ozellik Detaylari

### Takvim (Ders Planlama)
- **Sayfa:** `/admin/takvim` — haftalik gorunum, mobil icin gun gorunumu
- **Dosyalar:** `CalendarClient.tsx` (ana mantik), `CalendarView.tsx` (haftalik grid), `MobileDayView.tsx` (mobil gun), `LessonModal.tsx` (ders ekle/duzenle modal), `page.tsx` (server data fetch)
- Haftalik grid: 7 gun x zaman slotlari, ders kartlari renk kodlu
- Ders ekle: bos slota tikla → modal (uye sec, tarih, saat, sure, not)
- Ders duzenle: ders kartina tikla → modal (tarih/saat/sure degistir, sil)
- Duplicate kontrol: ayni uye + ayni tarihte 2. ders engelliyor
- **Bildirim sistemi:** Ders eklendiginde/degistiginde/silindiginde uyelere otomatik bildirim
  - **Acil (urgent):** ≤24 saat icindeki dersler → aninda push + in-app bildirim
  - **Toplu (batch):** >24 saat sonraki dersler → 30dk debounce ile toplanip tek bildirim gider
  - Mesaj ornekleri: "Bu hafta 3 dersin planlandi: Pzt 10:00, Car 14:00, Cum 16:00"
  - Iptal mesaji: "Dersiniz iptal edildi. Detaylar icin antrenorunuzle iletisime gecin."
  - Degisiklik: "Dersiniz 10:00'den 12:00'ye tasindi."
  - **API:** `/api/calendar-notify` — admin auth + per-user gruplama
  - **Client:** `pendingChangesRef` + `setTimeout` debounce + `navigator.sendBeacon` (sayfa kapanirsa)
- **Migration:** 045 (start_time/duration), 046 (UPDATE RLS), 047 (bildirim tipleri)
- **Dashboard:** Admin dashboard'da "Bugunun Programi" karti (saatli ders listesi + takvim linki)
- **Sidebar:** Takvim 2. sirada (Dashboard'dan hemen sonra)

### Beslenme Takibi
- Admin uyeye ogun atar (`member_meals`) -> Uye gunluk kayit girer (`meal_logs`)
- Sabit ogun yok, admin istedigi kadar ogun atayabilir (2, 3, 5...)
- Yeni uye -> DB trigger ile otomatik Kahvalti/Ogle/Aksam
- Foto: Supabase Storage `meal_photos` bucket (public), `capture="environment"` ile kamera
- Upsert: `onConflict: 'user_id,date,meal_id'`
- Toggle-based ogun tamamlama sistemi + progress bar (%100 yesil, >=50 turuncu, <50 kirmizi)
- Ekstra ogun ekleme (cheat meal vb.) — tamamlanma oranini etkilemez
- 14-gun kompakt renkli grid + detay modali
- Haftalik rapor cron'u extra ogunleri haric tutar
- **Dosyalar:** `BeslenmeClient.tsx`, `MealPlanManager.tsx`, `MemberDetail.tsx` (beslenme sekmesi)
- **Migration:** 021, 022, 023, 037, 038

### Kisisel Hedef Takibi
- DB: `member_goals` tablosu (migration 031), RLS aktif
- API: `/api/goals` (GET/POST upsert/DELETE)
- Uye: Ilerleme sayfasinda tiklanabilir metrik kartlari (2x3 grid), hedef modal (bottom sheet)
- Dashboard: Son Olcum kartinda hedef barlari
- Metrikler: weight, body_fat_pct, chest, waist, arm, leg

### Paket Fiyat & Odeme Takibi
- `packages.price` (NUMERIC) + `packages.payment_status` (paid/unpaid) — migration 039
- Admin: Paket olustururken fiyat + odeme durumu girer, badge'e tiklayarak toggle
- Uye: Dashboard + Paketlerim sayfasinda fiyat ve odeme durumu gorunur
- Fiyat girilmemis paketlerde hicbir sey gosterilmez (null kontrolu)
- Helper: `formatPrice()` — utils.ts
- **PayTR:** Basvuru yapildi, onay bekleniyor. Onay gelince -> Magaza No, Parola, Gizli Anahtar alinacak -> test kartlariyla deneme -> canliya gecis. Komisyon: ~%1.45-2.8

### Bagli Uye Sistemi (Parent-Child)
- `users.parent_id` -> velinin user ID'si
- Fake email: `child-{uuid}@hamzapt.local` (UI'da gizlenir)
- Cocuk dashboardu: `/dashboard/cocuk/[id]` — tek sayfada paket + ders + olcum + grafik
- RLS: `child_ids()` SECURITY DEFINER fonksiyonu ile guvenli erisim
- Veli bildirimi: Cocugun paketi azalinca otomatik push

### Rozet (Badge) Sistemi
- **DB:** `member_badges` tablosu (migration 041), 23 rozet, 3 faz (A: baslama, B: yenileme, C: sadakat) + 2 admin ozel rozet
- **API:** `/api/badges` — otomatik kazanim + inline push bildirim
- **Cron:** `/api/cron/badge-notify` — her gun 10:00 TR, `notified: false` rozetleri bildirir
- **Sayfa:** `/dashboard/rozetler` — gradient kartlar, emoji, Nunito font
- **Share:** `/api/share/badge/[badgeId]?u=userId` — 1080x1920 PNG (font + CDN cache)
- **Dashboard:** `BadgeStrip` — son 4 kazanilan rozet, kompakt serit
- **Profil:** `/dashboard/settings` alt bolumde rozet grid + `ShareOverlay` (PNG paylasim)
- **Performans:** Sayfa yuklenince kazanilan rozetlerin gorselleri `imageCache` ref ile preload
- **CSS:** `.badge`, `.badge.locked`, `.badge-share-btn` -> `globals.css`
- **Gorsel:** `BADGE_VISUALS` — `badges.ts`'de her rozet icin emoji, gradient, shadow tanimi

### Onboarding
- **Sayfa:** `/dashboard/onboarding` — 4 adim (Hosgeldin -> Hedef Belirle -> Bildirimler -> Hazirsin)
- **API:** `/api/onboarding/complete` — `onboarding_completed = true` yapar
- **Migration:** 040 — `onboarding_completed` kolonu (mevcut uyeler true, yeni uyeler false)
- **Redirect:** Dashboard page'de kontrol — `onboarding_completed = false` ise onboarding'e yonlendir
- **confetti-fall animasyonu:** CSS'de tanimli

### Ilerleme Fotograflari (Once/Sonra)
- **DB:** `progress_photos` tablosu (migration 042), `progress-photos` storage bucket (private)
- **API:** `/api/progress-photos` (GET/POST/DELETE)
- **Admin:** Uye detay > Olcumler tab'i > en altta foto bolumu
  - Kompakt tarih kutucuklari (beslenme pattern'i gibi)
  - Tarihe tikla = fotolar acilir, Karsilastir butonu = 2 tarih sec = yan yana
  - Foto yukle modal: tarih + 3 aci (on/yan/arka), galeri + kamera destegi
  - Lightbox: fotoya dokun = tam ekran buyutur
- **Uye:** Ilerleme sayfasinda grafiklerin ustunde
  - Tarih kutucuklari, Karsilastir butonu, lightbox
  - Olcum eslestirme: foto tarihine +/-3 gun toleransla en yakin olcum
  - Olcum farklari: yesil/kirmizi renk ile gosterim
- **AI yorum alani:** `comment` kolonu hazir, ileride Claude API ile aktif edilecek

### Gunluk Motivasyon Mesajlari
- Cron: `nutrition-reminder` — UTC 06:00 (TR 09:00)
- Her gun farkli mesaj (beslenme + genel motivasyon karisik)
- Pazar/Sali/Persembe/Cumartesi: genel motivasyon
- Pazartesi/Carsamba/Cuma: beslenme odakli

### Yasal Sayfalar
- `/yasal/mesafeli-satis-sozlesmesi`, `/yasal/gizlilik-politikasi`, `/yasal/iade-ve-iptal`, `/yasal/kullanim-kosullari`
- Layout: Geist Sans font, acik tema, sticky navbar, cross-linkli footer
- Landing page footer'ina yasal linkler eklendi

---

## Ozellik Yol Haritasi

### Faz 1 — Temel Deger (Mevcut Durum)

| # | Ozellik | Durum |
|---|---------|-------|
| 1 | Beslenme takibi (ogun + foto) | CANLI |
| 2 | Admin uye notlari | BEKLIYOR |
| 3 | Uye risk skoru | BEKLIYOR |
| 4 | Kisisel hedef takibi | CANLI |
| 5 | Otomatik yenileme hatirlatmasi | CANLI (trigger + push) |
| 6 | Bosluk tehlikesi gosterimi | CANLI (badge + progress bar) |
| 7 | Takvim (haftalik ders planlama) | CANLI |
| 8 | Takvim bildirim sistemi (urgent + batch) | CANLI |

### Faz 2 — Premium Deneyim

| # | Ozellik | Durum |
|---|---------|-------|
| 7 | Onboarding akisi | CANLI |
| 8 | Ilerleme fotograflari (once/sonra) | CANLI |
| 9 | Rozet sistemi | CANLI |
| 10 | Milestone kutlamalari | PLANLI |
| 11 | Streak motivasyonu | PLANLI |
| 12 | Gelir dashboard'u | PLANLI |
| 13 | PWA iyilestirmeleri | PLANLI |

### Faz 3 — Buyume & SaaS Hazirlik

| # | Ozellik | Durum |
|---|---------|-------|
| 14 | Aliskanlik/gorev takibi (su, uyku, adim + streak) | PLANLI |
| 15 | Compliance tracking (7/30/90 gun uyum orani) | PLANLI |
| 16 | Uygulama ici mesajlasma (Supabase Realtime) | PLANLI |
| 17 | Check-in formlari (haftalik) | PLANLI |
| 18 | Egzersiz kutuphanesi (video/GIF) | PLANLI |
| 19 | Randevu/booking sistemi | PLANLI |
| 20 | Instagram paylasim butonu | PLANLI |
| 21 | Referans sistemi | PLANLI |
| 22 | Multi-tenant SaaS donusumu | PLANLI |

---

## Monetizasyon Stratejisi

### Mevcut Durum
- Hizmet: Yuz yuze personal training
- Odeme: Elden + havale (dijital odeme altyapisi bekleniyor — PayTR)
- Site: Dusuk trafik, Instagram'dan az trafik, donusum yok

### Strateji
1. **Asama 1** — Sistemi kendi isinde mukemmellestir. Uye tutma, memnuniyet, paket yenileme optimize et. Kanit verisi olustur.
2. **Asama 2** — SaaS olarak PT'lere ve salonlara sat. Aylik abonelik modeli. Multi-tenant yapi.

### Rakip Avantajlarimiz
- Sifir maliyet, sinirsiz musteri (rakipler 5 musteriden sonra $20-40+/ay)
- Tamamen Turkce (rakiplerin hicbiri Turkce desteklemiyor)
- Bagli uye sistemi (parent-child) — hicbir rakipte yok
- 7 fitness hesaplayicisi, blog sistemi, Instagram paylasim karti, PDF rapor
- Basit ve temiz arayuz (rakiplerde en buyuk sikayet: karmasik UI)

### Rakip Analizi
- Analiz edilen rakipler: Trainerize, Everfit, TrueCoach, My PT Hub

---

## Gelistirme Kurallari

- **Mobil oncelikli tasarim** — hover yerine her zaman gorunur butonlar
- **Deploy akisi:** `npx vercel` (preview) -> mobilde kontrol -> onay -> `npx vercel --prod`
- **Yeni ozellikler:** Once test uyesi ile dogrulanmali, onaydan sonra herkese acilmali
- Yuz yuze iliski — uye feedback/puanlama sistemi istenmiyor, sadece admin notlari

---

## Hesaplar & Altyapi

- **Supabase:** jpftfjhmgdyrnenopays.supabase.co
- **Vercel:** hamzahsivrikaya-5499s-projects/hamza-web-site
- **Domain:** hamzasivrikaya.com (Vercel, 22 Sub 2027'ye kadar)
- **GitHub:** github.com/hamzahsivrikaya-del/hamza-web-site (private)

> **Not:** Admin ve test hesabi bilgileri guvenlik nedeniyle bu dosyada yer almaz. Erisim icin proje sahibiyle iletisime gecin.

---
---

# Megin — PT SaaS Platformu

> **Repo:** github.com/hamzahsivrikaya-del/Megin (private)
> **Deploy:** Vercel | **DB:** Supabase Cloud | **Dil:** Turkce
> **Durum:** Erken asama (altyapi + odeme sistemi kuruldu, dashboard portlama devam ediyor)

---

## Megin Nedir?

Megin, hamza-web-site'in **multi-tenant SaaS versiyonu**dur. hamza-web-site tek antrenor (Hamza) icin calisirken, Megin tum personal trainer'lara acik bir platform olarak tasarlandi.

**Iliski:** hamza-web-site = Asama 1 (kendi isinde kanit verisi olustur), Megin = Asama 2 (SaaS olarak PT'lere sat)

**Hedef:** Turkiye'deki 15.000-20.000 PT'ye dijital danisan takip araci sunmak. Ilk 6 ay 200 PT, 1. yil 1.000 PT hedefi.

---

## hamza-web-site vs Megin Karsilastirmasi

| Ozellik | hamza-web-site | Megin |
|---------|----------------|-------|
| **Kapsam** | 1 PT + uyeleri | Sinirsiz PT |
| **Schema** | `users (role: admin/member)` | `trainers` + `clients` (ayri tablolar) |
| **Tenant izolasyonu** | Role-based RLS | `trainer_id` based RLS |
| **Rota yapisi** | `/admin/*`, `/dashboard/*` | `/dashboard/*` (PT), `/app/*` (danisan) |
| **Plan kisitlamasi** | Yok | Free(3 danisan) / Pro(10) / Elite(sinirsiz) |
| **Odeme** | Manuel (elden + havale) | PayTR entegrasyonu |
| **PT profili** | Yok | Public handle: `megin.com/username` |
| **Davet sistemi** | Yok | Invite token + email/WhatsApp |
| **Audit log** | Yok | `audit_logs` tablosu |
| **Google SSO** | Yok | Var |

**UI/UX ayni:** Tum gorsel tasarim, component'ler ve kullanici deneyimi hamza-web-site'dan direkt port ediliyor. Ayni renk paleti, ayni component yapisi.

---

## Teknoloji Stack

hamza-web-site ile ayni stack + SaaS eklemeler:

- **Framework:** Next.js 16 (App Router) + TypeScript + React 19
- **Styling:** Tailwind CSS v4
- **Backend:** Supabase (Auth + PostgreSQL + Storage) — **ayri instance**
- **Odeme:** PayTR (iframe token + webhook)
- **Analytics:** Microsoft Clarity + Sentry (planli)
- **Bot koruma:** Cloudflare Turnstile (planli)

---

## Proje Yapisi

```
src/
├── app/
│   ├── (auth)/                    # Giris, kayit, callback
│   ├── (trainer)/dashboard/       # PT paneli (sidebar layout)
│   │   ├── clients/[id]/          # Danisan detay
│   │   ├── lessons/new|today/     # Ders olustur / yoklama
│   │   ├── measurements/new/      # Olcum girisi
│   │   ├── packages/new/          # Paket olustur
│   │   ├── workouts/              # Antrenman yonetimi
│   │   ├── notifications/         # Bildirim
│   │   ├── settings/              # Profil + abonelik
│   │   ├── finance/               # Gelir dashboard (yeni)
│   │   └── upgrade/               # Plan yukseltme (yeni)
│   ├── (client)/app/              # Danisan paneli (navbar layout)
│   │   ├── beslenme/              # Beslenme takibi
│   │   ├── program/               # Antrenman programi
│   │   ├── progress/              # Olcum + grafik
│   │   ├── notifications/         # Bildirimler
│   │   └── ...
│   ├── [username]/                # Public PT profili
│   │   └── davet/[token]/         # Davet kabul sayfasi
│   └── api/
│       ├── auth/callback/         # OAuth callback
│       ├── trainer/clients/       # Danisan CRUD
│       ├── paytr/                 # PayTR webhook + token
│       ├── invite/register/       # Davet API
│       └── cron/                  # Zamanlanmis isler
├── components/
│   ├── ui/                        # Card, Badge, Button, Modal, Input, Select, Textarea
│   └── shared/                    # Sidebar, ClientNavbar, NotificationBell
└── lib/
    ├── supabase/                  # client.ts, server.ts, middleware.ts, admin.ts
    ├── types.ts                   # Trainer, Client, Subscription, PaymentOrder, AuditLog...
    ├── plans.ts                   # Plan config (free/pro/elite)
    ├── subscription.ts            # canAddClient(), hasFeatureAccess()
    ├── utils.ts                   # Yardimci fonksiyonlar
    └── pdf/measurement-report.ts  # PDF olusturma
```

---

## Veritabani Tablolari

### hamza-web-site'dan Portlanan Tablolar
Ayni mantik, farkli scope: `user_id` yerine `trainer_id` + `client_id`

| Tablo | Aciklama |
|-------|----------|
| `trainers` | PT bilgileri (username, expertise, experience_years) |
| `clients` | Danisanlar (trainer_id FK, invite_token, parent_id) |
| `packages` | Ders paketleri (trainer_id scope) |
| `lessons` | Yapilan dersler |
| `measurements` | Vucut olcumleri |
| `workouts` / `workout_exercises` | Antrenman programlari |
| `client_meals` / `meal_logs` | Beslenme takibi |
| `notifications` | Bildirimler |
| `push_subscriptions` | Push abonelikleri |
| `weekly_reports` | Haftalik raporlar |
| `client_goals` | Kisisel hedefler |
| `client_badges` | Rozetler |
| `progress_photos` | Ilerleme fotograflari |
| `blog_posts` | Blog yazilari |

### SaaS'a Ozel Yeni Tablolar

| Tablo | Aciklama | Onemli Sutunlar |
|-------|----------|-----------------|
| `subscriptions` | PT abonelikleri | `plan` (free/pro/elite), `status`, `current_period_end` |
| `payment_orders` | PayTR odemeleri | `merchant_oid`, `amount`, `status` (pending/success/failed) |
| `audit_logs` | Islem gecmisi | `trainer_id`, `action`, `details` (JSONB) |

**Supabase:** tjhktfygvrjasixpwwhk.supabase.co (hamza-web-site'dan tamamen bagimsiz)

**Migrations:** `supabase/migrations/` altinda 001-006 arasi

---

## Plan Yapisi (Freemium)

| Ozellik | Free | Pro | Elite |
|---------|------|-----|-------|
| Danisan limiti | 3 | 10 | Sinirsiz |
| Antrenman programi | ✓ | ✓ | ✓ |
| Ders takibi | ✓ | ✓ | ✓ |
| Temel olcum | ✓ | ✓ | ✓ |
| Olcum grafikleri | ✗ | ✓ | ✓ |
| Beslenme takibi | ✗ | ✓ | ✓ |
| Haftalik raporlar | ✗ | ✓ | ✓ |
| Push bildirim | ✗ | ✓ | ✓ |
| Finans ekrani | ✗ | ✓ | ✓ |
| Ilerleme fotograflari | ✗ | ✗ | ✓ |
| Rozet sistemi | ✗ | ✗ | ✓ |
| Blog | ✗ | ✗ | ✓ |
| Risk skoru | ✗ | ✗ | ✓ |
| Instagram karti | ✗ | ✗ | ✓ |

**Helper fonksiyonlar:** `canAddClient(plan, currentCount)` ve `hasFeatureAccess(plan, feature)` — `lib/subscription.ts`

---

## Danisan Davet Akisi

1. PT dashboard'da "Danisan Ekle" → isim girer → invite token olusur
2. PT linki WhatsApp/SMS ile paylasr: `megin.com/[username]/davet/[token]`
3. Danisan linke tiklar → sifre olusturur → hesap acilir → dashboard'a yonlendirilir
4. Fake email: `client-{uuid}@megin.local` (email girilmezse)

---

## Odeme Sistemi (PayTR)

- **Endpoint:** `/api/paytr/token` (iframe token olustur) + `/api/paytr/callback` (webhook)
- **Akis:** PT "Plan Yukselt" tiklar → PayTR iframe acilir → odeme → webhook → subscription guncellenir
- **Durum:** Test modunda, PayTR onay bekleniyor
- **Env vars:** `PAYTR_MERCHANT_ID`, `PAYTR_MERCHANT_KEY`, `PAYTR_MERCHANT_SALT`

---

## Mevcut Durum

### Tamamlanan
- Supabase schema (6 migration)
- Auth endpoints (email/password + Google SSO planli)
- PayTR entegrasyonu (token + webhook)
- Plan config + subscription logic
- Client limit enforcement

### Yapilacak
- Dashboard sayfalari (hamza-web-site'dan port)
- Danisan app sayfalari (beslenme, program, progress)
- Cron jobs (haftalik rapor, push bildirimleri)
- Landing page
- Email sistemi
- Analytics (Clarity + Sentry)
- Superadmin panel

---

## Kritik Kurallar (Megin'e Ozel)

- **Tenant izolasyonu:** Her sorgu `trainer_id` ile scope'lanmali. RLS'siz sorgu YASAK
- **Plan limitleri:** Danisan eklemeden once `canAddClient()`, ozellik kullanmadan once `hasFeatureAccess()` kontrol et
- **Invite token:** Unique, tek kullanimlik
- **Audit log:** Kritik islemlerde (danisan ekleme/silme, plan degisikligi) log kaydi olustur
- **Ayri Supabase:** hamza-web-site ve Megin tamamen farkli Supabase instance'lari, karistirma!

---

## Environment Variables (Megin)

```env
NEXT_PUBLIC_SUPABASE_URL=        # tjhktfygvrjasixpwwhk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=            # http://localhost:3000 (dev) | megin.com (prod)
CRON_SECRET=
PAYTR_MERCHANT_ID=
PAYTR_MERCHANT_KEY=
PAYTR_MERCHANT_SALT=
NEXT_PUBLIC_CLARITY_ID=
NEXT_PUBLIC_SENTRY_DSN=
```

---

## Hesaplar & Altyapi (Megin)

- **Supabase:** tjhktfygvrjasixpwwhk.supabase.co
- **GitHub:** github.com/hamzahsivrikaya-del/Megin (private)
- **Domain:** megin.com (henuz alinmadi)

---

## Dokumantasyon Dosyalari (Megin repo icinde)

| Dosya | Icerik |
|-------|--------|
| `docs/plans/2026-03-01-hamza-saas-is-plani.md` | Is plani, rakip analizi, gelir projeksiyonu |
| `docs/plans/2026-03-02-megin-saas-design.md` | Teknik tasarim, onboarding, davet akisi |
| `docs/plans/2026-03-03-dashboard-porting.md` | hamza-web-site → Megin dashboard portlama plani |
| `docs/plans/2026-03-03-danisan-ekleme-davet-design.md` | Danisan ekleme ve davet akisi detayi |
| `docs/reports/2026-03-01-kullanici-yorum-analizi-ve-tr-pazar.md` | Rakip uygulama kullanici yorum analizi |
