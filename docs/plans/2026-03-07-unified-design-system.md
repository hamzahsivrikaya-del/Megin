# Unified Design System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Marketing (`mkt-*`) ve panel (`panel-*`) CSS class'larini tek bir design system altinda birlestirmek — bir component degisince her yerde degismeli.

**Architecture:** CSS class isimlerini birlestirip tek kaynak yaratiyoruz. `mkt-cta-gradient` + `btn-warm-gradient` → `cta-gradient` gibi. Button/Card componentleri bu unified class'lari kullaniyor, marketing `<Link>`'leri de ayni class'lari kullaniyor. CSS'i degistirince hem marketing hem panel degisiyor. Layout-only class'lar (`mkt-section`, `mkt-reveal`, `sidebar-*`) oldugu gibi kaliyor — bunlar context-specific, component degil.

**Tech Stack:** Next.js 16, Tailwind CSS v4, globals.css custom classes

**KRITIK: `text-transform: uppercase` HICBIR heading class'inda OLMAYACAK** — Turkce I/i harfi CSS uppercase ile bozuluyor. Marketing'de buyuk harf istenen yerler kaynak kodda/translation dosyalarinda buyuk harfle yazilmali.

---

## Mevcut Durum

### Iki Ayri Sistem (SORUN)

| Katman | Marketing (41 dosya, 235 kullanim) | Panel (31 dosya, 42 kullanim) |
|--------|-----------------------------------|-------------------------------|
| Heading | `mkt-heading-xl`, `mkt-heading-lg` | `panel-heading`, `panel-heading-gradient` |
| Button | `mkt-cta-gradient`, `mkt-cta-primary`, `mkt-cta-ghost` | `btn-warm-gradient` (Button gradient variant) |
| Glow | `mkt-cta-glow` | — |
| Card | raw HTML + inline Tailwind | `panel-card`, `panel-card-interactive` |
| Layout | `mkt-section`, `mkt-reveal`, `mkt-stagger` | `panel-section-enter`, `panel-stat` |

**Sorun:** Marketing'de `mkt-cta-gradient` rengini degistirirsen panel etkilenmez (`btn-warm-gradient` ayri CSS). Ayni sekilde `panel-heading` font degistirirsen marketing etkilenmez (`mkt-heading-lg` ayri CSS).

### Birlestirme Haritalamasi

| Eski (Marketing) | Eski (Panel) | Yeni (Unified) |
|---|---|---|
| `mkt-heading-xl` | — | `heading-display-xl` |
| `mkt-heading-lg` | `panel-heading` | `heading-display` |
| — | `panel-heading-gradient` | `heading-gradient` |
| `mkt-cta-gradient` | `btn-warm-gradient` | `cta-gradient` |
| `mkt-cta-primary` | — | `cta-primary` |
| `mkt-cta-ghost` | — | `cta-ghost` |
| `mkt-cta-glow` | — | `cta-glow` |
| `mkt-heading-accent` | — | `heading-accent` |

**DEGISMEYEN class'lar (context-specific, birlestirmeye gerek yok):**
- Marketing layout: `mkt-section`, `mkt-container`, `mkt-section-dark`, `mkt-section-dark-warm`, `mkt-gradient-bg`, `mkt-grain`, `mkt-pattern-diagonal`
- Marketing animation: `mkt-reveal`, `mkt-reveal-left`, `mkt-reveal-scale`, `mkt-stagger`, `mkt-pulse-emphasis`
- Marketing bespoke: `mkt-glass`, `mkt-glow-warm`, `mkt-gradient-border`, `mkt-trust-badge*`, `mkt-testimonial-card`, `mkt-pricing-toggle`
- Panel layout: `panel-card`, `panel-card-interactive`, `panel-stat`, `panel-section-enter`, `panel-mobile-full`
- Panel nav: `sidebar-logo-gradient`, `sidebar-item-active`, `navbar-brand-dot`
- PWA: `pb-safe`, `pt-safe`

