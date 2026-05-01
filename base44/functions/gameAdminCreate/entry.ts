import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { fileName, gameData } = await req.json();

    const { title, type, category, difficulty = 'easy', tier = 'free', emoji = '🎮', totalQuestions = 8 } = gameData;

    if (!title || !type || !category) {
      return Response.json({ error: 'Missing required fields: title, type, category' }, { status: 400 });
    }

    const newGame = {
      title,
      type,
      category,
      difficulty,
      tier,
      emoji,
      totalQuestions,
      isPublished: false,
      gameData: {
        questions: Array(totalQuestions).fill(null).map((_, i) => ({
          text: `Question ${i + 1}`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          answer: 0,
        })),
      },
    };

    return Response.json({
      success: true,
      message: 'Game created successfully (in-memory). Note: Requires backend DB to persist.',
      game: newGame,
      nextIndex: 'dynamic',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});