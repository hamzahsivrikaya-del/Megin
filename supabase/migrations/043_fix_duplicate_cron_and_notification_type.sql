-- 1) Duplike pg_cron job'larini temizle (onceki migration 036 sessizce basarisiz olmus olabilir)
DO $$
DECLARE
  _jobid bigint;
BEGIN
  FOR _jobid IN SELECT jobid FROM cron.job WHERE jobname = 'nutrition-reminder-daily'
  LOOP
    PERFORM cron.unschedule(_jobid);
  END LOOP;

  FOR _jobid IN SELECT jobid FROM cron.job WHERE jobname = 'weekly-report-sunday'
  LOOP
    PERFORM cron.unschedule(_jobid);
  END LOOP;

  FOR _jobid IN SELECT jobid FROM cron.job WHERE jobname = 'badge-notify-daily'
  LOOP
    PERFORM cron.unschedule(_jobid);
  END LOOP;
END $$;

-- 2) Her birinden tam olarak BIR tane olustur

-- Beslenme hatirlatma — her gun 06:00 UTC (TR 09:00)
SELECT cron.schedule(
  'nutrition-reminder-daily',
  '0 6 * * *',
  $$
  SELECT net.http_get(
    url := 'https://hamzasivrikaya.com/api/cron/nutrition-reminder',
    headers := jsonb_build_object(
      'Authorization', 'Bearer nY51nHFHOzt+hLx0zdqAXxltyHH3rWHrTefX0sdkJfs='
    )
  );
  $$
);

-- Haftalik rapor — Pazar 15:00 UTC (TR 18:00)
SELECT cron.schedule(
  'weekly-report-sunday',
  '0 15 * * 0',
  $$
  SELECT net.http_get(
    url := 'https://hamzasivrikaya.com/api/cron/weekly-report',
    headers := jsonb_build_object(
      'Authorization', 'Bearer nY51nHFHOzt+hLx0zdqAXxltyHH3rWHrTefX0sdkJfs='
    )
  );
  $$
);

-- Rozet bildirimi — her gun 07:00 UTC (TR 10:00)
SELECT cron.schedule(
  'badge-notify-daily',
  '0 7 * * *',
  $$
  SELECT net.http_get(
    url := 'https://hamzasivrikaya.com/api/cron/badge-notify',
    headers := jsonb_build_object(
      'Authorization', 'Bearer nY51nHFHOzt+hLx0zdqAXxltyHH3rWHrTefX0sdkJfs='
    )
  );
  $$
);

-- 3) notifications type CHECK constraint'ine badge_earned ekle
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('low_lessons', 'weekly_report', 'inactive', 'manual', 'nutrition_reminder', 'badge_earned'));
