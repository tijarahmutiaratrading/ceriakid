# 🔐 Secrets & Environment Variables

> Complete inventory of all secrets, API keys, and env vars. Security guide included.

---

## ⚠️ Security First

### 🟢 SAFE to store in GitHub:
- Public URLs
- Pixel IDs (FB_PIXEL_ID)
- VAPID public key
- Supabase URL
- Supabase ANON key (limited by RLS)

### 🔴 NEVER store in GitHub:
- Service keys (admin access)
- API secrets
- Webhook secrets
- Private VAPID key
- Database passwords

### 📋 Where to store private secrets:
1. ✅ **Base44 dashboard** (current — secrets management)
2. ✅ **1Password / Bitwarden** (password manager)
3. ✅ **Supabase secrets** (if migrating)
4. ✅ **Vercel env vars** (if hosting frontend)
5. ✅ **Encrypted note to self** (private email backup)

---

## 📋 Complete Secrets Inventory

### Currently in Base44:
```
✅ VAPID_SUBJECT
✅ VAPID_PRIVATE_KEY
✅ VAPID_PUBLIC_KEY
✅ SUPABASE_SERVICE_KEY
✅ SUPABASE_URL
✅ RESEND_FROM_EMAIL
✅ RESEND_API_KEY
✅ CHIP_WEBHOOK_SECRET
✅ FB_ACCESS_TOKEN
✅ FB_PIXEL_ID
✅ CHIP_BRAND_ID
✅ CHIP_SECRET_KEY
```

---

## 🔑 Detailed Secret Reference

### 💳 CHIP (Payment Gateway)

#### `CHIP_SECRET_KEY`
- **Type:** API secret (Bearer token)
- **Format:** `sk_live_xxxxx` or `sk_test_xxxxx`
- **Get from:** https://dashboard.chip-in.asia → Settings → API Keys
- **Used by:** chipCheckout, chipCreditCheckout, chipWebhook
- **Security:** 🔴 PRIVATE — backend only

#### `CHIP_BRAND_ID`
- **Type:** Brand identifier
- **Format:** UUID
- **Get from:** CHIP dashboard → Brands
- **Used by:** chipCheckout, chipCreditCheckout
- **Security:** 🟡 Semi-private (OK in backend)

#### `CHIP_WEBHOOK_SECRET`
- **Type:** Webhook signature secret
- **Format:** Random string
- **Get from:** CHIP dashboard → Webhooks → [your webhook] → Secret
- **Used by:** chipWebhook (signature verification)
- **Security:** 🔴 PRIVATE — backend only

**Setup webhook:**
```
1. CHIP dashboard → Webhooks → Add
2. URL: https://your-app.com/functions/chipWebhook
3. Events: 
   - purchase.created
   - purchase.paid
   - purchase.refunded
4. Copy webhook secret
5. Save as CHIP_WEBHOOK_SECRET
```

---

### 📧 Resend (Email)

#### `RESEND_API_KEY`
- **Type:** API key
- **Format:** `re_xxxxxxxx`
- **Get from:** https://resend.com/api-keys
- **Used by:** All sendXxxEmail functions
- **Security:** 🔴 PRIVATE — backend only

#### `RESEND_FROM_EMAIL`
- **Type:** Sender email address
- **Format:** `email@yourdomain.com` or `Name <email@yourdomain.com>`
- **Setup:** Verify domain at Resend first
- **Used by:** All email functions
- **Security:** 🟢 OK (public anyway)

**Domain verification:**
```
1. Resend dashboard → Domains → Add
2. Add DNS records:
   - SPF: TXT @ "v=spf1 include:_spf.resend.com ~all"
   - DKIM: 3 CNAME records
   - DMARC: TXT _dmarc "v=DMARC1; p=none"
3. Wait for verification (auto-checks)
4. Use verified domain in RESEND_FROM_EMAIL
```

---

### 🗄️ Supabase

#### `SUPABASE_URL`
- **Type:** Project URL
- **Format:** `https://xxxxx.supabase.co`
- **Get from:** Supabase dashboard → Project Settings → API
- **Used by:** syncToSupabase, getSupabaseSyncStatus
- **Security:** 🟢 OK in frontend (public)

#### `SUPABASE_SERVICE_KEY`
- **Type:** Service role key (admin access)
- **Format:** `eyJhbGciOiJIUzI1NiIs...` (JWT)
- **Get from:** Supabase dashboard → Project Settings → API → service_role
- **Used by:** Backend functions, syncToSupabase
- **Security:** 🔴 CRITICAL — never expose to frontend

#### `SUPABASE_ANON_KEY` (need to add)
- **Type:** Anonymous key (RLS-protected)
- **Format:** `eyJhbGciOiJIUzI1NiIs...` (JWT)
- **Get from:** Supabase dashboard → Project Settings → API → anon
- **Used by:** Frontend (when migrating)
- **Security:** 🟢 OK in frontend (limited by RLS)

---

### 📊 Facebook (Pixel + CAPI)

