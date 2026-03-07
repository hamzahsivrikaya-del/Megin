import { SubscriptionPlan } from './types'

export interface PlanConfig {
  name: string
  clientLimit: number       // -1 = sınırsız
  price: number | null      // aylık TL, null = ücretsiz veya henüz belirlenmedi
  features: string[]
  lockedFeatures: string[]
}

export const PLAN_CONFIGS: Record<SubscriptionPlan, PlanConfig> = {
  free: {
    name: 'Free',
    clientLimit: 3,
    price: null,
    features: [
      'Danışan ekleme + davet linki',
      'Temel antrenman programı',
      'Ders sayısı takibi',
      'Temel ölçüm (kilo, boy)',
      'PT Handle (public profil)',
    ],
    lockedFeatures: [
      'habits',
      'measurement_charts',
      'nutrition',
      'weekly_reports',
      'push_notifications',
      'finance',
      'badges',
      'goals',
      'pdf_export',
      'calendar',
      'progress_photos',
      'blog',
      'dependents',
      'risk_score',
      'instagram_card',
      'finance_forecast',
    ],
  },
  pro: {
    name: 'Pro',
    clientLimit: 10,
    price: 400,
    features: [
      'Alışkanlık takibi',
      'Ölçüm grafikleri + trend analizi',
      'Beslenme takibi (öğün + foto)',
      'Haftalık otomatik raporlar',
      'Push bildirimler',
      'Finans ekranı (gelir özeti)',
      'Rozet sistemi',
      'Hedef belirleme',
      'PDF rapor export',
    ],
    lockedFeatures: [
      'calendar',
      'progress_photos',
      'blog',
      'dependents',
      'risk_score',
      'instagram_card',
      'finance_forecast',
    ],
  },
  elite: {
    name: 'Elite',
    clientLimit: -1,
    price: 800,
    features: [
      'Takvim (ders planlama)',
      'İlerleme fotoğrafları + slider',
      'Blog sistemi',
      'Bağlı üye (veli-çocuk)',
      'Risk skoru',
      'Instagram paylaşım kartı',
      'Finans tahmini',
    ],
    lockedFeatures: [],
  },
}

/** Trainer'ın mevcut planına göre danışan limiti kontrolü */
export function canAddClient(plan: SubscriptionPlan, currentClientCount: number): boolean {
  const config = PLAN_CONFIGS[plan]
  if (config.clientLimit === -1) return true
  return currentClientCount < config.clientLimit
}

/** Özellik erişim kontrolü */
export function hasFeatureAccess(plan: SubscriptionPlan, feature: string): boolean {
  const config = PLAN_CONFIGS[plan]
  return !config.lockedFeatures.includes(feature)
}

/** Bir üst planı döndür (upgrade hedefi) */
export function getUpgradePlan(currentPlan: SubscriptionPlan): SubscriptionPlan | null {
  if (currentPlan === 'free') return 'pro'
  if (currentPlan === 'pro') return 'elite'
  return null
}
