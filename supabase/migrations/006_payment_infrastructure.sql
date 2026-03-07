-- ══════════════════════════════════════════════════════════════
-- Payment Infrastructure — 006
-- PayTR iFrame API ödeme altyapısı için tablo ve güncellemeler
-- ══════════════════════════════════════════════════════════════

-- Enum güncelle: 'studio' → 'elite'
ALTER TYPE subscription_plan RENAME VALUE 'studio' TO 'elite';

-- Ödeme siparişleri tablosu
CREATE TABLE payment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  merchant_oid TEXT NOT NULL UNIQUE,
  plan subscription_plan NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TL',
  status TEXT NOT NULL DEFAULT 'pending',
  paytr_token TEXT,
  payment_type TEXT,
  failed_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_payment_orders_trainer_id ON payment_orders(trainer_id);
CREATE INDEX idx_payment_orders_merchant_oid ON payment_orders(merchant_oid);
CREATE INDEX idx_payment_orders_status ON payment_orders(status);

-- Subscriptions tablosuna PayTR referansları ekle
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS payment_order_id UUID REFERENCES payment_orders(id),
  ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN NOT NULL DEFAULT false;

-- RLS
ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can view own payment orders"
  ON payment_orders FOR SELECT
  USING (trainer_id IN (
    SELECT id FROM trainers WHERE user_id = auth.uid()
  ));
