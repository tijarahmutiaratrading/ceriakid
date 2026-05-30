# 📱 CeriaKid — App Overview

> Complete business & technical overview of CeriaKid platform.

---

## 🎯 What is CeriaKid?

**CeriaKid** is a Malaysian educational gaming platform untuk kanak-kanak umur 4-12 tahun. Combine interactive games, AI tutors, dan curriculum-aligned content untuk Prasekolah, Sekolah Rendah, dan KAFA (Kelas Agama Fardhu Ain).

**Tagline:** "Belajar sambil bermain — platform pendidikan anak Malaysia"

**Target users:**
- 👨‍👩‍👧 Parents Malaysia (umur 25-45)
- 👶 Anak-anak Prasekolah (4-6 tahun)
- 🎒 Anak-anak Sekolah Rendah (7-12 tahun, Darjah 1-6)
- 🕌 Pelajar KAFA (kelas agama)

**Language:** Bahasa Melayu (primary) + English (secondary)

---

## 💼 Business Model

### Subscription Tiers:

| Tier | Price (MYR/month) | Features |
|---|---|---|
| **Free** | RM0 | Limited games, no AI |
| **Asas** | RM9.90 | More games, basic AI access |
| **Standard** | RM19.90 | Full games + AI Tutor |
| **Keluarga** | RM29.90 | Family plan (5 children) |
| **Premium** | RM49.90 | Unlimited everything |
| **Pro** | RM99.90 | + Affiliate features |

### Revenue Streams:
1. ✅ Monthly/yearly subscriptions (CHIP payment)
2. ✅ AI Credit packs (top-up untuk heavy users)
3. ✅ Affiliate program (referral commissions)

### Payment Gateway:
- **CHIP** (Malaysian gateway — supports FPX, cards, e-wallets)

---

## 🎮 Core Features

### 1. **Educational Games** 🎯
Game library besar dengan multiple categories:

#### Prasekolah (Umur 4-6):
- Bahasa Melayu, English, Mathematics, Science
- Jawi, Bahasa Tamil, Bahasa Mandarin
- Worksheets (printable)

#### Sekolah Rendah (Darjah 1-6):
- 7 subjek: BM, English, Math, Science, Jawi, Tamil, Mandarin
- KSSR-aligned content
- Difficulty progression

#### KAFA (Kelas Agama):
- 7 subjek UPKK rasmi JAKIM:
  - Al-Quran, Jawi, Akidah, Ibadah, Sirah, Adab, Bahasa Arab
- Darjah 1-6

#### Mini Games (Brain Training):
- Memory Master, Logic Puzzles, Speed & Focus
- Pattern Genius, Maze Adventure
- Creative Builder, Problem Solver, Brain Training

#### Game Mechanics:
- Letter Match, Number Match, Picture Quiz
- Drag & Drop, Multiple Choice, Counting
- Word Builder, Math Puzzle, Tracing
- Story Adventure, Physics, Memory Game

---

### 2. **AI Cikgu System** 🤖

4 AI agents berbeza persona:

| Cikgu | Role | Feature |
|---|---|---|
| 🧔 **Cikgu Firdaus** | AI Tutor | Conversational learning assistant |
| 👩 **Cikgu Rosie** | Quiz Master | AI-generated quiz questions |
| 👩‍🏫 **Cikgu Mira** | Story Teller | Custom story generation (with images) |
| 👨‍🏫 **Cikgu Daniel** | BBM Creator | Printable teaching materials (PDF) |

**Credit System:**
- Each AI call costs credits
- Users buy credit packs OR get monthly allocation by tier
- Tracked via `UserCredit` + `CreditTransaction` entities

---

### 3. **Family Management** 👨‍👩‍👧‍👦
- Multiple child profiles per account
- Per-child progress tracking
- Age group selection (Prasekolah / Sekolah Rendah)
- Avatar customization (Pixar-style presets)
- Parent dashboard dengan analytics

---

### 4. **Gamification** 🏆
- Stars per game (0-3 stars)
- Streak tracking (daily plays)
- Achievements/badges
- Leaderboard (per family + global)
- Daily challenges
- Friend system + 1-on-1 challenges

---

### 5. **Drawing Studio** 🎨
- Canvas-based drawing
- Tracing exercises
- Save artwork to gallery

---

### 6. **Story Kid** 📖
- Pre-made interactive stories
- AI-generated custom stories (via Cikgu Mira)
- Audio narration (Text-to-Speech)

---

### 7. **Affiliate Program** 💰
- Users boleh refer kawan
- Commission system (tiered)
- Bank payout (manual approval)
- Tracking via referral codes

---

### 8. **Notifications** 🔔
- Push notifications (web push via VAPID)
- Email notifications (via Resend):
  - Welcome email
  - Abandoned cart reminder
  - Subscription expiry reminder
  - Low credit reminder
  - Streak reminder
  - Weekly progress report

---

### 9. **Offline Mode** 📴
- PWA (Progressive Web App)
- Service worker untuk caching
- Offline game playing
- Auto-sync bila online

---

### 10. **Admin Dashboard** ⚙️
- Game management (CRUD)
- User management
- Affiliate approval
- Push notification broadcaster
- Analytics & reports
- AI generator (bulk game creation)
- Quality Control system (audit + repair games)
- System health monitoring

