// ── Tarih Helpers ──
export function toDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
}

// ── Takvim Helpers ──
export function getMonday(date: Date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return toDateStr(d)
}

const DAY_NAMES = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']

export function getDayName(dayIndex: number): string {
  return DAY_NAMES[dayIndex] || ''
}

export function getAdjacentWeek(mondayStr: string, direction: -1 | 1): string {
  const d = new Date(mondayStr + 'T00:00:00')
  d.setDate(d.getDate() + direction * 7)
  return toDateStr(d)
}

// ── Fiyat Helpers ──
export function formatPrice(price: number | null): string {
  if (price === null || price === undefined) return ''
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(price)
}

// ── Paket Durumu ──
export function getPackageStatusLabel(status: string): string {
  switch (status) {
    case 'active': return 'Aktif'
    case 'completed': return 'Tamamlandı'
    case 'expired': return 'Süresi Doldu'
    default: return status
  }
}

// ── Kalan Gün ──
export function daysRemaining(expireDate: string): number {
  const now = new Date()
  const expire = new Date(expireDate)
  const diff = expire.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

// ── String Helpers ──
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function normalizeEmail(email: string): string {
  return email
    .toLowerCase()
    .replace(/İ/g, 'i')
    .replace(/I/g, 'i')
    .replace(/Ş/g, 's')
    .replace(/Ç/g, 'c')
    .replace(/Ğ/g, 'g')
    .replace(/Ü/g, 'u')
    .replace(/Ö/g, 'o')
    .trim()
}

// ── Validation ──
export function isValidUsername(username: string): boolean {
  return /^[a-z0-9_-]{3,30}$/.test(username)
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// ── CN (class merge) ──
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

// ── Takvim Ek Helpers ──
export function getTodayDayIndex(): number {
  const day = new Date().getDay()
  return day === 0 ? 6 : day - 1 // Pazartesi=0 ... Pazar=6
}

export function formatWeekRange(mondayStr: string): string {
  const monday = new Date(mondayStr + 'T00:00:00')
  const sunday = new Date(monday)
  sunday.setDate(sunday.getDate() + 6)
  const fmt = (d: Date) => d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
  return `${fmt(monday)} – ${fmt(sunday)}`
}

// ── Zaman Helpers ──
export function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return 'az önce'
  if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`
  if (diff < 604800) return `${Math.floor(diff / 86400)} gün önce`
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
}

// ── Bildirim Helpers ──
const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  lesson_reminder: 'Ders Hatırlatma',
  nutrition_reminder: 'Beslenme Hatırlatma',
  weekly_report: 'Haftalık Rapor',
  badge: 'Rozet',
  manual: 'Manuel',
  calendar_update: 'Takvim Güncelleme',
  calendar_cancel: 'Takvim İptal',
  package_warning: 'Paket Uyarısı',
  motivation: 'Motivasyon',
  habit_reminder: 'Alışkanlık',
  streak_warning: 'Seri Uyarısı',
  inactive_warning: 'İnaktif Uyarısı',
  daily_summary: 'Günlük Özet',
}

export function getNotificationTypeLabel(type: string): string {
  return NOTIFICATION_TYPE_LABELS[type] || type
}

// ── Token Helpers ──
export function generateInviteToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 24; i++) {
    token += chars[Math.floor(Math.random() * chars.length)]
  }
  return token
}
