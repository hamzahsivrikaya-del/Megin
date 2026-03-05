# Danışan Ekleme & Davet Linki Sistemi — Tasarım

**Tarih:** 2026-03-03
**Durum:** Brainstorming tamamlandı, onaylandı

---

## Özet

PT danışanını ekler → davet linki oluşur → WhatsApp'tan atar → danışan tıklar → mini kayıt formu → kendi dashboard'una düşer. Sonraki girişlerde PT ve danışan aynı login sayfasından giriş yapar, sistem rolü algılayıp doğru dashboard'a yönlendirir.

---

## Kararlar

| Konu | Karar |
|------|-------|
| Danışan davet linkinde ne görür? | **Mini kayıt formu** — foto + ad soyad (pre-filled) + şifre oluştur |
| Danışan sonraki girişlerde nereden girer? | **Aynı login sayfası** (`/login`) — sistem rolü algılar |
| Kayıt sayfasında danışan uyarısı? | **Evet** — "Danışan mısın? Antrenörünüzden davet linki isteyin." notu |
| Davet linki nerede görünür? | **Ekleme anında popup + danışan listesinde** "Bekleyen" badge ile |
| Davet linki yapısı | **PT handle + token** — `megin.com/{handle}/davet/{token}` |
| Davet linki süresi | **Süresiz** — danışan kaydolana kadar aktif, kullanılınca ölür |

---

## Akış 1: PT Danışan Ekler

```
PT Dashboard → Danışanlar → "Yeni Danışan Ekle" butonu
    ↓
Modal açılır:
┌─ Yeni Danışan Ekle ─────────────────┐
│                                      │
│  Ad Soyad:    [____________]         │
│  Email:       [____________]         │
│  Telefon:     [____________]         │
│  Cinsiyet:    [Seçiniz ▼]           │
│                                      │
│         [İptal]  [Danışan Ekle]      │
└──────────────────────────────────────┘
    ↓
Başarılı → Popup:
┌──────────────────────────────────────┐
│  ✅ Ayşe Yılmaz eklendi!             │
│                                      │
│  Davet linki:                        │
│  [megin.com/hamza/davet/abc123] 📋   │
│                                      │
│  [WhatsApp'ta Gönder]  [Kopyala]     │
└──────────────────────────────────────┘
```

### Backend işlemleri:
1. `clients` tablosuna kayıt oluştur (status: `pending`)
2. Rastgele token üret, `invite_tokens` tablosuna kaydet
3. Supabase Auth'da henüz kullanıcı OLUŞTURMA — danışan kaydolunca oluşacak

---

## Akış 2: Danışan Davet Linkine Tıklar

```
megin.com/hamza/davet/abc123
    ↓
Token geçerli mi? → Evet
    ↓
Mini kayıt formu:
┌─ Megin'e Hoş Geldin! ───────────────┐
│                                      │
│  Antrenörün: Hamza Sivrikaya         │
│                                      │
│  [Profil fotoğrafı ekle]             │
│                                      │
│  Ad Soyad:  [Ayşe Yılmaz] (pre-fill)│
│  Email:     ayse@email.com (readonly)│
│  Şifre:     [••••••••]              │
│  Şifre tekrar: [••••••••]           │
│                                      │
│  [Hesabımı Oluştur]                  │
└──────────────────────────────────────┘
    ↓
Kayıt başarılı:
1. Supabase Auth'da kullanıcı oluştur (role: client)
2. clients tablosundaki status: pending → active
3. invite_tokens tablosundaki token: used_at = now()
4. Danışan dashboard'una yönlendir
```

### Token geçersizse:
```
┌──────────────────────────────────────┐
│  Bu davet linki artık geçerli değil. │
│                                      │
│  Zaten kayıtlıysan:                 │
│  [Giriş Yap]                        │
│                                      │
│  Değilsen antrenöründen yeni         │
│  davet linki iste.                   │
└──────────────────────────────────────┘
```

---

## Akış 3: Danışan Tekrar Giriş

```
megin.com → "Giriş Yap" → /login
    ↓
Email + şifre girer
    ↓
Sistem rolü algılar:
  - role = trainer → /dashboard (PT dashboard)
  - role = client  → /app (danışan dashboard)
```

---

## Akış 4: PT Davet Linkini Tekrar Bulma

```
PT Dashboard → Danışanlar
    ↓
Danışan listesinde:
  - Kaydolmuş danışan: normal görünüm
  - Bekleyen danışan: "Bekleyen" badge + davet linki ikonu
    ↓
İkona tıkla → link kopyala / WhatsApp'a gönder
```

---

## Veritabanı Değişiklikleri

### Yeni tablo: `invite_tokens`

```sql
CREATE TABLE invite_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainers(id),
  client_id UUID NOT NULL REFERENCES clients(id),
  token TEXT NOT NULL UNIQUE,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_invite_tokens_token ON invite_tokens(token);
```

### `clients` tablosuna ekleme:

```sql
ALTER TABLE clients ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive'));
```

---

## Sayfa/Route Listesi

| Route | Açıklama |
|-------|----------|
| `/(trainer)/dashboard/clients/page.tsx` | Danışan listesi + ekleme modal |
| `/[handle]/davet/[token]/page.tsx` | Danışan kayıt formu (public) |
| `/api/trainer/clients/route.ts` | POST: danışan ekle + token oluştur |
| `/api/invite/[token]/route.ts` | GET: token doğrula, POST: danışan kaydol |

---

## Signup Sayfası Notu

`/signup` sayfasının altına eklenecek:

> Danışan mısın? Antrenörünüzden davet linki isteyin.

---

## WhatsApp Gönder Butonu

```
https://wa.me/?text=Merhaba! Megin'e katılmak için bu linke tıkla: megin.com/hamza/davet/abc123
```

Yeni pencerede açılır, danışanın numarası biliniyorsa `wa.me/905XXXXXXXXX` ile direkt gönderilir.
