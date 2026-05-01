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

    const currentCount = games.length;
    let gamesAdded = 0;
    let gamesRemoved = 0;

    if (targetCount > currentCount) {
      // Expand by duplicating last game
      const lastGame = games[games.length - 1];
      const difference = targetCount - currentCount;
      
      for (let i = 0; i < difference; i++) {
        const clonedGame = JSON.parse(JSON.stringify(lastGame));
        clonedGame.title = `${lastGame.title} - Copy ${i + 1}`;
        games.push(clonedGame);
        gamesAdded++;
      }
    } else if (targetCount < currentCount) {
      // Reduce by removing from end
      const difference = currentCount - targetCount;
      gamesRemoved = games.splice(games.length - difference, difference).length;
    }

    const message = [];
    if (gamesAdded > 0) message.push(`${gamesAdded} games added`);
    if (gamesRemoved > 0) message.push(`${gamesRemoved} games removed`);

    return Response.json({
      success: true,
      fileName,
      currentCount,
      targetCount,
      gamesAdded,
      gamesRemoved,
      message: message.length > 0 ? message.join(', ') : 'File sudah pada target',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});