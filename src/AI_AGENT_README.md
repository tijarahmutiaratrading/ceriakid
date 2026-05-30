# 🤖 AI Agent — Read This FIRST

> **Untuk Codex / Claude / Cursor / Lovable / Bolt / mana-mana AI coding agent.**
> Kalau anda baca file ni, anda akan faham EXACTLY apa nak buat untuk recover app ni dari Base44 → Supabase.

---

## 🎯 Mission

**App ni asalnya hosted kat Base44 platform.** Sekarang kena pindah ke Supabase + Vercel (atau platform serupa) sebab Base44 down / nak migrate.

**Semua artifacts dah disediakan dalam repo ni.** Tugas anda: ikut playbook, jangan re-architect.

---

## ⚡ Quick Decision Tree

```
Soalan: Apa user nak?

├── "Pindah app ke Supabase"        → Baca section [A] di bawah
├── "Recover app, Base44 down"      → Baca section [A] di bawah (sama)
├── "Faham app ni apa"              → Baca docs/01_APP_OVERVIEW.md
├── "Faham database structure"      → Baca docs/02_DATABASE_SCHEMA.md
├── "Buat changes UI/feature"       → Baca docs/03_PAGES_AND_FLOWS.md dulu
└── "Debug specific function"       → Baca docs/04_BACKEND_AND_AUTOMATIONS.md
```

---

## [A] 🚀 Disaster Recovery — Step by Step

### Pre-requisites yang user kena sediakan:
- ✅ Akses Supabase project (URL + service key + anon key)
- ✅ Akses Vercel/Netlify account
- ✅ 13 secrets: CHIP_BRAND_ID, CHIP_SECRET_KEY, CHIP_WEBHOOK_SECRET, RESEND_API_KEY, RESEND_FROM_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT, FB_PIXEL_ID, FB_ACCESS_TOKEN, OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

---

### Step 1️⃣ — Backend (Supabase Edge Functions) — **~25 min**

```bash
cd supabase-backup
# 1. Login to Supabase CLI
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# 2. Set all 13 secrets
supabase secrets set --env-file .env

# 3. Deploy 67 functions
chmod +x deploy.sh
./deploy.sh
```

**Apa anda dapat:**
- 67 Edge Functions running on Supabase (ikut nama dalam `supabase-backup/functions/*/`)
- Auth: shared `_shared/authGuards.ts` — admin / user / scheduled
- CORS: shared `_shared/cors.ts`
- All functions guna `Deno.serve()` standard, ready untuk Supabase Edge Runtime

**Verify:**
```bash
supabase functions list   # Should show 67 functions
```

---

### Step 2️⃣ — Database Schema (kalau project baru) — **~10 min**

```bash
# Run SQL file via Supabase SQL Editor
cat docs/09_COMPLETE_SQL_SCHEMA.md
# Copy semua SQL → paste kat Supabase Dashboard → SQL Editor → Run
```

**Apa anda dapat:**
- 26 tables (ck_users, ck_games, ck_user_subscriptions, ck_credit_transactions, dll)
- RLS policies set
- Indexes optimised

---

### Step 3️⃣ — Storage (auto-sync, already done!) — **~0 min**

✅ **DAH SIAP** — `backupAllAssets` function dah jalan setiap 3 jam.
- Bucket: `ck-assets` (public-read)
- Mapping table: `ck_asset_mapping`
- Detail: `supabase-backup/storage/README.md`

---

### Step 4️⃣ — Frontend (Vercel) — **~30 min**

**Ganti 2 fail sahaja** (semua code lain TAK PERLU UBAH):

```bash
# 1. Replace base44Client with Supabase compat shim
cp supabase-backup/auth/supabaseClient.js api/base44Client.js

# 2. Replace AuthContext
cp supabase-backup/auth/AuthContext.jsx lib/AuthContext.jsx

# 3. Add Login page
cp supabase-backup/auth/Login.jsx pages/Login.jsx
```

