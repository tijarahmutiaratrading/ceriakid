// Purge games in a specific bucket
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { requireAdmin } from '../_shared/authGuards.ts';

Deno.serve(async (req) => {
  const cors = handleCors(req); if (cors) return cors;
  const guard = await requireAdmin(req);
  if (guard instanceof Response) return guard;

  try {
    const { ageGroup, darjah, category, dryRun = true } = await req.json();
    if (!ageGroup || !category) return jsonResponse({ error: 'ageGroup and category required' }, 400);

    let q = supabaseAdmin.from('ck_games').select('id, title').eq('age_group', ageGroup).eq('category', category);
    if (darjah) q = q.eq('darjah', darjah);
    const { data: existing } = await q;

    if (dryRun) {
      return jsonResponse({
        success: true, dryRun: true,
        wouldDelete: existing?.length || 0,
        sample: (existing || []).slice(0, 3).map((g: any) => g.title),
      });
    }

    let deleted = 0;
    for (const g of existing || []) {
      await supabaseAdmin.from('ck_games').delete().eq('id', g.id);
      deleted++;
    }
    return jsonResponse({
      success: true, deleted,
      bucket: `${ageGroup}${darjah ? '/' + darjah : ''}/${category}`,
    });
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});