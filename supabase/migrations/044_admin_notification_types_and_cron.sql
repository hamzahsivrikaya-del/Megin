-- 1) Yeni admin bildirim tiplerini CHECK constraint'e ekle
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'low_lessons', 'weekly_report', 'inactive', 'manual',
    'nutrition_reminder', 'badge_earned',
    'admin_nutrition_summary', 'admin_measurement', 'admin_low_lessons'
  ));

-- 2) Admin beslenme durum cron job'lari (4x/gun: 07:00, 10:00, 13:00, 16:00 UTC = TR 10-13-16-19)
SELECT cron.schedule(
  'admin-nutrition-summary-10',
  '0 7 * * *',
  $$
  SELECT net.http_get(
    url := 'https://hamzasivrikaya.com/api/cron/admin-nutrition-summary',
    headers := jsonb_build_object(
      'Authorization', 'Bearer nY51nHFHOzt+hLx0zdqAXxltyHH3rWHrTefX0sdkJfs='
    )
  );
  $$
);

SELECT cron.schedule(
  'admin-nutrition-summary-13',
  '0 10 * * *',
  $$
  SELECT net.http_get(
    url := 'https://hamzasivrikaya.com/api/cron/admin-nutrition-summary',
    headers := jsonb_build_object(
      'Authorization', 'Bearer nY51nHFHOzt+hLx0zdqAXxltyHH3rWHrTefX0sdkJfs='
    )
  );
  $$
);

SELECT cron.schedule(
  'admin-nutrition-summary-16',
  '0 13 * * *',
  $$
  SELECT net.http_get(
    url := 'https://hamzasivrikaya.com/api/cron/admin-nutrition-summary',
    headers := jsonb_build_object(
      'Authorization', 'Bearer nY51nHFHOzt+hLx0zdqAXxltyHH3rWHrTefX0sdkJfs='
    )
  );
  $$
);

SELECT cron.schedule(
  'admin-nutrition-summary-19',
  '0 16 * * *',
  $$
  SELECT net.http_get(
    url := 'https://hamzasivrikaya.com/api/cron/admin-nutrition-summary',
    headers := jsonb_build_object(
      'Authorization', 'Bearer nY51nHFHOzt+hLx0zdqAXxltyHH3rWHrTefX0sdkJfs='
    )
  );
  $$
);
