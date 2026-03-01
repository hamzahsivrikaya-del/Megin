# Hamza PT — Kişisel Antrenör Üye Takip Platformu

> **Site:** https://hamzasivrikaya.com | **Repo:** github.com/hamzahsivrikaya-del/hamza-web-site (private)
> **Deploy:** Vercel Hobby | **DB:** Supabase Cloud | **Dil:** Türkçe

---

## Teknoloji Stack

- **Framework:** Next.js 16 (App Router) + TypeScript + React 19
- **Styling:** Tailwind CSS v4
- **Backend:** Supabase (Auth + PostgreSQL + Storage + Realtime)
- **Grafikler:** Recharts (lazy-loaded)
- **Editör:** Tiptap (blog yazımı)
- **PDF:** jspdf + jspdf-autotable (ölçüm raporları)
- **Push:** web-push (VAPID)
- **PWA:** manifest.json + sw.js (v3 cache)

---

## Proje Yapısı

```
src/
├── app/
│   ├── (auth)/login/              # Giriş, şifre sıfırlama
│   ├── (admin)/admin/             # Admin paneli (sidebar layout)
│   │   ├── members/[id]/          # Üye detay (4 tab)
│   │   ├── lessons/new|today/     # Ders oluştur / günlük yoklama
│   │   ├── measurements/new/      # Ölçüm girişi
│   │   ├── packages/new/          # Paket oluştur
│   │   ├── workouts/              # Antrenman yönetimi
│   │   ├── blog/                  # Blog yönetimi
│   │   ├── notifications/         # Manuel bildirim gönder
│   │   └── settings/              # Cron tetikleyiciler
│   ├── (member)/dashboard/        # Üye paneli (navbar layout)
│   │   ├── beslenme/              # Beslenme takibi (14 gün grid)
│   │   ├── program/               # Haftalık antrenman
│   │   ├── progress/              # Ölçüm + grafik + hedefler
│   │   ├── haftalik-ozet/         # Haftalık rapor listesi
│   │   ├── notifications/         # Bildirim geçmişi
│   │   ├── packages/              # Paket bilgileri
│   │   ├── settings/              # Profil ayarları
│   │   ├── rozetler/              # Başarı rozetleri
│   │   └── cocuk/[id]/            # Bağlı üye dashboard
│   ├── blog/[slug]/               # Public blog
│   ├── araclar/                   # 7 fitness hesaplayıcı
│   ├── antrenmanlar/              # Public haftalık antrenmanlar
│   ├── yasal/                     # Yasal sayfalar
│   └── api/
│       ├── auth/callback/         # OAuth callback
│       ├── push/subscribe|send/   # Push bildirim API
│       ├── cron/                  # weekly-report, nutrition-reminder, badge-notify
│       ├── admin/members/         # Üye CRUD
│       ├── goals/                 # Hedef CRUD
│       ├── badges/                # Rozet sorgulama
│       ├── progress-photos/       # İlerleme fotoğrafı
│       └── share/                 # OG image oluşturma (Instagram kart)
├── components/
│   ├── ui/                        # Button, Card, Input, Modal, Badge, Select, Textarea
│   └── shared/                    # Navbar, Sidebar, NotificationBell, hesaplayıcılar
└── lib/
    ├── supabase/                  # client.ts, server.ts, middleware.ts, admin.ts
    ├── types.ts                   # Tüm TypeScript tipleri
    ├── utils.ts                   # Tarih, format, yardımcı fonksiyonlar
    ├── auth-utils.ts              # Timing-safe karşılaştırma
    ├── push.ts                    # Push gönderme wrapper
    ├── badges.ts                  # 23 rozet tanımı + hesaplama
    ├── weekly-report.ts           # Haftalık rapor hesaplama
    └── generateMeasurementPdf.ts  # PDF oluşturma (Noto Sans TTF)
```

---

## Veritabanı Tabloları

