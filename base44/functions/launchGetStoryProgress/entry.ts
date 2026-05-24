import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const stories = await base44.asServiceRole.entities.Game.filter({
      category: 'story',
      isPublished: true,
    });

    const targetCount = 30;
    const totalExisting = stories.length;
    const totalNeeded = Math.max(0, targetCount - totalExisting);
    const percent = Math.round((totalExisting / targetCount) * 100);

    return Response.json({
      success: true,
      category: 'story',
      count: totalExisting,
      target: targetCount,
      needed: totalNeeded,
      percent,
      status: totalNeeded === 0 ? 'complete' : 'in_progress',
    });
  } catch (error) {
    console.error('launchGetStoryProgress error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});