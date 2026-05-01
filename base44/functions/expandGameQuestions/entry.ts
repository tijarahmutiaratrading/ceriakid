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

    let totalQuestionsAdded = 0;
    let gamesUpdated = 0;

    games.forEach((game) => {
      const currentCount = game.gameData?.questions?.length || 0;
      
      if (targetCount > currentCount) {
        const dummyQuestions = Array.from({ length: targetCount - currentCount }, (_, i) => ({
          question: `Soalan ${currentCount + i + 1}`,
          options: ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D'],
          answer: 0,
        }));

        game.gameData.questions.push(...dummyQuestions);
        game.totalQuestions = targetCount;
        totalQuestionsAdded += targetCount - currentCount;
        gamesUpdated++;
      }
    });

    return Response.json({
      success: true,
      fileName,
      gamesUpdated,
      totalQuestions: targetCount,
      totalQuestionsAdded,
      message: `✅ ${gamesUpdated} games expand ke ${targetCount} soalan`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});