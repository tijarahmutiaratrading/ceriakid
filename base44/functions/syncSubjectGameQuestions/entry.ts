import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Sets the totalQuestions count for all games in a subject (DB-based)
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { targetCount, ageGroup, category } = await req.json();

    if (!targetCount || targetCount < 1) {
      return Response.json({ error: 'targetCount required' }, { status: 400 });
    }
    if (!ageGroup || !category) {
      return Response.json({ error: 'ageGroup and category required' }, { status: 400 });
    }

    // Get all games for this subject
    const games = await base44.asServiceRole.entities.Game.filter({ ageGroup, category });

    let expanded = 0;
    let reduced = 0;
    let unchanged = 0;

    for (const game of games) {
      const questions = game.gameData?.questions || [];
      const currentCount = questions.length;

      if (currentCount === targetCount) {
        unchanged++;
        continue;
      }

      let newQuestions = [...questions];

      if (targetCount > currentCount) {
        // Add dummy questions
        const dummy = Array.from({ length: targetCount - currentCount }, (_, i) => ({
          question: `Soalan ${currentCount + i + 1}`,
          problem: `Soalan ${currentCount + i + 1}`,
          options: ['Jawapan A', 'Jawapan B', 'Jawapan C', 'Jawapan D'],
          answer: 0,
        }));
        newQuestions = [...newQuestions, ...dummy];
        expanded++;
      } else {
        // Trim questions
        newQuestions = newQuestions.slice(0, targetCount);
        reduced++;
      }

      await base44.asServiceRole.entities.Game.update(game.id, {
        totalQuestions: targetCount,
        gameData: { ...game.gameData, questions: newQuestions },
      });
    }

    return Response.json({
      success: true,
      ageGroup,
      category,
      targetCount,
      totalGames: games.length,
      expanded,
      reduced,
      unchanged,
      message: `${expanded} games expanded, ${reduced} games reduced, ${unchanged} unchanged`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});