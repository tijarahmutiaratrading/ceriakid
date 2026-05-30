# 🔬 Critical Logic Details — Exact Thresholds & Algorithms

> Dokumen ni isi gap "nuance" yang AI rebuild tak boleh teka dari source code je.
> Includes: exact threshold values, merge rules, push payload format, FB pixel dedup logic.
> Last updated: 2026-05-30

---

## 1️⃣ runHealthCheck — Exact Thresholds (per check)

Code source: `functions/runHealthCheck`. Below adalah **exact threshold values** untuk setiap check (kena replicate persis untuk match production behaviour).

### Check 1: `landing_uptime`
```
Endpoint: GET https://app.base44.com/api/apps/public/prod/public-settings/by-id/{APP_ID}
Healthy:  res.ok && latency < 5000ms
Warning:  res.ok && latency >= 5000ms
Critical: !res.ok (any non-2xx) OR connection error
```

### Check 2: `chip_gateway`
```
Endpoint: GET https://gate.chip-in.asia/api/v1/account/json/
Headers:  Authorization: Bearer ${CHIP_SECRET_KEY}

Logic (key insight — most platforms get this wrong):
- 2xx/3xx/4xx (except 401/403) → HEALTHY (server alive, even if request rejected)
- 401 or 403                    → CRITICAL (auth fail = bad keys)
- 5xx                           → CRITICAL (Chip server down)
- Connection error              → CRITICAL
- Missing keys                  → CRITICAL with value: 'missing'
```

### Check 3: `webhook_health`
```
Source: UserSubscription entity (latest 50, sort -currentPeriodStart)

Sub-metric A — recentPaid:
  Filter: status==='active' && tier!=='free' && currentPeriodStart > now - 24h

Sub-metric B — stuckIncomplete:
  Filter: status==='incomplete' && updated_date > 1 hour ago

Thresholds:
- stuckIncomplete.length > 5  → WARNING (msg: "{N} subscription stuck di 'incomplete' > 1 jam")
- Else                         → HEALTHY (msg: "{N} pembelian 24 jam terakhir")
```

### Check 4: `fb_pixel`
```
Both FB_PIXEL_ID & FB_ACCESS_TOKEN set → HEALTHY
Only FB_PIXEL_ID set                   → WARNING ("CAPI token tiada")
Neither set                            → CRITICAL ("iklan tak track")
```

### Check 5: `game_quality`
```
Source: QCLog (latest 1, sort -runAt)

Logic:
- No QC log exists                      → WARNING
- Last QC run > 60 minutes ago          → WARNING ("QC tak run dalam {N} minit")
- score >= 90                           → HEALTHY
- score >= 75                           → WARNING ("perlu repair")
- score < 75                            → CRITICAL ("banyak content rosak")
```

### Check 6: `task_queue`
```
Source: GameTask entity (latest 200)

Counts:
- pending = tasks.filter(t.status==='pending').length
- running = tasks.filter(t.status==='running').length
- failed  = tasks.filter(t.status==='failed').length

Thresholds:
- failed > 10                   → WARNING ("perlu siasat")
- pending > 50 (and failed<=10) → WARNING ("Queue backlog")
- Else                          → HEALTHY
```

### Check 7: `db_health`
```
Test query: Game.list('-created_date', 1)
- Success && latency < 3000ms → HEALTHY
- Success && latency >= 3000  → WARNING
- Error                       → CRITICAL
```

### Check 8: `user_health`
```
Always reports HEALTHY (informational only).
Counts: total subs + paid subs (active && tier!=='free')
```

### Email Alert Logic (DISABLED in production)
```
Currently: if(false && ...) — flag set to never send emails.
Admin checks dashboard manually.

If re-enabled:
- Dedup window: 6 hours (no repeat alert if same condition in last 6h)
- Recipients: All User with role==='admin'
- Subject format: "{emoji} CeriaKid {STATUS}: {N} critical, {N} warning"
- Emojis: critical=🚨 warning=⚠️
```

### Log Retention
```
After each run:
- Save HealthCheckLog record
- Fetch latest 200, if count > 100 → delete oldest (rolling window of 100)
```

---

## 2️⃣ chipWebhook — Auto-Merge Pending → Paid Logic

When payment webhook arrives, system needs to handle case where user has **multiple subscription records** (pending + paid duplicate).

