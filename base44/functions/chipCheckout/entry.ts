import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tier, email, name, phone } = await req.json();

    if (!tier || !email || !name || !phone) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Tier pricing (MYR to sen)
    const pricing = {
      premium: { amount: 2490, name: 'Premium - RM24.90/month' },
      pro: { amount: 4490, name: 'Pro Keluarga - RM44.90/month' }
    };

    if (!pricing[tier]) {
      return Response.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const brandId = Deno.env.get('CHIP_BRAND_ID');
    const secretKey = Deno.env.get('CHIP_SECRET_KEY');

    if (!brandId || !secretKey) {
      return Response.json({ error: 'Payment gateway not configured' }, { status: 500 });
    }

    // Create Chip charge
    const chargeData = {
      amount: pricing[tier].amount,
      currency: 'MYR',
      description: pricing[tier].name,
      metadata: {
        user_email: user.email,
        tier: tier,
        name: name,
        phone: phone
      },
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      redirect_url: `${new URL(req.url).origin}/?payment=success&tier=${tier}`,
      callback_url: `${new URL(req.url).origin}/api/webhooks/chip`
    };

    const response = await fetch('https://api.chip-in.asia/v1/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${secretKey}`
      },
      body: JSON.stringify(chargeData)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Chip API error:', data);
      return Response.json({ error: 'Payment gateway error' }, { status: 500 });
    }

    // Store subscription intent
    await base44.asServiceRole.entities.UserSubscription.create({
      email: user.email,
      tier: tier,
      status: 'pending',
      selectedAgeGroup: 'prasekolah'
    });

    return Response.json({
      checkoutUrl: data.checkout_url || data.payment_url,
      chargeId: data.id
    });

  } catch (error) {
    console.error('Chip checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});