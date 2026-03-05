-- ══════════════════════════════════════════════════════════════
-- Yeni trainer kaydolduğunda otomatik free subscription oluştur
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO subscriptions (trainer_id, plan, status)
  VALUES (NEW.id, 'free', 'active');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_trainer_created
  AFTER INSERT ON trainers
  FOR EACH ROW
  EXECUTE FUNCTION create_default_subscription();
