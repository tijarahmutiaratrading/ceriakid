import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { email, tier = 'premium' } = await req.json();

    // Check if subscription already exists
    const existing = await base44.asServiceRole.entities.UserSubscription.filter({
      email: email
    });

    if (existing.length > 0) {
      // Update existing
      await base44.asServiceRole.entities.UserSubscription.update(existing[0].id, {
        tier: tier,
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
      return Response.json({ message: `Updated ${email} to ${tier} tier`, updated: true });
    } else {
      // Create new
      await base44.asServiceRole.entities.UserSubscription.create({
        email: email,
        tier: tier,
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
      return Response.json({ message: `Created ${tier} subscription for ${email}`, created: true });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});