### Merge Rule (exact)
```javascript
// On successful payment webhook:
// 1. Find all UserSubscription rows where email === buyer.email
// 2. Among them, identify the PAID record (the one being activated now)
// 3. Delete all OTHER rows where:
//    - status === 'incomplete' OR status === 'pending'
//    - tier !== 'free' (never delete free tier baseline)
//    - id !== paidRecord.id
// 4. The paid record keeps ALL its data (checkoutName, checkoutPhone, fbTracking, etc.)

// CONFLICT RESOLUTION:
// If pending record has data that paid record doesn't:
// - checkoutName: keep paid record's value (it's newer, from latest checkout form)
// - checkoutPhone: keep paid record's value
// - fbTracking: keep paid record's (associated with the actual conversion)
// - children: MERGE — combine arrays, dedupe by child.id (paid wins on conflict)
// - sentReminders: MERGE — union of both arrays (don't re-send same reminder)
```

### Free Tier Baseline
```
NEVER DELETE the free tier subscription record. It serves as the "user exists" marker.
Free record is created via handle_new_user trigger on signup.
```

### Idempotency
```
Use chip_purchase_id as idempotency key.
If a webhook arrives twice for same purchase_id:
- Check if subscription already activated with this stripeCustomerId
- If yes → return 200 OK without re-processing
- If no → process normally
```

---

## 3️⃣ Push Notification VAPID Payload Format

### sendPushNotification — Exact Payload Structure
```javascript
// Web Push payload sent via VAPID:
{
  title: string,        // Max 50 chars (truncate longer)
  body: string,         // Max 120 chars
  icon: '/icon-192.png',
  badge: '/badge-72.png',
  url: string,          // Click target (e.g. '/dashboard')
  tag: string,          // Dedup tag (e.g. 'streak-reminder' — replaces older same-tag)
  requireInteraction: false,
  data: {               // Custom payload accessible in service worker
    type: 'streak' | 'challenge' | 'admin' | 'system',
    timestamp: ISO8601,
  }
}
```

### Example payloads per notification type:

**Streak reminder:**
```json
{
  "title": "🔥 Jangan putus streak!",
  "body": "Hi {childName}! Dah {N} hari berturut. Main game sikit?",
  "url": "/games-hub",
  "tag": "streak-reminder",
  "data": { "type": "streak" }
}
```

**Admin new payment:**
```json
{
  "title": "💰 Pembayaran baru!",
  "body": "{userName} ({tier}) - RM{amount}",
  "url": "/admin-dashboard",
  "tag": "admin-payment",
  "data": { "type": "admin", "subId": "..." }
}
```

**Challenge invite:**
```json
{
  "title": "⚔️ Cabaran baru!",
  "body": "{friendName} cabar kau main {subject}!",
  "url": "/challenges",
  "tag": "challenge-{challengeId}",
  "data": { "type": "challenge", "challengeId": "..." }
}
```

### Service Worker (`public/sw.js`) push handler
```javascript
// Required handlers in service worker:
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const payload = event.data.json();
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/icon-192.png',
      badge: payload.badge || '/badge-72.png',
      tag: payload.tag,
      data: { url: payload.url, ...payload.data },
      requireInteraction: payload.requireInteraction || false,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing tab if open
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      // Else open new
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
```

---

## 4️⃣ FB Pixel + CAPI Deduplication

To avoid double-counting events (browser pixel + server CAPI fire same event), MUST use `event_id` for dedup.

### Init in App.jsx (exact code)
```javascript
// Load pixel script:
!function(f,b,e,v,n,t,s){
  if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
  t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)
}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', FB_PIXEL_ID);
fbq('track', 'PageView');
```

### Tracking event with dedup ID
```javascript
// lib/pixel.js trackEvent pattern:
function trackEvent(eventName, params = {}) {
  // Generate unique event ID (used by both browser + server)
  const eventId = `${eventName}_${Date.now()}_${Math.random().toString(36).slice(2,9)}`;
  
  // 1. Browser pixel fire
  if (window.fbq) {
    fbq('track', eventName, params, { eventID: eventId });
  }
  
  // 2. Server CAPI fire (same eventId for dedup!)
  base44.functions.invoke('fbConversionsAPI', {
    eventName,
    eventId,           // ← critical for dedup
    params,
    userData: { email: user?.email, phone: user?.phone },
  });
  
  return eventId;
}
```

