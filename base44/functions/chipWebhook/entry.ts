import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import webpush from 'npm:web-push@3.6.7';

// Tier config — MESTI SYNC dengan lib/affiliateTiers.js (no local imports allowed)
const TIER_CONFIG = [
  { key: 'bronze',   min: 0,   max: 9,        subRate: 20, credRate: 15 },
  { key: 'silver',   min: 10,  max: 29,       subRate: 22, credRate: 17 },
  { key: 'gold',     min: 30,  max: 99,       subRate: 24, credRate: 18 },
  { key: 'platinum', min: 100, max: Infinity, subRate: 25, credRate: 20 },
];

function calculateTier(totalReferrals) {
  return TIER_CONFIG.find(t => totalReferrals >= t.min && totalReferrals <= t.max) || TIER_CONFIG[0];
}

// Helper untuk track komisen affiliate. Reference format akhir: "...__ref_CODE"
async function trackAffiliateCommission(base44, {
  referralCode, referredEmail, purchaseType, purchaseDetail, purchaseAmountMYR, chipPurchaseId,
}) {
  try {
    if (!referralCode) return;

    // Idempotency — sudah ada entry untuk purchaseId ini?
    const existingRef = await base44.asServiceRole.entities.AffiliateReferral.filter({ chipPurchaseId });
    if (existingRef.length > 0) {
      console.log(`Affiliate commission already tracked for ${chipPurchaseId}`);
      return;
    }

    const aff = await base44.asServiceRole.entities.Affiliate.filter({ referralCode });
    if (aff.length === 0 || aff[0].status !== 'active') {
      console.log(`Affiliate not found / inactive for code ${referralCode}`);
      return;
    }
    const affiliate = aff[0];

    // Tak boleh refer diri sendiri
    if (affiliate.userEmail === referredEmail) {
      console.log(`Self-referral blocked for ${referredEmail}`);
      return;
    }

    // Guna rate yang tersimpan pada affiliate (admin boleh override secara manual)
    const rate = purchaseType === 'subscription'
      ? (affiliate.commissionRateSubscription || 20)
      : (affiliate.commissionRateCredit || 15);
    const commissionMYR = Math.round((purchaseAmountMYR * rate / 100) * 100) / 100;

    await base44.asServiceRole.entities.AffiliateReferral.create({
      affiliateEmail: affiliate.userEmail,
      referralCode,
      referredEmail,
      purchaseType,
      purchaseDetail,
      purchaseAmountMYR,
      commissionRate: rate,
      commissionMYR,
      status: 'approved',
      chipPurchaseId,
    });

    // ─── AUTO-UPGRADE TIER ───
    // Kira tier baru berdasarkan totalReferrals + 1
    const newTotalReferrals = (affiliate.totalReferrals || 0) + 1;
    const newTier = calculateTier(newTotalReferrals);
    const currentTier = affiliate.tier || 'bronze';

    const updateData = {
      totalReferrals: newTotalReferrals,
      totalEarned: (affiliate.totalEarned || 0) + commissionMYR,
      pendingBalance: (affiliate.pendingBalance || 0) + commissionMYR,
    };

    // Hanya update tier & rate kalau tier berubah (naik level)
    // Tak tukar rate kalau admin dah override (e.g., rate lebih tinggi dari tier default)
    if (newTier.key !== currentTier) {
      updateData.tier = newTier.key;
      // Update rate hanya kalau current rate sama dengan tier lama (tiada manual override)
      const oldTier = TIER_CONFIG.find(t => t.key === currentTier) || TIER_CONFIG[0];
      if ((affiliate.commissionRateSubscription || 20) === oldTier.subRate) {
        updateData.commissionRateSubscription = newTier.subRate;
      }
      if ((affiliate.commissionRateCredit || 15) === oldTier.credRate) {
        updateData.commissionRateCredit = newTier.credRate;
      }
      console.log(`🎉 Tier upgrade: ${affiliate.userEmail} ${currentTier} → ${newTier.key} (${newTotalReferrals} referrals)`);
    }

    await base44.asServiceRole.entities.Affiliate.update(affiliate.id, updateData);

    console.log(`Affiliate commission tracked: ${affiliate.userEmail} +RM${commissionMYR} from ${referredEmail}`);
  } catch (err) {
    console.error('trackAffiliateCommission error:', err);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// INLINE PUSH + EMAIL HELPERS
// CRITICAL: We do NOT call other functions via base44.asServiceRole.functions.invoke()
// because cross-function-invoke from webhook context returns 403 in Base44.
// Instead we call Resend API and web-push library DIRECTLY here. Verified working.
// ═══════════════════════════════════════════════════════════════════════════

const APP_URL = 'https://ceriakid.com';
const WHATSAPP_URL = 'https://wa.me/60177844120?text=' + encodeURIComponent('Salam, saya perlukan bantuan dengan akaun CeriaKid saya.');
const TIER_LABEL = { asas: 'Asas', standard: 'Standard', keluarga: 'Keluarga' };

function buildSubscriptionEmailHTML(tier, bonusCredits) {
  const tierName = TIER_LABEL[tier] || tier;
  const bonusLine = bonusCredits > 0
    ? `<p style="margin:0 0 12px;color:#475569"><strong>🎁 Bonus selamat datang:</strong> Anda dapat <strong>${bonusCredits} kredit AI percuma</strong>!</p>`
    : '';
  return {
    subject: `🎉 Selamat datang ke CeriaKid — Pelan ${tierName} anda dah aktif!`,
    html: `<!DOCTYPE html><html lang="ms"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:24px 0;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
<tr><td style="background:linear-gradient(135deg,#a855f7,#ec4899);padding:32px 24px;text-align:center;">
<h1 style="margin:0;color:#fff;font-size:28px;font-weight:900;">🎉 Tahniah!</h1>
<p style="margin:8px 0 0;color:rgba(255,255,255,0.95);font-size:16px;">Pelan <strong>${tierName}</strong> anda dah aktif</p></td></tr>
<tr><td style="padding:28px 24px;">
<p style="margin:0 0 16px;color:#1e293b;font-size:16px;">Hai! 👋</p>
<p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6;">Terima kasih sebab langgan CeriaKid. Subscription anda dah aktif untuk <strong>1 tahun penuh</strong>.</p>
${bonusLine}</td></tr>
<tr><td style="padding:0 24px 20px;"><div style="background:#fef3c7;border-left:4px solid #f59e0b;border-radius:8px;padding:14px 16px;">
<p style="margin:0;color:#78350f;font-size:14px;font-weight:700;">⚠️ PENTING — Sila baca dulu</p>
<p style="margin:6px 0 0;color:#92400e;font-size:13px;line-height:1.6;">Anda <strong>perlu daftar akaun dulu</strong> di CeriaKid sebelum boleh login. Pastikan guna <strong>email yang SAMA</strong> dengan email anda beli pelan tadi.</p>
</div></td></tr>
<tr><td style="padding:0 24px 24px;text-align:center;">
<a href="${APP_URL}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#a855f7,#ec4899);color:#fff;text-decoration:none;font-weight:700;border-radius:12px;font-size:16px;">🚀 Daftar / Login Sekarang</a>
</td></tr>
<tr><td style="padding:0 24px 28px;text-align:center;"><p style="margin:0 0 12px;color:#64748b;font-size:14px;">Ada soalan? WhatsApp kami!</p>
<a href="${WHATSAPP_URL}" style="display:inline-block;padding:12px 24px;background:#25D366;color:#fff;text-decoration:none;font-weight:700;border-radius:10px;font-size:15px;">💬 WhatsApp: 017-784 4120</a></td></tr>
<tr><td style="background:#f8fafc;padding:20px 24px;text-align:center;border-top:1px solid #e2e8f0;">
<p style="margin:0;color:#94a3b8;font-size:12px;">© CeriaKid — Platform Pembelajaran Interaktif</p></td></tr>
</table></td></tr></table></body></html>`,
  };
}

function buildCreditEmailHTML(credits) {
  return {
    subject: `💰 ${credits} kredit AI dah masuk akaun anda!`,
    html: `<!DOCTYPE html><html lang="ms"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:24px 0;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
<tr><td style="background:linear-gradient(135deg,#f59e0b,#ef4444);padding:32px 24px;text-align:center;">
<h1 style="margin:0;color:#fff;font-size:28px;font-weight:900;">💰 Kredit Dah Masuk!</h1>
<p style="margin:8px 0 0;color:rgba(255,255,255,0.95);font-size:18px;font-weight:700;">+${credits} Kredit AI</p></td></tr>
<tr><td style="padding:28px 24px;"><p style="margin:0 0 16px;color:#1e293b;font-size:16px;">Hai! 👋</p>
<p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6;">Terima kasih! <strong>${credits} kredit AI</strong> dah ditambah ke akaun anda. Gunakan untuk Cikgu Firdaus, Penjana Cerita, Penjana BBM & Kuiz AI.</p></td></tr>
<tr><td style="padding:0 24px 24px;text-align:center;">
<a href="${APP_URL}/dashboard" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff;text-decoration:none;font-weight:700;border-radius:12px;font-size:16px;">🚀 Mula Guna Sekarang</a></td></tr>
<tr><td style="padding:0 24px 24px;text-align:center;"><p style="margin:0 0 12px;color:#64748b;font-size:14px;">Ada soalan? WhatsApp kami!</p>
<a href="${WHATSAPP_URL}" style="display:inline-block;padding:12px 24px;background:#25D366;color:#fff;text-decoration:none;font-weight:700;border-radius:10px;font-size:15px;">💬 WhatsApp: 017-784 4120</a></td></tr>
<tr><td style="background:#f8fafc;padding:20px 24px;text-align:center;border-top:1px solid #e2e8f0;">
<p style="margin:0;color:#94a3b8;font-size:12px;">© CeriaKid</p></td></tr>
</table></td></tr></table></body></html>`,
  };
}

// Hantar welcome email TERUS via Resend API. Fire-and-forget — failure tak break webhook.
async function sendWelcomeEmailSafe(base44, payload) {
  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const RESEND_FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL');
    if (!RESEND_API_KEY || !RESEND_FROM_EMAIL) {
      console.error('Resend not configured — email skipped');
      return;
    }

    const content = payload.type === 'credit'
      ? buildCreditEmailHTML(payload.credits)
      : buildSubscriptionEmailHTML(payload.tier, payload.bonusCredits || 0);

    const from = RESEND_FROM_EMAIL.includes('<') ? RESEND_FROM_EMAIL : `CeriaKid <${RESEND_FROM_EMAIL}>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: payload.to, subject: content.subject, html: content.html }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      console.log(`Welcome email sent (${payload.type}) to ${payload.to} — id=${data.id}`);
    } else {
      console.error(`Resend failed (${res.status}):`, JSON.stringify(data));
    }
  } catch (err) {
    console.error('sendWelcomeEmail failed:', err?.message || err);
  }
}

// Hantar push notification TERUS via web-push library. Fire-and-forget.
async function notifyAdmins(base44, { title, body, url }) {
  try {
    const publicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const privateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    if (!publicKey || !privateKey) {
      console.error('VAPID not configured — push skipped');
      return;
    }
    let subject = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@ceriakid.com';
    // Apple APNs strict: strip angle brackets + spaces
    subject = subject.trim().replace(/[<>]/g, '').replace(/\s+/g, '');
    if (!subject.startsWith('mailto:') && !subject.startsWith('http')) subject = `mailto:${subject}`;
    subject = subject.replace(/^mailto:\s+/, 'mailto:');
    webpush.setVapidDetails(subject, publicKey, privateKey);

    const subs = await base44.asServiceRole.entities.PushSubscription.filter({ isAdmin: true });
    if (subs.length === 0) {
      console.log('No admin push subscribers');
      return;
    }

    const notifPayload = JSON.stringify({
      title, body,
      url: url || '/admin-dashboard?tab=analytics',
      tag: 'order-notif',
    });

    let sent = 0, failed = 0;
    const deadEndpoints = [];
    await Promise.all(subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          notifPayload
        );
        sent++;
      } catch (err) {
        failed++;
        if (err.statusCode === 410 || err.statusCode === 404) deadEndpoints.push(sub.id);
      }
    }));
    // Cleanup dead endpoints
    for (const id of deadEndpoints) {
      try { await base44.asServiceRole.entities.PushSubscription.delete(id); } catch (_) {}
    }
    console.log(`Push sent: ${sent}/${subs.length}, failed=${failed}, cleaned=${deadEndpoints.length}`);
  } catch (err) {
    console.error('notifyAdmins failed:', err?.message || err);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FACEBOOK CONVERSIONS API (CAPI) — inline
// Server-side backup untuk Pixel Purchase event. Critical untuk iOS 14.5+ users
// dan ad-blocker users yang block browser pixel. eventID share dengan browser
// untuk dedup di Meta side.
// ═══════════════════════════════════════════════════════════════════════════

async function sha256HexFb(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(text).toLowerCase().trim()));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sendFbCapiPurchase({ email, phone, value, tier, eventID, fbp, fbc, ip, userAgent }) {
  try {
    const PIXEL_ID = Deno.env.get('FB_PIXEL_ID');
    const ACCESS_TOKEN = Deno.env.get('FB_ACCESS_TOKEN');
    if (!PIXEL_ID || !ACCESS_TOKEN) {
      console.log('FB CAPI not configured — skip');
      return;
    }

    const userData = {};
    if (email) userData.em = [await sha256HexFb(email)];
    if (phone) userData.ph = [await sha256HexFb(String(phone).replace(/\D/g, ''))];
    if (ip) userData.client_ip_address = ip;
    if (userAgent) userData.client_user_agent = userAgent;
    if (fbp) userData.fbp = fbp;
    if (fbc) userData.fbc = fbc;

    const eventData = {
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventID || `Purchase_${Date.now()}`, // dedup dengan browser pixel
      action_source: 'website',
      event_source_url: 'https://ceriakid.com/thank-you',
      user_data: userData,
      custom_data: {
        currency: 'MYR',
        value: value,
        content_name: tier,
        content_ids: [tier],
        content_type: 'product',
      },
    };

    const res = await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [eventData], access_token: ACCESS_TOKEN }),
    });
    const data = await res.json();
    if (res.ok) {
      console.log(`FB CAPI Purchase sent (tier=${tier}, value=RM${value}, eventID=${eventData.event_id}) fbtrace=${data.fbtrace_id}`);
    } else {
      console.error('FB CAPI Purchase failed:', JSON.stringify(data));
    }
  } catch (err) {
    console.error('sendFbCapiPurchase error:', err?.message || err);
  }
}

// Extract referral code dari reference string. Format: "...__ref_CODE"
function extractReferralCode(reference) {
  if (!reference) return '';
  const match = reference.match(/__ref_([A-Z0-9]+)$/);
  return match ? match[1] : '';
}

// Chip payment webhook — aktivkan subscription bila payment berjaya
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const bodyText = await req.text();

    // ─── Verify Chip webhook signature (HMAC SHA256) ───
    // Chip sends X-Signature header. We compute HMAC of raw body using CHIP_WEBHOOK_SECRET
    // and compare. Reject if mismatch — prevents fake webhook attacks.
    const webhookSecret = Deno.env.get('CHIP_WEBHOOK_SECRET');
    const signatureHeader = req.headers.get('X-Signature') || req.headers.get('x-signature');
    if (webhookSecret && signatureHeader) {
      try {
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
          'raw',
          encoder.encode(webhookSecret),
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        const sigBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(bodyText));
        const computedHex = Array.from(new Uint8Array(sigBytes)).map(b => b.toString(16).padStart(2, '0')).join('');
        const provided = signatureHeader.replace(/^sha256=/, '').toLowerCase().trim();
        if (computedHex !== provided) {
          console.error('Webhook signature mismatch');
          return Response.json({ error: 'Invalid signature' }, { status: 401 });
        }
      } catch (sigErr) {
        console.error('Signature verification failed:', sigErr);
        return Response.json({ error: 'Signature verification failed' }, { status: 401 });
      }
    } else if (webhookSecret && !signatureHeader) {
      console.error('Missing webhook signature header');
      return Response.json({ error: 'Missing signature' }, { status: 401 });
    }
    // ─── End signature verification ───

    const body = JSON.parse(bodyText);

    console.log('Chip webhook received:', JSON.stringify(body));

    // Chip always sends id, status, reference on every event
    if (!body.id || body.status === undefined) {
      console.error('Invalid webhook payload — missing id or status');
      return Response.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const secretKey = Deno.env.get('CHIP_SECRET_KEY');
    if (!secretKey) {
      return Response.json({ error: 'Payment gateway not configured' }, { status: 500 });
    }

    // Chip sends payment status in the payload
    const status = body.status;
    const purchaseId = body.id;
    const reference = body.reference; // format: "email__tier__timestamp"

    // Verify purchase directly with Chip before activating subscription
    const verifyResponse = await fetch(`https://gate.chip-in.asia/api/v1/purchases/${purchaseId}/`, {
      headers: { 'Authorization': `Bearer ${secretKey}` }
    });

    if (!verifyResponse.ok) {
      console.error('Unable to verify Chip purchase:', purchaseId);
      return Response.json({ error: 'Unable to verify purchase' }, { status: 400 });
    }

    const verifiedPurchase = await verifyResponse.json();
    const verifiedStatus = verifiedPurchase.status;
    const verifiedReference = verifiedPurchase.reference;

    // Only process successful payments confirmed by Chip API
    if (status !== 'paid' || verifiedStatus !== 'paid') {
      console.log('Payment not paid, webhook status:', status, 'verified status:', verifiedStatus);
      return Response.json({ received: true });
    }

    if (verifiedReference && verifiedReference !== reference) {
      console.error('Reference mismatch:', reference, verifiedReference);
      return Response.json({ error: 'Reference mismatch' }, { status: 400 });
    }

    if (!reference) {
      console.error('No reference found in webhook payload');
      return Response.json({ error: 'Missing reference' }, { status: 400 });
    }

    // ─── CREDIT PURCHASE: reference = "credit__email__packageId__totalCredits__timestamp" ───
    if (reference.startsWith('credit__')) {
      const creditParts = reference.split('__');
      if (creditParts.length < 5) {
        console.error('Invalid credit reference format:', reference);
        return Response.json({ error: 'Invalid credit reference' }, { status: 400 });
      }
      const creditUserEmail = creditParts[1];
      const packageId = creditParts[2];
      const totalCredits = parseInt(creditParts[3], 10);

      if (!creditUserEmail || !totalCredits || totalCredits <= 0) {
        console.error('Invalid credit data:', { creditUserEmail, totalCredits });
        return Response.json({ error: 'Invalid credit data' }, { status: 400 });
      }

      // Idempotency check — kalau dah ada transaction dengan referenceId yang sama, skip
      const existingTx = await base44.asServiceRole.entities.CreditTransaction.filter({
        referenceId: purchaseId,
      });
      if (existingTx.length > 0) {
        console.log(`Credit purchase already processed: ${purchaseId}`);
        return Response.json({ received: true, alreadyProcessed: true });
      }

      // Tambah kredit terus (inline — tak panggil fungsi addCredits sebab webhook unauthenticated)
      const existingCredit = await base44.asServiceRole.entities.UserCredit.filter({ userEmail: creditUserEmail });
      const nowIso = new Date().toISOString();
      let newBalance;
      if (existingCredit.length === 0) {
        const created = await base44.asServiceRole.entities.UserCredit.create({
          userEmail: creditUserEmail,
          balance: totalCredits,
          totalPurchased: totalCredits,
          totalUsed: 0,
          lastTopUpAt: nowIso,
        });
        newBalance = created.balance;
      } else {
        const c = existingCredit[0];
        newBalance = (c.balance || 0) + totalCredits;
        await base44.asServiceRole.entities.UserCredit.update(c.id, {
          balance: newBalance,
          totalPurchased: (c.totalPurchased || 0) + totalCredits,
          lastTopUpAt: nowIso,
        });
      }

      await base44.asServiceRole.entities.CreditTransaction.create({
        userEmail: creditUserEmail,
        type: 'purchase',
        amount: totalCredits,
        balanceAfter: newBalance,
        feature: 'top_up',
        description: `Pembelian pakej ${packageId} — ${totalCredits} kredit`,
        referenceId: purchaseId,
        metadata: { packageId, chipPurchaseId: purchaseId },
      });

      console.log(`Credit purchase activated: ${creditUserEmail} +${totalCredits} (pkg=${packageId})`);

      // Push notification to admins — credit top-up
      const creditPriceMYR = (verifiedPurchase.purchase?.total || 0) / 100;
      await notifyAdmins(base44, {
        title: '💰 Credit Top-Up Baru!',
        body: `${creditUserEmail} beli ${totalCredits} kredit (${packageId}) — RM${creditPriceMYR.toFixed(2)}`,
      });

      // Welcome email — credit purchase
      await sendWelcomeEmailSafe(base44, {
        to: creditUserEmail,
        type: 'credit',
        credits: totalCredits,
      });

      // ─── AFFILIATE COMMISSION (credit purchase) ───
      const creditRefCode = extractReferralCode(reference);
      if (creditRefCode) {
        const priceMYR = (verifiedPurchase.purchase?.total || 0) / 100;
        await trackAffiliateCommission(base44, {
          referralCode: creditRefCode,
          referredEmail: creditUserEmail,
          purchaseType: 'credit',
          purchaseDetail: packageId,
          purchaseAmountMYR: priceMYR,
          chipPurchaseId: purchaseId,
        });
      }

      return Response.json({ received: true, creditActivated: true, credits: totalCredits });
    }
    // ─── END CREDIT PURCHASE ───

    // Parse reference: "userEmail__tier__timestamp"
    const parts = reference.split('__');
    if (parts.length < 3) {
      console.error('Invalid reference format (expected email__tier__timestamp):', reference);
      return Response.json({ error: 'Invalid reference' }, { status: 400 });
    }

    const userEmail = parts[0];
    const tier = parts[1];
    const timestamp = parts[2];

    const validTiers = ['asas', 'standard', 'keluarga'];
    if (!validTiers.includes(tier)) {
      console.error('Invalid tier in reference:', tier);
      return Response.json({ error: 'Invalid tier' }, { status: 400 });
    }

    // Security: verify purchaseId matches what we stored for this user
    // This prevents reference spoofing — the purchase ID from Chip must match
    const verifyExisting = await base44.asServiceRole.entities.UserSubscription.filter({ email: userEmail });
    if (verifyExisting.length > 0) {
      const storedPurchaseId = verifyExisting[0].stripeCustomerId; // we store Chip purchase ID here
      if (storedPurchaseId && storedPurchaseId !== purchaseId) {
        console.error(`Purchase ID mismatch for ${userEmail}: stored=${storedPurchaseId}, received=${purchaseId}`);
        return Response.json({ error: 'Purchase ID mismatch' }, { status: 400 });
      }
    }

    // Calculate expiry — 1 year from now
    const now = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    // Find existing subscription (use already fetched)
    const existing = verifyExisting;
    const currentSub = existing[0];

    // ─── DOWNGRADE PROTECTION (webhook level) ───
    // Kalau user dah ada subscription aktif yang LEBIH TINGGI atau period yang LEBIH JAUH,
    // JANGAN tukar tier ke lebih rendah / pendekkan expiry. Ini melindungi user dari
    // race condition, replay attack, atau bug front-end.
    const TIER_RANK = { free: 0, asas: 1, standard: 2, keluarga: 3, premium: 2, pro: 3 };
    let finalTier = tier;
    let finalPeriodStart = now.toISOString();
    let finalPeriodEnd = expiryDate.toISOString();

    if (currentSub && currentSub.status === 'active' && currentSub.tier && currentSub.tier !== 'free') {
      const currentRank = TIER_RANK[currentSub.tier] ?? 0;
      const newRank = TIER_RANK[tier] ?? 0;
      const currentEnd = currentSub.currentPeriodEnd ? new Date(currentSub.currentPeriodEnd) : null;
      const stillValid = currentEnd && currentEnd > now;

      if (stillValid) {
        // Kekalkan tier yang LEBIH TINGGI
        if (currentRank > newRank) {
          finalTier = currentSub.tier;
          console.warn(`Downgrade blocked: ${userEmail} sudah ada ${currentSub.tier}, payment untuk ${tier} diterima tapi tier dikekalkan`);
        }
        // Kekalkan period start asal kalau current masih lebih awal (preserve original start)
        if (currentSub.currentPeriodStart) {
          finalPeriodStart = currentSub.currentPeriodStart;
        }
        // Kekalkan expiry yang LEBIH JAUH (jangan pendekkan)
        if (currentEnd > expiryDate) {
          finalPeriodEnd = currentSub.currentPeriodEnd;
        }
      }
    }
    // ─── END DOWNGRADE PROTECTION ───

    const subData = {
      email: userEmail,
      tier: finalTier,
      status: 'active',
      stripeCustomerId: purchaseId, // storing Chip purchase ID
      currentPeriodStart: finalPeriodStart,
      currentPeriodEnd: finalPeriodEnd,
    };

    // Kalau user ni sebelum ni dah dapat abandoned cart reminder & sekarang baru bayar
    // → tandai sebagai 'recovered' supaya admin boleh track ROI campaign
    if (existing.length > 0 && existing[0].abandonedReminderSent && existing[0].abandonedReminderStatus !== 'recovered') {
      subData.abandonedReminderStatus = 'recovered';
      subData.recoveredAt = new Date().toISOString();
      console.log(`🎉 Abandoned cart RECOVERED: ${userEmail} (tier=${finalTier})`);
    }

    if (existing.length > 0) {
      await base44.asServiceRole.entities.UserSubscription.update(existing[0].id, subData);
    } else {
      await base44.asServiceRole.entities.UserSubscription.create(subData);
    }

    console.log(`Subscription activated: ${userEmail} → ${finalTier} until ${finalPeriodEnd}`);

    // Push notification to admins — new subscription
    const subPricing = { asas: 49, standard: 99, keluarga: 199 };
    const subPriceMYR = subPricing[tier] || 0;
    await notifyAdmins(base44, {
      title: '🎉 Subscription Baru!',
      body: `${userEmail} langgan pelan ${tier.toUpperCase()} — RM${subPriceMYR}`,
    });

    // Welcome email — subscription (include bonus credits info)
    const welcomeBonus = { asas: 5, standard: 20, keluarga: 50 }[tier] || 0;
    await sendWelcomeEmailSafe(base44, {
      to: userEmail,
      type: 'subscription',
      tier,
      bonusCredits: welcomeBonus,
    });

    // ─── BONUS WELCOME CREDITS ikut tier ───
    // Asas: 5 | Standard: 20 | Keluarga: 50
    const WELCOME_CREDITS = { asas: 5, standard: 20, keluarga: 50 };
    const bonusAmount = WELCOME_CREDITS[tier] || 0;

    if (bonusAmount > 0) {
      // Idempotency — guna purchaseId sebagai referenceId, prefix "welcome__" supaya
      // tak conflict dengan credit purchase. Skip kalau dah ada transaction sama.
      const welcomeRefId = `welcome__${purchaseId}`;
      const existingBonus = await base44.asServiceRole.entities.CreditTransaction.filter({
        referenceId: welcomeRefId,
      });

      if (existingBonus.length === 0) {
        const existingCredit = await base44.asServiceRole.entities.UserCredit.filter({ userEmail });
        const nowIso = new Date().toISOString();
        let bonusNewBalance;
        if (existingCredit.length === 0) {
          const created = await base44.asServiceRole.entities.UserCredit.create({
            userEmail,
            balance: bonusAmount,
            totalPurchased: 0,
            totalUsed: 0,
            lastTopUpAt: nowIso,
          });
          bonusNewBalance = created.balance;
        } else {
          const c = existingCredit[0];
          bonusNewBalance = (c.balance || 0) + bonusAmount;
          await base44.asServiceRole.entities.UserCredit.update(c.id, {
            balance: bonusNewBalance,
            lastTopUpAt: nowIso,
          });
        }

        await base44.asServiceRole.entities.CreditTransaction.create({
          userEmail,
          type: 'bonus',
          amount: bonusAmount,
          balanceAfter: bonusNewBalance,
          feature: 'bonus',
          description: `🎁 Bonus selamat datang — pelan ${tier} (${bonusAmount} kredit AI percuma)`,
          referenceId: welcomeRefId,
          metadata: { tier, chipPurchaseId: purchaseId, source: 'subscription_welcome_bonus' },
        });

        console.log(`Welcome bonus awarded: ${userEmail} +${bonusAmount} kredit (tier=${tier})`);
      } else {
        console.log(`Welcome bonus already awarded for ${purchaseId}, skipping`);
      }
    }
    // ─── END BONUS CREDITS ───

    // ─── AFFILIATE COMMISSION (subscription) ───
    const subRefCode = extractReferralCode(reference);
    if (subRefCode) {
      const priceMYR = subPriceMYR;
      await trackAffiliateCommission(base44, {
        referralCode: subRefCode,
        referredEmail: userEmail,
        purchaseType: 'subscription',
        purchaseDetail: tier,
        purchaseAmountMYR: priceMYR,
        chipPurchaseId: purchaseId,
      });
    }

    // ─── FACEBOOK CAPI Purchase event (server-side backup pixel) ───
    // Skip kalau ini upgrade existing paid sub (preserve as upgrade — tak fire Purchase
    // sebab browser pixel pun skip upgrade). Detect by checking if previous tier was paid.
    const wasUpgrade = currentSub && currentSub.tier && currentSub.tier !== 'free'
      && currentSub.status === 'active' && currentSub.currentPeriodEnd
      && new Date(currentSub.currentPeriodEnd) > new Date();

    if (!wasUpgrade) {
      const tracking = currentSub?.fbTracking || {};
      // Deterministic eventID dari purchaseId — frontend Pixel guna formula sama
      // supaya Meta auto-dedup browser vs CAPI event.
      const purchaseEventID = `Purchase_${purchaseId}`;
      await sendFbCapiPurchase({
        email: userEmail,
        phone: tracking.phone,
        value: subPriceMYR,
        tier: tier,
        eventID: purchaseEventID,
        fbp: tracking.fbp,
        fbc: tracking.fbc,
        ip: tracking.ip,
        userAgent: tracking.userAgent,
      });
    }

    return Response.json({ received: true, activated: true, welcomeCredits: bonusAmount });

  } catch (error) {
    console.error('Chip webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});