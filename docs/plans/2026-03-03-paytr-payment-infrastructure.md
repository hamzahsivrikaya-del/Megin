# PayTR Payment Infrastructure — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** PayTR iFrame API ödeme altyapısını kurmak — DB tabloları, token oluşturma, webhook, plan enforcement, upgrade UI.

**Architecture:** Next.js API Routes ile PayTR iFrame API entegrasyonu. Server-side token oluşturma → iframe'de ödeme formu → PayTR webhook ile callback → subscription güncelleme. Plan limitleri server-side enforce edilir.

**Tech Stack:** Next.js 16 App Router, Supabase (PostgreSQL), PayTR iFrame API, Node.js crypto (HMAC-SHA256)

---

## Ön Bilgi: Mevcut Durum

- `subscriptions` tablosu VAR (migration 001), trainer kayıtta otomatik `free` plan atanıyor (migration 003)
- `Subscription` TypeScript interface VAR (`src/lib/types.ts:267-279`)
- DB enum `subscription_plan`: `'free' | 'pro' | 'studio'` — design doc'ta "Elite" olarak değiştirildi
- Hiçbir yerde plan kontrolü/enforcement YOK
- PayTR credential'ları henüz alınmadı — .env'ye placeholder eklenecek

## Ön Bilgi: PayTR iFrame API

**Step 1 — Token Oluşturma:**
- POST `https://www.paytr.com/odeme/api/get-token`
- Gerekli: `merchant_id`, `user_ip`, `merchant_oid`, `email`, `payment_amount` (kuruş × 100), `user_basket` (base64 JSON), `no_installment`, `max_installment`, `currency`, `test_mode`, `paytr_token` (HMAC-SHA256)
- Token hesaplama: `HMAC-SHA256(merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode + merchant_salt, merchant_key) → base64`
- Başarılı yanıt: `{"status":"success","token":"abc123..."}`
- iframe src: `https://www.paytr.com/odeme/guvenli/{token}`

**Step 2 — Callback/Webhook:**
- PayTR, ödeme sonucu POST ile `notification_url`'e bildirir
- POST body: `merchant_oid`, `status` ('success'|'failed'), `total_amount`, `hash`, `payment_type`, `currency`
- Hash doğrulama: `HMAC-SHA256(merchant_oid + merchant_salt + status + total_amount, merchant_key) → base64`
- Yanıt: Sadece `OK` text döndür (HTML yok)
- Başarısız bağlantıda PayTR 1 dk sonra tekrar dener — idempotent olmalı

---

## Task 1: Database Migration — payment_orders tablosu + enum güncelleme

**Files:**
- Create: `supabase/migrations/006_payment_infrastructure.sql`
- Modify: `src/lib/types.ts:267-279`

**Step 1: Migration SQL yaz**

```sql
-- ══════════════════════════════════════════════════════════════
-- Payment Infrastructure — 006
-- ══════════════════════════════════════════════════════════════

-- Enum güncelle: 'studio' → 'elite'
ALTER TYPE subscription_plan RENAME VALUE 'studio' TO 'elite';

-- Ödeme siparişleri tablosu
CREATE TABLE payment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  merchant_oid TEXT NOT NULL UNIQUE,
  plan subscription_plan NOT NULL,
  amount INTEGER NOT NULL,              -- kuruş cinsinden (49900 = 499₺)
  currency TEXT NOT NULL DEFAULT 'TL',
  status TEXT NOT NULL DEFAULT 'pending', -- pending | success | failed
  paytr_token TEXT,
  payment_type TEXT,                     -- card | eft
  failed_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_payment_orders_trainer_id ON payment_orders(trainer_id);
CREATE INDEX idx_payment_orders_merchant_oid ON payment_orders(merchant_oid);
CREATE INDEX idx_payment_orders_status ON payment_orders(status);

-- Subscriptions tablosuna PayTR referansları ekle
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS payment_order_id UUID REFERENCES payment_orders(id),
  ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN NOT NULL DEFAULT false;

-- RLS
ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can view own payment orders"
  ON payment_orders FOR SELECT
  USING (trainer_id IN (
    SELECT id FROM trainers WHERE user_id = auth.uid()
  ));

-- Service role INSERT/UPDATE için (API route'lar service role kullanır)
```

