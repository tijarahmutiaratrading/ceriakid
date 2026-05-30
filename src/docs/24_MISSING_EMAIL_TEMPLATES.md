# 📧 Missing Email Templates — Promo Blast & Health Alert

> Email templates yang tak ada dalam doc 17. Letak sini untuk reference.
> Resend integration. Both BM language, mobile-responsive HTML.
> Last updated: 2026-05-30

---

## 1️⃣ CeriaKid Promo Blast — `sendCeriaKidPromo`

Used for marketing campaigns (e.g. Hari Raya promo, back-to-school, etc).

### Function signature
```javascript
await base44.functions.invoke('sendCeriaKidPromo', {
  campaignName: 'raya_2026',      // For tracking
  audience: 'all' | 'free' | 'expired' | 'segment_id',
  subject: 'Promo Raya: 50% off CeriaKid Premium 🎉',
  heroTitle: 'Bonus Raya Untuk Keluarga Anda',
  heroBody: 'Premium 50% murah sehingga 15 April...',
  ctaText: 'Dapatkan Sekarang',
  ctaUrl: 'https://ceriakid.com/?promo=RAYA50',
  promoCode: 'RAYA50',            // Optional display
  bannerImageUrl: '...',          // Optional hero image
  expiryDate: '2026-04-15',
});
```

