import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Check if background story mode is enabled
    const settings = await base44.asServiceRole.entities.QCSetting.list();
    const setting = settings[0];
    const enabled = setting?.backgroundStoryEnabled === true;
    const targetCap = setting?.storyKidCap || 30;

    if (!enabled) {
      console.log('Background story is disabled. Skipping.');
      return Response.json({ success: true, skipped: true, reason: 'disabled' });
    }

    // Check current story count
    const stories = await base44.asServiceRole.entities.Game.filter({
      category: 'story',
      isPublished: true,
    });

    if (stories.length >= targetCap) {
      console.log('🎉 Story Kid target reached! Auto-disabling background mode.');
      if (setting?.id) {
        await base44.asServiceRole.entities.QCSetting.update(setting.id, { backgroundStoryEnabled: false });
      }
      return Response.json({ success: true, allComplete: true, count: stories.length });
    }

    console.log(`📖 Background generating story (${stories.length}/${targetCap})...`);

    // Call existing high-quality story generator (Claude Opus 4.7)
    const res = await base44.asServiceRole.functions.invoke('launchGenerateStoryKid', {
      targetCount: targetCap,
    });

    const generated = res?.data?.generated || 0;
    const failed = res?.data?.failed || 0;
    console.log(`✅ Generated ${generated} stories (${failed} failed)`);

    return Response.json({
      success: true,
      generated,
      failed,
      total: stories.length + generated,
      target: targetCap,
    });
  } catch (error) {
    console.error('backgroundStoryGenerator error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});