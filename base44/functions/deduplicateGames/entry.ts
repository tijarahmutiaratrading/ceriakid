import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Removes duplicate games where title pattern is "TaskName - Game N" (old generic titles)
// or where the same title exists multiple times for same ageGroup+category

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { dryRun = true } = await req.json().catch(() => ({ dryRun: true }));

    // Get all games
    const allGames = await base44.asServiceRole.entities.Game.list('-created_date', 2000);

    const toDelete = [];
    const seen = new Map(); // key: "ageGroup|category|normalizedTitle" -> first game id

    // Sort oldest first so we keep the newest version
    const sorted = [...allGames].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

    for (const game of sorted) {
      // Flag 1: Old generic title pattern "... - Game N" or "... Game N"
      const isOldGeneric = /[\-\s]Game\s+\d+$/i.test(game.title);

      // Flag 2: Exact duplicate title within same ageGroup + category
      const key = `${game.ageGroup}|${game.category}|${game.title?.trim().toLowerCase()}`;
      const isDuplicate = seen.has(key);

      if (isOldGeneric || isDuplicate) {
        toDelete.push({ id: game.id, title: game.title, ageGroup: game.ageGroup, category: game.category, reason: isOldGeneric ? 'generic_title' : 'duplicate' });
      } else {
        seen.set(key, game.id);
      }
    }

    if (!dryRun) {
      let deleted = 0;
      for (const g of toDelete) {
        await base44.asServiceRole.entities.Game.delete(g.id);
        deleted++;
        console.log(`Deleted: [${g.ageGroup}/${g.category}] "${g.title}" (${g.reason})`);
      }
      return Response.json({ success: true, deleted, totalChecked: allGames.length });
    }

    return Response.json({
      success: true,
      dryRun: true,
      toDeleteCount: toDelete.length,
      totalGames: allGames.length,
      samples: toDelete.slice(0, 20),
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});