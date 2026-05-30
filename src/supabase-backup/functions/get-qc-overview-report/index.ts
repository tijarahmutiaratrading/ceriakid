// Simple QC report — count games + recent QC logs
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { requireAdmin } from '../_shared/authGuards.ts';

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const guard = await requireAdmin(req);
  if (guard instanceof Response) return guard;

  try {
    const [{ count: gameCount }, { data: recentLogs }] = await Promise.all([
      supabaseAdmin.from('ck_games').select('*', { count: 'exact', head: true }).eq('is_published', true),
      supabaseAdmin.from('ck_qc_logs').select('*').order('run_at', { ascending: false }).limit(10),
    ]);

    return jsonResponse({
      success: true,
      totalGames: gameCount || 0,
      recentLogs: recentLogs || [],
    });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});