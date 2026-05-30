# ⏰ Automations Inventory

> All scheduled tasks running on Base44. When migrating, recreate these in new platform.
> Last verified: 2026-05-30

---

## 📋 Active Automations (Currently Running — 7 total)

| # | Name | Function | Schedule (MY Time) | Purpose |
|---|---|---|---|---|
| 1 | **Supabase Sync (Every 3 Hours)** | `syncToSupabase` | Every 3h from 02:00 MY | Mirror all 26 entities → Supabase tables |
| 2 | **Asset Backup (Every 3 Hours)** | `backupAllAssets` | Every 3h from 02:30 MY | Backup media (images) → Supabase Storage bucket `ck-assets` |
| 3 | **Abandoned Cart Reminder** | `sendAbandonedCartReminders` | Every 1 hour | Email users who didn't complete checkout (2-24h after) |
| 4 | **Daily Low Credit Reminder** | `sendLowCreditReminders` | Daily 02:00 MY | Email paid users with <5 credits (14-day cooldown) |
| 5 | **Daily Streak Reminder (6PM)** | `sendStreakReminders` | Daily 18:00 MY | Push notify users who haven't played today |
| 6 | **Weekly Progress Report (Sunday 9AM)** | `sendWeeklyProgressReport` | Sunday 09:00 MY | Email parents with weekly child progress |
| 7 | **Weekly Story Kid QC Audit** | `auditStoryKidGames` | Monday 02:00 MY | Quality control audit on Story Kid games |

> 💡 **Sync Pair**: Automations #1 + #2 work together — entitas data + media files both backed up every 3h, staggered 30min apart. Admin can also trigger both manually via "Sync Semua Sekarang" button in Admin Dashboard → Health tab.

---

## 🗄️ Archived / Inactive

| Name | Function | Status |
|---|---|---|
| Cleanup Stuck Subscriptions | `cleanupStuckSubscriptions` | Archived (manual run only) |
| Background Story Generator | `backgroundStoryGenerator` | Off by default (toggle via QCSetting) |
| Background Launch Generator | `backgroundLaunchGenerator` | Off by default (toggle via QCSetting) |

---

## 🔄 How to Recreate (Supabase / Other Platform)

### Supabase Edge Functions + pg_cron

```sql
-- Enable pg_cron extension first
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 1. Supabase Data Sync (every 3 hours from 18:00 UTC = 02:00 MY)
SELECT cron.schedule(
  'supabase-data-sync',
  '0 18,21,0,3,6,9,12,15 * * *',
  $$ SELECT net.http_post(
    url := 'https://YOUR-PROJECT.supabase.co/functions/v1/syncToSupabase',
    headers := jsonb_build_object('Authorization', 'Bearer YOUR-SERVICE-KEY'),
    body := jsonb_build_object('scheduled', true)
  ) $$
);

-- 2. Asset Backup (every 3 hours from 18:30 UTC = 02:30 MY)
SELECT cron.schedule(
  'asset-backup',
  '30 18,21,0,3,6,9,12,15 * * *',
  $$ SELECT net.http_post(
    url := 'https://YOUR-PROJECT.supabase.co/functions/v1/backupAllAssets',
    headers := jsonb_build_object('Authorization', 'Bearer YOUR-SERVICE-KEY'),
    body := jsonb_build_object('action','backup','limit',100,'scheduled',true)
  ) $$
);

-- 3. Abandoned Cart (every hour)
SELECT cron.schedule(
  'abandoned-cart',
  '0 * * * *',
  $$ SELECT net.http_post(
    url := 'https://YOUR-PROJECT.supabase.co/functions/v1/sendAbandonedCartReminders',
    headers := jsonb_build_object('Authorization', 'Bearer YOUR-SERVICE-KEY')
  ) $$
);

-- 4. Daily Low Credit Reminder (daily 02:00 MY = 18:00 UTC)
SELECT cron.schedule(
  'low-credit-reminder',
  '0 18 * * *',
  $$ SELECT net.http_post(
    url := 'https://YOUR-PROJECT.supabase.co/functions/v1/sendLowCreditReminders',
    headers := jsonb_build_object('Authorization', 'Bearer YOUR-SERVICE-KEY'),
    body := jsonb_build_object('scheduled', true)
  ) $$
);

-- 5. Daily Streak Reminder (18:00 MY = 10:00 UTC)
SELECT cron.schedule(
  'streak-reminder',
  '0 10 * * *',
  $$ SELECT net.http_post(
    url := 'https://YOUR-PROJECT.supabase.co/functions/v1/sendStreakReminders',
    headers := jsonb_build_object('Authorization', 'Bearer YOUR-SERVICE-KEY')
  ) $$
);

-- 6. Weekly Progress (Sunday 09:00 MY = 01:00 UTC)
SELECT cron.schedule(
  'weekly-progress',
  '0 1 * * 0',
  $$ SELECT net.http_post(
    url := 'https://YOUR-PROJECT.supabase.co/functions/v1/sendWeeklyProgressReport',
    headers := jsonb_build_object('Authorization', 'Bearer YOUR-SERVICE-KEY')
  ) $$
);

-- 7. Weekly Story Kid QC (Monday 02:00 MY = Sunday 18:00 UTC)
SELECT cron.schedule(
  'storykid-qc',
  '0 18 * * 0',
  $$ SELECT net.http_post(
    url := 'https://YOUR-PROJECT.supabase.co/functions/v1/auditStoryKidGames',
    headers := jsonb_build_object('Authorization', 'Bearer YOUR-SERVICE-KEY')
  ) $$
);
```

### Vercel Cron (alternative)

```json
// vercel.json
{
  "crons": [
    { "path": "/api/syncToSupabase",            "schedule": "0 18,21,0,3,6,9,12,15 * * *" },
    { "path": "/api/backupAllAssets",           "schedule": "30 18,21,0,3,6,9,12,15 * * *" },
    { "path": "/api/sendAbandonedCartReminders","schedule": "0 * * * *" },
    { "path": "/api/sendLowCreditReminders",    "schedule": "0 18 * * *" },
    { "path": "/api/sendStreakReminders",       "schedule": "0 10 * * *" },
    { "path": "/api/sendWeeklyProgressReport",  "schedule": "0 1 * * 0" },
    { "path": "/api/auditStoryKidGames",        "schedule": "0 18 * * 0" }
  ]
}
```

> ⚠️ Vercel Hobby plan = 2 cron jobs max. Use Pro plan OR consolidate using Supabase pg_cron above.

---

## ⚠️ Timezone Note

All times above shown in **Malaysia Time (MY = UTC+8)**.
When configuring cron in Supabase/Vercel, **convert to UTC**:

| MY Time | UTC Time |
|---|---|
| 02:00 | 18:00 (previous day) |
| 02:30 | 18:30 (previous day) |
| 09:00 | 01:00 |
| 18:00 | 10:00 |

---

## 🔐 Secrets Required

Each automation needs these env vars in new platform:
- `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` (sync + backup)
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (all email automations)
- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (push notifications)
- `CHIP_SECRET_KEY` (for subscription verification in abandoned cart)

See `docs/08_SECRETS_AND_ENV.md` for full list.

---

## 🔄 Manual Trigger (Admin Dashboard)

Admin can trigger sync manually via UI:

**Location:** Admin Dashboard → Health Tab → "Sync Semua Sekarang" button

**What it does (parallel):**
1. Calls `syncToSupabase` → mirrors all entities
2. Calls `backupAllAssets` (action: backup, limit: 100) → backs up next 100 new images

**Use case:** Force sync before major changes / verify backup status / disaster recovery dry run.