**Step 2: TypeScript type'larını güncelle**

`src/lib/types.ts` dosyasında:

```typescript
// 'studio' → 'elite' değiştir
export type SubscriptionPlan = 'free' | 'pro' | 'elite'

// Yeni type ekle
export type PaymentOrderStatus = 'pending' | 'success' | 'failed'

export interface PaymentOrder {
  id: string
  trainer_id: string
  merchant_oid: string
  plan: SubscriptionPlan
  amount: number
  currency: string
  status: PaymentOrderStatus
  paytr_token: string | null
  payment_type: string | null
  failed_reason: string | null
  created_at: string
  completed_at: string | null
}

// Subscription'a yeni field'lar ekle
export interface Subscription {
  id: string
  trainer_id: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  current_period_start: string
  current_period_end: string
  payment_order_id: string | null
  cancel_at_period_end: boolean
  created_at: string
}
```

**Step 3: Commit**

```bash
git add supabase/migrations/006_payment_infrastructure.sql src/lib/types.ts
git commit -m "feat: add payment_orders table and update subscription types for PayTR"
```

---

## Task 2: Plan Limitleri ve Konfigürasyon — `src/lib/plans.ts`

**Files:**
- Create: `src/lib/plans.ts`

**Step 1: Plan konfigürasyon dosyasını oluştur**

```typescript
import { SubscriptionPlan } from './types'

export interface PlanConfig {
  name: string
  clientLimit: number       // -1 = sınırsız
  price: number | null      // aylık TL, null = ücretsiz
  features: string[]
  lockedFeatures: string[]  // bu planda kilitli olan özellikler
}

export const PLAN_CONFIGS: Record<SubscriptionPlan, PlanConfig> = {
  free: {
    name: 'Free',
    clientLimit: 3,
    price: null,
    features: [
      'Danışan ekleme + davet linki',
      'Temel antrenman programı',
      'Ders sayısı takibi',
      'Temel ölçüm (kilo, boy)',
      'PT Handle (public profil)',
    ],
    lockedFeatures: [
      'measurement_charts',
      'nutrition',
      'weekly_reports',
      'push_notifications',
      'finance',
      'fitness_tools',
      'progress_photos',
      'badges',
      'blog',
      'dependents',
      'risk_score',
      'instagram_card',
      'finance_forecast',
    ],
  },
  pro: {
    name: 'Pro',
    clientLimit: 10,
    price: null, // Fiyat henüz belirlenmedi — PayTR'den sonra set edilecek
    features: [
      'Ölçüm grafikleri + trend analizi',
      'Beslenme takibi (öğün + foto)',
      'Haftalık otomatik raporlar',
      'Push bildirimler',
      'Finans ekranı (gelir özeti)',
      'Fitness araçları (7 araç)',
    ],
    lockedFeatures: [
      'progress_photos',
      'badges',
      'blog',
      'dependents',
      'risk_score',
      'instagram_card',
      'finance_forecast',
    ],
  },
  elite: {
    name: 'Elite',
    clientLimit: -1,
    price: null, // Fiyat henüz belirlenmedi
    features: [
      'İlerleme fotoğrafları + slider',
      'Rozet sistemi (23 rozet)',
      'Blog',
      'Bağlı üye (veli-çocuk)',
      'Risk skoru',
      'Instagram paylaşım kartı',
      'Finans tahmini',
    ],
    lockedFeatures: [],
  },
}

/** Trainer'ın mevcut planına göre danışan limiti kontrolü */
export function canAddClient(plan: SubscriptionPlan, currentClientCount: number): boolean {
  const config = PLAN_CONFIGS[plan]
  if (config.clientLimit === -1) return true
  return currentClientCount < config.clientLimit
}

/** Özellik erişim kontrolü */
export function hasFeatureAccess(plan: SubscriptionPlan, feature: string): boolean {
  const config = PLAN_CONFIGS[plan]
  return !config.lockedFeatures.includes(feature)
}

/** Bir üst planı döndür (upgrade hedefi) */
export function getUpgradePlan(currentPlan: SubscriptionPlan): SubscriptionPlan | null {
  if (currentPlan === 'free') return 'pro'
  if (currentPlan === 'pro') return 'elite'
  return null
}
```

