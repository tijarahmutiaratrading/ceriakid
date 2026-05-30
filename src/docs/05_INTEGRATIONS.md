# 🔌 External Integrations Guide

> All external services CeriaKid uses + how to set them up.

---

## 📋 Integrations Overview

| Service | Purpose | Critical? |
|---|---|---|
| **CHIP** | Payment gateway (Malaysia) | 🔴 Yes |
| **Resend** | Transactional email | 🔴 Yes |
| **Supabase** | Database mirror | 🟡 Backup |
| **Facebook** | Pixel + Conversions API | 🟢 Marketing |
| **VAPID/Web Push** | Push notifications | 🟢 Engagement |
| **OpenAI/Anthropic** | AI generation (via Base44) | 🔴 Yes |
| **Base44 Storage** | File uploads | 🔴 Yes |

---

## 💳 1. CHIP (Payment Gateway)

### Overview:
- Malaysian payment gateway
- Supports: FPX, Credit/Debit Cards, e-Wallets (TnG, GrabPay, Boost)
- Currency: MYR

### Dashboard:
https://dashboard.chip-in.asia

### Secrets Required:
```
CHIP_SECRET_KEY        — API secret (sk_live_...)
CHIP_BRAND_ID          — Brand identifier
CHIP_WEBHOOK_SECRET    — Webhook signature verification
```

### Functions Using CHIP:
- `chipCheckout` — Create subscription purchase
- `chipCreditCheckout` — Create credit pack purchase
- `chipWebhook` — Handle payment events

### API Endpoints Used:
```
POST https://gate.chip-in.asia/api/v1/purchases/
  └── Create purchase, get checkout URL

GET  https://gate.chip-in.asia/api/v1/purchases/{id}
  └── Check purchase status
```

### Webhook URL Setup:
```
1. Login to CHIP dashboard
2. Settings → Webhooks
3. Add URL: https://your-app.com/functions/chipWebhook
4. Subscribe to events:
   - purchase.created
   - purchase.paid
   - purchase.refunded
5. Copy webhook secret → save as CHIP_WEBHOOK_SECRET
```

### Webhook Signature Verification:
```javascript
// In chipWebhook function
const signature = req.headers.get('x-signature');
const body = await req.text();

// Verify using HMAC SHA256
const expectedSig = await hmacSha256(body, CHIP_WEBHOOK_SECRET);
if (signature !== expectedSig) {
  return Response.json({ error: 'Invalid signature' }, { status: 401 });
}
```

### Test Mode:
- Use `CHIP_SECRET_KEY` starting with `sk_test_` for sandbox
- Test cards available in CHIP docs

### Migration Notes:
- ✅ CHIP is independent of Base44 — works on any platform
- ✅ Just update webhook URL when migrating
- ⚠️ Keep transaction history at CHIP dashboard (backup record)

---

## 📧 2. Resend (Email)

### Overview:
- Modern transactional email API
- Free tier: 100 emails/day, 3000/month
- Pro: $20/month for 50k emails

### Dashboard:
https://resend.com/emails

### Secrets Required:
```
RESEND_API_KEY        — API key (re_...)
RESEND_FROM_EMAIL     — Sender email (e.g. hello@ceriakid.com)
```

### Functions Using Resend:
- `sendResendEmail` — Generic send (base function)
- `sendWelcomeEmail`
- `sendAbandonedCartReminders`
- `sendExpiryReminders`
- `sendLowCreditReminders`
- `sendStreakReminders`
- `sendWeeklyProgressReport`
- `sendParentNotification`

### API Endpoint:
```
POST https://api.resend.com/emails
Authorization: Bearer ${RESEND_API_KEY}

Body:
{
  "from": "CeriaKid <hello@ceriakid.com>",
  "to": ["user@example.com"],
  "subject": "Welcome to CeriaKid!",
  "html": "<h1>Welcome!</h1>...",
  "text": "Welcome!..."
}

Response:
{
  "id": "re_xxx",   // Save as messageId for tracking
  "from": "...",
  "to": "..."
}
```

### Domain Setup:
```
1. Add domain in Resend dashboard
2. Add DNS records (SPF, DKIM, DMARC) to your domain
3. Verify domain
4. Use verified domain in from_email
```

### Email Templates:
Templates inline dalam each email function (HTML strings).

Sample templates:
- Welcome: Hero image + tier benefits + CTA
- Abandoned cart: Reminder + discount + checkout link
- Expiry warning: Tier reminder + renewal link
- Weekly progress: Child stats + insights + tips

### Migration Notes:
- ✅ Resend works anywhere (just API key)
- ⚠️ Domain verification stays with Resend
- ⚠️ Email logs/history kekal di Resend dashboard

---

## 🗄️ 3. Supabase (Database Mirror)

### Overview:
- Open-source Firebase alternative
- PostgreSQL + Auth + Storage + Edge Functions
- Currently used as **read-only mirror** of Base44 data

### Dashboard:
https://app.supabase.com

