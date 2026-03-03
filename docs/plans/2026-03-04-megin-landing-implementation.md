# Megin SaaS Landing Page — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the complete Megin SaaS marketing website — homepage, features, pricing, use cases, blog, contact, tools, signup — with new brand identity, SEO/AEO optimization, and EN/TR i18n support.

**Architecture:** Next.js 16 App Router with a new `(marketing)` route group for all public SaaS pages. Existing `(admin)` and `(member)` route groups remain untouched. Marketing pages get their own layout (MarketingNavbar + MarketingFooter). i18n via `[locale]` dynamic segment with path-based routing (`/` = EN, `/tr` = TR). SEO via Next.js metadata API + JSON-LD structured data.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Supabase (blog data), existing component library.

**Design Direction:** Bold, athletic, powerful — Nike/HWPO aesthetic. White base + black typography + red (#FF2D2D) accents. Stay true to existing panel's warmth (generous spacing, layered animations, hover-lift, gradient borders) but push it into sales territory with larger typography, dark contrast sections, and conversion-focused CTAs.

---

## Phase 1: Foundation

### Task 1: Brand Tokens & CSS Foundation

**Files:**
- Modify: `src/app/globals.css`
- Create: `src/lib/i18n/en.ts`
- Create: `src/lib/i18n/tr.ts`
- Create: `src/lib/i18n/types.ts`

**Step 1: Add marketing-specific CSS tokens to globals.css**

Add below existing `@theme inline` block — a new section for marketing tokens that don't conflict with the existing panel tokens:

```css
/* Marketing section utilities */
.mkt-section { @apply px-4 sm:px-6 lg:px-8; }
.mkt-container { @apply max-w-6xl mx-auto; }
.mkt-section-dark { background: #0A0A0A; color: #FFFFFF; }

.mkt-heading-xl {
  font-family: var(--font-oswald), var(--font-display), Impact, sans-serif;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  line-height: 0.95;
}

.mkt-cta-primary {
  @apply inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold tracking-wider uppercase transition-all press-effect;
  background: #FF2D2D;
  color: #FFFFFF;
}
.mkt-cta-primary:hover {
  background: #E01F1F;
  transform: translateY(-1px);
  box-shadow: 0 8px 24px -4px rgba(255, 45, 45, 0.3);
}

/* Scroll-triggered animation base */
.mkt-reveal {
  opacity: 0;
  transform: translateY(32px);
  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
.mkt-reveal.visible { opacity: 1; transform: translateY(0); }

/* Stagger for children */
.mkt-stagger > .mkt-reveal:nth-child(1) { transition-delay: 0ms; }
.mkt-stagger > .mkt-reveal:nth-child(2) { transition-delay: 80ms; }
.mkt-stagger > .mkt-reveal:nth-child(3) { transition-delay: 160ms; }
.mkt-stagger > .mkt-reveal:nth-child(4) { transition-delay: 240ms; }
.mkt-stagger > .mkt-reveal:nth-child(5) { transition-delay: 320ms; }
.mkt-stagger > .mkt-reveal:nth-child(6) { transition-delay: 400ms; }
```

**Step 2: Create i18n type definitions** — `src/lib/i18n/types.ts`
**Step 3: Create English translations** — `src/lib/i18n/en.ts`
**Step 4: Create Turkish translations** — `src/lib/i18n/tr.ts`

**Step 5: Commit**
```bash
git add src/app/globals.css src/lib/i18n/
git commit -m "feat: add marketing CSS tokens and i18n foundation (EN/TR)"
```

---

### Task 2: i18n Helper & Locale Detection

**Files:**
- Create: `src/lib/i18n/index.ts`

**Step 1: Create i18n helper** with `getTranslations(locale)`, `getLocaleFromPath(pathname)`, `localePath(path, locale)`.

**Step 2: Commit**
```bash
git add src/lib/i18n/index.ts
git commit -m "feat: add i18n helper with locale detection"
```

---

### Task 3: Marketing Layout (Navbar + Footer)

**Files:**
- Create: `src/components/marketing/MarketingNavbar.tsx`
- Create: `src/components/marketing/MarketingFooter.tsx`
- Create: `src/app/(marketing)/layout.tsx`

**Step 1: Create MarketingNavbar** — Client component. Sticky, backdrop-blur, Megin branding. Mobile hamburger. Logo: "MEGIN" with red dot. Links from translations. Red "Get Started" CTA. Match panel design: `backdrop-blur-md`, `h-16`, `max-w-6xl`, `press-effect`.

**Step 2: Create MarketingFooter** — Server component. 4-column grid. Product/Resources/Legal/Connect. Bottom bar with copyright + language switcher.

**Step 3: Create Marketing Layout** — Wraps children with navbar + footer. No auth required.

**Step 4: Commit**
```bash
git add src/components/marketing/ src/app/\(marketing\)/layout.tsx
git commit -m "feat: add marketing layout with navbar and footer"
```

---

### Task 4: Update Middleware for New Public Routes

**Files:**
- Modify: `src/lib/supabase/middleware.ts`

**Step 1: Add marketing routes to public whitelist** — `/features`, `/pricing`, `/use-cases`, `/contact`, `/tools`, `/signup`, `/tr`, `/legal`.

**Step 2: Update redirect logic** — Remove `/` from logged-in redirect (landing is now SaaS, not personal page). Only redirect from `/login`.

**Step 3: Commit**
```bash
git add src/lib/supabase/middleware.ts
git commit -m "feat: add marketing routes to public middleware whitelist"
```

---

### Task 5: Scroll Reveal Hook

**Files:**
- Create: `src/lib/hooks/useScrollReveal.ts`

**Step 1: Create IntersectionObserver hook** — Observes `.mkt-reveal` elements, adds `.visible` class when in viewport. Threshold 0.1, rootMargin -40px bottom.

**Step 2: Commit**
```bash
git add src/lib/hooks/useScrollReveal.ts
git commit -m "feat: add scroll reveal hook for marketing animations"
```

---

## Phase 2: Homepage

### Task 6: Homepage — Hero Section

**Files:**
- Create: `src/components/marketing/HeroSection.tsx`
- Create: `src/app/(marketing)/page.tsx`

**Step 1: Create HeroSection** — Full-width centered. `mkt-heading-xl` title, subtitle, single `mkt-cta-primary` CTA, dashboard mockup placeholder, trust signals. Staggered `animate-fade-up` entrance.

**Step 2: Create homepage page.tsx** — Imports HeroSection, adds metadata + SoftwareApplication JSON-LD.

Note: JSON-LD is a static string literal — safe to render as script tag since it contains no user input.

**Step 3: Verify** — `npm run dev`, open localhost:3000.

**Step 4: Commit**
```bash
git add src/components/marketing/HeroSection.tsx src/app/\(marketing\)/page.tsx
git commit -m "feat: add homepage hero section"
```

---

### Task 7: Homepage — Problem Strip + Features Grid

**Files:**
- Create: `src/components/marketing/ProblemStrip.tsx`
- Create: `src/components/marketing/FeaturesGrid.tsx`
- Modify: `src/app/(marketing)/page.tsx`

**Step 1: Create ProblemStrip** — Dark section (`#0A0A0A` bg). Centered text. Bold first line (font-display), muted middle, primary-colored final. `mkt-reveal` scroll animation.

**Step 2: Create FeaturesGrid** — 6-card grid (2 cols mobile, 3 desktop). Cards: `bg-[#F5F5F5] rounded-2xl p-6 border hover-lift card-glow`. SVG icons. `mkt-stagger` scroll animation. "See All Features" link.

**Step 3: Add to homepage**

**Step 4: Commit**
```bash
git add src/components/marketing/ProblemStrip.tsx src/components/marketing/FeaturesGrid.tsx src/app/\(marketing\)/page.tsx
git commit -m "feat: add problem strip and features grid to homepage"
```

---

### Task 8: Homepage — Story + Numbers + CTA

**Files:**
- Create: `src/components/marketing/StorySection.tsx`
- Create: `src/components/marketing/NumbersStrip.tsx`
- Create: `src/components/marketing/CTASection.tsx`
- Modify: `src/app/(marketing)/page.tsx`

**Step 1: Create StorySection** — Split layout. Lora italic for quote. Photo placeholder. Author name in font-display.

**Step 2: Create NumbersStrip** — Dark section. Reuse `AnimatedCounter` component. 3 stats: 500+ workouts, 10,000+ meals, 98% retention.

**Step 3: Create CTASection** — Centered. Large heading, red button, trust subtext.

**Step 4: Add all to homepage. Full homepage complete.**

**Step 5: Commit**
```bash
git add src/components/marketing/ src/app/\(marketing\)/page.tsx
git commit -m "feat: complete homepage with story, numbers, CTA"
```

---

## Phase 3: Core Pages

### Task 9: Features Page

**Files:**
- Create: `src/app/(marketing)/features/page.tsx`
- Create: `src/components/marketing/FeatureShowcase.tsx`

9 features with alternating text-left/image-right layout. Benefit-first headings. Screenshot placeholders. FAQPage JSON-LD. Final CTA.

**Commit:** `git commit -m "feat: add features page"`

---

### Task 10: Pricing Page

**Files:**
- Create: `src/app/(marketing)/pricing/page.tsx`
- Create: `src/components/marketing/PricingCards.tsx`
- Create: `src/components/marketing/FAQAccordion.tsx`

3-tier cards (Free/Pro/Gym). Pro highlighted with gradient-border. FAQ accordion below. Product + Offer JSON-LD.

**Commit:** `git commit -m "feat: add pricing page with FAQ"`

---

### Task 11: Use Cases Page

**Files:**
- Create: `src/app/(marketing)/use-cases/page.tsx`
- Create: `src/components/marketing/UseCaseSection.tsx`

3 personas: Independent PT, Gym/Studio, Online Coach. Full-width sections, alternating dark/light. Feature bullets + screenshot + CTA per section.

**Commit:** `git commit -m "feat: add use cases page"`

---

### Task 12: Tools Page (Restyle Existing Calculators)

**Files:**
- Create: `src/app/(marketing)/tools/page.tsx`
- Create: `src/app/(marketing)/tools/[slug]/page.tsx`

7 calculator cards on index. Dynamic route maps slug to existing calculator components (keep logic, restyle wrapper). Contextual CTA + FAQPage JSON-LD per tool.

**Commit:** `git commit -m "feat: add tools page with restyled calculators"`

---

## Phase 4: Content & Conversion Pages

### Task 13: Blog Restyle

**Files:**
- Create: `src/app/(marketing)/blog/page.tsx`
- Create: `src/app/(marketing)/blog/[slug]/page.tsx`

Same Supabase data, new Megin layout. Article JSON-LD. CTA banner at bottom of each post.

**Commit:** `git commit -m "feat: restyle blog with Megin branding"`

---

### Task 14: Contact Page

**Files:**
- Create: `src/app/(marketing)/contact/page.tsx`

Simple form (Name, Email, Message, optional client count). Placeholder submit. "Or just get started" link.

**Commit:** `git commit -m "feat: add contact page"`

---

### Task 15: Signup Page (UI Only)

**Files:**
- Create: `src/app/signup/page.tsx`

Form: Name, Email, Password, Gym Name (optional). Backend = Hamza. Trust signals. Split layout on desktop.

**Commit:** `git commit -m "feat: add signup page UI"`

---

### Task 16: Legal Pages Under Marketing Layout

**Files:**
- Create: `src/app/(marketing)/legal/privacy/page.tsx`
- Create: `src/app/(marketing)/legal/terms/page.tsx`
- Create: `src/app/(marketing)/legal/refund/page.tsx`

Reuse existing content, marketing layout wrapper.

**Commit:** `git commit -m "feat: add legal pages under marketing layout"`

---

## Phase 5: Turkish Mirror & SEO

### Task 17: Turkish Route Mirror

**Files:**
- Create: `src/app/tr/(marketing)/layout.tsx` + all TR page files

Each page imports same components with `tr` translations. Turkish metadata. Hreflang alternates on every page.

**Commit:** `git commit -m "feat: add Turkish route mirror with i18n"`

---

### Task 18: SEO Finalization

**Files:**
- Modify: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`
- Modify: `src/app/(marketing)/layout.tsx`

Extended sitemap with all marketing pages (EN+TR). Robots blocking admin/dashboard/api. Metadata template in layout.

**Commit:** `git commit -m "feat: SEO finalization — sitemap, robots, metadata"`

---

### Task 19: Root Layout Update

**Files:**
- Modify: `src/app/layout.tsx`

Update all "Hamza Sivrikaya" references to "Megin" in metadata, manifest, appleWebApp.

**Commit:** `git commit -m "feat: update root layout branding to Megin"`

---

### Task 20: Remove Old Landing Page

**Files:**
- Delete: `src/app/page.tsx` (old Hamza landing)

The `(marketing)/page.tsx` now serves at `/`. Old landing removed.

**Commit:** `git commit -m "feat: remove old Hamza landing page"`

---

## Summary

| Phase | Tasks | What it builds |
|-------|-------|---------------|
| 1: Foundation | 1-5 | CSS tokens, i18n, marketing layout, middleware, scroll hook |
| 2: Homepage | 6-8 | Complete homepage (hero, problem, features, story, numbers, CTA) |
| 3: Core Pages | 9-12 | Features, Pricing, Use Cases, Tools |
| 4: Content | 13-16 | Blog restyle, Contact, Signup, Legal |
| 5: SEO/i18n | 17-20 | Turkish mirror, sitemap, robots, cleanup |

**Total: 20 tasks across 5 phases.**

Each task produces a working, committable increment. Marketing pages coexist with existing admin/member panels without conflict.
