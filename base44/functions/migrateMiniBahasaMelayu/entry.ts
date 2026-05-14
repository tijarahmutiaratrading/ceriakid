import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const legacySubjects = ['mini_bahasa_melayu'];
    const legacyTasks = await base44.asServiceRole.entities.GameTask.list('-created_date', 200);
    const tasksToDelete = legacyTasks.filter(task =>
      legacySubjects.includes(task.subject) ||
      String(task.taskName || '').toLowerCase().includes('mini game: bahasa melayu')
    );

    const legacyMiniGames = await base44.asServiceRole.entities.Game.filter({ category: 'mini_bahasa_melayu' });
    const subjectMiniGames = await base44.asServiceRole.entities.Game.filter({ category: 'bahasa_melayu' });
    const gamesToDelete = [
      ...legacyMiniGames,
      ...subjectMiniGames.filter(game =>
        game.gameData?.miniGameBlueprint === true ||
        game.gameData?.miniGameGenerated === true
      ),
    ];

    for (const task of tasksToDelete) {
      await base44.asServiceRole.entities.GameTask.delete(task.id);
    }

    for (const game of gamesToDelete) {
      await base44.asServiceRole.entities.Game.delete(game.id);
    }

    return Response.json({
      success: true,
      deletedTasks: tasksToDelete.length,
      deletedGames: gamesToDelete.length,
      replacementCategory: 'creative_arts',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});