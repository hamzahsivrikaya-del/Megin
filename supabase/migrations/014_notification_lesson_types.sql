-- Ders bildirim tipleri ve eğitmen beslenme özeti tipi ekle
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'lesson_scheduled';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'lesson_updated';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'lesson_cancelled';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'trainer_nutrition_summary';
