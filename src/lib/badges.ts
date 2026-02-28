export type BadgeCategory = 'lesson' | 'streak' | 'goal' | 'nutrition' | 'special'
export type BadgePhase = 'A' | 'B' | 'C'
export type BadgeTrigger = 'auto' | 'admin'

export interface BadgeDefinition {
  id: string
  name: string
  description: string
  category: BadgeCategory
  phase: BadgePhase
  trigger: BadgeTrigger
  threshold: number
  thresholdLabel: string
  quote: string
  statLabel: string
  statSub: string
}

export interface BadgeStats {
  totalLessons: number
  maxStreak: number
  currentStreak: number
  weeklyLessons: number
  goalsSet: number
  goalsAchieved: number
  nutritionEntries: number
  bestNutritionCompliance: number
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // ═══════════════════════════════════
  // FAZ A — Bağlanma (1-7 gün)
  // ═══════════════════════════════════
  {
    id: 'first_lesson',
    name: 'İlk Adım',
    description: 'İlk dersini tamamla',
    category: 'lesson',
    phase: 'A',
    trigger: 'auto',
    threshold: 1,
    thresholdLabel: '1 ders',
    quote: 'Herkes bir yerden başlar — sen bugün başladın.',
    statLabel: 'İlk Ders',
    statSub: 'tamamlanan ders',
  },
  {
    id: 'first_nutrition',
    name: 'İlk Kayıt',
    description: 'İlk beslenme kaydını gir',
    category: 'nutrition',
    phase: 'A',
    trigger: 'auto',
    threshold: 1,
    thresholdLabel: '1 kayıt',
    quote: 'Beslenme kayıtları, görünmez kazanımların.',
    statLabel: 'İlk Beslenme',
    statSub: 'beslenme kaydı',
  },
  {
    id: 'goal_setter',
    name: 'Nişancı',
    description: 'İlk hedefini belirle',
    category: 'goal',
    phase: 'A',
    trigger: 'auto',
    threshold: 1,
    thresholdLabel: '1 hedef',
    quote: 'Hedefi olan yoldan çıkmaz.',
    statLabel: 'İlk Hedef',
    statSub: 'belirlenen hedef',
  },
  {
    id: 'three_in_a_row',
    name: "Üçlü",
    description: 'Bir haftada 3 ders gel',
    category: 'lesson',
    phase: 'A',
    trigger: 'auto',
    threshold: 3,
    thresholdLabel: '3 ders/hafta',
    quote: 'Bir haftada üç kez. Alışkanlık böyle başlar.',
    statLabel: 'Haftalık Ders',
    statSub: 'bu hafta tamamlanan',
  },

  // ═══════════════════════════════════
  // FAZ B — Yenileme Bölgesi (2-5 hafta)
  // ═══════════════════════════════════
  {
    id: 'ten_lessons',
    name: 'Çırak',
    description: '10 ders tamamla',
    category: 'lesson',
    phase: 'B',
    trigger: 'auto',
    threshold: 10,
    thresholdLabel: '10 ders',
    quote: '10 ders. Artık bu işi biliyorsun.',
    statLabel: 'Ders Başarısı',
    statSub: 'tamamlanan ders',
  },
  {
    id: 'four_week_streak',
    name: 'Demir İrade',
    description: '4 ardışık hafta antrenman',
    category: 'streak',
    phase: 'B',
    trigger: 'auto',
    threshold: 4,
    thresholdLabel: '4 hafta',
    quote: '4 hafta üst üste. Bahane üretmeyi unuttun.',
    statLabel: 'Hafta Serisi',
    statSub: 'ardışık hafta',
  },
  {
    id: 'goal_achiever',
    name: 'Hedef Avcısı',
    description: 'Bir hedefe ulaş',
    category: 'goal',
    phase: 'B',
    trigger: 'auto',
    threshold: 1,
    thresholdLabel: '1 hedef',
    quote: 'Hedefe ulaştın. Sıradaki?',
    statLabel: 'Hedef Başarısı',
    statSub: 'ulaşıldı',
  },
  {
    id: 'healthy_week',
    name: 'Sağlıklı',
    description: '%80+ haftalık beslenme uyumu',
    category: 'nutrition',
    phase: 'B',
    trigger: 'auto',
    threshold: 80,
    thresholdLabel: '%80 uyum',
    quote: '%80 uyum. Disiplin süper güçtür.',
    statLabel: 'Beslenme Uyumu',
    statSub: 'haftalık başarı',
  },
  {
    id: 'five_week_streak',
    name: 'Sadık Üye',
    description: '5 ardışık hafta antrenman',
    category: 'streak',
    phase: 'B',
    trigger: 'auto',
    threshold: 5,
    thresholdLabel: '5 hafta',
    quote: '5 hafta kesintisiz. Bu artık yaşam biçimin.',
    statLabel: 'Hafta Serisi',
    statSub: 'ardışık hafta',
  },

