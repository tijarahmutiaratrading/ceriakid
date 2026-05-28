import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Pakej kredit (sync dengan lib/creditPackages.js)
const CREDIT_PACKAGES = {
  starter: { credits: 50,  bonus: 0,   price: 1900,  label: 'Pek Permulaan — 50 kredit' },
  family:  { credits: 140, bonus: 25,  price: 5900,  label: 'Pek Keluarga — 165 kredit' },
  power:   { credits: 380, bonus: 70,  price: 14900, label: 'Pek Power — 450 kredit' },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { packageId, email, name, phone, referralCode } = await req.json();

    if (!packageId || !email || !name || !phone) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate referral code
    let validReferralCode = '';
    if (referralCode) {
      const aff = await base44.asServiceRole.entities.Affiliate.filter({ referralCode: referralCode.toUpperCase().trim() });
      if (aff.length > 0 && aff[0].status === 'active' && aff[0].userEmail !== user.email) {
        validReferralCode = aff[0].referralCode;
      }
    }

    const pkg = CREDIT_PACKAGES[packageId];
    if (!pkg) {
      return Response.json({ error: 'Invalid package' }, { status: 400 });
    }

    const brandId = Deno.env.get('CHIP_BRAND_ID');
    const secretKey = Deno.env.get('CHIP_SECRET_KEY');

    if (!brandId || !secretKey) {
      return Response.json({ error: 'Payment gateway not configured' }, { status: 500 });
    }

    const origin = new URL(req.url).origin;
    const totalCredits = pkg.credits + pkg.bonus;

    // Reference format: "credit__userEmail__packageId__totalCredits__timestamp"
    // Webhook akan parse format ni untuk tahu ini pembelian kredit
    const baseRef = `credit__${user.email}__${packageId}__${totalCredits}__${Date.now()}`;
    const reference = validReferralCode ? `${baseRef}__ref_${validReferralCode}` : baseRef;

    const purchaseData = {
      purchase: {
        currency: 'MYR',
        products: [{
          name: pkg.label,
          price: pkg.price,
          quantity: 1,
        }],
      },
      brand_id: brandId,
      client: { email, full_name: name, phone },
      success_redirect: `${origin}/thank-you?type=credit&credits=${totalCredits}&package=${packageId}`,
      failure_redirect: `${origin}/buy-credits?status=failed`,
      success_callback: `https://api.base44.com/api/apps/${Deno.env.get('BASE44_APP_ID')}/functions/chipWebhook`,
      send_receipt: true,
      reference,
    };

    const response = await fetch('https://gate.chip-in.asia/api/v1/purchases/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${secretKey}`,
      },
      body: JSON.stringify(purchaseData),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Chip API error:', JSON.stringify(data));
      return Response.json({ error: 'Payment gateway error' }, { status: 500 });
    }

    return Response.json({
      checkoutUrl: data.checkout_url,
      purchaseId: data.id,
      credits: totalCredits,
    });
  } catch (error) {
    console.error('Credit checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});