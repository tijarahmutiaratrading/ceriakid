# 🚀 Migration Checklist — Restore CeriaKid Anywhere

> Hari kau nak migrate ke platform lain (Vercel, Supabase, Lovable, etc), ikut step ni.
> Estimated time: **4-8 hours** kalau semua dah ready.

---

## 📦 Pre-Migration (Buat SEKARANG, jangan tunggu kecemasan)

### ✅ Step 1: Backup Secrets (5 min) — KRITIKAL!

Copy semua 12 secrets ni ke **1Password / Bitwarden / encrypted note**:

```
□ SUPABASE_URL              = https://xxx.supabase.co
□ SUPABASE_SERVICE_KEY      = eyJhbGc... (long key)
□ CHIP_BRAND_ID             = (from chip-in.asia dashboard)
□ CHIP_SECRET_KEY           = (from chip-in.asia dashboard)
□ CHIP_WEBHOOK_SECRET       = (from chip-in.asia dashboard)
□ RESEND_API_KEY            = re_xxx
□ RESEND_FROM_EMAIL         = noreply@ceriakid.com (or your domain)
□ FB_PIXEL_ID               = (from Facebook Business Manager)
□ FB_ACCESS_TOKEN           = (from Facebook Business Manager)
□ VAPID_PUBLIC_KEY          = (from generateVapidKeys function)
□ VAPID_PRIVATE_KEY         = (from generateVapidKeys function)
□ VAPID_SUBJECT             = mailto:your@email.com
```

⚠️ **Cara dapat sekarang:** Base44 Dashboard → Settings → Environment Variables → copy values

### ✅ Step 2: Verify Backups (10 min)

```
□ GitHub repo up-to-date?           git log --oneline -5
□ Supabase data synced?             Check syncToSupabase last_run (should be <3 hours ago)
□ Supabase Storage ada 200 assets?  Check ck-assets bucket
□ Asset mapping ada 200 rows?       SELECT COUNT(*) FROM ck_asset_mapping;
```

### ✅ Step 3: Document External Configs (15 min)

Buat note untuk benda yang takde dalam code:

```
□ CHIP Webhook URL              = (current: https://YOUR-BASE44.app/functions/chipWebhook)
□ Resend verified domain        = (e.g. ceriakid.com)
□ Facebook Pixel ID             = (verify in Facebook Events Manager)
□ Custom domain DNS records     = (CNAME pointing to current host)
□ Active automations list       = See docs/13_AUTOMATIONS_INVENTORY.md
```

---

## 🚨 Migration Day — Step by Step

### Phase 1: Setup New Infrastructure (1-2 hours)

#### A. Frontend Hosting (Vercel recommended)
```
□ Create new Vercel project
□ Connect GitHub repo
□ Add all 12 secrets as env vars
□ Set build command: npm run build
□ Set output dir: dist
□ Deploy → get preview URL
```

#### B. Backend Functions (Supabase Edge Functions)
```
□ supabase functions new <function-name>
□ Copy from functions/ folder to supabase/functions/
□ Replace Base44 SDK imports with Supabase SDK
□ Deploy: supabase functions deploy
```

See `docs/06_SUPABASE_MIGRATION.md` for code translation pattern.

#### C. Database (already in Supabase ✅)
```
□ Verify all 26 tables exist in Supabase
□ Add RLS policies (see docs/09_COMPLETE_SQL_SCHEMA.md)
□ Test query: SELECT COUNT(*) FROM users; -- should match Base44
```

### Phase 2: Restore Assets (30 min)

Assets already in Supabase Storage. Need to swap URLs in code:

```bash
# Pre-req: set env vars first
export SUPABASE_URL="https://xxx.supabase.co"
export SUPABASE_SERVICE_KEY="eyJ..."

# Preview dulu (tak tulis apa-apa)
node scripts/swap-asset-urls.js --dry-run

# Apply replacement
node scripts/swap-asset-urls.js

# (Optional) custom directory
node scripts/swap-asset-urls.js --dir=./src/components
```

Script ni akan:
- Fetch URL mapping dari `ck_asset_mapping` table
- Scan semua `.js/.jsx/.ts/.tsx/.md/.html/.json/.css` files dalam `src/`
- Replace setiap Base44 URL dengan Supabase Storage URL
- Skip `node_modules`, `.git`, `dist`, `build`

Or do it dynamically via runtime URL resolver (see `docs/12_ASSETS_BACKUP.md`).

### Phase 3: Setup Automations (30 min)

```
□ Recreate 7 active automations (see docs/13_AUTOMATIONS_INVENTORY.md)
□ Test each one manually first
□ Enable schedule only after manual test passes
```

### Phase 4: External Services Update (1 hour)

#### CHIP Payment Gateway
```
□ Login to chip-in.asia dashboard
□ Update webhook URL → https://NEW-DOMAIN.com/api/chipWebhook
□ Test with small payment
```

#### Resend Email
```
□ Verify sending domain still valid
□ Test email: send to your own email
□ Check DNS records (SPF, DKIM) if changed domain
```

#### Facebook Pixel
```
□ Update Pixel domain in Business Manager (if domain changed)
□ Test event tracking via Facebook Pixel Helper extension
```

#### Push Notifications (VAPID)
```
□ VAPID keys same (no need regenerate)
□ Users may need to re-subscribe (sw.js scope changed)
```

### Phase 5: DNS Cutover (15 min)

```
□ Update DNS A/CNAME record → new host
□ Wait for propagation (5-30 min)
□ Test: nslookup ceriakid.com
□ SSL auto-issued by Vercel/host
```

### Phase 6: Smoke Test (1 hour)

```
□ Landing page loads with all images
□ User login works
□ Game plays correctly
□ Payment checkout completes
□ Email reminder hantar
□ Push notification delivered
□ Admin dashboard accessible
□ Affiliate links tracked
```

---

## 🆘 Rollback Plan (kalau tak jadi)

```
□ Revert DNS → old host (5 min propagation)
□ Notify users via email (template ready)
□ Document what went wrong → fix → retry
```

---

## 📊 Restore Score Reference

| Component | Coverage | Notes |
|---|---|---|
| Source code | 100% | GitHub auto-sync |
| Database schema | 100% | Full SQL + RLS in docs/09 |
| Database data | 100% | Supabase mirror every 3 hrs |
| Game/BBM assets | 100% | Backed up to ck-assets bucket |
| Hardcoded UI assets | 100% | Registered in `lib/hardcodedAssets.js` |
| Asset URL swap | 100% | `scripts/swap-asset-urls.js` (dry-run + apply) |
| Secrets | 0% (manual) | YOU must backup to 1Password |
| Auth/passwords | 0% | Users kena reset password (Base44 magic-link limitation) |
| Automations | 100% (logic) | Schedule config in docs/13 |
| Webhooks (CHIP) | Manual update | Update URL in CHIP dashboard |
| Domain/DNS | Manual update | Point to new host |

**Realistic restore time:** 4-8 hours by 1 dev with checklist.
**Without checklist:** 2-3 days minimum.

---

## 🎯 The "1-Hour Emergency" Path

Kalau Base44 down dan tak boleh tunggu:

```
1. (15 min) Deploy GitHub repo to Vercel + add secrets
2. (15 min) Run swap-asset-urls.js to point to Supabase Storage
3. (15 min) Recreate top 3 automations: syncToSupabase, chipWebhook, sendWelcomeEmail
4. (10 min) Update CHIP webhook URL + DNS
5. (5 min)  Smoke test critical paths only
```

Result: **App running again, ~80% functional**. Email/push reminders broken (ok untuk 1-2 hari). Fix balance in next 48 hours.