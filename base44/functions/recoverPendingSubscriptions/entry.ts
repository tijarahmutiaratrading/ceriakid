// Auto-recover pending subscriptions yang webhook miss.
// Run setiap 10 minit via scheduled automation.
//
// Logic:
// 1. Cari UserSubscription dengan status="incomplete" yang umur < 48 jam
// 2. Verify setiap satu dengan Chip API
// 3. Kalau Chip kata "paid" → activate + welcome email + push + FB CAPI
//    (sama macam webhook handler — inline supaya tak depend cross-function-invoke)

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import webpush from 'npm:web-push@3.6.7';

const APP_URL = 'https://ceriakid.com';
const WHATSAPP_URL = 'https://wa.me/60177844120?text=' + encodeURIComponent('Salam, saya perlukan bantuan dengan akaun CeriaKid saya.');
const TIER_LABEL = { asas: 'Asas', standard: 'Standard', keluarga: 'Keluarga' };
const SUB_PRICING = { asas: 49, standard: 99, keluarga: 199 };
const WELCOME_CREDITS = { asas: 5, standard: 20, keluarga: 50 };

function buildSubscriptionEmailHTML(tier, bonusCredits) {
  const tierName = TIER_LABEL[tier] || tier;
  const bonusLine = bonusCredits > 0
    ? `<p style="margin:0 0 12px;color:#475569"><strong>🎁 Bonus selamat datang:</strong> Anda dapat <strong>${bonusCredits} kredit AI percuma</strong>!</p>`
    : '';
  return {
    subject: `🎉 Selamat datang ke CeriaKid — Pelan ${tierName} anda dah aktif!`,
    html: `<!DOCTYPE html><html lang="ms"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,sans-serif;background:#f8fafc;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:24px 0;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;">
<tr><td style="background:linear-gradient(135deg,#a855f7,#ec4899);padding:32px 24px;text-align:center;">
<h1 style="margin:0;color:#fff;font-size:28px;font-weight:900;">🎉 Tahniah!</h1>
<p style="margin:8px 0 0;color:#fff;font-size:16px;">Pelan <strong>${tierName}</strong> anda dah aktif</p></td></tr>
<tr><td style="padding:28px 24px;"><p style="margin:0 0 16px;color:#1e293b;">Hai! 👋</p>
<p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6;">Terima kasih sebab langgan CeriaKid. Subscription anda dah aktif untuk <strong>1 tahun penuh</strong>.</p>
${bonusLine}</td></tr>
<tr><td style="padding:0 24px 20px;"><div style="background:#fef3c7;border-left:4px solid #f59e0b;border-radius:8px;padding:14px 16px;">
<p style="margin:0;color:#78350f;font-weight:700;">⚠️ PENTING</p>
<p style="margin:6px 0 0;color:#92400e;font-size:13px;line-height:1.6;">Anda <strong>perlu daftar akaun dulu</strong> di CeriaKid sebelum boleh login. Pastikan guna <strong>email yang SAMA</strong> dengan email anda beli pelan tadi.</p>
</div></td></tr>
<tr><td style="padding:0 24px 24px;text-align:center;">
<a href="${APP_URL}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#a855f7,#ec4899);color:#fff;text-decoration:none;font-weight:700;border-radius:12px;">🚀 Daftar / Login Sekarang</a></td></tr>
<tr><td style="padding:0 24px 28px;text-align:center;">
<a href="${WHATSAPP_URL}" style="display:inline-block;padding:12px 24px;background:#25D366;color:#fff;text-decoration:none;font-weight:700;border-radius:10px;">💬 WhatsApp: 017-784 4120</a></td></tr>
</table></td></tr></table></body></html>`,
  };
}

async function sendWelcomeEmail(to, tier, bonusCredits) {
  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const RESEND_FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL');
    if (!RESEND_API_KEY || !RESEND_FROM_EMAIL) return;
    const content = buildSubscriptionEmailHTML(tier, bonusCredits);
    const from = RESEND_FROM_EMAIL.includes('<') ? RESEND_FROM_EMAIL : `CeriaKid <${RESEND_FROM_EMAIL}>`;
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject: content.subject, html: content.html }),
    });
    if (!res.ok) console.error('Resend failed:', await res.text());
  } catch (err) {
    console.error('sendWelcomeEmail error:', err?.message);
  }
}

async function notifyAdmins(base44, { title, body }) {
  try {
    const publicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const privateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    if (!publicKey || !privateKey) return;
    let subject = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@ceriakid.com';
    subject = subject.trim().replace(/[<>]/g, '').replace(/\s+/g, '');
    if (!subject.startsWith('mailto:') && !subject.startsWith('http')) subject = `mailto:${subject}`;
    webpush.setVapidDetails(subject, publicKey, privateKey);
    const subs = await base44.asServiceRole.entities.PushSubscription.filter({ isAdmin: true });
    if (subs.length === 0) return;
    const payload = JSON.stringify({ title, body, url: '/admin-dashboard?tab=analytics', tag: 'order-notif' });
    await Promise.all(subs.map(async (sub) => {
      try {
        await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload);
      } catch (_) {}
    }));
  } catch (err) {
    console.error('notifyAdmins error:', err?.message);
  }
}

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(text).toLowerCase().trim()));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sendFbCapiPurchase({ email, phone, value, tier, eventID, fbp, fbc, ip, userAgent }) {
  try {
    const PIXEL_ID = Deno.env.get('FB_PIXEL_ID');
    const ACCESS_TOKEN = Deno.env.get('FB_ACCESS_TOKEN');
    if (!PIXEL_ID || !ACCESS_TOKEN) return;
    const userData = {};
    if (email) userData.em = [await sha256Hex(email)];
    if (phone) userData.ph = [await sha256Hex(String(phone).replace(/\D/g, ''))];
    if (ip) userData.client_ip_address = ip;
    if (userAgent) userData.client_user_agent = userAgent;
    if (fbp) userData.fbp = fbp;
    if (fbc) userData.fbc = fbc;
    const eventData = {
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventID || `Purchase_${Date.now()}`,
      action_source: 'website',
      event_source_url: 'https://ceriakid.com/thank-you',
      user_data: userData,
      custom_data: { currency: 'MYR', value, content_name: tier, content_ids: [tier], content_type: 'product' },
    };
    await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [eventData], access_token: ACCESS_TOKEN }),
    });
  } catch (err) {
    console.error('sendFbCapiPurchase error:', err?.message);
  }
}