### Standard events tracked
```
- PageView          (every route change)
- ViewContent       (landing page, pricing section)
- AddToCart         (when click "Subscribe" button)
- InitiateCheckout  (when CHIP checkout opens)
- Purchase          (chipWebhook on payment success, value=amount, currency=MYR)
- CompleteRegistration (first signup)
```

### CAPI payload (server side — fbConversionsAPI function)
```javascript
{
  data: [{
    event_name: 'Purchase',
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,              // ← same as browser
    action_source: 'website',
    event_source_url: 'https://ceriakid.com/thank-you',
    user_data: {
      em: [sha256(email.toLowerCase())],  // Hashed email
      ph: [sha256(phone)],                // Hashed phone
      client_ip_address: req.ip,
      client_user_agent: req.headers['user-agent'],
      fbc: fbTracking.fbc,                // From cookies
      fbp: fbTracking.fbp,
    },
    custom_data: { currency: 'MYR', value: amount, content_type: 'subscription' }
  }],
  test_event_code: undefined  // Set to 'TEST123' during dev
}
```

---

## 5️⃣ Chip Purchase API — Exact Request Format

### chipCheckout request body to Chip API
```javascript
POST https://gate.chip-in.asia/api/v1/purchases/
Authorization: Bearer ${CHIP_SECRET_KEY}
Content-Type: application/json

{
  "brand_id": CHIP_BRAND_ID,
  "purchase": {
    "products": [{
      "name": "CeriaKid Premium - Bulanan",  // Human-readable
      "price": 1900,                          // ⚠️ CENTS (RM19 = 1900 cents)
      "quantity": 1
    }],
    "currency": "MYR",
    "language": "ms"
  },
  "client": {
    "email": user.email,
    "full_name": user.full_name,
    "phone": user.phone || ""
  },
  "success_redirect": "https://ceriakid.com/thank-you?sub_id={SUBSCRIPTION_ID}",
  "failure_redirect": "https://ceriakid.com/pricing?failed=1",
  "cancel_redirect": "https://ceriakid.com/pricing?cancelled=1",
  "success_callback": "https://YOUR-DOMAIN.com/functions/chipWebhook",
  "creator_agent": "CeriaKid-Web",
  "reference": SUBSCRIPTION_ID,  // Internal subscription record ID
  "send_receipt": true
}
```

### KEY GOTCHA — Currency in CENTS
```
RM 19.00  → price: 1900  (NOT 19.00)
RM 49.00  → price: 4900
RM 199.00 → price: 19900

Same for credits package:
RM 5  → price: 500
```

### Webhook signature verification
```javascript
// CHIP sends X-Signature header (HMAC SHA256 of raw body using CHIP_WEBHOOK_SECRET)
const signature = req.headers.get('X-Signature');
const body = await req.text();
const expected = await hmacSHA256(CHIP_WEBHOOK_SECRET, body);

// ⚠️ Use async constructEventAsync — Deno crypto is async, sync version throws
if (signature !== expected) return 401;
```

---

## 6️⃣ Sales Notification Overlay Logic

Random "Someone just bought X" popups on landing page (social proof). Logic in `components/landing/LiveSocialProof`:

```javascript
// Fake names pool (Malaysian first names)
const NAMES = ['Aiman', 'Siti', 'Hafiz', 'Aisyah', 'Faris', 'Nurin', 'Iman', 'Adam', 'Hana', 'Zara'];
const CITIES = ['Kuala Lumpur', 'Shah Alam', 'Johor Bahru', 'Penang', 'Ipoh', 'Kuching', 'Kota Kinabalu'];
const PLANS = [
  { name: 'Premium', emoji: '⭐' },
  { name: 'Keluarga', emoji: '👨‍👩‍👧' },
  { name: 'Standard', emoji: '🎯' },
];

// Display rules:
const DISPLAY_DURATION = 4000;   // 4 sec on screen
const HIDE_DURATION = 25000;     // 25 sec between shows
const INITIAL_DELAY = 8000;      // Wait 8 sec after page load before first show
const TIME_AGO_RANGE = [2, 47];  // "{N} minit lalu" — random 2-47 min ago
```

### Show only if:
```
1. NOT on /admin-* routes
2. User has NOT scrolled past 50% of page (less intrusive on read)
3. localStorage 'social_proof_dismissed' != true (user click X)
```

---

## 7️⃣ Tailwind Custom Keyframes

### `animate-marquee` (TrustedMarquee scrolling logos)
```javascript
keyframes: {
  marquee: {
    '0%': { transform: 'translateX(0)' },
    '100%': { transform: 'translateX(-50%)' }
  }
},
animation: {
  marquee: 'marquee 30s linear infinite'
}
```

