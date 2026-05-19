import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

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
      chip_brand_id: Deno.env.get('CHIP_BRAND_ID') || '',
      chip_secret_key: Deno.env.get('CHIP_SECRET_KEY') || '',
      chip_webhook_secret: Deno.env.get('CHIP_WEBHOOK_SECRET') || '',
      fb_pixel_id: Deno.env.get('FB_PIXEL_ID') || '',
      fb_access_token: Deno.env.get('FB_ACCESS_TOKEN') || '',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});