async function activateSubscription(base44, sub, verifiedPurchase) {
  const tier = sub.tier;
  const userEmail = sub.email;
  const purchaseId = sub.stripeCustomerId;

  const now = new Date();
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);

  const subData = {
    status: 'active',
    currentPeriodStart: now.toISOString(),
    currentPeriodEnd: expiryDate.toISOString(),
  };

  if (sub.abandonedReminderSent && sub.abandonedReminderStatus !== 'recovered') {
    subData.abandonedReminderStatus = 'recovered';
    subData.recoveredAt = now.toISOString();
  }

  await base44.asServiceRole.entities.UserSubscription.update(sub.id, subData);

  // Bonus welcome credits — idempotent guna referenceId
  const bonusAmount = WELCOME_CREDITS[tier] || 0;
  if (bonusAmount > 0) {
    const welcomeRefId = `welcome__${purchaseId}`;
    const existingBonus = await base44.asServiceRole.entities.CreditTransaction.filter({ referenceId: welcomeRefId });
    if (existingBonus.length === 0) {
      const existingCredit = await base44.asServiceRole.entities.UserCredit.filter({ userEmail });
      let bonusNewBalance;
      if (existingCredit.length === 0) {
        const created = await base44.asServiceRole.entities.UserCredit.create({
          userEmail, balance: bonusAmount, totalPurchased: 0, totalUsed: 0, lastTopUpAt: now.toISOString(),
        });
        bonusNewBalance = created.balance;
      } else {
        const c = existingCredit[0];
        bonusNewBalance = (c.balance || 0) + bonusAmount;
        await base44.asServiceRole.entities.UserCredit.update(c.id, {
          balance: bonusNewBalance, lastTopUpAt: now.toISOString(),
        });
      }
      await base44.asServiceRole.entities.CreditTransaction.create({
        userEmail, type: 'bonus', amount: bonusAmount, balanceAfter: bonusNewBalance,
        feature: 'bonus',
        description: `🎁 Bonus selamat datang — pelan ${tier} (${bonusAmount} kredit AI percuma)`,
        referenceId: welcomeRefId,
        metadata: { tier, chipPurchaseId: purchaseId, source: 'recovery_welcome_bonus' },
      });
    }
  }

  // Push to admins
  const priceMYR = SUB_PRICING[tier] || 0;
  await notifyAdmins(base44, {
    title: '🎉 Subscription Recovered!',
    body: `${userEmail} → ${tier.toUpperCase()} (RM${priceMYR}) — auto-recovered`,
  });

  // Welcome email
  await sendWelcomeEmail(userEmail, tier, bonusAmount);

  // FB CAPI Purchase
  const tracking = sub.fbTracking || {};
  await sendFbCapiPurchase({
    email: userEmail,
    phone: tracking.phone,
    value: priceMYR,
    tier,
    eventID: `Purchase_${purchaseId}`,
    fbp: tracking.fbp,
    fbc: tracking.fbc,
    ip: tracking.ip,
    userAgent: tracking.userAgent,
  });

  console.log(`✅ Recovered: ${userEmail} → ${tier}`);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const secretKey = Deno.env.get('CHIP_SECRET_KEY');
    if (!secretKey) {
      return Response.json({ error: 'Chip not configured' }, { status: 500 });
    }

    // Cari semua incomplete subs umur < 48 jam (lepas tu cleanupStuckSubscriptions akan handle)
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const pending = await base44.asServiceRole.entities.UserSubscription.filter({
      status: 'incomplete',
    });

    const recent = pending.filter(s => s.created_date && s.created_date > cutoff && s.stripeCustomerId);

    let checked = 0, recovered = 0, stillPending = 0, errors = 0;

    for (const sub of recent) {
      checked++;
      try {
        const res = await fetch(`https://gate.chip-in.asia/api/v1/purchases/${sub.stripeCustomerId}/`, {
          headers: { 'Authorization': `Bearer ${secretKey}` },
        });
        if (!res.ok) {
          errors++;
          continue;
        }
        const verified = await res.json();
        if (verified.status === 'paid') {
          await activateSubscription(base44, sub, verified);
          recovered++;
        } else {
          stillPending++;
        }
      } catch (err) {
        errors++;
        console.error(`Recovery error for ${sub.email}:`, err?.message);
      }
    }

    console.log(`Recovery sweep: checked=${checked}, recovered=${recovered}, pending=${stillPending}, errors=${errors}`);
    return Response.json({ success: true, checked, recovered, stillPending, errors });
  } catch (error) {
    console.error('recoverPendingSubscriptions error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});