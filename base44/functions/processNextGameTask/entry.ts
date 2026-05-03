import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Called by scheduled automation every 5 minutes.
// Picks ONE pending task and processes it — avoids 504 timeouts.

const CATEGORY_LABELS = {
  bahasa_melayu: 'Bahasa Melayu', english: 'English', mathematics: 'Matematik',
  science: 'Sains', jawi: 'Aksara Jawi', bahasa_tamil: 'Bahasa Tamil', bahasa_mandarin: 'Bahasa Mandarin',
};
const AGE_LABELS = {
  prasekolah: 'Prasekolah (4-6 tahun)', sekolah_rendah: 'Sekolah Rendah (7-12 tahun)',
};
const GAME_TYPES = ['multiple_choice','picture_quiz','drag_drop','memory_game','word_builder','counting','spelling','reading'];

async function generateQuestionsForGame(base44, gameTitle, subject, ageGroup, questionsCount) {
  const emojiMap = {
    bahasa_melayu: '📚 📖 ✏️ 🔤 💬 📝 🎓 🌍 🐛 🌳 🏠 🚗 🍎 🎨',
    english: '🌟 📚 ✍️ 🔤 💬 📖 🎤 🏆 🦁 🌸 🎸 ⚽ 🚀 🎯',
    mathematics: '🔢 ➕ ➖ ✖️ ➗ 📐 📏 🧮 💯 ⭐ 🎲 📊 🧩 💎',
    science: '🔬 🧬 🧪 🌍 🌱 🦋 🔭 ⚗️ 🧊 🔥 💧 🌙 ⚡ 🌌',
    default: '🎮 🎯 🎪 🎨 🎭 🎸 🎲 🧩 ✨ 🌟 💫',
  };
  const emoji = (emojiMap[subject] || emojiMap.default).split(' ');

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `Buat TEPAT ${questionsCount} soalan unik untuk: "${gameTitle}" - ${CATEGORY_LABELS[subject] || subject} (${AGE_LABELS[ageGroup] || ageGroup})
Rules: setiap soalan topic berbeza, jelas untuk kanak-kanak, 4 pilihan jawapan berbeza, jawapan betul, emoji berbeza setiap soalan dari: ${emoji.join(' ')}
Output JSON: questions array dengan { problem, options[4], answer(0-3), emoji }`,
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
    .filter(q => q?.problem && q.options?.length === 4 && typeof q.answer === 'number')
    .map(q => ({ problem: q.problem.trim(), options: q.options.map(o => String(o).trim()), answer: q.answer, emoji: q.emoji?.trim() || '🎮' }));
}

Deno.serve(async (req) => {
  try {
    // Support both scheduled (no auth) and manual (admin auth) calls
    const base44 = createClientFromRequest(req);

    // Fetch one pending task
    const pending = await base44.asServiceRole.entities.GameTask.filter({ status: 'pending' });
    if (!pending || pending.length === 0) {
      console.log('processNextGameTask: No pending tasks.');
      return Response.json({ success: true, message: 'No pending tasks' });
    }

    // Sort by created_date ascending — process oldest first
    pending.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    const task = pending[0];

    console.log(`processNextGameTask: Processing task "${task.taskName}" (${task.gamesCount} games × ${task.questionsPerGame} q)`);

    // Mark as running
    await base44.asServiceRole.entities.GameTask.update(task.id, {
      status: 'running',
      startedAt: new Date().toISOString(),
    });

    let createdGames = 0;

    for (let i = 0; i < task.gamesCount; i++) {
      const gameType = GAME_TYPES[i % GAME_TYPES.length];
      const gameTitle = `${task.taskName} Game ${i + 1}`;

      try {
        const questions = await generateQuestionsForGame(base44, gameTitle, task.subject, task.ageGroup, task.questionsPerGame);

        if (!questions || questions.length === 0) {
          console.error(`Skip ${gameTitle} — no questions generated`);
          continue;
        }

        const existing = await base44.asServiceRole.entities.Game.filter({ ageGroup: task.ageGroup, category: task.subject });

        await base44.asServiceRole.entities.Game.create({
          title: gameTitle,
          type: gameType,
          category: task.subject,
          ageGroup: task.ageGroup,
          difficulty: i % 3 === 0 ? 'easy' : i % 3 === 1 ? 'medium' : 'hard',
          tier: 'free',
          emoji: questions[0]?.emoji || '🎮',
          totalQuestions: questions.length,
          gameData: { questions },
          isPublished: true,
          status: 'ready',
          order: existing.length,
        });

        createdGames++;
        console.log(`Task "${task.taskName}": ${createdGames}/${task.gamesCount} done`);

        // Delay between games to avoid AI rate limits
        if (i < task.gamesCount - 1) {
          await new Promise(r => setTimeout(r, 2500));
        }
      } catch (err) {
        console.error(`Game ${i + 1} error: ${err.message}`);
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    // Mark completed
    await base44.asServiceRole.entities.GameTask.update(task.id, {
      status: 'completed',
      createdGames,
      completedAt: new Date().toISOString(),
    });

    console.log(`processNextGameTask: Task "${task.taskName}" DONE — ${createdGames}/${task.gamesCount} games`);

    return Response.json({ success: true, taskName: task.taskName, createdGames, totalGames: task.gamesCount });

  } catch (error) {
    console.error('processNextGameTask error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});