---

## Task 1: CSS Foundation — globals.css Unified Classes

**Files:**
- Modify: `src/app/globals.css`

**Step 1: Heading class'larini birlestir**

`globals.css`'de `mkt-heading-xl` (satir ~794) ve `mkt-heading-lg` (satir ~802) class'larini bul. Ayrica `panel-heading` (satir ~1288) ve `panel-heading-gradient` (satir ~1296) class'larini bul.

Mevcut `mkt-heading-xl` ve `mkt-heading-lg` tanimlarini **yeni isimlerle** degistir. Eski isimleri alias olarak ekle (geriye uyumluluk icin gecici).

```css
/* ── Unified Heading System ── */

/* Display heading — Oswald font, no uppercase (Turkish I fix) */
.heading-display,
.mkt-heading-lg,
.panel-heading {
  font-family: var(--font-oswald), var(--font-display), Impact, sans-serif;
  font-weight: 700;
  letter-spacing: 0.01em;
  line-height: 1.05;
  color: var(--color-text-primary);
}

/* Display heading XL — same font, tighter line-height */
.heading-display-xl,
.mkt-heading-xl {
  font-family: var(--font-oswald), var(--font-display), Impact, sans-serif;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 0.95;
}

/* Gradient heading */
.heading-gradient,
.panel-heading-gradient {
  font-family: var(--font-oswald), var(--font-display), Impact, sans-serif;
  font-weight: 700;
  letter-spacing: 0.01em;
  line-height: 1.05;
  background: var(--gradient-warm);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Heading accent underline */
.heading-accent,
.mkt-heading-accent {
  position: relative;
  display: inline-block;
}
.heading-accent::after,
.mkt-heading-accent::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 0;
  width: 60px;
  height: 3px;
  background: var(--gradient-warm);
  border-radius: 2px;
}
```

**ONEMLI:** Eski `mkt-heading-xl` taniminda `text-transform: uppercase;` VARDI — yeni tanimda YOK. Bu kasitli, Turkce I sorunu icin.

**Step 2: Button/CTA class'larini birlestir**

Mevcut `mkt-cta-gradient` (satir ~898), `mkt-cta-primary` (satir ~809), `mkt-cta-ghost` (satir ~824), `mkt-cta-glow` (satir ~1131) ve `btn-warm-gradient` (satir ~1371) tanimlarini bul.

Yeni unified tanimlarla degistir:

```css
/* ── Unified CTA/Button System ── */

/* Gradient CTA — warm red-orange, NO uppercase (Turkish I fix) */
.cta-gradient,
.mkt-cta-gradient,
.btn-warm-gradient {
  background: var(--gradient-warm);
  color: #FFFFFF;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.875rem;
  letter-spacing: 0.05em;
  transition: all 0.25s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border: none;
}
.cta-gradient:hover,
.mkt-cta-gradient:hover,
.btn-warm-gradient:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px -4px rgba(220, 38, 38, 0.3), 0 4px 12px -2px rgba(249, 115, 22, 0.2);
}
.cta-gradient:active,
.mkt-cta-gradient:active,
.btn-warm-gradient:active {
  transform: scale(0.97);
}

/* Primary CTA — solid red */
.cta-primary,
.mkt-cta-primary {
  @apply inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold tracking-wider transition-all;
  background: #FF2D2D;
  color: #FFFFFF;
  border-radius: 12px;
}
.cta-primary:hover,
.mkt-cta-primary:hover {
  background: #E01F1F;
  transform: translateY(-1px);
  box-shadow: 0 8px 24px -4px rgba(255, 45, 45, 0.3);
}
.cta-primary:active,
.mkt-cta-primary:active {
  transform: scale(0.97);
}

/* Ghost CTA — outline style */
.cta-ghost,
.mkt-cta-ghost {
  @apply inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold tracking-wider transition-all;
  background: transparent;
  border: 2px solid #E5E7EB;
  color: #0A0A0A;
  border-radius: 12px;
}
.cta-ghost:hover,
.mkt-cta-ghost:hover {
  border-color: #FF2D2D;
  color: #FF2D2D;
}
.cta-ghost:active,
.mkt-cta-ghost:active {
  transform: scale(0.97);
}

/* CTA glow animation */
.cta-glow,
.mkt-cta-glow {
  animation: cta-glow 3s ease-in-out infinite;
}
```

