import { createAdminClient } from '@/lib/supabase/admin'

type ErrorLevel = 'error' | 'warn' | 'fatal'

interface LogErrorOptions {
  level?: ErrorLevel
  message: string
  stack?: string
  path?: string
  userId?: string
  metadata?: Record<string, unknown>
  source?: 'server' | 'client'
}

const TELEGRAM_BOT_TOKEN = '8772165410:AAGdIm8MPL9ZL05Piz7fxlHlHIfGMiQUU6I'
const TELEGRAM_CHAT_ID = '7705344733'

async function sendTelegramAlert(message: string) {
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    })
  } catch {
    // Telegram hatasi loglama dongusune girmesin
  }
}

export async function logError({
  level = 'error',
  message,
  stack,
  path,
  userId,
  metadata,
  source = 'server',
}: LogErrorOptions) {
  const admin = createAdminClient()

  // DB'ye kaydet
  await admin.from('error_logs').insert({
    level,
    message,
    stack: stack || null,
    path: path || null,
    user_id: userId || null,
    metadata: metadata || null,
    source,
  })

  // Fatal hatalar icin Telegram bildirimi
  if (level === 'fatal') {
    const text = [
      '<b>FATAL ERROR - Megin</b>',
      `<b>Path:</b> ${path || 'unknown'}`,
      `<b>Message:</b> ${message}`,
      stack ? `<pre>${stack.slice(0, 500)}</pre>` : '',
    ].filter(Boolean).join('\n')

    await sendTelegramAlert(text)
  }
}