### HTML Template
```html
<!DOCTYPE html>
<html lang="ms">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
</head>
<body style="margin:0;padding:0;background:#faf5ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#faf5ff;padding:20px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 8px 32px rgba(139,92,246,0.12);">
          
          <!-- HERO BANNER -->
          <tr>
            <td style="background:linear-gradient(135deg,#a855f7 0%,#ec4899 50%,#f59e0b 100%);padding:48px 32px;text-align:center;">
              <div style="font-size:48px;margin-bottom:12px;">🎁</div>
              <h1 style="margin:0;color:#fff;font-size:30px;font-weight:900;line-height:1.2;">{{heroTitle}}</h1>
              <p style="margin:16px 0 0;color:rgba(255,255,255,0.95);font-size:16px;line-height:1.5;">{{heroBody}}</p>
            </td>
          </tr>
          
          <!-- OPTIONAL BANNER IMAGE -->
          {{#bannerImageUrl}}
          <tr>
            <td>
              <img src="{{bannerImageUrl}}" alt="" width="600" style="width:100%;display:block;border:0;">
            </td>
          </tr>
          {{/bannerImageUrl}}
          
          <!-- PROMO CODE BOX -->
          {{#promoCode}}
          <tr>
            <td style="padding:32px 32px 0;">
              <div style="background:#fef3c7;border:2px dashed #f59e0b;border-radius:16px;padding:20px;text-align:center;">
                <p style="margin:0 0 8px;color:#78350f;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Kod Promo</p>
                <p style="margin:0;color:#92400e;font-size:28px;font-weight:900;font-family:'Courier New',monospace;letter-spacing:3px;">{{promoCode}}</p>
                <p style="margin:8px 0 0;color:#92400e;font-size:12px;">Salin & gunakan masa checkout</p>
              </div>
            </td>
          </tr>
          {{/promoCode}}
          
          <!-- BENEFITS LIST -->
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 20px;color:#1f2937;font-size:20px;font-weight:800;">Apa Yang Termasuk:</h2>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding:8px 0;color:#374151;font-size:15px;">✅ Akses semua 1000+ permainan edukasi</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#374151;font-size:15px;">✅ Cikgu AI bantu kerja sekolah 24/7</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#374151;font-size:15px;">✅ Bina cerita kanak-kanak guna AI</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#374151;font-size:15px;">✅ Akses BBM (Bahan Bantu Mengajar) percuma</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#374151;font-size:15px;">✅ Track progress sampai 5 anak</td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- CTA BUTTON -->
          <tr>
            <td style="padding:0 32px 32px;text-align:center;">
              <a href="{{ctaUrl}}" style="display:inline-block;background:linear-gradient(135deg,#a855f7,#ec4899);color:#fff;text-decoration:none;padding:18px 48px;border-radius:999px;font-weight:800;font-size:16px;box-shadow:0 8px 24px rgba(168,85,247,0.4);">{{ctaText}} →</a>
              {{#expiryDate}}
              <p style="margin:16px 0 0;color:#dc2626;font-size:13px;font-weight:600;">⏰ Tawaran berakhir {{expiryDate}}</p>
              {{/expiryDate}}
            </td>
          </tr>
          
          <!-- FOOTER -->
          <tr>
            <td style="background:#f9fafb;padding:24px 32px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0 0 8px;color:#6b7280;font-size:12px;">
                📱 CeriaKid · Platform Edukasi Kanak-kanak #1 Malaysia
              </p>
              <p style="margin:0;color:#9ca3af;font-size:11px;">
                <a href="https://ceriakid.com" style="color:#9ca3af;text-decoration:none;">ceriakid.com</a> · 
                <a href="https://ceriakid.com/contact" style="color:#9ca3af;text-decoration:none;">Hubungi Kami</a> · 
                <a href="{{unsubscribeUrl}}" style="color:#9ca3af;text-decoration:none;">Berhenti Langgan</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

### Backend function pattern
```javascript
// functions/sendCeriaKidPromo
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { Resend } from 'npm:resend@4.0.0';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (user?.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });
  
  const { campaignName, audience, subject, heroTitle, heroBody, ctaText, ctaUrl, promoCode, bannerImageUrl, expiryDate } = await req.json();
  
  // 1. Build recipient list
  let recipients = [];
  const allSubs = await base44.asServiceRole.entities.UserSubscription.list('-created_date', 5000);
  
  if (audience === 'all') {
    recipients = allSubs;
  } else if (audience === 'free') {
    recipients = allSubs.filter(s => s.tier === 'free');
  } else if (audience === 'expired') {
    const now = Date.now();
    recipients = allSubs.filter(s => s.status === 'canceled' || (s.currentPeriodEnd && new Date(s.currentPeriodEnd).getTime() < now));
  }
  
  // 2. Filter out suppressed emails
  // (Check ck_email_suppression — see doc 22)
  
  // 3. Send in batches of 100 (Resend rate limit)
  const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
  let sent = 0, failed = 0;
  
  for (let i = 0; i < recipients.length; i += 100) {
    const batch = recipients.slice(i, i + 100);
    
    await Promise.all(batch.map(async (sub) => {
      try {
        const unsubscribeUrl = `https://ceriakid.com/unsubscribe?email=${encodeURIComponent(sub.email)}&campaign=${campaignName}`;
        
        // Template substitution (simple replace, or use a template engine)
        const html = renderTemplate(PROMO_TEMPLATE, {
          subject, heroTitle, heroBody, ctaText, ctaUrl, 
          promoCode, bannerImageUrl, expiryDate, unsubscribeUrl
        });
        
        await resend.emails.send({
          from: Deno.env.get('RESEND_FROM_EMAIL'),
          to: sub.email,
          subject,
          html,
          tags: [
            { name: 'campaign', value: campaignName },
            { name: 'tier', value: sub.tier },
          ],
        });
        sent++;
      } catch {
        failed++;
      }
    }));
    
    // Rate limit: 100 emails per second max
    await new Promise(r => setTimeout(r, 1000));
  }
  
  return Response.json({ success: true, sent, failed, totalAttempted: recipients.length });
});
```

---

## 2️⃣ Health Alert Email — `sendHealthAlert`

Sent when `runHealthCheck` detects critical/warning conditions (currently DISABLED, but template ready).

### Function signature
```javascript
// Called by runHealthCheck internally when issues detected
await sendHealthAlert({
  overallStatus: 'critical',           // critical | warning
  criticalCount: 2,
  warningCount: 3,
  issues: [
    { label: 'Chip Payment Gateway', status: 'critical', message: 'API key invalid', category: 'Payment' },
    { label: 'Database Health', status: 'warning', message: 'Slow (4500ms)', category: 'Infrastructure' },
  ],
  recipients: ['admin@ceriakid.com'],
  runAt: '2026-05-30T14:32:00Z',
});
```

### HTML Template
```html
<!DOCTYPE html>
<html lang="ms">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="padding:20px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="640" style="max-width:640px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.06);">
          
          <!-- ALERT HEADER -->
          <tr>
            <td style="background:{{statusColor}};color:#fff;padding:24px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td>
                    <h1 style="margin:0;font-size:22px;font-weight:800;">{{statusEmoji}} CeriaKid System Alert</h1>
                    <p style="margin:6px 0 0;opacity:0.95;font-size:14px;">
                      Status: <strong>{{statusLabel}}</strong> · {{criticalCount}} critical · {{warningCount}} warning
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- TIMESTAMP -->
          <tr>
            <td style="padding:20px 32px 0;">
              <p style="margin:0;color:#374151;font-size:14px;">
                Health audit dijalankan pada <strong>{{runAtFormatted}}</strong> menemui isu berikut:
              </p>
            </td>
          </tr>
          
          <!-- ISSUES TABLE -->
          <tr>
            <td style="padding:16px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;font-size:13px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
                <thead>
                  <tr style="background:#f9fafb;">
                    <th style="padding:10px 12px;text-align:left;border-bottom:2px solid #e5e7eb;color:#374151;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Check</th>
                    <th style="padding:10px 12px;text-align:left;border-bottom:2px solid #e5e7eb;color:#374151;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Status</th>
                    <th style="padding:10px 12px;text-align:left;border-bottom:2px solid #e5e7eb;color:#374151;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {{#issues}}
                  <tr>
                    <td style="padding:12px;border-bottom:1px solid #f3f4f6;">
                      <strong style="color:#111827;">{{label}}</strong><br>
                      <span style="color:#6b7280;font-size:11px;">{{category}}</span>
                    </td>
                    <td style="padding:12px;border-bottom:1px solid #f3f4f6;">
                      <span style="background:{{badgeBg}};color:{{badgeColor}};padding:3px 10px;border-radius:999px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">{{status}}</span>
                    </td>
                    <td style="padding:12px;border-bottom:1px solid #f3f4f6;color:#374151;font-size:13px;">{{message}}</td>
                  </tr>
                  {{/issues}}
                </tbody>
              </table>
            </td>
          </tr>
          
          <!-- CTA -->
          <tr>
            <td style="padding:8px 32px 32px;text-align:center;">
              <a href="{{adminDashboardUrl}}" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">
                Buka Admin Dashboard →
              </a>
            </td>
          </tr>
          
          <!-- DEDUP NOTE -->
          <tr>
            <td style="background:#f9fafb;padding:14px 32px;text-align:center;border-top:1px solid #f3f4f6;">
              <p style="margin:0;color:#9ca3af;font-size:11px;">
                ℹ️ Email seterusnya hanya dihantar kalau isu yang sama masih wujud selepas 6 jam.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

