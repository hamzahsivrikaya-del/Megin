# Megin — Personal Trainer SaaS Platformu

> **Repo:** github.com/hamzahsivrikaya-del/hamza-web-site (private)
> **Deploy:** Vercel | **DB:** Supabase Cloud | **Dil:** Turkce
> **Durum:** Cekirdek platform tamamlandi, SaaS donusumu + landing page tasarimi devam ediyor

---

## Vizyon

Turkiye'deki personal trainer'lara dijital danisan takip araci sunan SaaS platformu. Hedef: 15.000-20.000 PT pazarina erismek.

**Mevcut durum:** Tek PT (Hamza) icin calisir halde, tum temel ozellikler canli ve test edilmis. Bu cekirdek uzerinden multi-tenant SaaS'a donusum yapiliyor.

**Sonraki adim:** Megin landing page tasarimi — yeni PT'lerin platformu kesfedip kayit olabilecegi sayfa.

**Hedef:** Ilk 6 ay 200 PT, 1. yil 1.000 PT. Freemium model (Free 3 danisan / Pro 10 / Elite sinirsiz).

**Rakip avantajlari:**
- Sifir maliyet, sinirsiz musteri (rakipler 5 musteriden sonra $20-40+/ay)
- Tamamen Turkce (rakiplerin hicbiri Turkce desteklemiyor)
- Bagli uye sistemi (parent-child) — hicbir rakipte yok
- Basit ve temiz arayuz (rakiplerde en buyuk sikayet: karmasik UI)
- Analiz edilen rakipler: Trainerize, Everfit, TrueCoach, My PT Hub

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
- **Odeme:** PayTR (iframe token + webhook)

---

## Proje Yapisi

```
src/
├── app/
│   ├── (auth)/login/              # Giris, sifre sifirlama
│   ├── (admin)/admin/             # Admin (PT) paneli (sidebar layout)
│   │   ├── members/[id]/          # Danisan detay (4 tab)
│   │   ├── takvim/                # Takvim (haftalik ders planlama + surukle-birak)
│   │   ├── lessons/new|today/     # Ders olustur / gunluk yoklama
│   │   ├── measurements/new/      # Olcum girisi
│   │   ├── packages/new/          # Paket olustur
│   │   ├── workouts/              # Antrenman yonetimi
│   │   ├── finance/               # Gelir dashboard
│   │   ├── blog/                  # Blog yonetimi
│   │   ├── notifications/         # Manuel bildirim gonder
│   │   └── settings/              # Cron tetikleyiciler
│   ├── (member)/dashboard/        # Danisan paneli (navbar layout)
│   │   ├── beslenme/              # Beslenme takibi (14 gun grid)
│   │   ├── program/               # Haftalik antrenman
│   │   ├── progress/              # Olcum + grafik + hedefler
│   │   ├── haftalik-ozet/         # Haftalik rapor listesi
│   │   ├── notifications/         # Bildirim gecmisi
│   │   ├── packages/              # Paket bilgileri
│   │   ├── settings/              # Profil ayarlari
│   │   ├── rozetler/              # Basari rozetleri
│   │   └── cocuk/[id]/            # Bagli danisan dashboard
│   ├── blog/[slug]/               # Public blog
│   ├── araclar/                   # 7 fitness hesaplayici
│   ├── antrenmanlar/              # Public haftalik antrenmanlar
│   ├── yasal/                     # Yasal sayfalar
│   └── api/
│       ├── auth/callback/         # OAuth callback
│       ├── push/subscribe|send/   # Push bildirim API
│       ├── cron/                  # weekly-report, nutrition-reminder, badge-notify
│       ├── admin/members/         # Danisan CRUD
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
| `lessons` | Yapilan dersler | `package_id`, `user_id`, `date`, `start_time`, `duration` |
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

**Migrations:** `supabase/migrations/` altinda 001-047 arasi. Push ile: `npx supabase db push --linked`

### SaaS Donusumunde Eklenecek Tablolar

| Tablo | Aciklama | Onemli Sutunlar |
|-------|----------|-----------------|
| `trainers` | PT bilgileri | `username`, `expertise`, `experience_years` |
| `subscriptions` | PT abonelikleri | `plan` (free/pro/elite), `status`, `current_period_end` |
| `payment_orders` | PayTR odemeleri | `merchant_oid`, `amount`, `status` (pending/success/failed) |
| `audit_logs` | Islem gecmisi | `trainer_id`, `action`, `details` (JSONB) |

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
- **Komisyon:** ~%1.45-2.8
- **Env vars:** `PAYTR_MERCHANT_ID`, `PAYTR_MERCHANT_KEY`, `PAYTR_MERCHANT_SALT`

---

## Kimlik Dogrulama & Guvenlik

- **Auth:** Supabase email/password (Google SSO planli)
- **Middleware:** `src/middleware.ts` — her istekte `getUser()`, role cache (`x-user-role` cookie, 1 saat TTL)
- **RLS:** Tum tablolarda aktif. `is_admin()` ve `child_ids()` SECURITY DEFINER fonksiyonlari (recursion onleme)
- **Tenant izolasyonu:** SaaS'ta her sorgu `trainer_id` ile scope'lanmali. RLS'siz sorgu YASAK
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

- Deploy ~5-10sn gecis suresi var -> gunde 1-2 deploy
- Yeni ozellikler once test hesabiyla dogrulanmali, onaydan sonra herkese acilmali
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
- Danisan panelinde geri butonlari: `<a>` degil `<Link>` kullan (PWA full reload sorunu)
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

### SaaS Kurallar
- **Plan limitleri:** Danisan eklemeden once `canAddClient()`, ozellik kullanmadan once `hasFeatureAccess()` kontrol et
- **Invite token:** Unique, tek kullanimlik
- **Audit log:** Kritik islemlerde (danisan ekleme/silme, plan degisikligi) log kaydi olustur

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
NEXT_PUBLIC_SITE_URL=       # http://localhost:3000 (dev) | megin.com (prod)
CRON_SECRET=
PAYTR_MERCHANT_ID=
PAYTR_MERCHANT_KEY=
PAYTR_MERCHANT_SALT=
```

