import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Only allow admin to use this
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { email } = await req.json();

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if subscription exists
    const existing = await base44.entities.UserSubscription.filter({ email });

    if (existing.length > 0) {
      // Update existing
      await base44.asServiceRole.entities.UserSubscription.update(existing[0].id, {
        tier: 'pro',
        status: 'active',
        stripeSubscriptionId: 'test_sub_' + Date.now(),
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      });
      return Response.json({ success: true, message: 'Subscription updated to pro', id: existing[0].id });
    } else {
      // Create new
      const result = await base44.asServiceRole.entities.UserSubscription.create({
        email,
        tier: 'pro',
        status: 'active',
        stripeSubscriptionId: 'test_sub_' + Date.now(),
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      });
      return Response.json({ success: true, message: 'Pro subscription created', id: result.id });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});