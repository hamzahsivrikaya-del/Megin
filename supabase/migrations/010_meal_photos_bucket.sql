-- Meal photos storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('meal_photos', 'meal_photos', true)
ON CONFLICT (id) DO NOTHING;

-- Upload policy: authenticated users can upload to their own folder
CREATE POLICY "meal_photo_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'meal_photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Update policy: users can upsert their own photos
CREATE POLICY "meal_photo_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'meal_photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Public read access
CREATE POLICY "meal_photo_public_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'meal_photos');
