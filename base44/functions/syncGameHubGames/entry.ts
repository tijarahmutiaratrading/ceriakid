import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { targetCount } = await req.json();

    // Game Hub mini-games (from GamesHub page)
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

    const currentCount = gameHubGames.length;
    let message = '';

    if (targetCount > currentCount) {
      // Expand by duplicating
      const difference = targetCount - currentCount;
      const lastGame = gameHubGames[gameHubGames.length - 1];
      
      for (let i = 0; i < difference; i++) {
        const clonedGame = { ...lastGame };
        clonedGame.id = `${lastGame.id}_copy_${i + 1}`;
        clonedGame.title = `${lastGame.title} - Copy ${i + 1}`;
        gameHubGames.push(clonedGame);
      }
      message = `${difference} games added`;
    } else if (targetCount < currentCount) {
      // Reduce by removing from end
      const difference = currentCount - targetCount;
      gameHubGames.splice(gameHubGames.length - difference, difference);
      message = `${difference} games removed`;
    } else {
      message = 'Game Hub sudah pada target';
    }

    return Response.json({
      success: true,
      targetCount,
      currentCount,
      totalGames: gameHubGames.length,
      message,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});