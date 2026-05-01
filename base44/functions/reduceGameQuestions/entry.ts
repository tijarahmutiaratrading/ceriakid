import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { fileName, targetCount } = await req.json();

    const module = await import(`../lib/${fileName}.js`);
    const games = module[Object.keys(module)[0]];

    if (!games || games.length === 0) {
      return Response.json({ error: 'File kosong' }, { status: 400 });
    }

    let gamesUpdated = 0;

    games.forEach((game) => {
      const currentCount = game.gameData?.questions?.length || 0;
      
      if (targetCount < currentCount) {
        game.gameData.questions = game.gameData.questions.slice(0, targetCount);
        game.totalQuestions = targetCount;
        gamesUpdated++;
      }
    });

    return Response.json({
      success: true,
      fileName,
      gamesUpdated,
      targetCount,
      message: `✅ ${gamesUpdated} games dikurang ke ${targetCount} soalan`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});