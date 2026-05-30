# 📚 CeriaKid Migration Kit

> **Complete migration & disaster recovery documentation for CeriaKid app**
> Last updated: 2026-05-30
> Maintained by: CeriaKid team

---

## 🎯 Apa itu Migration Kit?

Migration Kit ini adalah **blueprint lengkap** untuk:

1. 🚨 **Disaster Recovery** — Kalau Base44 down, rebuild app dalam 2-3 minggu
2. 🌍 **Platform Migration** — Pindah ke Lovable, Bolt, Cursor, atau platform lain
3. 👥 **Developer Onboarding** — Bagi developer baru faham app dalam 1 hari
4. 📖 **Living Documentation** — Reference untuk anda sendiri masa develop

---

## 📂 Struktur Documentation

| File | Topik | Bila guna |
|---|---|---|
| [00_README.md](./00_README.md) | Master index (file ini) | Start sini |
| [01_APP_OVERVIEW.md](./01_APP_OVERVIEW.md) | Business overview, features, tech stack | Faham app dulu |
| [02_DATABASE_SCHEMA.md](./02_DATABASE_SCHEMA.md) | 26 entities full detail | Database setup |
| [03_PAGES_AND_FLOWS.md](./03_PAGES_AND_FLOWS.md) | Semua pages + navigation + UI | Frontend rebuild |
| [04_BACKEND_AND_AUTOMATIONS.md](./04_BACKEND_AND_AUTOMATIONS.md) | 67 functions + scheduled tasks | Backend rebuild |
| [05_INTEGRATIONS.md](./05_INTEGRATIONS.md) | CHIP, Resend, Supabase, FB, AI | External services |
| [06_SUPABASE_MIGRATION.md](./06_SUPABASE_MIGRATION.md) | Base44 SDK → Supabase translation | Code migration |
| [07_RECOVERY_PLAYBOOK.md](./07_RECOVERY_PLAYBOOK.md) | Disaster recovery step-by-step | EMERGENCY |
| [08_SECRETS_AND_ENV.md](./08_SECRETS_AND_ENV.md) | All keys & env vars checklist | Setup secrets |
| [09_COMPLETE_SQL_SCHEMA.md](./09_COMPLETE_SQL_SCHEMA.md) | **Full SQL — copy-paste ready** | DB setup (5 min) |
| [10_BUSINESS_LOGIC.md](./10_BUSINESS_LOGIC.md) | Tier limits, pricing, commissions | Business rules |
| [11_PACKAGE_AND_DEPENDENCIES.md](./11_PACKAGE_AND_DEPENDENCIES.md) | package.json + setup commands | Project init |
| [12_ASSETS_BACKUP.md](./12_ASSETS_BACKUP.md) | **Image backup → Supabase Storage** | Asset migration (CRITICAL) |
| [13_AUTOMATIONS_INVENTORY.md](./13_AUTOMATIONS_INVENTORY.md) | **All scheduled tasks + cron config** | Recreate automations |
| [14_MIGRATION_CHECKLIST.md](./14_MIGRATION_CHECKLIST.md) | **Step-by-step migration checklist** | Migration day playbook |
| [15_AUTH_FLOW.md](./15_AUTH_FLOW.md) | **Auth migration: Base44 → Supabase Auth** | Auth setup (CRITICAL) |
| [16_API_CONTRACTS.md](./16_API_CONTRACTS.md) | **Top 15 functions — input/output specs** | Backend rebuild reference |
| [17_EMAIL_TEMPLATES.md](./17_EMAIL_TEMPLATES.md) | **6 email templates + Resend setup** | Email migration |
| [18_ASSET_MAPPING_GUIDE.md](./18_ASSET_MAPPING_GUIDE.md) | **URL mapping: Base44 → Supabase Storage** | Asset URL swap |

---

## 🚀 Quick Start — Bila nak migrate?

### Scenario A: Base44 still working, plan migration
```
1. Baca: 01_APP_OVERVIEW.md → faham apa nak migrate
2. Baca: 06_SUPABASE_MIGRATION.md → pelajari translation pattern
3. Baca: 07_RECOVERY_PLAYBOOK.md → ikut steps
4. Setup: 08_SECRETS_AND_ENV.md → siapkan semua keys
5. Execute: rebuild ikut 03 + 04
```

