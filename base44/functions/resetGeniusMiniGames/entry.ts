import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GENIUS_CATEGORIES = [
  { id: 'memory_master', title: 'Memory Master', emoji: '🧠', objective: 'Latih ingatan visual dan fokus.' },
  { id: 'logic_puzzles', title: 'Logic Puzzles', emoji: '🧩', objective: 'Asah logik dan padanan.' },
  { id: 'speed_focus', title: 'Speed Focus', emoji: '⚡', objective: 'Latih refleks dan fokus pantas.' },
  { id: 'pattern_genius', title: 'Pattern Genius', emoji: '🔷', objective: 'Kenal pola dan urutan.' },
  { id: 'maze_adventure', title: 'Maze Adventure', emoji: '🌀', objective: 'Cari laluan dan buat pilihan.' },
  { id: 'creative_builder', title: 'Creative Builder', emoji: '🎨', objective: 'Bina dan susun idea kreatif.' },
  { id: 'problem_solver', title: 'Problem Solver', emoji: '💡', objective: 'Selesaikan cabaran sebab-akibat.' },
  { id: 'brain_training', title: 'Brain Training', emoji: '🏆', objective: 'Latihan campuran genius.' },
];

const OLD_MINI_CATEGORIES = [
  'abc_phonics', 'math_counting', 'mini_bahasa_melayu', 'creative_arts',
  'english_vocabulary', 'sains_awal', 'jawi_iqra', 'memory_logic', 'islamic_learning',
  ...GENIUS_CATEGORIES.map(category => category.id),
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const payload = await req.json().catch(() => ({}));
    const gamesCount = Math.max(1, Number(payload.gamesCount || 15));
    const roundsPerGame = Math.max(1, Number(payload.roundsPerGame || 4));
    const levels = Math.min(3, roundsPerGame);

    let deletedGames = 0;
    let deletedTasks = 0;
    let queuedTasks = 0;

    const tasks = await base44.asServiceRole.entities.GameTask.list('-created_date', 300);
    const miniTasks = tasks.filter(task =>
      OLD_MINI_CATEGORIES.includes(task.subject) ||
      String(task.taskName || '').toLowerCase().includes('mini game:') ||
      String(task.taskName || '').toLowerCase().includes('genius game:')
    );

    for (const task of miniTasks) {
      await base44.asServiceRole.entities.GameTask.delete(task.id);
      deletedTasks++;
    }

    for (const category of OLD_MINI_CATEGORIES) {
      const games = await base44.asServiceRole.entities.Game.filter({ category });
      for (const game of games) {
        await base44.asServiceRole.entities.Game.delete(game.id);
        deletedGames++;
      }
    }

    const bahasaGames = await base44.asServiceRole.entities.Game.filter({ category: 'bahasa_melayu' });
    for (const game of bahasaGames) {
      if (game.gameData?.miniGameBlueprint === true || game.gameData?.miniGameGenerated === true) {
        await base44.asServiceRole.entities.Game.delete(game.id);
        deletedGames++;
      }
    }

    for (const category of GENIUS_CATEGORIES) {
      await base44.asServiceRole.entities.GameTask.create({
        taskName: `Genius Game: ${category.title} · ${gamesCount} games x ${roundsPerGame} round`,
        ageGroup: 'prasekolah',
        subject: category.id,
        gamesCount,
        questionsPerGame: roundsPerGame,
        status: 'pending',
        errorMessage: JSON.stringify({
          sets: gamesCount,
          levels,
          itemsPerSet: roundsPerGame,
          roundVariation: true,
          theme: `${category.title}: ${category.objective}`,
          categoryTitle: category.title,
          emoji: category.emoji,
        }),
      });
      queuedTasks++;
    }

    return Response.json({ success: true, deletedGames, deletedTasks, queuedTasks, gamesCount, roundsPerGame, levels });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});