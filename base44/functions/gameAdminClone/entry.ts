import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { fileName, gameIndex, newTitle } = await req.json();

    if (!fileName || gameIndex === undefined || !newTitle) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Dynamic import
    const module = await import(`../lib/${fileName}.js`);
    const fileContent = module[Object.keys(module)[0]];

    if (!fileContent || !fileContent[gameIndex]) {
      return Response.json({ error: 'Game not found' }, { status: 404 });
    }

    // Deep clone the game
    const originalGame = fileContent[gameIndex];
    const clonedGame = JSON.parse(JSON.stringify(originalGame));
    
    // Update title
    clonedGame.title = newTitle;

    // Add to array
    fileContent.push(clonedGame);

    return Response.json({
      success: true,
      originalIndex: gameIndex,
      clonedIndex: fileContent.length - 1,
      originalTitle: originalGame.title,
      newTitle,
      message: `Game cloned successfully at index ${fileContent.length - 1}`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});