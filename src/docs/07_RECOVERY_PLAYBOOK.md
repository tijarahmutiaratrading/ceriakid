# 🚨 Disaster Recovery Playbook

> Step-by-step emergency procedures. Follow ini bila Base44 down atau ada masalah besar.

---

## 🆘 Emergency Severity Levels

| Level | Scenario | Response Time |
|---|---|---|
| 🟢 P3 — Minor | Single function broken | 1-2 days |
| 🟡 P2 — Moderate | Multiple features down | Same day |
| 🟠 P1 — Major | Login broken, payments down | Within hours |
| 🔴 P0 — Critical | Entire app down | IMMEDIATE |

---

## 🚨 P0: Base44 Platform Down

### Symptoms:
- `ceriakid.base44.app` not loading
- All API calls failing
- Users complaining can't login
- Base44 status page showing outage

### Step 1: Verify (5 min)
```
1. Check https://status.base44.com (or similar)
2. Check https://app.base44.com (dashboard accessible?)
3. Try API call from another device
4. Check social media (Twitter, Discord) — others affected?
```

### Step 2: Communicate (10 min)
```
✉️ Email all active users:
"CeriaKid sedang mengalami masalah teknikal. Pasukan kami sedang 
mengusahakan penyelesaian. Status update: [link to status page]"

📱 Post to social media:
- Facebook page
- Instagram
- WhatsApp broadcast (if applicable)

🔔 Push notification (if accessible):
- Via Supabase or alternative push provider
```

### Step 3: Wait or Activate Plan B

**If Base44 down < 4 hours:**
- ✅ Wait it out
- ✅ Monitor status
- ✅ Keep users updated hourly

**If Base44 down > 4 hours OR permanent:**
- 🚨 Activate emergency migration
- Go to **Step 4: Emergency Migration**

---

## 🔥 Step 4: Emergency Migration (Activate Backup)

### Hour 1-2: Setup Bare-Bones Replacement

#### 1. Create Vercel project
```bash
# Clone GitHub repo locally
git clone https://github.com/[your-username]/ceriakid.git
cd ceriakid

# Install dependencies
npm install

# Add Supabase client
npm install @supabase/supabase-js
```

#### 2. Create temporary Supabase auth
```sql
-- Manually enable auth in Supabase dashboard
-- Email + OTP for fastest setup
```

#### 3. Quick auth wrapper (`src/lib/emergency-auth.js`):
```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export const emergencyAuth = {
  async login(email) {
    const { error } = await supabase.auth.signInWithOtp({ email });
    return !error;
  },
  
  async getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },
  
  async logout() {
    await supabase.auth.signOut();
  }
};
```

#### 4. Replace Base44 imports temporarily
```javascript
// Quick find-and-replace in all files:
// FROM: import { base44 } from "@/api/base44Client";
// TO:   import { base44 } from "@/lib/emergency-base44";
```

#### 5. Create emergency Base44 shim (`src/lib/emergency-base44.js`):
```javascript
import { supabase } from './supabase';

// Map Base44 entity to ck_ table name
const TABLE_MAP = {
  Game: 'ck_games',
  User: 'profiles',
  UserSubscription: 'ck_user_subscriptions',
  UserCredit: 'ck_user_credits',
  // ... map all 26
};

const createEntityShim = (entityName) => ({
  async list(orderBy = '-created_date', limit = 50) {
    const table = TABLE_MAP[entityName];
    const column = orderBy.startsWith('-') ? orderBy.slice(1) : orderBy;
    const ascending = !orderBy.startsWith('-');
    
    // Map camelCase to snake_case
    const dbColumn = column.replace(/([A-Z])/g, '_$1').toLowerCase();
    
    const { data } = await supabase
      .from(table)
      .select('*')
      .order(dbColumn, { ascending })
      .limit(limit);
    return data || [];
  },
  
  async filter(query, orderBy, limit) {
    let q = supabase.from(TABLE_MAP[entityName]).select('*');
    Object.entries(query).forEach(([k, v]) => {
      q = q.eq(k.replace(/([A-Z])/g, '_$1').toLowerCase(), v);
    });
    if (limit) q = q.limit(limit);
    const { data } = await q;
    return data || [];
  },
  
  async create(data) {
    const { data: result } = await supabase
      .from(TABLE_MAP[entityName])
      .insert([data])
      .select()
      .single();
    return result;
  },
  
  async update(id, data) {
    const { data: result } = await supabase
      .from(TABLE_MAP[entityName])
      .update(data)
      .eq('id', id)
      .select()
      .single();
    return result;
  },
  
  async delete(id) {
    await supabase.from(TABLE_MAP[entityName]).delete().eq('id', id);
  }
});

export const base44 = {
  entities: new Proxy({}, {
    get(_, entityName) {
      return createEntityShim(entityName);
    }
  }),
  
  auth: {
    async me() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      // Get profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      return { ...user, ...profile };
    },
    
    async isAuthenticated() {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    },
    
    async logout() {
      await supabase.auth.signOut();
      window.location.href = '/';
    },
    
    async redirectToLogin() {
      // Implement login flow
      window.location.href = '/login';
    }
  },
  
  functions: {
    async invoke(name, body) {
      // Temporarily disable — show user-friendly error
      throw new Error(`Function ${name} not yet migrated. Please try later.`);
    }
  }
};
```