  // ═══════════════════════════════════
  // FAZ C — Sadakat (5+ hafta)
  // ═══════════════════════════════════
  {
    id: 'twentyfive_lessons',
    name: 'Kalfa',
    description: '25 ders tamamla',
    category: 'lesson',
    phase: 'C',
    trigger: 'auto',
    threshold: 25,
    thresholdLabel: '25 ders',
    quote: '25 ders. Vücudun sana teşekkür ediyor.',
    statLabel: 'Ders Başarısı',
    statSub: 'tamamlanan ders',
  },
  {
    id: 'fifty_lessons',
    name: 'Usta',
    description: '50 ders tamamla',
    category: 'lesson',
    phase: 'C',
    trigger: 'auto',
    threshold: 50,
    thresholdLabel: '50 ders',
    quote: '50 ders. Tamamen farklı bir sen.',
    statLabel: 'Ders Başarısı',
    statSub: 'tamamlanan ders',
  },
  {
    id: 'hundred_lessons',
    name: 'Efsane',
    description: '100 ders tamamla',
    category: 'lesson',
    phase: 'C',
    trigger: 'auto',
    threshold: 100,
    thresholdLabel: '100 ders',
    quote: '100 ders. Farklı bir insan oldun.',
    statLabel: 'Ders Başarısı',
    statSub: 'tamamlanan ders',
  },
  {
    id: 'eight_week_streak',
    name: 'Çelik Zincir',
    description: '8 ardışık hafta antrenman',
    category: 'streak',
    phase: 'C',
    trigger: 'auto',
    threshold: 8,
    thresholdLabel: '8 hafta',
    quote: '8 hafta. Her halka saf irade.',
    statLabel: 'Hafta Serisi',
    statSub: 'ardışık hafta',
  },
  {
    id: 'twelve_week_streak',
    name: 'Kırılmaz',
    description: '12 ardışık hafta antrenman',
    category: 'streak',
    phase: 'C',
    trigger: 'auto',
    threshold: 12,
    thresholdLabel: '12 hafta',
    quote: '12 hafta. Seni durduracak şey yok.',
    statLabel: 'Hafta Serisi',
    statSub: 'ardışık hafta',
  },
  {
    id: 'perfect_week',
    name: 'Mükemmel',
    description: '%90+ haftalık beslenme uyumu',
    category: 'nutrition',
    phase: 'C',
    trigger: 'auto',
    threshold: 90,
    thresholdLabel: '%90 uyum',
    quote: '%90 uyum. Mükemmellik bir alışkanlık.',
    statLabel: 'Beslenme Uyumu',
    statSub: 'haftalık başarı',
  },

  // ═══════════════════════════════════
  // ADMİN ÖZEL
  // ═══════════════════════════════════
  {
    id: 'athlete_of_month',
    name: 'Ayın Sporcusu',
    description: "Hamza'nın seçimi",
    category: 'special',
    phase: 'C',
    trigger: 'admin',
    threshold: 0,
    thresholdLabel: 'Özel',
    quote: 'Bu ay en çok sen hak ettin.',
    statLabel: 'Özel Ödül',
    statSub: 'antrenör seçimi',
  },
  {
    id: 'transformation',
    name: 'Dönüşüm',
    description: 'Belirgin fiziksel değişim',
    category: 'special',
    phase: 'C',
    trigger: 'admin',
    threshold: 0,
    thresholdLabel: 'Özel',
    quote: 'Aynaya bak. Bu sen misin?',
    statLabel: 'Özel Ödül',
    statSub: 'dönüşüm başarısı',
  },
]

export interface BadgeVisual {
  emoji: string
  cssClass: string
  gradient: string
  shadow: string
}

