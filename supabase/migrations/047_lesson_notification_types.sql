-- Takvim bildirim tipleri: lesson_scheduled, lesson_updated, lesson_cancelled
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'low_lessons', 'weekly_report', 'inactive', 'manual',
    'nutrition_reminder', 'badge_earned',
    'admin_nutrition_summary', 'admin_measurement', 'admin_low_lessons',
    'lesson_scheduled', 'lesson_updated', 'lesson_cancelled'
  ));