**Step 2: Commit**

```bash
git add src/lib/plans.ts
git commit -m "feat: add plan configuration with limits and feature gating"
```

---

## Task 3: Subscription Helper — `src/lib/subscription.ts`

**Files:**
- Create: `src/lib/subscription.ts`

**Step 1: Subscription yardımcı fonksiyonlarını oluştur**

```typescript
import { SupabaseClient } from '@supabase/supabase-js'
import { Subscription, SubscriptionPlan } from './types'

/** Trainer'ın aktif subscription'ını getir */
export async function getTrainerSubscription(
  supabase: SupabaseClient,
  trainerId: string
): Promise<Subscription | null> {
  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('trainer_id', trainerId)
    .single()

  return data
}

/** Trainer'ın aktif plan'ını getir (fallback: free) */
export async function getTrainerPlan(
  supabase: SupabaseClient,
  trainerId: string
): Promise<SubscriptionPlan> {
  const sub = await getTrainerSubscription(supabase, trainerId)
  if (!sub || sub.status !== 'active') return 'free'
  return sub.plan
}

/** Trainer'ın aktif danışan sayısını getir */
export async function getActiveClientCount(
  supabase: SupabaseClient,
  trainerId: string
): Promise<number> {
  const { count } = await supabase
    .from('clients')
    .select('id', { count: 'exact', head: true })
    .eq('trainer_id', trainerId)
    .eq('is_active', true)

  return count || 0
}

/** Subscription'ı güncelle (plan yükseltme) */
export async function upgradeSubscription(
  supabase: SupabaseClient,
  trainerId: string,
  newPlan: SubscriptionPlan,
  paymentOrderId: string
): Promise<boolean> {
  const now = new Date()
  const periodEnd = new Date(now)
  periodEnd.setMonth(periodEnd.getMonth() + 1)

  const { error } = await supabase
    .from('subscriptions')
    .update({
      plan: newPlan,
      status: 'active',
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      payment_order_id: paymentOrderId,
      cancel_at_period_end: false,
    })
    .eq('trainer_id', trainerId)

  return !error
}
```

**Step 2: Commit**

```bash
git add src/lib/subscription.ts
git commit -m "feat: add subscription helper functions"
```

---

## Task 4: PayTR Token API Route — `/api/paytr/token`

**Files:**
- Create: `src/app/api/paytr/token/route.ts`

**Step 1: Token oluşturma endpoint'ini yaz**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import crypto from 'crypto'
import { PLAN_CONFIGS } from '@/lib/plans'
import { SubscriptionPlan } from '@/lib/types'

const MERCHANT_ID = process.env.PAYTR_MERCHANT_ID!
const MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY!
const MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT!
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!

