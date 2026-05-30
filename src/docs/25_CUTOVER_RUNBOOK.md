# 🚀 Cutover Runbook — Migration Day Step-by-Step

> Playbook detail untuk hari migration. Ikut order tepat untuk minimize downtime.
> Target downtime: **< 15 minit** (kalau ikut runbook ni betul)
> Last updated: 2026-05-30

---

## ⏱️ Timeline Overview

```
T-7 days  : Pre-migration prep (Supabase setup, code translation)
T-1 day   : Dry run + final backup
T-0 (Day) : Cutover execution (this runbook)
T+1 day   : Monitor + bug fixes
T+7 days  : Decommission old platform
```

---

## 📋 T-0 Migration Day — Hour-by-Hour

### 🕐 H-2 (2 hours before cutover) — PRE-FREEZE

**Goal:** Last sanity checks sebelum freeze production

- [ ] Trigger manual "Sync Semua Sekarang" di Admin → Health
  - Verify: `syncToSupabase` returns success
  - Verify: `backupAllAssets` returns 0 new assets (all backed up)
  - Verify: `syncMigrationKit` saves snapshot
- [ ] Snapshot Supabase database backup (point-in-time)
  ```sql
  -- In Supabase SQL Editor:
  SELECT pg_export_snapshot();
  ```
- [ ] Export GitHub repo latest commit hash → save dalam notes
- [ ] Verify new platform deployment build pass (frontend kt Vercel/Netlify staging URL)
- [ ] Test login flow di staging guna 1 test account

---

### 🕐 H-1 — FREEZE WRITES (entering maintenance)

**Goal:** Stop new data dari ditulis ke old platform supaya boleh sync final

- [ ] **Display maintenance banner** kt landing page
  ```
  "🛠️ Penyelenggaraan ringkas — kembali dalam 15 minit"
  ```
  Add via quick edit: `pages/Landing.jsx` → top banner conditional
- [ ] **Disable checkout** (prevent payments mid-migration)
  - Toggle env var `CHECKOUT_DISABLED=true` di Base44
  - `chipCheckout` function: add early return jika flag set
- [ ] **Pause all 7 automations** di Base44 Automations tab:
  - [ ] Data Sync (Every 3 Hours)
  - [ ] Asset Backup (Every 3 Hours)
  - [ ] Health Check (Every 15 min)
  - [ ] Streak Reminders (Daily 8pm)
  - [ ] Expiry Reminders (Daily 9am)
  - [ ] Abandoned Cart (Every 6h)
  - [ ] QC Audit (Hourly)
- [ ] Verify: No active webhook calls dalam 5 minit terakhir (check `runHealthCheck` logs)

---

### 🕐 H-0:30 — FINAL SYNC

**Goal:** Last data sync — capture semua transactions sejak last sync

- [ ] Run `syncToSupabase` MANUAL satu kali lagi
  - Check function logs — verify last entity processed
  - Expected: 0 new records (sebab freeze)
- [ ] Run `backupAllAssets` MANUAL
- [ ] Verify Supabase counts match Base44 counts:
  ```sql
  -- Quick spot check di Supabase SQL Editor:
  SELECT 
    (SELECT COUNT(*) FROM ck_users) as users,
    (SELECT COUNT(*) FROM ck_user_subscriptions) as subs,
    (SELECT COUNT(*) FROM ck_games) as games,
    (SELECT COUNT(*) FROM ck_credit_transactions) as transactions;
  ```
  Compare dengan numbers dari Base44 admin dashboard.

---

### 🕐 H-0 — CUTOVER (T-MINUS ZERO)

**Goal:** DNS switch — actual traffic redirect

#### Step 1: Deploy new platform (5 min)
- [ ] Push final frontend build to new hosting (Vercel/Netlify production)
- [ ] Verify production URL accessible (test direct URL, not domain yet)
  - Example: `ceriakid-prod.vercel.app`
- [ ] Smoke test:
  - [ ] Landing page loads
  - [ ] Sign up works
  - [ ] Login works
  - [ ] Dashboard loads with sample data

#### Step 2: Update third-party webhook URLs (5 min) — ORDER MATTERS

**⚠️ CRITICAL ORDER — payment webhook FIRST sebab paling penting:**

