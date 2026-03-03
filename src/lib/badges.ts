export interface BadgeDefinition {
  id: string
  name: string
  description: string
  emoji: string
  category: 'lesson' | 'streak' | 'goal' | 'nutrition' | 'special'
  trigger: 'auto' | 'admin'
  threshold: number
  metric: string
}

export interface BadgeStats {
  totalLessons: number
  weeklyLessons: number
  maxStreak: number
  currentStreak: number
  goalsSet: number
  goalsAchieved: number
  nutritionEntries: number
  bestNutritionCompliance: number
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // ── Ders Kategorisi ──
  {
    id: 'first_lesson',
    name: 'İlk Adım',
    description: 'İlk dersini tamamladın! Her büyük yolculuk tek adımla başlar.',
    emoji: '👟',
    category: 'lesson',
    trigger: 'auto',
    threshold: 1,
    metric: 'totalLessons',
  },
  {
    id: 'ten_lessons',
    name: 'Azimli Sporcu',
    description: '10 ders tamamladın. Düzen seni güçlü yapıyor!',
    emoji: '💪',
    category: 'lesson',
    trigger: 'auto',
    threshold: 10,
    metric: 'totalLessons',
  },
  {
    id: 'twentyfive_lessons',
    name: 'Kararlı Atlet',
    description: '25 dersle kendini kanıtladın. Bu bir alışkanlık!',
    emoji: '🏃',
    category: 'lesson',
    trigger: 'auto',
    threshold: 25,
    metric: 'totalLessons',
  },
  {
    id: 'fifty_lessons',
    name: 'Yarı Yüzyıl',
    description: '50 ders! Yarı yüzyıl çalışmayı hak ediyorsun.',
    emoji: '🔥',
    category: 'lesson',
    trigger: 'auto',
    threshold: 50,
    metric: 'totalLessons',
  },
  {
    id: 'hundred_lessons',
    name: 'Yüz Kulübü',
    description: '100 ders tamamladın. Sen artık bir efsanesin!',
    emoji: '🏆',
    category: 'lesson',
    trigger: 'auto',
    threshold: 100,
    metric: 'totalLessons',
  },

  // ── Süreklilik Kategorisi ──
  {
    id: 'three_in_a_row',
    name: 'Üç Haftada Bir',
    description: '3 hafta üst üste ders yaptın. Ritim yakalandı!',
    emoji: '📅',
    category: 'streak',
    trigger: 'auto',
    threshold: 3,
    metric: 'maxStreak',
  },
  {
    id: 'four_week_streak',
    name: 'Bir Ay Boyunca',
    description: '4 hafta kesintisiz antrenman. Harika bir ay!',
    emoji: '🗓️',
    category: 'streak',
    trigger: 'auto',
    threshold: 4,
    metric: 'maxStreak',
  },
  {
    id: 'five_week_streak',
    name: 'Beş Yıldız',
    description: '5 hafta üst üste! İrade gücün yıldız gibi parlıyor.',
    emoji: '⭐',
    category: 'streak',
    trigger: 'auto',
    threshold: 5,
    metric: 'maxStreak',
  },
  {
    id: 'eight_week_streak',
    name: 'İki Ay Ustası',
    description: '8 hafta boyunca hiç kopma yok. Olağanüstü disiplin!',
    emoji: '🎯',
    category: 'streak',
    trigger: 'auto',
    threshold: 8,
    metric: 'maxStreak',
  },
  {
    id: 'twelve_week_streak',
    name: 'Mevsimlik Şampiyon',
    description: '12 hafta, yani üç aylık süreklilik. Sen bir şampiyonsun!',
    emoji: '👑',
    category: 'streak',
    trigger: 'auto',
    threshold: 12,
    metric: 'maxStreak',
  },

  // ── Hedef Kategorisi ──
  {
    id: 'goal_setter',
    name: 'Hedef Koyucu',
    description: 'İlk hedefini belirledin. Nereye gideceğini bilmek güçlü başlangıç!',
    emoji: '🎪',
    category: 'goal',
    trigger: 'auto',
    threshold: 1,
    metric: 'goalsSet',
  },
  {
    id: 'goal_achiever',
    name: 'Hedef Avcısı',
    description: 'Bir hedefine ulaştın! Söz verdin, tutun.',
    emoji: '🎯',
    category: 'goal',
    trigger: 'auto',
    threshold: 1,
    metric: 'goalsAchieved',
  },

  // ── Beslenme Kategorisi ──
  {
    id: 'first_nutrition',
    name: 'Beslenme Kaydı',
    description: 'İlk beslenme kaydını yaptın. Farkındalık değişimi başlatır!',
    emoji: '🥗',
    category: 'nutrition',
    trigger: 'auto',
    threshold: 1,
    metric: 'nutritionEntries',
  },
  {
    id: 'healthy_week',
    name: 'Sağlıklı Hafta',
    description: 'Bir haftada %80 ve üzeri beslenme uyumu sağladın. Harika!',
    emoji: '🥦',
    category: 'nutrition',
    trigger: 'auto',
    threshold: 80,
    metric: 'bestNutritionCompliance',
  },
  {
    id: 'perfect_week',
    name: 'Mükemmel Hafta',
    description: 'Bir haftada %100 beslenme uyumu! Demir irade!',
    emoji: '💎',
    category: 'nutrition',
    trigger: 'auto',
    threshold: 100,
    metric: 'bestNutritionCompliance',
  },

  // ── Özel Kategorisi ──
  {
    id: 'athlete_of_month',
    name: 'Ayın Sporcusu',
    description: 'Eğitmenin seni bu ay en iyi sporcu seçti. Tebrikler!',
    emoji: '🌟',
    category: 'special',
    trigger: 'admin',
    threshold: 0,
    metric: 'admin',
  },
]

export const BADGE_CATEGORY_LABELS: Record<BadgeDefinition['category'], string> = {
  lesson: 'Ders',
  streak: 'Süreklilik',
  goal: 'Hedef',
  nutrition: 'Beslenme',
  special: 'Özel',
}

export function getBadgeProgress(badge: BadgeDefinition, stats: BadgeStats): number {
  if (badge.trigger === 'admin') return 0
  const value = stats[badge.metric as keyof BadgeStats] ?? 0
  if (badge.threshold === 0) return 0
  return Math.min(1, value / badge.threshold)
}

export function isBadgeEarned(badge: BadgeDefinition, stats: BadgeStats): boolean {
  if (badge.trigger === 'admin') return false
  const value = stats[badge.metric as keyof BadgeStats] ?? 0
  return value >= badge.threshold
}
