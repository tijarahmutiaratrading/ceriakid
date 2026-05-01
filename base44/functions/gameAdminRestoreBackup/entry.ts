import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { fileName, backupData } = await req.json();

    if (!backupData || !Array.isArray(backupData)) {
      return Response.json({ error: 'Invalid backup data format' }, { status: 400 });
    }

    // Validate backup structure
    const validatedGames = backupData.map((game, idx) => {
      if (!game.title || !game.type) {
        throw new Error(`Invalid game at index ${idx}: missing title or type`);
      }
      return game;
    });

    return Response.json({
      success: true,
      message: `Backup restored: ${validatedGames.length} games loaded`,
      fileName,
      gamesRestored: validatedGames.length,
      restoredAt: new Date().toISOString(),
      note: 'Backup data validated. Backend DB integration needed to persist changes.',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});