#### `FB_PIXEL_ID`
- **Type:** Pixel ID
- **Format:** Numeric (e.g., `1234567890`)
- **Get from:** https://business.facebook.com/events_manager
- **Used by:** Frontend pixel + fbConversionsAPI
- **Security:** 🟢 OK in frontend (public)

#### `FB_ACCESS_TOKEN`
- **Type:** System User access token
- **Format:** Long string starting with `EAA...`
- **Get from:** Business Manager → System Users → Generate Token
- **Used by:** fbConversionsAPI (CAPI events)
- **Security:** 🔴 PRIVATE — backend only

**Generate access token:**
```
1. business.facebook.com → Business Settings
2. Users → System Users → Add
3. Assign permissions: ads_management, business_management
4. Click "Generate New Token"
5. Select assets, expiration (60 days or never)
6. Save token securely
```

---

### 🔔 Web Push (VAPID)

#### `VAPID_PUBLIC_KEY`
- **Type:** Public key (base64)
- **Format:** Long base64 string
- **Get from:** Generate via generateVapidKeys function
- **Used by:** Frontend subscription
- **Security:** 🟢 OK in frontend (public by design)

#### `VAPID_PRIVATE_KEY`
- **Type:** Private key (base64)
- **Format:** Long base64 string
- **Get from:** Generate via generateVapidKeys function (pair with public)
- **Used by:** sendPushNotification (backend)
- **Security:** 🔴 PRIVATE — backend only

#### `VAPID_SUBJECT`
- **Type:** Contact info
- **Format:** `mailto:admin@yourdomain.com` or `https://yourdomain.com`
- **Used by:** Web Push protocol identification
- **Security:** 🟢 OK (public)

**Generate VAPID keys:**
```bash
# Method 1: Run generateVapidKeys function (once)

# Method 2: Locally via npm
npm install -g web-push
web-push generate-vapid-keys

# Output:
# Public Key: BNc...
# Private Key: xxx...
```

---

## 🆕 Secrets to Add (if migrating to Supabase)

### For Supabase Edge Functions:

#### `OPENAI_API_KEY`
- **Get from:** https://platform.openai.com/api-keys
- **Used for:** Replace InvokeLLM (Cikgu AI)
- **Security:** 🔴 PRIVATE

#### `ANTHROPIC_API_KEY` (optional)
- **Get from:** https://console.anthropic.com
- **Used for:** Claude models (alternative to OpenAI)
- **Security:** 🔴 PRIVATE

#### `SUPABASE_SERVICE_ROLE_KEY`
- Same as `SUPABASE_SERVICE_KEY` (rename if needed)

---

## 📝 .env.example Template

For frontend (`.env.local`):
```bash
# Public — safe to expose
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
VITE_FB_PIXEL_ID=1234567890
VITE_VAPID_PUBLIC_KEY=BNc...
VITE_APP_URL=https://ceriakid.com
```

For backend (Supabase secrets):
```bash
# Set via: supabase secrets set KEY=value
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
OPENAI_API_KEY=sk-...
CHIP_SECRET_KEY=sk_live_...
CHIP_BRAND_ID=xxx-xxx-xxx
CHIP_WEBHOOK_SECRET=xxx
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=hello@ceriakid.com
FB_ACCESS_TOKEN=EAA...
FB_PIXEL_ID=1234567890
VAPID_PUBLIC_KEY=BNc...
VAPID_PRIVATE_KEY=xxx
VAPID_SUBJECT=mailto:admin@ceriakid.com
```

---

## 🔄 Backup Strategy

### Method 1: Password Manager (Recommended)
```
1Password / Bitwarden vault: "CeriaKid Secrets"
├── 🔑 CHIP
│   ├── CHIP_SECRET_KEY
│   ├── CHIP_BRAND_ID
│   └── CHIP_WEBHOOK_SECRET
├── 📧 Resend
│   ├── RESEND_API_KEY
│   └── RESEND_FROM_EMAIL
├── 🗄️ Supabase
│   ├── SUPABASE_URL
│   ├── SUPABASE_SERVICE_KEY
│   └── SUPABASE_ANON_KEY
├── 📊 Facebook
│   ├── FB_PIXEL_ID
│   └── FB_ACCESS_TOKEN
├── 🔔 VAPID
│   ├── VAPID_PUBLIC_KEY
│   ├── VAPID_PRIVATE_KEY
│   └── VAPID_SUBJECT
└── 🤖 AI (if migrated)
    ├── OPENAI_API_KEY
    └── ANTHROPIC_API_KEY
```

### Method 2: Encrypted Email to Self
```
Subject: 🔐 CeriaKid Secrets Backup [DATE]

Body (encrypt with PGP or password):
- All secrets listed above
- Include creation dates
- Include rotation reminders
```

### Method 3: Offline (Paper)
```
Print all secrets, store in safe.
Update after every rotation.
```

---

## 🔄 Secret Rotation Schedule

