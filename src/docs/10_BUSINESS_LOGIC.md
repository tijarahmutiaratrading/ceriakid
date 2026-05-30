# 💼 Business Logic & Pricing

> Critical business rules: tier limits, credit pricing, commission rates, game costs.

---

## 💳 Subscription Tiers (Real Pricing)

> Source: `lib/tierAccess.js`

### Active Tiers (sold on Landing):

| Tier | Price MYR/month | Games | Devices | Children |
|---|---|---|---|---|
| **free** | RM 0 | 0 (must subscribe) | 0 | 0 |
| **asas** | RM 9.90 | 50 per category | 1 | 1 |
| **standard** | RM 19.90 | 100 per category | 2 | 1 |
| **keluarga** | RM 29.90 | 200 per category | 4 | 4 |

### Legacy Tiers (existing customers only — DO NOT advertise):
| Tier | Games | Devices | Children |
|---|---|---|---|
| **premium** | 100 | 2 | 1 |
| **pro** | 200 | 4 | 4 |

### Tier Logic Code:
```javascript
// lib/tierAccess.js (EXACT copy)
export const TIER_LIMITS = {
  free: { games: 0, devices: 0, children: 0 },
  asas: { games: 50, devices: 1, children: 1 },
  standard: { games: 100, devices: 2, children: 1 },
  keluarga: { games: 200, devices: 4, children: 4 },
  premium: { games: 100, devices: 2, children: 1 },
  pro: { games: 200, devices: 4, children: 4 },
};

export const getActiveTier = (subscription) => {
  const isExpired = subscription?.currentPeriodEnd 
    && new Date(subscription.currentPeriodEnd) < new Date();
  if (!subscription || isExpired) return 'free';
  if (subscription.status === 'active') return subscription.tier || 'free';
  return 'free';
};

export const hasActiveSubscription = (subscription) => {
  const tier = getActiveTier(subscription);
  return tier !== 'free';
};

export const isGameIndexLocked = ({ index, tier = 'free', isAuthenticated = false }) => {
  if (!isAuthenticated) return index >= TIER_LIMITS.asas.games;
  const limit = getTierLimit(tier, 'games');
  return Number.isFinite(limit) ? index >= limit : false;
};
```

---

## 💰 AI Credit Packages

> Source: `lib/creditPackages.js`

### Credit Packages (3 packages):

| Package | Credits | Bonus | Total | Price MYR | Per-credit | Savings |
|---|---|---|---|---|---|---|
| **🌱 Starter** | 50 | 0 | 50 | RM 19 | RM 0.38 | — |
| **⭐ Family** (popular) | 140 | 25 | 165 | RM 59 | RM 0.36 | 5% |
| **👑 Power** | 380 | 70 | 450 | RM 149 | RM 0.33 | 13% |

### Credit Costs Per Feature:

| Feature | Cost (credits) | Model Used |
|---|---|---|
| AI Assistant (Cikgu Firdaus) | 1 per soalan | gpt-4o-mini |
| Quiz AI (Cikgu Rosie) | 1 per soalan | gpt-4o-mini |
| Story Generator (Cikgu Mira) | 5 per cerita | gpt_5_4 |
| BBM Generator (Cikgu Daniel) | 8 per BBM | gpt_5_4 |

### Credit Package Code:
```javascript
// lib/creditPackages.js (EXACT copy)
export const CREDIT_PACKAGES = [
  {
    id: 'starter',
    name: 'Pek Permulaan',
    credits: 50,
    bonusCredits: 0,
    price: 1900, // sen = RM19
    emoji: '🌱',
    color: 'from-emerald-400 to-green-500',
    description: 'Sesuai untuk cuba ciri AI',
    perks: ['~50 soalan AI / Kuiz', '~10 cerita kreatif', '~6 lembaran kerja BBM'],
  },
  {
    id: 'family',
    name: 'Pek Keluarga',
    credits: 140,
    bonusCredits: 25,
    price: 5900, // RM59
    emoji: '⭐',
    color: 'from-sky-400 to-blue-500',
    description: 'Paling popular — jimat 5%',
    popular: true,
    perks: ['165 kredit (140 + 25 bonus)', '~165 soalan AI / Kuiz', '~33 cerita · ~20 BBM'],
  },
  {
    id: 'power',
    name: 'Pek Power',
    credits: 380,
    bonusCredits: 70,
    price: 14900, // RM149
    emoji: '👑',
    color: 'from-violet-400 to-purple-500',
    description: 'Nilai terbaik — jimat 13%',
    perks: ['450 kredit (380 + 70 bonus)', '~450 soalan AI / Kuiz', '~90 cerita · ~56 BBM'],
  },
];

export const CREDIT_COSTS = {
  ai_assistant: 1,
  story_generator: 5,
  bbm_generator: 8,
  quiz_ai: 1,
};
```

