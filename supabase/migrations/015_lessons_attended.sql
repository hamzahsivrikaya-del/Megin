-- Derslere "yapıldı" durumu ekle
-- Takvimden planlanan dersler attended=false, yapıldı işaretlenenler attended=true
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS attended BOOLEAN NOT NULL DEFAULT true;

-- Mevcut tüm dersler geçmişte eklendiği için attended=true olarak kalır
-- Gelecek tarihli dersler varsa attended=false yapılmalı
UPDATE lessons SET attended = false WHERE date > CURRENT_DATE;

-- Index: sadece yapılmış dersleri hızlı sorgulamak için
CREATE INDEX IF NOT EXISTS idx_lessons_attended ON lessons(attended) WHERE attended = true;
