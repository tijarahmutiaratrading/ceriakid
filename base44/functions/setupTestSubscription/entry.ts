import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Only allow admin to use this
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { email, tier: requestedTier } = await req.json();

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    const validTiers = ['free', 'asas', 'standard', 'keluarga', 'pro'];
    const tier = validTiers.includes(requestedTier) ? requestedTier : 'keluarga';

    // Check if subscription exists
    const existing = await base44.asServiceRole.entities.UserSubscription.filter({ email });

    const subData = {
      email,
      tier,
      status: 'active',
      stripeSubscriptionId: 'test_sub_' + Date.now(),
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    };

    if (existing.length > 0) {
      await base44.asServiceRole.entities.UserSubscription.update(existing[0].id, subData);
      return Response.json({ success: true, message: `Subscription updated to ${tier}`, id: existing[0].id });
    } else {
      const result = await base44.asServiceRole.entities.UserSubscription.create(subData);
      return Response.json({ success: true, message: `${tier} subscription created`, id: result.id });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});