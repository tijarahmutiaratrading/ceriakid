// Dedicated order notification function — replaces inline notifyAdmins() in webhooks.
//
// Benefits over previous inline approach:
// 1. Structured payload — title, amount, customer info konsisten
// 2. requireInteraction:true — notif tak hilang sendiri (admin nampak walaupun tertidur)
// 3. Vibration pattern — buzz kuat untuk attention
// 4. Action buttons — admin boleh tap untuk terus pergi ke order
// 5. Sound hint — SW play sound bila possible
// 6. Better error logging — track push failures
//
// Payload schema:
// {
//   type: 'subscription' | 'credit' | 'recovery' | 'cancel' | 'test',
//   customer: { email, name?, phone? },
//   amount: number,            // RM
//   tier?: string,             // 'asas' | 'standard' | 'keluarga' (subscription only)
//   credits?: number,          // credit purchase only
//   packageId?: string,        // credit purchase only
//   purchaseId?: string,       // Chip purchase ID untuk reference
// }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import webpush from 'npm:web-push@3.6.7';

const ICON_URL = 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c0ad02d9e_ChatGPTImageMay12026at12_29_37PM.png';

const TIER_LABEL = { asas: 'Pakej Asas', standard: 'Pakej Standard', keluarga: 'Pakej Keluarga' };
const PACKAGE_LABEL = { starter: 'Pek Permulaan', family: 'Pek Keluarga', power: 'Pek Power' };

function formatRM(amount) {
  const num = Number(amount) || 0;
  return num % 1 === 0 ? `RM${num}` : `RM${num.toFixed(2)}`;
}

function maskEmail(email) {
  if (!email) return 'unknown';
  const [local, domain] = email.split('@');
  if (!domain) return email;
  if (local.length <= 3) return `${local[0]}***@${domain}`;
  return `${local.slice(0, 3)}***@${domain}`;
}

// Build notification content based on event type
function buildNotification(payload) {
  const { type, customer = {}, amount = 0, tier, credits, packageId, purchaseId } = payload;
  const customerDisplay = customer.name || maskEmail(customer.email);

  switch (type) {
    case 'subscription': {
      const tierName = TIER_LABEL[tier] || tier || 'Langganan';
      return {
        title: `Order Baru! 🎉`,
        body: `${customerDisplay} beli ${tierName} - ${formatRM(amount)}`,
        tag: `order-sub-${purchaseId || Date.now()}`,
        requireInteraction: true,
        url: '/admin-dashboard?tab=analytics',
      };
    }
    case 'credit': {
      const pkgName = PACKAGE_LABEL[packageId] || packageId || 'Top-Up';
      return {
        title: `Order Baru! 🎉`,
        body: `${customerDisplay} beli ${pkgName} (${credits} Kredit AI) - ${formatRM(amount)}`,
        tag: `order-credit-${purchaseId || Date.now()}`,
        requireInteraction: true,
        url: '/admin-dashboard?tab=analytics',
      };
    }
    case 'recovery': {
      const tierName = TIER_LABEL[tier] || tier || 'Langganan';
      return {
        title: `Order Baru! 🎉`,
        body: `${customerDisplay} beli ${tierName} - ${formatRM(amount)}`,
        tag: `order-recovery-${purchaseId || Date.now()}`,
        requireInteraction: true,
        url: '/admin-dashboard?tab=analytics',
      };
    }
    case 'cancel': {
      return {
        title: `⚠️ Subscription Dibatalkan`,
        body: `${customerDisplay} cancel pelan ${tier?.toUpperCase() || ''}`,
        tag: `order-cancel-${Date.now()}`,
        requireInteraction: false,
        url: '/admin-dashboard?tab=analytics',
      };
    }
    case 'test':
    default: {
      return {
        title: payload.title || '🧪 Test Notification',
        body: payload.body || 'Push notification berfungsi! Anda akan terima notif macam ini bila ada order baru.',
        tag: 'order-test',
        requireInteraction: false,
        url: '/admin-dashboard?tab=analytics',
      };
    }
  }
}

function sanitizeSubject(raw) {
  let subject = String(raw || '').trim().replace(/[<>]/g, '').replace(/\s+/g, '');
  if (!subject.startsWith('mailto:') && !subject.startsWith('http')) {
    subject = `mailto:${subject || 'admin@ceriakid.com'}`;
  }
  return subject.replace(/^mailto:\s+/, 'mailto:');
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);

    // Allow service role (webhook context) OR admin user
    let user = null;
    try { user = await base44.auth.me(); } catch (_) {}
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const publicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const privateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    if (!publicKey || !privateKey) {
      return Response.json({ error: 'VAPID keys not configured' }, { status: 500 });
    }
    const subject = sanitizeSubject(Deno.env.get('VAPID_SUBJECT'));
    webpush.setVapidDetails(subject, publicKey, privateKey);

    const payload = await req.json();
    const notif = buildNotification(payload);

    const subs = await base44.asServiceRole.entities.PushSubscription.filter({ isAdmin: true });
    if (subs.length === 0) {
      console.log('[OrderNotif] No admin subscribers');
      return Response.json({ success: true, sent: 0, message: 'No admin subscribers' });
    }

    // Rich notification payload — service worker akan render dengan vibration + actions
    const notifJson = JSON.stringify({
      title: notif.title,
      body: notif.body,
      tag: notif.tag,
      url: notif.url,
      icon: ICON_URL,
      badge: ICON_URL,
      requireInteraction: notif.requireInteraction,
      vibrate: [200, 100, 200, 100, 200], // buzz pattern untuk attention
      timestamp: Date.now(),
      actions: [
        { action: 'view', title: '👀 Lihat' },
        { action: 'dismiss', title: '✓ OK' },
      ],
    });

    let sent = 0, failed = 0;
    const deadEndpoints = [];
    const failures = [];

    await Promise.all(subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          notifJson,
          { TTL: 86400, urgency: 'high' } // urgency:high — push service prioritize delivery
        );
        sent++;
      } catch (err) {
        failed++;
        if (err.statusCode === 410 || err.statusCode === 404) {
          deadEndpoints.push(sub.id);
        } else {
          failures.push({ endpoint: sub.endpoint.substring(0, 60), status: err.statusCode, msg: err.body });
        }
      }
    }));

    // Cleanup dead subscriptions
    for (const id of deadEndpoints) {
      try { await base44.asServiceRole.entities.PushSubscription.delete(id); } catch (_) {}
    }

    if (failures.length > 0) {
      console.error('[OrderNotif] Push failures:', JSON.stringify(failures));
    }
    console.log(`[OrderNotif] type=${payload.type} sent=${sent}/${subs.length} failed=${failed} cleaned=${deadEndpoints.length}`);

    return Response.json({ success: true, sent, failed, cleaned: deadEndpoints.length });
  } catch (error) {
    console.error('sendOrderNotification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});