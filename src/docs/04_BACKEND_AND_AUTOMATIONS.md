# ⚙️ Backend Functions & Automations

> Complete inventory of 67 backend functions + scheduled automations.

---

## 📋 Quick Inventory (67 Functions)

### 💳 Payment & Subscription (6)
- `chipCheckout` — Subscription checkout
- `chipCreditCheckout` — Credit pack checkout
- `chipWebhook` — Payment webhook handler
- `cleanupStuckSubscriptions` — Cleanup incomplete subs
- `sendExpiryReminders` — Email expiry warnings
- `sendAbandonedCartReminders` — Cart recovery emails

### 💰 Credits System (4)
- `addCredits` — Add to balance
- `deductCredits` — Subtract from balance
- `getUserCredits` — Get user balance
- `sendLowCreditReminders` — Low balance alerts

### 🤖 AI Generation (5)
- `askAIAssistant` — Cikgu Firdaus chat
- `generateQuizQuestion` — Cikgu Rosie quiz
- `generateAIStory` — Cikgu Mira story
- `generateCustomBBM` — Cikgu Daniel BBM
- `generateAllKafa` — Bulk KAFA generation

### 🎮 Game Management (9)
- `launchGenerateBatch` — Bulk game generation
- `launchGenerateStoryKid` — Bulk Story Kid
- `launchGetProgress` — Generation progress
- `launchGetStoryProgress` — Story Kid progress
- `launchGetMiniGamesProgress` — Mini games progress
- `launchPurgeBucket` — Delete games in bucket
- `backgroundLaunchGenerator` — Background batch processor
- `backgroundStoryGenerator` — Background story processor
- `normalizeKSSRBuckets` — Standardize KSSR data

### 🔍 Quality Control (6)
- `auditAllGames` — Audit game quality
- `auditQuizAnswers` — Audit quiz answers
- `auditStoryKidGames` — Audit Story Kid
- `repairAllGames` — Fix broken games
- `restoreQuizAnswersFromDescription` — Recover answers
- `getQcOverviewReport` — QC dashboard data

### 🗑️ Deletion/Cleanup (3)
- `deleteMiniGames` — Delete mini games
- `deleteStoryKidGames` — Delete Story Kid
- `regenerateStoryKidImages` — Regen images

### 📧 Email (8)
- `sendResendEmail` — Generic email send
- `sendWelcomeEmail` — New user welcome
- `sendExpiryReminders` — Subscription expiry
- `sendAbandonedCartReminders` — Cart recovery
- `sendLowCreditReminders` — Low credit alert
- `sendStreakReminders` — Daily streak reminder
- `sendWeeklyProgressReport` — Weekly summary
- `sendParentNotification` — Parent alerts

### 🔔 Push Notifications (4)
- `subscribeToPush` — Register device
- `unsubscribeFromPush` — Remove device
- `sendPushNotification` — Send push
- `generateVapidKeys` — Generate VAPID keys

### 🛡️ Admin Tools (8)
- `adminUpdateUser` — Update user
- `adminUpdateCustomer` — Update customer
- `adminListAffiliates` — List affiliates
- `adminUpdateAffiliate` — Update affiliate
- `adminProcessPayout` — Approve payout
- `bulkUpdateUserNames` — Bulk rename
- `getAdminSecrets` — Get secrets (admin only)
- `getCustomerDetails` — Customer detail view

### 💼 Affiliate (5)
- `registerAffiliate` — Sign up as affiliate
- `getAffiliateData` — Get affiliate stats
- `updateAffiliateBank` — Update bank details
- `requestAffiliatePayout` — Request payout
- `adminProcessPayout` — Admin approve

### 📊 Analytics & Monitoring (6)
- `getGameAnalytics` — Game stats
- `getGameManagerCounts` — Game counts
- `getPublicGameStats` — Public stats
- `getBackgroundActivityStatus` — Worker status
- `getWorkerActivity` — Worker activity log
- `runHealthCheck` — System health check

