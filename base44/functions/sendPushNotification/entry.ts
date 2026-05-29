import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import webpush from 'npm:web-push@3.6.7';

// Send push notification to all admin subscribers.
// Dipanggil dari chipWebhook (service role) atau admin test button.
//
// Payload: { title, body, url?, tag?, icon? }
//
// Auth:
// - Admin user → boleh hantar test notification
// - Service role (no user) → dibenarkan kerana ini dipanggil dari webhook
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);

    // Bila dipanggil oleh user, mesti admin. Bila dipanggil oleh function lain (service role),
    // base44.auth.me() akan throw / return null — kita allow kerana caller dah trusted.
    let isFromUser = true;
    let user = null;
    try {
      user = await base44.auth.me();
    } catch (_) {
      isFromUser = false;
    }

    if (isFromUser && user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const publicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const privateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    let subject = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@ceriakid.com';

    if (!publicKey || !privateKey) {
      return Response.json({ error: 'VAPID keys not configured. Run generateVapidKeys and set secrets.' }, { status: 500 });
    }

    // web-push library requires subject to be a valid URL (mailto: or https://).
    // Auto-fix common mistake: plain email → prepend mailto:
    subject = subject.trim();
    if (!subject.startsWith('mailto:') && !subject.startsWith('http://') && !subject.startsWith('https://')) {
      subject = `mailto:${subject}`;
    }

    // Debug: log VAPID config (mask private key)
    console.log(`[VAPID] subject="${subject}" publicKey="${publicKey.substring(0, 20)}..." privateKeyLen=${privateKey.length}`);

    webpush.setVapidDetails(subject, publicKey, privateKey);

    const payload = await req.json();
    const { title, body, url, tag, icon } = payload || {};

    if (!title || !body) {
      return Response.json({ error: 'title and body required' }, { status: 400 });
    }

    const subs = await base44.asServiceRole.entities.PushSubscription.filter({ isAdmin: true });

    if (subs.length === 0) {
      return Response.json({ success: true, sent: 0, message: 'No admin subscribers' });
    }

    const notifPayload = JSON.stringify({ title, body, url, tag, icon });

    let sent = 0;
    let failed = 0;
    const deadEndpoints = [];

    await Promise.all(subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          notifPayload
        );
        sent++;
      } catch (err) {
        failed++;
        // 410 Gone or 404 → subscription expired, padam
        if (err.statusCode === 410 || err.statusCode === 404) {
          deadEndpoints.push(sub.id);
        }
        console.error(`Push failed for ${sub.endpoint.substring(0, 60)}... status=${err.statusCode} body=${err.body} headers=${JSON.stringify(err.headers || {})}`);
      }
    }));

    // Cleanup dead subscriptions
    for (const id of deadEndpoints) {
      try { await base44.asServiceRole.entities.PushSubscription.delete(id); } catch (_) {}
    }

    return Response.json({ success: true, sent, failed, cleaned: deadEndpoints.length });
  } catch (error) {
    console.error('sendPushNotification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});