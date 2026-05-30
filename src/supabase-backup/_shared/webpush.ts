// Shared Web Push helper
// Send notifications via VAPID + cleanup dead endpoints
import webpush from 'npm:web-push@3.6.7';
import { supabaseAdmin } from './supabaseAdmin.ts';

function sanitizeSubject(raw: string): string {
  let subject = raw.trim().replace(/[<>]/g, '').replace(/\s+/g, '');
  if (!subject.startsWith('mailto:') && !subject.startsWith('http')) {
    subject = `mailto:${subject}`;
  }
  return subject.replace(/^mailto:\s+/, 'mailto:');
}

export function setupVapid() {
  const publicKey = Deno.env.get('VAPID_PUBLIC_KEY');
  const privateKey = Deno.env.get('VAPID_PRIVATE_KEY');
  const subjectRaw = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@ceriakid.com';
  if (!publicKey || !privateKey) {
    throw new Error('VAPID keys not configured');
  }
  webpush.setVapidDetails(sanitizeSubject(subjectRaw), publicKey, privateKey);
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  icon?: string;
}

export async function sendToSubscribers(
  subscribers: any[],
  payload: PushPayload
): Promise<{ sent: number; failed: number; cleaned: number }> {
  const notif = JSON.stringify(payload);
  let sent = 0, failed = 0;
  const deadEndpoints: string[] = [];

  await Promise.all(subscribers.map(async (sub: any) => {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        notif
      );
      sent++;
    } catch (err: any) {
      failed++;
      if (err.statusCode === 410 || err.statusCode === 404) {
        deadEndpoints.push(sub.id);
      }
    }
  }));

  // Cleanup dead subscriptions
  for (const id of deadEndpoints) {
    await supabaseAdmin.from('ck_push_subscriptions').delete().eq('id', id);
  }

  return { sent, failed, cleaned: deadEndpoints.length };
}