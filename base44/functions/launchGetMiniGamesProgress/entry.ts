import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Mini game categories to track
const MINI_CATEGORIES = [
  'memory_master',
  'logic_puzzles',
  'speed_focus',
  'pattern_genius',
  'maze_adventure',
  'creative_builder',
  'problem_solver',
  'brain_training',
];

const MINI_LABELS = {
  memory_master: 'Memory Master',
  logic_puzzles: 'Logic Puzzles',
  speed_focus: 'Speed Focus',
  pattern_genius: 'Pattern Genius',
  maze_adventure: 'Maze Adventure',
  creative_builder: 'Creative Builder',
  problem_solver: 'Problem Solver',
  brain_training: 'Brain Training',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const targetPerCategory = 10;
    const rows = [];
    let totalExisting = 0;
    let totalNeeded = 0;

    for (const cat of MINI_CATEGORIES) {
      const games = await base44.asServiceRole.entities.Game.filter({
        category: cat,
        isPublished: true,
      });
      const count = games.length;
      const needed = Math.max(0, targetPerCategory - count);
      const percent = Math.round((count / targetPerCategory) * 100);

      totalExisting += count;
      totalNeeded += needed;

      rows.push({
        category: cat,
        label: MINI_LABELS[cat],
        count,
        target: targetPerCategory,
        needed,
        percent,
        status: needed === 0 ? 'complete' : 'in_progress',
      });
    }

    const totalTarget = MINI_CATEGORIES.length * targetPerCategory;
    const overallPercent = Math.round((totalExisting / totalTarget) * 100);

    return Response.json({
      success: true,
      type: 'mini_games',
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