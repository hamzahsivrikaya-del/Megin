# Megin SaaS Landing Page — Design Document

> **Date:** 2026-03-04
> **Owner:** Gursu (frontend/marketing pages) + Hamza (backend/dashboard)
> **Status:** Draft

---

## 1. Overview

Megin is a SaaS platform for personal trainers to track clients, deliver workout programs, manage nutrition, and grow their business. This document covers the **public-facing marketing website** — the landing page, features, pricing, and all pages a potential customer sees before signing up.

### Key Decisions
- **Brand:** New identity. Bold, athletic, powerful (Nike/HWPO style)
- **Language:** English (default) + Turkish (`/tr` prefix)
- **Tone:** Sales-focused, direct, no fluff
- **Model:** Self-serve. No demo booking. Free signup, free tier for up to 5 clients
- **Repo:** Same repo as the product (`hamza-web-site`, now "Megin")
- **Hamza's personal PT page:** Removed. Landing = Megin SaaS
- **About page:** No separate page. Short story section on homepage

---

## 2. Brand Identity

### Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| `--color-background` | `#FFFFFF` | Page background |
| `--color-surface` | `#F5F5F5` | Card/section backgrounds |
| `--color-surface-dark` | `#0A0A0A` | Dark accent sections |
| `--color-primary` | `#FF2D2D` | CTA buttons, links, accents |
| `--color-primary-hover` | `#E01F1F` | Button hover state |
| `--color-text` | `#0A0A0A` | Primary text |
| `--color-text-muted` | `#6B7280` | Secondary text, descriptions |
| `--color-text-inverse` | `#FFFFFF` | Text on dark backgrounds |
| `--color-border` | `#E5E7EB` | Borders, dividers |

### Typography
| Element | Font | Weight | Usage |
|---------|------|--------|-------|
| Display headings | Oswald or Clash Display | 700 | Hero, section titles |
| Body | Geist Sans (Inter fallback) | 400/500/600 | Paragraphs, UI text |
| Mono/Code | Geist Mono | 400 | Pricing numbers, stats |
| Serif accent | Lora | 400 italic | Quotes, story section |

### Design Principles
- **Mobile-first**, responsive
- **Whitespace-heavy** — let content breathe
- **Bold contrasts** — large headings, dark/light section alternation
- **Minimal UI chrome** — no unnecessary borders, shadows only where needed
- **Every section has a CTA** — always a path to signup

---

## 3. Site Map & Pages

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Homepage | Hero + Features + Story + Numbers + CTA |
| `/features` | Features | Detailed feature breakdown |
| `/pricing` | Pricing | Plans & comparison table |
| `/use-cases` | Use Cases | Independent PT, gym, online coach |
| `/blog` | Blog | Content marketing (existing Supabase blog) |
| `/blog/[slug]` | Blog Post | Individual post |
| `/contact` | Contact | Inquiry form |
| `/tools` | Fitness Tools | 7 calculators (SEO magnet) |
| `/tools/[slug]` | Calculator | Individual calculator page |
| `/login` | Login | Existing auth |
| `/signup` | Sign Up | New PT registration |
| `/tr/*` | Turkish | All pages mirrored in Turkish |

### Legal (existing, kept)
| Route | Page |
|-------|------|
| `/legal/privacy` | Privacy Policy |
| `/legal/terms` | Terms of Service |
| `/legal/refund` | Refund Policy |

---

## 4. Homepage Design

### Section 1: Navbar (sticky)
```
MEGIN [logo]          Features  Pricing  Use Cases  Blog  Tools  Login  [Get Started →]
```
- Sticky on scroll with subtle backdrop blur
- Mobile: hamburger menu
- "Get Started" = primary red button, always visible
- Language switcher (EN/TR) — small, in corner or footer

### Section 2: Hero
```
Stop losing clients.
Start growing.

Client tracking, workout programming, nutrition
management, and progress reports — all in one
platform built by a trainer, for trainers.

[Get Started — It's Free ████████]

╔══════════════════════════╗
║  Dashboard screenshot /  ║
║  mockup (browser frame)  ║
╚══════════════════════════╝

⚡ No credit card required   🔒 Free for up to 5 clients
```
- Full-width, centered text
- Bold display font for heading
- Dashboard screenshot adds credibility
- Trust signals below CTA

### Section 3: Problem Strip (dark)
```
[#0A0A0A background, white text]

Spreadsheets. WhatsApp groups.
Forgotten renewals. Sound familiar?

Most trainers lose clients not because of bad training —
but because they can't keep track of what matters.

Megin replaces your chaos with a system that works.
```

