# 🔐 User & Password Migration Strategy

> Bila pindah dari Base44 Auth → Supabase Auth, password lama TAK boleh di-export
> (hashed di Base44, tak boleh decrypt). Strategy: bulk "reset password" flow.
> Last updated: 2026-05-30

---

## 🎯 Why password tak boleh migrate directly?

```
Base44 Auth     → bcrypt/argon2 hashed passwords (irreversible)
Supabase Auth   → bcrypt hashed passwords (different salt)

Even if dapat hash → format/salt beza, tak compatible.
```

**Solution:** User accounts migrate, but password kena reset via email link.

---

## 📋 Migration Strategy — 3 phases

### Phase 1: PRE-MIGRATION (1 week before)

**Goal:** Educate users + capture buy-in

- [ ] Send "advance notice" email ke semua 177 users
- [ ] Add in-app banner di dashboard
- [ ] Update FAQ section dengan migration info

#### Template: Advance Notice Email
```
Subjek: 📢 Penambahbaikan sistem CeriaKid — {DATE}

Hi {nama},

Kami sedang upgrade sistem CeriaKid untuk performance lebih pantas 
dan stabil. Anda perlu set password baru selepas migration.

Apa yang anda perlu buat:
1. Pada {DATE}, anda akan terima email "Set Password Baru" 
2. Klik link dalam email tu untuk set password baru anda
3. Login balik dengan password baru

⚠️ Penting: Link akan expire dalam 7 hari, sila set password segera.

Apa yang kekal sama?
✅ Semua data anak anda (progress, profil, lukisan)
✅ Subscription anda (tak hilang!)
✅ Kredit AI yang masih ada

Kalau ada soalan, WhatsApp kami: {NUMBER}

— Team CeriaKid
```

---

### Phase 2: MIGRATION DAY (during cutover)

**Goal:** Create Supabase Auth users + trigger reset emails

#### Step 1: Bulk create Supabase Auth users

Run this **Supabase Edge Function** to create accounts:

```javascript
// functions/migrateUsersToSupabaseAuth.js (one-time use)
import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_KEY')
);

Deno.serve(async (req) => {
  // Verify admin caller
  const { adminToken } = await req.json();
  if (adminToken !== Deno.env.get('MIGRATION_ADMIN_TOKEN')) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // 1. Get all users from old DB (already synced to Supabase via syncToSupabase)
  const { data: users } = await supabase
    .from('ck_users')
    .select('email, full_name, role')
    .order('created_at', { ascending: true });
  
  const results = { created: 0, exists: 0, failed: 0, errors: [] };
  
  // 2. Process in batches of 10 (avoid rate limit)
  for (let i = 0; i < users.length; i += 10) {
    const batch = users.slice(i, i + 10);
    
    await Promise.all(batch.map(async (user) => {
      try {
        // Create auth user WITHOUT password (forces reset)
        const { data, error } = await supabase.auth.admin.createUser({
          email: user.email,
          email_confirm: true,          // Skip email verification step
          user_metadata: {
            full_name: user.full_name,
            role: user.role,
            migrated_from: 'base44',
            migrated_at: new Date().toISOString(),
          },
        });
        
        if (error?.message?.includes('already registered')) {
          results.exists++;
        } else if (error) {
          throw error;
        } else {
          results.created++;
        }
      } catch (err) {
        results.failed++;
        results.errors.push({ email: user.email, error: err.message });
      }
    }));
    
    // Rate limit pause
    await new Promise(r => setTimeout(r, 500));
  }
  
  return Response.json(results);
});
```

**Expected output:**
```json
{
  "created": 175,
  "exists": 0,
  "failed": 2,
  "errors": [
    { "email": "user@invalid.x", "error": "Invalid email format" }
  ]
}
```

#### Step 2: Bulk trigger reset password emails

