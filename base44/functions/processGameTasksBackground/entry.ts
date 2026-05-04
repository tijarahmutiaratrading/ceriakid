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
  'multiple_choice', 'picture_quiz', 'word_builder', 'counting', 'spelling', 'reading', 'science_quiz', 'math_puzzle',
];

const TOPIC_POOLS = {
  bahasa_melayu: ['Haiwan','Buah-buahan','Nombor','Warna','Hari & Bulan','Kata Nama Am','Kata Kerja','Kata Adjektif','Keluarga','Rumah','Sekolah','Makanan','Pakaian','Alam Sekitar','Peribahasa','Sajak','Cerita Pendek','Pantun','Tatabahasa','Sinonim'],
  english: ['Animals','Fruits','Colours','Numbers','Family','School','Food','Clothes','Nature','Action Words','Opposite Words','Phonics A-E','Phonics F-J','Phonics K-O','Phonics P-T','Phonics U-Z','Greetings','Body Parts','Weather','Transport'],
  mathematics: ['Tambah 1-10','Tolak 1-10','Tambah 11-20','Tolak 11-20','Pendaraban 2','Pendaraban 3','Pendaraban 4','Pendaraban 5','Pembahagian','Masa & Jam','Wang Ringgit','Pecahan Mudah','Bentuk 2D','Bentuk 3D','Ukuran Panjang','Berat','Isipadu','Susun Nombor','Nombor Genap Ganjil','Anggaran'],
  science: ['Haiwan Vertebrata','Haiwan Invertebrata','Tumbuhan','Kitaran Air','Cuaca','Sumber Alam','Tubuh Badan','Deria Lima','Jenis Makanan','Jirim & Bahan','Magnet','Cahaya','Bunyi','Gaya','Mudarat Alam Sekitar','Sistem Suria','Bintang & Bulan','Proses Foto','Adaptasi Haiwan','Ekosistem'],
  jawi: ['Huruf Alif-Ba','Huruf Ta-Tha','Huruf Jim-Kha','Huruf Dal-Zal','Huruf Ra-Zai','Huruf Sin-Shin','Ejaan Mudah','Perkataan Haiwan','Perkataan Makanan','Perkataan Warna'],
  bahasa_tamil: ['எழுத்துகள்','எண்கள்','நிறங்கள்','விலங்குகள்','பழங்கள்','உணவுகள்','குடும்பம்','பள்ளி','தாவரங்கள்','உடல் உறுப்புகள்'],
  bahasa_mandarin: ['拼音','数字','颜色','动物','水果','食物','家庭','学校','交通','身体'],
  default: ['Topik A','Topik B','Topik C','Topik D','Topik E','Topik F','Topik G','Topik H','Topik I','Topik J'],
};

async function generateGameQuestions(base44, gameTitle, topicName, subject, ageGroup, questionsCount, existingTitles) {
  const emojiOptions = {
    bahasa_melayu: '📚 📖 ✏️ 🔤 💬 🗣️ 📝 🎓 🌍 🐛 🌳 🐠 🏠 🚗 🍎 🎨',
    english: '🌟 📚 ✍️ 🔤 💬 📖 🎤 💭 🏆 🦁 🌸 🎸 ⚽ 🚀 👑 🎯',
    mathematics: '🔢 ➕ ➖ ✖️ ➗ 📐 📏 🧮 💯 ⭐ 🎲 📊 🧩 💎',
    science: '🔬 🧬 🧪 🌍 🌱 🦋 🔭 ⚗️ 🧊 🔥 💧 🌙 ⚡ 🌤️ 🌌',
    default: '🎮 🎯 🎪 🎨 🎭 🎬 🎤 🎸 🎲 🧩 ✨ 🌟 💫',
  };
  const availableEmoji = (emojiOptions[subject] || emojiOptions.default).split(' ');

  const alreadyMade = existingTitles && existingTitles.length > 0
    ? `\nELAK soalan sama dengan: ${existingTitles.slice(-4).join(', ')}`
    : '';

  const languageRule = subject === 'english'
    ? 'Use simple, natural English suitable for Malaysian pupils.'
    : subject === 'bahasa_tamil' || subject === 'bahasa_mandarin'
      ? 'Gunakan bahasa subjek yang betul dan mudah; arahan boleh dwibahasa BM ringkas jika perlu.'
      : 'Gunakan Bahasa Malaysia baku yang betul, mudah dan mesra kanak-kanak.';

  const prompt = `Anda ialah guru pakar KSSR/DSKP Malaysia dan pembina game pembelajaran kanak-kanak.

Buat TEPAT ${questionsCount} soalan game HIGH QUALITY dan UNIK untuk:
"${gameTitle}" — Topik KHUSUS: "${topicName}"
Subjek: ${CATEGORY_LABELS[subject] || subject}
Peringkat: ${AGE_LABELS[ageGroup] || ageGroup}
${alreadyMade}

WAJIB:
1. Selari KSSR/DSKP Malaysia dan sesuai umur — prasekolah sangat asas, sekolah rendah lebih mencabar tetapi jelas.
2. Semua soalan fokus topik "${topicName}" sahaja.
3. Setiap soalan uji konsep/subkemahiran berbeza.
4. ${languageRule}
5. Soalan pendek, tidak mengelirukan, tiada fakta meragukan.
6. 4 pilihan jawapan munasabah, tidak duplicate, hanya satu betul.
7. Jawapan betul mesti 100% tepat dan answer index mesti sepadan.
8. Emoji BERBEZA dan relevan dari: ${availableEmoji.join(' ')}.
9. Jangan guna placeholder atau ulang ayat yang sama.

Output JSON sahaja: "questions": problem, options[4], answer(0-3), emoji`;

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

      const topics = TOPIC_POOLS[subject] || TOPIC_POOLS.default;
      const existingGames = await base44.asServiceRole.entities.Game.filter({ ageGroup, category: subject });
      const existingTitles = existingGames.map(g => g.title);

      for (let i = 0; i < gamesCount; i++) {
        const gameType = GAME_TYPES[i % GAME_TYPES.length];
        const topicName = topics[(existingTitles.length + i) % topics.length];
        const gameTitle = `${CATEGORY_LABELS[subject] || taskName} — ${topicName}`;

        try {
          const questions = await generateGameQuestions(base44, gameTitle, topicName, subject, ageGroup, questionsPerGame, existingTitles);

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

          existingTitles.push(gameTitle);
          createdGames++;
          console.log(`Task [${taskId}]: Created ${createdGames}/${gamesCount} — ${gameTitle} [${topicName}]`);

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