| Tablo | Açıklama | Önemli Sütunlar |
|-------|----------|-----------------|
| `users` | Kullanıcılar (auth.users FK) | `role`, `parent_id`, `avatar_url`, `nutrition_note`, `is_active` |
| `packages` | Ders paketleri | `total_lessons`, `used_lessons`, `price`, `payment_status`, `status` |
| `lessons` | Yapılan dersler | `package_id`, `user_id`, `date` |
| `measurements` | Vücut ölçümleri | `weight`, `chest/waist/arm/leg`, `sf_chest/abdomen/thigh`, `body_fat_pct` |
| `workouts` | Antrenman programları | `type` (public/member), `day_index`, `week_start` |
| `workout_exercises` | Egzersizler | `section` (warmup/strength/accessory/cardio), `superset_group` |
| `blog_posts` | Blog yazıları | `slug`, `content` (HTML), `status` (draft/published) |
| `meal_logs` | Beslenme kayıtları | `status`, `photo_url`, `is_extra`, `extra_name` |
| `member_meals` | Öğün şablonları | `user_id`, `name`, `order_num` |
| `notifications` | Bildirimler | `type`, `title`, `message`, `is_read` |
| `push_subscriptions` | Push abonelikleri | `endpoint`, `p256dh`, `auth` |
| `weekly_reports` | Haftalık raporlar | `lessons_count`, `nutrition_compliance`, `consecutive_weeks` |
| `member_goals` | Kişisel hedefler | `metric_type`, `target_value` |
| `member_badges` | Kazanılan rozetler | `badge_id`, `earned_at`, `notified` |
| `progress_photos` | İlerleme fotoğrafları | `photo_url`, `angle` (front/side/back), `taken_at` |

**Storage Buckets:** `avatars` (public, 15MB), `progress-photos` (private), `meal-logs` (private), `blog-images` (public)

**Migrations:** `supabase/migrations/` altında 001-042 arası. Push ile: `npx supabase db push --linked`

---

## Kimlik Doğrulama & Güvenlik

- **Auth:** Supabase email/password. `role` sütunu ile admin/member ayrımı
- **Middleware:** `src/middleware.ts` — her istekte `getUser()`, role cache (`x-user-role` cookie, 1 saat TTL)
- **RLS:** Tüm tablolarda aktif. `is_admin()` ve `child_ids()` SECURITY DEFINER fonksiyonları (recursion önleme)
- **API güvenlik:** Cron → `CRON_SECRET` (timing-safe), Service → `SERVICE_ROLE_KEY`
- **CSP:** `next.config.ts`'de Content-Security-Policy header'ı
- **Email:** Türkçe karakter normalizasyonu (ı→i, ş→s, ç→c, ğ→g, ü→u, ö→o)

---

## Cron Jobs (pg_cron)

| Job | Zamanlama | İşlev |
|-----|-----------|-------|
| Haftalık rapor | Pazar 18:00 TR | Ders sayısı, beslenme uyumu, streak hesapla + push |
| Beslenme hatırlatma | Her gün 09:00 TR | "Beslenmeni eklemeyi unutma!" push |
| Rozet bildirimi | Her gün 10:00 TR | Yeni kazanılan rozetleri kontrol et + push |

**Not:** Vercel Hobby cron desteklemez → Supabase pg_cron + pg_net kullanılıyor.

---

## Renk Paleti

| Amaç | Renk | Hex |
|------|------|-----|
| Background | Açık gri | `#FAFAFA` |
| Surface | Beyaz | `#FFFFFF` |
| Primary | Kırmızı | `#DC2626` |
| Text | Koyu | `#1A1A1A` |
| Text Secondary | Taupe | `#57534E` |

**Fontlar:** Geist (body), Oswald/Teko (başlıklar), Lora (serif), Geist Mono (kod), Noto Sans (PDF)

---

## Geliştirme Akışı

```
Yeni branch → kod yaz → push → Vercel preview URL → mobilde test → merge → vercel --prod
```

- `npm run dev` → localhost:3000
- `vercel --prod` → production deploy
- Deploy ~5-10sn geçiş süresi var (üyeler logout olabilir) → günde 1-2 deploy

---

## Kritik Kurallar & Gotcha'lar

### Next.js 16
- `params` Promise olarak gelir: `const { id } = await params`
- `next/og` (Satori): Her div'e `display: flex` zorunlu, JSX fragment `<>` kullanma

