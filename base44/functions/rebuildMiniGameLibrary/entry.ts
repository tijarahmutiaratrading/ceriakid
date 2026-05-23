// rebuildMiniGameLibrary — DELETE all legacy mini games from DB.
// Mini games are now served 100% from hand-crafted blueprints (lib/miniGames/*.js),
// so DB records for these categories are no longer needed.
//
// Subject games (bahasa_melayu, english, mathematics, science, etc.) are NOT touched.
// Story Kid games are NOT touched.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const MINI_GAME_CATEGORIES = [
  // New cognitive categories (blueprint-based now)
  'memory_master', 'logic_puzzles', 'speed_focus', 'pattern_genius',
  'maze_adventure', 'creative_builder', 'problem_solver', 'brain_training',
  // Legacy mini game categories (also blueprint-based now)
  'memory', 'dragdrop', 'wordbuilder', 'sorting', 'tilematch', 'physics', 'tracing',
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch all games (paged manually since list caps at ~500)
    const allGames = await base44.asServiceRole.entities.Game.list('-created_date', 2000);
    const toDelete = (allGames || []).filter(g =>
      MINI_GAME_CATEGORIES.includes(g.category) &&
      // Don't delete Story Kid even if it slipped into a mini category
      g.gameData?.storyKid !== true
    );

    // Delete in parallel batches of 25 for speed without overloading
    const BATCH = 25;
    let deleted = 0;
    let failed = 0;
    for (let i = 0; i < toDelete.length; i += BATCH) {
      const slice = toDelete.slice(i, i + BATCH);
      const results = await Promise.allSettled(slice.map(g => base44.asServiceRole.entities.Game.delete(g.id)));
      deleted += results.filter(r => r.status === 'fulfilled').length;
      failed += results.filter(r => r.status === 'rejected').length;
    }

    // Also cleanup any pending GameTask for mini categories (so generator doesn't recreate)
    const allTasks = await base44.asServiceRole.entities.GameTask.list('-created_date', 500);
    const tasksToDelete = (allTasks || []).filter(t =>
      MINI_GAME_CATEGORIES.includes(t.subject) &&
      ['pending', 'running', 'failed'].includes(t.status)
    );
    let tasksDeleted = 0;
    for (const t of tasksToDelete) {
      try {
        await base44.asServiceRole.entities.GameTask.delete(t.id);
        tasksDeleted++;
      } catch {}
    }

    return Response.json({
      success: true,
      message: `Cleaned up ${deleted} legacy mini games + ${tasksDeleted} pending tasks.`,
      deleted,
      failed,
      totalScanned: allGames.length,
      candidatesFound: toDelete.length,
      tasksDeleted,
    });
  } catch (error) {
    console.error('rebuildMiniGameLibrary error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});