### Secrets Required:
```
SUPABASE_URL              — Project URL (https://xxx.supabase.co)
SUPABASE_SERVICE_KEY      — Service role key (admin access)
SUPABASE_ANON_KEY         — Anon key (public, RLS protected)
```

### Current Setup:
- ✅ 26 tables created (`ck_*` prefix)
- ✅ Auto-sync via `syncToSupabase` function
- ✅ ~1812+ records mirrored
- ⚠️ Read-only currently (writes go to Base44)

### Sync Function:
```javascript
// syncToSupabase.js
// Maps Base44 entity → Supabase table
const ENTITY_TABLE_MAP = {
  User: 'ck_users',
  Game: 'ck_games',
  UserSubscription: 'ck_user_subscriptions',
  // ... 26 mappings
};

// For each entity:
// 1. Fetch from Base44 (paginated)
// 2. Transform field names (camelCase → snake_case)
// 3. Upsert to Supabase via REST API
```

### Supabase REST API:
```
GET    https://xxx.supabase.co/rest/v1/ck_games?select=*
POST   https://xxx.supabase.co/rest/v1/ck_games (insert)
PATCH  https://xxx.supabase.co/rest/v1/ck_games?id=eq.xxx (update)
DELETE https://xxx.supabase.co/rest/v1/ck_games?id=eq.xxx

Headers:
  apikey: ${SUPABASE_SERVICE_KEY}
  Authorization: Bearer ${SUPABASE_SERVICE_KEY}
  Content-Type: application/json
  Prefer: resolution=merge-duplicates (for upsert)
```

### Migration Activation:
To switch CeriaKid to use Supabase as primary DB:
1. ✅ Schema already exists
2. ✅ Data already synced
3. ⚠️ Need to: update all frontend code to use Supabase SDK
4. ⚠️ Need to: setup Supabase Auth (replace Base44 auth)
5. ⚠️ Need to: enable Row Level Security (RLS) policies
6. ⚠️ Need to: convert backend functions to Edge Functions

> Full migration guide: `06_SUPABASE_MIGRATION.md`

### RLS Policy Examples (for migration):
```sql
-- Users can only see own data
CREATE POLICY "users_own_data" ON ck_user_subscriptions
  FOR SELECT USING (email = auth.jwt() ->> 'email');

-- Only admins can see all users
CREATE POLICY "admin_all_users" ON ck_users
  FOR ALL USING (
    (auth.jwt() ->> 'role') = 'admin'
  );

-- Games are public read
CREATE POLICY "games_public_read" ON ck_games
  FOR SELECT USING (true);
```

---

## 📊 4. Facebook (Pixel + CAPI)

### Overview:
- **Pixel:** Client-side event tracking
- **Conversions API (CAPI):** Server-side event tracking (more reliable)
- Used for ads optimization & retargeting

### Dashboard:
https://business.facebook.com/events_manager

### Secrets Required:
```
FB_PIXEL_ID           — Pixel ID (public, OK in frontend)
FB_ACCESS_TOKEN       — Server access token (PRIVATE)
```

### Frontend (Pixel):
```javascript
// lib/pixel.js
fbq('init', FB_PIXEL_ID);
fbq('track', 'PageView');
fbq('track', 'Lead');
fbq('track', 'InitiateCheckout');
fbq('track', 'Purchase', { value: 19.90, currency: 'MYR' });
```

### Backend (CAPI):
```javascript
// fbConversionsAPI function
POST https://graph.facebook.com/v18.0/{pixelId}/events
  ?access_token={FB_ACCESS_TOKEN}

Body:
{
  "data": [
    {
      "event_name": "Purchase",
      "event_time": 1234567890,
      "event_id": "unique_id_for_dedup",  // Match with Pixel event_id
      "user_data": {
        "em": ["sha256_hashed_email"],
        "ph": ["sha256_hashed_phone"],
        "fbc": "...",   // FB click ID
        "fbp": "..."    // FB browser ID
      },
      "custom_data": {
        "currency": "MYR",
        "value": 19.90
      },
      "action_source": "website"
    }
  ]
}
```

### Event Deduplication:
- Both Pixel & CAPI send same event with same `event_id`
- Facebook dedupes → counts as 1 event
- Prevents double-counting

### Events Tracked:
- `PageView` — Every page
- `ViewContent` — Pricing page
- `Lead` — Signup (email captured)
- `InitiateCheckout` — Clicked "Subscribe"
- `Purchase` — Payment successful (from webhook)
- `CompleteRegistration` — Onboarding finished

---

## 🔔 5. Web Push (VAPID)

### Overview:
- Native browser push notifications
- Works on desktop + mobile (PWA)
- Free, no third-party service

### Secrets Required:
```
VAPID_PUBLIC_KEY      — Public key (OK in frontend)
VAPID_PRIVATE_KEY     — Private key (backend only)
VAPID_SUBJECT         — mailto: or URL (e.g. mailto:admin@ceriakid.com)
```

### Generate VAPID Keys:
```bash
# Run once: generateVapidKeys function
# Or use web-push library:
npx web-push generate-vapid-keys
```