1. **CHIP webhook** (Login → https://gate.chip-in.asia)
   - Settings → Webhooks → Edit endpoint
   - Old: `https://app.base44.com/functions/chipWebhook`
   - New: `https://your-new-platform.com/api/chipWebhook`
   - **Don't delete old yet** — keep as backup for 24h
   - Click "Test webhook" → verify 200 OK from new endpoint

2. **Resend webhook** (jika ada — recommended setup baru)
   - Login → https://resend.com/webhooks
   - Add endpoint: `https://your-new-platform.com/api/resendWebhook`
   - Subscribe events: `email.bounced`, `email.complained`, `email.delivered`

3. **FB Pixel** — no webhook change needed
   - But MUST verify domain di FB Business Manager (next step in DNS)

#### Step 3: DNS cutover (1-2 min for TTL propagation)

**Pre-requirement:** TTL dah turun ke 60 seconds 24 jam sebelum ni!
```
Day before: Update DNS TTL → 60s (allow fast switch)
```

- [ ] Login DNS provider (Cloudflare/Namecheap/etc)
- [ ] Update A record / CNAME:
  ```
  ceriakid.com         → new platform IP/CNAME
  www.ceriakid.com     → new platform IP/CNAME
  ```
- [ ] **Don't delete old records yet** — set Cloudflare to "Proxied" so easy to flip back
- [ ] Wait 60-120 seconds for propagation
- [ ] Verify dari multiple lokasi:
  ```bash
  dig ceriakid.com +short      # Should return new IP
  curl -I https://ceriakid.com # Should return new headers
  ```

#### Step 4: Re-enable services (3 min)
- [ ] Remove maintenance banner
- [ ] Toggle off `CHECKOUT_DISABLED` env var
- [ ] Activate automations di new platform (recreate ikut doc 13)
- [ ] Subscribe push notifications ulang (VAPID keys sama, no action needed kalau guna existing)

---

### 🕐 H+0:15 — SMOKE TEST (Live verification)

**Goal:** Verify production traffic working

- [ ] **Open ceriakid.com** dalam incognito browser
  - [ ] Landing page render
  - [ ] Hero images load (verify asset URLs swap working)
- [ ] **Test signup flow** dengan email baru
  - [ ] Welcome email arrive dari Resend
  - [ ] User record created dalam Supabase
- [ ] **Test login flow** dengan existing user (dari list 177 users)
  - [ ] Auth token works
  - [ ] Dashboard shows data
- [ ] **Test payment flow** (small test — RM5 credit package)
  - [ ] Redirect to CHIP works
  - [ ] Webhook fires after payment
  - [ ] UserSubscription updated
  - [ ] Welcome email sent
- [ ] **Check FB Pixel** di FB Events Manager
  - [ ] PageView events arriving
  - [ ] Test event with eventID — verify dedup

---

### 🕐 H+1 — MONITORING (1 hour after cutover)

- [ ] Check error logs di new platform — should be < 1% error rate
- [ ] Check Supabase function logs — semua function callable
- [ ] Check user feedback channel (WhatsApp support, email)
- [ ] Monitor real-time payments — verify webhooks landing
- [ ] Check Health Check first run on new platform

---

## 🔥 Rollback Plan (kalau cutover gagal)

### Decision matrix
| Issue | Severity | Action |
|---|---|---|
| 1-2 minor bugs | Low | Fix forward, no rollback |
| Login broken | High | Rollback DNS |
| Payments not working | CRITICAL | Rollback DNS + CHIP webhook |
| Data loss | CRITICAL | Restore Supabase snapshot + rollback |

### Rollback steps (5 min execution)

1. **Revert DNS** (Cloudflare)
   ```
   ceriakid.com → old Base44 CDN
   www.ceriakid.com → old Base44 CDN
   ```

2. **Revert CHIP webhook**
   - CHIP dashboard → Edit webhook → restore old URL

3. **Resume Base44 automations**
   - Re-enable 7 paused automations

4. **Remove maintenance banner** kat Base44 (old platform)

5. **Investigate** issue dari new platform logs

6. **Communicate** to users via banner: "Sistem telah dipulihkan, terima kasih atas kesabaran"

### Rollback time budget
```
Total: 5-7 minutes
- DNS revert:          1 min
- CHIP webhook revert: 2 min
- Automations resume:  2 min
- Verification:        2 min
```

---

## ✅ Post-Cutover Checklist (T+24 hours)

- [ ] All payments dari last 24h verified successful
- [ ] All emails dari last 24h delivered (check Resend dashboard)
- [ ] No spike in support tickets
- [ ] All 7 automations running di new platform (verify cron job logs)
- [ ] Asset URLs all swapped (run `scripts/find-hardcoded-urls.sh` — should return 0)
- [ ] FB Pixel + CAPI deduplication verified (check FB Events Manager → no double Purchase events)

---

## 🗑️ Decommission Old Platform (T+7 days)

**Only after 7 days of stable operation:**

- [ ] Final Base44 data export (backup ke long-term storage)
- [ ] Cancel Base44 subscription
- [ ] Remove old CHIP webhook URL (the backup one)
- [ ] Update DNS — remove old records
- [ ] Archive GitHub repo `migration-tools/` folder

---

## 🚨 Emergency Contacts

| Service | Support URL | Response SLA |
|---|---|---|
| CHIP | support@chip-in.asia | < 4 jam (working day) |
| Resend | https://resend.com/help | < 24 jam |
| Supabase | https://supabase.com/support | Pro: 24h, Free: best effort |
| Vercel | https://vercel.com/help | Pro: 24h |
| Cloudflare DNS | https://dash.cloudflare.com/support | < 24h |

---

## 📝 Communication Template

### Pre-cutover announcement (email to all users)
```
Subjek: Penyelenggaraan ringkas CeriaKid — {DATE} jam {TIME}

Hi Mama/Papa,

Kami akan menjalankan penyelenggaraan ringkas pada {DATE} jam {TIME} 
(anggaran 15 minit).

Apa yang berubah?
- Tiada — semua data anak anda kekal selamat
- Selepas penyelenggaraan, login balik seperti biasa

Terima kasih atas kesabaran! 🙏

— Team CeriaKid
```

### Post-cutover (jika ada issue)
```
Subjek: Sistem CeriaKid telah dipulihkan ✅

Hi Mama/Papa,

Penyelenggaraan telah selesai. Kalau anda hadapi masalah login atau 
akses, sila:
1. Refresh browser (Ctrl+Shift+R)
2. Clear cache jika perlu
3. Hubungi kami di WhatsApp {NUMBER} jika masih ada isu

— Team CeriaKid
```

---

> Ikut runbook ni betul-betul, target downtime **< 15 minit**. Realistic dengan buffers: **30-45 minit**.