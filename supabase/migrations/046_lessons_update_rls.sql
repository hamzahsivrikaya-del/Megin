-- Takvim: admin ders güncelleme RLS policy'si
CREATE POLICY "lessons_update_admin" ON public.lessons
  FOR UPDATE USING (is_admin());
