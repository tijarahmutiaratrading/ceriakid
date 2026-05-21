import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

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

    const subData = {
      email: userEmail,
      tier: tier,
      status: 'active',
      stripeCustomerId: purchaseId, // storing Chip purchase ID
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: expiryDate.toISOString(),
    };

    if (existing.length > 0) {
      await base44.asServiceRole.entities.UserSubscription.update(existing[0].id, subData);
    } else {
      await base44.asServiceRole.entities.UserSubscription.create(subData);
    }

    console.log(`Subscription activated: ${userEmail} → ${tier} until ${expiryDate.toISOString()}`);

    return Response.json({ received: true, activated: true });

  } catch (error) {
    console.error('Chip webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});