### Section 4: Features Overview (6 cards)
```
Everything you need. Nothing you don't.

[Icon] Client Management     [Icon] Workout Programs     [Icon] Nutrition Tracking
Track packages, lessons,     Build weekly programs        Assign meals, track
measurements, payments.      with superset support.       compliance with photos.

[Icon] Progress Reports      [Icon] Badge System          [Icon] Push Notifications
Body measurements,           Gamify client engagement     Automatic reminders
before/after photos,         with 27 achievement          for renewals, meals,
PDF exports.                 badges.                      and motivation.

                      [See All Features →]
```

### Section 5: Story (Built by a trainer)
```
Built by a trainer who got tired of
losing track of his own clients.

[Hamza photo]   "I was managing 20+ clients with
                 spreadsheets and WhatsApp. I kept
                 forgetting renewals, losing measurement
                 data, and spending hours on admin work.

                 So I built what I needed."

                 — Hamza Sivrikaya, Founder
```

### Section 6: Numbers (dark)
```
[#0A0A0A background]

     500+              10,000+             98%
   Workouts            Meals             Client
   delivered          tracked           retention
```
Animated counters (IntersectionObserver trigger). Real data from production.

### Section 7: Final CTA
```
Your clients deserve better tracking.
You deserve a simpler workflow.

[Get Started — It's Free ████████]

Free for up to 5 clients. No credit card. No time limit.
```

### Section 8: Footer
```
MEGIN

Product          Resources        Legal              Connect
Features         Blog             Privacy Policy     Twitter
Pricing          Tools            Terms              Instagram
Use Cases        Contact          Refund Policy

© 2026 Megin. All rights reserved.        [EN | TR]
```

---

## 5. Features Page (`/features`)

### Structure
Deep-dive into each feature with:
- **Section per feature** (alternating layout: text-left/image-right, then text-right/image-left)
- **Real screenshots** or UI mockups
- **Benefit-first headings** (not feature names)

### Features to showcase
| Feature | Heading | Description |
|---------|---------|-------------|
| Client Management | Never lose track of a client again | Packages, lessons, payments, measurements — all in one place |
| Workout Programs | Programs that write themselves | Weekly workout builder with supersets, warmup, cardio sections |
| Nutrition Tracking | Know what your clients eat | Daily meal tracking with photo proof, compliance percentages |
| Progress & Reports | Show clients their transformation | Body measurements, graphs, before/after photos, PDF reports |
| Badge System | Gamify the grind | 27 achievement badges that keep clients engaged and motivated |
| Push Notifications | Be there without being there | Automatic reminders for meal logging, renewals, weekly motivation |
| Parent-Child | Train families | Link family members under one parent account |
| Onboarding | First impressions that stick | Guided onboarding flow for new clients |
| Fitness Tools | Attract new clients | 7 free calculators that bring organic traffic to your brand |

### CTA at bottom
```
Ready to simplify your workflow?
[Get Started — It's Free]
```

---

## 6. Pricing Page (`/pricing`)

### Tiers
| Plan | Price | Clients | Features |
|------|-------|---------|----------|
| **Free** | $0/mo | Up to 5 | All core features, basic support |
| **Pro** | $X/mo | Up to 30 | Priority support, custom branding, advanced analytics |
| **Gym** | $XX/mo | Unlimited | Multi-trainer, API access, dedicated support |

> Note: Exact pricing TBD. Backend (multi-tenant, billing) is Hamza's scope.

### Layout
```
Simple, honest pricing.

[Free]              [Pro]               [Gym]
$0/month            $XX/month           $XX/month
5 clients           30 clients          Unlimited
All core features   Everything in Free  Everything in Pro
                    + Custom branding   + Multi-trainer
                    + Analytics         + API access

[Get Started]       [Get Started]       [Contact Us]
```

### FAQ Section (below pricing)
Accordion with common questions:
- What happens when I hit the client limit?
- Can I switch plans anytime?
- Is there a contract?
- What payment methods do you accept?
- Can I cancel anytime?

---

## 7. Use Cases Page (`/use-cases`)

Three persona sections:

### Independent PT
"You train 10-30 clients. You need to track packages, send programs, and remember who needs what."
- Key features: Client tracking, workout programs, push notifications

### Gym / Studio
"You manage multiple trainers under one roof. You need oversight and consistency."
- Key features: Multi-trainer (future), client management, progress reports

### Online Coach
"Your clients are remote. You need them to log meals, follow programs, and stay accountable."
- Key features: Nutrition tracking, badges, weekly reports, PWA

