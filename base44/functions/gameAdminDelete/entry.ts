import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { fileName, gameIndices } = await req.json();

    if (!gameIndices || !Array.isArray(gameIndices)) {
      return Response.json({ error: 'gameIndices must be an array' }, { status: 400 });
    }

    const module = await import(`../lib/${fileName}.js`);
    const fileContent = module[Object.keys(module)[0]];

    if (!fileContent) {
      return Response.json({ error: 'File not found' }, { status: 404 });
    }

    // Sort indices in descending order to avoid index shifting issues
    const sortedIndices = gameIndices.sort((a, b) => b - a);
    const deleted = [];

    for (const idx of sortedIndices) {
      if (idx >= 0 && idx < fileContent.length) {
        const deletedGame = fileContent.splice(idx, 1)[0];
        deleted.push({ index: idx, title: deletedGame.title });
      }
    }

    return Response.json({
      success: true,
      message: `Deleted ${deleted.length} game(s)`,
      deletedGames: deleted,
      remainingCount: fileContent.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});