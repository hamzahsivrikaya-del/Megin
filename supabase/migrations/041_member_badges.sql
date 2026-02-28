-- Uye rozet sistemi
CREATE TABLE member_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notified BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(user_id, badge_id)
);

-- RLS
ALTER TABLE member_badges ENABLE ROW LEVEL SECURITY;

-- Uye kendi rozetlerini gorebilir
CREATE POLICY "member_badges_select" ON member_badges
  FOR SELECT USING (auth.uid() = user_id);

-- Service role insert (cron/api)
CREATE POLICY "member_badges_insert" ON member_badges
  FOR INSERT WITH CHECK (true);

-- Index
CREATE INDEX idx_member_badges_user ON member_badges(user_id);
