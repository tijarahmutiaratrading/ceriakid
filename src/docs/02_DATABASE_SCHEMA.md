# 🗄️ Database Schema — Full Reference

> 26 entities (tables) yang power CeriaKid. Complete field-by-field documentation.

---

## 📋 Quick Reference

| Entity | Purpose | Records (estimate) |
|---|---|---|
| `User` | User accounts | ~hundreds-thousands |
| `UserSubscription` | Tier subscriptions | per user |
| `UserCredit` | AI credit balance | per user |
| `CreditTransaction` | Credit history log | high volume |
| `RegisteredDevice` | Device tracking | per user × devices |
| `Game` | Game library | 1000+ |
| `BBMResource` | Teaching materials | hundreds |
| `AIStory` | Generated stories | per user × stories |
| `QuizHistory` | Quiz attempts | high volume |
| `ChatConversation` | AI chat history | per user × chats |
| `ChildGameProgress` | Per-child progress | per child × games |
| `Leaderboard` | Family rankings | per child |
| `Achievement` | Unlocked badges | per user × badges |
| `DailyChallenge` | Daily game of the day | 1 per day |
| `Friend` | Friend connections | per user × friends |
| `FriendChallenge` | 1-on-1 game challenges | per challenge |
| `GameTask` | AI generation tasks | admin only |
| `QCLog` | Quality control runs | admin only |
| `QCSetting` | QC config | 1 record |
| `MonthlyGenSetting` | Monthly gen config | 1 record |
| `HealthCheckLog` | System health checks | admin only |
| `Affiliate` | Affiliate registrations | hundreds |
| `AffiliateReferral` | Referral tracking | per referral |
| `AffiliatePayout` | Payout requests | per request |
| `PushSubscription` | Web push tokens | per device |

---

## 🔑 Built-in Fields (semua entity)

Setiap entity Base44 auto-include:

```
id           : string (UUID)
created_date : ISO datetime
updated_date : ISO datetime
created_by   : string (email of creator)
```

