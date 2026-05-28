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

    // Rank merangkumi legacy tiers (premium, pro) supaya user lama tak boleh downgrade
    const TIER_RANK = { free: 0, asas: 1, standard: 2, premium: 2, keluarga: 3, pro: 3 };
    const rankOf = (t) => TIER_RANK[t] ?? 0;

    if (!pricing[tier]) {
      return Response.json({ error: 'Invalid tier' }, { status: 400 });
    }

    // ─── DOWNGRADE PROTECTION ───
    // Kalau user dah ada active subscription pada tier yang LEBIH TINGGI atau SAMA
    // dan belum expired, halang checkout. User mesti tunggu expiry atau hubungi support.
    const existingSubCheck = await base44.asServiceRole.entities.UserSubscription.filter({ email: user.email });
    const currentSub = existingSubCheck[0];
    if (currentSub && currentSub.status === 'active' && currentSub.tier !== 'free') {
      const stillValid = currentSub.currentPeriodEnd && new Date(currentSub.currentPeriodEnd) > new Date();
      if (stillValid) {
        const currentRank = rankOf(currentSub.tier);
        const newRank = rankOf(tier);
        if (newRank <= currentRank) {
          return Response.json({
            error: 'DOWNGRADE_BLOCKED',
            message: `Anda sudah ada pelan ${currentSub.tier.toUpperCase()} yang aktif sehingga ${new Date(currentSub.currentPeriodEnd).toLocaleDateString('ms-MY')}. Tidak boleh tukar ke pelan ${tier.toUpperCase()} (sama atau lebih rendah). Sila tunggu tamat tempoh atau hubungi sokongan.`,
            currentTier: currentSub.tier,
            requestedTier: tier,
            currentPeriodEnd: currentSub.currentPeriodEnd,
          }, { status: 400 });
        }
      }
    }
    // ─── END DOWNGRADE PROTECTION ───

    // Pro-rata upgrade: charge only the gap (newPrice − oldPrice)
    let chargeAmount = pricing[tier].amount;
    let chargeLabel = pricing[tier].label;

    if (isUpgrade && currentSub && currentSub.status === 'active' && pricing[currentSub.tier]) {
      if (rankOf(tier) > rankOf(currentSub.tier)) {
        const gap = pricing[tier].amount - pricing[currentSub.tier].amount;
        if (gap > 0) {
          chargeAmount = gap;
          chargeLabel = `Naik Taraf ${currentSub.tier.toUpperCase()} → ${tier.toUpperCase()} (RM${(gap / 100).toFixed(0)})`;
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
      success_redirect: `${origin}/thank-you?tier=${tier}${isUpgrade ? '&upgrade=1' : ''}`,
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
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    // Don't overwrite an ACTIVE paid subscription with an incomplete one — user is
    // probably upgrading and we should keep them as paid until webhook confirms.
    const hasActivePaid = currentSub && currentSub.status === 'active' && currentSub.tier !== 'free';

    const subData = {
      email: user.email,
      tier: hasActivePaid ? currentSub.tier : tier,
      status: hasActivePaid ? 'active' : 'incomplete',
      currentPeriodStart: hasActivePaid ? currentSub.currentPeriodStart : new Date().toISOString(),
      currentPeriodEnd: hasActivePaid ? currentSub.currentPeriodEnd : expiryDate.toISOString(),
      stripeCustomerId: data.id, // store latest Chip purchase ID for webhook matching
    };

    if (currentSub) {
      await base44.asServiceRole.entities.UserSubscription.update(currentSub.id, subData);
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