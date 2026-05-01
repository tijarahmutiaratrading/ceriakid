import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { fileName, searchQuery, category, difficulty, type } = await req.json();

    // Dynamic import the game file
    const module = await import(`../lib/${fileName}.js`);
    const fileContent = module[Object.keys(module)[0]];

    if (!fileContent) {
      return Response.json({ error: 'File not found' }, { status: 404 });
    }

    // Filter games based on criteria
    const filtered = fileContent.filter(game => {
      let match = true;

      if (searchQuery) {
        match = match && game.title.toLowerCase().includes(searchQuery.toLowerCase());
      }
      if (category) {
        match = match && game.category === category;
      }
      if (difficulty) {
        match = match && game.difficulty === difficulty;
      }
      if (type) {
        match = match && game.type === type;
      }

      return match;
    });

    // Return with index and metadata
    const results = filtered.map((game, idx) => ({
      index: fileContent.indexOf(game),
      title: game.title,
      type: game.type,
      category: game.category,
      difficulty: game.difficulty,
      questionCount: game.gameData?.questions?.length || 0,
      tier: game.tier || 'free',
      emoji: game.emoji,
    }));

    return Response.json({
      success: true,
      total: fileContent.length,
      found: results.length,
      results,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});