-- Trainer bildirim tercihleri
CREATE TABLE trainer_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE UNIQUE,
  client_habits_completed BOOLEAN NOT NULL DEFAULT true,
  client_streak_milestone BOOLEAN NOT NULL DEFAULT true,
  client_inactive BOOLEAN NOT NULL DEFAULT true,
  daily_summary BOOLEAN NOT NULL DEFAULT true,
  trainer_nutrition_summary BOOLEAN NOT NULL DEFAULT true,
  low_lessons BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE trainer_notification_preferences ENABLE ROW LEVEL SECURITY;

-- last_seen_at kolonu
ALTER TABLE clients ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

-- Yeni bildirim tipleri
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'client_habits_completed';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'client_streak_milestone';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'client_inactive';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'daily_summary';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'habit_reminder';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'streak_at_risk';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'streak_celebration';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'program_assigned';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'client_action';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'trainer_nutrition_summary';

-- CHECK constraint kaldirildi, enum tipi kendisi dogrulama yapiyor
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