---

## Tamamlanan Ozellikler (Cekirdek Platform)

Asagidaki tum ozellikler canli ve test edilmistir. SaaS donusumunde `trainer_id` scope'u ile multi-tenant hale getirilecek.

### Takvim (Ders Planlama)
- **Sayfa:** `/admin/takvim` — haftalik gorunum, mobil icin gun gorunumu
- **Dosyalar:** `CalendarClient.tsx` (ana mantik), `CalendarView.tsx` (haftalik grid), `MobileDayView.tsx` (mobil gun), `LessonModal.tsx` (ders ekle/duzenle modal), `page.tsx` (server data fetch)
- Haftalik grid: 7 gun x zaman slotlari, ders kartlari renk kodlu
- Ders ekle: bos slota tikla → modal (danisan sec, tarih, saat, sure, not)
- Ders duzenle: ders kartina tikla → modal (tarih/saat/sure degistir, sil)
- Duplicate kontrol: ayni danisan + ayni tarihte 2. ders engelliyor
- **Bildirim sistemi:** Ders eklendiginde/degistiginde/silindiginde danisanlara otomatik bildirim
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
- Admin danisana ogun atar (`member_meals`) -> Danisan gunluk kayit girer (`meal_logs`)
- Sabit ogun yok, admin istedigi kadar ogun atayabilir (2, 3, 5...)
- Yeni danisan -> DB trigger ile otomatik Kahvalti/Ogle/Aksam
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
- Danisan: Ilerleme sayfasinda tiklanabilir metrik kartlari (2x3 grid), hedef modal (bottom sheet)
- Dashboard: Son Olcum kartinda hedef barlari
- Metrikler: weight, body_fat_pct, chest, waist, arm, leg

### Paket Fiyat & Odeme Takibi
- `packages.price` (NUMERIC) + `packages.payment_status` (paid/unpaid) — migration 039
- Admin: Paket olustururken fiyat + odeme durumu girer, badge'e tiklayarak toggle
- Danisan: Dashboard + Paketlerim sayfasinda fiyat ve odeme durumu gorunur
- Fiyat girilmemis paketlerde hicbir sey gosterilmez (null kontrolu)
- Helper: `formatPrice()` — utils.ts

