-- Bağlı üye sistemi: parent_id zaten mevcut, index ve RLS ekle

-- parent_id index
CREATE INDEX IF NOT EXISTS idx_clients_parent_id ON clients(parent_id);

-- Parent kendi bağlı üyelerini görebilir
CREATE POLICY "parents_view_dependents" ON clients
  FOR SELECT USING (
    parent_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
  );

-- Bağlı üye ekleme fonksiyonu (auth user gerektirmez, synthetic email ile)
CREATE OR REPLACE FUNCTION add_dependent_member(
  p_parent_id UUID,
  p_trainer_id UUID,
  p_full_name TEXT
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_id UUID;
  v_synthetic_email TEXT;
BEGIN
  v_synthetic_email := 'dep_' || gen_random_uuid() || '@megin.app';
  INSERT INTO clients (trainer_id, parent_id, full_name, email, onboarding_completed, invite_accepted, is_active)
  VALUES (p_trainer_id, p_parent_id, p_full_name, v_synthetic_email, true, true, true)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
