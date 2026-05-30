// Get latest sync status from ck_sync_log
// NOTE: dalam Supabase, sync log = entries in ck_sync_log table dalam project sama
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { requireAdmin } from '../_shared/authGuards.ts';

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const guard = await requireAdmin(req);
  if (guard instanceof Response) return guard;

  try {
    const { data: logs, error } = await supabaseAdmin
      .from('ck_sync_log')
      .select('*')
      .order('id', { ascending: false })
      .limit(10);

    if (error) {
      return jsonResponse({ error: `Supabase fetch failed: ${error.message}` }, 500);
    }

    return jsonResponse({
      success: true,
      latest: logs?.[0] || null,
      history: logs || [],
      configured: true,
    });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});