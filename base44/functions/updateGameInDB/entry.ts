import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { gameId, updates } = await req.json();

    if (!gameId) {
      return Response.json({ error: 'gameId required' }, { status: 400 });
    }

    // Allowed fields to update
    const allowedFields = ['title', 'description', 'type', 'category', 'ageGroup', 'difficulty', 'tier', 'emoji', 'totalQuestions', 'gameData', 'isPublished', 'order'];
    const filtered = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) filtered[key] = updates[key];
    }

    if (Object.keys(filtered).length === 0) {
      return Response.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    await base44.asServiceRole.entities.Game.update(gameId, filtered);
    const updated = await base44.asServiceRole.entities.Game.filter({ id: gameId });

    return Response.json({ success: true, game: updated[0] || null });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});