import { SubscriptionPlan } from './types'
import { hasFeatureAccess } from './plans'
import type { SpotlightStep } from '@/components/shared/SpotlightTour'

// ── Settings checklist için (Platform Rehberi) ──
export interface TourStep {
  key: string
  title: string
  icon: string
  description: string
  ctaLabel: string
  ctaPath: string
  lockedFeature?: string
}

export const TRAINER_TOUR_STEPS: TourStep[] = [
  {
    key: 'invite_client',
    title: 'Üye Davet Et',
    icon: '👥',
    description: 'Davet linki oluştur, üyenle paylaş. WhatsApp veya kopyala-yapıştır ile gönder.',
    ctaLabel: 'Üye Ekle',
    ctaPath: '/dashboard/clients',
  },
  {
    key: 'create_workout',
    title: 'Antrenman Oluştur',
    icon: '🏋️',
    description: 'Üyene özel antrenman programı oluştur. Egzersiz, set, tekrar belirle.',
    ctaLabel: 'Antrenman Oluştur',
    ctaPath: '/dashboard/workouts',
  },
  {
    key: 'record_measurement',
    title: 'Ölçüm Kaydet',
    icon: '📏',
    description: 'Üyenin kilo, boy ve vücut ölçümlerini takip et.',
    ctaLabel: 'Ölçüm Kaydet',
    ctaPath: '/dashboard/clients',
  },
  {
    key: 'send_notification',
    title: 'Bildirim Gönder',
    icon: '🔔',
    description: 'Üyelerine motivasyon mesajı veya hatırlatma gönder.',
    ctaLabel: 'Pro ile Aç',
    ctaPath: '/dashboard/upgrade',
    lockedFeature: 'push_notifications',
  },
  {
    key: 'complete_profile',
    title: 'Profilini Tamamla',
    icon: '⚙️',
    description: 'Bio, telefon, sosyal medya linklerini ekle. Davet sayfan daha profesyonel görünsün.',
    ctaLabel: 'Ayarlara Git',
    ctaPath: '/dashboard/settings',
  },
]

export const CLIENT_TOUR_STEPS: TourStep[] = [
  {
    key: 'view_profile',
    title: 'Profilini İncele',
    icon: '👤',
    description: 'Ayarlardan fotoğrafını, bilgilerini düzenleyebilirsin.',
    ctaLabel: 'Ayarlara Git',
    ctaPath: '/app/settings',
  },
  {
    key: 'view_measurements',
    title: 'Ölçümlerini Gör',
    icon: '📏',
    description: 'Antrenörünün kaydettiği ölçümlerin burada. Kilo, boy, vücut ölçüleri.',
    ctaLabel: 'Ölçümlere Git',
    ctaPath: '/app/progress',
  },
  {
    key: 'explore_badges',
    title: 'Rozetlerini Keşfet',
    icon: '🏅',
    description: 'Antrenmanlarını tamamladıkça rozetler kazan!',
    ctaLabel: 'Pro ile Aç',
    ctaPath: '/app/rozetler',
    lockedFeature: 'badges',
  },
  {
    key: 'view_progress',
    title: 'İlerleme Sayfan',
    icon: '📊',
    description: 'Genel gelişimini ve istatistiklerini buradan takip et.',
    ctaLabel: 'İlerlemene Bak',
    ctaPath: '/app/progress',
  },
]

// ── Dashboard spotlight tour adımları ──
export const TRAINER_SPOTLIGHT_STEPS: SpotlightStep[] = [
  {
    target: 'stat-clients',
    title: 'Danışan Özeti',
    description: 'Aktif danışan sayın burada. Yeni danışan ekledikçe güncellenir.',
    position: 'bottom',
  },
  {
    target: 'quick-add-client',
    title: 'Danışan Ekle',
    description: 'Bu butona tıklayarak yeni danışan ekle ve davet linki oluştur.',
    position: 'bottom',
  },
  {
    target: 'quick-add-lesson',
    title: 'Manuel Ders Ekle',
    description: 'Her ders sonrası buradan ders kaydı oluştur. Geçmişe yönelik derslerini de ekleyebilirsin. Paket dersleri otomatik güncellenir.',
    position: 'bottom',
  },
  {
    target: 'quick-add-measurement',
    title: 'Ölçüm Gir',
    description: 'Danışanının vücut ölçümlerini kaydet. İlerleme takibinin temeli bu.',
    position: 'bottom',
  },
]

export const CLIENT_SPOTLIGHT_STEPS: SpotlightStep[] = [
  {
    target: 'welcome-card',
    title: 'Paket Durumun',
    description: 'Kalan ders sayın ve paket bilgilerin burada. Paket azaldığında uyarı alırsın.',
    position: 'bottom',
  },
  {
    target: 'quick-links',
    title: 'Hızlı Erişim',
    description: 'Programın, ölçümlerin, paketlerin ve haftalık özetine buradan ulaşabilirsin.',
    position: 'top',
  },
]

export function isTourStepLocked(step: TourStep, plan: SubscriptionPlan): boolean {
  if (!step.lockedFeature) return false
  return !hasFeatureAccess(plan, step.lockedFeature)
}

export function isTourComplete(
  steps: TourStep[],
  completed: string[],
  skipped: string[],
  plan: SubscriptionPlan
): boolean {
  return steps.every(step =>
    completed.includes(step.key) ||
    skipped.includes(step.key) ||
    isTourStepLocked(step, plan)
  )
}
