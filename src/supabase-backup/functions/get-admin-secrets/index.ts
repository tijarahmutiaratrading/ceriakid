// Return public values + boolean indicators for secrets (admin only)
// NEVER expose private keys
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { requireAdmin } from '../_shared/authGuards.ts';

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const guard = await requireAdmin(req);
  if (guard instanceof Response) return guard;

  return jsonResponse({
    chip_brand_id: Deno.env.get('CHIP_BRAND_ID') || '',
    fb_pixel_id: Deno.env.get('FB_PIXEL_ID') || '',
    vapid_public_key: Deno.env.get('VAPID_PUBLIC_KEY') || '',

    chip_secret_key_set: !!Deno.env.get('CHIP_SECRET_KEY'),
    chip_webhook_secret_set: !!Deno.env.get('CHIP_WEBHOOK_SECRET'),
    fb_access_token_set: !!Deno.env.get('FB_ACCESS_TOKEN'),
    vapid_private_key_set: !!Deno.env.get('VAPID_PRIVATE_KEY'),
    resend_api_key_set: !!Deno.env.get('RESEND_API_KEY'),
    openai_api_key_set: !!Deno.env.get('OPENAI_API_KEY'),
  });
});