**Kenapa hanya 2 fail?**
Compat shim dalam `supabaseClient.js` ada `base44` proxy export yang mimicry SDK Base44:
- `base44.entities.Game.list()` → `supabase.from('ck_games').select('*')`
- `base44.auth.me()` → `supabase.auth.getUser() + ck_users join`
- `base44.functions.invoke('chipCheckout', ...)` → kebab-case → `chip-checkout`

**Frontend code (200+ components) TAK PERLU SENTUH.** 🎯

**.env setup:**
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

**Deploy:**
```bash
npm install
npm run build
vercel deploy --prod
```

---

### Step 5️⃣ — Cron Jobs (pg_cron) — **~10 min**

```bash
# Run via Supabase SQL Editor
cat supabase-backup/sql/setup-cron-jobs.sql
# Copy → paste → Run
```

**Apa anda dapat:**
- 9 scheduled jobs (abandoned cart reminders, expiry reminders, health check, dll)
- Detail: `supabase-backup/AUTOMATIONS_SETUP.md`

---

### Step 6️⃣ — External Service Config — **~10 min**

| Service | What to do |
|---|---|
| **CHIP** | Update webhook URL → `https://YOUR_PROJECT.supabase.co/functions/v1/chip-webhook` |
| **Resend** | No change needed (API key sama) |
| **Facebook** | No change needed (Pixel ID sama) |
| **Supabase Auth** | Add redirect URL → `https://YOUR_DOMAIN.com/auth/callback` |
| **DNS** | Point domain to Vercel |

Full checklist: `docs/27_THIRD_PARTY_DASHBOARD_CONFIG.md`

---

### Step 7️⃣ — Smoke Test — **~20 min**

```
1. Visit landing page → confirm loads
2. Login (magic link via Supabase Auth) → confirm receive email
3. Buat checkout (test mode CHIP) → confirm payment success
4. Generate AI story → confirm OpenAI works
5. Run /admin-dashboard health check → confirm all green
```

---

## 📚 Where to Find Everything

```
📂 /docs/                          ← 28 markdown docs (read 00_README.md first)
   ├── 00_README.md                ← Master index — START HERE
   ├── 01_APP_OVERVIEW.md          ← Business + tech overview
   ├── 02_DATABASE_SCHEMA.md       ← 26 entities full detail
   ├── 03_PAGES_AND_FLOWS.md       ← All pages + navigation
   ├── 04_BACKEND_AND_AUTOMATIONS.md ← 67 functions + cron
   ├── 06_SUPABASE_MIGRATION.md    ← Base44 → Supabase translation pattern
   ├── 07_RECOVERY_PLAYBOOK.md     ← Emergency disaster recovery
   ├── 09_COMPLETE_SQL_SCHEMA.md   ← Full PostgreSQL schema
   ├── 25_CUTOVER_RUNBOOK.md       ← Migration day step-by-step
   ├── 26_USER_PASSWORD_MIGRATION.md ← Bulk password reset for users
   └── 27_THIRD_PARTY_DASHBOARD_CONFIG.md ← External service setup

📂 /supabase-backup/              ← Production-ready Supabase code
   ├── PHASE_STATUS.md             ← Migration completeness report
   ├── deploy.sh                   ← One-command deploy script
   ├── AUTOMATIONS_SETUP.md        ← Cron job setup guide
   ├── _shared/                    ← Shared TypeScript helpers
   │   ├── cors.ts
   │   ├── supabaseAdmin.ts
   │   ├── authGuards.ts
   │   ├── resend.ts
   │   ├── webpush.ts
   │   ├── llm.ts                  ← OpenAI wrapper (replaces Base44 InvokeLLM)
   │   └── credits.ts
   ├── auth/                       ← Frontend auth replacement files
   │   ├── supabaseClient.js       ← Compat shim (base44.* → supabase.*)
   │   ├── AuthContext.jsx         ← React auth context
   │   ├── Login.jsx               ← Magic link login page
   │   └── README.md
   ├── functions/                  ← 67 Supabase Edge Functions (Deno format)
   │   ├── chip-webhook/index.ts
   │   ├── ask-ai-assistant/index.ts
   │   ├── generate-ai-story/index.ts
   │   └── ... (64 more)
   ├── sql/
   │   └── setup-cron-jobs.sql     ← pg_cron config
   └── storage/
       └── README.md               ← Storage status (auto-backed up)

📂 /functions/                    ← Base44 functions (CURRENT production)
                                    Don't modify — these run on Base44.
                                    Use /supabase-backup/functions/ for migration.

📂 /pages/, /components/, /lib/   ← Frontend (works as-is dengan compat shim)
```

