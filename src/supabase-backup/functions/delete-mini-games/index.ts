// Delete mini games — all 8 brain training categories
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { requireAdmin } from '../_shared/authGuards.ts';

const MINI_CATEGORIES = [
  'memory_master', 'logic_puzzles', 'speed_focus', 'pattern_genius',
  'maze_adventure', 'creative_builder', 'problem_solver', 'brain_training',
];

Deno.serve(async (req) => {
  const cors = handleCors(req); if (cors) return cors;
  const guard = await requireAdmin(req);
  if (guard instanceof Response) return guard;

  try {
    let totalDeleted = 0;
    for (const category of MINI_CATEGORIES) {
      const { data, error } = await supabaseAdmin.from('ck_games').delete().eq('category', category).select('id');
      if (!error && data) totalDeleted += data.length;
    }

    // Also delete games with miniGameBlueprint/miniGameGenerated flags
    const { data: allGames } = await supabaseAdmin.from('ck_games').select('id, game_data').limit(10000);
    for (const g of allGames || []) {
      if (g.game_data?.miniGameBlueprint === true || g.game_data?.miniGameGenerated === true) {
        await supabaseAdmin.from('ck_games').delete().eq('id', g.id);
        totalDeleted++;
      }
    }

    return jsonResponse({ success: true, deleted: totalDeleted });
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});