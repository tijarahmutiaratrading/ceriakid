import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Mini game categories — count from hand-crafted blueprints (lib/miniGames/*.js)
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
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    // Read target from QCSetting (set via Target Settings modal)
    let targetPerCategory = 10;
    try {
      const settings = await base44.asServiceRole.entities.QCSetting.list();
      if (settings.length > 0 && settings[0].miniGameCap) {
        targetPerCategory = settings[0].miniGameCap;
      }
    } catch (e) { /* use default */ }

    const rows = [];
    let totalExisting = 0;
    let totalNeeded = 0;

    for (const cat of MINI_CATEGORIES) {
      const count = cat.count; // From hand-crafted blueprints
      const needed = Math.max(0, targetPerCategory - count);
      const percent = Math.min(100, Math.round((count / targetPerCategory) * 100));

      totalExisting += count;
      totalNeeded += needed;

      rows.push({
        category: cat.id,
        label: cat.label,
        count,
        target: targetPerCategory,
        needed,
        percent,
        status: needed === 0 ? 'complete' : 'in_progress',
      });
    }

    const totalTarget = MINI_CATEGORIES.length * targetPerCategory;
    const overallPercent = Math.min(100, Math.round((totalExisting / totalTarget) * 100));

    return Response.json({
      success: true,
      type: 'mini_games',
      source: 'blueprints',
      totalExisting,
      totalTarget,
      totalNeeded,
      overallPercent,
      completeBuckets: rows.filter(r => r.status === 'complete').length,
      totalBuckets: rows.length,
      rows,
    });
  } catch (error) {
    console.error('launchGetMiniGamesProgress error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});