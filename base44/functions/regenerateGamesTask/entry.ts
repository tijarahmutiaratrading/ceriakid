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
const DARJAH_LABELS = {
  darjah_1: 'Darjah 1', darjah_2: 'Darjah 2', darjah_3: 'Darjah 3',
  darjah_4: 'Darjah 4', darjah_5: 'Darjah 5', darjah_6: 'Darjah 6',
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

async function generateGameQuestions(base44, gameTitle, subject, ageGroup, gameType, questionsCount, darjah = null) {
  const emojiOptions = {
    bahasa_melayu: '📚 📖 ✏️ 🔤 💬 🗣️ 📝 📄 🎓 🌍 🐛 🌳 🐠 🎪 🏠 🚗 🍎 🎨',
    english: '🌟 📚 ✍️ 🔤 💬 🇬🇧 📖 🎤 💭 🏆 🦁 🌸 🎸 ⚽ 🎭 🚀 👑 🎯',
    mathematics: '🔢 ➕ ➖ ✖️ ➗ 📐 📏 🧮 🔺 💯 ⭐ 🎲 📊 🔔 🧩 🎪 📍 💎',
    science: '🔬 🧬 🧪 🌍 🌱 🦋 🔭 ⚗️ 🧫 🌎 🧊 🔥 💧 🌙 ⚡ 🦠 🌤️ 🌌',
    default: '🎮 🎯 🎪 🎨 🎭 🎬 🎤 🎸 🎺 🎻 🎲 🎰 🎮 🧩 🎯 ✨ 🌟 💫'
  };
  const availableEmoji = (emojiOptions[subject] || emojiOptions.default).split(' ');
  
  const prompt = `Buat TEPAT ${questionsCount} soalan berkualiti UNIK dan BERBEZA untuk:
"${gameTitle}" - ${CATEGORY_LABELS[subject]} (${darjah ? `${DARJAH_LABELS[darjah]} / ${AGE_LABELS[ageGroup]}` : AGE_LABELS[ageGroup]})

RULES KETAT—MESTI DIIKUTI SEMPURNA:
1. Setiap soalan MESTI BERBEZA topic/subtopic—JANGAN soalan SIMILAR!
   SALAH: "Apakah warna langit?" dan "Warna apa langit itu?" (sama!)
   BETUL: Q1 tentang warna langit, Q2 tentang haiwan, Q3 tentang nombor, dsb.

2. Soalan MESTI jelas, mudah difahami untuk umur target, MENARIK untuk kanak-kanak

3. 4 pilihan jawapan MESTI berbeza, relevan, masuk akal & TIDAK confusing

4. Jawapan betul MESTI 100% TEPAT (verify 3x sebelum output)

5. Emoji MESTI BERBEZA untuk SETIAP soalan—JANGAN ulang emoji yang sama!
   Emoji pilihan untuk ${CATEGORY_LABELS[subject]}: ${availableEmoji.join(' ')}
   Penting: Setiap soalan pakai emoji berbeza dari soalan lain

6. Emoji MESTI relevan dengan topik soalan ATAU jawapan betul, BUKAN generic!
   LARANGAN generic: 🎮 ❓ 📝 (terlalu generic)
   CONTOH BETUL:
   - Q: "Haiwan apa punya sayap?" Ans: "Burung" → 🐦 atau 🦅 (langsung match)
   - Q: "Berapa 2+2?" Ans: "4" → 🔢 atau ✖️ (match dengan math)
   - Q: "Warna bendera Malaysia?" Ans: "Merah & Biru" → 🇲🇾 (langsung match)

Output MESTI valid JSON dengan array "questions". Setiap soalan:
- problem: string (soalan yang jelas, 15-30 perkataan, WITH emoji relevant)
- options: array 4 string (pilihan A, B, C, D masing-masing 3-15 perkataan, SEMUA berbeza)
- answer: number (0-3, indeks jawapan betul sahaja)
- emoji: string (1 emoji SAHAJA yang berbeza dari soalan lain, relevan dengan topik/jawapan)`;

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

    const { taskId, taskName, ageGroup, darjah, subject, gamesCount, questionsPerGame } = await req.json();

    if (!ageGroup || !subject || !gamesCount || !questionsPerGame) {
      return Response.json({ error: 'Missing required task parameters' }, { status: 400 });
    }

    console.log(`Starting Task ${taskId}: ${taskName} - Creating ${gamesCount} games with ${questionsPerGame} questions each`);

    let createdGames = 0;
    const createdGamesList = [];

    for (let i = 0; i < gamesCount; i++) {
      const gameType = GAME_TYPES[i % GAME_TYPES.length];
      const darjahLabel = ageGroup === 'sekolah_rendah' && darjah ? DARJAH_LABELS[darjah] : '';
      const gameTitle = `${taskName}${darjahLabel ? ` ${darjahLabel}` : ''} Game ${i + 1}`;

      try {
        // Generate questions for this game
        const questions = await generateGameQuestions(
          base44,
          gameTitle,
          subject,
          ageGroup,
          gameType,
          questionsPerGame,
          darjah || null
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
          ...(ageGroup === 'sekolah_rendah' && darjah ? { darjah } : {}),
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