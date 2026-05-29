import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * SECURITY: Return ONLY public/safe values + boolean indicators for secrets.
 * NEVER expose private keys (CHIP_SECRET_KEY, FB_ACCESS_TOKEN, CHIP_WEBHOOK_SECRET,
 * VAPID_PRIVATE_KEY) to frontend — even to admin. Admin should view/edit secrets
 * via Base44 dashboard, not via the app UI.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    return Response.json({
      // Public values (safe to expose)
      chip_brand_id: Deno.env.get('CHIP_BRAND_ID') || '',
      fb_pixel_id: Deno.env.get('FB_PIXEL_ID') || '',
      vapid_public_key: Deno.env.get('VAPID_PUBLIC_KEY') || '',

      // Boolean indicators — frontend just needs to know if secret is set
      chip_secret_key_set: !!Deno.env.get('CHIP_SECRET_KEY'),
      chip_webhook_secret_set: !!Deno.env.get('CHIP_WEBHOOK_SECRET'),
      fb_access_token_set: !!Deno.env.get('FB_ACCESS_TOKEN'),
      vapid_private_key_set: !!Deno.env.get('VAPID_PRIVATE_KEY'),
      resend_api_key_set: !!Deno.env.get('RESEND_API_KEY'),
    });
  } catch (error) {
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
});