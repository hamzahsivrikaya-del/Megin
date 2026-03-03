-- ══════════════════════════════════════════════════════════════
-- MEGIN — Row Level Security Policies
-- Multi-tenant izolasyon: Her PT sadece kendi verisini görür
-- ══════════════════════════════════════════════════════════════

-- ── RLS Aktif Et ──
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ── Helper Fonksiyonlar ──

-- Mevcut kullanıcının trainer_id'sini döner
CREATE OR REPLACE FUNCTION get_trainer_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM trainers WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Mevcut kullanıcının client olarak bağlı olduğu trainer_id'yi döner
CREATE OR REPLACE FUNCTION get_client_trainer_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT trainer_id FROM clients WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Mevcut kullanıcının client_id'sini döner
CREATE OR REPLACE FUNCTION get_client_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM clients WHERE user_id = auth.uid() LIMIT 1;
$$;

-- ── Trainers ──
CREATE POLICY "trainers_own" ON trainers
  FOR ALL USING (user_id = auth.uid());

-- Public profil (username ile erişim)
CREATE POLICY "trainers_public_read" ON trainers
  FOR SELECT USING (is_active = true);

-- ── Clients ──
-- PT kendi danışanlarını görür
CREATE POLICY "clients_trainer" ON clients
  FOR ALL USING (trainer_id = get_trainer_id());

-- Danışan kendini görür
CREATE POLICY "clients_self" ON clients
  FOR SELECT USING (user_id = auth.uid());

-- ── Packages ──
CREATE POLICY "packages_trainer" ON packages
  FOR ALL USING (trainer_id = get_trainer_id());

CREATE POLICY "packages_client" ON packages
  FOR SELECT USING (client_id = get_client_id());

-- ── Lessons ──
CREATE POLICY "lessons_trainer" ON lessons
  FOR ALL USING (trainer_id = get_trainer_id());

CREATE POLICY "lessons_client" ON lessons
  FOR SELECT USING (client_id = get_client_id());

-- ── Measurements ──
CREATE POLICY "measurements_trainer" ON measurements
  FOR ALL USING (trainer_id = get_trainer_id());

CREATE POLICY "measurements_client" ON measurements
  FOR SELECT USING (client_id = get_client_id());

-- ── Workouts ──
CREATE POLICY "workouts_trainer" ON workouts
  FOR ALL USING (trainer_id = get_trainer_id());

CREATE POLICY "workouts_client" ON workouts
  FOR SELECT USING (client_id = get_client_id());

-- ── Workout Exercises ──
CREATE POLICY "exercises_via_workout" ON workout_exercises
  FOR ALL USING (
    workout_id IN (SELECT id FROM workouts WHERE trainer_id = get_trainer_id())
  );

CREATE POLICY "exercises_client" ON workout_exercises
  FOR SELECT USING (
    workout_id IN (SELECT id FROM workouts WHERE client_id = get_client_id())
  );

-- ── Client Meals ──
CREATE POLICY "client_meals_trainer" ON client_meals
  FOR ALL USING (trainer_id = get_trainer_id());

CREATE POLICY "client_meals_client" ON client_meals
  FOR SELECT USING (client_id = get_client_id());

-- ── Meal Logs ──
CREATE POLICY "meal_logs_trainer" ON meal_logs
  FOR ALL USING (trainer_id = get_trainer_id());

CREATE POLICY "meal_logs_client" ON meal_logs
  FOR ALL USING (client_id = get_client_id());

-- ── Blog Posts ──
CREATE POLICY "blog_trainer" ON blog_posts
  FOR ALL USING (trainer_id = get_trainer_id());

-- Public yayınlanmış bloglar
CREATE POLICY "blog_public" ON blog_posts
  FOR SELECT USING (status = 'published');

-- ── Notifications ──
CREATE POLICY "notifications_own" ON notifications
  FOR ALL USING (user_id = auth.uid());

-- ── Push Subscriptions ──
CREATE POLICY "push_own" ON push_subscriptions
  FOR ALL USING (user_id = auth.uid());

-- ── Weekly Reports ──
CREATE POLICY "reports_trainer" ON weekly_reports
  FOR ALL USING (trainer_id = get_trainer_id());

CREATE POLICY "reports_client" ON weekly_reports
  FOR SELECT USING (client_id = get_client_id());

-- ── Client Goals ──
CREATE POLICY "goals_trainer" ON client_goals
  FOR ALL USING (trainer_id = get_trainer_id());

CREATE POLICY "goals_client" ON client_goals
  FOR ALL USING (client_id = get_client_id());

-- ── Client Badges ──
CREATE POLICY "badges_trainer" ON client_badges
  FOR ALL USING (trainer_id = get_trainer_id());

CREATE POLICY "badges_client" ON client_badges
  FOR SELECT USING (client_id = get_client_id());

-- ── Progress Photos ──
CREATE POLICY "photos_trainer" ON progress_photos
  FOR ALL USING (trainer_id = get_trainer_id());

CREATE POLICY "photos_client" ON progress_photos
  FOR SELECT USING (client_id = get_client_id());

-- ── Subscriptions ──
CREATE POLICY "subscriptions_trainer" ON subscriptions
  FOR ALL USING (trainer_id = get_trainer_id());

-- ── Audit Logs ──
CREATE POLICY "audit_trainer" ON audit_logs
  FOR SELECT USING (trainer_id = get_trainer_id());

-- ── Storage Buckets ──
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('meal-photos', 'meal-photos', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('progress-photos', 'progress-photos', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true);

-- Storage RLS
CREATE POLICY "avatar_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

CREATE POLICY "avatar_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatar_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);
