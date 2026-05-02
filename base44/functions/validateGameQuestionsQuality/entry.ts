import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { gameId, ageGroup, category, questions } = await req.json();

    if (!gameId || !ageGroup || !category || !questions || questions.length === 0) {
      return Response.json({
        error: 'Missing required fields: gameId, ageGroup, category, questions',
      }, { status: 400 });
    }

    // Get the game to check title and context
    const game = await base44.entities.Game.filter({ id: gameId }).then(arr => arr[0]);
    if (!game) {
      return Response.json({ error: 'Game not found' }, { status: 404 });
    }

    const darjahMap = {
      prasekolah: 'Prasekolah (4-6 tahun)',
      1: 'Darjah 1',
      2: 'Darjah 2',
      3: 'Darjah 3',
      4: 'Darjah 4',
      5: 'Darjah 5',
      6: 'Darjah 6',
    };

    const categoryMap = {
      bahasa_melayu: 'Bahasa Melayu',
      english: 'English',
      mathematics: 'Matematik',
      science: 'Sains',
      jawi: 'Aksara Jawi',
      bahasa_tamil: 'Bahasa Tamil',
      bahasa_mandarin: 'Bahasa Mandarin',
    };

    const darjahLabel = game.darjah ? darjahMap[game.darjah] : darjahMap[ageGroup];
    const categoryLabel = categoryMap[category] || category;

    // Detailed validation prompt checking soalan, jawapan, emoji/icon, images
    const questionsText = questions
      .map((q, i) => {
        const hasImage = q.image ? `[IMAGE: ${q.image}]` : '[NO IMAGE]';
        const hasEmoji = q.emoji ? `[EMOJI: ${q.emoji}]` : '[NO EMOJI/ICON]';
        const answerText = q.options?.[q.answer];
        const allOptions = (q.options || []).map((opt, idx) => `${idx === q.answer ? '✓' : '✗'} ${opt}`).join(' | ');
        return `Q${i + 1}: ${q.problem || q.question}\n${hasImage} ${hasEmoji}\nOptions: ${allOptions}\nCorrect Answer: ${answerText || 'MISSING'}`;
      })
      .join('\n\n');

    const validationResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a STRICT Malaysian curriculum expert. Validate these ${questions.length} questions for "${game.title}".

Game Context:
- Subject: ${categoryLabel}
- Level: ${darjahLabel}
- Game Type: ${game.type}

CRITICAL VALIDATION RULES:
1. SOALAN CHECK: Is the question accurate, clear, age-appropriate for ${darjahLabel}?
2. JAWAPAN CHECK: Is the marked correct answer (✓) actually correct? Are all options sensible?
3. EMOJI/ICON CHECK: Is emoji present AND MATCHES the question content/answer? (e.g., 🦁 must relate to lion/singa)
4. EMOJI-ANSWER SEMANTIC MATCH: If emoji is 🦁 (lion), the correct answer MUST be about lions (singa/lion/etc). REJECT mismatches like 🦁 with bird answers.
5. IMAGE CHECK: Is image URL valid/present if needed? (URL format check)
6. DUPLICATE CHECK: Are any questions repeated or too similar?
7. CURRICULUM FIT: Does question align with ${categoryLabel} curriculum?

Questions to validate:
${questionsText}

For EACH question, check these aspects:
- Q[number]_SOALAN: [VALID/UNCLEAR/WRONG/OFFTOPIC] - Is the question correct and clear?
- Q[number]_JAWAPAN: [CORRECT/WRONG/AMBIGUOUS] - Is the answer truly correct?
- Q[number]_EMOJI: [PRESENT/MISSING/MISMATCH] - Is emoji there AND semantically matches the answer?
- Q[number]_EMOJI_ANSWER_MATCH: [MATCH/MISMATCH] - Does emoji content match correct answer? (Critical!)
- Q[number]_IMAGE: [VALID/MISSING/BROKEN_URL] - Check image URL validity
- Q[number]_OVERALL: [PASS/FAIL] - Overall quality

Respond in JSON with DETAILED feedback for each question. REJECT any emoji-answer mismatches.`,
      model: 'claude_sonnet_4_6',
      response_json_schema: {
        type: 'object',
        properties: {
          questions_validated: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                question_number: { type: 'number' },
                soalan_status: { type: 'string', description: 'VALID/UNCLEAR/WRONG/OFFTOPIC' },
                jawapan_status: { type: 'string', description: 'CORRECT/WRONG/AMBIGUOUS' },
                emoji_status: { type: 'string', description: 'PRESENT/MISSING/MISMATCH' },
                emoji_answer_match: { type: 'string', description: 'MATCH/MISMATCH' },
                image_status: { type: 'string', description: 'VALID/MISSING/BROKEN_URL' },
                overall: { type: 'string', description: 'PASS/FAIL' },
                issues: { type: 'string', description: 'Specific problems found' },
                recommendation: { type: 'string', description: 'How to fix it' },
              },
              required: ['question_number', 'soalan_status', 'jawapan_status', 'emoji_status', 'emoji_answer_match', 'overall'],
            },
          },
          summary: {
            type: 'object',
            properties: {
              total_questions: { type: 'number' },
              passed: { type: 'number' },
              failed: { type: 'number' },
              critical_issues: { type: 'array', items: { type: 'string' } },
            },
          },
          action_required: { type: 'string', description: 'What must be fixed before publishing' },
        },
      },
    });

    return Response.json({
      gameId,
      gameTitle: game.title,
      subject: categoryLabel,
      level: darjahLabel,
      validation: validationResult,
    });
  } catch (error) {
    console.error('Validation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});