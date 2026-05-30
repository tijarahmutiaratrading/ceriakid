// Send push to all admin subscribers (admin test OR webhook server-to-server)
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin, getUserFromRequest } from '../_shared/supabaseAdmin.ts';
import { setupVapid, sendToSubscribers } from '../_shared/webpush.ts';

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  try {
    // Allow service role (server-to-server) OR admin user
    const user = await getUserFromRequest(req);
    if (user && user.role !== 'admin') {
      return jsonResponse({ error: 'Forbidden: Admin only' }, 403);
    }

    setupVapid();

    const { title, body, url, tag, icon } = await req.json();
    if (!title || !body) return jsonResponse({ error: 'title and body required' }, 400);

    const { data: subs } = await supabaseAdmin
      .from('ck_push_subscriptions')
      .select('*')
      .eq('is_admin', true);

    if (!subs || subs.length === 0) {
      return jsonResponse({ success: true, sent: 0, message: 'No admin subscribers' });
    }

    const result = await sendToSubscribers(subs, { title, body, url, tag, icon });
    return jsonResponse({ success: true, ...result });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});