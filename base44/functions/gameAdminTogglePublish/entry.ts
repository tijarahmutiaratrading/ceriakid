import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { fileName, gameIndex, isPublished } = await req.json();

    const module = await import(`../lib/${fileName}.js`);
    const fileContent = module[Object.keys(module)[0]];

    if (!fileContent || !fileContent[gameIndex]) {
      return Response.json({ error: 'Game not found' }, { status: 404 });
    }

    const game = fileContent[gameIndex];
    game.isPublished = isPublished !== undefined ? isPublished : !game.isPublished;

    return Response.json({
      success: true,
      message: `Game "${game.title}" is now ${game.isPublished ? 'published' : 'draft'}`,
      gameIndex,
      isPublished: game.isPublished,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});