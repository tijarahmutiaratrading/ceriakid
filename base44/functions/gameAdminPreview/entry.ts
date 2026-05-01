import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { fileName, gameIndex } = await req.json();

    // Dynamic import
    const module = await import(`../lib/${fileName}.js`);
    const fileContent = module[Object.keys(module)[0]];

    if (!fileContent || !fileContent[gameIndex]) {
      return Response.json({ error: 'Game not found' }, { status: 404 });
    }

    const game = fileContent[gameIndex];
    const questions = game.gameData?.questions || [];

    // Prepare preview data (first 3 questions)
    const previewQuestions = questions.slice(0, 3).map(q => ({
      ...q,
      // Don't expose answer immediately in preview
      correctAnswer: q.answer,
    }));

    const preview = {
      gameIndex,
      title: game.title,
      type: game.type,
      category: game.category,
      difficulty: game.difficulty,
      emoji: game.emoji,
      tier: game.tier,
      totalQuestions: questions.length,
      previewQuestions,
      description: game.description,
    };

    return Response.json({
      success: true,
      preview,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});