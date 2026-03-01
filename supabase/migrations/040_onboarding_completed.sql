-- Onboarding tamamlanma durumu
ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN NOT NULL DEFAULT false;

-- Mevcut tuem uyeler icin onboarding tamamlanmis olarak isaretle
UPDATE users SET onboarding_completed = true;