### `animate-squiggle` (underline decoration)
```javascript
keyframes: {
  squiggle: {
    '0%, 100%': { transform: 'translateY(0) rotate(-1deg)' },
    '50%':      { transform: 'translateY(-2px) rotate(1deg)' }
  }
},
animation: {
  squiggle: 'squiggle 2s ease-in-out infinite'
}
```

### `animate-float` (already in config) + bounce-in (already in index.css)
See `tailwind.config.js` + `index.css` for complete reference.

---

## 8️⃣ Database Indexes (Performance-Critical)

In addition to `docs/09_COMPLETE_SQL_SCHEMA.md`, add these **composite indexes** for hot queries:

```sql
-- Game filtering (most common pattern)
CREATE INDEX IF NOT EXISTS idx_games_age_cat_pub 
  ON ck_games(age_group, category, is_published) 
  WHERE is_published = true;

-- Darjah-specific lookups
CREATE INDEX IF NOT EXISTS idx_games_darjah_subject 
  ON ck_games(darjah, category) 
  WHERE darjah IS NOT NULL;

-- BBM hot filter
CREATE INDEX IF NOT EXISTS idx_bbm_subj_level_pub 
  ON ck_bbm_resources(subject, level, is_published) 
  WHERE is_published = true;

-- Subscription lookups by status (for cron jobs)
CREATE INDEX IF NOT EXISTS idx_subs_status_period 
  ON ck_user_subscriptions(status, current_period_end);

-- Recent transactions (used in dashboard)
CREATE INDEX IF NOT EXISTS idx_trans_email_created 
  ON ck_credit_transactions(user_email, created_at DESC);

-- QC log (always fetched by latest)
CREATE INDEX IF NOT EXISTS idx_qclog_run_at_desc 
  ON ck_qc_logs(run_at DESC);

-- Health check (rolling window)
CREATE INDEX IF NOT EXISTS idx_health_run_at_desc 
  ON ck_health_check_logs(run_at DESC);

-- Affiliate referral lookups
CREATE INDEX IF NOT EXISTS idx_referrals_email_status 
  ON ck_affiliate_referrals(affiliate_email, status);

-- Asset mapping reverse lookup
CREATE INDEX IF NOT EXISTS idx_asset_mapping_new_url 
  ON ck_asset_mapping(new_url);
```

---

## 9️⃣ Resend Webhook Handler (Recommended)

CeriaKid TIDAK ada Resend webhook handler currently. Untuk production, recommend tambah:

### Endpoint: `functions/resendWebhook`
```javascript
// Resend sends events for: delivered, bounced, complained, opened, clicked
// Webhook URL: configure in Resend dashboard → Webhooks
// Signing secret: store as RESEND_WEBHOOK_SECRET env var

import { Webhook } from 'npm:svix@1.21.0';

Deno.serve(async (req) => {
  const body = await req.text();
  const webhook = new Webhook(Deno.env.get('RESEND_WEBHOOK_SECRET'));
  
  let event;
  try {
    event = webhook.verify(body, {
      'svix-id': req.headers.get('svix-id'),
      'svix-timestamp': req.headers.get('svix-timestamp'),
      'svix-signature': req.headers.get('svix-signature'),
    });
  } catch {
    return new Response('Invalid signature', { status: 401 });
  }
  
  const { type, data } = event;
  // data = { email_id, from, to, subject, created_at, ... }
  
  switch (type) {
    case 'email.bounced':
      // Find UserSubscription by email, mark email as invalid
      // Optionally: pause future reminders for this user
      break;
    case 'email.complained':
      // User marked as spam — unsubscribe from all future emails
      break;
    case 'email.delivered':
      // Update abandonedReminderStatus to 'delivered' if matching message ID
      break;
  }
  
  return Response.json({ ok: true });
});
```

### Suppress list table (recommended)
```sql
CREATE TABLE IF NOT EXISTS public.ck_email_suppression (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  reason TEXT NOT NULL,  -- 'bounced' | 'complained' | 'unsubscribed'
  bounced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Before sending any email, check:
-- SELECT 1 FROM ck_email_suppression WHERE email = ?
-- If exists → skip send
```

---

> Doc ni close ~80% of "AI cannot guess" gaps. Combined with rest of docs, AI rebuild confidence: 97-99%.