**ONEMLI:** `mkt-cta-primary` ve `mkt-cta-ghost` tanimlarindaki `uppercase` KALDIRILDI.

**Step 3: Panel Design System bolumunu temizle**

`/* ── Panel Design System */` bolumundeki (satir ~1285) eski `panel-heading`, `panel-heading-gradient`, `btn-warm-gradient` tanimlarini SIL (artik unified bolumde tanimli). `panel-card`, `panel-stat`, `sidebar-*`, `navbar-*` gibi panel-specific class'lar KALSIN.

**Step 4: Run tests**

```bash
npx vitest run --reporter=verbose 2>&1 | head -50
```

Expected: Tum testler PASS (CSS class isim degisiklikleri test'leri etkilemez — testler DOM icerigini kontrol eder, CSS class isimlerini degil)

**Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "refactor: unify mkt-*/panel-* CSS into single design system

Heading classes: heading-display, heading-display-xl, heading-gradient
CTA classes: cta-gradient, cta-primary, cta-ghost, cta-glow
Old names kept as CSS aliases for backward compat
Removed text-transform: uppercase from all headings (Turkish I fix)"
```

---

## Task 2: Button Component — Unified Class Names

**Files:**
- Modify: `src/components/ui/Button.tsx`

**Step 1: Update gradient variant**

Mevcut `Button.tsx`'de `gradient` variant `'btn-warm-gradient shadow-sm'` kullaniyor (satir 27).

Bunu `'cta-gradient shadow-sm'` olarak degistir:

```tsx
const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-dark active:bg-primary-dark shadow-sm hover:shadow-md hover:shadow-primary/10 hover:-translate-y-0.5 active:translate-y-0',
  secondary:
    'bg-primary-50 text-primary hover:bg-primary-light active:bg-primary-light',
  outline:
    'border border-border bg-surface text-text-primary hover:bg-background active:bg-background',
  ghost:
    'text-text-secondary hover:bg-background active:bg-background',
  danger:
    'bg-danger text-white hover:bg-red-700 active:bg-red-800',
  gradient: 'cta-gradient shadow-sm',
}
```

**Step 2: Run tests**

```bash
npx vitest run --reporter=verbose 2>&1 | head -50
```

**Step 3: Commit**

```bash
git add src/components/ui/Button.tsx
git commit -m "refactor(Button): use unified cta-gradient class"
```

---

## Task 3: Card Component — Unified Heading Class

**Files:**
- Modify: `src/components/ui/Card.tsx`

**Step 1: Update CardTitle**

Mevcut `Card.tsx`'de `CardTitle` (satir 27-33) `panel-heading` kullaniyor.

Bunu `heading-display` olarak degistir:

```tsx
export function CardTitle({ children, className = '' }: CardProps) {
  return (
    <h3 className={`text-lg heading-display text-text-primary ${className}`}>
      {children}
    </h3>
  )
}
```

**Step 2: Run tests**

```bash
npx vitest run --reporter=verbose 2>&1 | head -50
```

**Step 3: Commit**

```bash
git add src/components/ui/Card.tsx
git commit -m "refactor(Card): use unified heading-display class"
```

---

## Task 4: Panel Files — Class Name Migration

**Files:**
- Modify: Tum `src/app/(admin)/` ve `src/app/(client)/` dosyalari
- Modify: `src/components/shared/Sidebar.tsx`

**Step 1: panel-heading-gradient → heading-gradient**

Admin dashboard'da `panel-heading-gradient` kullanan yerleri bul ve degistir:

```bash
# Hangi dosyalarda var?
grep -rn "panel-heading-gradient" src/
```

Her dosyada `panel-heading-gradient` → `heading-gradient` degistir.

**Step 2: panel-heading → heading-display (dogrudan class kullanimi)**

Bazi admin sayfalarinda `panel-heading` dogrudan Tailwind class olarak h1/h2 elementlerinde kullanilmis olabilir:

```bash
grep -rn "panel-heading" src/app/ src/components/
```

Bunlari `heading-display` olarak degistir. **NOT:** `panel-card`, `panel-stat`, `panel-section-enter` DEGISMEYECEK — bunlar panel-specific layout class'lari.

**Step 3: btn-warm-gradient → cta-gradient**

Sidebar'daki upgrade butonu `btn-warm-gradient` kullaniyor (satir 100):

```bash
grep -rn "btn-warm-gradient" src/
```

Tum sonuclarda `btn-warm-gradient` → `cta-gradient` degistir.

**Step 4: Run tests**

```bash
npx vitest run --reporter=verbose 2>&1 | head -50
```

**Step 5: Commit**

```bash
git add -A
git commit -m "refactor(panel): migrate to unified design system class names

