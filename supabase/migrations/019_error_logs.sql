-- Error logging tablosu
CREATE TABLE error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL DEFAULT 'error' CHECK (level IN ('error', 'warn', 'fatal')),
  message TEXT NOT NULL,
  stack TEXT,
  path TEXT,
  user_id UUID,
  metadata JSONB,
  source TEXT NOT NULL DEFAULT 'server' CHECK (source IN ('server', 'client')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 30 gunluk retention icin index
CREATE INDEX idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX idx_error_logs_level ON error_logs(level);

-- RLS: sadece service role erisebilir
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