---

## 💼 Affiliate Commission Structure

> Source: `Affiliate` entity defaults + `lib/affiliateTiers.js`

### Affiliate Tiers:

| Tier | Lifetime Referrals | Subscription Commission | Credit Commission |
|---|---|---|---|
| **Bronze** | 0-9 | 20% | 15% |
| **Silver** | 10-49 | 25% | 17% |
| **Gold** | 50-199 | 30% | 20% |
| **Platinum** | 200+ | 35% | 25% |

### Commission Calculation:
```javascript
// On every successful purchase referred:
const commission = purchaseAmount * (commissionRate / 100);

// Example: Keluarga RM29.90, Bronze tier
// Commission = 29.90 × 0.20 = RM5.98
```

### Payout Rules:
- **Minimum payout:** RM 50
- **Payout schedule:** Manual approval by admin
- **Payment method:** Bank transfer (FPX)
- **Processing time:** 3-7 business days

### Referral Tracking Flow:
```
1. User clicks affiliate link with ?ref=ABC123
2. referralTracker.js saves to localStorage
3. On signup → ref code captured in fbTracking
4. On purchase → chipWebhook creates AffiliateReferral
5. Commission added to Affiliate.pendingBalance
6. Affiliate requests payout → AffiliatePayout created
7. Admin approves → status changes to 'completed'
```

---

## 🎮 Game Reward System

> Source: `lib/gameRewards.js` (referenced in components)

### Stars System (0-3 stars per game):
```
Stars = based on score percentage
  ≥ 90% = 3 stars (perfect-ish)
  ≥ 70% = 2 stars (good)
  ≥ 50% = 1 star (passed)
  < 50% = 0 stars (try again)
```

### Daily Streak Logic:
```
- Play any game today → streak maintained
- Miss 1 day → streak resets to 0
- Streak counted per child (Leaderboard.currentStreak)
- 3-day streak unlocks "3_day_streak" achievement
```

### Achievement Badges:
```javascript
{
  '5_games':       'Play 5 games total',
  '10_games':      'Play 10 games total',
  '3_day_streak':  '3 days in a row',
  'perfect_8':     'Get all 8 questions correct in one game',
  '100_stars':     'Earn 100 total stars',
  'all_subjects':  'Play at least 1 game in every subject',
}
```

### Daily Challenge Bonus:
- Complete daily challenge → +50 bonus points to total stars
- 1 daily challenge per age group (Prasekolah + Sekolah Rendah)

---

## 🆕 New User Welcome Gift

### On signup:
- ✅ **5 free AI credits** (try Cikgu Firdaus/Rosie)
- ✅ **Free tier** subscription active
- ⚠️ **0 game access** — must upgrade to play

### Onboarding flow:
```
1. Sign up → email OTP verification
2. Welcome email sent (via sendWelcomeEmail)
3. OnboardingWizard (3 steps):
   - Pick age group (Prasekolah / Sekolah Rendah)
   - Add first child name
   - Pick interests (subjects)
4. Redirect to Dashboard
5. Show upgrade prompt (free tier has 0 games)
```

---

## 📅 Billing Cycle

