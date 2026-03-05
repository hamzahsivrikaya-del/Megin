import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { PLAN_CONFIGS } from '@/lib/plans'
import { SubscriptionPlan } from '@/lib/types'

const MERCHANT_ID = process.env.PAYTR_MERCHANT_ID!
const MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY!
const MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT!
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { plan } = (await request.json()) as { plan: SubscriptionPlan }

    if (!plan || !PLAN_CONFIGS[plan] || plan === 'free') {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const planConfig = PLAN_CONFIGS[plan]
    if (!planConfig.price) {
      return NextResponse.json({ error: 'Plan price not set' }, { status: 400 })
    }

    const { data: trainer } = await supabase
      .from('trainers')
      .select('id, full_name')
      .eq('user_id', session.user.id)
      .single()

    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }

    const merchantOid = `megin_${trainer.id.slice(0, 8)}_${Date.now()}`
    const paymentAmount = planConfig.price * 100 // kuruş

    const basket = JSON.stringify([
      [`Megin ${planConfig.name} Plan - Aylik`, paymentAmount.toString(), '1'],
    ])
    const userBasket = Buffer.from(basket).toString('base64')

    const userIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1'

    const email = session.user.email || ''
    const noInstallment = '1'
    const maxInstallment = '0'
    const currency = 'TL'
    const testMode = process.env.NODE_ENV === 'production' ? '0' : '1'

    // HMAC-SHA256 token
    const hashStr = `${MERCHANT_ID}${userIp}${merchantOid}${email}${paymentAmount}${userBasket}${noInstallment}${maxInstallment}${currency}${testMode}`
    const paytrToken = crypto
      .createHmac('sha256', MERCHANT_KEY)
      .update(hashStr + MERCHANT_SALT)
      .digest('base64')

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
      user_address: 'Turkiye',
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

    // payment_orders'a kaydet
    const adminSupabase = createAdminClient(
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
