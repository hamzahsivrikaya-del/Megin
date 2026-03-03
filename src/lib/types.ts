// ── Kullanıcı Rolleri ──
export type UserRole = 'trainer' | 'client'

export type Gender = 'male' | 'female'

export type ExpertiseArea = 'pt' | 'pilates' | 'yoga' | 'dietitian' | 'other'

export type ReferralSource = 'instagram' | 'friend' | 'google' | 'other'

// ── Trainer (PT) ──
export interface Trainer {
  id: string
  user_id: string
  full_name: string
  username: string
  avatar_url: string | null
  phone: string | null
  expertise: ExpertiseArea
  experience_years: number | null
  client_count_range: string | null
  referral_source: ReferralSource | null
  bio: string | null
  onboarding_completed: boolean
  is_active: boolean
  created_at: string
}

// ── Client (Danışan) ──
export interface Client {
  id: string
  user_id: string
  trainer_id: string
  full_name: string
  email: string
  phone: string | null
  gender: Gender | null
  avatar_url: string | null
  parent_id: string | null
  nutrition_note: string | null
  is_active: boolean
  start_date: string
  invite_token: string | null
  invite_accepted: boolean
  onboarding_completed: boolean
  created_at: string
}

// ── Paketler ──
export type PackageStatus = 'active' | 'completed' | 'expired'
export type PaymentStatus = 'paid' | 'unpaid'

export interface Package {
  id: string
  trainer_id: string
  client_id: string
  total_lessons: number
  used_lessons: number
  start_date: string
  expire_date: string
  status: PackageStatus
  price: number | null
  payment_status: PaymentStatus
  created_at: string
  // joined
  client?: Client
  lessons?: Lesson[]
}

// ── Dersler ──
export interface Lesson {
  id: string
  trainer_id: string
  package_id: string
  client_id: string
  date: string
  notes: string | null
  created_at: string
  // joined
  client?: Client
  package?: Package
}

// ── Ölçümler ──
export interface Measurement {
  id: string
  trainer_id: string
  client_id: string
  date: string
  weight: number | null
  height: number | null
  chest: number | null
  waist: number | null
  arm: number | null
  leg: number | null
  sf_chest: number | null
  sf_abdomen: number | null
  sf_thigh: number | null
  body_fat_pct: number | null
  created_at: string
}

// ── Antrenmanlar ──
export type WorkoutType = 'template' | 'client'
export type WorkoutSection = 'warmup' | 'strength' | 'accessory' | 'cardio'

export const WORKOUT_SECTIONS = [
  { key: 'warmup' as const, label: 'Isınma', type: 'freetext' as const },
  { key: 'strength' as const, label: 'Güç-Kuvvet', type: 'exercises' as const },
  { key: 'accessory' as const, label: 'Aksesuar', type: 'exercises' as const },
  { key: 'cardio' as const, label: 'Kardiyo-Metcon', type: 'freetext' as const },
] as const

export interface WorkoutExercise {
  id: string
  workout_id: string
  order_num: number
  name: string
  sets: number | null
  reps: string | null
  weight: string | null
  rest: string | null
  notes: string | null
  superset_group: number | null
  section: WorkoutSection
}

export interface Workout {
  id: string
  trainer_id: string
  type: WorkoutType
  client_id: string | null
  week_start: string
  day_index: number
  title: string
  content: string | null
  warmup_text: string | null
  cardio_text: string | null
  created_at: string
  exercises?: WorkoutExercise[]
  client?: Client
}

// ── Beslenme ──
export type MealStatus = 'compliant' | 'non_compliant'

export interface ClientMeal {
  id: string
  trainer_id: string
  client_id: string
  name: string
  order_num: number
  created_at: string
}

export interface MealLog {
  id: string
  trainer_id: string
  client_id: string
  date: string
  meal_id: string | null
  status: MealStatus
  photo_url: string | null
  note: string | null
  is_extra: boolean
  extra_name: string | null
  created_at: string
  client_meal?: ClientMeal
}

// ── Blog ──
export type BlogPostStatus = 'draft' | 'published'

export interface BlogPost {
  id: string
  trainer_id: string
  title: string
  slug: string
  content: string
  cover_image: string | null
  status: BlogPostStatus
  published_at: string | null
  created_at: string
}

// ── Bildirimler ──
export type NotificationType =
  | 'low_lessons'
  | 'weekly_report'
  | 'inactive'
  | 'manual'
  | 'nutrition_reminder'
  | 'badge_earned'
  | 'client_action'

export interface Notification {
  id: string
  user_id: string
  trainer_id: string
  type: NotificationType
  title: string
  message: string
  is_read: boolean
  data: Record<string, unknown> | null
  sent_at: string
}

// ── Push Subscriptions ──
export interface PushSubscription {
  id: string
  user_id: string
  endpoint: string
  p256dh: string
  auth: string
  created_at: string
}

// ── Haftalık Raporlar ──
export interface WeeklyReport {
  id: string
  trainer_id: string
  client_id: string
  week_start: string
  lessons_count: number
  nutrition_compliance: number | null
  consecutive_weeks: number
  summary: string | null
  created_at: string
}

// ── Kişisel Hedefler ──
export type GoalMetricType = 'weight' | 'body_fat_pct' | 'chest' | 'waist' | 'arm' | 'leg'

export interface ClientGoal {
  id: string
  trainer_id: string
  client_id: string
  metric_type: GoalMetricType
  target_value: number
  created_at: string
  achieved_at: string | null
}

// ── Rozetler ──
export interface ClientBadge {
  id: string
  trainer_id: string
  client_id: string
  badge_id: string
  earned_at: string
  notified: boolean
}

// ── İlerleme Fotoğrafları ──
export type PhotoAngle = 'front' | 'side' | 'back'

export interface ProgressPhoto {
  id: string
  trainer_id: string
  client_id: string
  photo_url: string
  angle: PhotoAngle
  taken_at: string
  comment: string | null
  created_at: string
}

// ── Abonelik (SaaS) ──
export type SubscriptionPlan = 'free' | 'pro' | 'studio'
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due'

export interface Subscription {
  id: string
  trainer_id: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  current_period_start: string
  current_period_end: string
  created_at: string
}

// ── Audit Log ──
export interface AuditLog {
  id: string
  trainer_id: string
  user_id: string
  action: string
  entity_type: string
  entity_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}
