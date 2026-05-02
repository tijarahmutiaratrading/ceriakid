import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all published games
    const allGames = await base44.asServiceRole.entities.Game.filter({ isPublished: true });

    console.log(`Deleting ${allGames.length} games...`);

    let deletedCount = 0;
    const BATCH_SIZE = 5;

    // Delete in batches to avoid overload
    for (let i = 0; i < allGames.length; i += BATCH_SIZE) {
      const batch = allGames.slice(i, i + BATCH_SIZE);
      for (const game of batch) {
        await base44.asServiceRole.entities.Game.delete(game.id);
        deletedCount++;
      }
      console.log(`Deleted ${deletedCount}/${allGames.length}`);
      await new Promise(r => setTimeout(r, 500));
    }

    return Response.json({
      success: true,
      deletedCount,
      message: `✅ Deleted ${deletedCount} games from database`,
    });
  } catch (error) {
    console.error('Delete error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});