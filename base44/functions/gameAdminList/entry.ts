import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { fileName } = await req.json();

    const module = await import(`../lib/${fileName}.js`);
    const fileContent = module[Object.keys(module)[0]];

    if (!fileContent) {
      return Response.json({ error: 'File not found' }, { status: 404 });
    }

    const games = fileContent.map((game, idx) => ({
      index: idx,
      title: game.title,
      emoji: game.emoji,
      type: game.type,
      category: game.category,
      difficulty: game.difficulty,
      tier: game.tier || 'free',
      totalQuestions: game.gameData?.questions?.length || 0,
      isPublished: game.isPublished !== false,
    }));

    return Response.json({
      success: true,
      fileName,
      games,
      totalGames: games.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});