**Untuk Supabase migration:** Auto-generate columns ini:
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW(),
created_by TEXT
```

---

## 👤 1. User (Built-in)

**Purpose:** User authentication & profile

```typescript
{
  // Read-only (Base44 auto)
  id: string,
  full_name: string,
  email: string,
  
  // Editable
  role: "admin" | "user",
  
  // Custom fields (added)
  avatarUrl?: string,
  phone?: string,
  // ... whatever custom fields
}
```

**Special rules:**
- Only admins can list/update/delete other users
- Regular users see only own record
- Cannot insert via API (invite-only)

**Supabase equivalent:**
- Use Supabase Auth `auth.users` table
- Add `public.profiles` table for custom fields (FK to auth.users.id)

---

## 💳 2. UserSubscription

**Purpose:** Track subscription tier per user

```typescript
{
  email: string,              // REQUIRED
  tier: "free" | "asas" | "standard" | "keluarga" | "premium" | "pro",
  status: "active" | "canceled" | "past_due" | "incomplete" | "trial",
  
  // Checkout details
  checkoutName?: string,
  checkoutPhone?: string,
  
  // Payment provider IDs
  stripeCustomerId?: string,  // Actually CHIP purchase/customer ID
  stripeSubscriptionId?: string,
  
  // Billing period
  currentPeriodStart?: datetime,
  currentPeriodEnd?: datetime,
  
  // App state
  selectedAgeGroup: "prasekolah" | "sekolah_rendah",
  children: [
    {
      id: number,
      name: string,
      ageGroup: string,
      createdAt: string,
    }
  ],
  
  // Reminder tracking
  sentReminders: string[],    // e.g. ["day_30", "day_14", "day_7"]
  
  // Marketing
  fbTracking: object,         // FB Pixel data for CAPI dedup
  
  // Abandoned cart
  abandonedReminderSent: boolean,
  abandonedReminderStatus: "not_sent" | "sent" | "delivered" | "failed" | "recovered",
  abandonedReminderSentAt: datetime,
  abandonedReminderMessageId: string,
  abandonedReminderError: string,
  recoveredAt: datetime,
}
```

**Key relationships:**
- 1 User → 1 UserSubscription (lookup by `email`)
- Children array embedded (not separate table)

---

## 💰 3. UserCredit

**Purpose:** AI credit balance per user

```typescript
{
  userEmail: string,          // REQUIRED
  balance: number,            // Current balance
  totalPurchased: number,     // Lifetime purchased
  totalUsed: number,          // Lifetime used
  lastTopUpAt?: datetime,
  lastUsedAt?: datetime,
}
```

---

## 📊 4. CreditTransaction

**Purpose:** Audit log for all credit movements

```typescript
{
  userEmail: string,          // REQUIRED
  type: "purchase" | "usage" | "refund" | "bonus" | "admin_adjustment",
  amount: number,             // Positive add, negative subtract
  balanceAfter: number,
  feature: "ai_assistant" | "story_generator" | "bbm_generator" | "top_up" | "bonus" | "refund" | "admin",
  description?: string,
  referenceId?: string,       // Payment ID or AI request ID
  metadata?: object,          // Model used, tokens, etc.
}
```

---

## 📱 5. RegisteredDevice

**Purpose:** Track which devices user logged in from

```typescript
{
  userEmail: string,          // REQUIRED
  deviceId: string,           // Unique fingerprint
  deviceName: string,         // e.g. "Chrome on Windows"
  lastSeen?: datetime,
  isCurrentDevice: boolean,
}
```

**Use case:** Multi-device limit enforcement (Premium = unlimited devices, lower tiers = 2-3 devices)

---

## 🎮 6. Game

**Purpose:** Game library (curriculum + AI-generated)

```typescript
{
  title: string,              // REQUIRED
  description: string,
  
  // Game mechanics
  type: "letter_match" | "number_match" | "picture_quiz" | "drag_drop"
      | "multiple_choice" | "counting" | "word_builder" | "math_puzzle"
      | "science_quiz" | "shape_sort" | "color_match" | "pattern_fill"
      | "memory_game" | "sound_match" | "spelling" | "reading"
      | "phonics" | "sorting" | "tile_match" | "story_adventure"
      | "physics" | "tracing",
  
  // Category (subject)
  category: "bahasa_melayu" | "english" | "mathematics" | "science" | "general"
          | "jawi" | "bahasa_tamil" | "bahasa_mandarin"
          // Mini games
          | "memory_master" | "logic_puzzles" | "speed_focus"
          | "pattern_genius" | "maze_adventure" | "creative_builder"
          | "problem_solver" | "brain_training"
          // KAFA (UPKK syllabus)
          | "kafa_quran" | "kafa_jawi" | "kafa_akidah" | "kafa_ibadah"
          | "kafa_sirah" | "kafa_adab" | "kafa_bahasa_arab",
  
  ageGroup: "prasekolah" | "sekolah_rendah",
  darjah?: "darjah_1" | "darjah_2" | "darjah_3" | "darjah_4" | "darjah_5" | "darjah_6",
  
  difficulty: "easy" | "medium" | "hard",
  tier: "free" | "premium" | "pro",
  
  emoji?: string,
  totalQuestions: number,     // Default 8
  
  gameData: object,           // Questions, options (structured per game type)
  
  isPublished: boolean,
  status: "ready" | "in_progress" | "not_ready",
  order?: number,
  monthTag?: string,          // "2026-05" for monthly rotation
}
```

**Critical field: `gameData` structure varies by `type`. Examples:**

```javascript
// Multiple choice
gameData: {
  questions: [
    {
      question: "...",
      options: ["A", "B", "C", "D"],
      correctIndex: 0,
      explanation: "..."
    }
  ]
}

