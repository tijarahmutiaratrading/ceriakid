import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Called by scheduled automation every 5 minutes.
// Picks ONE pending task, processes up to 5 games per run to avoid timeout.

const CATEGORY_LABELS = {
  bahasa_melayu: 'Bahasa Melayu', english: 'English', mathematics: 'Matematik',
  science: 'Sains', jawi: 'Aksara Jawi', bahasa_tamil: 'Bahasa Tamil', bahasa_mandarin: 'Bahasa Mandarin',
};
const AGE_LABELS = {
  prasekolah: 'Prasekolah (4-6 tahun)', sekolah_rendah: 'Sekolah Rendah (7-12 tahun)',
};
const GAME_TYPES = ['multiple_choice','picture_quiz','drag_drop','memory_game','word_builder','counting','spelling','reading','science_quiz','math_puzzle','pattern_fill','color_match','shape_sort','sound_match','phonics','letter_match','number_match','reading','spelling','multiple_choice'];

async function generateQuestionsForGame(base44, gameTitle, subject, ageGroup, questionsCount) {
  const emojiMap = {
    bahasa_melayu: '📚 📖 ✏️ 🔤 💬 📝 🎓 🌍 🐛 🌳 🏠 🚗 🍎 🎨 🐘 🦁 🌺 🎭 🏫 🦋',
    english: '🌟 📚 ✍️ 🔤 💬 📖 🎤 🏆 🦁 🌸 🎸 ⚽ 🚀 🎯 🌈 🦄 🎪 🎠 🌻 🦊',
    mathematics: '🔢 ➕ ➖ ✖️ ➗ 📐 📏 🧮 💯 ⭐ 🎲 📊 🧩 💎 🔵 🟡 🟢 🔴 🟠 🟣',
    science: '🔬 🧬 🧪 🌍 🌱 🦋 🔭 ⚗️ 🧊 🔥 💧 🌙 ⚡ 🌌 🦠 🌿 🐝 🌊 🏔️ 🌋',
    jawi: '📖 ✍️ 📝 🎓 🕌 🌙 ⭐ 📜 🖊️ 🎨 🏫 📚 💫 🌟 ✨',
    bahasa_tamil: '📚 🌺 🎭 🏺 🌸 ✍️ 📖 🎓 🌟 💫 🎨 🌈 🏵️ 🌻 🦚',
    bahasa_mandarin: '🐉 🏮 🌸 🎋 🥢 🍜 🎎 🎐 🏯 🌙 ⭐ 📚 ✍️ 🎨 🦅',
  };
  const emoji = (emojiMap[subject] || '🎮 🎯 🎪 🎨 🎭 🎸 🎲 🧩 ✨ 🌟').split(' ');

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `Buat TEPAT ${questionsCount} soalan unik untuk permainan: "${gameTitle}"
Subjek: ${CATEGORY_LABELS[subject] || subject} | Peringkat: ${AGE_LABELS[ageGroup] || ageGroup}

Rules:
- Setiap soalan topik BERBEZA
- Bahasa sesuai untuk kanak-kanak Malaysia
- 4 pilihan jawapan yang jelas berbeza
- Emoji BERBEZA setiap soalan (pilih dari: ${emoji.slice(0,10).join(' ')})
- Soalan ringkas dan mudah difahami

Output JSON array "questions" dengan field: problem, options[4], answer(0-3 index), emoji`,
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
    const base44 = createClientFromRequest(req);

    // Fetch pending tasks
    const pending = await base44.asServiceRole.entities.GameTask.filter({ status: 'pending' });
    if (!pending || pending.length === 0) {
      // Also check if any running tasks are stuck (older than 10 mins) and reset them
      const running = await base44.asServiceRole.entities.GameTask.filter({ status: 'running' });
      for (const t of running) {
        const startedAt = new Date(t.startedAt || t.created_date);
        const minutesAgo = (Date.now() - startedAt.getTime()) / 60000;
        if (minutesAgo > 10) {
          await base44.asServiceRole.entities.GameTask.update(t.id, { status: 'pending' });
        }
      }
      console.log('processNextGameTask: No pending tasks.');
      return Response.json({ success: true, message: 'No pending tasks' });
    }

    // Sort oldest first
    pending.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    const task = pending[0];

    const alreadyCreated = task.createdGames || 0;
    const totalNeeded = task.gamesCount;
    const BATCH = 5; // max games per run to avoid timeout
    const batchEnd = Math.min(alreadyCreated + BATCH, totalNeeded);

    console.log(`processNextGameTask: "${task.taskName}" — batch ${alreadyCreated + 1} to ${batchEnd} of ${totalNeeded}`);

    // Mark as running
    await base44.asServiceRole.entities.GameTask.update(task.id, {
      status: 'running',
      startedAt: new Date().toISOString(),
    });

    let createdInBatch = 0;

    for (let i = alreadyCreated; i < batchEnd; i++) {
      const gameType = GAME_TYPES[i % GAME_TYPES.length];
      const gameTitle = `${task.taskName} - Game ${i + 1}`;

      try {
        const questions = await generateQuestionsForGame(base44, gameTitle, task.subject, task.ageGroup, task.questionsPerGame);

        if (!questions || questions.length === 0) {
          console.error(`Skip ${gameTitle} — no questions`);
          createdInBatch++;
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

        createdInBatch++;
        console.log(`"${task.taskName}": ${alreadyCreated + createdInBatch}/${totalNeeded} done`);

        if (i < batchEnd - 1) {
          await new Promise(r => setTimeout(r, 1500));
        }
      } catch (err) {
        console.error(`Game ${i + 1} error: ${err.message}`);
        createdInBatch++;
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    const newTotal = alreadyCreated + createdInBatch;
    const isDone = newTotal >= totalNeeded;

    await base44.asServiceRole.entities.GameTask.update(task.id, {
      status: isDone ? 'completed' : 'pending', // reset to pending for next batch
      createdGames: newTotal,
      ...(isDone ? { completedAt: new Date().toISOString() } : {}),
    });

    console.log(`processNextGameTask: batch done. ${newTotal}/${totalNeeded}. ${isDone ? 'COMPLETED' : 'More batches remaining.'}`);
    return Response.json({ success: true, taskName: task.taskName, createdGames: newTotal, totalGames: totalNeeded, isDone });

  } catch (error) {
    console.error('processNextGameTask error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});