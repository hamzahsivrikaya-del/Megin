import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPushNotification } from '@/lib/push'

interface LessonChange {
  type: 'create' | 'update' | 'delete'
  clientId: string
  clientName: string
  date: string
  startTime: string
  oldDate?: string
  oldStartTime?: string
  duration: number
}

const DAYS_TR = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
const MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']

function formatDateTR(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getDate()} ${MONTHS_TR[d.getMonth()]} ${DAYS_TR[d.getDay()]}`
}

function buildMessage(change: LessonChange): { title: string; message: string; notifType: string } {
  if (change.type === 'delete') {
    return {
      title: 'Ders İptali',
      message: `${formatDateTR(change.date)} ${change.startTime} dersiniz iptal edildi. Detaylar için antrenörünüzle iletişime geçin.`,
      notifType: 'lesson_cancelled',
    }
  }
  if (change.type === 'update') {
    const parts: string[] = []
    if (change.oldStartTime && change.oldStartTime !== change.startTime) {
      parts.push(`${change.oldStartTime}'den ${change.startTime}'e`)
    }
    if (change.oldDate && change.oldDate !== change.date) {
      parts.push(`${formatDateTR(change.oldDate)}'den ${formatDateTR(change.date)}'e`)
    }
    return {
      title: 'Ders Değişikliği',
      message: parts.length > 0
        ? `Dersiniz ${parts.join(', ')} taşındı.`
        : `${formatDateTR(change.date)} ${change.startTime} dersinde değişiklik yapıldı.`,
      notifType: 'lesson_updated',
    }
  }
  return {
    title: 'Yeni Ders',
    message: `${formatDateTR(change.date)} ${change.startTime}'de dersiniz var.`,
    notifType: 'lesson_scheduled',
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Trainer kontrolü
  const { data: trainer } = await supabase
    .from('trainers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!trainer) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let changes: LessonChange[]
  try {
    const body = await req.json()
    changes = body.changes
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!changes || changes.length === 0) {
    return NextResponse.json({ ok: true })
  }

  const admin = createAdminClient()

  // Client'ların user_id'lerini toplu al
  const clientIds = [...new Set(changes.map((c) => c.clientId))]
  const { data: clients } = await admin
    .from('clients')
    .select('id, user_id')
    .in('id', clientIds)
    .not('user_id', 'is', null)

  const clientUserMap = new Map(
    (clients ?? []).map((c) => [c.id, c.user_id as string])
  )

  let notified = 0

  for (const change of changes) {
    const userId = clientUserMap.get(change.clientId)
    if (!userId) continue

    const { title, message, notifType } = buildMessage(change)

    await admin.from('notifications').insert({
      user_id: userId,
      trainer_id: trainer.id,
      type: notifType,
      title,
      message,
      is_read: false,
    })

    await sendPushNotification({
      userIds: [userId],
      title,
      message,
      url: '/app',
    })

    notified++
  }

  return NextResponse.json({ ok: true, notified })
}