export const BADGE_VISUALS: Record<string, BadgeVisual> = {
  first_lesson:       { emoji: '\u{1F463}', cssClass: 'b-ilk',      gradient: 'linear-gradient(150deg, #86efac, #4ade80, #22c55e)', shadow: 'rgba(74,222,128' },
  three_in_a_row:     { emoji: '\u26A1\uFE0F', cssClass: 'b-uclu',     gradient: 'linear-gradient(150deg, #93c5fd, #60a5fa, #3b82f6)', shadow: 'rgba(96,165,250' },
  ten_lessons:        { emoji: '\u{1F528}', cssClass: 'b-cirak',    gradient: 'linear-gradient(150deg, #fcd34d, #f59e0b, #d97706)', shadow: 'rgba(217,119,6' },
  twentyfive_lessons: { emoji: '\u{1F4C8}', cssClass: 'b-kalfa',    gradient: 'linear-gradient(150deg, #fdba74, #f97316, #ea580c)', shadow: 'rgba(249,115,22' },
  fifty_lessons:      { emoji: '\u{1F451}', cssClass: 'b-usta',     gradient: 'linear-gradient(150deg, #fca5a5, #ef4444, #dc2626)', shadow: 'rgba(239,68,68' },
  hundred_lessons:    { emoji: '\u{1F525}', cssClass: 'b-efsane',   gradient: 'linear-gradient(150deg, #fbbf24, #f97316, #dc2626)', shadow: 'rgba(249,115,22' },
  four_week_streak:   { emoji: '\u270A',    cssClass: 'b-demir',    gradient: 'linear-gradient(150deg, #d4d4d8, #a1a1aa, #71717a)', shadow: 'rgba(113,113,122' },
  five_week_streak:   { emoji: '\u{1F6E1}\uFE0F', cssClass: 'b-sadik',    gradient: 'linear-gradient(150deg, #c4b5fd, #a78bfa, #7c3aed)', shadow: 'rgba(167,139,250' },
  eight_week_streak:  { emoji: '\u{1F517}', cssClass: 'b-celik',    gradient: 'linear-gradient(150deg, #7dd3fc, #38bdf8, #0284c7)', shadow: 'rgba(56,189,248' },
  twelve_week_streak: { emoji: '\u{1F48E}', cssClass: 'b-kirilmaz', gradient: 'linear-gradient(150deg, #e2e8f0, #94a3b8, #475569)', shadow: 'rgba(71,85,105' },
  goal_setter:        { emoji: '\u{1F3AF}', cssClass: 'b-nisanci',  gradient: 'linear-gradient(150deg, #6ee7b7, #34d399, #10b981)', shadow: 'rgba(52,211,153' },
  goal_achiever:      { emoji: '\u{1F3F9}', cssClass: 'b-hedef',    gradient: 'linear-gradient(150deg, #86efac, #22c55e, #16a34a)', shadow: 'rgba(34,197,94' },
  first_nutrition:    { emoji: '\u{1F957}', cssClass: 'b-ilkkayit', gradient: 'linear-gradient(150deg, #c4b5fd, #a78bfa, #8b5cf6)', shadow: 'rgba(139,92,246' },
  healthy_week:       { emoji: '\u{1F49A}', cssClass: 'b-saglikli', gradient: 'linear-gradient(150deg, #a7f3d0, #6ee7b7, #34d399)', shadow: 'rgba(110,231,183' },
  perfect_week:       { emoji: '\u2728',    cssClass: 'b-mukemmel', gradient: 'linear-gradient(150deg, #fde68a, #fbbf24, #f59e0b)', shadow: 'rgba(251,191,36' },
  athlete_of_month:   { emoji: '\u{1F3C6}', cssClass: 'b-ayin',     gradient: 'linear-gradient(150deg, #fcd34d, #f59e0b, #d97706)', shadow: 'rgba(245,158,11' },
  transformation:     { emoji: '\u{1F680}', cssClass: 'b-donusum',  gradient: 'linear-gradient(150deg, #f9a8d4, #e879f9, #c026d3)', shadow: 'rgba(232,121,249' },
}

export function getBadgeProgress(badge: BadgeDefinition, stats: BadgeStats): number {
  if (badge.trigger === 'admin') return 0

  switch (badge.id) {
    case 'first_lesson':
    case 'ten_lessons':
    case 'twentyfive_lessons':
    case 'fifty_lessons':
    case 'hundred_lessons':
      return Math.min(stats.totalLessons / badge.threshold, 1)
    case 'three_in_a_row':
      return Math.min(stats.weeklyLessons / badge.threshold, 1)
    case 'first_nutrition':
      return Math.min(stats.nutritionEntries / badge.threshold, 1)
    case 'four_week_streak':
    case 'five_week_streak':
    case 'eight_week_streak':
    case 'twelve_week_streak':
      return Math.min(stats.maxStreak / badge.threshold, 1)
    case 'goal_setter':
      return Math.min(stats.goalsSet / badge.threshold, 1)
    case 'goal_achiever':
      return Math.min(stats.goalsAchieved / badge.threshold, 1)
    case 'healthy_week':
    case 'perfect_week':
      return Math.min(stats.bestNutritionCompliance / badge.threshold, 1)
    default:
      return 0
  }
}

export function isBadgeEarned(badge: BadgeDefinition, stats: BadgeStats): boolean {
  return getBadgeProgress(badge, stats) >= 1
}

export function getCurrentValue(badge: BadgeDefinition, stats: BadgeStats): number {
  switch (badge.id) {
    case 'first_lesson':
    case 'ten_lessons':
    case 'twentyfive_lessons':
    case 'fifty_lessons':
    case 'hundred_lessons':
      return stats.totalLessons
    case 'three_in_a_row':
      return stats.weeklyLessons
    case 'first_nutrition':
      return stats.nutritionEntries
    case 'four_week_streak':
    case 'five_week_streak':
    case 'eight_week_streak':
    case 'twelve_week_streak':
      return stats.maxStreak
    case 'goal_setter':
      return stats.goalsSet
    case 'goal_achiever':
      return stats.goalsAchieved
    case 'healthy_week':
    case 'perfect_week':
      return stats.bestNutritionCompliance
    default:
      return 0
  }
}
