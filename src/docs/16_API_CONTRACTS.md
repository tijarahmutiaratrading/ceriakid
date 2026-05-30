# 📡 API Contracts — Top 15 Critical Functions

> Input/output contracts for the most critical backend functions.
> Use this to understand expected payloads when migrating to Supabase Edge Functions.
> Last updated: 2026-05-30

---

## 🎯 Functions Listed Below (Priority Order)

| # | Function | Category | Priority |
|---|---|---|---|
| 1 | `chipCheckout` | Payment | 🔴 CRITICAL |
| 2 | `chipCreditCheckout` | Payment | 🔴 CRITICAL |
| 3 | `chipWebhook` | Payment | 🔴 CRITICAL |
| 4 | `sendWelcomeEmail` | Email | 🔴 CRITICAL |
| 5 | `sendResendEmail` | Email | 🟡 HIGH |
| 6 | `askAIAssistant` | AI | 🔴 CRITICAL |
| 7 | `generateAIStory` | AI | 🟡 HIGH |
| 8 | `generateCustomBBM` | AI | 🟡 HIGH |
| 9 | `generateQuizQuestion` | AI | 🟡 HIGH |
| 10 | `deductCredits` | Credits | 🔴 CRITICAL |
| 11 | `addCredits` | Credits | 🔴 CRITICAL |
| 12 | `getUserCredits` | Credits | 🟡 HIGH |
| 13 | `syncToSupabase` | Data | 🔴 CRITICAL |
| 14 | `sendPushNotification` | Notification | 🟢 MEDIUM |
| 15 | `runHealthCheck` | Admin | 🟢 MEDIUM |

---

## 1️⃣ chipCheckout — Create Subscription Payment

**Purpose:** Initialize CHIP payment for subscription purchase.

**Auth:** Public (no auth required, captures email at checkout)

**Input:**
```json
{
  "tier": "asas" | "standard" | "keluarga",
  "email": "customer@example.com",
  "fullName": "Ahmad bin Ali",
  "phone": "60123456789",
  "referralCode": "ABC123",  // optional
  "fbTracking": {              // optional, for Pixel
    "fbp": "...",
    "fbc": "...",
    "eventId": "..."
  }
}
```

**Output (Success):**
```json
{
  "success": true,
  "checkoutUrl": "https://gate.chip-in.asia/p/...",
  "purchaseId": "..."
}
```

**Output (Error):**
```json
{ "error": "Invalid tier" }
```

---

## 2️⃣ chipCreditCheckout — Create AI Credit Payment

**Purpose:** Initialize CHIP payment for AI credit pack.

**Auth:** Required (logged-in user)

**Input:**
```json
{
  "packageId": "starter" | "family" | "power"
}
```

> ⚠️ **Package IDs match `lib/creditPackages.js`** (NOT credits_50 style):
> - `starter` → 50 credits, RM19
> - `family` → 140 credits + 25 bonus, RM59
> - `power` → 380 credits + 70 bonus, RM149

**Output:**
```json
{
  "success": true,
  "checkoutUrl": "https://gate.chip-in.asia/p/...",
  "purchaseId": "..."
}
```

---

## 3️⃣ chipWebhook — Process CHIP Payment Confirmation

**Purpose:** Receive webhook dari CHIP after payment, activate subscription/credits.

**Auth:** Webhook signature validation (X-Signature header)

**Input (from CHIP):**
```json
{
  "id": "purchase_id_from_chip",
  "status": "paid" | "failed" | "expired",
  "client": {
    "email": "customer@example.com",
    "full_name": "Ahmad bin Ali",
    "phone": "60123456789"
  },
  "purchase": {
    "total": 990,  // cents (RM 9.90)
    "currency": "MYR",
    "products": [...]
  },
  "metadata": {
    "tier": "asas",
    "type": "subscription" | "credit"
  }
}
```

**Side Effects:**
- Create/update `UserSubscription` record
- Add credits via `addCredits` function
- Send welcome email via `sendWelcomeEmail`
- Track FB Conversions API event
- Process affiliate commission (if referralCode)

**Output:**
```json
{ "success": true, "processed": true }
```

---

## 4️⃣ sendWelcomeEmail — Send Welcome Email

**Purpose:** Email new customer after successful purchase.

**Auth:** Server-to-server only (called from chipWebhook)