Each section: benefit headline + 3-4 bullet points + relevant screenshot + CTA

---

## 8. Blog (`/blog`)

### Changes from current
- **New layout** matching Megin brand (not Hamza PT brand)
- **Blog categories** (fitness tips, product updates, trainer guides)
- **Author display** with avatar
- **Related posts** section
- **SEO optimization**: proper meta, OG tags, structured data (Article schema)

### Blog post page (`/blog/[slug]`)
- Clean reading experience
- Table of contents for long posts
- Share buttons (social)
- CTA banner at bottom ("Try Megin Free")

---

## 9. Tools Page (`/tools`)

### Purpose
SEO magnets. Free fitness calculators that bring organic traffic. User calculates BMI → sees Megin → signs up.

### Changes from current
- **New route:** `/tools` (was `/araclar`)
- **English names** with Turkish alt in `/tr/tools`
- **Each tool page**: calculator + contextual CTA ("Track your clients' BMI automatically with Megin")
- **Structured data**: FAQPage schema per calculator

### Tools
| Tool | Route |
|------|-------|
| Calorie & Macro Calculator | `/tools/calorie-calculator` |
| 1RM Calculator | `/tools/one-rep-max` |
| BMI Calculator | `/tools/bmi-calculator` |
| Water Intake Calculator | `/tools/water-intake` |
| Ideal Weight Calculator | `/tools/ideal-weight` |
| Body Fat Calculator (Skinfold) | `/tools/body-fat-skinfold` |
| Body Fat Calculator (Navy) | `/tools/body-fat-navy` |

---

## 10. Contact Page (`/contact`)

Simple form:
- Name, Email, Message
- Optional: "How many clients do you train?"
- Submit → Supabase table or email (backend = Hamza)
- CTA: "Or just get started for free" link to signup

---

## 11. SEO Strategy

### Technical SEO
| Item | Implementation |
|------|----------------|
| Meta tags | Unique title/description per page |
| OG tags | Title, description, image for every page |
| Twitter cards | summary_large_image |
| Canonical URLs | Self-referencing canonicals |
| Sitemap | Auto-generated `sitemap.ts` (extend existing) |
| Robots.txt | Allow all, block admin/dashboard |
| Hreflang | `<link rel="alternate" hreflang="en" />` + `hreflang="tr"` |
| Core Web Vitals | LCP < 2.5s, FID < 100ms, CLS < 0.1 |
| Image optimization | `next/image` with proper `sizes`, WebP |
| Font loading | `next/font` with `display: swap` |

### Structured Data (JSON-LD)
| Page | Schema |
|------|--------|
| Homepage | `SoftwareApplication` + `Organization` |
| Pricing | `Product` with `Offer` per plan |
| Blog | `Article` with `author`, `datePublished` |
| Blog list | `ItemList` |
| Tools | `FAQPage` + `WebApplication` |
| Contact | `ContactPage` |

### Content SEO
| Target | Keywords |
|--------|----------|
| Homepage | personal trainer software, PT client management, trainer CRM |
| Features | workout tracking app, nutrition tracking for trainers, client progress reports |
| Tools | BMI calculator, calorie calculator, 1RM calculator (high volume, low competition) |
| Blog | trainer business tips, client retention, fitness programming |

---

## 12. AEO Strategy (Answer Engine Optimization)

### What is AEO?
Optimization for AI-powered search: Google AI Overviews, Perplexity, ChatGPT web search, Bing Copilot. These engines extract structured answers from content.

### Implementation
| Technique | Where |
|-----------|-------|
| **FAQ sections** with clear Q&A format | Pricing page, each tool page, features page |
| **Concise definitions** at top of content | Blog posts, tool pages ("What is BMI? BMI is...") |
| **Structured data** (FAQ schema) | All FAQ sections |
| **Comparison content** | "Megin vs spreadsheets", "Megin vs Trainerize" (blog posts) |
| **"How to" content** | Blog: "How to track client nutrition", "How to reduce client churn" |
| **Feature tables** with clear headers | Features page, pricing page |
| **Direct answer format** | First paragraph of every page directly answers the page's intent |

### Blog AEO Topics (high AI-search potential)
- "What is the best personal trainer software?"
- "How to track client progress as a personal trainer"
- "How to reduce client churn as a PT"
- "Free BMI calculator for personal trainers"
- "How to build a workout program for clients"

---

## 13. i18n Architecture

### Approach
Next.js App Router with path-based locale:
- `/` → English (default)
- `/tr` → Turkish

