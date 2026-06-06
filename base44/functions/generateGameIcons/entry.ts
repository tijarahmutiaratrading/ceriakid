import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { gameIds, overwrite = false } = body;

    // Fetch games to process
    let games;
    if (gameIds && gameIds.length > 0) {
      games = await base44.asServiceRole.entities.Game.filter({ id: { $in: gameIds } });
    } else {
      const allGames = await base44.asServiceRole.entities.Game.list('created_date', 500);
      games = overwrite ? allGames : allGames.filter(g => !g.iconUrl);
    }

    if (games.length === 0) {
      return Response.json({ message: 'Tiada game yang perlu di-generate', count: 0 });
    }

    let success = 0;
    let failed = 0;
    const errors = [];

    for (const game of games) {
      try {
        const prompt = `A cute, vibrant, child-friendly 3D icon for a Malaysian kids educational game called "${game.title}". 
        Pixar/cartoon style, bright colors, simple design, white or transparent background, square format, 
        no text, no letters. The icon should visually represent the topic of the game title.
        High quality, glossy, playful illustration suitable for a colorful game card.`;

        const result = await base44.asServiceRole.integrations.Core.GenerateImage({ prompt });

        if (result?.url) {
          await base44.asServiceRole.entities.Game.update(game.id, { iconUrl: result.url });
          success++;
        } else {
          failed++;
          errors.push(`${game.title}: no URL returned`);
        }

        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 500));
      } catch (err) {
        failed++;
        errors.push(`${game.title}: ${err.message}`);
      }
    }

    return Response.json({
      message: `✅ Selesai! ${success} icon generated, ${failed} gagal.`,
      success,
      failed,
      errors: errors.slice(0, 10),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});