#### 6. Deploy to Vercel
```bash
# Deploy
vercel --prod

# Set env vars:
# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY
```

#### 7. Update DNS
```
1. Cloudflare/registrar
2. Point ceriakid.com → Vercel
3. Wait for propagation (5-30 min)
```

### Hour 3-8: Restore Critical Features

#### Priority 1: Auth (✅ done via emergency shim)

#### Priority 2: Read-only games
- Users boleh login + browse + play games
- No saving progress yet (handled in hour 8+)

#### Priority 3: CHIP webhook redirect
```
1. CHIP dashboard → Webhooks → Edit
2. Change URL to new domain + Edge Function path
3. Deploy emergency chipWebhook as Edge Function
```

### Hour 8-24: Restore Payments

#### Deploy Edge Functions (critical only):
```bash
# Create emergency function
supabase functions new chipWebhook
supabase functions new addCredits
supabase functions new deductCredits

# Copy logic from GitHub repo (functions/)
# Adapt to Supabase SDK (see 06_SUPABASE_MIGRATION.md)

# Deploy
supabase functions deploy chipWebhook
supabase functions deploy addCredits
supabase functions deploy deductCredits

# Set secrets
supabase secrets set CHIP_SECRET_KEY="..."
supabase secrets set CHIP_WEBHOOK_SECRET="..."
supabase secrets set RESEND_API_KEY="..."
```

### Day 2-7: Full Restoration

- Restore all AI features (replace InvokeLLM with OpenAI)
- Restore all email functions
- Restore push notifications
- Restore admin tools
- Restore affiliate system

### Week 2-3: Polish & Optimize

- Migrate file uploads to Supabase Storage
- Setup proper RLS policies
- Setup scheduled cron jobs
- Performance testing
- User communication: "Migration complete!"

---

## 🟠 P1: Specific Feature Broken

### Sub-scenario: AI not working

**Symptoms:** Cikgu Firdaus/Rosie/Mira/Daniel returning errors

**Quick fixes:**
```
1. Check Base44 InvokeLLM status
2. Check user credit balance (UserCredit entity)
3. Check function logs (Base44 dashboard)
4. Verify model availability
5. Check OPENAI_API_KEY (if direct)
```

**Workaround:** Disable AI features temporarily
```javascript
// Add feature flag
const AI_ENABLED = false;

// In UI:
{AI_ENABLED ? (
  <CikguAI />
) : (
  <MaintenanceMessage />
)}
```

---

### Sub-scenario: Payments not processing

**Symptoms:** Users can't subscribe, webhook not firing

**Quick fixes:**
```
1. Check CHIP dashboard for purchases
2. Verify webhook URL accessible
3. Check chipWebhook function logs
4. Test with CHIP sandbox
5. Verify CHIP_WEBHOOK_SECRET matches
```

**Workaround:** Manual subscription activation
```sql
-- In Supabase SQL Editor (admin only)
INSERT INTO ck_user_subscriptions (email, tier, status, current_period_end)
VALUES (
  'user@example.com',
  'premium',
  'active',
  NOW() + INTERVAL '30 days'
);
```

---

### Sub-scenario: Emails not sending

**Symptoms:** Welcome emails not arriving, reminders failing

**Quick fixes:**
```
1. Check Resend dashboard for errors
2. Verify RESEND_API_KEY valid
3. Check domain verification (SPF, DKIM)
4. Check sender email reputation
5. Test with sendResendEmail function
```

