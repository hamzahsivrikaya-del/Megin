-- Progress photos tablosu
CREATE TABLE public.progress_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  angle TEXT NOT NULL CHECK (angle IN ('front', 'side', 'back')),
  taken_at DATE NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;

-- Uye kendi fotograflarini gorebilir
CREATE POLICY "progress_photos_member_select" ON public.progress_photos
  FOR SELECT USING (auth.uid() = user_id);

-- Admin herkesin fotograflarini gorebilir
CREATE POLICY "progress_photos_admin_select" ON public.progress_photos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin insert
CREATE POLICY "progress_photos_admin_insert" ON public.progress_photos
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin delete
CREATE POLICY "progress_photos_admin_delete" ON public.progress_photos
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX idx_progress_photos_user ON public.progress_photos(user_id);
CREATE INDEX idx_progress_photos_taken_at ON public.progress_photos(taken_at);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('progress-photos', 'progress-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Admin upload
CREATE POLICY "progress_photos_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'progress-photos'
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin update
CREATE POLICY "progress_photos_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'progress-photos'
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin delete
CREATE POLICY "progress_photos_storage_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'progress-photos'
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Public read
CREATE POLICY "progress_photos_public_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'progress-photos');
