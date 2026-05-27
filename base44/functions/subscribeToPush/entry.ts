import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Admin subscribes their browser to push notifications.
// Frontend hantar PushSubscription object (endpoint, keys.p256dh, keys.auth)
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

    const body = await req.json();
    const { endpoint, keys, deviceLabel } = body || {};

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return Response.json({ error: 'Invalid subscription payload' }, { status: 400 });
    }

    // Idempotency — kalau endpoint sama dah wujud, update sahaja
    const existing = await base44.asServiceRole.entities.PushSubscription.filter({ endpoint });

    const subData = {
      userEmail: user.email,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      deviceLabel: deviceLabel || 'Unknown device',
      isAdmin: true,
    };

    if (existing.length > 0) {
      await base44.asServiceRole.entities.PushSubscription.update(existing[0].id, subData);
    } else {
      await base44.asServiceRole.entities.PushSubscription.create(subData);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('subscribeToPush error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});