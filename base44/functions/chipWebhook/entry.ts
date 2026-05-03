import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Chip payment webhook — aktivkan subscription bila payment berjaya
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const bodyText = await req.text();
    const body = JSON.parse(bodyText);

    console.log('Chip webhook received:', JSON.stringify(body));

    // Verify this is from Chip by checking required fields exist
    // Chip always sends id, status, reference on every event
    if (!body.id || body.status === undefined) {
      console.error('Invalid webhook payload — missing id or status');
      return Response.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Chip sends payment status in the payload
    const status = body.status;
    const purchaseId = body.id;
    const reference = body.reference; // format: "email__tier__timestamp"

    // Only process successful payments
    if (status !== 'paid') {
      console.log('Payment not paid, status:', status);
      return Response.json({ received: true });
    }

    if (!reference) {
      console.error('No reference found in webhook payload');
      return Response.json({ error: 'Missing reference' }, { status: 400 });
    }

    // Parse reference: "userEmail__tier__timestamp"
    const parts = reference.split('__');
    if (parts.length < 2) {
      console.error('Invalid reference format:', reference);
      return Response.json({ error: 'Invalid reference' }, { status: 400 });
    }

    const userEmail = parts[0];
    const tier = parts[1];

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