import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { fileName } = await req.json();

    // Dynamic import
    const module = await import(`../lib/${fileName}.js`);
    const fileContent = module[Object.keys(module)[0]];

    if (!fileContent) {
      return Response.json({ error: 'File not found' }, { status: 404 });
    }

    // Calculate analytics
    const stats = {
      totalGames: fileContent.length,
      byCategory: {},
      byDifficulty: {},
      byType: {},
      avgQuestionsPerGame: 0,
      totalQuestions: 0,
    };

    fileContent.forEach(game => {
      // Category stats
      if (!stats.byCategory[game.category]) {
        stats.byCategory[game.category] = 0;
      }
      stats.byCategory[game.category]++;

      // Difficulty stats
      if (!stats.byDifficulty[game.difficulty || 'easy']) {
        stats.byDifficulty[game.difficulty || 'easy'] = 0;
      }
      stats.byDifficulty[game.difficulty || 'easy']++;

      // Type stats
      if (!stats.byType[game.type]) {
        stats.byType[game.type] = 0;
      }
      stats.byType[game.type]++;

      // Question count
      const qCount = game.gameData?.questions?.length || 0;
      stats.totalQuestions += qCount;
    });

    stats.avgQuestionsPerGame = Math.round(stats.totalQuestions / fileContent.length);

    return Response.json({
      success: true,
      fileName,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});