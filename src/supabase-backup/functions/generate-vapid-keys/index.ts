// Generate VAPID public/private keys (admin only, one-time setup)
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { requireAdmin } from '../_shared/authGuards.ts';
import webpush from 'npm:web-push@3.6.7';

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const guard = await requireAdmin(req);
  if (guard instanceof Response) return guard;

  try {
    const keys = webpush.generateVAPIDKeys();
    return jsonResponse({
      success: true,
      publicKey: keys.publicKey,
      privateKey: keys.privateKey,
      instructions: [
        '1. Copy publicKey → set VAPID_PUBLIC_KEY secret',
        '2. Copy privateKey → set VAPID_PRIVATE_KEY secret',
        '3. Set VAPID_SUBJECT (mailto:youremail@domain.com)',
        '4. supabase secrets set --env-file .env',
      ],
    });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});