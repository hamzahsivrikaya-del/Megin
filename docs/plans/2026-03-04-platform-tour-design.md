# Platform Turu (Onboarding Gezinti) Tasarım Dokümanı

## Özet
Onboarding bittikten sonra kullanıcıya platformu tanıtan adım adım bir tur. Onboarding'in devamı olarak çalışır (aynı tam ekran wizard formatı). Her adımda "Şimdi Dene", "Bu Adımı Atla" ve "Turu Bitir" seçenekleri var. Tamamlanmamış adımlar Profil/Ayarlar sayfasında checklist olarak görünür.

## Genel Akış

### PT (Antrenör)
```
[Mevcut 7 adım onboarding] → "Platformu Tanıyalım"
  → Üye Davet Et → Antrenman Oluştur → Ölçüm Kaydet
  → Bildirim Gönder(🔒 Free) → Profilini Tamamla → Dashboard
```

### Üye (Client)
```
[Mevcut 4 adım onboarding] → "Platformu Tanıyalım"
  → Profilini İncele → Ölçümlerini Gör
  → Rozetlerini Keşfet(🔒 Free) → İlerleme Sayfan → Dashboard
```

## PT Tur Adımları

| # | Key | Adım | İkon | Açıklama | CTA | Kilitli? |
|---|-----|------|------|----------|-----|----------|
| 1 | `invite_client` | Üye Davet Et | 👥 | Davet linki oluştur, üyenle paylaş. WhatsApp veya kopyala-yapıştır ile gönder. | → `/dashboard/clients` | Hayır |
| 2 | `create_workout` | Antrenman Oluştur | 🏋️ | Üyene özel antrenman programı oluştur. Egzersiz, set, tekrar belirle. | → `/dashboard/workouts` | Hayır |
| 3 | `record_measurement` | Ölçüm Kaydet | 📏 | Üyenin kilo, boy ve vücut ölçümlerini takip et. | → `/dashboard/clients/[id]` (ölçümler) | Hayır |
| 4 | `send_notification` | Bildirim Gönder | 🔔 | Üyelerine motivasyon mesajı veya hatırlatma gönder. | → Bildirim sayfası | 🔒 Free (`push_notifications`) |
| 5 | `complete_profile` | Profilini Tamamla | ⚙️ | Bio, telefon, sosyal medya linklerini ekle. Davet sayfan daha profesyonel görünsün. | → `/dashboard/settings` | Hayır |

## Üye Tur Adımları

| # | Key | Adım | İkon | Açıklama | CTA | Kilitli? |
|---|-----|------|------|----------|-----|----------|
| 1 | `view_profile` | Profilini İncele | 👤 | Ayarlardan fotoğrafını, bilgilerini düzenleyebilirsin. | → `/app/settings` | Hayır |
| 2 | `view_measurements` | Ölçümlerini Gör | 📏 | Antrenörünün kaydettiği ölçümlerin burada. Kilo, boy, vücut ölçüleri. | → `/app/progress` | Hayır |
| 3 | `explore_badges` | Rozetlerini Keşfet | 🏅 | Antrenmanlarını tamamladıkça rozetler kazan! | → `/app/rozetler` | 🔒 Free (`badges`) |
| 4 | `view_progress` | İlerleme Sayfan | 📊 | Genel gelişimini ve istatistiklerini buradan takip et. | → `/app/progress` | Hayır |

## Her Tur Adımındaki Butonlar

```
[Şimdi Dene]           → İlgili sayfaya götürür
[Bu Adımı Atla →]      → Sonraki tur adımına geçer
[Turu Bitir]           → Tüm adımları atla, direkt dashboard'a git

Kilitli adımlarda:
[Pro ile Aç]           → Upgrade sayfasına götürür
[Bu Adımı Atla →]      → Sonraki tur adımına geçer
```

## Veritabanı

`trainers` ve `clients` tablolarına yeni kolon:

```sql
ALTER TABLE trainers ADD COLUMN tour_progress JSONB DEFAULT NULL;
ALTER TABLE clients ADD COLUMN tour_progress JSONB DEFAULT NULL;
```

Örnek değer:
```json
{
  "completed": ["invite_client", "complete_profile"],
  "skipped": ["send_notification"],
  "dismissed": false
}
```

- `completed` — Gerçek aksiyonu aldı
- `skipped` — "Bu adımı atla" dedi
- `dismissed` — "Turu Bitir" dedi
- `NULL` — Henüz tura gelmedi

## Tamamlama Tespiti

### PT — Gerçek aksiyon gerekli:

| Adım | Tamamlandı sayılır | Tespit |
|------|--------------------|--------|
| `invite_client` | Bir davet oluşturuldu | `clients` tablosunda trainer'a ait en az 1 kayıt |
| `create_workout` | Bir workout kaydedildi | `workouts` tablosunda en az 1 kayıt |
| `record_measurement` | Bir ölçüm girildi | `measurements` tablosunda en az 1 kayıt |
| `send_notification` | Plan kontrolü | 🔒 `push_notifications` feature |
| `complete_profile` | Bio veya telefon eklendi | `trainers.bio` veya `phone` NOT NULL |

### Üye — Sayfa ziyareti yeterli (üye pasif):

| Adım | Tamamlandı sayılır | Tespit |
|------|--------------------|--------|
| `view_profile` | Ayarlar sayfasını ziyaret etti | `tour_progress.completed` içinde `view_profile` var |
| `view_measurements` | Progress sayfasını ziyaret etti | `tour_progress.completed` içinde `view_measurements` var |
| `explore_badges` | Plan kontrolü | 🔒 `badges` feature |
| `view_progress` | Progress sayfasını ziyaret etti | `tour_progress.completed` içinde `view_progress` var |

## Profil/Ayarlar Sayfasında Görünüm

Ayarlar sayfasına "Platform Rehberi" bölümü eklenir:

```
📋 Platform Rehberi
├── ✅ Üye davet et
├── ✅ Profilini tamamla
├── ◻️ Antrenman programı oluştur    [→ Git]
├── ◻️ Ölçüm kaydet                 [→ Git]
└── 🔒 Bildirim gönder              [Pro ile Aç]

İlerleme: 2/5 tamamlandı
```

- Tamamlanmamış adımlar tıklanabilir (ilgili sayfaya götürür)
- Kilitli adımlar upgrade sayfasına yönlendirir
- Tüm adımlar tamamlandığında: "Tebrikler! Platformu keşfettin." mesajı

## Plan Kısıtlaması

`plans.ts` → `lockedFeatures` array'i kullanılır:
- Free: `push_notifications`, `badges`, `measurement_charts` vb. kilitli
- Pro: `badges`, `dependents`, `progress_photos` vb. kilitli
- Elite: Hiçbir şey kilitli değil

Kilitli adımlar turda gösterilir ama CTA "Pro ile Aç" olur → doğal upsell noktası.

## Tasarım İlkeleri

- Onboarding ile aynı tam ekran wizard formatı (tutarlılık)
- Light theme: surface #FFFFFF, background #FAFAFA
- Primary #DC2626 accent
- Tipografi: Oswald (başlıklar) + Geist (body)
- Her adımda fade-in animasyonu
- Mobile-first, responsive