panel-heading-gradient → heading-gradient
panel-heading → heading-display
btn-warm-gradient → cta-gradient"
```

---

## Task 5: Marketing Files — Class Name Migration

**Files:**
- Modify: Tum `src/components/marketing/` dosyalari
- Modify: Tum `src/app/(marketing)/` ve `src/app/tr/(marketing)/` dosyalari

**ONEMLI:** Bu task'ta SADECE class isimlerini degistiriyoruz. Fonksiyonellik, layout, icerik DEGISMEYECEK.

**Step 1: mkt-heading-xl → heading-display-xl**

```bash
grep -rn "mkt-heading-xl" src/
```

Tum sonuclarda `mkt-heading-xl` → `heading-display-xl` degistir. Yaklasik 20+ dosya.

**Step 2: mkt-heading-lg → heading-display**

```bash
grep -rn "mkt-heading-lg" src/
```

Tum sonuclarda `mkt-heading-lg` → `heading-display` degistir. Yaklasik 40+ kullanim.

**Step 3: mkt-cta-gradient → cta-gradient**

```bash
grep -rn "mkt-cta-gradient" src/
```

Tum sonuclarda `mkt-cta-gradient` → `cta-gradient` degistir.

**Step 4: mkt-cta-primary → cta-primary**

```bash
grep -rn "mkt-cta-primary" src/
```

Tum sonuclarda `mkt-cta-primary` → `cta-primary` degistir.

**Step 5: mkt-cta-ghost → cta-ghost**

```bash
grep -rn "mkt-cta-ghost" src/
```

Tum sonuclarda `mkt-cta-ghost` → `cta-ghost` degistir.

**Step 6: mkt-cta-glow → cta-glow**

```bash
grep -rn "mkt-cta-glow" src/
```

Tum sonuclarda `mkt-cta-glow` → `cta-glow` degistir.

**Step 7: mkt-heading-accent → heading-accent**

```bash
grep -rn "mkt-heading-accent" src/
```

Tum sonuclarda `mkt-heading-accent` → `heading-accent` degistir.

**Step 8: Run tests**

```bash
npx vitest run --reporter=verbose 2>&1 | head -50
```

**Step 9: Commit**

```bash
git add -A
git commit -m "refactor(marketing): migrate to unified design system class names