### 🔄 Data Sync (2)
- `syncToSupabase` — Sync entities to Supabase
- `getSupabaseSyncStatus` — Sync status

### 📈 Marketing (1)
- `fbConversionsAPI` — Facebook CAPI events

### ⚙️ Settings (1)
- `updateQualityControlSettings` — Update QC config

### 💾 Other (1)
- `saveQuizAnswer` — Save quiz answer

---

## 🔥 Critical Functions (Detailed)

### 1. `chipCheckout` — Subscription Payment

**Purpose:** Create CHIP payment session untuk subscription

**Input:**
```typescript
{
  email: string,
  tier: "asas" | "standard" | "keluarga" | "premium" | "pro",
  name: string,
  phone: string,
  isAnnual?: boolean,
  fbTracking?: object,  // FB Pixel data
}
```

**Output:**
```typescript
{
  checkoutUrl: string,  // Redirect user here
  purchaseId: string,
}
```

**Flow:**
1. Validate inputs
2. Create UserSubscription (status: "incomplete")
3. Call CHIP API to create purchase
4. Return checkout URL
5. User redirected → CHIP page → pays → webhook fires

**Secrets needed:**
- `CHIP_SECRET_KEY`, `CHIP_BRAND_ID`

---

### 2. `chipWebhook` — Payment Webhook

**Purpose:** Handle CHIP payment completion

**Trigger:** CHIP sends POST to webhook URL after payment

**Flow:**
1. Verify webhook signature (`CHIP_WEBHOOK_SECRET`)
2. Parse event type:
   - `purchase.created` — Mark as pending
   - `purchase.paid` — Activate subscription
   - `purchase.refunded` — Mark refunded
3. Update UserSubscription:
   - `status` → "active"
   - `currentPeriodStart/End` → calculate
4. Send welcome email (if first time)
5. Track FB CAPI conversion event
6. Process affiliate commission (if referred)
7. Reset `abandonedReminderSent` flags

**Critical:** Idempotent — handle duplicate webhooks

---

### 3. `askAIAssistant` — Cikgu Firdaus

**Purpose:** AI Tutor conversational endpoint

**Input:**
```typescript
{
  message: string,
  subject?: string,
  level?: string,
  conversationId?: string,
  fileUrls?: string[],
}
```

**Output:**
```typescript
{
  response: string,
  conversationId: string,
  creditsUsed: number,
}
```

**Flow:**
1. Get user, check authentication
2. Check `UserCredit.balance` >= cost
3. Build system prompt (Cikgu Firdaus persona, BM/EN, education-focused)
4. Call `base44.integrations.Core.InvokeLLM` with conversation history
5. Save response to `ChatConversation`
6. Deduct credits via `deductCredits`
7. Return response

**Credit cost:** ~1-3 credits per message (model-dependent)

---

### 4. `generateAIStory` — Cikgu Mira

**Purpose:** Generate custom children's story with cover image

**Flow:**
1. Generate story text via InvokeLLM
2. Extract theme + main character for image
3. Generate Pixar 3D cover image via GenerateImage
4. Save to `AIStory` entity
5. Deduct credits (~10-20 credits per story)

---

### 5. `generateCustomBBM` — Cikgu Daniel

**Purpose:** Generate printable HTML teaching materials

**Output:** HTML content (printable, save as PDF)

**Flow:**
1. Build prompt based on subject + level + type
2. InvokeLLM with detailed instructions
3. Save HTML to `BBMResource`
4. Deduct credits

---

### 6. `syncToSupabase` — Auto-Backup

**Purpose:** Mirror Base44 entities ke Supabase tables

**Schedule:** Runs periodically (scheduled automation)

**Flow:**
1. Loop through 26 entities
2. For each, fetch all records (paginated)
3. Transform data (snake_case columns)
4. Upsert to Supabase via REST API
5. Log to `ck_sync_log` table