**Input (Subscription):**
```json
{
  "to": "customer@example.com",
  "type": "subscription",
  "tier": "asas" | "standard" | "keluarga",
  "bonusCredits": 20  // optional
}
```

**Input (Credit Top-up):**
```json
{
  "to": "customer@example.com",
  "type": "credit",
  "credits": 165
}
```

> Credit amounts seen in production: `50` (starter), `165` (family: 140+25 bonus), `450` (power: 380+70 bonus).

**Output:**
```json
{
  "success": true,
  "type": "subscription",
  "to": "customer@example.com",
  "emailId": "resend_email_id"
}
```

---

## 5️⃣ sendResendEmail — Generic Email Sender

**Purpose:** Send arbitrary email via Resend.

**Auth:** Required (admin only)

**Input:**
```json
{
  "to": "user@example.com",
  "subject": "Subject line",
  "html": "<h1>Email body HTML</h1>",
  "from": "CeriaKid <noreply@ceriakid.com>"  // optional
}
```

**Output:**
```json
{ "success": true, "emailId": "..." }
```

---

## 6️⃣ askAIAssistant — Chat with Cikgu Firdaus

**Purpose:** Send message to AI tutor, get response. Deducts credits.

**Auth:** Required (logged-in user)

**Input:**
```json
{
  "message": "Apa itu pendaraban?",
  "subject": "mathematics",
  "level": "darjah_3",
  "conversationId": "uuid",  // optional, for continuing chat
  "language": "ms" | "en"
}
```

**Output:**
```json
{
  "success": true,
  "response": "Pendaraban ialah...",
  "conversationId": "uuid",
  "creditsUsed": 1,
  "creditsRemaining": 49
}
```

**Error (Insufficient credits):**
```json
{
  "error": "INSUFFICIENT_CREDITS",
  "creditsRemaining": 0,
  "creditsRequired": 1
}
```

---

## 7️⃣ generateAIStory — Generate Story with Images

**Purpose:** Generate custom AI story with cover image. Deducts credits.

**Auth:** Required

**Input:**
```json
{
  "theme": "Persahabatan dan kebaikan",
  "childName": "Aisha",
  "ageRange": "4-6" | "7-9" | "10-12",
  "moralLesson": "Jujur",
  "length": "short" | "medium" | "long",
  "language": "ms" | "en"
}
```

**Output:**
```json
{
  "success": true,
  "storyId": "uuid",
  "title": "Aisha dan Kucing Comel",
  "story": "Pada suatu hari...",
  "coverImage": "https://...",
  "moralSummary": "...",
  "creditsUsed": 5
}
```

---

## 8️⃣ generateCustomBBM — Generate Teaching Material

**Purpose:** Generate worksheet/quiz/activity as HTML. Deducts credits.

**Auth:** Required

**Input:**
```json
{
  "subject": "bahasa_melayu",
  "level": "darjah_2",
  "type": "lembaran_kerja" | "kuiz" | "modul" | "rancangan_pengajaran",
  "topic": "Kata nama",
  "questionCount": 10,
  "difficulty": "easy" | "medium" | "hard",
  "language": "ms" | "en"
}
```

**Output:**
```json
{
  "success": true,
  "bbmId": "uuid",
  "title": "Latihan Kata Nama - Darjah 2",
  "htmlContent": "<html>...</html>",
  "creditsUsed": 3
}
```

---

## 9️⃣ generateQuizQuestion — Generate Single Quiz Q

**Purpose:** Generate 1 quiz question with 4 choices. Deducts credit.

**Auth:** Required

**Input:**
```json
{
  "subject": "mathematics",
  "level": "darjah_4",
  "topic": "Pecahan",  // optional
  "difficulty": "medium",
  "language": "ms"
}
```

**Output:**
```json
{
  "success": true,
  "question": "Berapa hasil 1/2 + 1/4?",
  "choices": ["1/6", "2/6", "3/4", "1/4"],
  "correctIndex": 2,
  "explanation": "1/2 = 2/4, 2/4 + 1/4 = 3/4",
  "hint": "Samakan penyebut dulu",
  "creditsUsed": 1
}
```

---

## 🔟 deductCredits — Deduct Credits Atomically

**Purpose:** Deduct credits from user balance (atomic, prevents race conditions).

**Auth:** Server-to-server (called from AI functions)

