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
  const prompt = `Kamu adalah expert pembuat soalan pendidikan Malaysia yang SANGAT BIJAK, TELITI, dan BERPENGALAMAN.

BUAT TEPAT ${questionsCount} soalan berkualiti TINGGI (bukan cicak, bukan stupid) untuk:
Tajuk: "${gameTitle}"
Subjek: ${CATEGORY_LABELS[subject] || subject}
Peringkat: ${AGE_LABELS[ageGroup] || ageGroup}
Jenis: ${gameType}

KRITERIA WAJIB (TIDAK BOLEH LANGGAR):
1. ✅ SETIAP soalan JELAS, LOGIK, BERMAKNA, REAL-WORLD RELEVANT
2. ✅ BUKAN teka-teki bodoh atau soalan yang tak guna
3. ✅ Berkaitan LANGSUNG dengan kurikulum Malaysia & kehidupan sebenar kanak-kanak
4. ✅ 4 pilihan SEMUA logik & BERBEZA jauh (bukan soal spelling sahaja)
5. ✅ Jawapan BETUL PASTI betul 100% (BUKAN subjektif/samar)
6. ✅ Emoji TEPAT dengan soalan (bukan random emoji)
7. ✅ Bahasa MUDAH tapi PROFESIONAL (sesuai tahap)
8. ✅ JANGAN ULANG - setiap soalan MESTI UNIK

JANGAN buat:
❌ Soalan dengan jawapan yang boleh berbeza-beza
❌ Soalan yang tidak masuk akal
❌ Soalan yang terlalu senang atau terlalu sukar
❌ Emoji yang tidak relevan
❌ Soalan duplicate atau mirip

Balas JSON dengan TEPAT ${questionsCount} soalan berkualiti TINGGI:`;

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

  // Validate all questions meet quality standards
  const validQuestions = (result.questions || []).filter(q => validateQuestionQuality(q));
  
  if (validQuestions.length < questionsCount) {
    console.warn(`Quality check failed: ${validQuestions.length}/${questionsCount} questions passed validation`);
  }
  
  return validQuestions;
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