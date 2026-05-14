import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const games = await base44.asServiceRole.entities.Game.filter({ category: 'bahasa_melayu' });
    const miniGames = games.filter(game =>
      game.gameData?.miniGameBlueprint === true ||
      game.gameData?.miniGameGenerated === true
    );

    for (const game of miniGames) {
      await base44.asServiceRole.entities.Game.update(game.id, {
        category: 'mini_bahasa_melayu',
        gameData: {
          ...game.gameData,
          categoryId: 'mini_bahasa_melayu',
          originalSubjectCategory: 'bahasa_melayu',
        },
      });
    }

    return Response.json({ success: true, migratedCount: miniGames.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});