---

## 🏗️ Tech Architecture

### Frontend:
```
React 18 + Vite (build tool)
├── React Router v6 (routing)
├── Tailwind CSS + shadcn/ui (styling)
├── Framer Motion (animations)
├── TanStack Query (data fetching)
├── React Hook Form (forms)
├── Lucide React (icons)
└── Three.js (3D games — physics, tracing)
```

### Backend (Current — Base44):
```
Base44 Platform
├── Entities (PostgreSQL-like data store)
├── Functions (Deno serverless)
├── Auth (email + OTP)
├── Integrations:
│   ├── InvokeLLM (AI generation)
│   ├── UploadFile (storage)
│   ├── GenerateImage (AI images)
│   ├── SendEmail (transactional)
│   └── ExtractDataFromUploadedFile
└── Automations (cron + entity hooks)
```

### Backend Mirror (Insurance — Supabase):
```
Supabase
├── PostgreSQL (26 ck_* tables)
├── Auto-synced from Base44 via syncToSupabase function
├── Read-only currently (no writes from frontend)
└── Can be activated as primary DB if migration needed
```

### External Services:
```
✅ CHIP (Payment Gateway)
   └── Webhook: chipWebhook function
✅ Resend (Email)
   └── Function: sendResendEmail
✅ Facebook Pixel + CAPI (Marketing)
   └── Function: fbConversionsAPI
✅ Web Push (Notifications)
   └── VAPID keys + sendPushNotification function
✅ OpenAI/Anthropic (AI)
   └── Via Base44 InvokeLLM integration
```

---

## 📊 Database Architecture

**26 entities (tables):**

### User & Auth:
- `User` (built-in Base44)
- `UserSubscription`
- `UserCredit`
- `RegisteredDevice`

### Content:
- `Game`
- `BBMResource`
- `AIStory`
- `QuizHistory`
- `ChatConversation`

### Progress & Gamification:
- `ChildGameProgress`
- `Leaderboard`
- `Achievement`
- `DailyChallenge`
- `Friend`
- `FriendChallenge`

### Admin/System:
- `GameTask`
- `QCLog`
- `QCSetting`
- `MonthlyGenSetting`
- `HealthCheckLog`

### Affiliate:
- `Affiliate`
- `AffiliateReferral`
- `AffiliatePayout`

### Operations:
- `CreditTransaction`
- `PushSubscription`

> Full schema details: `02_DATABASE_SCHEMA.md`

---

## 🎨 Design System

### Theme: "Pastel Candy"
- Primary: Purple (#a855f7)
- Secondary: Pink (#f472b6)
- Accent: Yellow, Blue, Green, Orange
- Background: Pastel purple gradient

### Typography:
- Font family: **Nunito** (300-900 weights)
- Display: Bold, playful
- Body: Comfortable, readable

### UI Style:
- "Claymorphism" (3D soft shadows)
- Rounded corners (radius: 1.25rem default)
- Pastel gradients
- Mobile-first responsive

### Layout:
- Mobile: Drawer navigation (custom AppHeader)
- Desktop: Sidebar navigation
- Top header bar (sticky, scroll-aware)

---

## 📱 Platforms Supported

- ✅ Web (desktop + mobile browsers)
- ✅ PWA (installable on iOS/Android)
- ⏳ Native mobile (planned, via Capacitor)

---

## 🌍 Multi-Language Support

- **Bahasa Melayu** (primary)
- **English** (secondary)
- Toggle via `LanguageContext`
- Strings di `lib/i18n.js`

---

## 🎯 Key User Flows

### New User Onboarding:
```
Landing → Sign up → Onboarding Wizard (3 steps)
→ Add first child → Select age group → Pick interests
→ Dashboard
```

### Game Play:
```
Dashboard → Games Hub OR Games Subjek
→ Pick category → Pick game → Play
→ Earn stars → See score → Continue/Exit
```

### AI Tutor (Cikgu Firdaus):
```
Dashboard → Cikgu AI → Firdaus
→ Pick subject + level → Chat
→ Credits deducted → AI responds
```

### Payment:
```
Settings → Choose tier → CHIP checkout
→ Pay via FPX/Card → Webhook updates subscription
→ Welcome email sent
```

---

## 📈 Growth Features (Built-in)

- ✅ Affiliate referral program
- ✅ Daily challenges (engagement)
- ✅ Streak system (retention)
- ✅ Friend invites (viral loops)
- ✅ Weekly progress emails (parent engagement)
- ✅ Abandoned cart recovery
- ✅ Free trial → paid conversion

---

## 🔥 Unique Selling Points

1. ✅ **Malaysian curriculum** (KSSR + UPKK aligned)
2. ✅ **KAFA section** (rare in market)
3. ✅ **AI Cikgu** with Malay persona
4. ✅ **Family-friendly pricing** (Keluarga tier)
5. ✅ **Offline-first** (works without internet)
6. ✅ **Multi-language** (BM/EN)
7. ✅ **Affiliate program** (community-driven growth)

---

## 📞 Contact & Resources

- **Production URL:** https://ceriakid.base44.app (or custom domain)
- **Admin Email:** (your admin email)
- **Support:** Via Contact page

---

> Next: Read `02_DATABASE_SCHEMA.md` untuk database details.