### Implementation
```
src/app/
├── (marketing)/              # Marketing layout (new Megin navbar + footer)
│   ├── page.tsx              # EN homepage
│   ├── features/page.tsx
│   ├── pricing/page.tsx
│   ├── use-cases/page.tsx
│   ├── blog/page.tsx
│   ├── blog/[slug]/page.tsx
│   ├── contact/page.tsx
│   ├── tools/page.tsx
│   ├── tools/[slug]/page.tsx
│   └── layout.tsx            # Marketing layout with new navbar + footer
├── tr/                       # Turkish mirror
│   ├── (marketing)/
│   │   ├── page.tsx          # TR homepage
│   │   └── ...
├── (auth)/login/             # Existing auth
├── (admin)/                  # Existing admin (Hamza)
├── (member)/                 # Existing member (Hamza)
└── signup/page.tsx           # New PT registration
```

### Translation approach
- Translation files: `src/lib/i18n/en.ts` + `src/lib/i18n/tr.ts`
- Server-side: detect locale from URL path
- Shared components receive locale prop or use context
- Blog content: same Supabase table, can have `locale` column later

---

## 14. Route Architecture (coexistence with existing app)

### New route group: `(marketing)`
All Megin SaaS pages live under a `(marketing)` route group with its own layout:
- **New navbar** (Megin brand, not Hamza PT)
- **New footer** (product links, legal, language switcher)
- **No auth required** (public pages)

### Existing route groups (untouched)
- `(admin)` — Admin panel (Hamza's dashboard)
- `(member)` — Member panel (client dashboard)
- `(auth)` — Login/auth flow

### Middleware updates needed
- Add new public routes: `/features`, `/pricing`, `/use-cases`, `/contact`, `/tools`, `/signup`, `/tr/*`
- Keep existing auth logic for `/admin` and `/dashboard`

---

## 15. Component Architecture

### New components needed

**Marketing layout:**
- `MarketingNavbar` — Megin branded navbar (replaces LandingNavbar)
- `MarketingFooter` — Full footer with links, language switcher
- `MarketingLayout` — Wrapper with navbar + footer

**Homepage:**
- `HeroSection` — Hero with CTA + dashboard mockup
- `ProblemStrip` — Dark problem statement section
- `FeaturesGrid` — 6-card feature overview
- `StorySection` — Hamza's story
- `NumbersStrip` — Animated counter stats
- `CTASection` — Final call-to-action

**Shared marketing:**
- `CTAButton` — Consistent primary CTA (extends existing Button)
- `SectionHeading` — Consistent heading pattern
- `DarkSection` / `LightSection` — Alternating section wrappers
- `LanguageSwitcher` — EN/TR toggle

**Page-specific:**
- `PricingCards` — Tier comparison
- `FAQAccordion` — Expandable FAQ (reusable)
- `UseCaseCard` — Persona section
- `FeatureShowcase` — Feature detail with screenshot
- `ContactForm` — Inquiry form
- `SignUpForm` — PT registration form

### Reusable from existing
- `Button` (ui) — extend with new variants
- `Card` (ui) — reuse for feature cards
- `AnimatedCounter` — reuse for numbers section
- Blog components — restyle, keep logic
- Calculator components — restyle, keep calculation logic

---

## 16. Implementation Priority

### Phase 1: Foundation
1. Brand setup (colors, fonts, CSS tokens)
2. Marketing layout (navbar, footer)
3. Homepage (all 7 sections)
4. Basic SEO setup (meta, OG, sitemap, structured data)

### Phase 2: Core Pages
5. Features page
6. Pricing page
7. Use Cases page
8. Tools page (restyle existing calculators)

### Phase 3: Content & Growth
9. Blog restyle
10. Contact page
11. Signup page (form UI — backend = Hamza)
12. i18n (Turkish translations)

### Phase 4: Optimization
13. AEO content (FAQ sections, blog articles)
14. Performance optimization (Core Web Vitals)
15. A/B testing prep
16. Analytics integration

---

## 17. Open Questions (for Hamza)

- [ ] Signup flow: What data does PT registration need? (name, email, password, gym name?)
- [ ] Free tier: Confirmed 5 clients free? Any time limit?
- [ ] Pricing: What are the actual prices for Pro/Gym tiers?
- [ ] Contact form: Where should submissions go? (Supabase table, email, both?)
- [ ] Dashboard screenshots: Can we use real screenshots or need mockups?
- [ ] Domain: What will the final domain be? (megin.com, getmegin.com, etc.)
