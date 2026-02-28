-- Paket fiyat ve odeme durumu
ALTER TABLE packages ADD COLUMN price NUMERIC(10,2) DEFAULT NULL;
ALTER TABLE packages ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'unpaid'));
