-- Takvim desteği için lessons tablosuna start_time ve duration ekle
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS start_time TIME;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 60;
