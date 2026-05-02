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
  const options = question.options.map(o => (o || '').trim());
  if (options.some(o => !o || o.length < 3)) return false; // Min 3 chars per option
  if (new Set(options).size !== 4) return false; // Must be unique
  
  // Check answer option is not empty & valid
  if (!options[question.answer] || options[question.answer].length < 3) return false;
  
  // Validate emoji is actual emoji (not text like "emoji")
  const emojiRegex = /^[\p{Emoji}]{1,2}$/gu;
  if (!emojiRegex.test(question.emoji)) return false;
  
  return true;
}

async function generateGameQuestions(base44, gameTitle, subject, ageGroup, gameType, questionsCount) {
  const prompt = `Buat TEPAT ${questionsCount} soalan berkualiti untuk:
"${gameTitle}" - ${CATEGORY_LABELS[subject]} (${AGE_LABELS[ageGroup]})

RULES KETAT—MESTI DIIKUTI SEMPURNA:
1. Soalan MESTI jelas, mudah difahami untuk umur target
2. 4 pilihan jawapan MESTI berbeza, relevan & menarik
3. Jawapan betul MESTI 100% betul (check 3x sebelum output)
4. Emoji MESTI 1 emoji SAHAJA yang SYNC dengan jawapan/subjek, BUKAN generic!
   LARANGAN: 🎮 📝 ❓ 📚 🎓 (generic)
   CONTOH BETUL: 
   - Q: "Apakah warna langit?" Ans: "Biru" → emoji ☀️ atau 🌤️ (SKI dengan biru/langit)
   - Q: "Haiwan apa punya sayap?" Ans: "Burung" → emoji 🐦 atau 🦅 (SKI dengan burung)
   - Q: "Berapa 2+2?" Ans: "4" → emoji 🔢 atau ✖️ (SKI dengan math)

Output MESTI valid JSON dengan array "questions". Setiap soalan:
- problem: string (soalan yang jelas, 15-30 perkataan)
- options: array 4 string (pilihan A, B, C, D masing-masing 3-15 perkataan)
- answer: number (0-3, indeks jawapan betul)
- emoji: string (1 emoji tunggal yang LANGSUNG berkaitan dengan jawapan betul/topik)`;

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        questions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              problem: { type: 'string' },
              options: {
                type: 'array',
                items: { type: 'string' },
                minItems: 4,
                maxItems: 4,
              },
              answer: { type: 'number', minimum: 0, maximum: 3 },
              emoji: { type: 'string' },
            },
            required: ['problem', 'options', 'answer', 'emoji'],
          },
        },
      },
      required: ['questions'],
    },
  });

  // Validate & filter valid questions
  const questions = (result.questions || [])
    .filter(q => {
      if (!q || !q.problem || !q.options || !q.emoji) return false;
      if (q.options.length !== 4) return false;
      if (typeof q.answer !== 'number' || q.answer < 0 || q.answer > 3) return false;
      if (!q.options[q.answer] || q.options[q.answer].trim().length === 0) return false;
      return true;
    })
    .map(q => ({
      problem: q.problem.trim(),
      options: q.options.map(o => (o || '').trim()),
      answer: q.answer,
      emoji: q.emoji.trim() || '🎮',
    }));
  
  console.log(`Generated ${questions.length}/${questionsCount} valid questions for ${gameTitle}`);
  
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

        // Skip if no questions generated
        if (!questions || questions.length === 0) {
          console.error(`Task ${taskId}: No questions generated for ${gameTitle}, skipping...`);
          continue;
        }

        // Create game in database
        const gameData = {
          title: gameTitle,
          type: gameType,
          category: subject,
          ageGroup,
          difficulty: i % 3 === 0 ? 'easy' : i % 3 === 1 ? 'medium' : 'hard',
          tier: 'free',
          emoji: questions[0]?.emoji || '🎮',
          totalQuestions: questions.length,
          gameData: { questions },
          isPublished: true,
          status: 'ready',
          order: i,
        };

        const createdGame = await base44.asServiceRole.entities.Game.create(gameData);
        createdGames++;
        createdGamesList.push(gameTitle);

        console.log(`Task ${taskId}: Created ${createdGames}/${gamesCount} games with ${questions.length} questions`);

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