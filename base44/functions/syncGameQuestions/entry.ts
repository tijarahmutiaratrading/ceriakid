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

    let gamesExpanded = 0;
    let gamesReduced = 0;

    games.forEach((game) => {
      const currentCount = game.gameData?.questions?.length || 0;
      
      if (targetCount > currentCount) {
        // Expand
        const dummyQuestions = Array.from({ length: targetCount - currentCount }, (_, i) => ({
          question: `Soalan ${currentCount + i + 1}`,
          options: ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D'],
          answer: 0,
        }));
        game.gameData.questions.push(...dummyQuestions);
        gamesExpanded++;
      } else if (targetCount < currentCount) {
        // Reduce
        game.gameData.questions = game.gameData.questions.slice(0, targetCount);
        gamesReduced++;
      }
      
      game.totalQuestions = targetCount;
    });

    const message = [];
    if (gamesExpanded > 0) message.push(`${gamesExpanded} games expanded`);
    if (gamesReduced > 0) message.push(`${gamesReduced} games reduced`);
    
    return Response.json({
      success: true,
      fileName,
      targetCount,
      gamesExpanded,
      gamesReduced,
      message: message.length > 0 ? message.join(', ') : 'Semua games sudah pada target',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});