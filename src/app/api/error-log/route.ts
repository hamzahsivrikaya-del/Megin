import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logError } from '@/lib/error-logger'

// Anomali esikleri: bu tipler N kez tekrarlarsa Telegram'a dusur
const ANOMALY_THRESHOLDS: Record<string, number> = {
  unexpected_logout: 3,
  api_401: 5,
  chunk_load_error: 10,
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body?.message) return NextResponse.json({ error: 'message gerekli' }, { status: 400 })

  // Opsiyonel: kullanici bilgisi
  let userId: string | undefined
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    userId = session?.user?.id
  } catch {
    // auth hatasi onemli degil
  }

  // Sessiz hata tipi
  const silentType = body.metadata?.type as string | undefined
  const isSilent = body.message?.startsWith('[silent]')

  // Anomali tespiti: son 1 saatte ayni tip kac kez tekrarladi?
  let escalateToFatal = false
  if (isSilent && silentType && ANOMALY_THRESHOLDS[silentType]) {
    const admin = createAdminClient()
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count } = await admin
      .from('error_logs')
      .select('id', { count: 'exact', head: true })
      .eq('message', body.message)
      .gte('created_at', oneHourAgo)

    if ((count || 0) >= ANOMALY_THRESHOLDS[silentType]) {
      escalateToFatal = true
    }
  }

  await logError({
    level: escalateToFatal ? 'fatal' : (body.level || 'error'),
    message: escalateToFatal
      ? `[ANOMALI] ${silentType}: Son 1 saatte ${ANOMALY_THRESHOLDS[silentType!]}+ tekrar`
      : body.message,
    stack: body.stack,
    path: body.path,
    userId,
    metadata: body.metadata,
    source: 'client',
  })

  return NextResponse.json({ ok: true })
}