export async function POST(request: NextRequest) {
  try {
    // Auth kontrolü
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { plan } = await request.json() as { plan: SubscriptionPlan }

    if (!plan || !PLAN_CONFIGS[plan] || plan === 'free') {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const planConfig = PLAN_CONFIGS[plan]
    if (!planConfig.price) {
      return NextResponse.json({ error: 'Plan price not set' }, { status: 400 })
    }

    // Trainer bilgilerini al
    const { data: trainer } = await supabase
      .from('trainers')
      .select('id, full_name')
      .eq('user_id', session.user.id)
      .single()

    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }

    // Unique order ID
    const merchantOid = `megin_${trainer.id.slice(0, 8)}_${Date.now()}`

    // Tutar (kuruş cinsinden)
    const paymentAmount = planConfig.price * 100

    // User basket (base64 JSON)
    const basket = JSON.stringify([
      [`Megin ${planConfig.name} Plan - Aylık`, paymentAmount.toString(), '1']
    ])
    const userBasket = Buffer.from(basket).toString('base64')

    // User IP
    const userIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || '127.0.0.1'

    const email = session.user.email || ''
    const noInstallment = '1'  // Taksit yok
    const maxInstallment = '0'
    const currency = 'TL'
    const testMode = process.env.NODE_ENV === 'production' ? '0' : '1'

    // HMAC token hesaplama
    const hashStr = `${MERCHANT_ID}${userIp}${merchantOid}${email}${paymentAmount}${userBasket}${noInstallment}${maxInstallment}${currency}${testMode}`
    const paytrToken = crypto
      .createHmac('sha256', MERCHANT_KEY)
      .update(hashStr + MERCHANT_SALT)
      .digest('base64')

    // PayTR'ye token isteği
    const formData = new URLSearchParams({
      merchant_id: MERCHANT_ID,
      user_ip: userIp,
      merchant_oid: merchantOid,
      email,
      payment_amount: paymentAmount.toString(),
      paytr_token: paytrToken,
      user_basket: userBasket,
      debug_on: testMode === '1' ? '1' : '0',
      no_installment: noInstallment,
      max_installment: maxInstallment,
      currency,
      test_mode: testMode,
      user_name: trainer.full_name,
      user_address: 'Türkiye',
      user_phone: '05000000000',
      merchant_ok_url: `${SITE_URL}/dashboard/upgrade?status=ok`,
      merchant_fail_url: `${SITE_URL}/dashboard/upgrade?status=fail`,
      timeout_limit: '30',
      lang: 'tr',
      merchant_notify_url: `${SITE_URL}/api/paytr/callback`,
    })

    const paytrResponse = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      body: formData,
    })
    const paytrData = await paytrResponse.json()

    if (paytrData.status !== 'success') {
      console.error('PayTR token error:', paytrData)
      return NextResponse.json(
        { error: 'Payment initialization failed', reason: paytrData.reason },
        { status: 500 }
      )
    }

    // DB'ye payment order kaydet (service role ile)
    const adminSupabase = createAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    await adminSupabase.from('payment_orders').insert({
      trainer_id: trainer.id,
      merchant_oid: merchantOid,
      plan,
      amount: paymentAmount,
      currency,
      status: 'pending',
      paytr_token: paytrData.token,
    })

    return NextResponse.json({
      token: paytrData.token,
      merchant_oid: merchantOid,
    })
  } catch (error) {
    console.error('PayTR token error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/paytr/token/route.ts
git commit -m "feat: add PayTR iFrame token generation API route"
```

---

## Task 5: PayTR Callback/Webhook — `/api/paytr/callback`

**Files:**
- Create: `src/app/api/paytr/callback/route.ts`

**Step 1: Callback endpoint'ini yaz**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY!
const MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT!

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const merchantOid = formData.get('merchant_oid') as string
    const status = formData.get('status') as string
    const totalAmount = formData.get('total_amount') as string
    const hash = formData.get('hash') as string
    const paymentType = formData.get('payment_type') as string | null
    const failedReasonMsg = formData.get('failed_reason_msg') as string | null

    // Hash doğrulama
    const hashStr = `${merchantOid}${MERCHANT_SALT}${status}${totalAmount}`
    const expectedHash = crypto
      .createHmac('sha256', MERCHANT_KEY)
      .update(hashStr)
      .digest('base64')

    if (hash !== expectedHash) {
      console.error('PayTR callback: invalid hash', { merchantOid })
      return new NextResponse('OK', { status: 200 }) // PayTR her zaman OK bekler
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Mevcut order'ı kontrol et (idempotency)
    const { data: order } = await supabase
      .from('payment_orders')
      .select('id, trainer_id, plan, status')
      .eq('merchant_oid', merchantOid)
      .single()

    if (!order) {
      console.error('PayTR callback: order not found', { merchantOid })
      return new NextResponse('OK', { status: 200 })
    }

    // Zaten işlenmiş — idempotent yanıt
    if (order.status !== 'pending') {
      return new NextResponse('OK', { status: 200 })
    }

    if (status === 'success') {
      // Payment order'ı güncelle
      await supabase
        .from('payment_orders')
        .update({
          status: 'success',
          payment_type: paymentType,
          completed_at: new Date().toISOString(),
        })
        .eq('id', order.id)

      // Subscription'ı yükselt
      const now = new Date()
      const periodEnd = new Date(now)
      periodEnd.setMonth(periodEnd.getMonth() + 1)

      await supabase
        .from('subscriptions')
        .update({
          plan: order.plan,
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          payment_order_id: order.id,
          cancel_at_period_end: false,
        })
        .eq('trainer_id', order.trainer_id)

      // Audit log
      const { data: trainer } = await supabase
        .from('trainers')
        .select('user_id')
        .eq('id', order.trainer_id)
        .single()

      if (trainer) {
        await supabase.from('audit_logs').insert({
          trainer_id: order.trainer_id,
          user_id: trainer.user_id,
          action: 'subscription_upgraded',
          entity_type: 'subscription',
          entity_id: order.id,
          metadata: { plan: order.plan, amount: totalAmount, payment_type: paymentType },
        })
      }
    } else {
      // Başarısız ödeme
      await supabase
        .from('payment_orders')
        .update({
          status: 'failed',
          failed_reason: failedReasonMsg,
          completed_at: new Date().toISOString(),
        })
        .eq('id', order.id)
    }

    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    console.error('PayTR callback error:', error)
    return new NextResponse('OK', { status: 200 }) // Her zaman OK dön
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/paytr/callback/route.ts
git commit -m "feat: add PayTR callback webhook with hash verification and idempotency"
```

---

## Task 6: Upgrade Sayfası — `/dashboard/upgrade`

**Files:**
- Create: `src/app/(trainer)/dashboard/upgrade/page.tsx`

**Step 1: Pricing/Upgrade sayfasını oluştur**

Server component olarak plan karşılaştırma kartları + client component olarak PayTR iframe modal.

```typescript
// page.tsx — server component
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PLAN_CONFIGS } from '@/lib/plans'
import { getTrainerPlan } from '@/lib/subscription'
import UpgradeClient from './UpgradeClient'

export default async function UpgradePage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/login')

  const { data: trainer } = await supabase
    .from('trainers')
    .select('id')
    .eq('user_id', session.user.id)
    .single()

  if (!trainer) redirect('/login')

  const currentPlan = await getTrainerPlan(supabase, trainer.id)

  return <UpgradeClient currentPlan={currentPlan} plans={PLAN_CONFIGS} />
}
```

**Step 2: Client component — UpgradeClient.tsx**

```typescript
// UpgradeClient.tsx
'use client'

import { useState } from 'react'
import { SubscriptionPlan } from '@/lib/types'
import { PlanConfig } from '@/lib/plans'
import Card from '@/components/ui/Card'
import PaymentModal from '@/components/shared/PaymentModal'

interface Props {
  currentPlan: SubscriptionPlan
  plans: Record<SubscriptionPlan, PlanConfig>
}

const PLAN_ORDER: SubscriptionPlan[] = ['free', 'pro', 'elite']

export default function UpgradeClient({ currentPlan, plans }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)

  const currentIndex = PLAN_ORDER.indexOf(currentPlan)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Planını Yükselt</h1>
        <p className="text-text-secondary text-sm mt-1">
          Mevcut planın: <strong>{plans[currentPlan].name}</strong>
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {PLAN_ORDER.map((planKey, index) => {
          const plan = plans[planKey]
          const isCurrent = planKey === currentPlan
          const isUpgrade = index > currentIndex
          const isHighlighted = planKey === 'pro'

          return (
            <Card
              key={planKey}
              className={`relative ${isHighlighted ? 'ring-2 ring-primary' : ''}`}
            >
              {isHighlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                  Popüler
                </div>
              )}

              <div className="text-center mb-4">
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <div className="mt-2">
                  {plan.price ? (
                    <span className="text-3xl font-bold">{plan.price}₺<span className="text-sm font-normal text-text-secondary">/ay</span></span>
                  ) : planKey === 'free' ? (
                    <span className="text-3xl font-bold">Ücretsiz</span>
                  ) : (
                    <span className="text-lg text-text-secondary">Fiyat belirlenecek</span>
                  )}
                </div>
                <p className="text-sm text-text-secondary mt-1">
                  {plan.clientLimit === -1 ? 'Sınırsız danışan' : `${plan.clientLimit} danışan`}
                </p>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <svg className="w-4 h-4 mt-0.5 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                {isCurrent ? (
                  <button disabled className="w-full py-2.5 rounded-lg bg-border text-text-secondary text-sm font-medium">
                    Mevcut Plan
                  </button>
                ) : isUpgrade && plan.price ? (
                  <button
                    onClick={() => setSelectedPlan(planKey)}
                    className="w-full py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors cursor-pointer"
                  >
                    {plan.name}&apos;ya Geç
                  </button>
                ) : isUpgrade ? (
                  <button disabled className="w-full py-2.5 rounded-lg bg-border/50 text-text-tertiary text-sm font-medium">
                    Yakında
                  </button>
                ) : null}
              </div>
            </Card>
          )
        })}
      </div>

      {/* PayTR iframe modal */}
      {selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
        />
      )}
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/app/(trainer)/dashboard/upgrade/page.tsx src/app/(trainer)/dashboard/upgrade/UpgradeClient.tsx
git commit -m "feat: add upgrade page with plan comparison cards"
```

---

## Task 7: PayTR Ödeme Modal Componenti

**Files:**
- Create: `src/components/shared/PaymentModal.tsx`

**Step 1: PaymentModal component'ini oluştur**

```typescript
'use client'

import { useState, useEffect } from 'react'
import { SubscriptionPlan } from '@/lib/types'
import Modal from '@/components/ui/Modal'

interface Props {
  plan: SubscriptionPlan
  onClose: () => void
}

export default function PaymentModal({ plan, onClose }: Props) {
  const [iframeToken, setIframeToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function getToken() {
      try {
        const res = await fetch('/api/paytr/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan }),
        })
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Ödeme başlatılamadı')
          return
        }

        setIframeToken(data.token)
      } catch {
        setError('Bağlantı hatası')
      } finally {
        setLoading(false)
      }
    }

    getToken()
  }, [plan])

  return (
    <Modal onClose={onClose}>
      <div className="w-full max-w-lg mx-auto">
        <h2 className="text-lg font-bold mb-4">Ödeme</h2>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-danger text-sm mb-4">{error}</p>
            <button
              onClick={onClose}
              className="text-sm text-primary font-medium cursor-pointer"
            >
              Kapat
            </button>
          </div>
        )}

        {iframeToken && (
          <iframe
            src={`https://www.paytr.com/odeme/guvenli/${iframeToken}`}
            className="w-full border-0 rounded-lg"
            style={{ height: '460px' }}
            frameBorder="0"
          />
        )}
      </div>
    </Modal>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/shared/PaymentModal.tsx