mkt-heading-xl → heading-display-xl
mkt-heading-lg → heading-display
mkt-cta-gradient → cta-gradient
mkt-cta-primary → cta-primary
mkt-cta-ghost → cta-ghost
mkt-cta-glow → cta-glow
mkt-heading-accent → heading-accent"
```

---

## Task 6: CSS Cleanup — Eski Alias'lari Kaldir

**Files:**
- Modify: `src/app/globals.css`

**Onkosul:** Task 4 ve Task 5 tamamlanmis olmali (tum dosyalar yeni isimleri kullaniyor).

**Step 1: Alias'larin artik kullanilmadigini dogrula**

```bash
grep -rn "mkt-heading-xl\|mkt-heading-lg\|mkt-cta-gradient\|mkt-cta-primary\|mkt-cta-ghost\|mkt-cta-glow\|mkt-heading-accent\|panel-heading\|btn-warm-gradient" src/ --include="*.tsx" --include="*.ts"
```

Expected: SIFIR sonuc (sadece globals.css'deki alias tanimlari kalacak, ama `.tsx`/`.ts` dosyalarinda kullanim kalmamali).

**Step 2: globals.css'den alias'lari kaldir**

Unified class tanimlarindaki eski isimleri (`.mkt-heading-lg`, `.panel-heading`, `.mkt-cta-gradient`, `.btn-warm-gradient` vb.) sil. Sadece yeni isimler kalsin:

Ornek — onceki:
```css
.heading-display,
.mkt-heading-lg,
.panel-heading {
  /* ... */
}
```

Sonraki:
```css
.heading-display {
  /* ... */
}
```

Ayni islemi tum unified class'lar icin yap:
- `heading-display` — `.mkt-heading-lg`, `.panel-heading` alias'larini sil
- `heading-display-xl` — `.mkt-heading-xl` alias'ini sil
- `heading-gradient` — `.panel-heading-gradient` alias'ini sil
- `heading-accent` — `.mkt-heading-accent` alias'ini sil (ve `::after` pseudo-element'ten de)
- `cta-gradient` — `.mkt-cta-gradient`, `.btn-warm-gradient` alias'larini sil
- `cta-primary` — `.mkt-cta-primary` alias'ini sil
- `cta-ghost` — `.mkt-cta-ghost` alias'ini sil
- `cta-glow` — `.mkt-cta-glow` alias'ini sil

Ayrica eski standalone tanimlar varsa (duplicate) onlari da sil:
- Eski `/* Panel Design System */` bolumundeki `panel-heading`, `panel-heading-gradient`, `btn-warm-gradient` tanimlari
- Eski `/* Marketing */` bolumundeki `mkt-heading-xl`, `mkt-heading-lg`, `mkt-cta-*` tanimlari (artik unified bolumde)

**Step 3: Test dosyalarda eski isim kalmadigini dogrula**

```bash
grep -rn "mkt-heading-xl\|mkt-heading-lg\|mkt-cta-gradient\|mkt-cta-primary\|mkt-cta-ghost\|mkt-heading-accent\|panel-heading\|btn-warm-gradient" src/ --include="*.tsx" --include="*.ts" --include="*.css"
```

Expected: SIFIR sonuc.

**Step 4: Run tests**

```bash
npx vitest run --reporter=verbose 2>&1 | head -50
```

**Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "cleanup: remove CSS aliases, unified classes are sole source of truth

All mkt-*/panel-* component class names replaced with unified names.
Layout classes (mkt-section, mkt-reveal, panel-card, sidebar-*) unchanged."
```

---

## Task 7: Translation Files — Uppercase Metinler

**Files:**
- Modify: `src/lib/i18n/en.ts`
- Modify: `src/lib/i18n/tr.ts`

**Context:** `text-transform: uppercase` CSS'den kaldirildi. Marketing heading'lerde buyuk harf gorunumu istenen yerler kaynak kodda buyuk harfle yazilmali.

**Step 1: Marketing heading metinlerini kontrol et**

LP'deki heading'lerin cogu zaten buyuk harfle yazilmis olabilir (ornegin `"START FREE TODAY"` gibi). Translation dosyalarinda kontrol et:

```bash
grep -n "title\|heading\|cta" src/lib/i18n/en.ts | head -30
grep -n "title\|heading\|cta" src/lib/i18n/tr.ts | head -30
```

