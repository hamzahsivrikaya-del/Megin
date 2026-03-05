# Dashboard Porting — hamza-web-site → Megin

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Port the entire hamza-web-site dashboard structure (PT sidebar, all admin pages, member dashboard, all member sub-pages) to Megin with multi-tenant adaptation.

**Architecture:** hamza-web-site is single-tenant (one trainer). Megin is multi-tenant SaaS — every query must scope by `trainer_id`. hamza-web-site uses a single `users` table with `role` field; Megin uses separate `trainers` and `clients` tables. PT routes: `/dashboard/*`, Client routes: `/app/*`. All queries adapt to Megin's schema while UI stays visually identical.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Supabase (Auth + PostgreSQL + RLS)

**Key Adaptation Rules:**
- hamza-web-site `users (role=member)` → Megin `clients (trainer_id=current)`
- hamza-web-site `users.id` → Megin `clients.id` (for data), `clients.user_id` (for auth)
- hamza-web-site `/admin/*` → Megin `/dashboard/*`
- hamza-web-site `/dashboard/*` (member) → Megin `/app/*` (client)
- Logo: "Hamza Sivrikaya" → "MEGIN"
- Turkish typos fixed throughout (ı/i, ü/u errors)

---

## Task 1: UI Components — Card, Badge, Textarea

**Files:**
- Create: `src/components/ui/Card.tsx`
- Create: `src/components/ui/Badge.tsx`
- Create: `src/components/ui/Textarea.tsx`

Port Card (with CardHeader, CardTitle exports), Badge (5 variants: default/success/warning/danger/primary), and Textarea (with label/error support) directly from hamza-web-site. These are exact copies — no adaptation needed.

**Verify:** `npm run build`
**Commit:** `feat: add Card, Badge, Textarea UI components`

---

## Task 2: Update PT Sidebar — 6 items → 11 items + MobileSidebar

**Files:**
- Modify: `src/components/shared/Sidebar.tsx`
- Create: `src/components/shared/MobileSidebar.tsx`

**Sidebar changes:**
- Update menuItems array from 6 to 11 items matching hamza-web-site:
  1. Dashboard → `/dashboard`
  2. Danışanlar → `/dashboard/clients`
  3. Bugünkü Dersler → `/dashboard/lessons/today`
  4. Manuel Ders Ekle → `/dashboard/lessons/new`
  5. Paket Oluştur → `/dashboard/packages/new`
  6. Ölçüm Gir → `/dashboard/measurements/new`
  7. Antrenmanlar → `/dashboard/workouts`
  8. Finans → `/dashboard/finance`
  9. Bildirimler → `/dashboard/notifications`
  10. Blog → `/dashboard/blog`
  11. Ayarlar → `/dashboard/settings`
- Add logout button at bottom (same pattern as hamza-web-site)
- Logo section: show trainer name + "Kişisel Antrenör" subtitle (fetch from context or prop)
- Remove the "Pro upgrade" card at bottom
- Use exact same SVG icons from hamza-web-site

**MobileSidebar:** Port directly — hamburger button, overlay, route-change close.

**Verify:** `npm run build`
**Commit:** `feat: update sidebar with all navigation items + mobile sidebar`

---

## Task 3: Update PT Layout

**Files:**
- Modify: `src/app/(trainer)/layout.tsx`
- Create: `src/app/(trainer)/TrainerLayoutClient.tsx`

Split into server layout (auth check, fetch trainer name) + client layout (Sidebar + MobileSidebar + main content). Match hamza-web-site AdminLayout pattern: desktop sidebar fixed left, mobile hamburger, `md:ml-64` on main content.

**Verify:** `npm run build`
**Commit:** `feat: update trainer layout with desktop/mobile sidebar split`

---

## Task 4: Update PT Dashboard

**Files:**
- Modify: `src/app/(trainer)/dashboard/page.tsx`

Rewrite to match hamza-web-site admin dashboard:
1. **Stat cards** (immediate render): Aktif Danışanlar, Bu Hafta Ders, Bugün Ders (3 cards in grid)
2. **Quick action buttons**: Ders Ekle (primary), Yeni Danışan (secondary), Ölçüm Gir (secondary)
3. **Deferred alerts** (Suspense): Paket Uyarıları (low lessons / completed packages) + Bugün Gelen Danışanlar

Adapt queries: `clients` table with `trainer_id` scope instead of `users` with `role=member`.

**Verify:** `npm run build`
**Commit:** `feat: update trainer dashboard with stats, actions, alerts`

---

## Task 5: Danışan Detail Page

**Files:**
- Create: `src/app/(trainer)/dashboard/clients/[id]/page.tsx`
- Create: `src/app/(trainer)/dashboard/clients/[id]/ClientDetail.tsx`

