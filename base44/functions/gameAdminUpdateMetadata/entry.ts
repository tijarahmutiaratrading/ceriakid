import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { fileName, gameIndex, updates } = await req.json();

    const module = await import(`../lib/${fileName}.js`);
    const fileContent = module[Object.keys(module)[0]];

    if (!fileContent || !fileContent[gameIndex]) {
      return Response.json({ error: 'Game not found' }, { status: 404 });
    }

    const game = fileContent[gameIndex];
    const allowedFields = ['title', 'emoji', 'difficulty', 'tier', 'category', 'description', 'isPublished', 'order'];

    const changed = {};
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        changed[key] = { old: game[key], new: value };
        game[key] = value;
      }
    }

    return Response.json({
      success: true,
      message: `Updated ${Object.keys(changed).length} field(s)`,
      gameIndex,
      changed,
      game: {
        title: game.title,
        emoji: game.emoji,
        difficulty: game.difficulty,
        tier: game.tier,
        category: game.category,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});