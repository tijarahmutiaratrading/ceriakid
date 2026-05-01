import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { targetCount } = await req.json();

    // Subject game files only
    const gameFiles = [
      'gameData_prasekolah_bm', 'gameData_prasekolah_en', 'gameData_prasekolah_math', 'gameData_prasekolah_science',
      'gameData_sr_bm', 'gameData_sr_english', 'gameData_sr_math', 'gameData_sr_science',
    ];

    let totalGamesAdded = 0;
    let totalGamesRemoved = 0;
    let filesProcessed = 0;

    for (const fileName of gameFiles) {
      try {
        const module = await import(`../lib/${fileName}.js`);
        const games = module[Object.keys(module)[0]];

        if (!games || games.length === 0) continue;

        const currentCount = games.length;

        if (targetCount > currentCount) {
          const lastGame = games[games.length - 1];
          const difference = targetCount - currentCount;
          
          for (let i = 0; i < difference; i++) {
            const clonedGame = JSON.parse(JSON.stringify(lastGame));
            clonedGame.title = `${lastGame.title} - Copy ${i + 1}`;
            games.push(clonedGame);
            totalGamesAdded++;
          }
        } else if (targetCount < currentCount) {
          const difference = currentCount - targetCount;
          totalGamesRemoved += games.splice(games.length - difference, difference).length;
        }

        filesProcessed++;
      } catch (err) {
        // File doesn't exist, skip
      }
    }

    const message = [];
    if (totalGamesAdded > 0) message.push(`${totalGamesAdded} games added`);
    if (totalGamesRemoved > 0) message.push(`${totalGamesRemoved} games removed`);

    return Response.json({
      success: true,
      targetCount,
      filesProcessed,
      totalGamesAdded,
      totalGamesRemoved,
      message: message.length > 0 ? message.join(', ') : 'Semua files sudah pada target',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});