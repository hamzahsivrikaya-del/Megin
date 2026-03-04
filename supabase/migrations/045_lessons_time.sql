-- Takvim sistemi: derslere saat bilgisi ekleme
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS start_time TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 60;
