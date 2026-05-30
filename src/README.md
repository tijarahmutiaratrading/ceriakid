# 🎓 CeriaKid — Interactive Learning App for Malaysian Kids

> Production app: **200+ educational games, AI tutors, KAFA syllabus, parent dashboard, affiliate program.**
> Tech: React + Vite + Tailwind + Supabase + CHIP Payment + OpenAI

---

## 🤖 AI Coding Agents — READ THIS FIRST

> **Codex / Claude / Cursor / Lovable / Bolt — start here:**
>
> 👉 **[`AI_AGENT_README.md`](./AI_AGENT_README.md)** ← Complete recovery + migration playbook

That file contains:
- ✅ Step-by-step Supabase migration (7 steps, ~2 hours total)
- ✅ Where every artifact lives (docs, edge functions, SQL, auth)
- ✅ What NOT to do (avoid wasted refactoring)
- ✅ Entity name mapping, LLM migration, auth migration

---

## 📁 Repo Map

```
📦 CeriaKid
├── 🤖 AI_AGENT_README.md      ← START HERE for AI agents
├── 📚 docs/                    ← 28 architecture docs (read 00_README.md first)
├── 🚀 supabase-backup/         ← Production-ready Supabase migration kit
│   ├── functions/              ← 67 Edge Functions (Deno, ready to deploy)
│   ├── _shared/                ← Reusable helpers (auth, CORS, LLM, credits)
│   ├── auth/                   ← Frontend Supabase auth + compat shim
│   ├── sql/                    ← pg_cron setup
│   ├── storage/                ← Storage status (auto-backed up)
│   └── deploy.sh               ← One-command deploy script
├── 📄 pages/                   ← React pages (~60+)
├── 🧩 components/              ← React components (~200+)
├── 📚 lib/                     ← Utilities + contexts
├── ⚙️  functions/              ← Current Base44 backend (67 functions)
├── 🗄️  entities/               ← Base44 entity schemas (26 entities)
└── 🤖 agents/                  ← AI agent configs
```

---

## 🚀 Quick Start

### For New Developers
```bash
# 1. Clone repo
git clone <repo-url>
cd ceriakid

# 2. Install
npm install

# 3. Run dev
npm run dev
```

### For Disaster Recovery (Base44 → Supabase)
👉 See [`AI_AGENT_README.md`](./AI_AGENT_README.md)

### For Documentation Deep Dive
👉 See [`docs/00_README.md`](./docs/00_README.md)

---

## 🎯 What This App Does

| Feature | Detail |
|---|---|
| 🎮 **Games** | 200+ interactive learning games (BM, EN, Math, Science, Jawi, KAFA) |
| 👶 **Ages** | Prasekolah (4-6), Sekolah Rendah (Darjah 1-6), KAFA (UPKK syllabus) |
| 🤖 **AI Tutors** | 4 Cikgu AI agents (Firdaus, Rosie, Mira, Daniel) |
| 📚 **AI Generators** | Story Generator, BBM Generator, Quiz AI |
| 💳 **Payments** | CHIP gateway — Asas (RM49), Standard (RM99), Keluarga (RM199) |
| 💰 **Credits** | Top-up system for AI features |
| 👨‍👩‍👧 **Multi-child** | Parents manage multiple children profiles |
| 📊 **Parent Dashboard** | Progress tracking, insights, recommendations |
| 🤝 **Affiliate** | 4-tier commission system (Bronze → Platinum) |
| 📱 **PWA** | Mobile-friendly, offline-capable |

---

## 🏗️ Tech Stack

```
Frontend
├── React 18 + Vite
├── Tailwind CSS + shadcn/ui
├── Framer Motion
├── React Router v6
├── TanStack Query
└── Web Push API

Backend (Production: Base44)
├── Base44 SDK (auth + entities)
├── 67 Deno serverless functions
└── 9 scheduled automations

Backend (Migration Target: Supabase)
├── Supabase Auth (JWT, magic link)
├── Supabase Database (PostgreSQL)
├── Supabase Edge Functions (Deno)
├── Supabase Storage
└── pg_cron (scheduled jobs)

External
├── CHIP (Payment — Malaysia)
├── Resend (Transactional email)
├── Facebook Pixel + Conversions API
├── OpenAI (GPT-4o, DALL-E 3)
└── Web Push (VAPID)
```

---

## 📊 Scale

```
📦 Entities:              26 tables
📄 Pages:                 ~60
🧩 Components:            ~200
⚙️  Backend Functions:    67
🌍 Languages:             2 (BM + EN)
👥 Age Groups:            3 (Prasekolah, Sekolah Rendah, KAFA)
🎮 Games:                 1000+
🤖 AI Agents:             4
💳 Payment Tiers:         5 (Free, Asas, Standard, Keluarga, Premium)
```

---

## 🔒 Security

- ✅ HMAC SHA-256 webhook signature verification (CHIP)
- ✅ Row-Level Security (RLS) policies
- ✅ Service role separation (admin vs user)
- ✅ JWT-based auth with auto-refresh
- ✅ Idempotency checks on all payment webhooks
- ✅ Rate limiting on checkout endpoints
- ✅ Admin-only endpoints with role verification

---

## 📞 External Dashboards

- **Base44:** https://app.base44.com (current production)
- **Supabase:** https://app.supabase.com (database + migration target)
- **CHIP:** https://dashboard.chip-in.asia (payments)
- **Resend:** https://resend.com/emails (transactional email)
- **Facebook Business:** https://business.facebook.com (ads + tracking)

---

## 📖 Documentation

**Master index:** [`docs/00_README.md`](./docs/00_README.md)

**By scenario:**
- 🚨 Emergency recovery → [`docs/07_RECOVERY_PLAYBOOK.md`](./docs/07_RECOVERY_PLAYBOOK.md)
- 🌍 Platform migration → [`docs/06_SUPABASE_MIGRATION.md`](./docs/06_SUPABASE_MIGRATION.md)
- 👥 Developer onboarding → [`docs/01_APP_OVERVIEW.md`](./docs/01_APP_OVERVIEW.md)
- 🤖 AI agent handoff → [`AI_AGENT_README.md`](./AI_AGENT_README.md)

---

## 🔄 Auto-Sync

This repo auto-syncs from Base44 every code change (via Base44 GitHub sync).
Last sync: see `git log -1`.

---

**Version:** Production 2026-05-30
**Migration Kit Status:** ✅ Complete (Phase 3 — 67/67 functions ready for Supabase)
**Disaster Recovery Time:** ~1-2 hours with [`AI_AGENT_README.md`](./AI_AGENT_README.md)