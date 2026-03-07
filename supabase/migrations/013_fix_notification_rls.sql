-- Mevcut RLS policy'yi güncelle: user_id VEYA client_id ile erişim
DROP POLICY IF EXISTS "notifications_own" ON notifications;

-- Kullanıcı kendi bildirimlerini görebilir (user_id veya client_id üzerinden)
CREATE POLICY "notifications_own" ON notifications
  FOR ALL USING (
    user_id = auth.uid()
    OR client_id = get_client_id()
  );

-- Trainer kendi gönderdiği bildirimleri görebilir
CREATE POLICY "notifications_trainer" ON notifications
  FOR ALL USING (trainer_id = get_trainer_id());
