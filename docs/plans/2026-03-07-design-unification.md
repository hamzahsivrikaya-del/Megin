# Tasarım Dili Birleştirme — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** LP'deki premium tasarım dilini (warm gradient'lar, hover-lift, card-glow, font-display başlıklar, animasyonlar) admin paneli, client paneli ve auth sayfalarına taşıyarak tüm platformda tutarlı görsel deneyim sağlamak.

**Architecture:** UI primitiflerini (Card, Button, Badge) güncelleyerek tüm sayfaları otomatik yükseltme. Sayfa seviyesinde minimum değişiklik — efektler primitif katmanında eklenerek cascade ile yayılacak. Fonksiyonellik (state, API, mantık) kesinlikle dokunulmayacak.

**Tech Stack:** Tailwind CSS v4, CSS custom properties, next/font/google, mevcut globals.css class'ları

---

## Güvenlik Kuralları

1. **Sadece `className` değişiklikleri** — hiçbir state, prop, API çağrısı, veya iş mantığı değiştirilmeyecek
2. **Mevcut class'ları kullan** — globals.css'deki `hover-lift`, `card-glow`, `text-gradient`, `animate-fade-up` zaten mevcut
3. **Her task sonrası test** — localhost'ta sayfa açılıp görsel kontrol yapılacak
4. **Incremental commit** — her task ayrı commit, rollback kolay

---

## Task 1: globals.css — Panel için yeni utility class'lar

**Files:**
- Modify: `src/app/globals.css` (dosya sonuna ekle)

**Step 1: Panel utility class'larını ekle**

```css
/* ── Panel Design Tokens ── */

.panel-heading {
  font-family: var(--font-display);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: -0.01em;
  color: var(--color-text-primary);
}

.panel-heading-gradient {
  font-family: var(--font-display);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: -0.01em;
  background: linear-gradient(135deg, var(--color-primary), #F97316, var(--color-primary));
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.panel-card {
  background: var(--color-surface);
  border-radius: 1rem;
  border: 1px solid var(--color-border);
  padding: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@media (min-width: 640px) {
  .panel-card {
    padding: 1.5rem;
  }
}

.panel-card:hover {
  border-color: rgba(220, 38, 38, 0.15);
  box-shadow: 0 4px 24px rgba(220, 38, 38, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04);
}

.panel-card-interactive {
  cursor: pointer;
}

.panel-card-interactive:hover {
  transform: translateY(-2px);
}

.panel-stat {
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.04), rgba(249, 115, 22, 0.04));
  border: 1px solid rgba(220, 38, 38, 0.12);
  border-radius: 9999px;
  transition: all 0.2s ease;
}

.panel-stat:hover {
  border-color: rgba(220, 38, 38, 0.25);
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.08);
}

.panel-section-enter {
  animation: fade-up 0.5s ease-out both;
}

.panel-section-enter:nth-child(2) { animation-delay: 0.1s; }
.panel-section-enter:nth-child(3) { animation-delay: 0.2s; }
.panel-section-enter:nth-child(4) { animation-delay: 0.3s; }
.panel-section-enter:nth-child(5) { animation-delay: 0.4s; }

/* Sidebar warm accent */
.sidebar-logo-gradient {
  background: linear-gradient(135deg, var(--color-primary), #F97316);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sidebar-item-active {
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.08), rgba(249, 115, 22, 0.05));
  border-left: 3px solid var(--color-primary);
  color: var(--color-primary);
  font-weight: 500;
}

/* Client navbar warm accent */
.navbar-brand-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), #F97316);
  box-shadow: 0 0 8px rgba(220, 38, 38, 0.3);
}

/* Button warm gradient (LP'deki mkt-cta-gradient'ın panel versiyonu) */
.btn-warm-gradient {
  background: linear-gradient(135deg, var(--color-primary), #E04E2C, #F97316);
  background-size: 200% 200%;
  color: white;
  border: none;
  transition: all 0.3s ease;
}

.btn-warm-gradient:hover {
  background-position: 100% 0;
  box-shadow: 0 4px 16px rgba(220, 38, 38, 0.25);
  transform: translateY(-1px);
}

/* Mobile PWA iyileştirmeleri */
@media (max-width: 640px) {
  .panel-card {
    border-radius: 0.75rem;
  }

  .panel-mobile-full {
    margin-left: -1rem;
    margin-right: -1rem;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
}
```

**Step 2: Verify — dev server'da herhangi bir sayfa aç**

Mevcut hiçbir şey bozulmaz çünkü yeni class'lar ekleniyor, mevcut class'lar değiştirilmiyor.

**Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "style: add panel utility classes for design unification"
```

---

## Task 2: Card bileşenini yükselt

**Files:**
- Modify: `src/components/ui/Card.tsx`

**Step 1: Card'a hover efekti ve warm border ekle**

Mevcut:
```tsx
<div className={`bg-surface rounded-xl border border-border p-4 sm:p-6 ${className}`}
```

Yeni:
```tsx
<div className={`panel-card ${onClick ? 'panel-card-interactive' : ''} ${className}`}
```

CardTitle'a font-display ekle:

Mevcut:
```tsx
<h3 className={`text-lg font-semibold text-text-primary ${className}`}>
```

Yeni:
```tsx
<h3 className={`text-lg font-display font-bold uppercase tracking-tight text-text-primary ${className}`}>
```

**Step 2: Verify — Admin dashboard ve client dashboard aç**

Tüm kartlar otomatik olarak hover efekti alacak. Başlıklar Teko/Oswald font'a geçecek.

**Step 3: Commit**

```bash
git add src/components/ui/Card.tsx
git commit -m "style: upgrade Card with warm hover effects and display font"
```

---

## Task 3: Button bileşenine warm gradient variant ekle

**Files:**
- Modify: `src/components/ui/Button.tsx`

**Step 1: Primary variant'a warm gradient ekle, yeni variant ekle**

Mevcut primary:
```tsx
primary: 'bg-primary text-white hover:bg-primary-dark active:bg-primary-dark shadow-sm',
```

Yeni primary (warm):
```tsx
primary: 'bg-primary text-white hover:bg-primary-dark active:bg-primary-dark shadow-sm hover:shadow-md hover:shadow-primary/10 hover:-translate-y-0.5 active:translate-y-0',
```

Yeni variant ekle:
```tsx
gradient: 'btn-warm-gradient shadow-sm',
```

ButtonVariant type'a `'gradient'` ekle.

**Step 2: Verify — Admin dashboard'daki butonlara bak**

Primary butonlar artık hafif yukarı kayma efekti alacak.

**Step 3: Commit**

```bash
git add src/components/ui/Button.tsx
git commit -m "style: add hover lift to primary button, add gradient variant"
```

---

## Task 4: Badge bileşenine warm aksan ekle

**Files:**
- Modify: `src/components/ui/Badge.tsx`

**Step 1: Primary variant'a warm gradient border ekle**

Mevcut primary:
```tsx
primary: 'bg-primary/10 text-primary border border-primary/20',
```

Yeni primary (warm):
```tsx
primary: 'bg-gradient-to-r from-primary/10 to-orange-500/5 text-primary border border-primary/20',
```

**Step 2: Verify**

**Step 3: Commit**

```bash
git add src/components/ui/Badge.tsx
git commit -m "style: warm gradient accent on primary badge"
```

---

## Task 5: Sidebar — warm gradient logo + aktif link stili

**Files:**
- Modify: `src/components/shared/Sidebar.tsx`

**Step 1: Logo'ya warm gradient, aktif linke left-border stili**

Logo — mevcut:
```tsx
<h1 className="font-display text-lg font-bold text-primary tracking-tight uppercase">
```

Logo — yeni:
```tsx
<h1 className="font-display text-lg font-bold sidebar-logo-gradient tracking-tight uppercase">
```

Aktif link — mevcut:
```tsx
'bg-primary/10 text-primary font-medium'
```

Aktif link — yeni:
```tsx
'sidebar-item-active'
```

Upgrade CTA — mevcut:
```tsx
className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors"
```

Upgrade CTA — yeni:
```tsx
className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg btn-warm-gradient text-white text-sm font-semibold"
```

**Step 2: Verify — Admin panel sidebar kontrol et**

**Step 3: Commit**

```bash
git add src/components/shared/Sidebar.tsx
git commit -m "style: warm gradient sidebar logo + active link accent"
```

---

## Task 6: ClientNavbar — warm aksan + mobil iyileştirme

**Files:**
- Modify: `src/components/shared/ClientNavbar.tsx`

**Step 1: Navbar'a warm aksan ekle**

Header — mevcut:
```tsx
<header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-sm border-b border-border">
```

Header — yeni:
```tsx
<header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-sm border-b border-border shadow-sm">
```

Home link'e warm dot ekle:
```tsx
<Link href="/app" className="group flex items-center gap-2 ...">
  <span className="navbar-brand-dot" />
  ...
