# Megin SaaS — Tasarım Dokümanı

**Tarih:** 2026-03-02
**Durum:** Brainstorming tamamlandı, implementasyon öncesi
**Proje:** Megin — Personal Trainer SaaS Platformu
**Repo:** /Users/hamzasivrikaya/Projects/Megin (sıfırdan, bağımsız)
**Referans:** hamza-web-site (mevcut tek-tenant PT platformu)

---

## 1. Genel Bakış

Megin, personal trainer'ların danışan takibi, ödeme kontrolü, antrenman programlama, beslenme takibi ve danışan bağlılığı araçlarını tek çatı altında sunan bir SaaS platformu.

**Temel ilke:** Mevcut hamza-web-site sıfırdan referans alınarak yazılacak. Ayrı repo, ayrı DB, ayrı Supabase instance. megin.ai çalışmaya devam eder, Hamza ileride Megin'e ilk kullanıcı olarak geçer.

---

## 2. Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js (App Router) + TypeScript + React |
| Styling | Tailwind CSS |
| Backend/DB | Supabase (Auth + PostgreSQL + Storage + Realtime) |
| Auth | Supabase Auth (Google SSO + Email/Password) |
| Ödeme | PayTR |
| Error Tracking | Sentry (ücretsiz — 5K hata/ay) |
| Analytics | Microsoft Clarity (ücretsiz, limitsiz) |
| Deploy | Vercel |
| PWA | manifest.json + service worker |

---

## 3. Kullanıcı Akışı

### PT Kayıt & Onboarding

```
Landing Page (Gürsu yapıyor)
  → "Kayıt Ol" butonu
    → Google SSO veya Email + Şifre
      → Email doğrulama
        → Onboarding (ayrı sayfa, 7 adım)
          → Dashboard (dolu — örnek danışan + pakete göre kilitli özellikler)
```

### Onboarding Adımları (7 adım)

| # | Adım | İçerik |
|---|------|--------|
| 1 | Hoş geldin | "Megin'e hoş geldin! Profilini kuralım." |
| 2 | Kişisel bilgiler | Ad-soyad, profil fotoğrafı |
| 3 | Username seç | @hamza → megin.com/hamza (handle, benzersizlik kontrolü) |
| 4 | İşin hakkında | Uzmanlık alanı (PT / Pilates / Yoga / Diyetisyen / Diğer), deneyim yılı |
| 5 | Danışan durumu | Şu an kaç aktif danışanın var? (0-5 / 5-15 / 15-30 / 30+) |
| 6 | Bizi nereden buldun | Instagram / Arkadaş tavsiyesi / Google / Diğer |
| 7 | Hazırsın! | Confetti animasyonu + "İlk danışanını davet et" butonu |

**Not:** Bildirim izni onboarding'de istenmeyecek. Dashboard'da doğal bir anda istenecek (daha yüksek dönüşüm).

### Danışan Katılım Akışı

```
PT danışanı ekler (isim, email, telefon)
  → Sistem davet linki oluşturur
    → PT linki WhatsApp'tan danışana atar
      → Danışan tıklar, şifre oluşturur
        → Danışan kendi dashboard'una girer
```

PT kontrolü elinde tutuyor. Danışan kendi başına kayıt olamıyor.

---

## 4. PT Handle Yapısı

- **Format:** `megin.com/username`
- **İşlev:** Public profil sayfası (ad, foto, uzmanlık alanı, deneyim)
- **Kurallar:** Benzersiz, küçük harf, alfanümerik + tire
- **Onboarding'de seçilir**, sonradan değiştirilebilir

---

## 5. Dashboard & Paket Yapısı

### PT Dashboard

Mevcut hamza-web-site admin panelinin multi-tenant versiyonu. Tüm özellikler görünür, pakete göre bazıları kilitli.

**Kilitli özellik gösterimi:** Özellik kartı görünür ama üzerine tıklanınca "Pro'ya geç" mesajı çıkar. PT ürünün tamamını görür, değerini anlar.

### Paket Detayları

Sonra belirlenecek. Şimdilik bilinenler:
- Free tier olacak (sınırlı danışan sayısı)
- Pro tier olacak (sınırsız danışan, tüm özellikler)
- Studio tier olabilir (çoklu antrenör, salon yönetimi)
- Sabit fiyat, danışan sayısına göre artmayacak

### Empty State

PT ilk girdiğinde:
- **1 örnek danışan profili** — açıkça "Örnek Danışan" etiketli, tüm özellikler dolu (ölçüm, beslenme, program, grafikler)
- **Diğer kartlar** — boş state + CTA ("İlk danışanını ekle", "İlk programını oluştur")
- PT ürünün nasıl göründüğünü görür + ne yapması gerektiğini bilir

---

## 6. Finans Ekranı

Ayrı sayfa, PT'nin gelir durumunu ve geleceğe dönük tahminini gösterir.

### Bölüm 1 — Aylık Özet

```
Bu ay / Geçen ay / Son 3 ay toggle
─────────────────────────────────
Toplam gelir          26.000₺
Ödenen                19.500₺
Bekleyen               6.500₺
─────────────────────────────────
Aktif paketler              8
Bu ay biten paketler        3
Yeni paketler               2
```

### Bölüm 2 — Paket Listesi

```
Danışan   Paket      Fiyat     Ödeme     Kalan Ders
Ayşe      10 ders    13.000₺   Ödendi ✅   2
Mehmet    10 ders    13.000₺   Bekliyor ⏳  4
Ali       10 ders    13.000₺   Ödendi ✅   8
...
```

### Bölüm 3 — Gelecek Ay Tahmini

Danışanın ders tüketim hızına bakarak tahmini paket bitiş tarihi hesaplanır.

