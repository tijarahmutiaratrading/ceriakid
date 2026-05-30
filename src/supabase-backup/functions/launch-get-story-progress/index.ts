// Story Kid progress
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { requireAdmin } from '../_shared/authGuards.ts';

Deno.serve(async (req) => {
  const cors = handleCors(req); if (cors) return cors;
  const guard = await requireAdmin(req);
  if (guard instanceof Response) return guard;

  try {
    let target = 30;
    const { data: settings } = await supabaseAdmin.from('ck_qc_settings').select('story_kid_cap').limit(1);
    if (settings?.[0]?.story_kid_cap) target = settings[0].story_kid_cap;

    const { count } = await supabaseAdmin
      .from('ck_games')
      .select('id', { count: 'exact', head: true })
      .eq('category', 'story')
      .eq('is_published', true);

    const totalExisting = count || 0;
    const totalNeeded = Math.max(0, target - totalExisting);
    return jsonResponse({
      success: true, category: 'story',
      count: totalExisting, target, needed: totalNeeded,
      percent: Math.round((totalExisting / target) * 100),
      status: totalNeeded === 0 ? 'complete' : 'in_progress',
    });
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});