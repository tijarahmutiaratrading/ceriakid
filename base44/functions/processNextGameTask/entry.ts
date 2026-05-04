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

  const languageRule = subject === 'english'
    ? 'Gunakan English yang mudah, natural dan sesuai tahap murid Malaysia.'
    : subject === 'bahasa_tamil' || subject === 'bahasa_mandarin'
      ? 'Gunakan bahasa subjek yang betul, ringkas dan mesra kanak-kanak; arahan boleh dwibahasa BM ringkas jika perlu.'
      : 'Gunakan Bahasa Malaysia baku yang betul, mudah dan mesra kanak-kanak.';

  const bannedPattern = /(hewan|singh|bekam|\blama\b|\bbabi\b|turtle|kodok|kelinci|daki|moo|woof|roar|rindu|semangat ketua|bintang di badannya|rongga hidung|terpanjang di dunia|jangan lupa|dua jenis rupa|haiwan apa|apakah nama haiwan ini|sering dibela|soalan\s*\d+|placeholder|contoh jawapan|lihat gambar|gambar di bawah)/i;
  const cleanQuestions = (items) => (items || [])
    .filter(q => q?.problem && q.options?.length === 4 && Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= 3)
    .map(q => ({ problem: String(q.problem).trim(), options: q.options.map(o => String(o).trim()), answer: q.answer, emoji: String(q.emoji || '🎮').trim() }))
    .filter(q => q.problem.length >= 8 && q.options.every(Boolean) && new Set(q.options.map(o => o.toLowerCase())).size === 4)
    .filter(q => !bannedPattern.test([q.problem, ...q.options].join(' ')));

  const askLLM = async (needed, extraInstruction = '') => base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `Anda ialah guru pakar KSSR/DSKP Malaysia dan pembina game pembelajaran kanak-kanak.

Buat TEPAT ${needed} soalan game yang HIGH QUALITY, UNIK & BERBEZA untuk:
Tajuk: "${gameTitle}"
Topik KHUSUS: "${topicName}"
Subjek: ${CATEGORY_LABELS[subject] || subject}
Peringkat: ${AGE_LABELS[ageGroup] || ageGroup}
${alreadyMade}
${extraInstruction}

WAJIB ikut standard mass production ini:
1. Selari KSSR/DSKP Malaysia dan sesuai umur — prasekolah mesti sangat asas, jelas dan literal; sekolah rendah boleh sedikit mencabar tetapi masih tepat.
2. Semua soalan MESTI fokus topik "${topicName}" sahaja.
3. Gunakan konteks Malaysia yang biasa dilihat murid: rumah, sekolah, taman, pasar, keluarga, haiwan/benda harian.
4. ${languageRule}
5. Untuk Bahasa Melayu, WAJIB Bahasa Melayu Malaysia baku. DILARANG guna bahasa Indonesia/asing seperti "hewan", "Singh", "lama" untuk llama, atau ayat pelik.
6. Soalan mesti pendek, natural, fakta tepat, tidak berbentuk teka-teki kabur, tidak mengelirukan, dan tiada pilihan jawapan sensitif.
7. 4 pilihan jawapan mesti munasabah, unik, hanya satu jawapan betul, dan answer index mesti tepat.
8. Emoji mesti relevan dengan topik umum sahaja; jangan jadikan emoji sebagai petunjuk jawapan jika boleh mengelirukan.
9. Jangan guna placeholder seperti "Soalan 1", "Item", "Gambar di bawah", atau arahan yang perlukan gambar tetapi tiada gambar.

Output JSON sahaja: "questions" dengan problem, options[4], answer(0-3), emoji.`,
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

  const first = await askLLM(questionsCount);
  let questions = cleanQuestions(first.questions);

  if (questions.length < questionsCount) {
    const topup = await askLLM(questionsCount - questions.length, `\nSoalan sebelumnya ada yang ditolak audit. Jana soalan tambahan yang lebih mudah, literal dan bebas kesilapan. Jangan ulang: ${questions.map(q => q.problem).join(' | ')}`);
    questions = [...questions, ...cleanQuestions(topup.questions)];
  }

  const reviewed = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `Semak dan baiki senarai soalan ini untuk standard mass production CeriaKid.

Konteks:
- Subjek: ${CATEGORY_LABELS[subject] || subject}
- Peringkat: ${AGE_LABELS[ageGroup] || ageGroup}
- Topik: ${topicName}

Tugas anda:
1. Pulangkan TEPAT ${questionsCount} soalan terbaik.
2. Betulkan semua jawapan salah, pilihan jawapan pelik, bahasa rojak, bahasa Indonesia/Inggeris yang tidak sesuai, dan fakta meragukan.
3. Untuk Bahasa Melayu, guna BM Malaysia baku sahaja: contoh "arnab" bukan "kelinci", "kura-kura" bukan "turtle", "katak" bukan "kodok".
4. Soalan mesti literal, mudah, natural, dan sesuai kanak-kanak; elakkan frasa pelik seperti "semangat ketua", "daki", "dua jenis rupa", "rongga hidung".
5. Pastikan answer index sepadan dengan jawapan betul.

Soalan asal JSON:
${JSON.stringify(questions.slice(0, questionsCount))}

Output JSON sahaja: questions[{problem, options[4], answer, emoji}]`,
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

  const finalQuestions = cleanQuestions(reviewed.questions);
  return (finalQuestions.length >= questionsCount ? finalQuestions : questions).slice(0, questionsCount);
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

    const miniGameMap = {
      memory: { title: 'Memory Game', type: 'memory_game', emoji: '🧠' },
      dragdrop: { title: 'Drag & Drop Game', type: 'drag_drop', emoji: '🎯' },
      wordbuilder: { title: 'Word Builder Game', type: 'word_builder', emoji: '📝' },
      sorting: { title: 'Sorting Game', type: 'sorting', emoji: '🔄' },
      tilematch: { title: 'Tile Match Game', type: 'tile_match', emoji: '🎮' },
      story: { title: 'Story Adventure Game', type: 'story_adventure', emoji: '📖' },
      physics: { title: 'Physics Game', type: 'physics', emoji: '⚡' },
      tracing: { title: 'Tracing Game', type: 'tracing', emoji: '✏️' },
    };

    const buildMiniGameData = (mode, index) => {
      const sets = {
        memory: { mode, pairs: [['A', 'Apple'], ['B', 'Ball'], ['C', 'Cat'], ['D', 'Dog']], theme: 'letters' },
        dragdrop: { mode, items: ['Epal', 'Bola', 'Kucing', 'Ikan'], targets: ['Buah', 'Mainan', 'Haiwan', 'Haiwan'], instruction: 'Seret item ke kategori yang betul.' },
        wordbuilder: { mode, words: ['makan', 'buku', 'bola', 'rumah'], letters: ['m','a','k','n','b','u','o','l','r','h'], instruction: 'Bina perkataan mudah.' },
        sorting: { mode, items: [{ text: '2', group: 'Nombor' }, { text: 'A', group: 'Huruf' }, { text: '5', group: 'Nombor' }, { text: 'B', group: 'Huruf' }], groups: ['Nombor', 'Huruf'] },
        tilematch: { mode, tiles: ['🐱', '🐱', '🐶', '🐶', '🍎', '🍎', '⭐', '⭐'], instruction: 'Padankan jubin yang sama.' },
        story: { mode, scenes: [{ text: 'Ali jumpa anak kucing di taman.', choices: ['Bantu kucing', 'Tinggalkan'], answer: 0 }, { text: 'Ali beri air kepada kucing.', choices: ['Bagus', 'Tidak baik'], answer: 0 }] },
        physics: { mode, challenges: [{ question: 'Objek berat jatuh ke bawah kerana apa?', options: ['Graviti', 'Angin', 'Cahaya', 'Bunyi'], answer: 0 }] },
        tracing: { mode, letters: ['A', 'B', 'C', '1', '2', '3'], instruction: 'Surih huruf dan nombor dengan kemas.' },
      };
      return { ...(sets[mode] || { mode }), variant: index + 1 };
    };

    const miniGame = miniGameMap[task.subject];
    if (miniGame) {
      const existingMini = await base44.asServiceRole.entities.Game.filter({ category: task.subject });
      for (let i = alreadyCreated; i < batchEnd; i++) {
        await base44.asServiceRole.entities.Game.create({
          title: `${miniGame.title} ${existingMini.length + i + 1}`,
          type: miniGame.type,
          category: task.subject,
          ageGroup: task.ageGroup || 'sekolah_rendah',
          difficulty: i % 3 === 0 ? 'easy' : i % 3 === 1 ? 'medium' : 'hard',
          tier: 'free',
          emoji: miniGame.emoji,
          totalQuestions: 1,
          gameData: buildMiniGameData(task.subject, i),
          isPublished: true,
          status: 'ready',
          order: existingMini.length + i,
        });
        createdInBatch++;
      }

      const newTotal = alreadyCreated + createdInBatch;
      const isDone = newTotal >= totalNeeded;
      await base44.asServiceRole.entities.GameTask.update(task.id, {
        status: isDone ? 'completed' : 'pending',
        createdGames: newTotal,
        ...(isDone ? { completedAt: new Date().toISOString() } : {}),
      });
      return Response.json({ success: true, taskName: task.taskName, createdGames: newTotal, totalGames: totalNeeded, isDone });
    }

    const sanitizeExistingQuestions = (questions = []) => {
      const bannedPattern = /(hewan|singh|bekam|\blama\b|\bbabi\b|turtle|kodok|kelinci|daki|moo|woof|roar|rindu|semangat ketua|bintang di badannya|rongga hidung|terpanjang di dunia|jangan lupa|dua jenis rupa|haiwan apa|apakah nama haiwan ini|sering dibela|soalan\s*\d+|placeholder|contoh jawapan|lihat gambar|gambar di bawah)/i;
      return questions
        .filter(q => q?.problem && Array.isArray(q.options) && q.options.length === 4 && Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= 3)
        .filter(q => new Set(q.options.map(o => String(o).trim().toLowerCase())).size === 4)
        .filter(q => !bannedPattern.test([q.problem, ...q.options].join(' ')));
    };

    const existingGames = await base44.asServiceRole.entities.Game.filter({ ageGroup: task.ageGroup, category: task.subject });
    const underfilledGames = existingGames.filter(g => sanitizeExistingQuestions(g.gameData?.questions || []).length < task.questionsPerGame);
    const totalWork = underfilledGames.length + (task.gamesCount || 0);

    const expandStart = Math.min(alreadyCreated, underfilledGames.length);
    const expandBatch = underfilledGames.slice(expandStart, expandStart + 3);
    if (expandBatch.length > 0) {
      for (const game of expandBatch) {
        const existingClean = sanitizeExistingQuestions(game.gameData?.questions || []);
        const missing = task.questionsPerGame - existingClean.length;
        const generated = await generateQuestionsForGame(base44, game.title, game.title, task.subject, task.ageGroup, missing, existingClean.map(q => q.problem));
        const questions = [...existingClean, ...generated].slice(0, task.questionsPerGame);
        await base44.asServiceRole.entities.Game.update(game.id, { totalQuestions: questions.length, gameData: { ...game.gameData, questions } });
        createdInBatch++;
      }

      const newTotal = alreadyCreated + createdInBatch;
      const isDone = newTotal >= totalWork;
      await base44.asServiceRole.entities.GameTask.update(task.id, {
        status: isDone ? 'completed' : 'pending',
        createdGames: newTotal,
        ...(isDone ? { completedAt: new Date().toISOString() } : {}),
      });
      return Response.json({ success: true, taskName: task.taskName, progress: newTotal, totalWork, isDone });
    }

    // Get topics pool for this subject
    const topics = TOPIC_POOLS[task.subject] || TOPIC_POOLS.default;
    const latestGamesAfterExpand = await base44.asServiceRole.entities.Game.filter({ ageGroup: task.ageGroup, category: task.subject });
    const existingTitles = latestGamesAfterExpand.map(g => g.title);
    const createStart = Math.max(0, alreadyCreated - underfilledGames.length);
    const createEnd = Math.min(createStart + BATCH, task.gamesCount || 0);

    for (let i = createStart; i < createEnd; i++) {
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
    const finalTarget = typeof totalWork === 'number' ? totalWork : totalNeeded;
    const isDone = newTotal >= finalTarget;

    await base44.asServiceRole.entities.GameTask.update(task.id, {
      status: isDone ? 'completed' : 'pending', // reset to pending for next batch
      createdGames: newTotal,
      ...(isDone ? { completedAt: new Date().toISOString() } : {}),
    });

    console.log(`processNextGameTask: batch done. ${newTotal}/${finalTarget}. ${isDone ? 'COMPLETED' : 'More batches remaining.'}`);
    return Response.json({ success: true, taskName: task.taskName, createdGames: newTotal, totalGames: finalTarget, isDone });

  } catch (error) {
    console.error('processNextGameTask error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});