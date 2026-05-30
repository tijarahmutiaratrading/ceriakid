# ⏰ Automations Setup — Supabase pg_cron

> Setup balik semua scheduled tasks bila pindah ke Supabase.
> Last updated: 2026-05-30
>
> **Timezone:** pg_cron guna **UTC**. Malaysia (MYT) = UTC+8.
> Contoh: 9AM MYT = 01:00 UTC (subtract 8 jam).

---

## 📋 Active Automations (8)

| # | Name | Schedule (MYT) | Function | Notes |
|---|---|---|---|---|
| 1 | Supabase Sync | Setiap 3 jam | `sync-to-supabase` | No-op dalam Supabase (sudah source of truth) |
| 2 | Asset Backup | Setiap 3 jam | `backup-all-assets` | No-op (assets dah di Storage) |
| 3 | Abandoned Cart Reminder | Setiap 1 jam | `send-abandoned-cart-reminders` | ⭐ Critical — revenue recovery |
| 4 | Daily Low Credit Reminder | Daily 10AM | `send-low-credit-reminders` | ⭐ Critical — drives top-ups |
| 5 | Daily Streak Reminder | Daily 6PM | `send-streak-reminders` | Push notification |
| 6 | Weekly Progress Report | Ahad 9AM | `send-weekly-progress-report` | Email ke parents |
| 7 | Weekly QC Audit | Isnin 2AM | `audit-story-kid-games` | Stub — skip atau setup manual |
| 8 | Expiry Reminders | Daily 8AM | `send-expiry-reminders` | Email subscription expiry |

---

## 🔧 Setup Steps (One-time)

### 1. Enable pg_cron + pg_net extensions

Di Supabase Dashboard → Database → Extensions, enable:
- ✅ `pg_cron`
- ✅ `pg_net`

Atau via SQL:
```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### 2. Store secrets dalam Vault

Untuk panggil edge functions, pg_cron perlu service role key:

```sql
SELECT vault.create_secret(
  'https://YOUR_PROJECT.supabase.co',
  'project_url'
);

SELECT vault.create_secret(
  'YOUR_SERVICE_ROLE_KEY',
  'service_role_key'
);
```

### 3. Helper function (panggil edge function)

```sql
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
```

---

## ⏰ Schedule SQL Commands

Run satu-satu, atau copy semua sekali gus.

### 1. Supabase Sync — Setiap 3 jam

```sql
SELECT cron.schedule(
  'supabase-sync-3h',
  '0 */3 * * *',
  $$ SELECT call_edge_function('sync-to-supabase', '{"scheduled": true}'::jsonb); $$
);
```

### 2. Asset Backup — Setiap 3 jam (offset 30 min)

```sql
SELECT cron.schedule(
  'asset-backup-3h',
  '30 */3 * * *',
  $$ SELECT call_edge_function('backup-all-assets', '{"scheduled": true, "limit": 100}'::jsonb); $$
);
```

### 3. ⭐ Abandoned Cart — Setiap 1 jam

```sql
SELECT cron.schedule(
  'abandoned-cart-hourly',
  '0 * * * *',
  $$ SELECT call_edge_function('send-abandoned-cart-reminders'); $$
);
```

### 4. ⭐ Low Credit Reminder — Daily 10AM MYT = 02:00 UTC

```sql
SELECT cron.schedule(
  'low-credit-daily',
  '0 2 * * *',
  $$ SELECT call_edge_function('send-low-credit-reminders', '{"scheduled": true}'::jsonb); $$
);
```

### 5. Streak Reminder — Daily 6PM MYT = 10:00 UTC

```sql
SELECT cron.schedule(
  'streak-reminder-daily',
  '0 10 * * *',
  $$ SELECT call_edge_function('send-streak-reminders'); $$
);
```

### 6. Weekly Progress Report — Ahad 9AM MYT = Ahad 01:00 UTC

```sql
SELECT cron.schedule(
  'weekly-report-sunday',
  '0 1 * * 0',
  $$ SELECT call_edge_function('send-weekly-progress-report'); $$
);
```

### 7. Expiry Reminders — Daily 8AM MYT = 00:00 UTC

```sql
SELECT cron.schedule(
  'expiry-reminders-daily',
  '0 0 * * *',
  $$ SELECT call_edge_function('send-expiry-reminders'); $$
);
```

### 8. Cleanup Stuck Subscriptions — Setiap 6 jam

```sql
SELECT cron.schedule(
  'cleanup-stuck-subs-6h',
  '0 */6 * * *',
  $$ SELECT call_edge_function('cleanup-stuck-subscriptions'); $$
);
```

### 9. Health Check — Setiap 6 jam

```sql
SELECT cron.schedule(
  'health-check-6h',
  '15 */6 * * *',
  $$ SELECT call_edge_function('run-health-check'); $$
);
```

---

## 🔍 Verify & Manage

### List semua scheduled jobs
```sql
SELECT jobid, jobname, schedule, active FROM cron.job ORDER BY jobid;
```

### Check job run history
```sql
SELECT * FROM cron.job_run_details
ORDER BY start_time DESC LIMIT 20;
```

### Pause / resume satu job
```sql
SELECT cron.alter_job(jobid := 5, schedule := '0 11 * * *');  -- tukar schedule
UPDATE cron.job SET active = false WHERE jobname = 'streak-reminder-daily';  -- pause
UPDATE cron.job SET active = true WHERE jobname = 'streak-reminder-daily';   -- resume
```

### Padam job
```sql
SELECT cron.unschedule('streak-reminder-daily');
```

---

## 🌏 Timezone Conversion Table (MYT → UTC)

| MYT | UTC | Cron |
|---|---|---|
| 12:00 AM (tengah malam) | 16:00 (hari sebelum) | `0 16 * * *` |
| 6:00 AM | 22:00 (hari sebelum) | `0 22 * * *` |
| 8:00 AM | 00:00 | `0 0 * * *` |
| 9:00 AM | 01:00 | `0 1 * * *` |
| 10:00 AM | 02:00 | `0 2 * * *` |
| 12:00 PM (tengah hari) | 04:00 | `0 4 * * *` |
| 2:00 PM | 06:00 | `0 6 * * *` |
| 6:00 PM | 10:00 | `0 10 * * *` |
| 9:00 PM | 13:00 | `0 13 * * *` |

---

## 🚨 Important Notes

1. **Day-of-week dalam cron:** Ahad = `0`, Isnin = `1`, ..., Sabtu = `6`
2. **Edge function timeout:** Default 150s. Untuk task lama, split jadi smaller chunks.
3. **Stubs:** Functions stub (QC, generators) tak perlu schedule sebab return "not implemented".
4. **Cost:** pg_cron + pg_net FREE pada Supabase free tier. Edge function invocations dikira (500K/month free).

---

## ✅ Quick Verify Selepas Setup

```sql
-- Should return 8 active jobs
SELECT COUNT(*) FROM cron.job WHERE active = true;

-- Test trigger manual untuk satu job
SELECT call_edge_function('send-abandoned-cart-reminders');

-- Check status response
SELECT * FROM net._http_response WHERE id = (
  SELECT id FROM net._http_response ORDER BY created DESC LIMIT 1
);
```

---

> 📦 Semua command ni dah dalam `supabase-backup/sql/setup-cron-jobs.sql` untuk one-shot execution.