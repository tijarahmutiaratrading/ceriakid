import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const MINI_GAME_SUBJECTS = ['memory', 'dragdrop', 'wordbuilder', 'sorting', 'tilematch', 'story', 'physics', 'tracing'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const games = await base44.asServiceRole.entities.Game.list('-created_date', 1000);
    const tasks = await base44.asServiceRole.entities.GameTask.list('-created_date', 1000);

    const miniGames = games.filter(game => MINI_GAME_SUBJECTS.includes(game.category));
    const miniTasks = tasks.filter(task => MINI_GAME_SUBJECTS.includes(task.subject));

    for (const game of miniGames) {
      await base44.asServiceRole.entities.Game.delete(game.id);
    }

    for (const task of miniTasks) {
      await base44.asServiceRole.entities.GameTask.delete(task.id);
    }

    const newTask = await base44.asServiceRole.entities.GameTask.create({
      taskName: 'Test Memory Games Variasi · emoji, beza gambar, bayang objek',
      ageGroup: 'sekolah_rendah',
      subject: 'memory',
      gamesCount: 3,
      questionsPerGame: 4,
      status: 'pending',
      createdGames: 0,
      errorMessage: JSON.stringify({
        sets: 1,
        levels: 3,
        itemsPerSet: 4,
        theme: 'KSSR asas Malaysia - variasi Memory Game: emoji, cari perbezaan gambar pertama dan kedua, bayang-bayang objek'
      })
    });

    return Response.json({
      success: true,
      deletedGames: miniGames.length,
      deletedTasks: miniTasks.length,
      queuedTaskId: newTask.id
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});