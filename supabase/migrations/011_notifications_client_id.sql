-- notifications tablosuna client_id kolonu ekle
ALTER TABLE notifications ADD COLUMN client_id UUID REFERENCES clients(id) ON DELETE CASCADE;

-- user_id nullable yap (client yoksa direkt user'a gönderilir)
ALTER TABLE notifications ALTER COLUMN user_id DROP NOT NULL;

CREATE INDEX idx_notifications_client_id ON notifications(client_id);