### Bagli Danisan Sistemi (Parent-Child)
- `users.parent_id` -> velinin user ID'si
- Fake email: `child-{uuid}@megin.local` (UI'da gizlenir)
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
- **Gorsel:** `BADGE_VISUALS` — `badges.ts`'de her rozet icin emoji, gradient, shadow tanimi

### Onboarding
- **Sayfa:** `/dashboard/onboarding` — 4 adim (Hosgeldin -> Hedef Belirle -> Bildirimler -> Hazirsin)
- **API:** `/api/onboarding/complete` — `onboarding_completed = true` yapar
- **Migration:** 040 — `onboarding_completed` kolonu (mevcut danisanlar true, yeni danisanlar false)
- **Redirect:** Dashboard page'de kontrol — `onboarding_completed = false` ise onboarding'e yonlendir

### Ilerleme Fotograflari (Once/Sonra)
- **DB:** `progress_photos` tablosu (migration 042), `progress-photos` storage bucket (private)
- **API:** `/api/progress-photos` (GET/POST/DELETE)
- **Admin:** Danisan detay > Olcumler tab'i > kompakt tarih kutucuklari + karsilastir + lightbox
- **Danisan:** Ilerleme sayfasinda grafiklerin ustunde tarih kutucuklari + karsilastir + lightbox
- **AI yorum alani:** `comment` kolonu hazir, ileride Claude API ile aktif edilecek

### Gunluk Motivasyon Mesajlari
- Cron: `nutrition-reminder` — UTC 06:00 (TR 09:00)
- Her gun farkli mesaj (beslenme + genel motivasyon karisik)
- Pazar/Sali/Persembe/Cumartesi: genel motivasyon
- Pazartesi/Carsamba/Cuma: beslenme odakli

### Yasal Sayfalar
- `/yasal/mesafeli-satis-sozlesmesi`, `/yasal/gizlilik-politikasi`, `/yasal/iade-ve-iptal`, `/yasal/kullanim-kosullari`
- Layout: Geist Sans font, acik tema, sticky navbar, cross-linkli footer

---

## Yapilacaklar

### Oncelikli — Landing Page & SaaS Donusumu
- [ ] Megin landing page tasarimi (PT'lere hitap eden)
- [ ] Multi-tenant donusum (`trainer_id` scope, yeni tablolar)
- [ ] PT kayit + onboarding akisi
- [ ] Google SSO
- [ ] Superadmin panel

### Ozellik Gelistirme
- [ ] Admin danisan notlari
- [ ] Danisan risk skoru
- [ ] Milestone kutlamalari
- [ ] Streak motivasyonu
- [ ] PWA iyilestirmeleri
- [ ] Aliskanlik/gorev takibi (su, uyku, adim + streak)
- [ ] Compliance tracking (7/30/90 gun uyum orani)
- [ ] Uygulama ici mesajlasma (Supabase Realtime)
- [ ] Check-in formlari (haftalik)
- [ ] Egzersiz kutuphanesi (video/GIF)
- [ ] Randevu/booking sistemi
- [ ] Instagram paylasim butonu
- [ ] Referans sistemi
- [ ] Email sistemi
- [ ] Analytics (Clarity + Sentry)

---

## Gelistirme Kurallari

- **Mobil oncelikli tasarim** — hover yerine her zaman gorunur butonlar
- **Deploy akisi:** `npx vercel` (preview) -> mobilde kontrol -> onay -> `npx vercel --prod`
- **Yeni ozellikler:** Once test hesabiyla dogrulanmali, onaydan sonra herkese acilmali

---

## Dokumantasyon Dosyalari

| Dosya | Icerik |
|-------|--------|
| `docs/plans/2026-03-01-hamza-saas-is-plani.md` | Is plani, rakip analizi, gelir projeksiyonu |
| `docs/plans/2026-03-02-megin-saas-design.md` | Teknik tasarim, onboarding, davet akisi |
| `docs/plans/2026-03-03-takvim-design.md` | Takvim tasarim dokumani |
| `docs/plans/2026-03-04-takvim-bildirim-design.md` | Takvim bildirim sistemi tasarimi |
| `docs/plans/2026-03-04-takvim-bildirim-plan.md` | Takvim bildirim implementasyon plani |
| `docs/reports/2026-03-01-kullanici-yorum-analizi-ve-tr-pazar.md` | Rakip uygulama kullanici yorum analizi |
