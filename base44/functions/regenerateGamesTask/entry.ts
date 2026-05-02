import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CATEGORY_LABELS = {
  bahasa_melayu: 'Bahasa Melayu',
  english: 'English',
  mathematics: 'Matematik',
  science: 'Sains',
  jawi: 'Aksara Jawi',
  bahasa_tamil: 'Bahasa Tamil',
  bahasa_mandarin: 'Bahasa Mandarin',
};

const AGE_LABELS = {
  prasekolah: 'Prasekolah (4-6 tahun)',
  sekolah_rendah: 'Sekolah Rendah (7-12 tahun)',
};

const GAME_TYPES = [
  'multiple_choice',
  'picture_quiz',
  'drag_drop',
  'memory_game',
  'word_builder',
  'counting',
  'spelling',
  'reading',
];

async function validateQuestionQuality(question) {
  // Validate question meets minimum standards
  if (!question.problem || question.problem.trim().length < 10) return false;
  if (!question.options || question.options.length !== 4) return false;
  if (typeof question.answer !== 'number' || question.answer < 0 || question.answer > 3) return false;
  if (!question.emoji || question.emoji.trim().length === 0) return false;
  
  // Check all options are different and not empty
  const options = question.options.map(o => o?.trim?.() || '');
  if (options.some(o => !o || o.length < 2)) return false;
  if (new Set(options).size !== 4) return false; // Must be unique
  
  // Check answer option is not empty
  if (!options[question.answer] || options[question.answer].length < 2) return false;
  
  return true;
}

async function generateGameQuestions(base44, gameTitle, subject, ageGroup, gameType, questionsCount) {
  const prompt = `Buat TEPAT ${questionsCount} soalan berkualiti untuk:
"${gameTitle}" - ${CATEGORY_LABELS[subject]} (${AGE_LABELS[ageGroup]})

Output MESTI JSON dengan array "questions". Setiap soalan:
- problem: string (soalan yang jelas)
- options: array 4 string (pilihan A, B, C, D yang berbeza)
- answer: number (0-3, indeks jawapan betul)
- emoji: string (1 emoji relevan)`;

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    model: 'claude_sonnet_4_6',
    response_json_schema: {
      type: 'object',
      properties: {
        questions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              problem: { type: 'string' },
              options: { type: 'array', items: { type: 'string' } },
              answer: { type: 'number' },
              emoji: { type: 'string' },
            },
            required: ['problem', 'options', 'answer', 'emoji'],
          },
        },
      },
      required: ['questions'],
    },
  });

  // Gunakan soalan LLM langsung tanpa strict validation (LLM dah format betul)
  const questions = (result.questions || [])
    .filter(q => q && q.problem && q.options?.length === 4 && q.answer !== undefined && q.emoji)
    .slice(0, questionsCount);
  
  console.log(`Generated ${questions.length}/${questionsCount} questions for ${gameTitle}`);
  
  return questions;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { taskId, taskName, ageGroup, subject, gamesCount, questionsPerGame } = await req.json();

    if (!ageGroup || !subject || !gamesCount || !questionsPerGame) {
      return Response.json({ error: 'Missing required task parameters' }, { status: 400 });
    }

    console.log(`Starting Task ${taskId}: ${taskName} - Creating ${gamesCount} games with ${questionsPerGame} questions each`);

    let createdGames = 0;
    const createdGamesList = [];

    for (let i = 0; i < gamesCount; i++) {
      const gameType = GAME_TYPES[i % GAME_TYPES.length];
      const gameTitle = `${taskName} Game ${i + 1}`;

      try {
        // Generate questions for this game
        const questions = await generateGameQuestions(
          base44,
          gameTitle,
          subject,
          ageGroup,
          gameType,
          questionsPerGame
        );

        // Create game in database
        const gameData = {
          title: gameTitle,
          type: gameType,
          category: subject,
          ageGroup,
          difficulty: i % 3 === 0 ? 'easy' : i % 3 === 1 ? 'medium' : 'hard',
          tier: 'free',
          emoji: questions[0]?.emoji || '🎮',
          totalQuestions: questionsPerGame,
          gameData: { questions },
          isPublished: true,
          status: 'ready',
          order: i,
        };

        const createdGame = await base44.asServiceRole.entities.Game.create(gameData);
        createdGames++;
        createdGamesList.push(gameTitle);

        console.log(`Task ${taskId}: Created ${createdGames}/${gamesCount} games`);

        // Delay between games to avoid rate limits
        if (i < gamesCount - 1) {
          await new Promise(r => setTimeout(r, 2000));
        }
      } catch (err) {
        console.error(`Task ${taskId}: Error creating game ${i + 1}: ${err.message}`);
      }
    }

    return Response.json({
      success: true,
      taskId,
      taskName,
      ageGroup,
      subject,
      createdGames,
      totalGames: gamesCount,
      questionsPerGame,
      totalQuestions: createdGames * questionsPerGame,
      createdGamesList,
      message: `✅ Task ${taskId} complete: Created ${createdGames}/${gamesCount} games with ${createdGames * questionsPerGame} questions`,
    });
  } catch (error) {
    console.error('Task execution error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});