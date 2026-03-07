# Habit Tracking (Aliskanlik Takibi) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Port the habit tracking system from hamza-web-site to Megin, adapting it to the trainer/client model with Pro plan gating.

**Architecture:** 3 DB tables (habit_definitions, client_habits, habit_logs) with admin client for RLS bypass. Client-side pages under (client)/app/aliskanliklar/, trainer can view/assign habits via ClientDetail. Feature gated as Pro.

**Tech Stack:** Next.js 15, Supabase (admin client pattern), TypeScript, Tailwind v4

---

### Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/017_habit_tracking.sql`

**Changes:**
- Create `habit_definitions` table (same seed data, Turkish names from start)
- Create `client_habits` table (replaces user_habits, uses client_id referencing clients)
- Create `habit_logs` table (uses client_id referencing clients)
- RLS enabled but use admin client pattern (no custom RLS functions needed)
- Indexes for performance

---

### Task 2: Types

**Files:**
- Modify: `src/lib/types.ts`

**Changes:**
- Add `HabitDefinition`, `ClientHabit`, `HabitLog` interfaces
- Add `HabitCategory` type

---

### Task 3: Feature Gating

**Files:**
- Modify: `src/lib/plans.ts`

**Changes:**
- Add `'habits'` to free.lockedFeatures
- Add `'Aliskanlik takibi'` to pro.features list

---

### Task 4: API Routes

**Files:**
- Create: `src/app/api/habits/route.ts`

**Changes:**
- GET: Fetch client's active habits + today's logs + 90-day logs (trainer or client auth)
- POST action=setup: Client selects habits (soft-delete + reactivate + insert)
- POST action=log: Client logs daily completion (upsert)
- POST action=assign: Trainer assigns habit to client
- POST action=deactivate: Trainer deactivates a client's habit

---

### Task 5: Client Pages - Setup

**Files:**
- Create: `src/app/(client)/app/aliskanliklar/setup/page.tsx`
- Create: `src/app/(client)/app/aliskanliklar/setup/SetupClient.tsx`

**Changes:**
- Server page: fetch habit_definitions + existing selections via admin client
- Client component: intro screen + category tab selection wizard
- Adapted paths: /app/aliskanliklar/setup

---

### Task 6: Client Pages - Main Dashboard

**Files:**
- Create: `src/app/(client)/app/aliskanliklar/page.tsx`
- Create: `src/app/(client)/app/aliskanliklar/HabitsClient.tsx`

**Changes:**
- Server page: check active habits, redirect to setup if none, wrap in FeatureGate
- Client component: streak hero, weekly grid, habit list with toggle
- Adapted API paths: /api/habits

---

### Task 7: Client Navbar

**Files:**
- Modify: `src/components/shared/ClientNavbar.tsx`

**Changes:**
- Add habits nav item with feature='habits' gating
- Icon: fire/checkmark style

---

### Task 8: Trainer - ClientDetail Habits Tab

**Files:**
- Modify: `src/app/(trainer)/dashboard/clients/[id]/ClientDetail.tsx`
- Modify: `src/app/(trainer)/dashboard/clients/[id]/page.tsx`

**Changes:**
- Add 'habits' tab to ClientDetail
- Fetch client's habits + definitions in page.tsx
- Show assigned habits, allow assign/deactivate
- Similar to existing dependents pattern

---

### Task 9: Upgrade Page

**Files:**
- Modify: `src/app/(trainer)/dashboard/upgrade/page.tsx` (if feature list shown)

**Changes:**
- Add habits to Pro feature list display