| Secret | Rotation Frequency | Last Rotated |
|---|---|---|
| CHIP_SECRET_KEY | Annually | _____ |
| CHIP_WEBHOOK_SECRET | Annually | _____ |
| RESEND_API_KEY | Annually | _____ |
| SUPABASE_SERVICE_KEY | Never (unless compromised) | _____ |
| FB_ACCESS_TOKEN | Every 60 days OR set to never | _____ |
| VAPID_PRIVATE_KEY | Never (would invalidate all subscriptions) | _____ |
| OPENAI_API_KEY | Annually | _____ |

---

## 🚨 If Secret Compromised

### Immediate actions:
```
1. ROTATE: Generate new secret immediately
2. UPDATE: Replace in all services (Base44, Supabase, Vercel)
3. REVOKE: Disable old key at provider
4. AUDIT: Check logs for unauthorized usage
5. NOTIFY: Inform affected users if needed
```

### Specific procedures:

**CHIP key compromised:**
```
1. CHIP dashboard → Generate new secret key
2. Update CHIP_SECRET_KEY in Base44/Supabase
3. Old key auto-invalidated
```

**Resend key compromised:**
```
1. Resend → API Keys → Delete compromised key
2. Generate new key
3. Update RESEND_API_KEY
```

**Supabase service key compromised:**
```
1. Supabase → Settings → API → Regenerate service_role key
2. Update SUPABASE_SERVICE_KEY everywhere
3. ⚠️ This affects ALL service role connections
```

**Facebook token compromised:**
```
1. Business Manager → System Users → Revoke token
2. Generate new token
3. Update FB_ACCESS_TOKEN
```

---

## 📋 Pre-Migration Checklist

Before migrating to new platform:

- [ ] All current secrets documented
- [ ] All secrets backed up to password manager
- [ ] Each secret tested (still working)
- [ ] Domain ownership verified
- [ ] Email sending tested
- [ ] Payment flow tested (sandbox)
- [ ] Push notifications tested
- [ ] Database access verified
- [ ] File uploads tested

---

## 🌐 Environment-Specific Setup

### Development:
```bash
# Use TEST keys
CHIP_SECRET_KEY=sk_test_xxx
RESEND_API_KEY=re_test_xxx
FB_PIXEL_ID=test_pixel_id

# Use separate Supabase project (dev)
SUPABASE_URL=https://dev-xxx.supabase.co
```

### Staging:
```bash
# Mix of test + live (be careful!)
CHIP_SECRET_KEY=sk_test_xxx     # Still test
RESEND_API_KEY=re_xxx           # Live
SUPABASE_URL=https://staging-xxx.supabase.co
```

### Production:
```bash
# All LIVE keys
CHIP_SECRET_KEY=sk_live_xxx
RESEND_API_KEY=re_xxx
SUPABASE_URL=https://prod-xxx.supabase.co
```

---

## 🔍 Verify Secrets Working

### Quick health check function:
```javascript
// runHealthCheck function already does this:
- Pings CHIP API
- Sends test email via Resend
- Queries Supabase
- Calls FB CAPI test endpoint
- Generates test InvokeLLM call

Results in HealthCheckLog entity.
```

---

## 📞 Service Account Recovery

If you lose access to:

### Base44 dashboard:
- Email: support@base44.com
- Have account email + recent invoice ready

### CHIP dashboard:
- Email: support@chip-in.asia
- Provide business registration

### Resend:
- Email: support@resend.com
- Provide API usage proof

### Supabase:
- Email: support@supabase.com
- Provide project ID + payment proof

### Facebook Business:
- https://business.facebook.com/help
- May take days to recover

---

## 🎯 Quick Reference Card

**Print this and keep in safe place:**

```
╔══════════════════════════════════════════════════╗
║          🔐 CeriaKid Secrets — Quick Card         ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  Last updated: __________________                ║
║                                                  ║
║  📍 Where stored:                                ║
║  □ Base44 dashboard                              ║
║  □ Password manager: __________                  ║
║  □ Encrypted backup: __________                  ║
║                                                  ║
║  🆘 Emergency contacts:                          ║
║  Owner: __________________                       ║
║  Tech support: __________                        ║
║                                                  ║
║  🔑 Service accounts:                            ║
║  Base44 email: __________                        ║
║  CHIP email: __________                          ║
║  Resend email: __________                        ║
║  Supabase email: __________                      ║
║                                                  ║
║  📋 Recovery playbook:                           ║
║  docs/07_RECOVERY_PLAYBOOK.md                    ║
║                                                  ║
╚══════════════════════════════════════════════════╝
```

---

## 🎬 Final Note

**Securing these secrets is the MOST IMPORTANT thing in this Migration Kit.**

Without them, you cannot:
- ❌ Recover from disaster
- ❌ Migrate platforms
- ❌ Continue billing customers
- ❌ Send emails
- ❌ Run AI features

**DO NOT skip this step. Backup secrets TODAY.**

---

> 🎉 You've reached the end of the Migration Kit!
> Read `00_README.md` for overview, or jump to specific guide as needed.