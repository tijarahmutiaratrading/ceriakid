-- ────────────────────────────────────────────────────────────
-- CeriaKid — pg_cron Setup (one-shot)
-- Run ni dalam Supabase SQL Editor selepas deploy edge functions
-- ────────────────────────────────────────────────────────────

-- 1. Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Store secrets dalam Vault
-- ⚠️ GANTI 'YOUR_PROJECT' dan 'YOUR_SERVICE_ROLE_KEY' dengan value sebenar
-- SELECT vault.create_secret('https://YOUR_PROJECT.supabase.co', 'project_url');
-- SELECT vault.create_secret('YOUR_SERVICE_ROLE_KEY', 'service_role_key');

-- 3. Helper function untuk panggil edge function
CREATE OR REPLACE FUNCTION call_edge_function(fn_name text, body jsonb DEFAULT '{}'::jsonb)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_id bigint;
  project_url text;
  service_key text;
BEGIN
  SELECT decrypted_secret INTO project_url FROM vault.decrypted_secrets WHERE name = 'project_url';
  SELECT decrypted_secret INTO service_key FROM vault.decrypted_secrets WHERE name = 'service_role_key';

  SELECT net.http_post(
    url := project_url || '/functions/v1/' || fn_name,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_key
    ),
    body := body
  ) INTO request_id;

  RETURN request_id;
END;
$$;

-- ────────────────────────────────────────────────────────────
-- 4. Schedule semua jobs
-- ────────────────────────────────────────────────────────────

-- Supabase Sync — Setiap 3 jam
SELECT cron.schedule(
  'supabase-sync-3h',
  '0 */3 * * *',
  $$ SELECT call_edge_function('sync-to-supabase', '{"scheduled": true}'::jsonb); $$
);

-- Asset Backup — Setiap 3 jam (offset 30 min)
SELECT cron.schedule(
  'asset-backup-3h',
  '30 */3 * * *',
  $$ SELECT call_edge_function('backup-all-assets', '{"scheduled": true, "limit": 100}'::jsonb); $$
);

-- ⭐ Abandoned Cart — Setiap 1 jam (critical: revenue recovery)
SELECT cron.schedule(
  'abandoned-cart-hourly',
  '0 * * * *',
  $$ SELECT call_edge_function('send-abandoned-cart-reminders'); $$
);

-- ⭐ Low Credit Reminder — Daily 10AM MYT = 02:00 UTC
SELECT cron.schedule(
  'low-credit-daily',
  '0 2 * * *',
  $$ SELECT call_edge_function('send-low-credit-reminders', '{"scheduled": true}'::jsonb); $$
);

-- Streak Reminder — Daily 6PM MYT = 10:00 UTC
SELECT cron.schedule(
  'streak-reminder-daily',
  '0 10 * * *',
  $$ SELECT call_edge_function('send-streak-reminders'); $$
);

-- Weekly Progress Report — Ahad 9AM MYT = Ahad 01:00 UTC
SELECT cron.schedule(
  'weekly-report-sunday',
  '0 1 * * 0',
  $$ SELECT call_edge_function('send-weekly-progress-report'); $$
);

-- Expiry Reminders — Daily 8AM MYT = 00:00 UTC
SELECT cron.schedule(
  'expiry-reminders-daily',
  '0 0 * * *',
  $$ SELECT call_edge_function('send-expiry-reminders'); $$
);

-- Cleanup Stuck Subscriptions — Setiap 6 jam
SELECT cron.schedule(
  'cleanup-stuck-subs-6h',
  '0 */6 * * *',
  $$ SELECT call_edge_function('cleanup-stuck-subscriptions'); $$
);

-- Health Check — Setiap 6 jam (offset 15 min)
SELECT cron.schedule(
  'health-check-6h',
  '15 */6 * * *',
  $$ SELECT call_edge_function('run-health-check'); $$
);

-- ────────────────────────────────────────────────────────────
-- 5. Verify
-- ────────────────────────────────────────────────────────────
SELECT jobid, jobname, schedule, active FROM cron.job ORDER BY jobid;