Server page fetches: client profile, packages (with lessons), measurements, lessons, meal logs, member meals, progress photos. Passes all to ClientDetail client component.

ClientDetail shows: profile header, package management, measurement tracking, lesson history, meal plan, progress photos. Adapt all queries to use `clients.id` and scope by `trainer_id`.

**Verify:** `npm run build`
**Commit:** `feat: add client detail page with full profile`

---

## Task 6: Bugünkü Dersler (Today's Lessons)

**Files:**
- Create: `src/app/(trainer)/dashboard/lessons/today/page.tsx`
- Create: `src/app/(trainer)/dashboard/lessons/today/TodayAttendance.tsx`

Server page: fetch active packages with client names, today's lessons. Build attendees array.
TodayAttendance client component: mark lesson done/undo, progress tracking.

Adapt: `packages.user_id` → join with `clients` (via `clients.user_id`), scope by `trainer_id`.

**Verify:** `npm run build`
**Commit:** `feat: add today's lessons attendance page`

---

## Task 7: Manuel Ders Ekle (Add Lesson)

**Files:**
- Create: `src/app/(trainer)/dashboard/lessons/new/page.tsx`
- Create: `src/app/(trainer)/dashboard/lessons/new/LessonForm.tsx`

Server page: fetch active packages with client names.
LessonForm: select client, date picker, submit. Duplicate prevention.

**Verify:** `npm run build`
**Commit:** `feat: add manual lesson entry form`

---

## Task 8: Paket Oluştur (Create Package)

**Files:**
- Create: `src/app/(trainer)/dashboard/packages/new/page.tsx`
- Create: `src/app/(trainer)/dashboard/packages/new/PackageForm.tsx`

Server page: fetch all clients with active package info.
PackageForm: presets (10/20/30 lessons), custom count, price, payment status, validity period.

**Verify:** `npm run build`
**Commit:** `feat: add package creation form`

---

## Task 9: Ölçüm Gir (Enter Measurement)

**Files:**
- Create: `src/app/(trainer)/dashboard/measurements/new/page.tsx`
- Create: `src/app/(trainer)/dashboard/measurements/new/MeasurementForm.tsx`

Server page: fetch active clients.
MeasurementForm: select client, body measurements (weight, height, chest, waist, arm, leg, skinfold, body fat %), real-time calculation.

**Verify:** `npm run build`
**Commit:** `feat: add measurement entry form`

---

## Task 10: Antrenmanlar (Workouts Manager)

**Files:**
- Create: `src/app/(trainer)/dashboard/workouts/page.tsx`
- Create: `src/app/(trainer)/dashboard/workouts/WorkoutManager.tsx`

Server page: fetch public workouts for current week, all active clients.
WorkoutManager: 7-day grid, edit modal, exercise management with autocomplete, superset grouping, sections (warmup/strength/accessories/cardio), copy week, week navigation.

**Verify:** `npm run build`
**Commit:** `feat: add workout manager with 7-day editor`

---

## Task 11: Finans (Finance)

**Files:**
- Create: `src/app/(trainer)/dashboard/finance/page.tsx`
- Create: `src/app/(trainer)/dashboard/finance/FinanceClient.tsx`

Server page: immediate stats (total revenue, paid, pending, active clients) + deferred monthly breakdown, projections, risk analysis.
FinanceClient: monthly revenue table, 3-month projections, risk members.

**Verify:** `npm run build`
**Commit:** `feat: add finance page with revenue tracking and projections`

---

## Task 12: Bildirimler (Notifications Manager)

**Files:**
- Create: `src/app/(trainer)/dashboard/notifications/page.tsx`
- Create: `src/app/(trainer)/dashboard/notifications/NotificationsManager.tsx`

Server page: fetch notifications with client names, active clients.
NotificationsManager: send notification form (to one or all), notification history, delete.

**Verify:** `npm run build`
**Commit:** `feat: add notifications manager`

---

## Task 13: Blog Yönetimi

**Files:**
- Create: `src/app/(trainer)/dashboard/blog/page.tsx`
- Create: `src/app/(trainer)/dashboard/blog/BlogManager.tsx`

Server page: fetch posts.
BlogManager: CRUD for blog posts, draft/published toggle, slug generation.

**Verify:** `npm run build`
**Commit:** `feat: add blog manager`

---

## Task 14: Ayarlar (Settings)

**Files:**
- Create: `src/app/(trainer)/dashboard/settings/page.tsx`

Static page with general settings info + weekly report section. Simple — matches hamza-web-site settings page structure.

**Verify:** `npm run build`
**Commit:** `feat: add trainer settings page`

---

## Task 15: Danışan Navbar + Layout

