import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get ALL games in batches (list returns max 50 by default)
    let allGames = [];
    let skip = 0;
    const PAGE_SIZE = 50;
    while (true) {
      const page = await base44.asServiceRole.entities.Game.list(undefined, PAGE_SIZE, skip);
      if (!page || page.length === 0) break;
      allGames = allGames.concat(page);
      skip += page.length;
      if (page.length < PAGE_SIZE) break;
    }

    console.log(`Deleting ${allGames.length} games...`);

    let deletedCount = 0;
    const BATCH_SIZE = 5;

    // Delete in batches to avoid overload, skip already-deleted
    for (let i = 0; i < allGames.length; i += BATCH_SIZE) {
      const batch = allGames.slice(i, i + BATCH_SIZE);
      for (const game of batch) {
        try {
          await base44.asServiceRole.entities.Game.delete(game.id);
          deletedCount++;
        } catch (e) {
          // Skip if already deleted
          console.log(`Skip ${game.id}: ${e.message}`);
        }
      }
      console.log(`Deleted ${deletedCount}/${allGames.length}`);
      await new Promise(r => setTimeout(r, 300));
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