// Drag drop
gameData: {
  items: [...],
  targets: [...]
}

// Tracing
gameData: {
  letter: "A",
  path: "M..."  // SVG path
}
```

---

## 📚 7. BBMResource (Bahan Bantu Mengajar)

**Purpose:** Teaching materials (worksheets, flashcards, etc.)

```typescript
{
  title: string,              // REQUIRED
  description?: string,
  
  subject: "bahasa_melayu" | "english" | "mathematics" | "science" | "jawi"
         | "bahasa_tamil" | "bahasa_mandarin" | "pendidikan_islam"
         | "pendidikan_moral" | "sejarah" | "rbt" | "pjk" | "seni"
         | "kafa_quran" | "kafa_jawi" | "kafa_akidah" | "kafa_ibadah"
         | "kafa_sirah" | "kafa_adab" | "kafa_bahasa_arab",
  
  level: "prasekolah" | "darjah_1" ... "darjah_6",
  
  type: "lembaran_kerja" | "kad_imbasan" | "carta" | "slaid_powerpoint"
      | "rancangan_pengajaran" | "modul" | "kuiz" | "aktiviti"
      | "permainan_bilik_darjah" | "poster_pendidikan" | "nota_ringkas"
      | "infografik" | "latihan_pemahaman" | "latihan_peperiksaan"
      | "bahan_pbd" | "aktiviti_stem" | "mind_map" | "latihan_kbat"
      | "roleplay" | "eksperimen_sains" | "spelling_activity"
      | "vocabulary_builder" | "karangan_builder" | "teaching_kit",
  
  fileUrl?: string,           // PDF, PPT URL
  htmlContent?: string,       // AI-generated HTML (printable)
  previewImageUrl?: string,
  emoji?: string,
  tags?: string[],
  
  tier: "free" | "premium",
  downloadCount: number,
  isPublished: boolean,
  order?: number,
}
```

---

## 📖 8. AIStory

**Purpose:** AI-generated children's stories

```typescript
{
  title: string,              // REQUIRED
  emoji?: string,
  coverImage?: string,        // Pixar 3D style URL
  story: string,              // Full markdown content
  moralSummary?: string,
  theme?: string,
  childName?: string,         // Main character name
  ageRange: "4-6" | "7-9" | "10-12",
  moralLesson?: string,
  length: "short" | "medium" | "long",
}
```

**Image generation:** Uses Base44 GenerateImage (Pixar 3D style prompts)

---

## ❓ 9. QuizHistory

**Purpose:** Track AI-generated quiz attempts

```typescript
{
  question: string,           // REQUIRED
  choices: string[],          // 4 options A-D
  correctIndex: number,       // 0-3
  userAnswerIndex?: number,
  isCorrect: boolean,
  explanation?: string,
  hint?: string,
  encouragement?: string,
  emoji?: string,             // Default "❓"
  subject: string,            // bahasa_melayu, mathematics, etc.
  level: string,              // prasekolah, darjah_1, etc.
  difficulty: "easy" | "medium" | "hard",
  topic?: string,
}
```

---

## 💬 10. ChatConversation

**Purpose:** AI Tutor (Cikgu Firdaus) chat history

```typescript
{
  title: string,              // REQUIRED — usually first user message
  agent: string,              // Default "cikgu_firdaus"
  subject?: string,
  level?: string,
  
  messages: [
    {
      role: "user" | "ai",
      content: string,
      timestamp: datetime,
    }
  ],
  
  messageCount: number,
  lastMessageAt?: datetime,
}
```

---

## 🎯 11. ChildGameProgress

**Purpose:** Per-child game performance tracking

```typescript
{
  userEmail: string,          // REQUIRED (parent)
  childName: string,          // REQUIRED
  gameType: string,           // REQUIRED — "prasekolah-bahasa_melayu-0"
  category: string,
  ageGroup: "prasekolah" | "sekolah_rendah",
  
  // Last attempt
  lastScore?: number,
  lastTotal?: number,
  lastStars?: number,         // 0-3
  
  // Stats
  timesPlayed: number,
  bestScore?: number,
  bestStars?: number,
  lastPlayedDate?: datetime,
  
  playHistory: [
    {
      date: string,
      score: number,
      stars: number,
    }
  ],  // Last 10 attempts
}
```

---

## 🏆 12. Leaderboard

**Purpose:** Family/child rankings

```typescript
{
  userEmail: string,          // REQUIRED
  childName: string,          // REQUIRED
  ageGroup: "prasekolah" | "sekolah_rendah",
  totalStars: number,
  gamesCompleted: number,
  currentStreak: number,      // Daily streak
  lastPlayedDate?: datetime,
}
```

---

## 🎖️ 13. Achievement

**Purpose:** Unlocked badges per user

```typescript
{
  userEmail: string,          // REQUIRED
  badgeId: "5_games" | "10_games" | "3_day_streak" | "perfect_8" | "100_stars" | "all_subjects",
  badgeName: string,
  badgeEmoji: string,
  unlockedDate?: datetime,
}
```

---

## 🌅 14. DailyChallenge

**Purpose:** Daily featured game

```typescript
{
  challengeDate: date,        // REQUIRED — "YYYY-MM-DD"
  gameCategory: string,
  gameIndex: number,
  bonusReward: number,        // Default 50 points
  ageGroup: "prasekolah" | "sekolah_rendah",
}
```

---

## 👥 15. Friend

**Purpose:** Friend connections

```typescript
{
  userEmail: string,          // REQUIRED (sender)
  friendEmail: string,        // REQUIRED
  status: "pending" | "accepted",
  inviteCode: string,         // REQUIRED — 6-char share code
  acceptedDate?: datetime,
}
```

---

## ⚔️ 16. FriendChallenge

**Purpose:** 1-on-1 game challenges

```typescript
{
  challengeId: string,        // REQUIRED — unique
  createdBy: string,          // REQUIRED — email
  opponent: string,           // REQUIRED — friend's email
  gameCategory: string,       // REQUIRED
  status: "pending" | "active" | "completed",
  creatorScore: number,
  opponentScore: number,
  dueDate?: datetime,         // 7 days
  winnerEmail?: string,
}
```

---

## 🛠️ 17. GameTask (Admin)

**Purpose:** Track AI game generation tasks

```typescript
{
  taskName: string,           // REQUIRED
  ageGroup: string,           // REQUIRED
  darjah?: "darjah_1" ... "darjah_6",
  subject: string,            // REQUIRED
  gamesCount: number,         // REQUIRED
  questionsPerGame: number,   // REQUIRED
  status: "pending" | "running" | "completed" | "failed",
  createdGames: number,
  errorMessage?: string,
  startedAt?: datetime,
  completedAt?: datetime,
}
```

---

## 🔍 18. QCLog (Quality Control)

**Purpose:** Track QC audits & repairs

```typescript
{
  runAt: datetime,            // REQUIRED
  action: "audit" | "repair" | "auto_audit" | "auto_repair",
  status: string,             // REQUIRED
  score?: number,             // Quality %
  total?: number,
  passed?: number,
  failed?: number,
  deletedCount: number,
  replacementTasks: number,
  activeTasks: number,
  message?: string,
  sampleIssues?: object[],
}
```

---

## ⚙️ 19. QCSetting

**Purpose:** Quality Control configuration (1 record)

```typescript
{
  intervalMinutes: number,    // REQUIRED — Default 10
  lastAutoRunAt?: datetime,
  subjectCap: number,         // Default 30 (max games per bucket)
  miniGameCap: number,        // Default 30
  storyKidCap: number,        // Default 30
  backgroundLaunchEnabled: boolean,
  backgroundStoryEnabled: boolean,
  autoRunLockedAt?: datetime,
  autoRunLockedBy?: string,
  autoRunCurrentBucket?: string,
}
```

---

## 📅 20. MonthlyGenSetting

**Purpose:** Monthly generation configuration

> See `entities/MonthlyGenSetting.json` for full schema

---

## ❤️ 21. HealthCheckLog

**Purpose:** System health monitoring

> See `entities/HealthCheckLog.json` for full schema

---

## 💼 22. Affiliate

**Purpose:** Affiliate program registrations

> See `entities/Affiliate.json` for full schema

Key fields:
- `userEmail`, `referralCode`, `tier`, `bankDetails`, `totalEarnings`, `pendingBalance`

---

## 🔗 23. AffiliateReferral

**Purpose:** Track referrals & commissions

> See `entities/AffiliateReferral.json` for full schema

---

## 💸 24. AffiliatePayout

**Purpose:** Payout requests

> See `entities/AffiliatePayout.json` for full schema

---

## 🔔 25. PushSubscription

**Purpose:** Web push notification tokens

```typescript
{
  userEmail: string,          // REQUIRED
  endpoint: string,           // REQUIRED — push service URL
  p256dh: string,             // REQUIRED — encryption key
  auth: string,               // REQUIRED — auth secret
  deviceLabel?: string,
  isAdmin: boolean,           // Default true (for admin notifs)
}
```

---

## 🔗 Key Relationships

```
User ─────┬─── UserSubscription (1:1)
          ├─── UserCredit (1:1)
          ├─── CreditTransaction (1:N)
          ├─── RegisteredDevice (1:N)
          ├─── ChildGameProgress (1:N)
          ├─── Leaderboard (1:N — per child)
          ├─── Achievement (1:N)
          ├─── Friend (1:N)
          ├─── PushSubscription (1:N)
          ├─── ChatConversation (1:N)
          ├─── AIStory (1:N)
          ├─── QuizHistory (1:N)
          ├─── BBMResource (1:N — created)
          ├─── Affiliate (1:1)
          └─── AffiliateReferral (1:N)

