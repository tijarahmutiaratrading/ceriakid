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

    // AI validation prompt
    const questionsText = questions
      .map((q, i) => `Q${i + 1}: ${q.problem || q.question}\nOptions: ${(q.options || []).join(', ')}\nAnswer: ${q.options?.[q.answer] || 'N/A'}`)
      .join('\n\n');

    const validationResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a curriculum expert. Validate these ${questions.length} questions for a "${game.title}" game.

Game Context:
- Subject: ${categoryLabel}
- Level: ${darjahLabel}
- Game Title: ${game.title}

Your task:
1. Check if each question is relevant to ${categoryLabel} at ${darjahLabel} level
2. Check for duplicate or very similar questions
3. Verify questions are age-appropriate and match the curriculum
4. Flag any questions that deviate from the topic

Questions to validate:
${questionsText}

For EACH question, respond with:
- Q[number]: [VALID/IRRELEVANT/DUPLICATE/OFFTOPIC]
- Reason: [brief explanation]

Then provide:
- Summary: [X valid, Y invalid, Z duplicates]
- Recommendations: [specific actions needed]

Be strict - only mark as VALID if it truly fits the subject, level, and topic.`,
      response_json_schema: {
        type: 'object',
        properties: {
          validations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                question_number: { type: 'number' },
                status: { type: 'string' },
                reason: { type: 'string' },
              },
            },
          },
          summary: {
            type: 'object',
            properties: {
              valid_count: { type: 'number' },
              invalid_count: { type: 'number' },
              total_checked: { type: 'number' },
            },
          },
          recommendations: { type: 'string' },
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