# 📧 Email Templates Reference

> All transactional email templates used by CeriaKid.
> Source: `functions/sendWelcomeEmail`, `sendAbandonedCartReminders`, etc.
> Last updated: 2026-05-30

---

## 🎯 Email Inventory

| # | Template | Trigger | Recipient |
|---|---|---|---|
| 1 | Welcome (Subscription) | Successful payment | New subscriber |
| 2 | Welcome (Credit Top-up) | Successful credit purchase | Buyer |
| 3 | Abandoned Cart Reminder | Incomplete checkout > 1 hr | Cart abandoner |
| 4 | Subscription Expiry | 30/14/7/1 days before expiry | Subscriber |
| 5 | Low Credit Warning | Balance < 5 credits | Paid user |
| 6 | Weekly Progress Report | Sunday 9am | Parent |

---

## 🎨 Design System

All emails use consistent styling:

```
Colors:
- Primary gradient: #a855f7 → #ec4899 (purple to pink)
- Credit gradient:  #f59e0b → #ef4444 (orange to red)
- Background:       #f8fafc (light slate)
- Text primary:     #1e293b (dark slate)
- Text secondary:   #475569 (medium slate)
- Text muted:       #94a3b8 (light slate)
- Warning:          #fef3c7 bg, #78350f text
- Success:          #25D366 (WhatsApp green)

Layout:
- Max width: 600px
- Border radius: 16px (container), 12px (buttons)
- Padding: 28px 24px (body)
- Font: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif

Brand Elements:
- App URL: https://ceriakid.com
- WhatsApp: 017-784 4120 (https://wa.me/60177844120)
- Footer: "© CeriaKid — Platform Pembelajaran Interaktif"
```

---

## 1️⃣ Welcome Email (Subscription)

**Function:** `sendWelcomeEmail` (type: `subscription`)
**Subject:** `🎉 Selamat datang ke CeriaKid — Pelan {Tier} anda dah aktif!`

**Sections:**
1. 🎉 Hero — Gradient header with tier name
2. Intro paragraph + bonus credits line (if applicable)
3. ⚠️ Important notice — User MUST register account first with same email
4. 🚀 CTA Button — Daftar/Login
5. 📋 4-Step Quick Start Guide
6. ✨ AI Features showcase (4 Cikgu agents)
7. 💬 WhatsApp support button
8. Footer

**Variables:**
- `{tierName}` — Asas / Standard / Keluarga
- `{bonusCredits}` — number (0-50)

**Full template:** See `functions/sendWelcomeEmail` lines 26-139

---

## 2️⃣ Welcome Email (Credit Top-up)

**Function:** `sendWelcomeEmail` (type: `credit`)
**Subject:** `💰 {credits} kredit AI dah masuk akaun anda!`

**Sections:**
1. 💰 Hero — Orange gradient with credit count
2. Greeting + thank you
3. List of 4 AI features that use credits
4. 🚀 CTA Button — Mula Guna Sekarang
5. 💬 WhatsApp support
6. Footer

**Variables:**
- `{credits}` — number (50, 150, 400, etc.)

**Full template:** See `functions/sendWelcomeEmail` lines 141-194

---

## 3️⃣ Abandoned Cart Reminder

**Function:** `sendAbandonedCartReminders` (scheduled every 1 hour)
**Subject:** `🛒 Anda lupa lengkapkan pembelian CeriaKid?`

**Sections:**
1. Friendly reminder with checkout name
2. Tier benefits recap
3. Limited-time bonus offer (kalau ada)
4. 🚀 Resume Checkout button
5. WhatsApp support
6. Footer with unsubscribe

**Variables:**
- `{checkoutName}` — full name from form
- `{tier}` — selected tier
- `{checkoutUrl}` — original CHIP checkout URL (still valid)

**Trigger:** UserSubscription where status='incomplete' AND created_date > 1hr ago AND abandonedReminderSent=false

---

## 4️⃣ Subscription Expiry Reminder

**Function:** `sendExpiryReminders` (called from chipWebhook & scheduled task)
**Subject variants:**
- 30 days: `📅 Subscription CeriaKid anda akan tamat dalam 30 hari`
- 14 days: `⏰ 14 hari lagi sebelum subscription tamat`
- 7 days: `🚨 Subscription tamat minggu depan — Renew sekarang!`
- 1 day: `⚠️ ESOK subscription anda tamat!`
- Expired: `❌ Subscription dah tamat — Pulihkan akses sekarang`

**Sections:**
1. Urgency indicator (countdown)
2. What user akan kehilangan kalau tak renew
3. Renew CTA (one-click)
4. WhatsApp support
5. Footer

