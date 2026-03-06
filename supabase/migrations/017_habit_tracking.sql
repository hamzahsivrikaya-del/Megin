-- Alışkanlık tanımları (seed data - sistem geneli)
CREATE TABLE public.habit_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('beslenme', 'icecek', 'egzersiz', 'uyku', 'oz_bakim')),
  icon TEXT NOT NULL DEFAULT '',
  is_avoidance BOOLEAN NOT NULL DEFAULT false,
  order_num INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Danışanın aktif alışkanlıkları
CREATE TABLE public.client_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  habit_id UUID REFERENCES public.habit_definitions(id) ON DELETE SET NULL,
  custom_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  assigned_by UUID REFERENCES public.trainers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Günlük kayıtlar
CREATE TABLE public.habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  client_habit_id UUID NOT NULL REFERENCES public.client_habits(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_habit_id, date)
);

-- RLS
ALTER TABLE public.habit_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

-- habit_definitions: herkes okuyabilir
CREATE POLICY "habit_definitions_select" ON public.habit_definitions
  FOR SELECT USING (true);

-- client_habits: service role ile erişim (admin client pattern)
CREATE POLICY "client_habits_select" ON public.client_habits
  FOR SELECT USING (true);

CREATE POLICY "client_habits_insert" ON public.client_habits
  FOR INSERT WITH CHECK (true);

CREATE POLICY "client_habits_update" ON public.client_habits
  FOR UPDATE USING (true);

CREATE POLICY "client_habits_delete" ON public.client_habits
  FOR DELETE USING (true);

-- habit_logs: service role ile erişim
CREATE POLICY "habit_logs_select" ON public.habit_logs
  FOR SELECT USING (true);

CREATE POLICY "habit_logs_insert" ON public.habit_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "habit_logs_update" ON public.habit_logs
  FOR UPDATE USING (true);

-- Indexler
CREATE INDEX idx_client_habits_client ON public.client_habits(client_id) WHERE is_active = true;
CREATE INDEX idx_habit_logs_client_date ON public.habit_logs(client_id, date);
CREATE INDEX idx_habit_logs_habit_date ON public.habit_logs(client_habit_id, date);

-- Seed data: Alışkanlık tanımları (Türkçe karakterlerle)
INSERT INTO public.habit_definitions (name, category, icon, is_avoidance, order_num) VALUES
-- Beslenme
('Sağlıklı yemekler', 'beslenme', '🥗', false, 1),
('Ağır yemekler', 'beslenme', '🍔', true, 2),
('Geç saatte yemek', 'beslenme', '🌙', true, 3),
('Aralıklı oruç', 'beslenme', '⏰', false, 4),
('Sebze/salata ye', 'beslenme', '🥦', false, 5),
('Protein hedefini tuttur', 'beslenme', '🥩', false, 6),
('Fast food yeme', 'beslenme', '🚫', true, 7),
('Şeker/tatlı yeme', 'beslenme', '🍬', true, 8),
-- İçecek
('Günlük su hedefi (3L)', 'icecek', '💧', false, 1),
('Sabah kafeini', 'icecek', '☕', false, 2),
('Geç saatte kafein', 'icecek', '🚫', true, 3),
('Alkol', 'icecek', '🍷', true, 4),
('Şekerli içecek içme', 'icecek', '🥤', true, 5),
-- Egzersiz
('Hafif egzersiz', 'egzersiz', '🚶', false, 1),
('Orta yoğunluklu egzersiz', 'egzersiz', '🏃', false, 2),
('Yoğun egzersiz', 'egzersiz', '💪', false, 3),
('Adım (10.000)', 'egzersiz', '👟', false, 4),
('Esneme/stretching', 'egzersiz', '🧘', false, 5),
-- Uyku
('7+ saat uyku', 'uyku', '😴', false, 1),
('Gece 12''den önce yat', 'uyku', '🛏️', false, 2),
('Uyku öncesi ekran kapatma', 'uyku', '📵', false, 3),
-- Öz Bakım
('Soğuk duş/banyo', 'oz_bakim', '🚿', false, 1),
('Günlük tutma', 'oz_bakim', '📓', false, 2),
('Meditasyon/nefes', 'oz_bakim', '🧘', false, 3),
('Vitamin/takviye al', 'oz_bakim', '💊', false, 4),
('Güneş ışığı (sabah 15dk)', 'oz_bakim', '☀️', false, 5),
('Masaj/foam roller', 'oz_bakim', '🧴', false, 6);
