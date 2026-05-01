import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Subject game files
    const subjectFiles = [
      'gameData_prasekolah_bm', 'gameData_prasekolah_en', 'gameData_prasekolah_math', 'gameData_prasekolah_science',
      'gameData_sr_bm', 'gameData_sr_english', 'gameData_sr_math', 'gameData_sr_science',
    ];

    const subjectAnalytics = [];
    let totalSubjectGames = 0;
    let totalSubjectGamesWithFull20 = 0;

    for (const fileName of subjectFiles) {
      try {
        const module = await import(`../lib/${fileName}.js`);
        const games = module[Object.keys(module)[0]];

        if (!games || games.length === 0) continue;

        const gameStats = games.map((game) => ({
          title: game.title,
          questionCount: game.gameData?.questions?.length || 0,
          isFull: (game.gameData?.questions?.length || 0) >= 20,
          totalQuestions: game.totalQuestions || 0,
        }));

        const gamesWithFull = gameStats.filter(g => g.isFull).length;
        totalSubjectGames += games.length;
        totalSubjectGamesWithFull20 += gamesWithFull;

        subjectAnalytics.push({
          file: fileName,
          totalGames: games.length,
          gamesWithFull20: gamesWithFull,
          gamesWithout20: games.length - gamesWithFull,
          percentage: Math.round((gamesWithFull / games.length) * 100),
          games: gameStats,
        });
      } catch (err) {
        // File doesn't exist
      }
    }

    // Game Hub analytics
    const gameHubGames = [
      { id: 'memory', title: 'Memory Game' },
      { id: 'dragdrop', title: 'Drag Drop Game' },
      { id: 'wordbuilder', title: 'Word Builder Game' },
      { id: 'sorting', title: 'Sorting Game' },
      { id: 'tilematch', title: 'Tile Match Game' },
      { id: 'story', title: 'Story Adventure Game' },
      { id: 'physics', title: 'Physics Game' },
      { id: 'tracing', title: 'Tracing Game' },
    ];

    return Response.json({
      success: true,
      subjects: {
        total: subjectAnalytics,
        summary: {
          totalFiles: subjectAnalytics.length,
          totalGames: totalSubjectGames,
          gamesWithFull20: totalSubjectGamesWithFull20,
          percentage: Math.round((totalSubjectGamesWithFull20 / totalSubjectGames) * 100),
        },
      },
      gameHub: {
        totalGames: gameHubGames.length,
        games: gameHubGames.map((game) => ({
          ...game,
          isFull: gameHubGames.length >= 8,
        })),
        percentage: gameHubGames.length >= 8 ? 100 : Math.round((gameHubGames.length / 8) * 100),
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});