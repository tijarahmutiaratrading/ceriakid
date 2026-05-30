// CHIP payment webhook — activate subscription / credit pack after payment confirmed
// PUBLIC endpoint — verifies HMAC SHA-256 signature before processing
import { jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { addCredits } from '../_shared/credits.ts';

const TIER_RANK: Record<string, number> = { free: 0, asas: 1, standard: 2, keluarga: 3, premium: 2, pro: 3 };
const SUB_PRICING: Record<string, number> = { asas: 49, standard: 99, keluarga: 199 };
const WELCOME_CREDITS: Record<string, number> = { asas: 5, standard: 20, keluarga: 50 };

const TIER_CONFIG = [
  { key: 'bronze',   min: 0,   max: 9,        subRate: 20, credRate: 15 },
  { key: 'silver',   min: 10,  max: 29,       subRate: 22, credRate: 17 },
  { key: 'gold',     min: 30,  max: 99,       subRate: 24, credRate: 18 },
  { key: 'platinum', min: 100, max: Infinity, subRate: 25, credRate: 20 },
];

function calculateTier(total: number) {
  return TIER_CONFIG.find(t => total >= t.min && total <= t.max) || TIER_CONFIG[0];
}

function extractReferralCode(ref: string): string {
  const m = ref?.match(/__ref_([A-Z0-9]+)$/);
  return m ? m[1] : '';
}

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(text).toLowerCase().trim()));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function trackAffiliateCommission(args: {
  referralCode: string; referredEmail: string; purchaseType: 'subscription' | 'credit';
  purchaseDetail: string; purchaseAmountMYR: number; chipPurchaseId: string;
}) {
  try {
    const { referralCode, referredEmail, purchaseType, purchaseDetail, purchaseAmountMYR, chipPurchaseId } = args;
    if (!referralCode) return;

    const { data: existingRef } = await supabaseAdmin
      .from('ck_affiliate_referrals')
      .select('id')
      .eq('chip_purchase_id', chipPurchaseId);
    if (existingRef && existingRef.length > 0) return;

    const { data: aff } = await supabaseAdmin
      .from('ck_affiliates')
      .select('*')
      .eq('referral_code', referralCode)
      .eq('status', 'active')
      .maybeSingle();
    if (!aff || aff.user_email === referredEmail) return;

    const rate = purchaseType === 'subscription'
      ? (aff.commission_rate_subscription || 20)
      : (aff.commission_rate_credit || 15);
    const commissionMYR = Math.round((purchaseAmountMYR * rate / 100) * 100) / 100;

    await supabaseAdmin.from('ck_affiliate_referrals').insert({
      affiliate_email: aff.user_email,
      referral_code: referralCode,
      referred_email: referredEmail,
      purchase_type: purchaseType,
      purchase_detail: purchaseDetail,
      purchase_amount_myr: purchaseAmountMYR,
      commission_rate: rate,
      commission_myr: commissionMYR,
      status: 'approved',
      chip_purchase_id: chipPurchaseId,
    });

    // Auto-upgrade tier
    const newTotal = (aff.total_referrals || 0) + 1;
    const newTier = calculateTier(newTotal);
    const updateData: any = {
      total_referrals: newTotal,
      total_earned: (aff.total_earned || 0) + commissionMYR,
      pending_balance: (aff.pending_balance || 0) + commissionMYR,
    };
    if (newTier.key !== (aff.tier || 'bronze')) {
      updateData.tier = newTier.key;
      const oldTier = TIER_CONFIG.find(t => t.key === (aff.tier || 'bronze')) || TIER_CONFIG[0];
      if ((aff.commission_rate_subscription || 20) === oldTier.subRate) updateData.commission_rate_subscription = newTier.subRate;
      if ((aff.commission_rate_credit || 15) === oldTier.credRate) updateData.commission_rate_credit = newTier.credRate;
    }
    await supabaseAdmin.from('ck_affiliates').update(updateData).eq('id', aff.id);

    console.log(`Affiliate commission: ${aff.user_email} +RM${commissionMYR}`);
  } catch (err) { console.error('trackAffiliateCommission:', err); }
}

