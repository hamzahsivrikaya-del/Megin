export type UserRole = 'admin' | 'member'

export type Gender = 'male' | 'female'

export interface User {
  id: string
  email: string
  full_name: string
  phone: string | null
  role: UserRole
  gender: Gender | null
  start_date: string
  is_active: boolean
  created_at: string
  parent_id: string | null
  nutrition_note: string | null
}

export type PackageStatus = 'active' | 'completed' | 'expired'
export type PaymentStatus = 'paid' | 'unpaid'

export interface Package {
  id: string
  user_id: string
  total_lessons: number
  used_lessons: number
  start_date: string
  expire_date: string
  status: PackageStatus
  price: number | null
  payment_status: PaymentStatus
  created_at: string
  // joined
  user?: User
  lessons?: Lesson[]
}

export interface Lesson {
  id: string
  package_id: string
  user_id: string
  date: string
  start_time: string | null
  duration: number
  notes: string | null
  created_at: string
  // joined
  user?: User
  package?: Package
}

export interface Measurement {
  id: string
  user_id: string
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
  // joined
  user?: User
}

export type BlogPostStatus = 'draft' | 'published'

export interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  cover_image: string | null
  status: BlogPostStatus
  published_at: string | null
  created_at: string
}

export type WorkoutType = 'public' | 'member'

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
  type: WorkoutType
  user_id: string | null
  week_start: string
  day_index: number
  title: string
  content: string | null
  warmup_text: string | null
  cardio_text: string | null
  created_at: string
  exercises?: WorkoutExercise[]
  user?: User
}

// Beslenme takibi
export type MealStatus = 'compliant' | 'non_compliant'

export interface MemberMeal {
  id: string
  user_id: string
  name: string
  order_num: number
  created_at: string
}

export interface MealLog {
  id: string
  user_id: string
  date: string
  meal_id: string | null
  status: MealStatus
  photo_url: string | null
  note: string | null
  is_extra: boolean
  extra_name: string | null
  created_at: string
  // joined
  member_meal?: MemberMeal
}

// Rozetler
export interface MemberBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
  notified: boolean
}

export type NotificationType = 'low_lessons' | 'weekly_report' | 'inactive' | 'manual' | 'nutrition_reminder' | 'badge_earned' | 'admin_nutrition_summary' | 'admin_measurement' | 'admin_low_lessons' | 'lesson_scheduled' | 'lesson_updated' | 'lesson_cancelled'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  is_read: boolean
  sent_at: string
}

// Kisisel hedefler
export type GoalMetricType = 'weight' | 'body_fat_pct' | 'chest' | 'waist' | 'arm' | 'leg'

export interface MemberGoal {
  id: string
  user_id: string
  metric_type: GoalMetricType
  target_value: number
  created_at: string
  achieved_at: string | null
}

export interface ProgressPhoto {
  id: string
  user_id: string
  photo_url: string
  angle: 'front' | 'side' | 'back'
  taken_at: string
  comment: string | null
  created_at: string
}