### Frontend Subscription:
```javascript
// 1. Request permission
const permission = await Notification.requestPermission();

// 2. Register service worker
const registration = await navigator.serviceWorker.register('/sw.js');

// 3. Subscribe to push
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: VAPID_PUBLIC_KEY
});

// 4. Send subscription to backend
await base44.functions.invoke('subscribeToPush', {
  subscription: subscription.toJSON()
});
```

### Backend Send Push:
```javascript
// sendPushNotification function
import webpush from 'npm:web-push@3';

webpush.setVapidDetails(
  VAPID_SUBJECT,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// Get subscriptions
const subs = await base44.entities.PushSubscription.filter({ userEmail });

// Send to each
for (const sub of subs) {
  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      },
      JSON.stringify({
        title: 'CeriaKid',
        body: 'Anak anda ada 5 game baru!',
        url: '/dashboard'
      })
    );
  } catch (err) {
    // Cleanup expired subscriptions
    if (err.statusCode === 410) {
      await base44.entities.PushSubscription.delete(sub.id);
    }
  }
}
```

### Service Worker (`public/sw.js`):
- Handle push events
- Show notification
- Handle click → open URL

---

## 🤖 6. AI Services (via Base44 InvokeLLM)

### Overview:
- Currently using Base44's `InvokeLLM` integration
- Routes to OpenAI, Anthropic, Gemini (Base44 chooses)
- Credits-based billing (built into Base44)

### Models Available:
```
gpt-5-mini       — Default (cheap, fast)
gemini-3-flash   — Fast, supports web search
gemini-3-1-pro   — Pro tier, supports web search
gpt-5-4          — Better quality
gpt-5-5          — Top quality
claude-sonnet-4-6 — Anthropic
claude-opus-4-8   — Most expensive
```

### Usage:
```javascript
const result = await base44.integrations.Core.InvokeLLM({
  prompt: "Generate a math quiz question for Darjah 3",
  model: "gpt-5-mini",
  response_json_schema: {
    type: "object",
    properties: {
      question: { type: "string" },
      choices: { type: "array", items: { type: "string" } },
      correctIndex: { type: "number" }
    }
  }
});
```

### Migration Notes:
- ⚠️ If migrating off Base44, must use OpenAI/Anthropic direct
- ⚠️ Will need own API keys (OPENAI_API_KEY, ANTHROPIC_API_KEY)
- ⚠️ Cost might be higher (no Base44 wholesale pricing)
- ⚠️ Need to implement own credit/billing system

### Direct OpenAI Migration:
```javascript
import OpenAI from 'npm:openai';
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const response = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    { role: 'system', content: 'You are Cikgu Firdaus...' },
    { role: 'user', content: userMessage }
  ],
  response_format: { type: 'json_object' }
});
```

---

## 🖼️ 7. Image Generation

### Currently:
```javascript
const { url } = await base44.integrations.Core.GenerateImage({
  prompt: "Pixar 3D style child character...",
  existing_image_urls: [referenceUrl]  // Optional
});
```

### Alternative APIs (if migrating):
- **OpenAI DALL-E 3** — High quality
- **Replicate** — Cheap, various models
- **Stability AI** — SDXL
- **Midjourney API** — No official API yet

---

## 📁 8. File Storage

### Currently (Base44):
```javascript
const { file_url } = await base44.integrations.Core.UploadFile({ file });
// Files served from media.base44.com
```

### Migration to Supabase Storage:
```javascript
const { data, error } = await supabase.storage
  .from('uploads')
  .upload(`avatars/${userId}/${filename}`, file);

const { data: { publicUrl } } = supabase.storage
  .from('uploads')
  .getPublicUrl(`avatars/${userId}/${filename}`);
```

### Storage Buckets to Create (Supabase):
- `avatars` — User/child avatars (public)
- `uploads` — General uploads (public)
- `private` — Sensitive files (signed URLs)

---

## 📊 Integration Health Check

### Function: `runHealthCheck`
Checks status of all integrations:
```
✅ CHIP API responsive
✅ Resend API responsive
✅ Supabase responsive
✅ FB CAPI responsive
✅ AI/InvokeLLM working
```

Results saved to `HealthCheckLog` entity.

---

## 🔄 Backup Strategy per Integration

| Service | What's at risk | Backup |
|---|---|---|
| CHIP | Transaction records | Stored at CHIP indefinitely |
| Resend | Email send history | 30-day retention at Resend |
| Supabase | Mirror data | Daily backup (Supabase auto) |
| FB Pixel/CAPI | Event history | Tracked in FB Events Manager |
| Web Push | Subscriptions | In PushSubscription entity |
| Base44 Storage | Files (avatars, uploads) | ⚠️ Only at Base44 currently |

### ⚠️ File Storage Risk:
**If Base44 down → files at `media.base44.com` may be inaccessible**

**Mitigation:**
1. Monthly: Download all avatars/files via script
2. Upload to Supabase Storage as backup
3. Update URLs if migration needed

---

> Next: Read `06_SUPABASE_MIGRATION.md` untuk full migration steps.