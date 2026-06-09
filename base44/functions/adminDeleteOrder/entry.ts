import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Admin-only: padam satu order (UserSubscription) dari database pelanggan.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { subscriptionId } = await req.json();
    if (!subscriptionId) {
      return Response.json({ error: 'subscriptionId is required' }, { status: 400 });
    }

    await base44.asServiceRole.entities.UserSubscription.delete(subscriptionId);

    return Response.json({ success: true });
  } catch (error) {
    console.error('adminDeleteOrder error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});