**Workaround:** Switch to alternative
```javascript
// Quick switch to SendGrid or another provider
// Or use Gmail SMTP temporarily
```

---

### Sub-scenario: Push notifications not working

**Symptoms:** No notifications arriving

**Quick fixes:**
```
1. Check VAPID keys valid
2. Check PushSubscription records exist
3. Test sendPushNotification function
4. Check browser notification permissions
5. Check service worker registered
```

---

## 🟡 P2: Database Issues

### Sub-scenario: Data corruption / missing records

**Recovery from Supabase backup:**
```sql
-- If syncToSupabase ran recently, data is in Supabase
-- Use that as source of truth

-- Export specific table
COPY ck_users TO '/tmp/users_backup.csv' CSV HEADER;

-- Re-import to Base44 (via UI or API)
```

**Recovery from Base44 export:**
```
1. Base44 dashboard → Entities → Export
2. Download CSV/JSON for affected entity
3. Find missing records in last week's export
4. Manually re-insert via dashboard or API
```

---

### Sub-scenario: Slow database queries

**Quick fixes:**
```
1. Check if any query is doing full table scan
2. Add indexes on commonly filtered fields:
   - UserSubscription.email
   - UserCredit.userEmail
   - Game.category, Game.ageGroup
   - ChildGameProgress.userEmail
3. Limit query results (always use limit)
4. Use pagination instead of loading all
```

---

## 🟢 P3: Minor Bugs

### Frontend bug — page not loading
```
1. Check browser console for errors
2. Check React error boundary triggered?
3. Verify route exists in App.jsx
4. Check imports valid
5. Clear cache + hard reload
```

### Component not rendering
```
1. Check component imported correctly
2. Verify props passed
3. Check conditional rendering logic
4. Look for typos in component name
```

---

## 📞 Emergency Contact List

### Internal:
- **Owner/Admin:** [Your name + phone]
- **Tech support:** [Your phone/email]

### External Services:
- **Base44 Support:** support@base44.com
- **CHIP Support:** support@chip-in.asia
- **Resend Support:** support@resend.com
- **Supabase Support:** support@supabase.com
- **Domain registrar:** [Your registrar]
- **Hosting (Vercel):** [Vercel dashboard]

### Community:
- **Base44 Discord:** [link]
- **Supabase Discord:** https://discord.supabase.com
- **Indie hackers community**

---

## 🔍 Pre-Emergency Checklist (Do NOW!)

Before disaster strikes, ensure these are in place:

- [ ] ✅ GitHub repo up-to-date
- [ ] ✅ Supabase sync running successfully (verify weekly)
- [ ] ✅ All secrets backed up to password manager
- [ ] ✅ Domain DNS access (login credentials saved)
- [ ] ✅ CHIP dashboard access (login credentials saved)
- [ ] ✅ Resend dashboard access
- [ ] ✅ Customer email list exported monthly
- [ ] ✅ Supabase account active (not just trial)
- [ ] ✅ Vercel account created (standby)
- [ ] ✅ This playbook accessible offline (print PDF?)

---

## 🎯 Recovery Time Objectives

| Component | Target RTO |
|---|---|
| Login working | < 4 hours |
| View games | < 6 hours |
| Play games (offline mode) | Always (PWA cached) |
| AI features | < 2 days |
| Payments | < 24 hours |
| Push notifications | < 3 days |
| Admin tools | < 1 week |
| Full feature parity | < 4 weeks |

---

## 📊 Recovery Time Objective (RTO) vs Reality

**Best case (well-prepared):** 4-7 days to mostly functional clone

**Average case:** 2-3 weeks to full feature parity

**Worst case (unprepared):** 1-2 months + lots of bug fixes

---

## 💡 Lessons Learned (Pre-emptive)

### Do regularly:
1. ✅ Weekly: verify Supabase sync working
2. ✅ Monthly: backup customer list to CSV
3. ✅ Monthly: download user files (avatars)
4. ✅ Quarterly: test recovery procedure (dry run)
5. ✅ Always: keep this kit updated

### Don't do:
1. ❌ Store unique data only in Base44
2. ❌ Hardcode Base44 URLs in code
3. ❌ Forget to backup secrets
4. ❌ Skip GitHub commits
5. ❌ Ignore Supabase sync errors

---

> Next: Read `08_SECRETS_AND_ENV.md` for secrets management.