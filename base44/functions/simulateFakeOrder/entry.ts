import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Admin-only fake order simulator — trigger push notification macam order betul
// supaya boleh test push delivery end-to-end tanpa kena bayar Chip sebenar.
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const type = body.type || 'subscription'; // 'subscription' atau 'credit'

    let title, notifBody;
    if (type === 'credit') {
      title = '💰 Credit Top-Up Baru! (TEST)';
      notifBody = `${user.email} beli 50 kredit (medium) — RM29.00`;
    } else {
      title = '🎉 Subscription Baru! (TEST)';
      notifBody = `${user.email} langgan pelan KELUARGA — RM199`;
    }

    const res = await base44.asServiceRole.functions.invoke('sendPushNotification', {
      title,
      body: notifBody,
      url: '/admin-dashboard?tab=analytics',
      tag: 'fake-order-test',
    });

    return Response.json({
      success: true,
      message: 'Fake order push triggered',
      pushResult: res?.data || res,
    });
  } catch (error) {
    console.error('simulateFakeOrder error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});