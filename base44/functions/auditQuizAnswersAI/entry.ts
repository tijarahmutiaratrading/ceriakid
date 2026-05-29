// Admin-only: full AI audit of quiz answers for ALL games/subjects/levels.
// Uses InvokeLLM to verify each question's marked answer is actually correct.
// Processes in batches because LLM is slow — pass {offset, limit} to chunk through.
//
// Usage:
//   1. Call with {dryRun: true, offset: 0, limit: 50} to preview mismatches in first 50 games
//   2. Call with {dryRun: false, offset: 0, limit: 50} to apply fixes
//   3. Increment offset by limit and repeat until all games processed
//
// Response includes nextOffset so caller can keep going. totalGames tells when to stop.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { dryRun = true, offset = 0, limit = 30, category = null, darjah = null } = await req.json().catch(() => ({}));

    // Filter only games with quiz-style questions (skip story_adventure, drawing, etc)
    const query = { type: { $in: ['multiple_choice', 'math_puzzle', 'picture_quiz', 'quiz', 'science_quiz', 'word_builder', 'letter_match', 'number_match'] } };
    if (category) query.category = category;
    if (darjah) query.darjah = darjah;

    const allGamesPage = await base44.asServiceRole.entities.Game.filter(query, '-created_date', limit, offset);
    if (!allGamesPage || allGamesPage.length === 0) {
      return Response.json({
        message: 'No more games to audit.',
        offset, limit, processed: 0, done: true,
      });
    }

    const mismatches = [];
    let totalQuestionsChecked = 0;
    let fixedGames = 0;
    let llmErrors = 0;

    for (const game of allGamesPage) {
      const questions = game?.gameData?.questions;
      if (!Array.isArray(questions) || questions.length === 0) continue;

      // Build a compact list of questions to verify
      const questionsForLLM = questions
        .map((q, idx) => {
          if (!q?.options || !Array.isArray(q.options)) return null;
          return {
            idx,
            problem: q.problem || q.question || '',
            options: q.options.map(o => String(o)),
            markedAnswer: typeof q.answer === 'number' ? q.answer : -1,
          };
        })
        .filter(Boolean);

      if (questionsForLLM.length === 0) continue;
      totalQuestionsChecked += questionsForLLM.length;

      // Ask LLM to identify the correct answer index for each question
      const prompt = `You are an expert quiz validator for a Malaysian children's education app (Bahasa Melayu, English, Math, Sains, Jawi, Pendidikan Islam, KAFA, etc).

Subject: ${game.category}
Level: ${game.darjah || game.ageGroup}
Title: ${game.title}

For EACH question below, determine which option index (0-based) is the SINGLE correct answer based on factual/educational accuracy. Use Malaysian KSPK/KSSR/UPKK/JAKIM curriculum standards.

For Islamic/KAFA topics, follow standard fiqh (Mazhab Shafi'i is dominant in Malaysia):
- Nisab emas zakat = 85 gram (20 mithqal)
- Nisab perak = 595 gram (200 dirham)
- Surah Al-Insyirah = 8 ayat
- Rukun haji 5: ihram, wuquf, tawaf ifadah, sa'ie, tahallul (cukur)
- Khalifah Umar membai'ah Abu Bakar dahulu di Saqifah

Questions:
${JSON.stringify(questionsForLLM, null, 2)}

CRITICAL RULES:
1. Only flag a question if you are 100% CERTAIN the marked answer is factually wrong.
2. Use model knowledge — if you have ANY doubt, return correctIndex = markedAnswer (treat as correct).
3. For ambiguous, opinion-based, or culturally-specific questions you don't know — return correctIndex = markedAnswer.
4. Set confident = true ONLY when you are absolutely sure.`;

      let llmResult;
      try {
        llmResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          model: 'claude_sonnet_4_6', // higher quality for factual accuracy
          response_json_schema: {
            type: 'object',
            properties: {
              results: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    idx: { type: 'number' },
                    correctIndex: { type: 'number' },
                    confident: { type: 'boolean' },
                  },
                  required: ['idx', 'correctIndex'],
                },
              },
            },
            required: ['results'],
          },
        });
      } catch (e) {
        llmErrors++;
        continue;
      }

      const results = llmResult?.results || [];
      let gameUpdated = false;
      const updatedQuestions = [...questions];

      for (const r of results) {
        if (r.correctIndex === -1) continue; // LLM not confident
        if (r.correctIndex === undefined || r.correctIndex === null) continue;
        if (r.confident === false) continue;

        const q = questions[r.idx];
        if (!q || !q.options || r.correctIndex >= q.options.length) continue;

        const currentAnswer = typeof q.answer === 'number' ? q.answer : -1;
        if (currentAnswer === r.correctIndex) continue; // already correct

        // Mismatch found
        mismatches.push({
          gameId: game.id,
          title: game.title,
          category: game.category,
          darjah: game.darjah,
          qIndex: r.idx,
          problem: q.problem || q.question,
          options: q.options,
          currentAnswer,
          correctIndex: r.correctIndex,
        });

        if (!dryRun) {
          updatedQuestions[r.idx] = { ...q, answer: r.correctIndex };
          gameUpdated = true;
        }
      }

      if (gameUpdated && !dryRun) {
        await base44.asServiceRole.entities.Game.update(game.id, {
          gameData: { ...game.gameData, questions: updatedQuestions },
        });
        fixedGames++;
      }
    }

    return Response.json({
      offset,
      limit,
      processed: allGamesPage.length,
      nextOffset: offset + allGamesPage.length,
      done: allGamesPage.length < limit,
      totalQuestionsChecked,
      mismatchCount: mismatches.length,
      fixedGames,
      llmErrors,
      dryRun,
      mismatches: mismatches.slice(0, 50),
    });
  } catch (error) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});