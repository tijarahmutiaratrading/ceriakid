import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function isRealQuestion(q) {
  const problem = (q.problem || q.question || '').trim();
  if (!problem) return false;
  if (/^Soalan \d+$/.test(problem)) return false;
  if (!Array.isArray(q.options) || q.options.length === 0) return false;
  const nonEmptyOptions = q.options.filter(o => o && String(o).trim().length > 0);
  if (nonEmptyOptions.length < 2) return false;
  return true;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { ageGroup, category } = body;

    const filterParams = {};
    if (ageGroup) filterParams.ageGroup = ageGroup;
    if (category) filterParams.category = category;

    const games = await base44.asServiceRole.entities.Game.filter(filterParams);

    let cleaned = 0;
    let unchanged = 0;
    let totalRemoved = 0;

    // Process in small batches with delay to avoid rate limit
    const BATCH_SIZE = 5;
    for (let i = 0; i < games.length; i += BATCH_SIZE) {
      const batch = games.slice(i, i + BATCH_SIZE);

      for (const game of batch) {
        const allQuestions = game.gameData?.questions || [];
        const realQuestions = allQuestions.filter(isRealQuestion);
        const removed = allQuestions.length - realQuestions.length;

        if (removed > 0) {
          await base44.asServiceRole.entities.Game.update(game.id, {
            totalQuestions: realQuestions.length,
            gameData: { ...game.gameData, questions: realQuestions },
          });
          cleaned++;
          totalRemoved += removed;
        } else {
          unchanged++;
        }
      }

      // Delay between batches to avoid rate limit
      if (i + BATCH_SIZE < games.length) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    return Response.json({
      success: true,
      totalGames: games.length,
      cleaned,
      unchanged,
      totalRemoved,
      message: `Cleaned ${totalRemoved} empty questions from ${cleaned} games`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});