```

Mobil nav butonları — padding artır:
```tsx
className="p-2.5 sm:p-0 text-sm ..."  // p-2 → p-2.5 (daha kolay dokunma)
```

**Step 2: Verify — Client dashboard mobil görünüm kontrol et**

**Step 3: Commit**

```bash
git add src/components/shared/ClientNavbar.tsx
git commit -m "style: warm accent navbar + improved mobile touch targets"
```

---

## Task 7: Admin Dashboard — sayfa başlığı + stat kartları + animasyon

**Files:**
- Modify: `src/app/(admin)/admin/page.tsx`

**Step 1: Başlığa font-display, stat çiplerine warm gradient, kartlara animasyon**

Başlık — mevcut:
```tsx
<h1 className="text-2xl font-bold">Anasayfa</h1>
```

Başlık — yeni:
```tsx
<h1 className="text-2xl panel-heading-gradient">Anasayfa</h1>
```

Stat çipleri — mevcut:
```tsx
className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-primary/30 rounded-full text-sm font-medium text-text-primary"
```

Stat çipleri — yeni:
```tsx
className="inline-flex items-center gap-1.5 px-3 py-1.5 panel-stat text-sm font-medium text-text-primary"
```

En dış div'e animasyon ekle — mevcut:
```tsx
<div className="space-y-6">
```

Yeni:
```tsx
<div className="space-y-6 panel-section-enter">
```

**Step 2: Verify — /admin açıp başlık gradient + stat hover kontrol et**

**Step 3: Commit**

```bash
git add src/app/(admin)/admin/page.tsx
git commit -m "style: warm gradient heading + stat chips on admin dashboard"
```

---

## Task 8: Client Dashboard — hoşgeldin kartı + quick links + animasyon

**Files:**
- Modify: `src/app/(client)/app/page.tsx`

**Step 1: Sayfa bölümlerine fade-up animasyon ekle**

En dış div — mevcut:
```tsx
<div className="space-y-6">
```

Yeni:
```tsx
<div className="space-y-6 panel-section-enter">
```

Quick links grid — mevcut:
```tsx
className="bg-surface rounded-xl border border-border p-4 hover:border-primary/20 hover:shadow-sm transition-all group"
```

Quick links — yeni (hover-lift):
```tsx
className="panel-card panel-card-interactive group"
```

Quick link başlıkları — mevcut:
```tsx
className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors"
```

Yeni:
```tsx
className="text-sm font-display font-bold uppercase tracking-tight text-text-primary group-hover:text-primary transition-colors"
```

**Step 2: Verify — /app açıp animasyon + hover efektleri kontrol et**

**Step 3: Commit**

```bash
git add "src/app/(client)/app/page.tsx"
git commit -m "style: fade-up animations + hover-lift on client dashboard"
```

---

## Task 9: Auth sayfaları — LP ile tutarlılık

**Files:**
- Modify: `src/app/(auth)/layout.tsx`
- Modify: `src/app/(auth)/login/page.tsx`

**Step 1: Auth layout'a warm gradient iyileştirmesi**

Sol panel gradient — mevcut:
```tsx
<div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-red-900" />
```

Yeni (turuncu warm accent):
```tsx
<div className="absolute inset-0 bg-gradient-to-br from-primary via-[#E04E2C] to-[#B91C1C]" />
```

İstatistik değerlerini font-display — zaten mevcut, kontrol et.

**Step 2: Login sayfasındaki submit button'a warm gradient**

Login submit — mevcut:
```tsx
className="w-full bg-primary text-white ..."
```

Yeni:
```tsx
className="w-full btn-warm-gradient ..."
```

**Step 3: Verify — /login aç, gradient ve buton kontrol et**

**Step 4: Commit**

```bash
git add src/app/(auth)/layout.tsx src/app/(auth)/login/page.tsx
git commit -m "style: warm gradient auth layout + login button"
```

---

## Task 10: Tüm admin sayfalarının başlıklarını font-display'e taşı

**Files:**
- Modify: Tüm `src/app/(admin)/admin/*/page.tsx` dosyaları

**Step 1: h1 başlıklarını güncelle**

Her admin sayfasındaki `<h1 className="text-2xl font-bold">` → `<h1 className="text-2xl panel-heading">` olarak güncelle.

Hedef dosyalar:
- `admin/members/page.tsx` veya `MembersList.tsx`
- `admin/takvim/page.tsx`
- `admin/settings/page.tsx`
- `admin/workouts/page.tsx`
- `admin/finance/page.tsx`
- `admin/blog/page.tsx`
- `admin/notifications/page.tsx`
- `admin/lessons/today/page.tsx`
- `admin/lessons/new/page.tsx`
- `admin/measurements/new/page.tsx`
- `admin/packages/new/page.tsx`

**Step 2: Verify — birkaç admin sayfasını aç, font kontrol et**

**Step 3: Commit**

```bash
git add src/app/(admin)/
git commit -m "style: font-display headings across all admin pages"
```

---

## Task 11: Tüm client sayfalarına fade-up animasyon ekle

**Files:**
- Modify: `src/app/(client)/app/*/page.tsx` dosyaları

**Step 1: Her client sayfa container'ına `panel-section-enter` ekle**

Hedef dosyalar:
- `app/beslenme/page.tsx`
- `app/program/page.tsx`
- `app/progress/page.tsx`
- `app/haftalik-ozet/page.tsx`
- `app/packages/page.tsx`
- `app/rozetler/page.tsx`
- `app/notifications/page.tsx`
- `app/settings/page.tsx`
- `app/blog/page.tsx`
- `app/aliskanliklar/page.tsx`

**Step 2: Verify — birkaç sayfayı aç, animasyon kontrol et**

**Step 3: Commit**

```bash
git add "src/app/(client)/"
git commit -m "style: fade-up animations on all client pages"
```

---

## Task 12: Mobil PWA iyileştirmeleri

**Files:**
- Modify: `src/app/(admin)/AdminLayoutClient.tsx`
- Modify: `src/components/shared/MobileSidebar.tsx`

**Step 1: Admin layout mobil padding iyileştirmesi**

Mevcut:
```tsx
<div className="p-4 md:p-6 pt-16 md:pt-6">
```

Yeni (safe-area-inset desteği):
```tsx
<div className="p-4 md:p-6 pt-16 md:pt-6 pb-safe">
```

globals.css'e ekle:
```css
/* PWA safe area */
.pb-safe {
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}

