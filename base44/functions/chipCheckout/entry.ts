import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tier, email, name, phone, isUpgrade, referralCode } = await req.json();

    if (!tier || !email || !name || !phone) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate referral code (jika ada) — tak boleh refer diri sendiri
    let validReferralCode = '';
    if (referralCode) {
      const aff = await base44.asServiceRole.entities.Affiliate.filter({ referralCode: referralCode.toUpperCase().trim() });
      if (aff.length > 0 && aff[0].status === 'active' && aff[0].userEmail !== user.email) {
        validReferralCode = aff[0].referralCode;
      }
    }

    // Tier pricing — yearly plans (MYR to sen)
    const pricing = {
      asas:     { amount: 4900,  label: 'Asas — RM49/tahun' },
      standard: { amount: 9900,  label: 'Standard — RM99/tahun' },
      keluarga: { amount: 19900, label: 'Keluarga — RM199/tahun' },
    };

    const TIER_ORDER = ['free', 'asas', 'standard', 'keluarga'];

    if (!pricing[tier]) {
      return Response.json({ error: 'Invalid tier' }, { status: 400 });
    }

    // Pro-rata upgrade: charge only the gap (newPrice − oldPrice)
    let chargeAmount = pricing[tier].amount;
    let chargeLabel = pricing[tier].label;

    if (isUpgrade) {
      const existingSub = await base44.asServiceRole.entities.UserSubscription.filter({ email: user.email });
      const current = existingSub[0];
      if (current && current.status === 'active' && pricing[current.tier]) {
        const currentIdx = TIER_ORDER.indexOf(current.tier);
        const newIdx = TIER_ORDER.indexOf(tier);
        if (newIdx > currentIdx) {
          const gap = pricing[tier].amount - pricing[current.tier].amount;
          if (gap > 0) {
            chargeAmount = gap;
            chargeLabel = `Naik Taraf ${current.tier.toUpperCase()} → ${tier.toUpperCase()} (RM${(gap / 100).toFixed(0)})`;
          }
        }
      }
    }

    const brandId = Deno.env.get('CHIP_BRAND_ID');
    const secretKey = Deno.env.get('CHIP_SECRET_KEY');

    if (!brandId || !secretKey) {
      return Response.json({ error: 'Payment gateway not configured' }, { status: 500 });
    }

    const origin = new URL(req.url).origin;

    // Create Chip purchase (FPX one-time payment)
    const purchaseData = {
      purchase: {
        currency: 'MYR',
        products: [
          {
            name: chargeLabel,
            price: chargeAmount,
            quantity: 1
          }
        ]
      },
      brand_id: brandId,
      client: {
        email: email,
        full_name: name,
        phone: phone
      },
      success_redirect: `${origin}/thank-you?tier=${tier}`,
      failure_redirect: `${origin}/?payment=failed`,
      success_callback: `https://api.base44.com/api/apps/${Deno.env.get('BASE44_APP_ID')}/functions/chipWebhook`,
      send_receipt: true,
      reference: validReferralCode
        ? `${user.email}__${tier}__${Date.now()}__ref_${validReferralCode}`
        : `${user.email}__${tier}__${Date.now()}`,
    };

    const response = await fetch('https://gate.chip-in.asia/api/v1/purchases/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${secretKey}`
      },
      body: JSON.stringify(purchaseData)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Chip API error:', JSON.stringify(data));
      return Response.json({ error: 'Payment gateway error' }, { status: 500 });
    }

    // Store pending subscription intent
    const existing = await base44.asServiceRole.entities.UserSubscription.filter({ email: user.email });
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    const current = existing[0];
    // Don't overwrite an ACTIVE paid subscription with an incomplete one — user is
    // probably upgrading and we should keep them as paid until webhook confirms.
    const hasActivePaid = current && current.status === 'active' && current.tier !== 'free';

    const subData = {
      email: user.email,
      tier: hasActivePaid ? current.tier : tier,
      status: hasActivePaid ? 'active' : 'incomplete',
      currentPeriodStart: hasActivePaid ? current.currentPeriodStart : new Date().toISOString(),
      currentPeriodEnd: hasActivePaid ? current.currentPeriodEnd : expiryDate.toISOString(),
      stripeCustomerId: data.id, // store latest Chip purchase ID for webhook matching
    };

    if (current) {
      await base44.asServiceRole.entities.UserSubscription.update(current.id, subData);
    } else {
      await base44.asServiceRole.entities.UserSubscription.create(subData);
    }

    return Response.json({
      checkoutUrl: data.checkout_url,
      purchaseId: data.id
    });

  } catch (error) {
    console.error('Chip checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});