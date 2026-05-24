import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const miniGameCategories = [
      'memory_master', 'logic_puzzles', 'speed_focus', 'pattern_genius',
      'maze_adventure', 'creative_builder', 'problem_solver', 'brain_training'
    ];

    let totalDeleted = 0;
    for (const category of miniGameCategories) {
      // Delete published and unpublished games
      const games = await base44.asServiceRole.entities.Game.filter({ category });
      console.log(`Deleting ${games.length} games from ${category}`);
      for (const game of games) {
        try {
          await base44.asServiceRole.entities.Game.delete(game.id);
          totalDeleted++;
        } catch (err) {
          console.error(`Failed to delete game ${game.id}:`, err);
        }
      }
    }

    console.log(`Total deleted: ${totalDeleted}`);
    return Response.json({
      success: true,
      message: `Deleted ${totalDeleted} mini games`,
      deleted: totalDeleted,
    });
  } catch (error) {
    console.error('deleteMiniGames error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});