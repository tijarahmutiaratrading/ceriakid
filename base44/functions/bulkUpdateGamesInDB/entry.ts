import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // gameIds: array of game IDs
    // updates: object with fields to update on all selected games
    // generateQuestions: boolean - if true, use AI to fill questions to targetCount
    const { gameIds, updates, generateQuestions, targetCount, ageGroup, category } = await req.json();

    if (!gameIds || !Array.isArray(gameIds) || gameIds.length === 0) {
      return Response.json({ error: 'gameIds array required' }, { status: 400 });
    }

    const allowedFields = ['title', 'type', 'difficulty', 'tier', 'isPublished'];
    const filtered = {};
    for (const key of allowedFields) {
      if (updates?.[key] !== undefined) filtered[key] = updates[key];
    }

    let updated = 0;
    let errors = 0;

    for (const gameId of gameIds) {
      try {
        if (Object.keys(filtered).length > 0) {
          await base44.asServiceRole.entities.Game.update(gameId, filtered);
        }

        // If targetCount provided, update totalQuestions
        if (targetCount && targetCount > 0) {
          const games = await base44.asServiceRole.entities.Game.filter({ id: gameId });
          const game = games[0];
          if (game) {
            const existingQs = game.gameData?.questions || [];
            let newQs = existingQs;

            if (targetCount < existingQs.length) {
              newQs = existingQs.slice(0, targetCount);
            }

            await base44.asServiceRole.entities.Game.update(gameId, {
              totalQuestions: newQs.length,
              gameData: { ...game.gameData, questions: newQs },
            });
          }
        }

        updated++;
      } catch (err) {
        console.error(`Error updating game ${gameId}: ${err.message}`);
        errors++;
      }
    }

    return Response.json({
      success: true,
      updated,
      errors,
      total: gameIds.length,
      message: `${updated} games updated successfully`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});