### Supabase
- Join tipleri: many-to-one → obje döner, one-to-many → array döner. `[0]` hatası yapma!
- CLI v2.75: `db execute --sql` YOK. `npx supabase db push --linked` kullan
- RLS'de `users` tablosunda subquery ile admin kontrolü → infinite recursion! `is_admin()` fonksiyonunu kullan

### Performans
- Layout/page'de **ASLA** `getUser()` çağırma → `getSession()` kullan (middleware zaten doğruladı)
- Ağır kütüphaneler (Recharts, Tiptap): `dynamic(() => import(...), { ssr: false })` ile lazy load
- `next/image` kullan (`<img>` değil), `fill` + `sizes` prop zorunlu

### UI
- Select component: `children` değil `options` prop kullanır
- Modal: `size` prop → sm/md/lg/xl
- Üye panelinde geri butonları: `<a>` değil `<Link>` kullan (PWA full reload sorunu)
- Blog HTML: `dangerouslySetInnerHTML` → `sanitizeHtml()` ile sarma

### Beslenme
- `is_extra` öğünler tamamlanma oranını ETKİLEMEZ
- 14 günlük kompakt grid + detay modalı
- Fotoğraf limiti: 10MB (beslenme), 15MB (profil)

### Push Bildirimleri
- iOS: PWA olarak ana ekrana eklenmeli + kullanıcı etkileşimi ile izin istenmeli
- `push_subscriptions`: `p256dh` + `auth` ayrı sütunlar (eski `keys` JSONB değil)

### Timezone
- `toISOString()` UTC'ye çevirir → `toDateStr()` helper kullan
- Tüm tarihler YYYY-MM-DD formatında saklanır

### Genel
- `new Date(invalidStr).toISOString()` → RangeError! Her zaman `isNaN(d.getTime())` kontrolü yap
- API fetch sonrası HER ZAMAN `res.ok` kontrol et
- Env var ekleme: `echo` değil `printf` kullan (trailing newline sorunu)
- Middleware public rotalar: `/login`, `/blog`, `/araclar`, `/antrenmanlar`, `/yasal`, `/` — yeni public sayfa → middleware.ts'e ekle!
- CSP header: Yeni harici kaynak → `next.config.ts` güncelle

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

## Bağlı Üye Sistemi (Parent-Child)

