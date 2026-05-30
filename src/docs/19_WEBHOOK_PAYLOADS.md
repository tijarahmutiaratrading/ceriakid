# 🔗 Webhook Payloads — Real Examples

> Sample JSON payloads untuk semua incoming webhooks.
> Reference untuk implement webhook handlers di Supabase Edge Functions.
> Last updated: 2026-05-30

---

## 🎯 Webhooks Inventory

| # | Source | Endpoint | Purpose |
|---|---|---|---|
| 1 | CHIP Payment | `/functions/chipWebhook` | Payment status updates |
| 2 | Resend Email | `/functions/resendWebhook` (optional) | Email delivery status |
| 3 | Web Push (outbound) | n/a | We SEND, not receive |

---

## 1️⃣ CHIP Payment Webhook

**Endpoint:** `https://YOUR-APP/functions/chipWebhook`
**Method:** `POST`
**Content-Type:** `application/json`

### Headers
```
X-Signature: <HMAC-SHA256 signature>
Content-Type: application/json
User-Agent: chip-webhooks/1.0
```

### Event Types (Real CHIP Events)
- `purchase.created` — Purchase created (not paid yet)
- `purchase.paid` — Payment successful ✅
- `purchase.payment_failure` — Payment failed
- `purchase.cancelled` — User cancelled
- `purchase.refunded` — Refund processed
- `purchase.expired` — Checkout expired

### Sample Payload: `purchase.paid` (Subscription)
```json
{
  "id": "evt_01HXX7Y8Z9...",
  "type": "purchase.paid",
  "created_on": 1717050000,
  "event_type": "purchase.paid",
  "data": {
    "id": "p_01HXX7Y8Z9ABC...",
    "type": "purchase",
    "status": "paid",
    "client": {
      "email": "ahmad@example.com",
      "full_name": "Ahmad bin Ali",
      "phone": "60123456789"
    },
    "purchase": {
      "currency": "MYR",
      "total": 9900,
      "products": [
        {
          "name": "CeriaKid Pelan Asas (1 tahun)",
          "price": 9900,
          "quantity": 1
        }
      ]
    },
    "payment": {
      "payment_type": "card",
      "card_brand": "visa",
      "card_last_4": "4242"
    },
    "brand_id": "your_brand_id",
    "reference_generated": "REF-001234",
    "is_test": false,
    "created_on": 1717050000,
    "updated_on": 1717050000,
    "paid_on": 1717050000
  }
}
```

### Sample Payload: `purchase.paid` (Credit Top-up)
```json
{
  "id": "evt_01HXX8Y9Z0...",
  "type": "purchase.paid",
  "data": {
    "id": "p_01HXX8Y9Z0DEF...",
    "status": "paid",
    "client": {
      "email": "ahmad@example.com",
      "full_name": "Ahmad bin Ali",
      "phone": "60123456789"
    },
    "purchase": {
      "currency": "MYR",
      "total": 1900,
      "products": [
        {
          "name": "150 Kredit AI + 30 Bonus",
          "price": 1900,
          "quantity": 1
        }
      ]
    },
    "reference_generated": "CRED-150-1234"
  }
}
```

### Sample Payload: `purchase.payment_failure`
```json
{
  "id": "evt_01HXX9...",
  "type": "purchase.payment_failure",
  "data": {
    "id": "p_01HXX9...",
    "status": "error",
    "client": {
      "email": "ahmad@example.com"
    },
    "error": {
      "code": "card_declined",
      "message": "Your card was declined"
    }
  }
}
```

### Webhook Signature Verification

```javascript
import { createHmac } from 'node:crypto';

function verifyChipSignature(rawBody, signature, secret) {
  const computed = createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  return computed === signature;
}

// Usage in handler:
const rawBody = await req.text();  // Get RAW body BEFORE parsing
const signature = req.headers.get('x-signature');
const isValid = verifyChipSignature(rawBody, signature, Deno.env.get('CHIP_WEBHOOK_SECRET'));

if (!isValid) {
  return new Response('Invalid signature', { status: 401 });
}

const event = JSON.parse(rawBody);
```

### Reference Decoding (How We Extract Tier/Credits)

The `reference_generated` field contains the SKU pattern:
```
Subscription:  REF-{tier}-{timestamp}   → REF-asas-1234
Credit pack:   CRED-{credits}-{timestamp} → CRED-150-1234
```

Code:
```js
function parseReference(ref) {
  if (ref.startsWith('REF-')) {
    const [, tier] = ref.split('-');
    return { type: 'subscription', tier };
  }
  if (ref.startsWith('CRED-')) {
    const [, credits] = ref.split('-');
    return { type: 'credit', credits: parseInt(credits) };
  }
  return null;
}
```

### What chipWebhook Does (Side Effects)

```
1. Verify signature ✅
2. Parse event type
3. If purchase.paid:
   a. Find/create UserSubscription by email
   b. Set status: "active"
   c. Set currentPeriodStart/End (1 year)
   d. Send welcome email (sendWelcomeEmail)
   e. Track FB Conversions API (Purchase event)
   f. Process affiliate commission if referralCode
   g. Reset abandonedReminderSent flag
   h. If credit type: add credits via addCredits
4. Return 200 OK (CHIP retries on non-200)
```

