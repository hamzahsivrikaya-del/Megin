import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPushNotification } from '@/lib/push'

interface LessonChange {
  type: 'create' | 'update' | 'delete'
  userId: string
  memberName: string
  date: string
  startTime: string
  oldDate?: string
  oldStartTime?: string
  duration: number
}

interface RequestBody {
  mode: 'urgent' | 'batch'
  changes: LessonChange[]
}

const DAYS_TR = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
const MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']

function formatDateTR(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getDate()} ${MONTHS_TR[d.getMonth()]} ${DAYS_TR[d.getDay()]}`
}

function buildUrgentMessage(change: LessonChange): { title: string; message: string; notifType: string } {
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

function buildBatchMessage(changes: LessonChange[]): { title: string; message: string; notifType: string } {
  const creates = changes.filter(c => c.type === 'create')
  const updates = changes.filter(c => c.type === 'update')
  const deletes = changes.filter(c => c.type === 'delete')

  if (creates.length > 0 && updates.length === 0 && deletes.length === 0) {
    const list = creates
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
      .map(c => {
        const d = new Date(c.date + 'T00:00:00')
        return `${DAYS_TR[d.getDay()].slice(0, 3)} ${c.startTime}`
      })
      .join(', ')
    return {
      title: 'Ders Programı',
      message: `Bu hafta ${creates.length} dersin planlandı: ${list}`,
      notifType: 'lesson_scheduled',
    }
  }

  const parts: string[] = []
  if (creates.length > 0) parts.push(`${creates.length} ders eklendi`)
  if (updates.length > 0) parts.push(`${updates.length} ders güncellendi`)
  if (deletes.length > 0) parts.push(`${deletes.length} ders iptal edildi`)

  return {
    title: 'Ders Programı Güncellendi',
    message: `Programında değişiklik: ${parts.join(', ')}. Dashboard'undan kontrol et.`,
    notifType: creates.length >= updates.length && creates.length >= deletes.length
      ? 'lesson_scheduled'
      : updates.length >= deletes.length ? 'lesson_updated' : 'lesson_cancelled',
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (userData?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: RequestBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { mode, changes } = body
  if (!changes || changes.length === 0) {
    return NextResponse.json({ ok: true })
  }

  const admin = createAdminClient()

  const byUser = new Map<string, LessonChange[]>()
  for (const c of changes) {
    const arr = byUser.get(c.userId) || []
    arr.push(c)
    byUser.set(c.userId, arr)
  }

  for (const [userId, userChanges] of byUser) {
    let title: string
    let message: string
    let notifType: string

    if (mode === 'urgent') {
      const result = buildUrgentMessage(userChanges[0])
      title = result.title
      message = result.message
      notifType = result.notifType
    } else {
      const result = buildBatchMessage(userChanges)
      title = result.title
      message = result.message
      notifType = result.notifType
    }

    await admin.from('notifications').insert({
      user_id: userId,
      type: notifType,
      title,
      message,
    })

    await sendPushNotification({
      userIds: [userId],
      title,
      message,
      url: '/dashboard',
    })
  }

  return NextResponse.json({ ok: true, notified: byUser.size })
}
