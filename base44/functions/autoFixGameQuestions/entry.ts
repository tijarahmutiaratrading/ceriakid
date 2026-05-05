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

  const fixPrompt = `You are an expert in creating educational questions for Malaysian ${game.ageGroup} ${game.category}.

Fix this question for "${game.title}":
Original: ${question.problem || question.question}
Current Options: ${(question.options || []).join(' | ')}
Current Answer Index: ${question.answer}

Issues to fix:
${issues.join('\n')}

CRITICAL: If there's an emoji-answer mismatch (e.g., 🦁 with non-lion answer):
- Keep the emoji semantically matched to the correct answer
- If emoji is 🦁, correct answer MUST be about lions (singa, lion, etc)
- Regenerate options so the emoji makes sense

Provide FIXED question with:
- problem: [Clear question + appropriate emoji from list: ${categoryEmojis.join(', ')}]
- options: [4 DISTINCT, sensible answers where options[answer] is CORRECT]
- answer: [0-3 index of correct answer]
- emoji: [Emoji that MATCHES the correct answer semantically]
- image: [null or valid URL]

ENSURE emoji and correct answer are semantically aligned!`;

  const fixedData = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: fixPrompt,
    model: 'claude_sonnet_4_6',
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
       if (validation.emoji_status === 'MISSING' || validation.emoji_status === 'MISMATCH') {
         issues.push(`Emoji issue: ${validation.emoji_status}`);
       }
       if (validation.emoji_answer_match === 'MISMATCH') {
         issues.push(`CRITICAL: Emoji does not match correct answer - emoji and answer must be semantically aligned`);
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
        const fixedRaw = await generateFixedQuestion(base44, game, currentQuestion, issues);
        const fixed = fixedRaw.response || fixedRaw;
        fixedQuestions[qIdx] = {
          problem: fixed.problem,
          options: fixed.options,
          answer: fixed.answer,
          emoji: fixed.emoji,
          ...(fixed.image ? { image: fixed.image } : {}),
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