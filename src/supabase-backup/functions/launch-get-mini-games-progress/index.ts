// Mini-game blueprint progress (hardcoded — these come from lib/miniGames/*.js)
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { requireAdmin } from '../_shared/authGuards.ts';

const MINI_CATEGORIES = [
  { id: 'memory_master', label: 'Memory Master', count: 10 },
  { id: 'logic_puzzles', label: 'Logic Puzzles', count: 10 },
  { id: 'speed_focus', label: 'Speed Focus', count: 10 },
  { id: 'pattern_genius', label: 'Pattern Genius', count: 10 },
  { id: 'maze_adventure', label: 'Maze Adventure', count: 10 },
  { id: 'creative_builder', label: 'Creative Builder', count: 10 },
  { id: 'problem_solver', label: 'Problem Solver', count: 10 },
  { id: 'brain_training', label: 'Brain Training', count: 10 },
];

Deno.serve(async (req) => {
  const cors = handleCors(req); if (cors) return cors;
  const guard = await requireAdmin(req);
  if (guard instanceof Response) return guard;

  try {
    let targetPerCategory = 10;
    const { data: settings } = await supabaseAdmin.from('ck_qc_settings').select('mini_game_cap').limit(1);
    if (settings?.[0]?.mini_game_cap) targetPerCategory = settings[0].mini_game_cap;

    const rows: any[] = [];
    let totalExisting = 0, totalNeeded = 0;

    for (const cat of MINI_CATEGORIES) {
      const needed = Math.max(0, targetPerCategory - cat.count);
      totalExisting += cat.count;
      totalNeeded += needed;
      rows.push({
        category: cat.id, label: cat.label, count: cat.count,
        target: targetPerCategory, needed,
        percent: Math.min(100, Math.round((cat.count / targetPerCategory) * 100)),
        status: needed === 0 ? 'complete' : 'in_progress',
      });
    }

    const totalTarget = MINI_CATEGORIES.length * targetPerCategory;
    return jsonResponse({
      success: true, type: 'mini_games', source: 'blueprints',
      totalExisting, totalTarget, totalNeeded,
      overallPercent: Math.min(100, Math.round((totalExisting / totalTarget) * 100)),
      completeBuckets: rows.filter(r => r.status === 'complete').length,
      totalBuckets: rows.length, rows,
    });
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});