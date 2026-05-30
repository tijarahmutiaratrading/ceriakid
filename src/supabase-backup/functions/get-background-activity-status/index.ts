// Background activity status — QC settings + recent logs
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { requireAdmin } from '../_shared/authGuards.ts';

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const guard = await requireAdmin(req);
  if (guard instanceof Response) return guard;

  try {
    const [settingsRes, logsRes] = await Promise.all([
      supabaseAdmin.from('ck_qc_settings').select('*').limit(1),
      supabaseAdmin.from('ck_qc_logs').select('*').order('run_at', { ascending: false }).limit(5),
    ]);

    return jsonResponse({
      success: true,
      settings: settingsRes.data?.[0] || null,
      recentLogs: logsRes.data || [],
    });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});