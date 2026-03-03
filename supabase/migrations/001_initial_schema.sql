-- ══════════════════════════════════════════════════════════════
-- MEGIN — Multi-tenant Personal Trainer SaaS
-- Initial Schema — 001
-- ══════════════════════════════════════════════════════════════

-- ── Enums ──
CREATE TYPE user_role AS ENUM ('trainer', 'client');
CREATE TYPE expertise_area AS ENUM ('pt', 'pilates', 'yoga', 'dietitian', 'other');
CREATE TYPE referral_source AS ENUM ('instagram', 'friend', 'google', 'other');
CREATE TYPE package_status AS ENUM ('active', 'completed', 'expired');
CREATE TYPE payment_status AS ENUM ('paid', 'unpaid');
CREATE TYPE workout_type AS ENUM ('template', 'client');
CREATE TYPE workout_section AS ENUM ('warmup', 'strength', 'accessory', 'cardio');
CREATE TYPE meal_status AS ENUM ('compliant', 'non_compliant');
CREATE TYPE blog_post_status AS ENUM ('draft', 'published');
CREATE TYPE notification_type AS ENUM (
  'low_lessons', 'weekly_report', 'inactive', 'manual',
  'nutrition_reminder', 'badge_earned', 'client_action'
);
CREATE TYPE photo_angle AS ENUM ('front', 'side', 'back');
CREATE TYPE subscription_plan AS ENUM ('free', 'pro', 'studio');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'past_due');
CREATE TYPE goal_metric_type AS ENUM ('weight', 'body_fat_pct', 'chest', 'waist', 'arm', 'leg');
CREATE TYPE gender_type AS ENUM ('male', 'female');

-- ── Trainers (PT Profilleri) ──
CREATE TABLE trainers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  phone TEXT,
  expertise expertise_area NOT NULL DEFAULT 'pt',
  experience_years INTEGER,
  client_count_range TEXT,
  referral_source referral_source,
  bio TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT username_format CHECK (username ~ '^[a-z0-9_-]{3,30}$')
);

CREATE UNIQUE INDEX idx_trainers_user_id ON trainers(user_id);
CREATE UNIQUE INDEX idx_trainers_username ON trainers(username);

-- ── Clients (Danışanlar) ──
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  gender gender_type,
  avatar_url TEXT,
  parent_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  nutrition_note TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  invite_token TEXT UNIQUE,
  invite_accepted BOOLEAN NOT NULL DEFAULT false,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_clients_trainer_id ON clients(trainer_id);
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_invite_token ON clients(invite_token);

-- ── Packages (Ders Paketleri) ──
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  total_lessons INTEGER NOT NULL,
  used_lessons INTEGER NOT NULL DEFAULT 0,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expire_date DATE NOT NULL,
  status package_status NOT NULL DEFAULT 'active',
  price NUMERIC,
  payment_status payment_status NOT NULL DEFAULT 'unpaid',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_packages_trainer_id ON packages(trainer_id);
CREATE INDEX idx_packages_client_id ON packages(client_id);
CREATE INDEX idx_packages_status ON packages(status);

-- ── Lessons (Dersler) ──
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lessons_trainer_id ON lessons(trainer_id);
CREATE INDEX idx_lessons_client_id ON lessons(client_id);
CREATE INDEX idx_lessons_date ON lessons(date);

-- ── Measurements (Vücut Ölçümleri) ──
CREATE TABLE measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight NUMERIC,
  height NUMERIC,
  chest NUMERIC,
  waist NUMERIC,
  arm NUMERIC,
  leg NUMERIC,
  sf_chest NUMERIC,
  sf_abdomen NUMERIC,
  sf_thigh NUMERIC,
  body_fat_pct NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_measurements_trainer_id ON measurements(trainer_id);
CREATE INDEX idx_measurements_client_id ON measurements(client_id);

-- ── Workouts (Antrenman Programları) ──
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  type workout_type NOT NULL DEFAULT 'client',
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  day_index INTEGER NOT NULL CHECK (day_index BETWEEN 0 AND 6),
  title TEXT NOT NULL,
  content TEXT,
  warmup_text TEXT,
  cardio_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_workouts_trainer_id ON workouts(trainer_id);
CREATE INDEX idx_workouts_client_id ON workouts(client_id);

-- ── Workout Exercises ──
CREATE TABLE workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  order_num INTEGER NOT NULL DEFAULT 0,
  name TEXT NOT NULL,
  sets INTEGER,
  reps TEXT,
  weight TEXT,
  rest TEXT,
  notes TEXT,
  superset_group INTEGER,
  section workout_section NOT NULL DEFAULT 'strength'
);

CREATE INDEX idx_workout_exercises_workout_id ON workout_exercises(workout_id);

-- ── Client Meals (Öğün Şablonları) ──
CREATE TABLE client_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_num INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_client_meals_client_id ON client_meals(client_id);

-- ── Meal Logs (Beslenme Kayıtları) ──
CREATE TABLE meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_id UUID REFERENCES client_meals(id) ON DELETE SET NULL,
  status meal_status NOT NULL DEFAULT 'compliant',
  photo_url TEXT,
  note TEXT,
  is_extra BOOLEAN NOT NULL DEFAULT false,
  extra_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT unique_meal_log UNIQUE (client_id, date, meal_id)
);

CREATE INDEX idx_meal_logs_client_id ON meal_logs(client_id);
CREATE INDEX idx_meal_logs_date ON meal_logs(date);

-- ── Blog Posts ──
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  cover_image TEXT,
  status blog_post_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT unique_blog_slug UNIQUE (trainer_id, slug)
);

CREATE INDEX idx_blog_posts_trainer_id ON blog_posts(trainer_id);

-- ── Notifications ──
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  data JSONB,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_trainer_id ON notifications(trainer_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read) WHERE NOT is_read;

-- ── Push Subscriptions ──
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_push_subs_user_id ON push_subscriptions(user_id);

-- ── Weekly Reports ──
CREATE TABLE weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  lessons_count INTEGER NOT NULL DEFAULT 0,
  nutrition_compliance NUMERIC,
  consecutive_weeks INTEGER NOT NULL DEFAULT 0,
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT unique_weekly_report UNIQUE (client_id, week_start)
);

CREATE INDEX idx_weekly_reports_client_id ON weekly_reports(client_id);

-- ── Client Goals ──
CREATE TABLE client_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  metric_type goal_metric_type NOT NULL,
  target_value NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  achieved_at TIMESTAMPTZ,

  CONSTRAINT unique_client_goal UNIQUE (client_id, metric_type)
);

-- ── Client Badges ──
CREATE TABLE client_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notified BOOLEAN NOT NULL DEFAULT false,

  CONSTRAINT unique_client_badge UNIQUE (client_id, badge_id)
);

CREATE INDEX idx_client_badges_client_id ON client_badges(client_id);

-- ── Progress Photos ──
CREATE TABLE progress_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  angle photo_angle NOT NULL,
  taken_at DATE NOT NULL DEFAULT CURRENT_DATE,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_progress_photos_client_id ON progress_photos(client_id);

-- ── Subscriptions (SaaS Abonelik) ──
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  plan subscription_plan NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '100 years'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_subscriptions_trainer_id ON subscriptions(trainer_id);

-- ── Audit Log ──
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES trainers(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_trainer_id ON audit_logs(trainer_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