.pt-safe {
  padding-top: max(1rem, env(safe-area-inset-top));
}
```

**Step 2: MobileSidebar'a warm accent**

Hamburger buton — ikonun rengi: `text-text-primary` → `text-primary`

**Step 3: Verify — mobil görünümde test et**

**Step 4: Commit**

```bash
git add src/app/globals.css src/app/(admin)/AdminLayoutClient.tsx src/components/shared/MobileSidebar.tsx
git commit -m "style: PWA safe-area support + mobile sidebar warm accent"
```

---

## Task 13: Final görsel kontrol + commit

**Step 1: Tüm sayfaları kontrol et**

Kontrol listesi:
- [ ] `/login` — warm gradient, buton
- [ ] `/admin` (dashboard) — heading gradient, stat çipleri, kartlar
- [ ] `/admin/takvim` — font-display heading
- [ ] `/admin/members` — font-display heading, kartlar
- [ ] `/app` (client dashboard) — animasyon, quick links hover
- [ ] `/app/beslenme` — animasyon
- [ ] `/app/progress` — animasyon
- [ ] Mobil: Admin sidebar, client navbar, safe-area

**Step 2: Tüm değişiklikleri birleştiren commit**

```bash
git add -A
git commit -m "style: design language unification — LP visual consistency across all panels"
```

---

## Özet

| Task | Dosya | Etki | Risk |
|------|-------|------|------|
| 1 | globals.css | Yeni utility class'lar | Sıfır — sadece ekleme |
| 2 | Card.tsx | Tüm kartlara hover efekti | Düşük — class değişimi |
| 3 | Button.tsx | Primary butonlara lift efekti | Düşük — class ekleme |
| 4 | Badge.tsx | Primary badge'e warm gradient | Sıfır — subtle değişim |
| 5 | Sidebar.tsx | Logo gradient + aktif link | Düşük — class değişimi |
| 6 | ClientNavbar.tsx | Warm dot + shadow | Düşük — class ekleme |
| 7 | admin/page.tsx | Heading gradient + stat stili | Düşük — class değişimi |
| 8 | client/page.tsx | Animasyon + hover-lift | Düşük — class ekleme |
| 9 | auth layout + login | Warm gradient | Düşük — renk değişimi |
| 10 | Tüm admin h1'ler | font-display heading | Sıfır — class değişimi |
| 11 | Tüm client sayfalar | fade-up animasyon | Sıfır — class ekleme |
| 12 | Layout + Mobile | PWA safe-area | Düşük — padding ekleme |
| 13 | — | Final kontrol | — |

**Toplam risk:** Çok düşük. Tüm değişiklikler CSS class seviyesinde. Hiçbir state, prop, API çağrısı veya iş mantığı değiştirilmiyor.
