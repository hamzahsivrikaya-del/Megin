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
    const paymentType = (formData.get('payment_type') as string) || null
    const failedReasonMsg = (formData.get('failed_reason_msg') as string) || null

    // Hash doğrulama
    const hashStr = `${merchantOid}${MERCHANT_SALT}${status}${totalAmount}`
    const expectedHash = crypto
      .createHmac('sha256', MERCHANT_KEY)
      .update(hashStr)
      .digest('base64')

    if (hash !== expectedHash) {
      console.error('PayTR callback: invalid hash', { merchantOid })
      return new NextResponse('OK', { status: 200 })
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

    // Zaten işlenmiş
    if (order.status !== 'pending') {
      return new NextResponse('OK', { status: 200 })
    }

    const now = new Date().toISOString()

    if (status === 'success') {
      await supabase
        .from('payment_orders')
        .update({
          status: 'success',
          payment_type: paymentType,
          completed_at: now,
        })
        .eq('id', order.id)

      // Subscription yükselt
      const periodEnd = new Date()
      periodEnd.setMonth(periodEnd.getMonth() + 1)

      await supabase
        .from('subscriptions')
        .update({
          plan: order.plan,
          status: 'active',
          current_period_start: now,
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
      await supabase
        .from('payment_orders')
        .update({
          status: 'failed',
          failed_reason: failedReasonMsg,
          completed_at: now,
        })
        .eq('id', order.id)
    }

    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    console.error('PayTR callback error:', error)
    // PayTR her zaman OK bekler
    return new NextResponse('OK', { status: 200 })
  }
}
