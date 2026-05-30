// Delete story kid games
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { requireAdmin } from '../_shared/authGuards.ts';

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const guard = await requireAdmin(req);
  if (guard instanceof Response) return guard;

  try {
    const { data, error } = await supabaseAdmin
      .from('ck_games')
      .delete()
      .eq('type', 'story_adventure')
      .select('id');

    if (error) throw error;
    return jsonResponse({ success: true, deleted: data?.length || 0 });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});