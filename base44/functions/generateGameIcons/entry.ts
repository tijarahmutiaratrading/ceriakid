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
      return Response.json({ message: 'Tiada game yang perlu di-generate', total: 0, started: false });
    }

    // Return immediately — background processing continues after response
    const response = Response.json({
      message: `⏳ Background generate dimulakan untuk ${games.length} games. Tutup browser pun okay!`,
      total: games.length,
      started: true,
    });

    // Fire-and-forget background loop
    (async () => {
      for (const game of games) {
        try {
          const prompt = `A cute, vibrant, child-friendly 3D cartoon icon for a Malaysian kids educational game called "${game.title}". Pixar/Disney style, bright vivid solid color background (auto-chosen to match the theme), large centered main character or object, glossy plastic toy look, soft shadows, no text, no letters, square format. Clearly represents the game topic. Suitable for a colorful kids app game card.`;

          const result = await base44.asServiceRole.integrations.Core.GenerateImage({ prompt });

          if (result?.url) {
            await base44.asServiceRole.entities.Game.update(game.id, { iconUrl: result.url });
          }

          await new Promise(r => setTimeout(r, 500));
        } catch (_) {
          // silently continue to next game
        }
      }
    })();

    return response;
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});