import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    // Get all story kid games (category = 'story')
    const storyGames = await base44.asServiceRole.entities.Game.filter({ category: 'story' });
    
    let totalDeleted = 0;
    for (const game of storyGames) {
      await base44.asServiceRole.entities.Game.delete(game.id);
      totalDeleted++;
    }

    return Response.json({
      success: true,
      message: `Deleted ${totalDeleted} story kid games`,
      deleted: totalDeleted,
    });
  } catch (error) {
    console.error('deleteStoryKidGames error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});