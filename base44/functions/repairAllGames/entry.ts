import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Repair semua games yang ada isu structural:
// 1. Delete games dengan no_questions (kosong)
// 2. Remove duplicate questions dalam game yang ada duplikat
// 3. Remove duplicate options dalam soalan (shift answer index kalau perlu)
//
// Tak sentuh biased_answers — sebab itu mungkin betul untuk content factual.

function repairGame(game) {
  const actions = [];
  const data = game.gameData || {};
  let questions = Array.isArray(data.questions) ? data.questions : [];

  // 1. Dedupe questions
  const seen = new Set();
  const beforeQ = questions.length;
  questions = questions.filter(q => {
    const key = String(q.problem || q.question || q.word || q.letter || '').trim().toLowerCase();
    if (!key) return true;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  if (questions.length < beforeQ) {
    actions.push(`Padam ${beforeQ - questions.length} soalan duplikat`);
  }

  // 2. Dedupe options per question (preserve correct answer)
  questions = questions.map(q => {
    if (!Array.isArray(q.options)) return q;
    const correctOpt = (typeof q.answer === 'number' && q.options[q.answer] !== undefined)
      ? q.options[q.answer] : null;

    const seenOpts = new Set();
    const dedupedOptions = q.options.filter(opt => {
      const k = String(opt).trim().toLowerCase();
      if (seenOpts.has(k)) return false;
      seenOpts.add(k);
      return true;
    });

    if (dedupedOptions.length < q.options.length) {
      // Find new answer index
      let newAnswer = q.answer;
      if (correctOpt !== null) {
        const newIdx = dedupedOptions.findIndex(o => String(o).trim().toLowerCase() === String(correctOpt).trim().toLowerCase());
        if (newIdx >= 0) newAnswer = newIdx;
      }
      actions.push(`Padam option duplikat dalam 1 soalan`);
      return { ...q, options: dedupedOptions, answer: newAnswer };
    }
    return q;
  });

  return { questions, actions, isEmpty: questions.length === 0 };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch all games
    const allGames = [];
    let page = 0;
    const pageSize = 500;
    while (true) {
      const batch = await base44.asServiceRole.entities.Game.filter({}, '-created_date', pageSize, page * pageSize);
      if (!batch || batch.length === 0) break;
      allGames.push(...batch);
      if (batch.length < pageSize) break;
      page++;
      if (page > 20) break;
    }

    console.log(`Repairing ${allGames.length} games...`);

    const results = {
      total: allGames.length,
      deleted: 0,
      repaired: 0,
      unchanged: 0,
      errors: [],
      deletedIds: [],
      repairedDetails: [],
    };

    for (const game of allGames) {
      try {
        const questions = game.gameData?.questions || [];

        // CASE 1: Delete games dengan no questions
        if (!Array.isArray(questions) || questions.length === 0) {
          await base44.asServiceRole.entities.Game.delete(game.id);
          results.deleted++;
          results.deletedIds.push({ id: game.id, title: game.title, category: game.category });
          continue;
        }

        // CASE 2: Try to repair duplicates
        const { questions: newQuestions, actions, isEmpty } = repairGame(game);

        if (isEmpty) {
          // All questions were duplicates — delete
          await base44.asServiceRole.entities.Game.delete(game.id);
          results.deleted++;
          results.deletedIds.push({ id: game.id, title: game.title, category: game.category, reason: 'all_duplicates' });
          continue;
        }

        if (actions.length > 0) {
          await base44.asServiceRole.entities.Game.update(game.id, {
            gameData: { ...game.gameData, questions: newQuestions },
            totalQuestions: newQuestions.length,
          });
          results.repaired++;
          results.repairedDetails.push({
            id: game.id,
            title: game.title,
            category: game.category,
            actions,
            beforeCount: questions.length,
            afterCount: newQuestions.length,
          });
        } else {
          results.unchanged++;
        }
      } catch (err) {
        results.errors.push({ id: game.id, title: game.title, error: err.message });
      }
    }

    return Response.json({
      success: true,
      results,
      repairedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('repairAllGames error:', error);
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});