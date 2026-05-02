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

async function generateGameQuestions(base44, gameTitle, subject, ageGroup, gameType, questionsCount) {
  const prompt = `Kamu adalah expert pembuat soalan pendidikan Malaysia yang SANGAT BIJAK dan TELITI.

Buat TEPAT ${questionsCount} soalan berkualiti tinggi untuk game:
Tajuk: "${gameTitle}"
Subjek: ${CATEGORY_LABELS[subject] || subject}
Peringkat: ${AGE_LABELS[ageGroup] || ageGroup}
Jenis: ${gameType}

KRITERIA WAJIB TUNAIKAN:
1. Soalan JELAS, TEPAT, BERKAITAN dengan tajuk dan kurikulum Malaysia
2. Tepat 4 pilihan jawapan yang BERBEZA dan MASUK AKAL
3. Jawapan betul PASTI betul (jangan samar atau debatable)
4. Emoji RELEVAN dengan soalan & MATCH dengan jawapan betul
5. Bahasa sesuai kanak-kanak, menarik, tidak terlalu mudah atau sukar
6. Setiap soalan MESTI UNIK (JANGAN ULANG)
7. Setiap soalan MESTI ada emoji dalam problem field

Balas JSON dengan TEPAT ${questionsCount} soalan:`;

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
              options: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4 },
              answer: { type: 'number', minimum: 0, maximum: 3 },
              emoji: { type: 'string' },
            },
            required: ['problem', 'options', 'answer', 'emoji'],
          },
          minItems: questionsCount,
        },
      },
      required: ['questions'],
    },
  });

  return result.questions || [];
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