### Variable substitution map
```javascript
const STATUS_CONFIG = {
  critical: { color: '#dc2626', emoji: '🚨', label: 'CRITICAL' },
  warning:  { color: '#d97706', emoji: '⚠️', label: 'WARNING' },
};

const BADGE_COLORS = {
  critical: { bg: '#fee2e2', color: '#991b1b' },
  warning:  { bg: '#fef3c7', color: '#92400e' },
};

const runAtFormatted = new Date(runAt).toLocaleString('ms-MY', {
  timeZone: 'Asia/Kuala_Lumpur',
  dateStyle: 'medium',
  timeStyle: 'short',
});
```

---

## 3️⃣ Tips Bila Migrate

### Template engine
Resend support **React Email** atau **Handlebars-style** substitution. Recommend:

```bash
npm install react-email @react-email/components
```

Then write templates as React components — more maintainable than raw HTML strings.

### Suppression list integration
Sebelum hantar APA-APA email, check:
```javascript
const suppressed = await supabase
  .from('ck_email_suppression')
  .select('email')
  .eq('email', recipient.email)
  .single();

if (suppressed.data) {
  console.log(`Skip ${recipient.email} — on suppression list`);
  return;
}
```

### Test mode
```javascript
// Development: route ALL emails to single test address
const TEST_MODE = Deno.env.get('EMAIL_TEST_MODE') === 'true';
const TEST_EMAIL = Deno.env.get('EMAIL_TEST_ADDRESS');

if (TEST_MODE) {
  recipient.email = TEST_EMAIL;
  subject = `[TEST] ${subject}`;
}
```

---

> Combined dengan doc 17 (existing 6 templates), 22 (critical logic), dan 23 (frontend), migration kit dah 97-99% complete.