---

## ⚠️ Important Notes

### 🔑 Authentication Migration
- **Base44 uses token-based auth** (proprietary)
- **Supabase uses JWT-based auth** (magic link / OAuth)
- **Implication:** User lama TAK BOLEH login dengan password lama
  - Solution: Bulk magic link invite (see `docs/26_USER_PASSWORD_MIGRATION.md`)

### 🤖 LLM Migration
- **Base44 used `InvokeLLM()` integration** (auto-handled)
- **Supabase Edge Functions use OpenAI direct API** (see `_shared/llm.ts`)
- **Models:** `gpt-4o-mini` (cheap), `gpt-4o` (quality), `dall-e-3` (images)
- **Cost:** ~$0.0001-$0.05 per call

### 📦 Entity Naming Convention
Compat shim handle conversion automatic, tapi useful tahu:
```
Frontend (PascalCase)  →  Supabase table (snake_case)
─────────────────────────────────────────────────────
Game                   →  ck_games
UserSubscription       →  ck_user_subscriptions
AIStory                →  ck_ai_stories       ⚠️ (not ck_a_i_storys)
BBMResource            →  ck_bbm_resources    ⚠️ (not ck_b_b_m_resources)
QCLog                  →  ck_qc_logs          ⚠️ (not ck_q_c_logs)
```

Full map: `supabase-backup/auth/supabaseClient.js` → `ENTITY_TABLE_MAP`

### 🚫 What NOT to do
- ❌ Don't rewrite frontend components — compat shim handle Base44 SDK calls
- ❌ Don't recreate entities — `09_COMPLETE_SQL_SCHEMA.md` is canonical
- ❌ Don't change function names — frontend expects `chipCheckout` (kebab-cased to `chip-checkout` by shim)
- ❌ Don't migrate Base44 InvokeLLM calls one-by-one — use `_shared/llm.ts` wrapper
- ❌ Don't touch `/functions/` folder (Base44 production code, runs separately)

---

## 🎯 TL;DR for AI Agent

**User akan minta apa-apa daripada 3 jenis ni:**

1. **"Migrate app ke Supabase"** → Ikut Step 1️⃣ → 7️⃣ di atas. Total ~2 jam.
2. **"Add new feature X"** → Read `docs/03_PAGES_AND_FLOWS.md` + `docs/04_BACKEND_AND_AUTOMATIONS.md` dulu untuk faham architecture.
3. **"Fix bug X"** → Read relevant section dalam `docs/`, jangan refactor.

**Code dah production-ready. Mission anda: deploy, jangan re-architect.**

---

## 📞 Need More Context?

| If you need... | Read this |
|---|---|
| Business model | `docs/10_BUSINESS_LOGIC.md` |
| Pricing tiers | `docs/10_BUSINESS_LOGIC.md` |
| Email templates | `docs/17_EMAIL_TEMPLATES.md` + `docs/24_MISSING_EMAIL_TEMPLATES.md` |
| Webhook payloads | `docs/19_WEBHOOK_PAYLOADS.md` |
| All routes | `docs/20_ROUTING_TABLE.md` |
| Brand colors/fonts | `docs/21_BRAND_KIT.md` |
| Edge cases & nuance | `docs/22_CRITICAL_LOGIC_DETAILS.md` |
| Critical frontend logic | `docs/23_FRONTEND_CRITICAL_COMPONENTS.md` |

---

**Last verified:** 2026-05-30
**Migration kit version:** Phase 3 Complete (67/67 functions ready)
**Backend recovery time:** ~25 min
**Frontend recovery time:** ~30 min
**Total disaster recovery time:** ~1-2 hours