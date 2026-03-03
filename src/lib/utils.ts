// Tailwind class birleştirme
export function cn(...inputs: string[]) {
  return inputs.filter(Boolean).join(' ')
}

// Fiyat formatlama (TL)
export function formatPrice(price: number | null): string | null {
  if (price === null || price === undefined) return null
  return price.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' TL'
}

// Tarih formatlama (Türkçe)
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatDateShort(date: string | Date): string {
  return new Date(date).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
  })
}

// Paket bitiş tarihi hesaplama
// Her 10 ders = 40 gün
export function calculateExpireDate(startDate: string, totalLessons: number): string {
  const start = new Date(startDate)
  const days = (totalLessons / 10) * 40
  start.setDate(start.getDate() + days)
  return start.toISOString().split('T')[0]
}

// Kalan gün hesaplama
export function daysRemaining(expireDate: string): number {
  const now = new Date()
  const expire = new Date(expireDate)
  const diff = expire.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

// Paket durumu etiketi
export function getPackageStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: 'Aktif',
    completed: 'Tamamlandı',
    expired: 'Süresi Doldu',
  }
  return labels[status] || status
}

// Bildirim tipi etiketi
export function getNotificationTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    low_lessons: 'Ders Uyarısı',
    weekly_report: 'Haftalık Rapor',
    inactive: 'Devamsızlık',
    manual: 'Bildirim',
    nutrition_reminder: 'Beslenme Hatırlatma',
    admin_nutrition_summary: 'Beslenme Durumu',
    admin_measurement: 'Ölçüm',
    admin_low_lessons: 'Paket Uyarısı',
  }
  return labels[type] || type
}

// Zaman farkı (Türkçe)
export function timeAgo(date: string): string {
  const now = new Date()
  const then = new Date(date)
  const diff = now.getTime() - then.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'Az önce'
  if (minutes < 60) return `${minutes} dk önce`
  if (hours < 24) return `${hours} saat önce`
  if (days < 7) return `${days} gün önce`
  return formatDate(date)
}

// Local YYYY-MM-DD (timezone-safe, toISOString kullanma!)
function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

// Haftanın pazartesi tarihini al (YYYY-MM-DD)
export function getMonday(date: Date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return toDateStr(d)
}

const DAY_NAMES = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']

// Gün adı (0=Pazartesi ... 6=Pazar)
export function getDayName(dayIndex: number): string {
  return DAY_NAMES[dayIndex] || ''
}

// Hafta aralığı formatı: "17-23 Şub 2026"
export function formatWeekRange(mondayStr: string): string {
  const monday = new Date(mondayStr + 'T00:00:00')
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']

  if (monday.getMonth() === sunday.getMonth()) {
    return `${monday.getDate()}-${sunday.getDate()} ${monthNames[monday.getMonth()]} ${monday.getFullYear()}`
  }
  return `${monday.getDate()} ${monthNames[monday.getMonth()]} - ${sunday.getDate()} ${monthNames[sunday.getMonth()]} ${sunday.getFullYear()}`
}

// Önceki/sonraki hafta pazartesi tarihi
export function getAdjacentWeek(mondayStr: string, direction: -1 | 1): string {
  const d = new Date(mondayStr + 'T00:00:00')
  d.setDate(d.getDate() + direction * 7)
  return toDateStr(d)
}

// Bugünün gün indexi (0=Pazartesi ... 6=Pazar)
export function getTodayDayIndex(): number {
  const day = new Date().getDay()
  return day === 0 ? 6 : day - 1
}
