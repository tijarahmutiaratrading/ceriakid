import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const EMOJI_MAP = {
  bahasa_melayu: ['📖', '✏️', '📝', '🇲🇾', '🔤'],
  english: ['🇬🇧', '🔤', '📚', '💬', '🗣️'],
  mathematics: ['🔢', '➕', '➖', '✖️', '📐'],
  science: ['🧪', '🔬', '🧬', '⚗️', '🌍'],
  jawi: ['📜', '🕌', '✒️', '🔤', '📖'],
};

async function generateFixedQuestion(base44, game, question, issues) {
  const categoryEmojis = EMOJI_MAP[game.category] || ['🎮'];
  const randomEmoji = categoryEmojis[Math.floor(Math.random() * categoryEmojis.length)];

  const fixPrompt = `Fix this question for "${game.title}" (${game.category}, ${game.ageGroup}):

Original Question: ${question.problem || question.question}
Current Options: ${(question.options || []).join(' | ')}
Current Answer Index: ${question.answer}

Issues found:
${issues.join('\n')}

Provide FIXED question in JSON ONLY with:
- problem: [Clear, age-appropriate question in proper language]
- options: [4 valid, distinct answer options - make sure correct one is actually correct]
- answer: [Index 0-3 of correct answer - MUST be correct]
- emoji: [Relevant emoji from this list: ${categoryEmojis.join(', ')}]
- image: [null or valid image URL if applicable]

Make sure the correct answer at options[answer] is truly the right one!`;

  const fixedData = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: fixPrompt,
    response_json_schema: {
      type: 'object',
      properties: {
        problem: { type: 'string' },
        options: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4 },
        answer: { type: 'number', minimum: 0, maximum: 3 },
        emoji: { type: 'string' },
        image: { type: ['string', 'null'] },
      },
      required: ['problem', 'options', 'answer', 'emoji'],
    },
  });

  return fixedData;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { gameId, validationResult } = await req.json();

    if (!gameId || !validationResult) {
      return Response.json({ error: 'gameId and validationResult required' }, { status: 400 });
    }

    // Get the game
    const game = await base44.asServiceRole.entities.Game.filter({ id: gameId }).then(arr => arr[0]);
    if (!game) {
      return Response.json({ error: 'Game not found' }, { status: 404 });
    }

    const questions = game.gameData?.questions || [];
    if (questions.length === 0) {
      return Response.json({ error: 'No questions to fix' }, { status: 400 });
    }

    let fixedCount = 0;
    let skippedCount = 0;
    const fixedQuestions = [...questions];

    // Process each validation result
    for (const validation of validationResult.questions_validated || []) {
      const qIdx = validation.question_number - 1;
      if (qIdx < 0 || qIdx >= fixedQuestions.length) continue;

      const currentQuestion = fixedQuestions[qIdx];
      const issues = [];

      // Collect all issues
      if (validation.soalan_status !== 'VALID') {
        issues.push(`Soalan issue: ${validation.soalan_status} - ${validation.issues}`);
      }
      if (validation.jawapan_status !== 'CORRECT') {
        issues.push(`Jawapan issue: ${validation.jawapan_status}`);
      }
      if (validation.emoji_status === 'MISSING' || validation.emoji_status === 'INAPPROPRIATE') {
        issues.push(`Emoji issue: ${validation.emoji_status}`);
      }
      if (validation.image_status === 'BROKEN_URL' || validation.image_status === 'MISSING') {
        issues.push(`Image issue: ${validation.image_status}`);
      }

      // If PASS, skip
      if (validation.overall === 'PASS' && issues.length === 0) {
        skippedCount++;
        continue;
      }

      // Fix the question
      try {
        const fixed = await generateFixedQuestion(base44, game, currentQuestion, issues);
        fixedQuestions[qIdx] = {
          ...fixed,
          _fixed: true,
          _originalIssues: issues,
        };
        fixedCount++;
      } catch (err) {
        console.error(`Error fixing Q${validation.question_number}:`, err);
        skippedCount++;
      }

      // Delay between API calls
      await new Promise(r => setTimeout(r, 1000));
    }

    // Save fixed questions back to game
    await base44.asServiceRole.entities.Game.update(gameId, {
      gameData: { ...game.gameData, questions: fixedQuestions },
      status: 'ready',
    });

    return Response.json({
      success: true,
      gameId,
      fixed: fixedCount,
      skipped: skippedCount,
      total: validationResult.questions_validated?.length || 0,
      message: `✅ Fixed ${fixedCount} questions, ${skippedCount} already good`,
    });
  } catch (error) {
    console.error('Auto-fix error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});