// Delete mini games by category
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { requireAdmin } from '../_shared/authGuards.ts';

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const guard = await requireAdmin(req);
  if (guard instanceof Response) return guard;

  try {
    const { category, all } = await req.json();
    let query = supabaseAdmin.from('ck_games').delete().eq('age_group', 'mini_games');
    if (!all && category) query = query.eq('category', category);

    const { data, error } = await query.select('id');
    if (error) throw error;

    return jsonResponse({ success: true, deleted: data?.length || 0 });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});