import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import webpush from 'npm:web-push@3.6.7';

// Admin-only: Generate VAPID public/private keys.
// Output paste ke secrets sebagai VAPID_PUBLIC_KEY dan VAPID_PRIVATE_KEY
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const keys = webpush.generateVAPIDKeys();

    return Response.json({
      success: true,
      publicKey: keys.publicKey,
      privateKey: keys.privateKey,
      instructions: [
        '1. Copy publicKey, paste ke secret VAPID_PUBLIC_KEY',
        '2. Copy privateKey, paste ke secret VAPID_PRIVATE_KEY',
        '3. Set juga VAPID_SUBJECT (mailto:youremail@domain.com)',
        '4. Save dan refresh page',
      ],
    });
  } catch (error) {
    console.error('generateVapidKeys error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});