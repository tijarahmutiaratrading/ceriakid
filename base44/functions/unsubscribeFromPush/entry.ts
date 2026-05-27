import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Remove a push subscription by endpoint.
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const { endpoint } = await req.json();
    if (!endpoint) {
      return Response.json({ error: 'Missing endpoint' }, { status: 400 });
    }

    const existing = await base44.asServiceRole.entities.PushSubscription.filter({ endpoint });
    for (const sub of existing) {
      await base44.asServiceRole.entities.PushSubscription.delete(sub.id);
    }

    return Response.json({ success: true, removed: existing.length });
  } catch (error) {
    console.error('unsubscribeFromPush error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});