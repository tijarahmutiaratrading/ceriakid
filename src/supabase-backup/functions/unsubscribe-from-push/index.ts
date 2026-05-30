// Remove push subscription by endpoint
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { requireAdmin } from '../_shared/authGuards.ts';

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  const guard = await requireAdmin(req);
  if (guard instanceof Response) return guard;

  try {
    const { endpoint } = await req.json();
    if (!endpoint) return jsonResponse({ error: 'Missing endpoint' }, 400);

    const { data, error } = await supabaseAdmin
      .from('ck_push_subscriptions')
      .delete()
      .eq('endpoint', endpoint)
      .select('id');

    if (error) throw error;
    return jsonResponse({ success: true, removed: data?.length || 0 });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});