**Files:**
- Create: `src/components/shared/ClientNavbar.tsx`
- Modify: `src/app/(client)/layout.tsx`

ClientNavbar: sticky top bar matching hamza-web-site Navbar. Links: Ana Sayfa, Programım (`/app/program`), Haftalık Özet (`/app/haftalik-ozet`), Beslenme (`/app/beslenme`), Profilim (`/app/settings`). NotificationBell, username display, logout.

Update client layout: add Navbar, change max-width to `max-w-5xl`, add proper padding.

**Verify:** `npm run build`
**Commit:** `feat: add client navbar and update layout`

---

## Task 16: NotificationBell Component

**Files:**
- Create: `src/components/shared/NotificationBell.tsx`

Client component: bell icon with unread count badge, polls every 60s, links to notifications page.

**Verify:** `npm run build`
**Commit:** `feat: add notification bell component`

---

## Task 17: Danışan Dashboard

**Files:**
- Modify: `src/app/(client)/app/page.tsx`

Full rewrite matching hamza-web-site member dashboard:
1. Welcome card with avatar, name, membership date, package status badge, progress bar
2. Badge strip (placeholder — will show when badges exist)
3. Today's nutrition card (link to beslenme)
4. Quick links grid (4 cards: Programım, İlerleme, Paketlerim, Haftalık Özet)
5. Deferred sections: past packages, recent measurement with goals, blog posts

Adapt: `clients` table with `user_id` for auth, all data scoped through client record.

**Verify:** `npm run build`
**Commit:** `feat: update client dashboard with full layout`

---

## Task 18: Danışan Program Sayfası

**Files:**
- Create: `src/app/(client)/app/program/page.tsx`
- Create: `src/components/shared/WorkoutDayCard.tsx`

Server page: fetch workouts for current week.
WorkoutDayCard: day card with exercises, superset grouping, sections, today highlight.

**Verify:** `npm run build`
**Commit:** `feat: add client program page with workout cards`

---

## Task 19: Danışan İlerleme (Progress)

**Files:**
- Create: `src/app/(client)/app/progress/page.tsx`

Server page: fetch measurements, goals, progress photos. Display ProgressPhotos and measurement charts (simplified — without recharts dependency for now, basic tables/cards).

**Verify:** `npm run build`
**Commit:** `feat: add client progress page`

---

## Task 20: Danışan Beslenme (Nutrition)

**Files:**
- Create: `src/app/(client)/app/beslenme/page.tsx`
- Create: `src/app/(client)/app/beslenme/BeslenmeClient.tsx`

Server page: fetch nutrition note, assigned meals, meal logs.
BeslenmeClient: meal compliance tracking, photo upload, notes, extra meals, 14-day history, date navigation.

**Verify:** `npm run build`
**Commit:** `feat: add client nutrition tracking page`

---

## Task 21: Danışan Haftalık Özet

**Files:**
- Create: `src/app/(client)/app/haftalik-ozet/page.tsx`
- Create: `src/components/shared/WeeklyReportList.tsx`

Server page: fetch last 12 weekly reports.
WeeklyReportList: display reports with week dates and summary.

**Verify:** `npm run build`
**Commit:** `feat: add client weekly report page`

---

## Task 22: Danışan Bildirimler

**Files:**
- Create: `src/app/(client)/app/notifications/page.tsx`
- Create: `src/components/shared/NotificationsList.tsx`

Server page: fetch client notifications.
NotificationsList: notification cards with type icons, read/unread state, time ago.

**Verify:** `npm run build`
**Commit:** `feat: add client notifications page`

---

## Task 23: Danışan Rozetler (Badges)

**Files:**
- Create: `src/app/(client)/app/rozetler/page.tsx`

Client component: badge cards by category, earned/locked states, share overlay, progress tracking.

**Verify:** `npm run build`
**Commit:** `feat: add client badges page`

---

## Task 24: Danışan Ayarlar (Settings/Profile)

**Files:**
- Create: `src/app/(client)/app/settings/page.tsx`

Client component: avatar upload, profile info form, password change, badge display.

**Verify:** `npm run build`
**Commit:** `feat: add client settings page`

---

## Task 25: Danışan Paketler

**Files:**
- Create: `src/app/(client)/app/packages/page.tsx`

Server page: fetch all packages for client. Display active package with progress bar, past packages history.

**Verify:** `npm run build`
**Commit:** `feat: add client packages page`

---

## Task 26: Final Build + Turkish Typo Fix

**Files:**
- All created/modified files

Scan all new files for Turkish character typos (ı/i, ü/u, ö/o, ç/c, ş/s, ğ/g errors). Run final `npm run build` to ensure everything compiles.

**Verify:** `npm run build` passes with 0 errors
**Commit:** `fix: correct Turkish character typos across all pages`
