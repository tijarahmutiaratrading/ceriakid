import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const MINI_SUBJECTS = ['memory', 'dragdrop', 'wordbuilder', 'sorting', 'tilematch', 'story', 'physics', 'tracing'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const games = await base44.asServiceRole.entities.Game.list();
    const miniGames = games.filter(game => MINI_SUBJECTS.includes(game.category));
    for (const game of miniGames) {
      await base44.asServiceRole.entities.Game.delete(game.id);
    }

    const bbmResources = await base44.asServiceRole.entities.BBMResource.list();
    for (const resource of bbmResources) {
      await base44.asServiceRole.entities.BBMResource.delete(resource.id);
    }

    const tasks = await base44.asServiceRole.entities.GameTask.list();
    const relatedTasks = tasks.filter(task => MINI_SUBJECTS.includes(task.subject) || String(task.subject || '').startsWith('bbm_'));
    for (const task of relatedTasks) {
      await base44.asServiceRole.entities.GameTask.delete(task.id);
    }

    const miniTask = await base44.asServiceRole.entities.GameTask.create({
      taskName: 'Sample Audit Mini Game: Memory · Wang Ringgit Pasar',
      ageGroup: 'sekolah_rendah',
      subject: 'memory',
      gamesCount: 1,
      questionsPerGame: 4,
      status: 'pending',
      errorMessage: JSON.stringify({ sets: 1, levels: 1, itemsPerSet: 4, theme: 'Darjah 2 Matematik wang RM1-RM10 di pasar Malaysia' }),
    });

    const bbmTask = await base44.asServiceRole.entities.GameTask.create({
      taskName: 'Sample Audit BBM: Matematik Darjah 2 - Wang Ringgit',
      ageGroup: 'darjah_2',
      subject: 'bbm_mathematics_lembaran_kerja',
      gamesCount: 1,
      questionsPerGame: 8,
      status: 'pending',
      errorMessage: JSON.stringify({ subject: 'mathematics', level: 'darjah_2', type: 'lembaran_kerja', topic: 'Wang Ringgit RM1 hingga RM10 di pasar' }),
    });

    return Response.json({
      success: true,
      deleted: {
        miniGames: miniGames.length,
        bbmResources: bbmResources.length,
        relatedTasks: relatedTasks.length,
      },
      queued: {
        miniTaskId: miniTask.id,
        bbmTaskId: bbmTask.id,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});