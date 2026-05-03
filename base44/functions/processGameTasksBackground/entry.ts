import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Runs ALL generation tasks sequentially in ONE backend call.
// Frontend just fires-and-forgets — browser can close, tasks keep running server-side.

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
  'multiple_choice', 'picture_quiz', 'drag_drop', 'memory_game',
  'word_builder', 'counting', 'spelling', 'reading',
];

async function generateGameQuestions(base44, gameTitle, subject, ageGroup, questionsCount) {
  const emojiOptions = {
    bahasa_melayu: '📚 📖 ✏️ 🔤 💬 🗣️ 📝 🎓 🌍 🐛 🌳 🐠 🏠 🚗 🍎 🎨',
    english: '🌟 📚 ✍️ 🔤 💬 📖 🎤 💭 🏆 🦁 🌸 🎸 ⚽ 🚀 👑 🎯',
    mathematics: '🔢 ➕ ➖ ✖️ ➗ 📐 📏 🧮 💯 ⭐ 🎲 📊 🧩 💎',
    science: '🔬 🧬 🧪 🌍 🌱 🦋 🔭 ⚗️ 🧊 🔥 💧 🌙 ⚡ 🌤️ 🌌',
    default: '🎮 🎯 🎪 🎨 🎭 🎬 🎤 🎸 🎲 🧩 ✨ 🌟 💫',
  };
  const availableEmoji = (emojiOptions[subject] || emojiOptions.default).split(' ');

  const prompt = `Buat TEPAT ${questionsCount} soalan berkualiti UNIK dan BERBEZA untuk:
"${gameTitle}" - ${CATEGORY_LABELS[subject] || subject} (${AGE_LABELS[ageGroup] || ageGroup})

RULES KETAT:
1. Setiap soalan MESTI berbeza topic/subtopic—JANGAN soalan similar!
2. Soalan mesti jelas, menarik untuk kanak-kanak
3. 4 pilihan jawapan mesti berbeza dan masuk akal
4. Jawapan betul mesti 100% tepat
5. Emoji MESTI berbeza untuk setiap soalan — pilih dari: ${availableEmoji.join(' ')}
6. Emoji mesti relevan dengan topik soalan

Output JSON dengan array "questions". Setiap soalan:
- problem: string (soalan jelas, 15-30 perkataan)
- options: array 4 string (pilihan A, B, C, D, SEMUA berbeza)
- answer: number (0-3, indeks jawapan betul)
- emoji: string (1 emoji sahaja)`;

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
              options: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4 },
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

  return (result.questions || [])
    .filter(q => q && q.problem && q.options?.length === 4 && typeof q.answer === 'number')
    .map(q => ({
      problem: q.problem.trim(),
      options: q.options.map(o => (o || '').trim()),
      answer: q.answer,
      emoji: q.emoji?.trim() || '🎮',
    }));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // tasks = [{ taskId, taskName, ageGroup, subject, gamesCount, questionsPerGame }]
    const { tasks } = await req.json();

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return Response.json({ error: 'tasks array required' }, { status: 400 });
    }

    console.log(`processGameTasksBackground: Starting ${tasks.length} tasks`);

    const results = [];

    for (const task of tasks) {
      const { taskId, taskName, ageGroup, subject, gamesCount, questionsPerGame } = task;
      let createdGames = 0;

      console.log(`Task [${taskId}] START: ${taskName} — ${gamesCount} games × ${questionsPerGame} soalan`);

      for (let i = 0; i < gamesCount; i++) {
        const gameType = GAME_TYPES[i % GAME_TYPES.length];
        const gameTitle = `${taskName} Game ${i + 1}`;

        try {
          const questions = await generateGameQuestions(base44, gameTitle, subject, ageGroup, questionsPerGame);

          if (!questions || questions.length === 0) {
            console.error(`Task [${taskId}]: Tiada soalan untuk ${gameTitle}, skip`);
            continue;
          }

          // Get current count to set order correctly
          const existing = await base44.asServiceRole.entities.Game.filter({ ageGroup, category: subject });
          const order = existing.length;

          await base44.asServiceRole.entities.Game.create({
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
            order,
          });

          createdGames++;
          console.log(`Task [${taskId}]: Created ${createdGames}/${gamesCount} — ${gameTitle}`);

          // Delay 3s between games to avoid AI rate limits
          if (i < gamesCount - 1) {
            await new Promise(r => setTimeout(r, 3000));
          }
        } catch (err) {
          console.error(`Task [${taskId}]: Error game ${i + 1}: ${err.message}`);
          // Still delay on error to avoid hammering the API
          await new Promise(r => setTimeout(r, 2000));
        }
      }

      results.push({ taskId, taskName, createdGames, totalGames: gamesCount });
      console.log(`Task [${taskId}] DONE: ${createdGames}/${gamesCount} games created`);

      // Delay 2s between tasks
      await new Promise(r => setTimeout(r, 2000));
    }

    const totalCreated = results.reduce((a, r) => a + r.createdGames, 0);
    console.log(`processGameTasksBackground: ALL DONE — ${totalCreated} games created across ${tasks.length} tasks`);

    return Response.json({
      success: true,
      totalTasks: tasks.length,
      totalCreated,
      results,
    });

  } catch (error) {
    console.error('processGameTasksBackground error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});