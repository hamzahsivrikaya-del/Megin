-- Blog sistemi (Elite özellik)
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_blog_posts_trainer ON blog_posts(trainer_id);
CREATE INDEX idx_blog_posts_published ON blog_posts(published, created_at DESC);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers manage own blog posts"
  ON blog_posts FOR ALL
  USING (trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid()));

CREATE POLICY "Clients read own trainer blog posts"
  ON blog_posts FOR SELECT
  USING (
    published = true
    AND trainer_id IN (SELECT trainer_id FROM clients WHERE user_id = auth.uid())
  );
