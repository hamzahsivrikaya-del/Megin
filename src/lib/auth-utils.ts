import { timingSafeEqual } from 'crypto'

/** Timing-safe string karşılaştırma — timing attack'ları önler */
export function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return timingSafeEqual(Buffer.from(a), Buffer.from(b))
}
