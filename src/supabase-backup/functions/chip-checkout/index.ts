// CHIP subscription checkout — yearly plans (asas/standard/keluarga)
// Includes: rate limiting, referral validation, downgrade protection, pro-rata upgrade
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin, getUserFromRequest } from '../_shared/supabaseAdmin.ts';

const PRICING: Record<string, { amount: number; label: string }> = {
  asas:     { amount: 4900,  label: 'Asas — RM49/tahun' },
  standard: { amount: 9900,  label: 'Standard — RM99/tahun' },
  keluarga: { amount: 19900, label: 'Keluarga — RM199/tahun' },
};
const TIER_RANK: Record<string, number> = { free: 0, asas: 1, standard: 2, premium: 2, keluarga: 3, pro: 3 };

Deno.serve(async (req) => {
  const cors = handleCors(req); if (cors) return cors;

  try {
    const user = await getUserFromRequest(req);
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

    const { tier, email, name, phone, isUpgrade, referralCode, fbp, fbc, checkoutEventID } = await req.json();
    if (!tier || !email || !name || !phone) return jsonResponse({ error: 'Missing required fields' }, 400);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[+0-9\s-]{8,15}$/;
    if (!emailRegex.test(email.trim())) return jsonResponse({ error: 'Invalid email format' }, 400);
    if (!phoneRegex.test(phone.trim())) return jsonResponse({ error: 'Invalid phone format' }, 400);
    if (name.trim().length < 2) return jsonResponse({ error: 'Name too short' }, 400);
    if (!PRICING[tier]) return jsonResponse({ error: 'Invalid tier' }, 400);

    // Rate limit — max 5 checkout attempts per minute
    const oneMinAgo = new Date(Date.now() - 60_000).toISOString();
    const { data: recentTx } = await supabaseAdmin
      .from('ck_credit_transactions')
      .select('id')
      .eq('user_email', user.email)
      .eq('feature', 'checkout_attempt')
      .gte('created_at', oneMinAgo);
    if (recentTx && recentTx.length >= 5) {
      return jsonResponse({ error: 'Too many checkout attempts. Please wait 1 minute.' }, 429);
    }
    supabaseAdmin.from('ck_credit_transactions').insert({
      user_email: user.email,
      type: 'admin_adjustment',
      amount: 0,
      feature: 'checkout_attempt',
      description: `Checkout attempt: ${tier}`,
      metadata: { tier, ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null },
    }).then(() => {});

    // Validate referral
    let validReferralCode = '';
    if (referralCode) {
      const { data: aff } = await supabaseAdmin
        .from('ck_affiliates')
        .select('*')
        .eq('referral_code', referralCode.toUpperCase().trim())
        .eq('status', 'active')
        .maybeSingle();
      if (aff && aff.user_email !== user.email) validReferralCode = aff.referral_code;
    }

    // Get current sub for downgrade protection
    const { data: currentSub } = await supabaseAdmin
      .from('ck_user_subscriptions')
      .select('*')
      .eq('email', user.email)
      .maybeSingle();

    if (currentSub && currentSub.status === 'active' && currentSub.tier !== 'free') {
      const stillValid = currentSub.current_period_end && new Date(currentSub.current_period_end) > new Date();
      if (stillValid && (TIER_RANK[tier] ?? 0) <= (TIER_RANK[currentSub.tier] ?? 0)) {
        return jsonResponse({
          error: 'DOWNGRADE_BLOCKED',
          message: `Anda sudah ada pelan ${currentSub.tier.toUpperCase()} aktif sehingga ${new Date(currentSub.current_period_end).toLocaleDateString('ms-MY')}.`,
          currentTier: currentSub.tier,
          requestedTier: tier,
          currentPeriodEnd: currentSub.current_period_end,
        }, 400);
      }
    }

    // Pro-rata upgrade
    let chargeAmount = PRICING[tier].amount;
    let chargeLabel = PRICING[tier].label;
    if (isUpgrade && currentSub && currentSub.status === 'active' && PRICING[currentSub.tier]) {
      if ((TIER_RANK[tier] ?? 0) > (TIER_RANK[currentSub.tier] ?? 0)) {
        const gap = PRICING[tier].amount - PRICING[currentSub.tier].amount;
        if (gap > 0) {
          chargeAmount = gap;
          chargeLabel = `Naik Taraf ${currentSub.tier.toUpperCase()} → ${tier.toUpperCase()} (RM${(gap / 100).toFixed(0)})`;
        }
      }
    }

    const brandId = Deno.env.get('CHIP_BRAND_ID');
    const secretKey = Deno.env.get('CHIP_SECRET_KEY');
    const APP_URL = Deno.env.get('APP_URL') || 'https://ceriakid.com';
    if (!brandId || !secretKey) return jsonResponse({ error: 'Payment gateway not configured' }, 500);

    const origin = new URL(req.url).origin.includes('supabase.co') ? APP_URL : new URL(req.url).origin;
    const callbackUrl = `${SUPABASE_URL_PUBLIC()}/functions/v1/chip-webhook`;

    const purchaseData = {
      purchase: { currency: 'MYR', products: [{ name: chargeLabel, price: chargeAmount, quantity: 1 }] },
      brand_id: brandId,
      client: { email, full_name: name, phone },
      success_redirect: `${origin}/thank-you?tier=${tier}${isUpgrade ? '&upgrade=1' : ''}`,
      failure_redirect: `${origin}/?payment=failed`,
      success_callback: callbackUrl,
      send_receipt: true,
      reference: validReferralCode
        ? `${user.email}__${tier}__${Date.now()}__ref_${validReferralCode}`
        : `${user.email}__${tier}__${Date.now()}`,
    };

    const response = await fetch('https://gate.chip-in.asia/api/v1/purchases/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${secretKey}` },
      body: JSON.stringify(purchaseData),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('Chip API error:', JSON.stringify(data));
      return jsonResponse({ error: 'Payment gateway error' }, 500);
    }

    // Store pending sub
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    const hasActivePaid = currentSub && currentSub.status === 'active' && currentSub.tier !== 'free';

    const subData = {
      email: user.email,
      checkout_name: name.trim(),
      checkout_phone: phone.trim(),
      tier: hasActivePaid ? currentSub.tier : tier,
      status: hasActivePaid ? 'active' : 'incomplete',
      current_period_start: hasActivePaid ? currentSub.current_period_start : new Date().toISOString(),
      current_period_end: hasActivePaid ? currentSub.current_period_end : expiryDate.toISOString(),
      stripe_customer_id: data.id,
      fb_tracking: {
        fbp: fbp || null, fbc: fbc || null, eventID: checkoutEventID || null,
        phone, ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null,
        userAgent: req.headers.get('user-agent') || null,
      },
    };

    if (currentSub) {
      await supabaseAdmin.from('ck_user_subscriptions').update(subData).eq('id', currentSub.id);
    } else {
      await supabaseAdmin.from('ck_user_subscriptions').insert(subData);
    }

    // Auto-fill user name/phone
    try {
      const needsName = !user.full_name || user.full_name.trim().length === 0;
      const needsPhone = !user.phone || user.phone.trim().length === 0;
      if (needsName || needsPhone) {
        const userUpdate: any = {};
        if (needsName) userUpdate.full_name = name.trim();
        if (needsPhone) userUpdate.phone = phone.trim();
        await supabaseAdmin.from('ck_users').update(userUpdate).eq('email', user.email);
      }
    } catch (e) { console.warn('User sync failed:', (e as Error).message); }

    return jsonResponse({ checkoutUrl: data.checkout_url, purchaseId: data.id });
  } catch (error) {
    console.error('chipCheckout error:', error);
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});

function SUPABASE_URL_PUBLIC() {
  return Deno.env.get('SUPABASE_URL') || 'https://your-project.supabase.co';
}