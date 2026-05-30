// Admin subscribes browser to push notifications
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { requireAdmin } from '../_shared/authGuards.ts';

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  const guard = await requireAdmin(req);
  if (guard instanceof Response) return guard;
  const { user } = guard;

  try {
    const { endpoint, keys, deviceLabel } = await req.json();
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return jsonResponse({ error: 'Invalid subscription payload' }, 400);
    }

    const subData = {
      user_email: user.email,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      device_label: deviceLabel || 'Unknown device',
      is_admin: true,
    };

    // Idempotency
    const { data: existing } = await supabaseAdmin
      .from('ck_push_subscriptions')
      .select('id')
      .eq('endpoint', endpoint);

    if (existing && existing.length > 0) {
      await supabaseAdmin.from('ck_push_subscriptions').update(subData).eq('id', existing[0].id);
    } else {
      await supabaseAdmin.from('ck_push_subscriptions').insert(subData);
    }

    return jsonResponse({ success: true });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});