git commit -m "feat: add PayTR payment modal with iframe integration"
```

---

## Task 8: Sidebar'a Upgrade CTA + Plan Badge Ekle

**Files:**
- Modify: `src/components/shared/Sidebar.tsx`
- Modify: `src/components/shared/MobileSidebar.tsx`
- Modify: `src/app/(trainer)/layout.tsx`
- Modify: `src/app/(trainer)/TrainerLayoutClient.tsx`

**Step 1: Trainer layout'tan plan bilgisini çek**

`src/app/(trainer)/layout.tsx`:
```typescript
// Mevcut trainer query'sini genişlet:
// .select('full_name') → .select('full_name, subscriptions(plan)')
// TrainerLayoutClient'e plan prop'u ekle
```

**Step 2: TrainerLayoutClient'e plan prop'u ekle**

Plan prop'unu Sidebar ve MobileSidebar'a geçir.

**Step 3: Sidebar'a upgrade CTA ekle**

Sidebar'ın alt kısmına (Çıkış Yap butonunun üstüne):
- Free plan'daysa: `Pro'ya Geç` butonu (primary renk, dikkat çekici)
- Pro plan'daysa: `Elite'e Geç` butonu (daha subtle)
- Elite plan'daysa: küçük `Elite` badge'i göster

```typescript
// Sidebar footer kısmına eklenecek:
{plan !== 'elite' && (
  <Link
    href="/dashboard/upgrade"
    className="flex items-center gap-2 px-3 py-2.5 mx-3 mb-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors"
  >
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
    {plan === 'free' ? "Pro'ya Geç" : "Elite'e Geç"}
  </Link>
)}
```

**Step 4: Commit**

```bash
git add src/app/(trainer)/layout.tsx src/app/(trainer)/TrainerLayoutClient.tsx src/components/shared/Sidebar.tsx src/components/shared/MobileSidebar.tsx
git commit -m "feat: add upgrade CTA to sidebar with plan-aware display"
```

---

## Task 9: Plan Enforcement — Danışan Limiti

**Files:**
- Modify: `src/app/api/trainer/clients/route.ts` (POST handler'da limit kontrolü)

**Step 1: Client ekleme API'sinde plan limitini kontrol et**

POST handler'ın başına:
```typescript
// Trainer'ın planını ve mevcut danışan sayısını kontrol et
const plan = await getTrainerPlan(supabase, trainer.id)
const clientCount = await getActiveClientCount(supabase, trainer.id)