### Subscription:
- **Period:** 30 days (monthly)
- **Renewal:** Manual (CHIP doesn't auto-renew currently)
- **Reminders sent:**
  - 30 days before expiry
  - 14 days before
  - 7 days before
  - 1 day before
  - On expiry day

### Credit Packs:
- **One-time purchase** (no recurring)
- **Never expire** (credits stay forever)
- **Refund policy:** No refunds after credits used

---

## 🔄 Subscription States Lifecycle

```
[no subscription] → user signs up → status: 'active', tier: 'free'

User clicks "Subscribe" → status: 'incomplete' (chipCheckout creates this)
   ↓
CHIP payment success → status: 'active', tier set
   ↓
Period ends, no payment → status: 'past_due'
   ↓
User doesn't renew → status: 'canceled' (or tier reverts to 'free')

Special:
- Abandoned cart → 'incomplete' for >2 hours → sendAbandonedCartReminders
- Recovery → status back to 'active', recoveredAt timestamp
```

---

## 💳 Payment Provider Mapping

> Important: Code uses `stripe*` field names but ACTUAL provider is CHIP

| Field Name | Actual Meaning |
|---|---|
| `stripeCustomerId` | CHIP customer ID OR purchase ID |
| `stripeSubscriptionId` | CHIP purchase ID (for tracking) |

**Why naming mismatch?** Legacy from initial Stripe plan, switched to CHIP for Malaysian market.

**For new implementations:** Rename to `chipCustomerId`, `chipPurchaseId` for clarity.

---

## 🎯 AI Model Selection Strategy

### Cost-quality tradeoff:
```javascript
// For high-volume, low-stakes (chat, quiz):
model: 'gpt-4o-mini'  // ~$0.0001 per call

// For premium content (story, BBM):
model: 'gpt_5_4'      // ~$0.001 per call (10x cost)
```

### Why this matters:
- Quiz/chat = 1 credit cost, gpt-4o-mini = ~10x markup
- Story/BBM = 5-8 credit cost, gpt_5_4 = ~13x markup
- **Healthy margins** while staying competitive

---

## 📊 Revenue Targets (Reference)

### Conservative scenario (100 paying users):
```
60 × Asas (RM9.90)     = RM594/mo
30 × Standard (RM19.90) = RM597/mo
10 × Keluarga (RM29.90) = RM299/mo
                         ─────────
Total subscription MRR  = RM1,490

+ Credit packs (20% of users buy)
20 × Family pack (RM59) = RM1,180

Total MRR ≈ RM 2,670/month
Annual ≈ RM 32,040
```

### Cost breakdown (estimate):
```
AI API costs (~30% of credit revenue) = RM 350/mo
Base44/Supabase hosting               = RM 100/mo
CHIP fees (2.5% + RM0.50)            = RM 90/mo
Resend email                          = RM 50/mo
Domain + misc                         = RM 50/mo
                                      ────────
Total costs                           ≈ RM 640/mo

Net profit ≈ RM 2,000/month
```

---

## 🎯 Key Business Rules to Preserve

### ⚠️ NEVER change without business decision:

1. ✅ **Tier game limits** — Affects what users see/play
2. ✅ **Credit costs** — Affects revenue margin
3. ✅ **Commission rates** — Affects affiliate trust
4. ✅ **Free tier = 0 games** — Forces subscription
5. ✅ **5 welcome credits** — Conversion driver
6. ✅ **CHIP webhook idempotency** — Prevent double-charging
7. ✅ **Refund logic** — Always refund credits on AI failure

### ✅ Safe to change:
- UI copy, colors, layouts
- Email templates
- Game content (Game.gameData)
- New features (additions only)

---

## 📝 Tier Display Strings (BM)

For UI consistency:
```javascript
const TIER_LABELS = {
  free: 'Percuma',
  asas: 'Asas',
  standard: 'Standard',
  keluarga: 'Keluarga',
  premium: 'Premium (Lama)',
  pro: 'Pro (Lama)',
};

const TIER_DESCRIPTIONS = {
  free: 'Tiada akses permainan',
  asas: '50 permainan per kategori',
  standard: '100 permainan per kategori',
  keluarga: '200 permainan + 4 anak',
};
```

---

> Next: Read `11_PACKAGE_AND_DEPENDENCIES.md` for exact npm packages list.