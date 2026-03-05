-- Tour progress tracking
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS tour_progress JSONB DEFAULT NULL;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tour_progress JSONB DEFAULT NULL;

COMMENT ON COLUMN trainers.tour_progress IS 'Platform tour tracking: {completed: string[], skipped: string[], dismissed: boolean}';
COMMENT ON COLUMN clients.tour_progress IS 'Platform tour tracking: {completed: string[], skipped: string[], dismissed: boolean}';
