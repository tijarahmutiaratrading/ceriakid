// CHIP credit pack checkout
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin, getUserFromRequest } from '../_shared/supabaseAdmin.ts';

const CREDIT_PACKAGES: Record<string, { credits: number; bonus: number; price: number; label: string }> = {
  starter: { credits: 50,  bonus: 0,   price: 1900,  label: 'Pek Permulaan — 50 kredit' },
  family:  { credits: 140, bonus: 25,  price: 5900,  label: 'Pek Keluarga — 165 kredit' },
  power:   { credits: 380, bonus: 70,  price: 14900, label: 'Pek Power — 450 kredit' },
};

Deno.serve(async (req) => {
  const cors = handleCors(req); if (cors) return cors;

  try {
    const user = await getUserFromRequest(req);
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

    const { packageId, email, name, phone, referralCode } = await req.json();
    if (!packageId || !email || !name || !phone) return jsonResponse({ error: 'Missing required fields' }, 400);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[+0-9\s-]{8,15}$/;
    if (!emailRegex.test(email.trim())) return jsonResponse({ error: 'Invalid email format' }, 400);
    if (!phoneRegex.test(phone.trim())) return jsonResponse({ error: 'Invalid phone format' }, 400);
    if (name.trim().length < 2) return jsonResponse({ error: 'Name too short' }, 400);

    const pkg = CREDIT_PACKAGES[packageId];
    if (!pkg) return jsonResponse({ error: 'Invalid package' }, 400);

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

    const brandId = Deno.env.get('CHIP_BRAND_ID');
    const secretKey = Deno.env.get('CHIP_SECRET_KEY');
    if (!brandId || !secretKey) return jsonResponse({ error: 'Payment gateway not configured' }, 500);

    const APP_URL = Deno.env.get('APP_URL') || 'https://ceriakid.com';
    const totalCredits = pkg.credits + pkg.bonus;
    const baseRef = `credit__${user.email}__${packageId}__${totalCredits}__${Date.now()}`;
    const reference = validReferralCode ? `${baseRef}__ref_${validReferralCode}` : baseRef;
    const callbackUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/chip-webhook`;

    const purchaseData = {
      purchase: { currency: 'MYR', products: [{ name: pkg.label, price: pkg.price, quantity: 1 }] },
      brand_id: brandId,
      client: { email, full_name: name, phone },
      success_redirect: `${APP_URL}/thank-you?type=credit&credits=${totalCredits}&package=${packageId}`,
      failure_redirect: `${APP_URL}/buy-credits?status=failed`,
      success_callback: callbackUrl,
      send_receipt: true,
      reference,
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

    return jsonResponse({ checkoutUrl: data.checkout_url, purchaseId: data.id, credits: totalCredits });
  } catch (error) {
    console.error('chipCreditCheckout error:', error);
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});