**Step 2: Ingilizce marketing heading'leri buyuk harfe cevir**

`en.ts`'de marketing heading'leri (hero title, CTA title, section titles) buyuk harfle yazilmis olmali. Zaten buyukse dokunma. Degilse ve LP'de buyuk gorunuyorsa, buyuk harfe cevir.

**DIKKAT:** Turkce (`tr.ts`) heading'lerde `toUpperCase()` veya manual buyuk harf KULLANMA — Turkce I/i sorunu devam eder. Turkce heading'ler normal case kalmali.

**Step 3: Hardcoded heading string'leri kontrol et**

Bazi marketing component'lerinde heading text'leri translation dosyasinda degil, dogrudan JSX'te yazilmis olabilir. Bunlari da kontrol et:

```bash
grep -rn "heading-display-xl\|heading-display" src/components/marketing/ | grep -v "className"
```

**Step 4: Run tests**

```bash
npx vitest run --reporter=verbose 2>&1 | head -50
```

**Step 5: Commit**

```bash
git add src/lib/i18n/en.ts src/lib/i18n/tr.ts
git commit -m "fix(i18n): uppercase headings in source text, not CSS

CSS uppercase removed for Turkish I compatibility.
English marketing headings written uppercase in source.
Turkish headings remain normal case."
```

---

## Task 8: Visual Verification

**Step 1: Dev server'i baslat**

```bash
npm run dev
```

**Step 2: Kontrol edilecek sayfalar**

Marketing:
- `localhost:3000` — Hero heading, CTA butonlari
- `localhost:3000/pricing` — Pricing kartlari, CTA butonlari
- `localhost:3000/features` — Feature grid
- `localhost:3000/contact` — Contact form

Admin panel:
- `localhost:3000/admin` — Dashboard, heading'ler, kartlar
- `localhost:3000/admin/takvim` — Takvim sayfasi

Client panel:
- `localhost:3000/app` — Dashboard, kartlar

Turkce:
- `localhost:3000/tr` — Turkce heading'lerde I/i kontrolu
- `localhost:3000/tr/pricing` — Turkce pricing

**Step 3: Dogrulama kontrol listesi**

- [ ] Marketing ve panel heading'leri ayni font (Oswald) kullaniyor
- [ ] CTA butonlari ayni gradient, ayni hover efekti
- [ ] Turkce sayfalarda I/i harfleri dogru gorunuyor
- [ ] Admin sidebar upgrade butonu gradient ile gorunuyor
- [ ] Panel Card hover efekti LP card hover ile ayni tonda (warm red-orange)
- [ ] Mobilde heading'ler, butonlar responsive

**Step 4: Final commit (gerekirse)**

```bash
git add -A
git commit -m "fix: visual adjustments after design system unification"
```

---

## Ozet

| Task | Dosya Sayisi | Risk | Aciklama |
|------|-------------|------|----------|
| 1 | 1 (globals.css) | Dusuk | CSS birlestirme + alias |
| 2 | 1 (Button.tsx) | Dusuk | Class isim degisikligi |
| 3 | 1 (Card.tsx) | Dusuk | Class isim degisikligi |
| 4 | ~10 (panel) | Dusuk | Find-replace |
| 5 | ~41 (marketing) | Orta | Find-replace (cok dosya) |
| 6 | 1 (globals.css) | Dusuk | Alias temizligi |
| 7 | 2 (i18n) | Dusuk | Metin buyuk harf |
| 8 | 0 | — | Gorsel dogrulama |

**Toplam:** ~55 dosya, cogunlugu mekanik find-replace.
**Risk:** Dusuk — sadece CSS class isimleri degisiyor, fonksiyonellik ve layout degismiyor.
**Sonuc:** Tek bir `cta-gradient` CSS class'i degistiginde hem marketing CTA'lari hem panel Button gradient'i degisiyor. Ayni sekilde `heading-display` degisince hem marketing heading'leri hem panel CardTitle degisiyor.
