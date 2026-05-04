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
const GAME_TYPES = ['multiple_choice','picture_quiz','word_builder','counting','spelling','reading','science_quiz','math_puzzle','phonics','letter_match'];

// Unique topic pools per subject to avoid repetitive games
const TOPIC_POOLS = {
  bahasa_melayu: ['Haiwan','Buah-buahan','Nombor','Warna','Hari & Bulan','Kata Nama Am','Kata Kerja','Kata Adjektif','Keluarga','Rumah','Sekolah','Makanan','Pakaian','Alam Sekitar','Peribahasa','Sajak','Cerita Pendek','Pantun','Tatabahasa','Sinonim'],
  english: ['Animals','Fruits','Colours','Numbers','Family','School','Food','Clothes','Nature','Action Words','Opposite Words','Phonics A-E','Phonics F-J','Phonics K-O','Phonics P-T','Phonics U-Z','Greetings','Body Parts','Weather','Transport'],
  mathematics: ['Tambah 1-10','Tolak 1-10','Tambah 11-20','Tolak 11-20','Pendaraban 2','Pendaraban 3','Pendaraban 4','Pendaraban 5','Pembahagian','Masa & Jam','Wang Ringgit','Pecahan Mudah','Bentuk 2D','Bentuk 3D','Ukuran Panjang','Berat','Isipadu','Susun Nombor','Nombor Genap Ganjil','Anggaran'],
  science: ['Haiwan Vertebrata','Haiwan Invertebrata','Tumbuhan','Kitaran Air','Cuaca','Sumber Alam','Tubuh Badan','Deria Lima','Jenis Makanan','Jirim & Bahan','Magnet','Cahaya','Bunyi','Gaya','Mudarat Alam Sekitar','Sistem Suria','Bintang & Bulan','Proses Foto','Adaptasi Haiwan','Ekosistem'],
  jawi: ['Huruf Jawi Alif-Ba','Huruf Jawi Ta-Tha','Huruf Jawi Jim-Kha','Huruf Jawi Dal-Zal','Huruf Jawi Ra-Zai','Huruf Jawi Sin-Shin','Ejaan Jawi Mudah','Perkataan Jawi Haiwan','Perkataan Jawi Makanan','Perkataan Jawi Warna'],
  bahasa_tamil: ['எழுத்துகள் அ-ஆ','எழுத்துகள் இ-ஈ','எண்கள் 1-10','நிறங்கள்','விலங்குகள்','பழங்கள்','உணவுகள்','குடும்பம்','பள்ளி','தாவரங்கள்'],
  bahasa_mandarin: ['拼音 a-e','拼音 f-k','数字1-10','颜色','动物','水果','食物','家庭','学校','交通'],
  default: ['Topik 1','Topik 2','Topik 3','Topik 4','Topik 5','Topik 6','Topik 7','Topik 8','Topik 9','Topik 10'],
};

async function generateQuestionsForGame(base44, gameTitle, topicName, subject, ageGroup, questionsCount, existingTitles) {
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

  const alreadyMade = existingTitles && existingTitles.length > 0
    ? `\nElakkan soalan yang SAMA dengan games sedia ada: ${existingTitles.slice(-5).join(', ')}`
    : '';

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `Buat TEPAT ${questionsCount} soalan UNIK & BERBEZA untuk:
Tajuk: "${gameTitle}"
Topik KHUSUS: "${topicName}"
Subjek: ${CATEGORY_LABELS[subject] || subject} | Peringkat: ${AGE_LABELS[ageGroup] || ageGroup}
${alreadyMade}

WAJIB ikut:
1. Semua soalan MESTI tentang topik "${topicName}" sahaja — fokus dan konsisten
2. Setiap soalan subtopik BERBEZA dalam topik yang sama
3. 4 pilihan jawapan yang jelas dan berbeza antara satu sama lain
4. Bahasa Malaysia yang betul dan mudah difahami kanak-kanak
5. Emoji BERBEZA setiap soalan (pilih dari: ${emoji.slice(0, 12).join(' ')})
6. Jawapan betul mesti 100% tepat secara fakta

Output JSON "questions" dengan: problem, options[4], answer(0-3), emoji`,
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

    // Get topics pool for this subject
    const topics = TOPIC_POOLS[task.subject] || TOPIC_POOLS.default;

    // Get existing game titles to avoid duplication
    const existingGames = await base44.asServiceRole.entities.Game.filter({ ageGroup: task.ageGroup, category: task.subject });
    const existingTitles = existingGames.map(g => g.title);

    for (let i = alreadyCreated; i < batchEnd; i++) {
      const gameType = GAME_TYPES[i % GAME_TYPES.length];
      // Pick a unique topic by cycling through the pool
      const topicIdx = (alreadyCreated + createdInBatch) % topics.length;
      const topicName = topics[topicIdx];
      const gameTitle = `${CATEGORY_LABELS[task.subject] || task.taskName} — ${topicName}`;

      try {
        const questions = await generateQuestionsForGame(base44, gameTitle, topicName, task.subject, task.ageGroup, task.questionsPerGame, existingTitles);

        if (!questions || questions.length === 0) {
          console.error(`Skip ${gameTitle} — no questions`);
          createdInBatch++;
          continue;
        }

        // Refetch latest order
        const latestExisting = await base44.asServiceRole.entities.Game.filter({ ageGroup: task.ageGroup, category: task.subject });

        // Tag with current month for rotation (format: 'YYYY-MM')
        const now = new Date();
        const monthTag = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

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
          order: latestExisting.length,
          monthTag,
        });

        existingTitles.push(gameTitle); // track for next iteration
        createdInBatch++;
        console.log(`"${task.taskName}" [${topicName}]: ${alreadyCreated + createdInBatch}/${totalNeeded} done`);

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