-- Blog sistemi (Elite ozellik)
-- Migration 001'de blog_posts zaten var (slug, status enum ile).
-- Kod published (boolean) kullaniyor, bu migration tabloyu uyumlu hale getiriyor.

-- slug'i nullable yap (kod slug gondermiyor)
ALTER TABLE blog_posts ALTER COLUMN slug DROP NOT NULL;

-- slug unique constraint'i kaldir
ALTER TABLE blog_posts DROP CONSTRAINT IF EXISTS unique_blog_slug;

-- Yeni kolonlar ekle
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT false;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- published kolonu status'tan turet (mevcut veriler icin)
UPDATE blog_posts SET published = (status = 'published') WHERE published IS NULL;

-- Index'ler
DROP INDEX IF EXISTS idx_blog_posts_trainer;
CREATE INDEX idx_blog_posts_trainer ON blog_posts(trainer_id);

DROP INDEX IF EXISTS idx_blog_posts_published;
CREATE INDEX idx_blog_posts_published ON blog_posts(published, created_at DESC);

-- RLS: client okuma politikasi
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'blog_posts' AND policyname = 'Clients read own trainer blog posts'
  ) THEN
    CREATE POLICY "Clients read own trainer blog posts"
      ON blog_posts FOR SELECT
      USING (
        published = true
        AND trainer_id IN (SELECT trainer_id FROM clients WHERE user_id = auth.uid())
      );
  END IF;
END $$;