```javascript
// functions/bulkSendPasswordReset.js (one-time use)
import { createClient } from 'npm:@supabase/supabase-js@2.39.0';
import { Resend } from 'npm:resend@4.0.0';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const resend = new Resend(RESEND_API_KEY);

Deno.serve(async (req) => {
  const { adminToken, testMode } = await req.json();
  if (adminToken !== Deno.env.get('MIGRATION_ADMIN_TOKEN')) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  const { data: users } = await supabase
    .from('ck_users')
    .select('email, full_name');
  
  const results = { sent: 0, failed: 0, errors: [] };
  
  for (let i = 0; i < users.length; i += 5) {
    const batch = users.slice(i, i + 5);
    
    await Promise.all(batch.map(async (user) => {
      try {
        // Generate password reset link (Supabase native)
        const { data, error } = await supabase.auth.admin.generateLink({
          type: 'recovery',
          email: user.email,
          options: {
            redirectTo: 'https://ceriakid.com/reset-password',
          },
        });
        
        if (error) throw error;
        
        const resetUrl = data.properties.action_link;
        const toEmail = testMode ? 'test@ceriakid.com' : user.email;
        
        // Send via Resend (custom branded template, NOT default Supabase)
        await resend.emails.send({
          from: Deno.env.get('RESEND_FROM_EMAIL'),
          to: toEmail,
          subject: '🔐 Set password baru CeriaKid anda',
          html: renderResetTemplate({
            fullName: user.full_name,
            resetUrl,
            expiryHours: 168,  // 7 days
          }),
          tags: [
            { name: 'campaign', value: 'migration_reset' },
            { name: 'batch', value: new Date().toISOString().slice(0,10) },
          ],
        });
        
        results.sent++;
      } catch (err) {
        results.failed++;
        results.errors.push({ email: user.email, error: err.message });
      }
    }));
    
    // 5 emails/sec rate limit
    await new Promise(r => setTimeout(r, 1000));
  }
  
  return Response.json(results);
});
```

#### Reset Email Template (`renderResetTemplate`)
```html
<!DOCTYPE html>
<html lang="ms">
<body style="margin:0;padding:0;background:#faf5ff;font-family:-apple-system,sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="padding:20px;">
    <tr><td align="center">
      <table cellpadding="0" cellspacing="0" border="0" width="560" style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        
        <tr>
          <td style="background:linear-gradient(135deg,#a855f7,#ec4899);padding:40px 32px;text-align:center;">
            <div style="font-size:48px;margin-bottom:8px;">🔐</div>
            <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;">Set Password Baru</h1>
          </td>
        </tr>
        
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 16px;color:#1f2937;font-size:16px;">Hi <strong>{{fullName}}</strong>,</p>
            <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
              CeriaKid telah dinaiktaraf untuk pengalaman lebih pantas! 🚀 
              Untuk login balik, sila set password baru anda dengan klik butang di bawah.
            </p>
            
            <div style="text-align:center;margin:32px 0;">
              <a href="{{resetUrl}}" style="display:inline-block;background:linear-gradient(135deg,#a855f7,#ec4899);color:#fff;padding:16px 40px;border-radius:999px;text-decoration:none;font-weight:800;font-size:15px;box-shadow:0 6px 20px rgba(168,85,247,0.4);">
                Set Password Baru →
              </a>
            </div>
            
            <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:14px 16px;border-radius:8px;margin:20px 0;">
              <p style="margin:0;color:#92400e;font-size:13px;line-height:1.5;">
                ⏰ <strong>Link ini sah selama 7 hari</strong> sahaja. 
                Sila set password segera sebelum tarikh luput.
              </p>
            </div>
            
            <p style="margin:24px 0 8px;color:#6b7280;font-size:13px;">Tak boleh klik butang? Salin link ni:</p>
            <p style="margin:0;padding:12px;background:#f3f4f6;border-radius:8px;color:#4b5563;font-size:12px;word-break:break-all;font-family:monospace;">{{resetUrl}}</p>
          </td>
        </tr>
        
        <tr>
          <td style="background:#f9fafb;padding:20px 32px;text-align:center;">
            <p style="margin:0;color:#6b7280;font-size:12px;line-height:1.6;">
              Kalau anda tak request migration ini, abaikan email ni.<br>
              Akaun anda kekal selamat — tiada perubahan jika tiada tindakan diambil.
            </p>
            <p style="margin:8px 0 0;color:#9ca3af;font-size:11px;">
              Hubungi kami: <a href="https://ceriakid.com/contact" style="color:#9ca3af;">WhatsApp Support</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
```

---

### Phase 3: POST-MIGRATION (1-2 weeks)

**Goal:** Maximize password reset completion rate

#### Tracking dashboard

Create simple admin view: `/admin-dashboard?tab=migration`

