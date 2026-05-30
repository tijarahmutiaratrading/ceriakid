// Get game counts grouped by age_group + category
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { requireAdmin } from '../_shared/authGuards.ts';

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const guard = await requireAdmin(req);
  if (guard instanceof Response) return guard;

  try {
    const { data: games } = await supabaseAdmin
      .from('ck_games')
      .select('age_group, category, darjah, status')
      .limit(10000);

    const counts: Record<string, number> = {};
    const statusCounts: Record<string, number> = {};

    for (const g of games || []) {
      const key = `${g.age_group}/${g.darjah || 'none'}/${g.category}`;
      counts[key] = (counts[key] || 0) + 1;
      statusCounts[g.status || 'unknown'] = (statusCounts[g.status || 'unknown'] || 0) + 1;
    }

    return jsonResponse({
      success: true,
      total: games?.length || 0,
      buckets: counts,
      statusCounts,
    });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});