**Input:**
```json
{
  "userEmail": "user@example.com",
  "amount": 5,
  "feature": "ai_assistant" | "story_generator" | "bbm_generator",
  "description": "Cikgu Firdaus chat",
  "metadata": { "model": "gpt-4", "tokens": 1500 }
}
```

**Output:**
```json
{
  "success": true,
  "balanceAfter": 45,
  "transactionId": "uuid"
}
```

**Error:**
```json
{
  "error": "INSUFFICIENT_CREDITS",
  "currentBalance": 2,
  "required": 5
}
```

---

## 1️⃣1️⃣ addCredits — Add Credits to User

**Purpose:** Top-up user credits (after purchase or bonus).

**Auth:** Server-to-server (called from chipWebhook)

**Input:**
```json
{
  "userEmail": "user@example.com",
  "amount": 150,
  "type": "purchase" | "bonus" | "refund" | "admin_adjustment",
  "feature": "top_up",
  "description": "Credit pack purchase",
  "referenceId": "chip_purchase_id"
}
```

**Output:**
```json
{
  "success": true,
  "balanceAfter": 200,
  "transactionId": "uuid"
}
```

---

## 1️⃣2️⃣ getUserCredits — Get Current Balance

**Purpose:** Fetch user's current credit balance.

**Auth:** Required

**Input:** (none — uses authenticated user)

**Output:**
```json
{
  "balance": 45,
  "totalPurchased": 200,
  "totalUsed": 155,
  "lastTopUpAt": "2026-05-15T...",
  "lastUsedAt": "2026-05-30T..."
}
```

---

## 1️⃣3️⃣ syncToSupabase — Mirror Data to Supabase

**Purpose:** Sync semua entities ke Supabase (disaster recovery backup).

**Auth:** Admin only

**Input:**
```json
{
  "tables": ["all"] | ["users", "games", "..."],  // optional filter
  "dryRun": false  // optional
}
```

**Output:**
```json
{
  "success": true,
  "totalSynced": 1816,
  "byEntity": {
    "users": 245,
    "games": 1024,
    "...": "..."
  },
  "duration": "12.3s"
}
```

---

## 1️⃣4️⃣ sendPushNotification — Send Web Push

**Purpose:** Send push notification to user devices.

**Auth:** Admin only

**Input:**
```json
{
  "userEmail": "user@example.com",  // OR
  "userEmails": ["user1@x.com", "user2@x.com"],  // bulk
  "title": "📚 Masa belajar!",
  "body": "Anak anda belum main hari ni",
  "url": "/dashboard",  // optional, click target
  "icon": "https://...",  // optional
  "badge": "https://..."  // optional
}
```

**Output:**
```json
{
  "success": true,
  "sent": 2,
  "failed": 0,
  "results": [...]
}
```

---

## 1️⃣5️⃣ runHealthCheck — System Health Check

**Purpose:** Comprehensive health check of all systems.

**Auth:** Admin only

**Input:** (none)

**Output:**
```json
{
  "overall": "healthy" | "degraded" | "critical",
  "checks": {
    "database": { "status": "ok", "latency": 45 },
    "supabaseSync": { "status": "ok", "lastSync": "2 hours ago" },
    "chipApi": { "status": "ok" },
    "resendApi": { "status": "ok" },
    "storage": { "status": "ok", "usage": "120MB" }
  },
  "timestamp": "2026-05-30T..."
}
```

---

## 🔄 Pattern: Supabase Edge Function Template

When migrating, ikut pattern ni:

```js
// supabase/functions/<function-name>/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  try {
    // 1. Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response('Unauthorized', { status: 401 });
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response('Unauthorized', { status: 401 });
    
    // 2. Parse input
    const payload = await req.json();
    
    // 3. Business logic
    // ... (translated from Base44 function)
    
    // 4. Return
    return Response.json({ success: true, data: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
```

---

## 📚 Functions NOT Listed (52 lagi)

Lagi 52 functions ada — most are admin tools, QC, generators, analytics.
Untuk full list lihat: `docs/04_BACKEND_AND_AUTOMATIONS.md`

Priority untuk migrate:
- 🔴 **First (top 15 above):** Payment, AI, Credits, Email
- 🟡 **Second:** Admin dashboard tools
- 🟢 **Last:** Bulk generators, QC tools (boleh tunggu)