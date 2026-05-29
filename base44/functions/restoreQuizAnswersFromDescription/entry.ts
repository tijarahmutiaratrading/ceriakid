// Admin-only: restore quiz answers from the original `description` JSON field
// back into `gameData.questions`. Used to undo damage from auditQuizAnswersAI
// when the LLM incorrectly "corrected" valid answers.
//
// The `description` field on each Game record contains the original generated
// JSON (with correct answers from the source generator). When the audit ran,
// it only updated `gameData.questions` — `description` was untouched.
//
// Usage: { dryRun: true|false, offset: 0, limit: 100 }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { dryRun = true, offset = 0, limit = 100 } = await req.json().catch(() => ({}));

    // Same filter as auditQuizAnswersAI used — restore only games that might have been touched
    const EXCLUDED_CATEGORIES = [
      'kafa_quran', 'kafa_jawi', 'kafa_akidah', 'kafa_ibadah',
      'kafa_sirah', 'kafa_adab', 'kafa_bahasa_arab', 'jawi',
    ];
    const query = {
      type: { $in: ['multiple_choice', 'math_puzzle', 'picture_quiz', 'quiz', 'science_quiz', 'word_builder', 'letter_match', 'number_match'] },
      category: { $nin: EXCLUDED_CATEGORIES },
    };

    const games = await base44.asServiceRole.entities.Game.filter(query, '-created_date', limit, offset);
    if (!games || games.length === 0) {
      return Response.json({ done: true, offset, processed: 0 });
    }

    let restored = 0;
    let mismatchedGames = 0;
    let skipped = 0;
    const changes = [];

    for (const game of games) {
      const desc = game.description;
      if (!desc || typeof desc !== 'string' || !desc.trim().startsWith('{')) {
        skipped++;
        continue;
      }

      let parsed;
      try {
        parsed = JSON.parse(desc);
      } catch {
        skipped++;
        continue;
      }

      const originalQuestions = parsed?.questions;
      const currentQuestions = game?.gameData?.questions;
      if (!Array.isArray(originalQuestions) || !Array.isArray(currentQuestions)) {
        skipped++;
        continue;
      }
      if (originalQuestions.length !== currentQuestions.length) {
        skipped++;
        continue;
      }

      // Compare answer fields — only restore if any differ
      let hasMismatch = false;
      const restoredQuestions = currentQuestions.map((q, idx) => {
        const origAnswer = originalQuestions[idx]?.answer;
        if (typeof origAnswer === 'number' && origAnswer !== q.answer) {
          hasMismatch = true;
          return { ...q, answer: origAnswer };
        }
        return q;
      });

      if (!hasMismatch) continue;

      mismatchedGames++;
      changes.push({
        gameId: game.id,
        title: game.title,
        category: game.category,
        darjah: game.darjah,
        fixes: currentQuestions
          .map((q, idx) => ({
            qIndex: idx,
            currentAnswer: q.answer,
            originalAnswer: originalQuestions[idx]?.answer,
          }))
          .filter(c => c.currentAnswer !== c.originalAnswer),
      });

      if (!dryRun) {
        await base44.asServiceRole.entities.Game.update(game.id, {
          gameData: { ...game.gameData, questions: restoredQuestions },
        });
        restored++;
      }
    }

    return Response.json({
      offset,
      limit,
      processed: games.length,
      nextOffset: offset + games.length,
      done: games.length < limit,
      mismatchedGames,
      restored,
      skipped,
      dryRun,
      changes: changes.slice(0, 30),
    });
  } catch (error) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});