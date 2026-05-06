import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const MINI_CATEGORIES = ['memory', 'dragdrop', 'wordbuilder', 'sorting', 'tilematch', 'story', 'physics', 'tracing'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const games = await base44.asServiceRole.entities.Game.filter({ ageGroup: 'sekolah_rendah' });
    const oldGames = games.filter((game) => !game.darjah && !MINI_CATEGORIES.includes(game.category));

    let deleted = 0;
    for (const game of oldGames) {
      await base44.asServiceRole.entities.Game.delete(game.id);
      deleted++;
    }

    return Response.json({
      success: true,
      deleted,
      message: `${deleted} game Sekolah Rendah lama tanpa Darjah telah dipadam.`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});