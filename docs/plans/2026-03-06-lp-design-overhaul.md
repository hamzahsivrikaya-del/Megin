# Megin Landing Page Design Overhaul

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Mevcut LP'yi "is gorur" seviyesinden premium, albeni yuksek, Nike/HWPO tarzinda cesur ve sporcu odakli bir tasarima donusturmek.

**Architecture:** Mevcut 9-section homepage yapisini koruyarak, her section'i sirasyla gorsel olarak yukseltmek. Yeni CSS utility'ler + animasyon hook'lari ekleyip, component'leri tek tek refactor etmek. i18n yapisina dokunmadan sadece gorsel katmani iyilestirmek.

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS v4, React 19, Lucide icons, mevcut useScrollReveal + useCountUp hook'lari.

---

## Genel Prensipler

- **Mobil oncelikli** — her degisiklik 375px'ten baslayarak yukariya scale edilecek
- **Mevcut i18n yapisina DOKUNMA** — sadece gorsel katman degisiyor
- **Tailwind CSS v4** — `@theme inline` blogu icindeki token'lar kullanilacak
- **Performans** — yeni animasyonlar CSS-only, JS eklenmeyecek (mumkun oldukca)
- **Test** — her task sonrasi `npm run dev` ile 375px + 768px + 1440px kontrol

---

## Task 1: Section Divider Sistemi + CSS Utility Genisletme

**Dosyalar:**
- Modify: `src/app/globals.css`

**Amac:** Section'lar arasinda gorsel breathing saglamak icin wave/angle divider CSS siniflari ve eksik utility'ler eklemek.

**Step 1: globals.css'e yeni utility'ler ekle**