---

## 2️⃣ Resend Email Webhook (Optional)

**Endpoint:** `https://YOUR-APP/functions/resendWebhook` (NOT YET IMPLEMENTED)
**Method:** `POST`

### Event Types
- `email.sent` — Email sent successfully
- `email.delivered` — Email delivered to inbox
- `email.bounced` — Hard bounce
- `email.complained` — User marked as spam
- `email.opened` — User opened email (if tracking enabled)
- `email.clicked` — User clicked link

### Sample Payload: `email.delivered`
```json
{
  "type": "email.delivered",
  "created_at": "2026-05-30T10:00:00.000Z",
  "data": {
    "email_id": "4ef9a417-...",
    "from": "CeriaKid <noreply@ceriakid.com>",
    "to": ["ahmad@example.com"],
    "subject": "🎉 Selamat datang ke CeriaKid",
    "created_at": "2026-05-30T09:59:55.000Z"
  }
}
```

### Sample Payload: `email.bounced`
```json
{
  "type": "email.bounced",
  "data": {
    "email_id": "4ef9a417-...",
    "to": ["nonexistent@example.com"],
    "bounce": {
      "type": "Permanent",
      "subType": "General",
      "message": "Mailbox does not exist"
    }
  }
}
```

### Setup (When Ready to Implement)
```
1. Resend Dashboard → Webhooks → Add Endpoint
2. URL: https://YOUR-APP/functions/resendWebhook
3. Events: delivered, bounced, complained
4. Save webhook signing secret to env: RESEND_WEBHOOK_SECRET
```

### Suggested Handler Logic
```js
// Track delivery status in UserSubscription
if (event.type === 'email.delivered') {
  await base44.entities.UserSubscription.filter({
    abandonedReminderMessageId: event.data.email_id
  }).then(rows => {
    if (rows[0]) {
      base44.entities.UserSubscription.update(rows[0].id, {
        abandonedReminderStatus: 'delivered'
      });
    }
  });
}

// Auto-unsubscribe bounced emails
if (event.type === 'email.bounced') {
  // Add to suppression list, stop sending future emails
}
```

---

## 3️⃣ Web Push Subscription (Inbound from Browser)

**NOT a webhook** — this is data sent FROM browser TO our `subscribeToPush` function when user enables notifications.

### Payload Browser Sends
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/eXaMpLe...",
  "expirationTime": null,
  "keys": {
    "p256dh": "BNcRdreALRFXTkOOUHK1...",
    "auth": "tBHItJI5svbpez7KI4CCXg=="
  },
  "deviceLabel": "Chrome on Windows"
}
```

### What We Save (PushSubscription entity)
```json
{
  "userEmail": "user@example.com",
  "endpoint": "https://fcm.googleapis.com/fcm/send/eXaMpLe...",
  "p256dh": "BNcRdreALRFXTkOOUHK1...",
  "auth": "tBHItJI5svbpez7KI4CCXg==",
  "deviceLabel": "Chrome on Windows",
  "isAdmin": false
}
```

---

## 🔐 Webhook Security Checklist

```
✅ ALWAYS verify signature (CHIP_WEBHOOK_SECRET)
✅ Use req.text() to get RAW body BEFORE parsing for signature check
✅ Return 200 OK ASAP (process async if heavy)
✅ Make handlers IDEMPOTENT (check if already processed)
✅ Log all incoming webhooks for debugging
✅ Set timeout limits (CHIP retries on timeout)
❌ NEVER trust webhook body without signature verification
❌ NEVER process duplicate events twice
```

---

## 🧪 Testing Webhooks Locally

### Option 1: Use ngrok
```bash
# Expose local function to internet
ngrok http 8000

# Update CHIP webhook URL to ngrok URL temporarily
# https://abc123.ngrok.io/functions/chipWebhook
```

### Option 2: CHIP Test Mode
```
1. CHIP Dashboard → Switch to Test Mode
2. Make test purchase with test card: 4242 4242 4242 4242
3. Webhook fires with is_test: true
```

### Option 3: Replay Webhook
```bash
# Replay sample payload to local function
curl -X POST http://localhost:8000/functions/chipWebhook \
  -H "Content-Type: application/json" \
  -H "X-Signature: $(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$CHIP_WEBHOOK_SECRET" -hex | cut -d' ' -f2)" \
  -d "$PAYLOAD"
```

---

## 📊 Webhook Monitoring

### What to Log
```js
console.log({
  event: 'webhook_received',
  source: 'chip',
  type: event.type,
  purchaseId: event.data.id,
  email: event.data.client.email,
  signatureValid: isValid,
  duration: Date.now() - startTime
});
```

### What to Alert On
- ❌ Invalid signatures (potential attack)
- ❌ Processing errors (500 responses)
- ❌ Duplicate events (data integrity issue)
- ❌ Webhook latency > 5 seconds