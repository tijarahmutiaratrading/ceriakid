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

    // Tier pricing — yearly plans (MYR to sen)
    const pricing = {
      asas:     { amount: 4900,  label: 'Asas — RM49/tahun' },
      standard: { amount: 9900,  label: 'Standard — RM99/tahun' },
      keluarga: { amount: 19900, label: 'Keluarga — RM199/tahun' },
    };

    if (!pricing[tier]) {
      return Response.json({ error: 'Invalid tier' }, { status: 400 });
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
            name: pricing[tier].label,
            price: pricing[tier].amount,
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
      success_redirect: `${origin}/?payment=success&tier=${tier}`,
      failure_redirect: `${origin}/?payment=failed`,
      success_callback: `https://api.base44.com/api/apps/69f1c132ffcd7c660466eec5/functions/chipWebhook`,
      send_receipt: true,
      reference: `${user.email}__${tier}__${Date.now()}`,
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

    const subData = {
      email: user.email,
      tier: tier,
      status: 'incomplete',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: expiryDate.toISOString(),
      stripeCustomerId: data.id, // store Chip purchase ID here for webhook matching
    };

    if (existing.length > 0) {
      await base44.asServiceRole.entities.UserSubscription.update(existing[0].id, subData);
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