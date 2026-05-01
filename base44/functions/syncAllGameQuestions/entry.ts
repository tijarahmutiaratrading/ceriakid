import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { targetCount } = await req.json();

    const gameFiles = [
      'gameData_prasekolah_bm', 'gameData_prasekolah_en', 'gameData_prasekolah_math', 'gameData_prasekolah_science',
      'gameData_sr_bm', 'gameData_sr_english', 'gameData_sr_math', 'gameData_sr_science',
    ];

    let totalGamesExpanded = 0;
    let totalGamesReduced = 0;
    let filesProcessed = 0;

    for (const fileName of gameFiles) {
      try {
        const module = await import(`../lib/${fileName}.js`);
        const games = module[Object.keys(module)[0]];

        if (!games || games.length === 0) continue;

        games.forEach((game) => {
          const currentCount = game.gameData?.questions?.length || 0;
          
          if (targetCount > currentCount) {
            const dummyQuestions = Array.from({ length: targetCount - currentCount }, (_, i) => ({
              question: `Soalan ${currentCount + i + 1}`,
              options: ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D'],
              answer: 0,
            }));
            game.gameData.questions.push(...dummyQuestions);
            totalGamesExpanded++;
          } else if (targetCount < currentCount) {
            game.gameData.questions = game.gameData.questions.slice(0, targetCount);
            totalGamesReduced++;
          }
          
          game.totalQuestions = targetCount;
        });

        filesProcessed++;
      } catch (err) {
        // File doesn't exist, skip
      }
    }

    const message = [];
    if (totalGamesExpanded > 0) message.push(`${totalGamesExpanded} games expanded`);
    if (totalGamesReduced > 0) message.push(`${totalGamesReduced} games reduced`);

    return Response.json({
      success: true,
      targetCount,
      filesProcessed,
      totalGamesExpanded,
      totalGamesReduced,
      message: message.length > 0 ? message.join(', ') : 'Semua games sudah pada target',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});