### Scenario B: 🚨 Base44 DOWN — EMERGENCY
```
1. Baca: 07_RECOVERY_PLAYBOOK.md (TERUS!)
2. Reference: 02_DATABASE_SCHEMA.md untuk schema
3. Reference: 04_BACKEND_AND_AUTOMATIONS.md untuk recreate functions
4. Connect: 05_INTEGRATIONS.md untuk hook up CHIP, Resend, dll
```

### Scenario C: Bagi AI builder (Lovable/Bolt) build clone
```
Prompt template:
"Build a clone of CeriaKid based on these docs.
Database is at Supabase (URL in 08_SECRETS_AND_ENV.md).
Read all docs in this folder in order (00 → 08).
Tech stack: React + Vite + Tailwind + Supabase."
```

---

## 🏗️ Tech Stack Overview

```
Frontend:
  ✅ React 18 + Vite
  ✅ Tailwind CSS + shadcn/ui
  ✅ Framer Motion (animations)
  ✅ React Router v6
  ✅ TanStack Query
  ✅ React Hook Form

Backend (Current — Base44):
  ✅ Base44 SDK
  ✅ Base44 Entities (database)
  ✅ Base44 Functions (Deno serverless)
  ✅ Base44 Auth (email-based)
  ✅ Base44 Integrations (InvokeLLM, UploadFile, etc.)

Backend (Migration Target — Supabase):
  ✅ Supabase Database (PostgreSQL)
  ✅ Supabase Edge Functions (Deno)
  ✅ Supabase Auth
  ✅ Supabase Storage

External Services:
  ✅ CHIP (Payment Gateway — Malaysia)
  ✅ Resend (Transactional Email)
  ✅ Facebook Pixel + Conversions API
  ✅ Web Push (VAPID for notifications)
  ✅ OpenAI / Anthropic (via Base44 InvokeLLM)
```

---

## 📊 App Scale (Stats)

```
📦 Entities (Tables):     26
📄 Pages:                 ~60+
🧩 Components:            ~200+
⚙️  Backend Functions:    67
🌍 Languages:             2 (BM + EN)
👥 Age Groups:            3 (Prasekolah, Sekolah Rendah, KAFA)
🎮 Games:                 1000+ (across all categories)
🤖 AI Cikgu (Agents):     4 (Firdaus, Rosie, Mira, Daniel)
💳 Payment Tiers:         5 (Free, Asas, Standard, Keluarga, Premium, Pro)
```

---

## 🔐 Security Notes

### ✅ Boleh dalam GitHub repo (public/private):
- Schema documentation
- Function descriptions
- Connection patterns
- Supabase URL
- Anon keys (limited by RLS)

### ❌ JANGAN paste dalam GitHub:
- Service keys (SUPABASE_SERVICE_KEY)
- CHIP secrets (CHIP_SECRET_KEY)
- Resend API key
- Facebook access token

> Simpan private secrets dalam **1Password / Bitwarden** atau email sendiri.
> Lihat `08_SECRETS_AND_ENV.md` untuk full checklist.

---

## 🔄 Auto-Update Strategy

This Migration Kit auto-syncs to GitHub setiap kali code di-update di Base44 (via GitHub sync).

**Verify last sync:**
```bash
git log --oneline -5
```

---

## 📞 Support & Resources

- **Base44 Dashboard:** https://app.base44.com
- **Supabase Dashboard:** https://app.supabase.com
- **CHIP Dashboard:** https://dashboard.chip-in.asia
- **Resend Dashboard:** https://resend.com/emails
- **GitHub Repo:** (your repo URL)

---

## 🎓 How to Read This Kit

**Order yang disyorkan:**

1. ✅ Start: `00_README.md` (file ini)
2. ✅ Context: `01_APP_OVERVIEW.md`
3. ✅ Data: `02_DATABASE_SCHEMA.md`
4. ✅ UI: `03_PAGES_AND_FLOWS.md`
5. ✅ Logic: `04_BACKEND_AND_AUTOMATIONS.md`
6. ✅ External: `05_INTEGRATIONS.md`
7. ✅ Migration: `06_SUPABASE_MIGRATION.md`
8. ✅ Emergency: `07_RECOVERY_PLAYBOOK.md`
9. ✅ Config: `08_SECRETS_AND_ENV.md`

**Estimated reading time:** 2-3 jam (full)
**Quick reference time:** 15-30 minit per topic

---

> 💡 **Pro tip:** Bila AI builder baca docs ni, dia akan auto-faham architecture. Bagi link folder `/docs` dan dia akan ikut blueprint.