Game (standalone — no FK to users)
DailyChallenge (1 per day)
GameTask, QCLog, HealthCheckLog (admin operations)
```

---

## 🔄 Supabase Migration (SQL)

**Table naming convention:**
- Base44: `User`, `Game`, `UserSubscription`
- Supabase: `ck_users`, `ck_games`, `ck_user_subscriptions` (snake_case + `ck_` prefix)

**Example create table:**

```sql
CREATE TABLE ck_user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by TEXT,
  
  email TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  checkout_name TEXT,
  checkout_phone TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  selected_age_group TEXT DEFAULT 'prasekolah',
  children JSONB DEFAULT '[]',
  sent_reminders JSONB DEFAULT '[]',
  fb_tracking JSONB,
  abandoned_reminder_sent BOOLEAN DEFAULT false,
  abandoned_reminder_status TEXT DEFAULT 'not_sent',
  abandoned_reminder_sent_at TIMESTAMP,
  abandoned_reminder_message_id TEXT,
  abandoned_reminder_error TEXT,
  recovered_at TIMESTAMP
);

CREATE INDEX ON ck_user_subscriptions(email);
CREATE INDEX ON ck_user_subscriptions(status);
```

**Auto-sync (already running):** `syncToSupabase` function syncs all 26 entities ke Supabase tables `ck_*`.

---

## 📦 Data Volume Estimates

| Entity | Records | Growth rate |
|---|---|---|
| User | 100-10k | ↗ |
| Game | ~1000 (static) | → |
| QuizHistory | 10k+ | ↗↗ |
| ChildGameProgress | 5k+ | ↗↗ |
| CreditTransaction | 5k+ | ↗↗ |
| Others | <1k each | → |

**Storage estimate:** 100MB - 5GB depending on user growth.

---

> Next: Read `03_PAGES_AND_FLOWS.md` untuk frontend structure.