async function sendFbCapiPurchase(args: {
  email: string; phone?: string; value: number; tier: string; eventID: string;
  fbp?: string; fbc?: string; ip?: string; userAgent?: string;
}) {
  try {
    const PIXEL_ID = Deno.env.get('FB_PIXEL_ID');
    const ACCESS_TOKEN = Deno.env.get('FB_ACCESS_TOKEN');
    if (!PIXEL_ID || !ACCESS_TOKEN) return;

    const userData: any = {};
    if (args.email) userData.em = [await sha256Hex(args.email)];
    if (args.phone) userData.ph = [await sha256Hex(String(args.phone).replace(/\D/g, ''))];
    if (args.ip) userData.client_ip_address = args.ip;
    if (args.userAgent) userData.client_user_agent = args.userAgent;
    if (args.fbp) userData.fbp = args.fbp;
    if (args.fbc) userData.fbc = args.fbc;

    const event = {
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      event_id: args.eventID,
      action_source: 'website',
      event_source_url: 'https://ceriakid.com/thank-you',
      user_data: userData,
      custom_data: { currency: 'MYR', value: args.value, content_name: args.tier, content_ids: [args.tier], content_type: 'product' },
    };

    const res = await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [event], access_token: ACCESS_TOKEN }),
    });
    if (!res.ok) console.error('FB CAPI failed:', await res.text());
  } catch (err) { console.error('FB CAPI error:', err); }
}