**Hesaplama:** `kalan ders ÷ haftalık ortalama ders tüketim hızı = tahmini bitiş`

```
Beklenen yenileme:        3 paket
Tahmini gelir:           39.000₺

  Ayşe   → 2 ders kaldı → ~10 gün sonra biter
  Mehmet → 4 ders kaldı → ~3 hafta sonra biter
  Ali    → 1 ders kaldı → ~3 gün sonra biter
```

---

## 7. Bildirim Sistemi

**Yön:** Danışan → PT (danışan aksiyon aldığında PT'ye bildirim)
**Kanal:** Push bildirim + uygulama içi (bildirim zili)

### Tetikleyiciler

| Danışan Aksiyonu | Bildirim |
|-----------------|----------|
| Beslenme kaydı girdi | "Ayşe bugünkü öğünlerini tamamladı" |
| Beslenme fotoğrafı yükledi | "Mehmet öğle yemeği fotoğrafı ekledi" |
| Ölçüm güncellendi | "Ayşe yeni ölçüm girdi: 72.5kg" |
| Hedefe ulaştı | "Mehmet hedef kilosuna ulaştı!" |
| Rozet kazandı | "Ayşe '10. Ders' rozetini kazandı" |
| 3+ gün giriş yapmadı | "Mehmet 3 gündür giriş yapmadı" |
| Davet linkinden kayıt oldu | "Yeni danışan: Ali kayıt oldu" |

**Not:** Mevcut hamza-web-site'taki PT→danışan yönlü bildirimler de (hatırlatma, motivasyon, rozet) korunacak.

---

## 8. Güvenlik

### Mevcut (hamza-web-site'tan taşınacak)
- Supabase RLS (Row Level Security)
- CSP header (Content Security Policy)
- HSTS + security headers
- Timing-safe auth karşılaştırma
- Open redirect koruması

### SaaS için ek
- **Tenant izolasyonu (RLS)** — PT sadece kendi danışanlarını görsün, başka PT'nin verisine erişemesin. Tüm tablolarda `tenant_id`.
- **Rate limiting** — Login, kayıt, davet API'larına brute force koruması
- **Cloudflare Turnstile** — Kayıt formunda bot koruması (ücretsiz)

---

## 9. Üçüncü Parti Entegrasyonlar

| Servis | Amaç | Fiyat |
|--------|------|-------|
| Sentry | Hata yakalama, crash raporlama | Ücretsiz (5K hata/ay) |
| Microsoft Clarity | Session replay, heatmap, kullanıcı davranış analizi | Ücretsiz (limitsiz) |
| PayTR | Ödeme altyapısı, abonelik tahsilat | Komisyon bazlı (~%1.45-2.8) |
| Cloudflare Turnstile | Bot koruması (kayıt formu) | Ücretsiz |

---

## 10. Görev Dağılımı

### Hamza (biz)
- Supabase Auth (Google SSO + Email kayıt/giriş)
- PT Sign-Up → Onboarding → Dashboard akışı
- PT Handle `/username`
- Danışan davet sistemi
- Danışan giriş ekranı
- Finans ekranı (aylık özet + tahmin)
- PT Hesap & Üyelik Bilgileri ekranı
- PayTR ödeme altyapısı + paket kısıtlama
- Empty state ekranları (örnek danışan)
- Bildirim sistemi (danışan → PT)
- Database (multi-tenant, audit log)
- Sentry + Clarity kurulumu
- Güvenlik (tenant izolasyonu, rate limiting, Turnstile)

### Gürsu
- Landing page (PT ve GYM soon)
- Paketler ve detayları sayfası
- Landing page alt sayfaları
- Domain bağlama

---

## 11. Mevcut hamza-web-site Özellikleri (Referans)

Megin'e taşınacak/yeniden yazılacak özellikler:

| Özellik | hamza-web-site Durumu | Megin'de |
|---------|----------------------|----------|
| Danışan yönetimi (CRUD) | Canlı | Yeniden yaz (multi-tenant) |
| Ders/Paket takibi | Canlı | Yeniden yaz |
| Ölçüm girişi + grafikler | Canlı | Yeniden yaz |
| Antrenman programı | Canlı | Yeniden yaz |
| Beslenme takibi (öğün + foto) | Canlı | Yeniden yaz |
| Haftalık raporlar | Canlı | Yeniden yaz |
| Rozet sistemi (23 rozet) | Canlı | Yeniden yaz |
| İlerleme fotoğrafları | Canlı | Yeniden yaz |
| Blog | Canlı | Yeniden yaz |
| Fitness araçları (7 adet) | Canlı | Yeniden yaz |
| Push bildirimler | Canlı | Yeniden yaz |
| Bağlı üye (veli-çocuk) | Canlı | Yeniden yaz |
| Onboarding | Canlı (4 adım) | Yeniden yaz (7 adım) |
| Yasal sayfalar | Canlı | Yeniden yaz |
| Finans ekranı | Yok | Yeni |
| Multi-tenant | Yok | Yeni |
| Danışan davet linki | Yok | Yeni |
| PT Handle | Yok | Yeni |
| Paket kısıtlama | Yok | Yeni |
| Tenant izolasyonu | Yok | Yeni |

---

## Sonraki Adımlar

1. [ ] Paket yapısı detayları (Free/Pro/Studio — fiyat, özellik dağılımı)
2. [ ] Teknik implementasyon planı (Faz 0 — auth, DB şeması, multi-tenant altyapı)
3. [ ] Landing page sonrası ilk sprint başlangıcı
4. [ ] Gürsu ile LP koordinasyonu

---

*Bu doküman canlı olarak güncellenecektir.*
*v1: 2026-03-02 — Brainstorming oturumu*