```sql
-- Query: how many users dah set password baru?
SELECT 
  COUNT(*) FILTER (WHERE last_sign_in_at IS NOT NULL) as activated,
  COUNT(*) FILTER (WHERE last_sign_in_at IS NULL) as pending,
  COUNT(*) as total
FROM auth.users
WHERE raw_user_meta_data->>'migrated_from' = 'base44';
```

#### Follow-up reminder schedule

| Day | Action | Target audience |
|---|---|---|
| Day 0 | Initial reset email | All 177 users |
| Day 2 | Reminder #1 | Users yang belum activate |
| Day 5 | Reminder #2 + WhatsApp blast | Still pending |
| Day 7 | Final warning (link expire) | Still pending |
| Day 8 | Regenerate fresh link + send | Still pending |
| Day 14 | Manual outreach (phone call) | High-value paid users |

#### Reminder email template (Day 2 + Day 5)
```
Subjek: ⏰ Set password CeriaKid anda sebelum {EXPIRY_DATE}

Hi {nama},

Kami perasan anda belum set password baru. Cuma ambil masa 1 minit je:

[BUTANG: Set Password Sekarang]

Link luput pada: {EXPIRY_DATE}

Selepas itu, anda kena request link baru.

— Team CeriaKid
```

---

## 🔧 Reset Password Page (`/reset-password`)

Component baru kena create dalam new platform:

```jsx
// pages/ResetPassword.jsx (Supabase pattern)
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState('idle');
  
  // Supabase auto-detects recovery token from URL hash
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setStatus('ready');
    });
    return () => subscription.unsubscribe();
  }, []);
  
  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) return alert('Password tak match');
    if (password.length < 8) return alert('Min 8 aksara');
    
    setStatus('submitting');
    const { error } = await supabase.auth.updateUser({ password });
    
    if (error) {
      setStatus('error');
      alert(error.message);
    } else {
      setStatus('success');
      setTimeout(() => window.location.href = '/dashboard', 2000);
    }
  }
  
  return (
    /* UI form with password + confirm fields */
  );
}
```

---

## 📊 Expected Completion Rates

Based on industry data (B2C SaaS migration):

| Day | Cumulative activation | Target |
|---|---|---|
| Day 1 | 35-45% | 70 users |
| Day 3 | 55-65% | 110 users |
| Day 7 | 70-80% | 135 users |
| Day 14 | 80-90% | 155 users |
| Day 30 | 85-92% | 165 users |

**Realistic outcome:** ~12-25 users (7-15%) tak akan reset password.
- Inactive users yang dah lupa CeriaKid
- Wrong email addresses (typos)
- Spam folder issues

**Mitigation:** Keep old Base44 read-only access for 30 days as last resort.

---

## 🚨 Edge Cases & Solutions

### Case 1: User email tukar tengah migrate
**Symptom:** User update email kt Base44 just before freeze
**Solution:** Cross-reference dengan UserSubscription.email — if different, send reset to both addresses.

### Case 2: Duplicate emails
**Symptom:** Same email exists multiple kali dalam database
**Solution:** Pre-migration cleanup query:
```sql
SELECT email, COUNT(*) 
FROM ck_users 
GROUP BY email 
HAVING COUNT(*) > 1;
```
Manual merge dulu sebelum migrate.

### Case 3: Bounced reset emails
**Symptom:** Resend reports bounce for some addresses
**Solution:** 
1. Mark as bounced di `ck_email_suppression` table
2. Add to "manual outreach" list
3. Try WhatsApp/phone if high-value customer

### Case 4: Token expired before user clicks
**Solution:** Function endpoint untuk regenerate link:
```javascript
// /functions/regenerateResetLink
POST { email: 'user@example.com' }
→ Generates fresh 7-day link
```

---

## ✅ Pre-flight Checklist

Sebelum trigger bulk send, pastikan:

- [ ] Supabase Auth users dah created (verify count match Base44)
- [ ] Reset password page (`/reset-password`) deployed dan tested
- [ ] Resend domain verified (no SPF/DKIM errors)
- [ ] Test mode dah jalan dulu (`testMode: true` → 5 test emails ke own address)
- [ ] Reset email template render correct dalam Gmail/Outlook/Apple Mail
- [ ] Admin dashboard migration tracker live

---

> Total migration time untuk users: **2-3 minggu** untuk hit 85%+ activation. Plan accordingly.