**Secrets:** `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`

> See `functions/syncToSupabase` for full entity mapping

---

### 7. `sendPushNotification` — Web Push

**Purpose:** Send push notification to subscribed devices

**Input:**
```typescript
{
  userEmail?: string,    // Target specific user
  title: string,
  body: string,
  url?: string,          // Click action
  isAdmin?: boolean,     // Send to all admins
}
```

**Flow:**
1. Query `PushSubscription` by criteria
2. For each subscription, send via web-push library
3. Use VAPID keys for auth
4. Handle expired subscriptions (cleanup)

**Secrets:** `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`

---

### 8. `fbConversionsAPI` — Facebook CAPI

**Purpose:** Server-side conversion events (deduped with client Pixel)

**Events sent:**
- `Lead` — Signup
- `InitiateCheckout` — Pricing click
- `Purchase` — Subscription/credit purchase
- `CompleteRegistration` — Onboarding finished

**Secrets:** `FB_ACCESS_TOKEN`, `FB_PIXEL_ID`

---

## ⏰ Scheduled Automations

### Currently Active (estimated):

| Function | Schedule | Purpose |
|---|---|---|
| `syncToSupabase` | Every 1-6 hours | Backup data |
| `sendAbandonedCartReminders` | Every hour | Recover incomplete checkouts |
| `sendExpiryReminders` | Daily | Subscription expiry warnings |
| `sendLowCreditReminders` | Daily | Low credit alerts |
| `sendStreakReminders` | Daily evening | Encourage daily play |
| `sendWeeklyProgressReport` | Weekly | Parent weekly summary |
| `cleanupStuckSubscriptions` | Daily | Clean up incomplete subs |
| `runHealthCheck` | Hourly | System monitoring |
| `backgroundLaunchGenerator` | Every 5 min (when enabled) | Bulk game gen |
| `backgroundStoryGenerator` | Every 10 min (when enabled) | Bulk story gen |
| QC auto-audit | Every 10 min (configurable) | Quality control |

### Entity Triggers (estimated):

| Trigger | Entity | Action |
|---|---|---|
| `UserSubscription` created/updated | Status: "active" | Send welcome email, track FB |
| `UserSubscription` deleted | - | Cleanup related data |
| `Game` created | - | Maybe push notify admins |

---

## 🔐 Function Security Patterns

### 1. **Auth check (most functions):**
```javascript
const base44 = createClientFromRequest(req);
const user = await base44.auth.me();
if (!user) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### 2. **Admin check (admin functions):**
```javascript
if (user?.role !== 'admin') {
  return Response.json({ error: 'Forbidden' }, { status: 403 });
}
```

### 3. **Webhook signature verification:**
```javascript
// CHIP webhook
const signature = req.headers.get('x-chip-signature');
const isValid = verifyChipSignature(body, signature, CHIP_WEBHOOK_SECRET);
if (!isValid) return Response.json({ error: 'Invalid signature' }, { status: 401 });
```

---

## 🔄 Function Calling Patterns

### Frontend → Backend:
```javascript
import { base44 } from "@/api/base44Client";

// Standard call
const response = await base44.functions.invoke('functionName', { 
  param1: "value" 
});
// response.data contains return value

// File upload
const { file_url } = await base44.integrations.Core.UploadFile({ file });
```

### Backend → Backend (chain calls):
```javascript
const result = await base44.functions.invoke('otherFunction', { ... });
```

### Backend → External API:
```javascript
const response = await fetch('https://api.external.com', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
});
```

---

## 🚨 Critical Backend Patterns

### Pattern 1: Credit Deduction (Atomic)
```javascript
// Always deduct BEFORE AI call to prevent free usage if AI fails
const cost = 2;
await base44.functions.invoke('deductCredits', {
  amount: cost,
  feature: 'ai_assistant',
  description: 'Cikgu Firdaus chat'
});

