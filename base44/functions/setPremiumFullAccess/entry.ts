import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { email } = await req.json();

    // Update user subscription with full access
    const existing = await base44.asServiceRole.entities.UserSubscription.filter({
      email: email
    });

    if (existing.length === 0) {
      return Response.json({ error: 'User subscription not found' }, { status: 404 });
    }

    await base44.asServiceRole.entities.UserSubscription.update(existing[0].id, {
      tier: 'keluarga',
      status: 'active',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    });

    return Response.json({ 
      message: `${email} has full keluarga access: all subjects, all levels, 4 children, 1 year`, 
      updated: true 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});