import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { fileName, gameIndex, targetCount } = await req.json();

    const module = await import(`../lib/${fileName}.js`);
    const games = module[Object.keys(module)[0]];

    if (!games || !games[gameIndex]) {
      return Response.json({ error: 'Game tidak ditemukan' }, { status: 400 });
    }

    const game = games[gameIndex];
    const currentCount = game.gameData?.questions?.length || 0;

    if (targetCount >= currentCount) {
      return Response.json({ error: 'Target harus lebih kecil dari jumlah soalan sekarang' }, { status: 400 });
    }

    game.gameData.questions = game.gameData.questions.slice(0, targetCount);
    game.totalQuestions = targetCount;

    return Response.json({
      success: true,
      gameTitle: game.title,
      previousCount: currentCount,
      totalQuestions: targetCount,
      message: `✅ Game "${game.title}" dikurang dari ${currentCount} ke ${targetCount} soalan`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});