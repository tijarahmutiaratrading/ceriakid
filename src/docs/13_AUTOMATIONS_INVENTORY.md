# ⏰ Automations Inventory

> All scheduled tasks running on Base44. When migrating, recreate these in new platform.
> Last verified: 2026-05-30

---

## 📋 Active Automations (Currently Running)

| # | Name | Function | Schedule | Purpose |
|---|---|---|---|---|
| 1 | **Supabase Sync** | `syncToSupabase` | Every 3 hours from 02:00 MY | Mirror all entities to Supabase (disaster recovery) |
| 2 | **Background Story Generator** | `backgroundStoryGenerator` | Every 10 minutes | Auto-generate Story Kid games (when enabled) |
| 3 | **Abandoned Cart Reminder** | `sendAbandonedCartReminders` | Every 1 hour | Email users who didn't complete checkout |
| 4 | **Daily Low Credit Reminder** | `sendLowCreditReminders` | Daily 02:00 MY | Email paid users with <5 credits (14-day cooldown) |
| 5 | **Daily Streak Reminder** | `sendStreakReminders` | Daily 18:00 MY (10:00 UTC) | Push notify users who haven't played today |
| 6 | **Weekly Progress Report** | `sendWeeklyProgressReport` | Sunday 09:00 MY (01:00 UTC) | Email parents with weekly child progress |
| 7 | **Weekly Story Kid QC Audit** | `auditStoryKidGames` | Monday 02:00 MY (18:00 Sun UTC) | Quality control audit |

---

## 🗄️ Archived / Inactive

| Name | Function | Status |
|---|---|---|
| Cleanup Stuck Subscriptions | `cleanupStuckSubscriptions` | Archived (manual run only) |

---

## 🔄 How to Recreate (Supabase / Other Platform)

### Supabase Edge Functions + pg_cron

```sql
-- Enable pg_cron extension first
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Example: Supabase Sync (every 3 hours)
SELECT cron.schedule(
  'supabase-sync',
  '0 */3 * * *',  -- every 3 hours
  $$ SELECT net.http_post(
    url := 'https://YOUR-PROJECT.supabase.co/functions/v1/syncToSupabase',
    headers := jsonb_build_object('Authorization', 'Bearer YOUR-SERVICE-KEY')
  ) $$
);

-- Daily Streak Reminder (18:00 MY = 10:00 UTC)
SELECT cron.schedule(
  'streak-reminder',
  '0 10 * * *',
  $$ SELECT net.http_post(
    url := 'https://YOUR-PROJECT.supabase.co/functions/v1/sendStreakReminders',
    headers := jsonb_build_object('Authorization', 'Bearer YOUR-SERVICE-KEY')
  ) $$
);

-- Weekly Progress (Sunday 09:00 MY = 01:00 UTC)
SELECT cron.schedule(
  'weekly-progress',
  '0 1 * * 0',
  $$ SELECT net.http_post(
    url := 'https://YOUR-PROJECT.supabase.co/functions/v1/sendWeeklyProgressReport',
    headers := jsonb_build_object('Authorization', 'Bearer YOUR-SERVICE-KEY')
  ) $$
);
```

### Vercel Cron (alternative)

```json
// vercel.json
{
  "crons": [
    { "path": "/api/syncToSupabase", "schedule": "0 */3 * * *" },
    { "path": "/api/sendStreakReminders", "schedule": "0 10 * * *" },
    { "path": "/api/sendWeeklyProgressReport", "schedule": "0 1 * * 0" },
    { "path": "/api/sendAbandonedCartReminders", "schedule": "0 * * * *" },
    { "path": "/api/sendLowCreditReminders", "schedule": "0 18 * * *" },
    { "path": "/api/auditStoryKidGames", "schedule": "0 18 * * 0" },
    { "path": "/api/backgroundStoryGenerator", "schedule": "*/10 * * * *" }
  ]
}
```

---

## ⚠️ Timezone Note

All times above shown in **Malaysia Time (MY = UTC+8)**.
When configuring cron in Supabase/Vercel, **convert to UTC**:

| MY Time | UTC Time |
|---|---|
| 02:00 | 18:00 (previous day) |
| 09:00 | 01:00 |
| 18:00 | 10:00 |

---

## 🔐 Secrets Required

Each automation needs these env vars in new platform:
- `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`
- `CHIP_SECRET_KEY` (for subscription verification)

See `docs/08_SECRETS_AND_ENV.md` for full list.