# 🔧 3rd-Party Dashboard Configuration Checklist

> Step-by-step apa kena update di setiap service dashboard bila migrate.
> Includes: CHIP, Resend, FB Business Manager, Cloudflare DNS, Supabase.
> Last updated: 2026-05-30

---

## 1️⃣ CHIP Payment Gateway

**Dashboard:** https://gate.chip-in.asia
**Login:** Owner account email

### Required updates

#### A. Webhook URL
```
Navigate: Developer → Webhooks
Action: Edit existing webhook
```

| Field | Value |
|---|---|
| URL | `https://YOUR-NEW-DOMAIN.com/api/chipWebhook` |
| Events | `purchase.paid`, `purchase.cancelled`, `purchase.refunded` |
| Signing Secret | Copy existing `CHIP_WEBHOOK_SECRET` (don't regenerate!) |
| Status | Active |

**⚠️ Tips:**
- JANGAN delete old webhook URL — tukar je. Old URL boleh diretain sebagai backup 7 hari.
- Test "Send test event" → verify 200 OK response dari new endpoint.

#### B. Success/Failure URLs (per integration code)
Update dalam `chipCheckout` function:
```javascript
success_redirect: 'https://NEW-DOMAIN.com/thank-you?sub_id={SUBSCRIPTION_ID}'
failure_redirect: 'https://NEW-DOMAIN.com/pricing?failed=1'
cancel_redirect:  'https://NEW-DOMAIN.com/pricing?cancelled=1'
success_callback: 'https://NEW-DOMAIN.com/api/chipWebhook'
```

#### C. Brand settings (cosmetic)
```
Navigate: Brand → Edit
```
- Logo URL: pointing to new domain `https://NEW-DOMAIN.com/icon-512.png`
- Brand name: kekal "CeriaKid"
- Support email: kekal

### Verification
```bash
# Test webhook reachable
curl -X POST https://NEW-DOMAIN.com/api/chipWebhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
# Expected: 200 OK (or signature validation error — that's OK)
```

---

## 2️⃣ Resend (Email)

**Dashboard:** https://resend.com
**Login:** Owner account email

### Required updates

#### A. Domain verification (IF tukar domain)
```
Navigate: Domains → Add Domain
```
- Add new domain (cth: `ceriakid.com` — sama je kalau tak tukar)
- Resend akan generate DNS records:
  ```
  TXT record: _resend.ceriakid.com → "<verification_token>"
  MX record: feedback-smtp.us-east-1.amazonses.com (priority 10)
  TXT (SPF): "v=spf1 include:amazonses.com ~all"
  TXT (DKIM): 3 records dari Resend
  CNAME (DMARC): _dmarc.ceriakid.com → DMARC policy
  ```
- Add records ke DNS provider (Section 4 below)
- Wait 30-60 minutes untuk propagation
- Click "Verify" di Resend dashboard

#### B. API key (kalau tukar)
```
Navigate: API Keys → Create new
```
- Name: `production-new-platform`
- Permission: `Sending access` (limit scope)
- Copy key → save as `RESEND_API_KEY` env var di new platform
- **JANGAN delete old key** sehingga migration confirm success

#### C. Webhook (recommended baru — for bounce tracking)
```
Navigate: Webhooks → Add Endpoint
```

| Field | Value |
|---|---|
| URL | `https://NEW-DOMAIN.com/api/resendWebhook` |
| Events | `email.bounced`, `email.complained`, `email.delivered` |
| Signing Secret | Copy → save as `RESEND_WEBHOOK_SECRET` |

#### D. From address
Update env var:
```
RESEND_FROM_EMAIL=CeriaKid <noreply@ceriakid.com>
```

### Verification
```bash
# Send test email via API
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "CeriaKid <noreply@ceriakid.com>",
    "to": ["your-email@example.com"],
    "subject": "Test from new platform",
    "html": "<p>Test successful</p>"
  }'
```

---

## 3️⃣ Facebook Business Manager

**Dashboard:** https://business.facebook.com
**Login:** Business admin account

### Required updates

#### A. Domain verification
```
Navigate: Brand Safety → Domains
```
- Add domain (kalau baru): `ceriakid.com`
- Verification methods (pilih satu):
  - **DNS TXT record** (recommended)
    ```
    TXT @ → "facebook-domain-verification=<token>"
    ```
  - **Meta tag** dalam `<head>`:
    ```html
    <meta name="facebook-domain-verification" content="<token>" />
    ```
  - **HTML file upload** ke root: `/<token>.html`
- Click "Verify Domain"

#### B. Pixel settings
```
Navigate: Events Manager → Data Sources → Pixel
```
- **Pixel ID:** kekal sama (no change needed)
- **Connected domains:** add new domain kalau tukar
- **Test events:** verify pixel firing dari new platform
  - Open https://NEW-DOMAIN.com
  - Check "Test Events" tab → should see PageView event
  - Verify `event_id` present (for CAPI dedup)

#### C. Conversions API (CAPI) settings
```
Navigate: Events Manager → Pixel → Settings → Conversions API
```
- **Access token:** kekal sama (or regenerate kalau tukar account)
- **Domain matching:** verify domain auth
- **Test events:** send test event from server
  ```bash
  curl -X POST "https://graph.facebook.com/v18.0/PIXEL_ID/events?access_token=TOKEN" \
    -H 'Content-Type: application/json' \
    -d '{
      "data": [{
        "event_name": "PageView",
        "event_time": 1717000000,
        "event_id": "test_123",
        "action_source": "website",
        "event_source_url": "https://NEW-DOMAIN.com"
      }],
      "test_event_code": "TEST12345"
    }'
  ```

#### D. Aggregated Event Measurement (AEM) for iOS 14+
```
Navigate: Events Manager → Aggregated Event Measurement
```
- Reconfigure 8 prioritized events:
  1. Purchase (priority 1)
  2. InitiateCheckout (priority 2)
  3. AddToCart (priority 3)
  4. CompleteRegistration (priority 4)
  5. ViewContent (priority 5)
  6-8. (custom events kalau ada)

---

## 4️⃣ DNS Provider (Cloudflare / Namecheap / etc)

**Dashboard:** depends on provider
**Example:** Cloudflare → https://dash.cloudflare.com

### Required updates

#### A. Lower TTL (24 jam SEBELUM migration day)
```
Navigate: DNS → Records
```
Change all production records:
```
TTL: 1 hour → 1 minute (60 seconds)
```
**Why:** Allow fast DNS propagation pada cutover day.

#### B. Main domain switch (ON migration day)
```
A record:     @ → NEW_PLATFORM_IP
CNAME:        www → NEW_PLATFORM_HOSTNAME
```

#### C. Email DNS records (from Resend)
```
TXT @ → "v=spf1 include:amazonses.com ~all"
MX @ → 10 feedback-smtp.us-east-1.amazonses.com
TXT @ → "<resend verification token>"
CNAME resend._domainkey → resend._domainkey.amazonses.com
CNAME (2 more DKIM records from Resend dashboard)
TXT _dmarc → "v=DMARC1; p=quarantine; rua=mailto:dmarc@ceriakid.com"
```

#### D. FB domain verification (from FB Business Manager)
```
TXT @ → "facebook-domain-verification=<token>"
```

#### E. SSL/TLS settings (Cloudflare specific)
```
Navigate: SSL/TLS → Overview
```
- Mode: **Full (strict)** — ensures encryption end-to-end
- Edge Certificate: Universal SSL active

#### F. Page Rules / Caching
```
Cache everything:
*.ceriakid.com/static/* → Cache 1 month

Bypass cache (for API):
*.ceriakid.com/api/* → Bypass cache
```

### Verification
```bash
# Verify DNS propagation worldwide
dig ceriakid.com @8.8.8.8 +short
dig ceriakid.com @1.1.1.1 +short
dig ceriakid.com @208.67.222.222 +short
# All should return NEW IP after propagation

# Verify SSL
curl -I https://ceriakid.com
# Should return HTTP 200 + valid cert
```

---

## 5️⃣ Supabase Dashboard

**Dashboard:** https://app.supabase.com
**Login:** Owner account

### Required updates

#### A. Auth providers
```
Navigate: Authentication → Providers
```
- **Email:** Enabled ✅
  - Confirm email: OPTIONAL (off untuk fast onboarding, on untuk security)
  - Secure email change: ON
- **Magic link:** Enabled (kalau guna)
- **Google OAuth:** Configure jika perlu (Client ID + Secret dari Google Cloud Console)

#### B. URL Configuration
```
Navigate: Authentication → URL Configuration
```
| Field | Value |
|---|---|
| Site URL | `https://ceriakid.com` |
| Redirect URLs | `https://ceriakid.com/*`, `http://localhost:5173/*` (dev) |

#### C. Email templates (override default)
```
Navigate: Authentication → Email Templates
```
Customize:
- **Confirm signup** → custom HTML matching brand
- **Reset password** → custom HTML (atau better: send via Resend custom)
- **Magic link** → custom HTML

⚠️ Note: Supabase free tier ada rate limit 3 emails/hour. **Recommend pakai Resend untuk semua emails** (override via custom auth hooks).

#### D. Storage buckets
```
Navigate: Storage → Buckets
```
Verify buckets exist (per doc 09):
- `ck-assets` (public) → for migrated images
- `ck-user-uploads` (authenticated) → for user lukisan
- `ck-bbm-resources` (public) → for BBM PDFs

For each bucket, verify RLS policies:
```sql
-- Public read on ck-assets
CREATE POLICY "Public read" ON storage.objects FOR SELECT
USING (bucket_id = 'ck-assets');

-- Authenticated upload on ck-user-uploads
CREATE POLICY "Auth upload" ON storage.objects FOR INSERT
TO authenticated WITH CHECK (bucket_id = 'ck-user-uploads');
```

#### E. Edge Functions deployment
```
Navigate: Edge Functions → Deploy
```
Deploy all 67 functions (via Supabase CLI):
```bash
supabase functions deploy chipWebhook --no-verify-jwt  # public webhook
supabase functions deploy chipCheckout                 # auth required
supabase functions deploy sendWelcomeEmail
# ... (semua 67 functions)
```

#### F. Database secrets (Vault)
```
Navigate: Project Settings → Vault
```
Add all secrets:
- `CHIP_SECRET_KEY`
- `CHIP_BRAND_ID`
- `CHIP_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_WEBHOOK_SECRET` (new)
- `FB_PIXEL_ID`
- `FB_ACCESS_TOKEN`
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`
- `MIGRATION_ADMIN_TOKEN` (one-time use)

#### G. Cron jobs (pg_cron)
```
Navigate: Database → Extensions → pg_cron (enable)
```
Create scheduled jobs per doc 13:
```sql
SELECT cron.schedule(
  'sync-to-supabase',
  '0 */3 * * *',  -- Every 3 hours
  $$ SELECT net.http_post(
    url:='https://YOUR-PROJECT.supabase.co/functions/v1/syncToSupabase',
    headers:='{"Authorization": "Bearer SERVICE_KEY"}'::jsonb
  ); $$
);

-- Repeat for other 6 scheduled tasks
```

---

## 6️⃣ Hosting Provider (Vercel / Netlify)

**Dashboard:** https://vercel.com (or https://app.netlify.com)

### Required updates

#### A. Project setup
```
Navigate: New Project → Import from GitHub
```
- Repository: your CeriaKid repo
- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Node version: 20.x

#### B. Environment variables
```
Navigate: Settings → Environment Variables
```
Add for Production:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_FB_PIXEL_ID`
- `VITE_CHIP_PUBLIC_KEY` (kalau ada)

⚠️ Note: Only `VITE_*` prefixed vars accessible from frontend. Backend secrets stay in Supabase Vault.

#### C. Custom domain
```
Navigate: Settings → Domains → Add
```
- Add `ceriakid.com` and `www.ceriakid.com`
- Vercel/Netlify will auto-issue SSL cert (Let's Encrypt)
- Update DNS records (point to Vercel/Netlify IP)

#### D. Edge config (Vercel specific)
- Set regions: `sin1` (Singapore — nearest to Malaysia)
- Enable Vercel Analytics (optional)

---

## 7️⃣ Other Services (if applicable)

### Google Analytics (kalau ada)
```
Navigate: Admin → Property → Data Streams
```
- Add new domain to data stream
- Verify gtag.js firing dari new platform

### Sentry / Error tracking (kalau guna)
```
Navigate: Project Settings → Client Keys (DSN)
```
- Update allowed domains
- Add new domain to CSP whitelist

### Mailchimp / Newsletter (kalau ada)
- Update signup form embed code
- Update audience source domain

---

## 📋 Master Checklist Order

**Day -7 to -1 (preparation):**
- [ ] CHIP: ID old webhook URL untuk reference
- [ ] Resend: verify domain (kalau tukar)
- [ ] FB: verify new domain
- [ ] DNS: lower TTL ke 60s
- [ ] Hosting: deploy staging, smoke test
- [ ] Supabase: deploy semua functions

**Day 0 (cutover, in this order):**
- [ ] CHIP: update webhook URL (FIRST — payments critical)
- [ ] Resend: API key rotation (kalau perlu)
- [ ] FB: verify new domain final
- [ ] DNS: A/CNAME switch (last — actual traffic redirect)
- [ ] Supabase: activate cron jobs

**Day +1 (verification):**
- [ ] CHIP: send test payment, verify webhook arrived
- [ ] Resend: send test email, verify delivery
- [ ] FB: check Events Manager — no dedup issues
- [ ] DNS: verify propagation worldwide
- [ ] Supabase: verify cron jobs executed

---

## 🆘 Common Issues & Solutions

| Issue | Likely cause | Fix |
|---|---|---|
| CHIP webhook 404 | URL typo | Double-check URL, test with curl |
| Resend emails not arriving | DNS not propagated | Wait 1h, check `dig TXT` records |
| FB Pixel double-counting | Missing `eventID` | Add eventID to all `fbq()` + CAPI calls |
| SSL cert error | Cloudflare mode mismatch | Set "Full (strict)" mode |
| Function timeout | Cold start | Add warming cron job (every 5 min ping) |
| Auth login fails | Redirect URL not whitelisted | Add new domain to Supabase Auth → URL Config |

---

> Lepas semua section dah check, migration kit complete = **99% identical clone** to production.