async function sendWelcomeEmailSafe(payload: { to: string; type: 'subscription' | 'credit'; tier?: string; credits?: number; bonusCredits?: number }) {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_KEY');
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return;

    await fetch(`${SUPABASE_URL}/functions/v1/send-welcome-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
      body: JSON.stringify(payload),
    });
  } catch (err) { console.error('sendWelcomeEmail:', err); }
}

async function notifyAdmins(title: string, body: string) {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_KEY');
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return;
    await fetch(`${SUPABASE_URL}/functions/v1/send-push-notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
      body: JSON.stringify({ title, body, url: '/admin-dashboard?tab=analytics' }),
    });
  } catch (err) { console.error('notifyAdmins:', err); }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  try {
    const bodyText = await req.text();

    // Verify HMAC signature — fail closed
    const webhookSecret = Deno.env.get('CHIP_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('CHIP_WEBHOOK_SECRET not configured');
      return jsonResponse({ error: 'Webhook not configured' }, 500);
    }
    const signatureHeader = req.headers.get('X-Signature') || req.headers.get('x-signature');
    if (!signatureHeader) return jsonResponse({ error: 'Missing signature' }, 401);

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', encoder.encode(webhookSecret),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sigBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(bodyText));
    const computedHex = Array.from(new Uint8Array(sigBytes)).map(b => b.toString(16).padStart(2, '0')).join('');
    const provided = signatureHeader.replace(/^sha256=/, '').toLowerCase().trim();
    if (computedHex !== provided) return jsonResponse({ error: 'Invalid signature' }, 401);

    const body = JSON.parse(bodyText);
    if (!body.id || body.status === undefined) return jsonResponse({ error: 'Invalid payload' }, 400);

    const secretKey = Deno.env.get('CHIP_SECRET_KEY');
    if (!secretKey) return jsonResponse({ error: 'Payment gateway not configured' }, 500);

    const purchaseId = body.id;
    const reference = body.reference;

    // Verify with CHIP
    const verifyRes = await fetch(`https://gate.chip-in.asia/api/v1/purchases/${purchaseId}/`, {
      headers: { 'Authorization': `Bearer ${secretKey}` },
    });
    if (!verifyRes.ok) return jsonResponse({ error: 'Unable to verify purchase' }, 400);
    const verified = await verifyRes.json();

    if (body.status !== 'paid' || verified.status !== 'paid') return jsonResponse({ received: true });
    if (verified.reference && verified.reference !== reference) return jsonResponse({ error: 'Reference mismatch' }, 400);
    if (!reference) return jsonResponse({ error: 'Missing reference' }, 400);

    // ─── CREDIT PURCHASE ───
    if (reference.startsWith('credit__')) {
      const parts = reference.split('__');
      if (parts.length < 5) return jsonResponse({ error: 'Invalid credit reference' }, 400);
      const userEmail = parts[1];
      const packageId = parts[2];
      const totalCredits = parseInt(parts[3], 10);
      if (!userEmail || !totalCredits || totalCredits <= 0) return jsonResponse({ error: 'Invalid credit data' }, 400);

      // Idempotency
      const { data: existing } = await supabaseAdmin
        .from('ck_credit_transactions')
        .select('id')
        .eq('reference_id', purchaseId);
      if (existing && existing.length > 0) return jsonResponse({ received: true, alreadyProcessed: true });

      await addCredits(userEmail, totalCredits, 'purchase', 'top_up',
        `Pembelian pakej ${packageId} — ${totalCredits} kredit`, purchaseId,
        { packageId, chipPurchaseId: purchaseId });

      const priceMYR = (verified.purchase?.total || 0) / 100;
      await notifyAdmins('💰 Credit Top-Up Baru!', `${userEmail} beli ${totalCredits} kredit (${packageId}) — RM${priceMYR.toFixed(2)}`);
      await sendWelcomeEmailSafe({ to: userEmail, type: 'credit', credits: totalCredits });

      const refCode = extractReferralCode(reference);
      if (refCode) {
        await trackAffiliateCommission({
          referralCode: refCode, referredEmail: userEmail, purchaseType: 'credit',
          purchaseDetail: packageId, purchaseAmountMYR: priceMYR, chipPurchaseId: purchaseId,
        });
      }
      return jsonResponse({ received: true, creditActivated: true, credits: totalCredits });
    }

    // ─── SUBSCRIPTION ───
    const parts = reference.split('__');
    if (parts.length < 3) return jsonResponse({ error: 'Invalid reference' }, 400);
    const userEmail = parts[0];
    const tier = parts[1];
    if (!['asas', 'standard', 'keluarga'].includes(tier)) return jsonResponse({ error: 'Invalid tier' }, 400);

    const { data: existingSub } = await supabaseAdmin
      .from('ck_user_subscriptions')
      .select('*')
      .eq('email', userEmail)
      .maybeSingle();

    if (existingSub?.stripe_customer_id && existingSub.stripe_customer_id !== purchaseId) {
      return jsonResponse({ error: 'Purchase ID mismatch' }, 400);
    }

    const now = new Date();
    const expiryDate = new Date(); expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    let finalTier = tier;
    let finalPeriodStart = now.toISOString();
    let finalPeriodEnd = expiryDate.toISOString();

    if (existingSub && existingSub.status === 'active' && existingSub.tier !== 'free') {
      const currentEnd = existingSub.current_period_end ? new Date(existingSub.current_period_end) : null;
      const stillValid = currentEnd && currentEnd > now;
      if (stillValid) {
        if ((TIER_RANK[existingSub.tier] ?? 0) > (TIER_RANK[tier] ?? 0)) finalTier = existingSub.tier;
        if (existingSub.current_period_start) finalPeriodStart = existingSub.current_period_start;
        if (currentEnd && currentEnd > expiryDate) finalPeriodEnd = existingSub.current_period_end;
      }
    }

    const subData: any = {
      email: userEmail,
      tier: finalTier,
      status: 'active',
      stripe_customer_id: purchaseId,
      current_period_start: finalPeriodStart,
      current_period_end: finalPeriodEnd,
    };

    if (existingSub?.abandoned_reminder_sent && existingSub.abandoned_reminder_status !== 'recovered') {
      subData.abandoned_reminder_status = 'recovered';
      subData.recovered_at = new Date().toISOString();
    }

    if (existingSub) {
      await supabaseAdmin.from('ck_user_subscriptions').update(subData).eq('id', existingSub.id);
    } else {
      await supabaseAdmin.from('ck_user_subscriptions').insert(subData);
    }

    const priceMYR = SUB_PRICING[tier] || 0;
    await notifyAdmins('🎉 Subscription Baru!', `${userEmail} langgan pelan ${tier.toUpperCase()} — RM${priceMYR}`);
    await sendWelcomeEmailSafe({ to: userEmail, type: 'subscription', tier, bonusCredits: WELCOME_CREDITS[tier] || 0 });

    // Welcome bonus credits
    const bonusAmount = WELCOME_CREDITS[tier] || 0;
    if (bonusAmount > 0) {
      const welcomeRefId = `welcome__${purchaseId}`;
      const { data: existingBonus } = await supabaseAdmin
        .from('ck_credit_transactions')
        .select('id')
        .eq('reference_id', welcomeRefId);
      if (!existingBonus || existingBonus.length === 0) {
        await addCredits(userEmail, bonusAmount, 'bonus', 'bonus',
          `🎁 Bonus selamat datang — pelan ${tier} (${bonusAmount} kredit AI percuma)`,
          welcomeRefId, { tier, chipPurchaseId: purchaseId, source: 'subscription_welcome_bonus' });
      }
    }

    // Affiliate
    const refCode = extractReferralCode(reference);
    if (refCode) {
      await trackAffiliateCommission({
        referralCode: refCode, referredEmail: userEmail, purchaseType: 'subscription',
        purchaseDetail: tier, purchaseAmountMYR: priceMYR, chipPurchaseId: purchaseId,
      });
    }

    // FB CAPI (skip upgrades)
    const wasUpgrade = existingSub && existingSub.tier && existingSub.tier !== 'free'
      && existingSub.status === 'active' && existingSub.current_period_end
      && new Date(existingSub.current_period_end) > new Date();
    if (!wasUpgrade) {
      const tracking = existingSub?.fb_tracking || {};
      await sendFbCapiPurchase({
        email: userEmail, phone: tracking.phone, value: priceMYR, tier,
        eventID: `Purchase_${purchaseId}`,
        fbp: tracking.fbp, fbc: tracking.fbc, ip: tracking.ip, userAgent: tracking.userAgent,
      });
    }

    return jsonResponse({ received: true, activated: true, welcomeCredits: bonusAmount });
  } catch (error) {
    console.error('chipWebhook error:', error);
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});