- `users.parent_id` → velinin user ID'si
- Fake email: `child-{uuid}@hamzapt.local` (UI'da gizlenir)
- Çocuk dashboardu: `/dashboard/cocuk/[id]` — tek sayfada paket + ders + ölçüm + grafik
- RLS: `child_ids()` SECURITY DEFINER fonksiyonu ile güvenli erişim
- Veli bildirimi: Çocuğun paketi azalınca otomatik push

---

## Rozet (Badge) Sistemi

- **DB:** `member_badges` tablosu (migration 041), 23 rozet, 3 faz (A: başlama, B: yenileme, C: sadakat) + 2 admin özel rozet
- **API:** `/api/badges` — otomatik kazanım + inline push bildirim
- **Cron:** `/api/cron/badge-notify` — her gün 10:00 TR, `notified: false` rozetleri bildirir
- **Sayfa:** `/dashboard/rozetler` — gradient kartlar, emoji, Nunito font
- **Share:** `/api/share/badge/[badgeId]?u=userId` — 1080x1920 PNG (font + CDN cache)
- **Dashboard:** `BadgeStrip` — son 4 kazanılan rozet, kompakt şerit
- **Profil:** `/dashboard/settings` alt bölümde rozet grid + `ShareOverlay` (PNG paylaşım)
- **Performans:** Sayfa yüklenince kazanılan rozetlerin görselleri `imageCache` ref ile preload
- **CSS:** `.badge`, `.badge.locked`, `.badge-share-btn` → `globals.css`
- **Font:** Nunito (layout.tsx'e eklendi, `--font-nunito` CSS variable)
- **Görsel:** `BADGE_VISUALS` — `badges.ts`'de her rozet için emoji, gradient, shadow tanımı

---

## Onboarding

- **Durum:** Temel akış çalışıyor, küçük düzeltmeler bekliyor
- **Sayfa:** `/dashboard/onboarding` — 4 adım (Hoşgeldin → Hedef Belirle → Bildirimler → Hazırsın)
- **API:** `/api/onboarding/complete` — `onboarding_completed = true` yapar
- **Migration:** 040 — `onboarding_completed` kolonu (mevcut üyeler true, yeni üyeler false)
- **Redirect:** Dashboard page'de kontrol — `onboarding_completed = false` ise onboarding'e yönlendir
- **confetti-fall animasyonu:** CSS'de tanımlı

---

## Günlük Motivasyon Mesajları

- **Cron:** `nutrition-reminder` — UTC 06:00 (TR 09:00)
- Her gün farklı mesaj (beslenme + genel motivasyon karışık)
- Pazar/Salı/Perşembe/Cumartesi: genel motivasyon
- Pazartesi/Çarşamba/Cuma: beslenme odaklı

---

## Beslenme Mimarisi

- Admin üyeye öğün atar (`member_meals`) → Üye günlük kayıt girer (`meal_logs`)
- Sabit öğün yok, admin istediği kadar öğün atayabilir (2, 3, 5...)
- Yeni üye → DB trigger ile otomatik Kahvaltı/Öğle/Akşam
- Foto: Supabase Storage `meal_photos` bucket (public), `capture="environment"` ile kamera
- Upsert: `onConflict: 'user_id,date,meal_id'`

---

## Paket Fiyat & Ödeme Takibi

- `packages.price` (NUMERIC) + `packages.payment_status` (paid/unpaid) — migration 039
- Admin: Paket oluştururken fiyat + ödeme durumu girer
- Admin member detail: Ödeme badge'ine tıklayarak toggle
- Üye: Dashboard + Paketlerim sayfasında fiyat ve ödeme durumu görünür
- Fiyat girilmemiş paketlerde hiçbir şey gösterilmez (null kontrolü)
- Helper: `formatPrice()` — utils.ts
- **PayTR:** Başvuru yapıldı, onay bekleniyor. Onay gelince → Mağaza No, Parola, Gizli Anahtar alınacak → test kartlarıyla deneme → canlıya geçiş. Komisyon: ~%1.45-2.8

---

## Monetizasyon Stratejisi

- **Faz 2:** Onboarding, önce/sonra, milestone, streak, gelir dashboard, PWA
- **Faz 3:** SaaS — multi-tenant PT platformu
- Detay: `hamza-web-site-fikir/monetization-strategy.md`

---

## Geliştirme Kuralları

- **Türkçe iletişim** — her zaman
- **Emoji kullanma** dosyalarda (kullanıcı istemediği sürece)
- **Mobil öncelikli tasarım** — hover yerine her zaman görünür butonlar
- **Deploy kuralı:** Kod yazma/test sırasında tüm izinler Claude'da. Deploy öncesi MUTLAKA kullanıcıya sor
- **Deploy akışı:** Her zaman önce `npx vercel` (preview) → kontrol → onay → `npx vercel --prod`. Direkt prod deploy YAPMA
- **Yeni özellikler:** Önce test üyesi (hamza) ile doğrulanmalı, onaydan sonra herkese açılmalı
- **CLAUDE.md güncellemesi:** Her büyük deploy sonrası bu dosya güncellenecek (fikir sekmesindeki bilgiler dahil)
- Yüz yüze ilişki — üye feedback/puanlama sistemi istenmiyor, sadece admin notları
- `frontend-design` skill UI tasarımlarında kullanılacak

---

## Teknik Notlar (Ek)

- Node.js v25.6 — inline eval'da `!` escape sorunu var, `.mjs` dosya kullan
- Supabase keys yeni format: `sb_publishable_`, `sb_secret_` (JWT değil)
- CSS sınıfları: `gradient-border`, `hover-lift`, `card-glow` mevcut
- Theme tokens: `bg-surface`, `text-text-primary`, `border-border`, `text-primary`
- Font: Nunito (rozetler için, `--font-nunito` CSS variable)

---

## Hesaplar

- **Admin:** hamzahsivrikaya@gmail.com / 123456
- **Test üye:** hamzahsivrikaya@hotmail.com / 123456
- **Supabase:** jpftfjhmgdyrnenopays.supabase.co
- **Vercel:** hamzahsivrikaya-5499s-projects/hamza-web-site
- **Domain:** hamzasivrikaya.com (Vercel, 22 Şub 2027'ye kadar)