Marketing Premium Utilities bolumunun sonuna (mevcut `.mkt-save-badge`'den sonra) su CSS'i ekle:

```css
/* ═══════════════════════════════════ */
/* Section Dividers                    */
/* ═══════════════════════════════════ */

/* Angled divider — top */
.mkt-divider-angle-top {
  position: relative;
}
.mkt-divider-angle-top::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
  height: 80px;
  background: inherit;
  clip-path: polygon(0 0, 100% 60px, 100% 100%, 0 100%);
  z-index: 1;
}

/* Angled divider — bottom */
.mkt-divider-angle-bottom::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 80px;
  background: inherit;
  clip-path: polygon(0 0, 100% 0, 100% 20px, 0 100%);
  z-index: 1;
}

/* Curved wave divider — bottom */
.mkt-divider-wave-bottom::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 60px;
  background: inherit;
  clip-path: ellipse(55% 100% at 50% 0%);
  z-index: 1;
}

/* Subtle top fade for dark-to-light transitions */
.mkt-fade-top::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: linear-gradient(to bottom, rgba(255,255,255,0.06), transparent);
  pointer-events: none;
  z-index: 1;
}

/* ═══════════════════════════════════ */
/* Enhanced Motion Utilities           */
/* ═══════════════════════════════════ */

/* Smooth counter tween (replaces step-based) */
@keyframes count-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

/* Glow pulse for CTA buttons */
@keyframes cta-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
  50% { box-shadow: 0 0 40px 8px rgba(220, 38, 38, 0.15); }
}
.mkt-cta-glow {
  animation: cta-glow 3s ease-in-out infinite;
}

/* Parallax-ready layer */
.mkt-parallax-slow {
  will-change: transform;
  transition: transform 0.1s linear;
}

/* Stagger delay extension for 9+ children */
.mkt-stagger > .mkt-reveal:nth-child(9) { transition-delay: 640ms; }
.mkt-stagger > .mkt-reveal:nth-child(10) { transition-delay: 720ms; }
.mkt-stagger > .mkt-reveal:nth-child(11) { transition-delay: 800ms; }
.mkt-stagger > .mkt-reveal:nth-child(12) { transition-delay: 880ms; }

/* Horizontal reveal (for comparison table rows) */
.mkt-reveal-left {
  opacity: 0;
  transform: translateX(-24px);
  transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.mkt-reveal-left.visible {
  opacity: 1;
  transform: translateX(0);
}

/* Scale-in reveal */
.mkt-reveal-scale {
  opacity: 0;
  transform: scale(0.92);
  transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.mkt-reveal-scale.visible {
  opacity: 1;
  transform: scale(1);
}

/* Emphasized heading line — red underline accent */
.mkt-heading-accent {
  position: relative;
  display: inline-block;
}
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

**Step 2: Dev server'da kontrol et**

Run: `npm run dev`
Kontrol: Sayfada regression olmamali, yeni class'lar henuz kullanilmiyor.

**Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(marketing): add section dividers, motion utilities, stagger extensions"
```

---

## Task 2: Hero Section — Premium Overhaul

**Dosyalar:**
- Modify: `src/components/marketing/HeroSection.tsx`

**Amac:** Hero'yu daha cesur, daha impactful hale getirmek. Daha buyuk tipografi vurgusu, animated gradient background, CTA glow efekti, counter strip iyilestirmesi, ve dashboard mockup'ta responsive duzeltme.

**Step 1: HeroSection.tsx'i yeniden yaz**

```tsx
'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useCountUp } from '@/lib/hooks/useCountUp'
import type { MarketingTranslations } from '@/lib/i18n/types'

interface HeroSectionProps {
  t: MarketingTranslations
  locale?: 'en' | 'tr'
}

/* -- Counter Strip -- */
function CounterStrip({ locale }: { locale: 'en' | 'tr' }) {
  const trainers = useCountUp(1000, { duration: 2000, suffix: '+' })
  const rating = useCountUp(4.9, { duration: 2000, decimals: 1 })
  const retention = useCountUp(98, { duration: 2000, suffix: '%' })

  const labels =
    locale === 'tr'
      ? ['Antrenor', 'Puan', 'Tutma Orani']
      : ['Trainers', 'Rating', 'Retention']

  const items = [
    { ref: trainers.ref, value: trainers.value, label: labels[0] },
    { ref: rating.ref, value: rating.value, label: labels[1] },
    { ref: retention.ref, value: retention.value, label: labels[2] },
  ]

  return (
    <div className="mt-14 flex items-center justify-center gap-6 sm:gap-12 animate-fade-up delay-400">
      {items.map((item, i) => (
        <div key={item.label} className="flex items-center gap-6 sm:gap-12">
          {i > 0 && (
            <div className="h-10 sm:h-12 w-px bg-gradient-to-b from-transparent via-[#E5E7EB] to-transparent" aria-hidden="true" />
          )}
          <div className="text-center">
            <span
              ref={item.ref}
              className="block font-display text-3xl sm:text-5xl font-bold text-[#0A0A0A] leading-none tracking-tight"
            >
              {item.value}
            </span>
            <span className="block text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em] text-[#9CA3AF] mt-2">
              {item.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

/* -- Dashboard Mockup -- */
function DashboardMockup({ locale }: { locale: 'en' | 'tr' }) {
  const clients = [
    { name: 'Ali K.', pct: 73, color: 'bg-red-400' },
    { name: 'Selin M.', pct: 92, color: 'bg-green-500' },
    { name: 'Burak T.', pct: 61, color: 'bg-red-500' },
    { name: 'Zeynep A.', pct: 85, color: 'bg-green-500' },
  ]

  const activeClientsLabel = locale === 'tr' ? 'Aktif Danisanlar' : 'Active Clients'
  const thisWeekLabel = locale === 'tr' ? 'Bu Hafta' : 'This Week'
  const nutritionLabel = locale === 'tr' ? 'Beslenme' : 'Nutrition'
  const complianceLabel = locale === 'tr' ? 'uyum' : 'compliance'
  const weekDays = locale === 'tr'
    ? ['Pzt', 'Sal', 'Car', 'Per', 'Cum']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  const barHeights = [55, 75, 40, 90, 65]
  const barActive = [true, true, false, true, true]

  return (
    <div className="mt-16 sm:mt-20 max-w-4xl mx-auto animate-fade-up delay-500">
      {/* Outer glow wrapper */}
      <div className="relative">
        {/* Glow behind card */}
        <div className="absolute -inset-4 bg-gradient-to-r from-[#DC2626]/[0.06] via-transparent to-[#F97316]/[0.06] rounded-3xl blur-2xl pointer-events-none" />

        <div className="relative rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-2xl shadow-black/8">
          {/* Top bar */}
          <div className="h-9 bg-gradient-to-r from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] flex items-center px-4 gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]/60" />
            <span className="ml-3 text-[10px] text-white/30 font-mono">megin.io/admin</span>
          </div>

          {/* Dashboard content */}
          <div className="bg-[#FAFAFA] p-4 sm:p-8">
            {/* Mobile: stack, Desktop: grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {/* Left — client list */}
              <div className="sm:col-span-2">
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 sm:p-5 space-y-3.5">
                  {clients.map((c) => (
                    <div key={c.name} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0A0A0A] to-[#374151] flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-white leading-none">
                          {c.name.split(' ').map((n) => n[0]).join('')}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-[#0A0A0A] w-16 truncate">{c.name}</span>
                      <div className="flex-1 h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${c.color}`} style={{ width: `${c.pct}%` }} />
                      </div>
                      <span className="text-[11px] font-semibold text-[#6B7280] w-9 text-right">{c.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — stats (hidden on very small, shown as row on mobile, column on desktop) */}
              <div className="grid grid-cols-3 sm:grid-cols-1 gap-3">
                {/* Active Clients */}
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-3 sm:p-4">
                  <p className="text-[9px] sm:text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider">{activeClientsLabel}</p>
                  <p className="text-xl sm:text-2xl font-bold text-[#0A0A0A] mt-1">
                    12 <span className="text-xs sm:text-sm font-normal text-[#9CA3AF]">/ 15</span>
                  </p>
                  <div className="mt-2 h-1.5 sm:h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-[#DC2626] to-[#F97316]" />
                  </div>
                </div>

                {/* Bar chart */}
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-3 sm:p-4">
                  <p className="text-[9px] sm:text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">{thisWeekLabel}</p>
                  <div className="flex items-end justify-between gap-1 h-16 sm:h-20">
                    {weekDays.map((day, i) => (
                      <div key={day} className="flex flex-col items-center gap-1 flex-1">
                        <div
                          className={`w-full max-w-[18px] mx-auto rounded-md ${barActive[i] ? 'bg-gradient-to-t from-[#0A0A0A] to-[#374151]' : 'bg-[#E5E7EB]'}`}
                          style={{ height: `${barHeights[i]}%` }}
                        />
                        <span className={`text-[8px] sm:text-[9px] font-medium ${barActive[i] ? 'text-[#6B7280]' : 'text-[#D1D5DB]'}`}>{day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nutrition donut */}
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-3 sm:p-4">
                  <p className="text-[9px] sm:text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider">{nutritionLabel}</p>
                  <div className="flex items-center gap-2 sm:gap-3 mt-2">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0 relative">
                      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#F3F4F6" strokeWidth="4" />
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#22C55E" strokeWidth="4" strokeDasharray="87.96 12.04" strokeLinecap="round" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[8px] sm:text-[9px] font-bold text-[#0A0A0A]">87</span>
                    </div>
                    <div>
                      <p className="text-base sm:text-lg font-bold text-[#0A0A0A] leading-none">87%</p>
                      <p className="text-[9px] sm:text-[10px] text-[#9CA3AF] mt-0.5">{complianceLabel}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* -- Main Hero -- */
export default function HeroSection({ t, locale = 'en' }: HeroSectionProps) {
  const secondaryCta = locale === 'tr' ? 'Nasil Calisir?' : 'See How It Works'

  return (
    <section className="mkt-section pt-32 sm:pt-40 pb-20 sm:pb-28 bg-white relative overflow-hidden">
      {/* Background: subtle radial gradient instead of blob spam */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(220,38,38,0.06),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_100%,rgba(249,115,22,0.04),transparent)] pointer-events-none" />

      <div className="mkt-container text-center relative">
        {/* Trust badge above heading */}
        <div className="animate-fade-up mb-8">
          <span className="mkt-trust-badge">
            <span className="mkt-trust-badge-icon">
              <svg viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            {locale === 'tr' ? '5 danisana kadar tamamen ucretsiz' : 'Free forever for up to 5 clients'}
          </span>
        </div>

        {/* Main heading — bigger, bolder */}
        <h1 className="mkt-heading-xl text-[clamp(2.8rem,8vw,6rem)] leading-[0.9] animate-fade-up delay-100">
          <span className="text-[#0A0A0A] block">{t.hero.title1}</span>
          <span className="text-gradient block mt-1 sm:mt-2">{t.hero.title2}</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg lg:text-xl text-[#6B7280] max-w-2xl mx-auto mt-8 sm:mt-10 leading-relaxed animate-fade-up delay-200">
          {t.hero.subtitle}
        </p>

        {/* CTA Buttons — primary gets glow */}
        <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up delay-300">
          <Link href="/signup" className="mkt-cta-gradient mkt-cta-glow">
            {t.hero.cta}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/features" className="mkt-cta-ghost rounded-xl">
            {secondaryCta}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Counter Strip */}
        <CounterStrip locale={locale} />

        {/* Dashboard Mockup */}
        <DashboardMockup locale={locale} />
      </div>
    </section>
  )
}
```

**Degisiklikler ozet:**
- Background: 3 blob yerine 2 clean radial gradient
- Trust badge: heading uzerinde guven sinyali
- Heading: `clamp()` ile daha akici responsive boyutlama, `text-5xl...8xl` yerine
- Counter strip: daha buyuk sayilar, gradient divider, uppercase label, daha fazla spacing
- CTA: primary'ye `mkt-cta-glow` animasyonu eklendi
- Mockup: dark top bar (macOS tarzi), glow wrapper, daha kucuk font'lar mobilde, bar chart renkleri dark (gradient overuse azaltma)
- Counter duration: 1500ms -> 2000ms (daha smooth)
- Daha fazla padding (pt-32/pb-20 vs pt-28/pb-16)

**Step 2: Kontrol et**

Run: `npm run dev`
Kontrol: 375px, 768px, 1440px'te hero section'i incele.
- Trust badge gorunuyor mu?
- Heading clamp duzgun calisyor mu?
- CTA glow animasyonu gorunuyor mu?
- Mockup mobile'de sigyor mu (sag panel 3-column row)?
- Counter strip okunabiliyor mu?

**Step 3: Commit**

```bash
git add src/components/marketing/HeroSection.tsx
git commit -m "feat(marketing): hero section premium overhaul — trust badge, clamp typography, glow CTA, dark mockup"
```

---

## Task 3: ProblemStrip — Daha Etkili Dark Section

**Dosyalar:**
- Modify: `src/components/marketing/ProblemStrip.tsx`

**Amac:** WCAG kontrastini duzeltmek, gorsel hiyerarsiyi guclendirmek, divider eklemek.

**Step 1: ProblemStrip.tsx'i guncelle**

```tsx
import type { MarketingTranslations } from '@/lib/i18n/types'

interface ProblemStripProps {
  t: MarketingTranslations
}

export default function ProblemStrip({ t }: ProblemStripProps) {
  return (
    <section className="mkt-section-dark-warm py-20 sm:py-28 relative overflow-hidden mkt-pattern-diagonal">
      {/* Subtle red accent glow */}
      <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-[#DC2626]/[0.06] rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="mkt-section relative">
        <div className="mkt-container text-center max-w-3xl mx-auto">
          {/* Main problem statement — bigger, bolder */}
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-snug tracking-tight">
            {t.problem.line1}
          </p>

          {/* Red accent divider */}
          <div className="w-16 h-1 rounded-full bg-gradient-to-r from-[#DC2626] to-[#F97316] mx-auto mt-10 mb-10" />

          {/* Solution hint — improved contrast (white/70 instead of white/50) */}
          <p className="text-base sm:text-lg text-white/70 leading-relaxed max-w-2xl mx-auto">
            {t.problem.line2}
          </p>

          {/* Punch line */}
          <p className="text-lg sm:text-xl font-bold mt-10">
            <span className="text-gradient">{t.problem.line3}</span>
          </p>
        </div>
      </div>
    </section>
  )
}
```

**Degisiklikler:**
- Kontrast: `text-white/50` -> `text-white/70` (WCAG AA pass)
- Padding: `py-16 sm:py-20` -> `py-20 sm:py-28` (daha fazla breathing)
- Red accent divider: line1 ile line2 arasinda gorsel ayirim
- Subtle red glow: dark section'a depth
- Font size: line1 daha buyuk (`text-2xl sm:text-3xl md:text-4xl`)
- Tracking: `tracking-tight` ile daha compact baslik

**Step 2: Kontrol et**

Run: `npm run dev`
Kontrol: Dark section'da metin okunuyor mu? Red divider gorunuyor mu? Mobile'de spacing uygun mu?

**Step 3: Commit**

```bash
git add src/components/marketing/ProblemStrip.tsx
git commit -m "feat(marketing): problem strip — improved contrast, accent divider, breathing space"
```

---

## Task 4: FeaturesGrid — Visual Mockup Karti Iyilestirmesi

**Dosyalar:**
- Modify: `src/components/marketing/FeaturesGrid.tsx`

**Amac:** Feature kartlarina daha guclu hover efekti, daha iyi gorsel hiyerarsi, gradient overuse azaltma.

**Step 1: FeaturesGrid.tsx kartlarini guncelle**

Mevcut feature card JSX'ini (`<div key={item.title} ...>`) su sekilde degistir:

```tsx
<div
  key={item.title}
  className={`mkt-reveal group relative rounded-2xl border border-gray-100 bg-white overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-black/[0.06] hover:-translate-y-2 hover:border-gray-200`}
>
  {/* Visual preview area — reduced gradient intensity */}
  <div className={`bg-gradient-to-br ${bg} px-5 sm:px-8 py-8 sm:py-10 flex items-center justify-center relative overflow-hidden`}>
    {/* Subtle grid pattern */}
    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
    <div className="w-full max-w-[260px] relative">
      <Mockup />
    </div>
  </div>

  {/* Text area — more padding, better hierarchy */}
  <div className="px-5 py-5 sm:px-6 sm:py-6">
    <h3 className="text-base sm:text-lg font-bold text-[#0A0A0A] leading-tight">{item.title}</h3>
    <p className="text-sm text-[#6B7280] mt-2 leading-relaxed line-clamp-3">
      {item.description}
    </p>
  </div>

  {/* Bottom accent line on hover */}
  <div className="h-0.5 w-0 bg-gradient-to-r from-[#DC2626] to-[#F97316] transition-all duration-500 group-hover:w-full" />
</div>
```

Ayrica mevcut `border` prop'unu featureVisuals array'inden kaldir (artik hover:border-gray-200 genel):

```tsx
const featureVisuals = [
  { Mockup: ClientMockup, bg: 'from-red-50/80 to-orange-50/80' },
  { Mockup: WorkoutMockup, bg: 'from-orange-50/80 to-amber-50/80' },
  { Mockup: NutritionMockup, bg: 'from-green-50/80 to-emerald-50/80' },
  { Mockup: ChartMockup, bg: 'from-blue-50/80 to-cyan-50/80' },
  { Mockup: BadgeMockup, bg: 'from-amber-50/80 to-yellow-50/80' },
  { Mockup: NotificationMockup, bg: 'from-purple-50/80 to-violet-50/80' },
]
```

Map icindeki destructure'i da guncelle: `const { Mockup, bg } = visual`

Section heading'e accent line ekle:

```tsx
<div className="text-center">
  <h2 className="mkt-heading-lg text-3xl sm:text-4xl md:text-5xl">
    <span className="text-[#0A0A0A] block">{t.features.title1}</span>
    <span className="text-gradient block">{t.features.title2}</span>
  </h2>
  <div className="w-16 h-1 rounded-full bg-gradient-to-r from-[#DC2626] to-[#F97316] mx-auto mt-6" />
</div>
```

Section padding'i artir: `py-16 sm:py-20` -> `py-20 sm:py-28`

**Degisiklikler ozet:**
- Hover: `hover:shadow-xl` -> `hover:shadow-2xl`, `-translate-y-1` -> `-translate-y-2`, `duration-300` -> `duration-500`
- Bottom accent line: hover'da soldan saga gradient cizgi (her kartta farkli renk border yerine uniform accent)
- Grid pattern: mockup area'da subtle dot grid (derinlik)
- Gradient opacity: `from-red-50` -> `from-red-50/80` (daha hafif)
- Text area: daha fazla padding, `line-clamp-2` -> `line-clamp-3`
- Heading: accent line eklendi
- featureVisuals: `border` prop kaldirildi (basitlestirme)

**Step 2: Kontrol et**

Run: `npm run dev`
Kontrol: Kartlara hover'da alt cizgi kayiyor mu? Shadow derinligi artyor mu? Mobile grid duzgun mu?

**Step 3: Commit**

```bash
git add src/components/marketing/FeaturesGrid.tsx
git commit -m "feat(marketing): features grid — hover accent line, dot pattern, softer gradients"
```

---

## Task 5: TestimonialSection — Premium Quote Kartlari

**Dosyalar:**
- Modify: `src/components/marketing/TestimonialSection.tsx`

**Amac:** Testimonial kartlarini daha premium hissettirmek. Daha buyuk quote isareti, daha iyi kart tasarimi.

**Step 1: TestimonialSection.tsx'i guncelle**

```tsx
'use client'

import { Star } from 'lucide-react'
import { useScrollReveal } from '@/lib/hooks/useScrollReveal'
import type { MarketingTranslations } from '@/lib/i18n/types'

interface TestimonialSectionProps {
  t: MarketingTranslations
}

export default function TestimonialSection({ t }: TestimonialSectionProps) {
  const revealRef = useScrollReveal()

  return (
    <section className="mkt-section py-20 sm:py-28 bg-[#FAFAFA]">
      <div className="mkt-container">
        {/* Heading */}
        <div className="text-center">
          <h2 className="mkt-heading-lg text-3xl sm:text-4xl md:text-5xl text-[#0A0A0A]">
            {t.testimonials.title}
          </h2>
          <p className="text-[#6B7280] mt-4 max-w-xl mx-auto leading-relaxed">
            {t.testimonials.subtitle}
          </p>
          <div className="w-16 h-1 rounded-full bg-gradient-to-r from-[#DC2626] to-[#F97316] mx-auto mt-6" />
        </div>

        {/* Cards */}
        <div
          ref={revealRef}
          className="mkt-stagger grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 mt-14 sm:mt-16"
        >
          {t.testimonials.items.map((item, index) => (
            <div
              key={item.name}
              className="mkt-reveal relative bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E7EB] transition-all duration-500 hover:shadow-2xl hover:shadow-black/[0.06] hover:-translate-y-2 hover:border-gray-200 flex flex-col"
            >
              {/* Large decorative quote */}
              <div className="text-[80px] leading-none font-serif text-[#DC2626]/[0.08] absolute top-3 left-5 select-none pointer-events-none" aria-hidden="true">
                &ldquo;
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 relative">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="mt-5 text-[#374151] leading-relaxed flex-1 relative text-[15px]">
                &ldquo;{item.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3 mt-6 pt-5 border-t border-[#F3F4F6]">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#0A0A0A] to-[#374151] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-black/10">
                  {item.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-bold text-[#0A0A0A]">{item.name}</div>
                  <div className="text-xs text-[#9CA3AF]">{item.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

**Degisiklikler:**
- Background: `bg-white` -> `bg-[#FAFAFA]` (section alternation)
- Buyuk dekoratif quote mark (80px, cok hafif opacity)
- Avatar: gradient red -> dark gradient (gradient overuse azaltma)
- Hover: `hover:shadow-2xl`, `-translate-y-2`, `duration-500`
- Padding arttirildi: `p-6 sm:p-8`
- Heading accent line eklendi
- Section padding: `py-20 sm:py-28`
- Kart sinifi: mkt-testimonial-card CSS'i yerine inline Tailwind (daha tutarli)

**Step 2: Kontrol + Commit**

```bash
git add src/components/marketing/TestimonialSection.tsx
git commit -m "feat(marketing): testimonials — decorative quote mark, dark avatars, premium hover"
```

---

## Task 6: StorySection — Founder Quote Vurgusu

**Dosyalar:**
- Modify: `src/components/marketing/StorySection.tsx`

**Amac:** Founder quote'unu daha etkileyici hale getirmek.

**Step 1: StorySection.tsx'i guncelle**

```tsx
import type { MarketingTranslations } from '@/lib/i18n/types'

interface StorySectionProps {
  t: MarketingTranslations
}

export default function StorySection({ t }: StorySectionProps) {
  return (
    <section className="py-20 sm:py-28 bg-white relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,rgba(249,115,22,0.03),transparent)] pointer-events-none" />

      <div className="mkt-section relative">
        <div className="mkt-container">
          {/* Heading */}
          <h2 className="mkt-heading-lg text-3xl sm:text-4xl md:text-5xl text-center">
            <span className="text-[#0A0A0A] block">{t.story.heading1}</span>
            <span className="text-gradient block">{t.story.heading2}</span>
          </h2>

          {/* Quote card */}
          <div className="mt-14 sm:mt-16 max-w-3xl mx-auto">
            <div className="relative bg-[#FAFAFA] rounded-2xl p-8 sm:p-10 lg:p-12 border border-[#E5E7EB]">
              {/* Top accent line */}
              <div className="absolute top-0 left-8 right-8 sm:left-10 sm:right-10 h-0.5 bg-gradient-to-r from-transparent via-[#DC2626]/30 to-transparent" />

              <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8">
                {/* Avatar */}
                <div className="shrink-0 mx-auto md:mx-0">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0A0A0A] to-[#374151] flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-black/10">
                    H
                  </div>
                </div>

                {/* Quote */}
                <div className="flex-1">
                  <blockquote>
                    <p
                      className="text-base sm:text-lg text-[#57534E] leading-relaxed"
                      style={{ fontFamily: 'var(--font-lora), serif', fontStyle: 'italic' }}
                    >
                      &ldquo;{t.story.quote}&rdquo;
                    </p>
                    <footer className="mt-6 flex items-center gap-3">
                      <div className="w-10 h-[2px] bg-gradient-to-r from-[#DC2626] to-[#F97316] rounded-full" />
                      <cite className="text-sm font-bold text-[#0A0A0A] not-italic">
                        {t.story.author}
                      </cite>
                    </footer>
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
```

**Degisiklikler:**
- Background: `mkt-gradient-bg` -> beyaz + subtle radial gradient (section alternation)
- Kart: beyaz bg -> `bg-[#FAFAFA]` (daha az "floating", daha grounded)
- Top accent line: gradient border yerine subtle divider
- Avatar: red gradient -> dark gradient (gradient overuse azaltma)
- Heavy shadow kaldirildi (shadow-lg shadow-black/[0.03] -> no shadow, flat + border)
- Decorative quote mark kaldirildi (fazla karmasik, temiz tutuyoruz)
- Section padding arttirildi

**Step 2: Kontrol + Commit**

```bash
git add src/components/marketing/StorySection.tsx
git commit -m "feat(marketing): story section — subtle bg, top accent line, dark avatar"
```

---

## Task 7: ComparisonTable — Daha Etkili Gorsel Karsilastirma

**Dosyalar:**
- Modify: `src/components/marketing/ComparisonTable.tsx`

**Amac:** Tablo'yu daha okunaklive mobile-friendly yapmak. Megin kolonunu daha belirgin cikarmak.

**Step 1: ComparisonTable.tsx'i guncelle**

Sadece gorsel iyilestirmeler:

1. Header row'da Megin badge'ini buyut
2. Megin kolonu background'unu daha belirgin yap
3. "None" detection'i basitlestir
4. Row hover'i gelistir
5. Section padding artir

```tsx
'use client'

import { Check, X, Minus } from 'lucide-react'
import { useScrollReveal } from '@/lib/hooks/useScrollReveal'
import type { MarketingTranslations } from '@/lib/i18n/types'

interface ComparisonTableProps {
  t: MarketingTranslations
}

function isNoneValue(val: string): boolean {
  const lower = val.toLowerCase()
  return lower === 'none' || lower === 'yok' || lower === "doesn't exist" || lower === 'mumkun degil'
}

export default function ComparisonTable({ t }: ComparisonTableProps) {
  const revealRef = useScrollReveal()

  return (
    <section className="mkt-section py-20 sm:py-28 bg-[#FAFAFA]">
      <div className="mkt-container">
        {/* Heading */}
        <div className="text-center mb-14 sm:mb-16">
          <h2 className="mkt-heading-lg text-3xl sm:text-4xl md:text-5xl text-[#0A0A0A]">
            {t.comparison.title}
          </h2>
          <p className="text-[#6B7280] mt-4 max-w-2xl mx-auto leading-relaxed">
            {t.comparison.subtitle}
          </p>
          <div className="w-16 h-1 rounded-full bg-gradient-to-r from-[#DC2626] to-[#F97316] mx-auto mt-6" />
        </div>

        {/* Table */}
        <div ref={revealRef} className="max-w-3xl mx-auto overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="rounded-2xl border border-[#E5E7EB] overflow-hidden bg-white shadow-lg shadow-black/[0.03]">
            <table className="w-full border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-[#FAFAFA]">
                  <th className="text-left text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider py-5 px-5 sm:px-6 w-[30%]">
                    Feature
                  </th>
                  <th className="text-center py-5 px-3 w-[28%]">
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-[#0A0A0A] rounded-full px-5 py-2 shadow-md">
                      <Check className="w-4 h-4" />
                      {t.comparison.megin}
                    </span>
                  </th>
                  <th className="text-center text-xs font-semibold text-[#D1D5DB] uppercase tracking-wider py-5 px-3 w-[21%]">
                    {t.comparison.excel}
                  </th>
                  <th className="text-center text-xs font-semibold text-[#D1D5DB] uppercase tracking-wider py-5 px-3 w-[21%]">
                    {t.comparison.whatsapp}
                  </th>
                </tr>
              </thead>
              <tbody>
                {t.comparison.rows.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`mkt-reveal border-t border-[#F3F4F6] transition-colors hover:bg-gray-50/80 ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]/30'}`}
                  >
                    <td className="text-sm font-medium text-[#0A0A0A] py-4 px-5 sm:px-6">
                      {row.feature}
                    </td>
                    <td className="text-center py-4 px-3 bg-green-50/30">
                      <span className="inline-block text-xs font-semibold text-[#059669] bg-[#059669]/[0.08] rounded-full px-3.5 py-1.5">
                        {row.megin}
                      </span>
                    </td>
                    <td className="text-center py-4 px-3">
                      {isNoneValue(row.excel) ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-50">
                          <X className="w-3.5 h-3.5 text-red-300" />
                        </span>
                      ) : (
                        <span className="text-xs text-[#9CA3AF]">{row.excel}</span>
                      )}
                    </td>
                    <td className="text-center py-4 px-3">
                      {isNoneValue(row.whatsapp) ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-50">
                          <X className="w-3.5 h-3.5 text-red-300" />
                        </span>
                      ) : (
                        <span className="text-xs text-[#9CA3AF]">{row.whatsapp}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
```

**Degisiklikler:**
- Megin badge: red gradient -> siyah bg (daha otoriter, gradient overuse azaltma)
- Megin kolon rengi: `bg-red-50/30` -> `bg-green-50/30` + text green (pozitif = yesil)
- "None" detection: inline kosullar -> `isNoneValue()` fonksiyonu (temizlik)
- Background: beyaz -> `bg-[#FAFAFA]` (section alternation)
- Heading accent line eklendi
- Mobile: `-mx-4 px-4` ile horizontal scroll icin daha iyi padding
- `min-w-[500px]` ile tablo minimum genisligi
- Competitor header: `text-[#9CA3AF]` -> `text-[#D1D5DB]` (daha soluk = Megin one cikar)
- `Minus` import kaldirildi (kullanilmiyor ama ileride eklenebilir — birakalim)

**Step 2: Kontrol + Commit**

```bash
git add src/components/marketing/ComparisonTable.tsx
git commit -m "feat(marketing): comparison table — dark Megin badge, green highlights, cleaner none detection"
```

---

## Task 8: BadgeShowcase — Grid Iyilestirmesi

**Dosyalar:**
- Modify: `src/components/marketing/BadgeShowcase.tsx`

**Amac:** Badge grid'i daha premium ve interaktif yapmak.

**Step 1: BadgeShowcase.tsx'i guncelle**

Ana degisiklikler:
- Dark background section (beyaz badge kartlari uzerinde)
- Daha buyuk emoji'ler
- Hover efekti iyilestirmesi

```tsx
'use client'

import { useScrollReveal } from '@/lib/hooks/useScrollReveal'
import { BADGE_DEFINITIONS, BADGE_VISUALS } from '@/lib/badges'
import type { MarketingTranslations } from '@/lib/i18n/types'
import type { Locale } from '@/lib/i18n/types'

const BADGE_NAMES_EN: Record<string, string> = {
  first_lesson: 'First Step',
  three_in_a_row: 'Triple Threat',
  ten_lessons: 'Apprentice',
  goal_setter: 'Sharpshooter',
  first_nutrition: 'First Log',
  four_week_streak: 'Iron Will',
  fifty_lessons: 'Master',
  perfect_week: 'Perfection',
}

interface BadgeShowcaseProps {
  t: MarketingTranslations
  locale: Locale
}

const SHOWCASE_BADGE_IDS = [
  'first_lesson',
  'three_in_a_row',
  'ten_lessons',
  'goal_setter',
  'first_nutrition',
  'four_week_streak',
  'fifty_lessons',
  'perfect_week',
]

type ShowcaseBadge = (typeof BADGE_DEFINITIONS)[number] & {
  visual: (typeof BADGE_VISUALS)[string]
}

export default function BadgeShowcase({ t, locale }: BadgeShowcaseProps) {
  const revealRef = useScrollReveal()

  const showcaseBadges = SHOWCASE_BADGE_IDS
    .map((id): ShowcaseBadge | null => {
      const def = BADGE_DEFINITIONS.find((b) => b.id === id)
      const visual = BADGE_VISUALS[id]
      if (!def || !visual) return null
      return { ...def, visual }
    })
    .filter((b): b is ShowcaseBadge => b !== null)

  return (
    <section className="mkt-section-dark-warm py-20 sm:py-28 relative overflow-hidden">
      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="mkt-container relative">
        {/* Heading — white on dark */}
        <div className="text-center mb-14">
          <h2 className="mkt-heading-lg text-3xl sm:text-4xl md:text-5xl text-white">
            {t.badges.title}
          </h2>
          <p className="text-white/50 mt-4 max-w-2xl mx-auto leading-relaxed">
            {t.badges.subtitle}
          </p>
        </div>

        {/* Badge grid */}
        <div
          ref={revealRef}
          className="mkt-stagger grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto"
        >
          {showcaseBadges.map((badge) => (
            <div
              key={badge.id}
              className="mkt-reveal group flex flex-col items-center gap-3 rounded-2xl bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] p-5 sm:p-6 transition-all duration-500 cursor-default hover:-translate-y-2 hover:bg-white/[0.1] hover:border-white/[0.15]"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3"
                style={{
                  background: badge.visual.gradient,
                  boxShadow: `0 8px 24px -4px ${badge.visual.shadow},0.3)`,
                }}
              >
                {badge.visual.emoji}
              </div>
              <span className="text-xs font-semibold text-white/80 text-center leading-tight">
                {locale === 'en' ? (BADGE_NAMES_EN[badge.id] || badge.name) : badge.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

**Degisiklikler:**
- Section: beyaz bg -> dark warm bg (badge'ler daha gorkemli gorunur)
- Kartlar: solid beyaz -> glassmorphism (bg-white/[0.06] + backdrop-blur)
- Emoji boyutu: `w-14 h-14 text-2xl` -> `w-16 h-16 text-3xl`
- Dot pattern overlay (derinlik)
- Metin rengi: siyah -> beyaz/80
- Hover: daha guclu translate + duration 500ms
- Shadow: daha buyuk glow

**Step 2: Kontrol + Commit**

```bash
git add src/components/marketing/BadgeShowcase.tsx
git commit -m "feat(marketing): badge showcase — dark section, glassmorphism cards, larger emojis"
```

---

## Task 9: NumbersStrip — Stat Kartlari Vurgusu

**Dosyalar:**
- Modify: `src/components/marketing/NumbersStrip.tsx`

**Amac:** Stat kartlarini daha impactful yapmak. Dark section'a degistirmek (badge showcase artik dark oldugu icin, burada light/warm kalabilir — akisi ayarlamak onemli).

**Step 1: NumbersStrip.tsx'i guncelle**

```tsx
'use client'

import { Dumbbell, Utensils, TrendingUp } from 'lucide-react'
import AnimatedCounter from '@/components/shared/AnimatedCounter'
import type { MarketingTranslations } from '@/lib/i18n/types'

interface NumbersStripProps {
  t: MarketingTranslations
}

const statIcons = [Dumbbell, Utensils, TrendingUp]

function parseStatValue(value: string): { num: number; suffix: string } {
  const cleaned = value.replace(/,/g, '')
  const suffix = cleaned.replace(/[0-9]/g, '')
  const num = parseInt(cleaned.replace(/[^0-9]/g, ''), 10)
  return { num: isNaN(num) ? 0 : num, suffix }
}

export default function NumbersStrip({ t }: NumbersStripProps) {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="mkt-section">
        <div className="mkt-container">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
            {t.numbers.items.map((item, index) => {
              const { num, suffix } = parseStatValue(item.value)
              const Icon = statIcons[index]
              return (
                <div
                  key={item.label}
                  className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-6 sm:p-8 lg:p-10 text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-black/[0.04] hover:border-gray-200"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#0A0A0A] flex items-center justify-center mx-auto mb-5 sm:mb-6">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0A0A0A] font-display tracking-tight">
                    <AnimatedCounter end={num} suffix={suffix} />
                  </div>
                  <p className="text-sm font-bold text-[#0A0A0A] mt-4 uppercase tracking-wider">
                    {item.label}
                  </p>
                  <p className="text-xs text-[#9CA3AF] mt-1">{item.sublabel}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
```

**Degisiklikler:**
- Background: warm gradient -> beyaz (badge section dark, bu beyaz, CTA dark = guzel alternation)
- Kartlar: glassmorphism -> solid border cards (tutarlilik)
- Icon: red gradient bg -> siyah bg (gradient overuse son bulur)
- Sayilar: `text-gradient` -> siyah text + font-display (daha okunaklı, daha cesur)
- Hover: eklendi (onceki sadece hover-lift idi)
- Gap: `gap-6` -> `gap-8` (daha fazla breathing)
- Padding arttirildi

**Step 2: Kontrol + Commit**

```bash
git add src/components/marketing/NumbersStrip.tsx
git commit -m "feat(marketing): numbers strip — clean white bg, dark icons, bold typography"
```

---

## Task 10: CTASection — Final Push Vurgusu

**Dosyalar:**
- Modify: `src/components/marketing/CTASection.tsx`

**Amac:** Son CTA'yi daha vurucu yapmak. Buyuk tipografi + glow CTA.

**Step 1: CTASection.tsx'i guncelle**

```tsx
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { MarketingTranslations } from '@/lib/i18n/types'

interface CTASectionProps {
  t: MarketingTranslations
}

export default function CTASection({ t }: CTASectionProps) {
  return (
    <section className="mkt-section-dark-warm py-24 sm:py-32 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-[#DC2626]/[0.06] rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="mkt-container text-center relative">
        {/* Bigger, bolder heading */}
        <h2 className="mkt-heading-xl text-[clamp(2rem,6vw,4.5rem)] leading-[0.95] text-white">
          {t.cta.title1}
          <br />
          <span className="text-gradient">{t.cta.title2}</span>
        </h2>

        <div className="mt-12">
          <Link href="/signup" className="mkt-cta-gradient mkt-cta-glow text-base px-10 py-5 rounded-2xl">
            {t.cta.button}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <p className="text-sm text-white/40 mt-6">{t.cta.subtext}</p>
      </div>
    </section>
  )
}
```

**Degisiklikler:**
- Heading: `mkt-heading-lg` -> `mkt-heading-xl` + `clamp()` (daha buyuk, daha cesur)
- CTA button: glow efekti + daha buyuk padding + `rounded-2xl`
- Glow orb: daha buyuk (500->600px)
- Section padding: daha fazla
- Ikinci orb kaldirildi (temizlik)

**Step 2: Kontrol + Commit**

```bash
git add src/components/marketing/CTASection.tsx
git commit -m "feat(marketing): CTA section — bolder heading, glow button, more breathing"
```

---

## Task 11: Homepage Section Sirasi + Divider Uygulama

**Dosyalar:**
- Modify: `src/app/(marketing)/page.tsx`

**Amac:** Section alternation'i (beyaz -> dark -> beyaz -> ...) kontrol etmek ve section sırasını optimize etmek.

**Step 1: page.tsx section sirasini kontrol et**

Mevcut sira ve yeni renk akisi:

```
1. HeroSection        -> beyaz (bg-white)
2. ProblemStrip        -> DARK (mkt-section-dark-warm)
3. FeaturesGrid        -> beyaz (bg-white)
4. TestimonialSection  -> acik gri (bg-[#FAFAFA])
5. StorySection        -> beyaz (bg-white + subtle radial)
6. ComparisonTable     -> acik gri (bg-[#FAFAFA])
7. BadgeShowcase       -> DARK (mkt-section-dark-warm)
8. NumbersStrip        -> beyaz (bg-white)
9. CTASection          -> DARK (mkt-section-dark-warm)
```

Bu akis iyi: beyaz-dark-beyaz-gri-beyaz-gri-dark-beyaz-dark. Monotonluk kiriliyor.

page.tsx'de degisiklik gerekmiyorsa, sadece section akisini dogrula ve commit ATMA.

Eger akis uygunsa, bu task skip edilebilir.

**Step 2: Build kontrol**

Run: `npm run build`
Kontrol: Hata yok, sayfalar duzgun render ediliyor.

---

## Task 12: Navbar + Footer Polish

**Dosyalar:**
- Modify: `src/components/marketing/MarketingNavbar.tsx`
- Modify: `src/components/marketing/MarketingFooter.tsx`

**Amac:** Navbar'da scroll state transition'ini iyilestirmek, footer'da "Coming Soon" temizligi.

**Step 1: Navbar scroll state**

MarketingNavbar.tsx'de `nav` elementinin className'ini guncelle:

```tsx
<nav
  className={`fixed top-0 w-full z-50 transition-all duration-500 ${
    scrolled
      ? 'bg-white/90 backdrop-blur-xl border-b border-gray-200/60 shadow-sm shadow-black/[0.03]'
      : 'bg-transparent border-b border-transparent'
  }`}
>
```

Degisiklik: Scroll oncesi tamamen seffaf (hero beyaz zaten), scroll sonrasi beyaz glass. `duration-300` -> `duration-500`.

**Step 2: Footer Coming Soon temizligi**

MarketingFooter.tsx'de Connect bolumundeki "Coming Soon" item'lari kaldir:

```tsx
{/* Connect */}
<div>
  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] mb-4">
    {t.footer.connect}
  </h3>
  <ul className="flex flex-col gap-2.5">
    <li>
      <Link
        href="/contact"
        className="text-sm text-[#57534E] hover:text-[#DC2626] transition-colors"
      >
        {locale === 'tr' ? 'Iletisim' : 'Contact'}
      </Link>
    </li>
  </ul>
</div>
```

**Step 3: Commit**

```bash
git add src/components/marketing/MarketingNavbar.tsx src/components/marketing/MarketingFooter.tsx
git commit -m "feat(marketing): navbar transparent-to-glass transition, footer cleanup"
```

---

## Task 13: Final Build + Visual QA

**Dosyalar:** Yok (test task)

**Step 1: Build**

Run: `npm run build`
Beklenen: Hata yok, tum sayfalar basariyla build ediliyor.

**Step 2: Dev server'da gorsel kontrol**

Run: `npm run dev`

Kontrol listesi (375px + 768px + 1440px):

- [ ] Hero: trust badge, clamp heading, glow CTA, counter strip, dark mockup
- [ ] ProblemStrip: kontrast OK, red divider, breathing
- [ ] FeaturesGrid: hover accent line, dot pattern, softer gradients
- [ ] Testimonials: decorative quote, dark avatars, premium hover
- [ ] Story: subtle bg, top accent, dark avatar
- [ ] ComparisonTable: dark badge, green highlights, mobile scroll
- [ ] BadgeShowcase: dark section, glass cards, big emojis
- [ ] NumbersStrip: white bg, dark icons, bold numbers
- [ ] CTA: bold heading, glow button
- [ ] Navbar: transparent -> glass transition
- [ ] Footer: no "Coming Soon"
- [ ] Section alternation: beyaz/dark/beyaz/gri/beyaz/gri/dark/beyaz/dark

**Step 3: Sorun varsa fix et, yoksa final commit**

```bash
git add -A
git commit -m "feat(marketing): LP design overhaul complete — premium visual upgrade across all sections"
```

---

## Ozet: Section Renk Akisi

```
HERO         ████████████████  beyaz
PROBLEM      ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  DARK
FEATURES     ████████████████  beyaz
TESTIMONIALS ░░░░░░░░░░░░░░░░  acik gri
STORY        ████████████████  beyaz
COMPARISON   ░░░░░░░░░░░░░░░░  acik gri
BADGES       ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  DARK
NUMBERS      ████████████████  beyaz
CTA          ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  DARK
```

Bu alternation sayfa boyunca ritmik bir "nefes" olusturur ve monotonlugu kirar.

## Tasarim Felsefesi Ozet

| Onceki | Sonraki |
|--------|---------|
| 4 yerde ayni red-orange gradient | Gradient sadece accent line + CTA'da |
| Tum avatarlar red gradient | Dark avatarlar (siyah = otorite) |
| 3 blob background | Clean radial gradient |
| Monoton beyaz section'lar | beyaz/gri/dark alternation |
| Flat hover efektleri | translateY-2 + shadow-2xl + bottom accent line |
| Kucuk counter strip | Buyuk, bold, gradient divider'li strip |
| CTA glow yok | Pulsing glow animasyonu |
| text-white/50 (WCAG fail) | text-white/70 (WCAG AA pass) |