**Variables:**
- `{daysLeft}` — 30, 14, 7, 1, or 0 (expired)
- `{currentPeriodEnd}` — formatted date
- `{tier}` — current tier
- `{renewUrl}` — checkout link

---

## 5️⃣ Low Credit Warning

**Function:** `sendLowCreditReminders` (daily 2am)
**Subject:** `⚠️ Kredit AI anda dah hampir habis (cuma {balance} tinggal)`

**Sections:**
1. Current balance display
2. List of features yang affected
3. Credit pack options (50, 150, 400)
4. 🚀 Top-up CTA
5. Footer

**Variables:**
- `{balance}` — current credit count (< 5)
- `{topUpUrl}` — /buy-credits page link

**Cooldown:** 14 days between reminders

---

## 6️⃣ Weekly Progress Report

**Function:** `sendWeeklyProgressReport` (Sunday 9am MY)
**Subject:** `📊 Laporan mingguan {childName} — {gamesPlayed} game minggu ni!`

**Sections:**
1. Hero — child name + week stats
2. Games played count
3. Stars earned
4. Top subjects practiced
5. Streak status
6. Achievements unlocked (if any)
7. Recommendations for next week
8. 🚀 View Full Dashboard CTA
9. Footer

**Variables:**
- `{childName}` — child's name
- `{gamesPlayed}` — count this week
- `{starsEarned}` — total stars this week
- `{topSubjects}` — array of {name, count}
- `{streak}` — current day streak
- `{achievements}` — array of new badges

---

## 🔄 Migration Strategy (Move to Supabase Edge Function)

### Step 1: Extract Templates to Separate Files

Create folder `supabase/functions/_shared/email-templates/`:
```
_shared/
├── email-templates/
│   ├── welcome-subscription.ts
│   ├── welcome-credit.ts
│   ├── abandoned-cart.ts
│   ├── expiry-reminder.ts
│   ├── low-credit.ts
│   └── weekly-progress.ts
└── send-email.ts  (Resend wrapper)
```

### Step 2: Template Function Pattern

```typescript
// supabase/functions/_shared/email-templates/welcome-subscription.ts
export function buildWelcomeSubscriptionEmail({ tier, bonusCredits }) {
  const TIER_LABEL = { asas: 'Asas', standard: 'Standard', keluarga: 'Keluarga' };
  const tierName = TIER_LABEL[tier] || tier;
  const APP_URL = 'https://ceriakid.com';
  
  return {
    subject: `🎉 Selamat datang ke CeriaKid — Pelan ${tierName} anda dah aktif!`,
    html: `<!DOCTYPE html>...`  // (paste from sendWelcomeEmail.js line 34-137)
  };
}
```

### Step 3: Send Wrapper

```typescript
// supabase/functions/_shared/send-email.ts
export async function sendEmail({ to, subject, html, from = 'CeriaKid <noreply@ceriakid.com>' }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  });
  return res.json();
}
```

### Step 4: Use in Edge Functions

```typescript
import { buildWelcomeSubscriptionEmail } from '../_shared/email-templates/welcome-subscription.ts';
import { sendEmail } from '../_shared/send-email.ts';

const email = buildWelcomeSubscriptionEmail({ tier: 'asas', bonusCredits: 20 });
await sendEmail({ to: 'user@example.com', ...email });
```

---

## ⚙️ Resend Configuration Required

```
1. Verify domain di Resend Dashboard
   - Add SPF record: TXT "v=spf1 include:resend.com ~all"
   - Add DKIM records (2 CNAMEs dari Resend)
   - Add DMARC: TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@ceriakid.com"

2. Setup From email
   - RESEND_FROM_EMAIL=noreply@ceriakid.com
   - Atau: CeriaKid <noreply@ceriakid.com>

3. API Key
   - Generate dari Resend Dashboard → API Keys
   - Set as RESEND_API_KEY secret
```

---

## 🧪 Testing Emails

```bash
# Test send via Resend API directly
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "CeriaKid <noreply@ceriakid.com>",
    "to": "your-test@email.com",
    "subject": "Test",
    "html": "<h1>Test email</h1>"
  }'
```

---

## 📊 Email Stats Tracking

All emails return `emailId` dari Resend yang boleh used untuk:
- Track delivery status (delivered, bounced, complained)
- Query Resend API for analytics
- Saved dalam UserSubscription.abandonedReminderMessageId untuk abandoned cart

Resend webhook events boleh setup untuk auto-update status — see Resend docs.