try {
  const aiResponse = await base44.integrations.Core.InvokeLLM({ ... });
  return Response.json({ response: aiResponse });
} catch (error) {
  // Refund on failure
  await base44.functions.invoke('addCredits', {
    amount: cost,
    feature: 'refund',
    description: 'AI call failed - refund'
  });
  throw error;
}
```

### Pattern 2: Webhook Idempotency
```javascript
// CHIP webhook handler
const event = JSON.parse(body);

// Check if already processed
const existing = await base44.entities.UserSubscription.filter({
  stripeSubscriptionId: event.id
});

if (existing[0]?.status === 'active') {
  return Response.json({ message: 'Already processed' });
}

// Process...
```

### Pattern 3: Pagination for Large Datasets
```javascript
// syncToSupabase pattern
let allRecords = [];
let cursor = null;
const limit = 500;

while (true) {
  const batch = await base44.entities.Game.list('-created_date', limit, cursor);
  if (batch.length === 0) break;
  allRecords.push(...batch);
  cursor = batch[batch.length - 1].id;
  if (batch.length < limit) break;
}
```

---

## 🎯 For Supabase Migration

### Function → Edge Function mapping:

**Base44 function:**
```javascript
// functions/myFunction.js
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  const data = await base44.entities.Game.list();
  return Response.json({ games: data });
});
```

**Supabase Edge Function equivalent:**
```javascript
// supabase/functions/myFunction/index.ts
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  );
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });
  
  const { data } = await supabase.from('ck_games').select('*');
  return Response.json({ games: data });
});
```

### Translation Cheat Sheet:

| Base44 | Supabase |
|---|---|
| `base44.entities.X.list()` | `supabase.from('ck_x').select('*')` |
| `base44.entities.X.filter({...})` | `supabase.from('ck_x').select('*').match({...})` |
| `base44.entities.X.create({...})` | `supabase.from('ck_x').insert({...})` |
| `base44.entities.X.update(id, {...})` | `supabase.from('ck_x').update({...}).eq('id', id)` |
| `base44.entities.X.delete(id)` | `supabase.from('ck_x').delete().eq('id', id)` |
| `base44.auth.me()` | `supabase.auth.getUser()` |
| `base44.integrations.Core.InvokeLLM` | Direct OpenAI/Anthropic call |
| `base44.integrations.Core.UploadFile` | `supabase.storage.from('bucket').upload()` |

---

## 📊 Function Dependencies

### Most-called functions:
1. `getUserCredits` — Every page that needs credit balance
2. `askAIAssistant` — Heavy use (chat)
3. `generateQuizQuestion` — Heavy use (quiz)
4. `deductCredits` / `addCredits` — Called from all AI functions
5. `chipWebhook` — Called by CHIP on every payment event

### External API calls:
- **CHIP API:** chipCheckout, chipCreditCheckout
- **Resend API:** All email functions
- **Facebook CAPI:** fbConversionsAPI
- **OpenAI (via InvokeLLM):** All AI generation functions
- **Supabase API:** syncToSupabase, getSupabaseSyncStatus

---

## 🔥 Functions to Migrate FIRST

If migrating to Supabase, priority order:

```
🔴 P0 — CRITICAL (must work day 1):
   1. chipWebhook (payments)
   2. askAIAssistant (core AI)
   3. getUserCredits, addCredits, deductCredits
   4. sendResendEmail
   5. saveQuizAnswer

🟡 P1 — IMPORTANT (week 1):
   6. chipCheckout, chipCreditCheckout
   7. generateQuizQuestion, generateAIStory, generateCustomBBM
   8. sendPushNotification, subscribeToPush
   9. sendWelcomeEmail
   10. fbConversionsAPI

🟢 P2 — NICE TO HAVE (week 2-3):
   11. Affiliate functions
   12. Admin functions
   13. Scheduled reminders
   14. Quality control system
   15. Bulk generators
```

---

> Next: Read `05_INTEGRATIONS.md` untuk external service details.