if (!canAddClient(plan, clientCount)) {
  return NextResponse.json(
    { error: 'client_limit', message: 'Danışan limitinize ulaştınız. Planınızı yükseltin.' },
    { status: 403 }
  )
}
```

**Step 2: Commit**

```bash
git add src/app/api/trainer/clients/route.ts
git commit -m "feat: enforce client limit based on subscription plan"
```

---

## Task 10: Settings'e Abonelik Bilgisi Tab'ı Ekle

**Files:**
- Modify: `src/app/(trainer)/dashboard/settings/page.tsx`

**Step 1: Settings sayfasına Abonelik bölümü ekle**

Mevcut profil bilgileri altına yeni bir section:
- Mevcut plan adı + badge
- Abonelik durumu (aktif/cancelled)
- Dönem bitiş tarihi
- "Planı Yükselt" linki → `/dashboard/upgrade`
- Ödeme geçmişi listesi (payment_orders tablosundan)

**Step 2: Commit**

```bash
git add src/app/(trainer)/dashboard/settings/page.tsx
git commit -m "feat: add subscription info section to settings page"
```

---

## Task 11: Env Değişkenleri + Middleware Güncellemesi

**Files:**
- Modify: `.env.local` (PayTR placeholder'ları ekle)
- Modify: `src/lib/supabase/middleware.ts` (callback URL'yi public yap)

**Step 1: .env.local'e PayTR değişkenlerini ekle**

```
# PayTR
PAYTR_MERCHANT_ID=
PAYTR_MERCHANT_KEY=
PAYTR_MERCHANT_SALT=
```

**Step 2: Middleware'de PayTR callback'i public yap**

`/api/paytr/callback` zaten `/api/` ile başladığı için middleware'den geçiyor (mevcut `isPublicPath` kontrolünde `request.nextUrl.pathname.startsWith('/api/')` var). Ek değişiklik gerekmez.

**Step 3: Sidebar menüsüne "Upgrade" route'u eklenmeyecek** — Sidebar'ın altındaki CTA butonu yeterli. Menü kalabalığı yaratmayalım.

**Step 4: Commit**

```bash
git add .env.local src/lib/supabase/middleware.ts
git commit -m "feat: add PayTR env placeholders"
```

---

## Özet: Dosya Listesi

| Dosya | Aksiyon |
|-------|---------|
| `supabase/migrations/006_payment_infrastructure.sql` | Yeni |
| `src/lib/types.ts` | Güncelle |
| `src/lib/plans.ts` | Yeni |
| `src/lib/subscription.ts` | Yeni |
| `src/app/api/paytr/token/route.ts` | Yeni |
| `src/app/api/paytr/callback/route.ts` | Yeni |
| `src/app/(trainer)/dashboard/upgrade/page.tsx` | Yeni |
| `src/app/(trainer)/dashboard/upgrade/UpgradeClient.tsx` | Yeni |
| `src/components/shared/PaymentModal.tsx` | Yeni |
| `src/components/shared/Sidebar.tsx` | Güncelle |
| `src/components/shared/MobileSidebar.tsx` | Güncelle |
| `src/app/(trainer)/layout.tsx` | Güncelle |
| `src/app/(trainer)/TrainerLayoutClient.tsx` | Güncelle |
| `src/app/api/trainer/clients/route.ts` | Güncelle |
| `src/app/(trainer)/dashboard/settings/page.tsx` | Güncelle |
| `.env.local` | Güncelle |

## Bağımlılık Sırası

```
Task 1 (DB + Types) → Task 2 (Plans) → Task 3 (Subscription helpers)
  → Task 4 (PayTR Token API) → Task 5 (PayTR Callback)
  → Task 6 (Upgrade Page) → Task 7 (Payment Modal)
  → Task 8 (Sidebar CTA)
  → Task 9 (Plan Enforcement)
  → Task 10 (Settings Billing)
  → Task 11 (Env + Middleware)
```
