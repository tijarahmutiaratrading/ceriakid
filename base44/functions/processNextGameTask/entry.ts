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
const DARJAH_LABELS = {
  darjah_1: 'Darjah 1', darjah_2: 'Darjah 2', darjah_3: 'Darjah 3',
  darjah_4: 'Darjah 4', darjah_5: 'Darjah 5', darjah_6: 'Darjah 6',
};

const KSSR_LEVEL_GUIDE = {
  darjah_1: 'Darjah 1: asas literasi/numerasi. BM/English: huruf, suku kata, perkataan mudah, ayat sangat pendek. Matematik: nombor 0-100, tambah/tolak mudah, bentuk asas, masa sangat asas. Sains: deria, anggota badan, haiwan/tumbuhan mudah, benda hidup/bukan hidup.',
  darjah_2: 'Darjah 2: bina ayat mudah dan kefahaman asas. Matematik: nombor hingga 1000, tambah/tolak, darab bahagi asas 2/5/10, wang dan masa mudah. Sains: haiwan, tumbuhan, manusia, kebersihan, bahan harian.',
  darjah_3: 'Darjah 3: kefahaman ringkas dan aplikasi mudah. Matematik: nombor hingga 10000, operasi asas, pecahan mudah, ukuran, wang dan masa. Sains: pengelasan haiwan/tumbuhan, magnet, cahaya, bunyi, sistem suria asas.',
  darjah_4: 'Darjah 4: konsep lebih tersusun tetapi masih jelas. Matematik: nombor besar, operasi bergabung mudah, pecahan/perpuluhan asas, ukuran. Sains: proses hidup, sifat bahan, tenaga, bumi dan alam sekitar asas.',
  darjah_5: 'Darjah 5: aplikasi dan penaakulan sederhana. Matematik: pecahan/perpuluhan/peratus, nisbah mudah, ruang, data. Sains: mikroorganisma, elektrik asas, haba, rantai makanan, teknologi mudah.',
  darjah_6: 'Darjah 6: pengukuhan UPSR/KSSR tahap 2. Matematik: penyelesaian masalah multi-langkah sederhana, peratus, purata, graf/data. Sains: penyiasatan saintifik, daya, mesin ringkas, ekosistem, bumi/angkasa secara asas.'
};

const getKssrGuide = (darjah) => darjah ? (KSSR_LEVEL_GUIDE[darjah] || '') : '';
const QC_GENERATOR_RULES = `
QUALITY CONTROL HARD RULES:
- Setiap game mesti lulus audit automatik: minimum 8 soalan valid untuk subject games, 4 options unik, answer index tepat 0-3.
- DILARANG placeholder, soalan generik, trivia rawak, soalan perlukan gambar, bahasa rojak, bahasa Indonesia tidak sesuai, atau fakta meragukan.
- DILARANG ulang soalan/pola merentas Darjah 1-6; setiap Darjah mesti jelas berbeza dari segi aras, nombor, kosa kata dan konteks.
- Untuk mini games, semua data mesti playable: ada target/answer/group yang boleh disemak automatik, bukan aktiviti kosong.
- Jika gagal rules ini, QC akan delete game dan queue replacement, jadi jana content clean dari awal.`;
const CORE_SUBJECTS = Object.keys(CATEGORY_LABELS);
const GAME_TYPES = ['multiple_choice','picture_quiz','word_builder','counting','spelling','reading','science_quiz','math_puzzle','phonics','letter_match'];

async function getQcLearningNotes(base44) {
  const logs = await base44.asServiceRole.entities.QCLog.list('-created_date', 8);
  const issueLines = (logs || [])
    .flatMap(log => Array.isArray(log.sampleIssues) ? log.sampleIssues : [])
    .slice(0, 12)
    .map(item => `- ${item.title || item.category || 'Content'}: ${(item.issues || []).join(', ')}`)
    .filter(line => line.trim().length > 4);
  if (issueLines.length === 0) return '';
  return `\nQC LEARNING MEMORY - JANGAN ULANG KESILAPAN INI:\n${issueLines.join('\n')}\nJika isu sama berulang, content akan dipadam dan di-queue semula oleh QC.`;
}

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

async function generateQuestionsForGame(base44, gameTitle, topicName, subject, ageGroup, questionsCount, existingTitles, darjah = null, qcLearningNotes = '') {
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
  const kssrGuide = getKssrGuide(darjah);

  const languageRule = subject === 'english'
    ? 'WAJIB guna English sahaja untuk problem, options dan jawapan. Jangan guna Bahasa Melayu kecuali nama tempat/nama orang Malaysia.'
    : subject === 'bahasa_tamil'
      ? 'WAJIB guna Bahasa Tamil sahaja untuk problem, options dan jawapan. Jangan terjemah soalan ke Bahasa Melayu.'
      : subject === 'bahasa_mandarin'
        ? 'WAJIB guna Bahasa Mandarin/Chinese sahaja untuk problem, options dan jawapan. Jangan terjemah soalan ke Bahasa Melayu.'
        : 'Gunakan Bahasa Malaysia baku yang betul, mudah dan mesra kanak-kanak.';

  const exactDarjahRule = ageGroup === 'sekolah_rendah' && darjah
    ? `WAJIB tepat untuk ${DARJAH_LABELS[darjah] || darjah} sahaja. Jangan jana soalan terlalu mudah seperti tahap Darjah lebih rendah, dan jangan jana soalan terlalu tinggi seperti tahap Darjah lebih atas. Jika topik sama wujud di beberapa darjah, guna aras kemahiran, nombor, kosa kata dan konteks yang sepadan dengan ${DARJAH_LABELS[darjah] || darjah}.`
    : 'Untuk prasekolah, kekalkan sangat asas dan tidak bercampur silibus sekolah rendah.';

  const bannedPattern = /(hewan|singh|bekam|\blama\b|\bbabi\b|turtle|kodok|kelinci|daki|moo|woof|roar|rindu|semangat ketua|bintang di badannya|rongga hidung|terpanjang di dunia|jangan lupa|dua jenis rupa|haiwan apa|apakah nama haiwan ini|sering dibela|dua telinga panjang dan sangat comel|badan kecil dan suka berlari-lari|boleh terbang di taman|berbulu yang sering dipelihara|soalan\s*\d+|placeholder|contoh jawapan|lihat gambar|gambar di bawah|copy|salinan|umum sahaja)/i;
  const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu;
  const neutralEmoji = subject === 'bahasa_tamil' ? '🌺' : subject === 'bahasa_mandarin' ? '🏮' : subject === 'jawi' ? '🕌' : null;
  const cleanQuestions = (items) => (items || [])
    .filter(q => q?.problem && q.options?.length === 4)
    .map(q => {
      const answer = Math.round(Number(q.answer));
      return {
        problem: String(q.problem).replace(emojiRegex, '').replace(/\s+/g, ' ').trim(),
        options: q.options.map(o => String(o).replace(emojiRegex, '').replace(/\s+/g, ' ').trim()),
        answer,
        emoji: neutralEmoji || String(q.emoji || '🎮').trim(),
      };
    })
    .filter(q => Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= 3)
    .filter(q => q.problem.length >= 8 && q.options.every(Boolean) && new Set(q.options.map(o => o.toLowerCase())).size === 4)
    .filter(q => !bannedPattern.test([q.problem, ...q.options].join(' ')));

  const askLLM = async (needed, extraInstruction = '') => base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `Anda ialah guru pakar KSSR/DSKP Malaysia dan pembina game pembelajaran kanak-kanak.

Buat TEPAT ${needed} soalan game yang HIGH QUALITY, UNIK & BERBEZA untuk:
Tajuk: "${gameTitle}"
Topik KHUSUS: "${topicName}"
Subjek: ${CATEGORY_LABELS[subject] || subject}
Peringkat: ${darjah ? `${DARJAH_LABELS[darjah] || darjah} (${AGE_LABELS[ageGroup] || ageGroup})` : (AGE_LABELS[ageGroup] || ageGroup)}
${kssrGuide ? `Panduan KSSR tahap ini: ${kssrGuide}` : ''}
${exactDarjahRule}
${alreadyMade}
${extraInstruction}

${QC_GENERATOR_RULES}
${qcLearningNotes}

WAJIB ikut standard mass production ini:
0. Platform ini HANYA untuk Prasekolah dan Sekolah Rendah Darjah 1-6. DILARANG jana kandungan Tingkatan, PT3, SPM, sekolah menengah, atau silibus luar tahap ini.
1. Selari KSSR/DSKP Malaysia dan sesuai umur — prasekolah mesti sangat asas, jelas dan literal; sekolah rendah boleh sedikit mencabar tetapi masih tepat.
2. Semua soalan MESTI fokus topik "${topicName}" sahaja.
3. Gunakan konteks Malaysia yang biasa dilihat murid: rumah, sekolah, taman, pasar, keluarga, haiwan/benda harian.
4. ${languageRule}
5. Untuk Bahasa Melayu, WAJIB Bahasa Melayu Malaysia baku. DILARANG guna bahasa Indonesia/asing seperti "hewan", "Singh", "lama" untuk llama, atau ayat pelik.
6. Soalan mesti pendek, natural, fakta tepat, tidak berbentuk teka-teki kabur, tidak mengelirukan, dan tiada pilihan jawapan sensitif.
7. 4 pilihan jawapan mesti munasabah, unik, hanya satu jawapan betul, dan answer index mesti tepat.
8. JANGAN masukkan emoji dalam problem/options. Emoji hanya dalam field emoji.
  9. Untuk Bahasa Tamil, Bahasa Mandarin dan Jawi, guna emoji neutral subjek sahaja supaya tidak tersalah petunjuk jawapan.
  10. Jangan guna placeholder seperti "Soalan 1", "Item", "Gambar di bawah", atau arahan yang perlukan gambar tetapi tiada gambar.
  11. Jangan ulang pola soalan yang sama; setiap soalan mesti menguji kemahiran berbeza dalam topik ini.
  12. Untuk Darjah 1-6, WAJIB ikut tahap KSSR yang diberi. Jangan jana soalan terlalu tinggi/rendah, fakta luar silibus, trivia rawak, atau soalan 'merepek' yang tidak menguji kemahiran subjek.
  13. Untuk Sekolah Rendah, jangan pindahkan aras Darjah: Darjah 1 mesti asas, Darjah 6 mesti tahap pengukuhan; setiap soalan mesti jelas sesuai dengan darjah yang diminta sahaja.
  14. Jika topik sama wujud untuk Darjah lain, JANGAN guna soalan definisi umum seperti "Apakah maksud..." berulang. Guna situasi, nombor, kosa kata dan kemahiran khusus yang membezakan ${DARJAH_LABELS[darjah] || darjah}.

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
- Peringkat: ${darjah ? `${DARJAH_LABELS[darjah] || darjah} (${AGE_LABELS[ageGroup] || ageGroup})` : (AGE_LABELS[ageGroup] || ageGroup)}
- Panduan KSSR tahap: ${kssrGuide || 'Ikut tahap umur yang dinyatakan'}
- Peraturan tepat darjah: ${exactDarjahRule}
- Topik: ${topicName}

Tugas anda:
1. Pulangkan TEPAT ${questionsCount} soalan terbaik.
2. Betulkan semua jawapan salah, pilihan jawapan pelik, bahasa rojak, bahasa Indonesia/Inggeris yang tidak sesuai, dan fakta meragukan.
3. Untuk English, semua problem/options/jawapan mesti dalam English sahaja.
4. Untuk Bahasa Tamil, semua problem/options/jawapan mesti dalam Tamil sahaja.
5. Untuk Bahasa Mandarin, semua problem/options/jawapan mesti dalam Mandarin/Chinese sahaja.
6. Untuk Bahasa Melayu, guna BM Malaysia baku sahaja: contoh "arnab" bukan "kelinci", "kura-kura" bukan "turtle", "katak" bukan "kodok".
7. Soalan mesti literal, mudah, natural, dan sesuai kanak-kanak; elakkan frasa pelik/panjang seperti "semangat ketua", "daki", "dua jenis rupa", "rongga hidung", "dua telinga panjang dan sangat comel", atau "badan kecil dan suka berlari-lari".
8. Buang semua emoji daripada problem/options; emoji hanya dibenarkan dalam field emoji.
9. Untuk Tamil, Mandarin dan Jawi, guna emoji neutral subjek sahaja, bukan emoji haiwan/buah/benda yang boleh trigger mismatch.
10. Pastikan answer index sepadan dengan jawapan betul.
11. Jika Darjah 1-6, pastikan setiap soalan benar-benar selari KSSR tahap tersebut; buang trivia rawak, soalan luar topik, atau kandungan terlalu tinggi/rendah.
12. Elakkan soalan definisi generic yang boleh sama untuk Darjah lain; wajib guna konteks dan aras khusus Darjah yang diminta.

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
  if (ageGroup === 'sekolah_rendah' && darjah && finalQuestions.length < questionsCount) {
    console.warn(`KSSR audit kept only ${finalQuestions.length}/${questionsCount} questions for ${darjah} ${subject} ${topicName}`);
  }
  return (finalQuestions.length >= questionsCount ? finalQuestions : questions).slice(0, questionsCount);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Reset stuck running tasks first, then continue active task or fetch pending tasks
    const running = await base44.asServiceRole.entities.GameTask.filter({ status: 'running' });
    const activeRunning = [];
    for (const t of running) {
      const startedAt = new Date(t.startedAt || t.updated_date || t.created_date);
      const minutesAgo = (Date.now() - startedAt.getTime()) / 60000;
      if (minutesAgo > 10) {
        try {
          await base44.asServiceRole.entities.GameTask.update(t.id, { status: 'pending' });
        } catch (err) {
          console.warn(`Skip stale running task ${t.id}: ${err.message}`);
        }
      } else {
        activeRunning.push(t);
      }
    }

    const pending = activeRunning.length > 0
      ? activeRunning
      : await base44.asServiceRole.entities.GameTask.filter({ status: 'pending' });

    if (!pending || pending.length === 0) {
      console.log('processNextGameTask: No pending tasks.');
      return Response.json({ success: true, message: 'No pending tasks' });
    }

    // Continue running tasks first, then prioritize Story Kid, then oldest first
    pending.sort((a, b) => {
      if (a.status === 'running' && b.status !== 'running') return -1;
      if (a.status !== 'running' && b.status === 'running') return 1;
      if (a.subject === 'storykid' && b.subject !== 'storykid') return -1;
      if (a.subject !== 'storykid' && b.subject === 'storykid') return 1;
      return new Date(a.created_date) - new Date(b.created_date);
    });
    const task = pending[0];

    if (task.ageGroup === 'sekolah_rendah' && CORE_SUBJECTS.includes(task.subject) && !task.darjah) {
      await base44.asServiceRole.entities.GameTask.update(task.id, {
        status: 'failed',
        errorMessage: 'Sekolah Rendah subject game mesti ada darjah_1 hingga darjah_6 supaya silibus tidak bercampur.',
        completedAt: new Date().toISOString(),
      });
      return Response.json({ error: 'Missing darjah for Sekolah Rendah subject task' }, { status: 400 });
    }

    const alreadyCreated = task.createdGames || 0;
    const totalNeeded = task.gamesCount;
    const qcLearningNotes = await getQcLearningNotes(base44);
    const BATCH = 1; // smaller reliable batches; staggered automations run this more often
    const batchEnd = Math.min(alreadyCreated + BATCH, totalNeeded);

    console.log(`processNextGameTask: "${task.taskName}" — batch ${alreadyCreated + 1} to ${batchEnd} of ${totalNeeded}`);

    // Mark as running
    await base44.asServiceRole.entities.GameTask.update(task.id, {
      status: 'running',
      startedAt: new Date().toISOString(),
    });

    let createdInBatch = 0;

    const miniGameMap = {
      abc_phonics: { title: 'ABC & Phonics', type: 'phonics', emoji: '🔤', modes: ['balloon_pop', 'tracing', 'dragdrop'] },
      math_counting: { title: 'Math & Counting', type: 'counting', emoji: '🔢', modes: ['falling_catch', 'stacking', 'sequence'] },
      creative_arts: { title: 'Creative Arts', type: 'picture_quiz', emoji: '🎨', modes: ['coloring', 'rhythm_tap', 'dragdrop'] },
      english_vocabulary: { title: 'English Vocabulary', type: 'picture_quiz', emoji: '🌟', modes: ['picture_hunt', 'typing_challenge', 'tilematch'] },
      sains_awal: { title: 'Sains Awal', type: 'science_quiz', emoji: '🔬', modes: ['sorting', 'mini_simulation', 'true_false'] },
      jawi_iqra: { title: 'Jawi & Iqra', type: 'memory_game', emoji: '🕌', modes: ['memory', 'rhythm_tap', 'connect_dots'] },
      memory_logic: { title: 'Memory & Logic', type: 'memory_game', emoji: '🧠', modes: ['maze', 'hidden_object', 'reaction_speed'] },
      islamic_learning: { title: 'Islamic Learning', type: 'story_adventure', emoji: '🌙', modes: ['story', 'sequence', 'true_false'] },
    };

    const storybookStyleReference = 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/580d3db6a_IMG_0482.jpeg';
    const buildStoryImagePrompt = (story, scene, index, type = 'scene') => `Create a premium kids storybook illustration like a polished Canva children's book: bright magical forest/book-page style, cute expressive child character, friendly animals where relevant, cinematic warm sunlight, rich colorful background, glossy 3D cartoon digital painting, professional printed storybook quality, clean composition, child-safe, high detail.
Story title: ${story.title}.
Scene ${index + 1}: ${scene?.text || story.moral}
Moral/theme: ${story.moral}.
${type === 'cover' ? 'Make it a vertical front book cover illustration with the main character centered and strong storybook cover composition.' : 'Make it a full-page inner storybook illustration with clear action, emotion, and room at the bottom for app text overlay.'}
Important: illustration only, no readable words, no letters, no watermark, no logo, no UI, no speech bubbles.`;

    const buildMiniGameData = async (base44, mode, index, theme, itemsPerSet, level, existingMini = [], qcLearningNotes = '') => {
      const difficultyLabel = level <= 1 ? 'mudah' : level === 2 ? 'sederhana' : 'mencabar';
      const variationAngles = [
        'situasi bilik darjah Malaysia', 'aktiviti rumah dan keluarga', 'pasar dan wang harian',
        'alam sekitar tempatan', 'haiwan dan tumbuhan Malaysia', 'sukan dan permainan kanak-kanak',
        'makanan dan budaya Malaysia', 'keselamatan dan nilai murni', 'cuaca dan alam semula jadi',
        'pengangkutan dan komuniti', 'cerita mini berwatak kanak-kanak', 'cabaran logik mudah'
      ];
      const playStylesByMode = {
        memory: ['padan pasangan nilai-maksud', 'ingat urutan kad', 'cari kad hilang', 'padan kategori', 'padan situasi-jawapan', 'cabaran pilih pasangan paling sesuai'],
        dragdrop: ['seret item ke kategori', 'susun langkah ikut turutan', 'padan objek ke tempat', 'asingkan betul dan salah', 'lengkapkan jadual mini', 'pilih item untuk misi cerita'],
        wordbuilder: ['bina perkataan daripada suku kata', 'susun huruf bersepah', 'lengkapkan huruf hilang', 'bina frasa pendek', 'padan bunyi kepada perkataan', 'cabaran ejaan berpetunjuk'],
        sorting: ['kumpul ikut kategori', 'susun dari kecil ke besar', 'asingkan fakta betul/salah', 'susun ikut proses', 'kelaskan contoh dan bukan contoh', 'susun mengikut tempat kegunaan'],
        tilematch: ['padan jubin sama maksud', 'padan gambar-perkataan', 'padan soalan-jawapan', 'padan lawan kata', 'padan nombor-kuantiti', 'padan sebab-akibat'],
        story: ['pilih tindakan terbaik', 'pilih sambungan cerita', 'pilih nilai murni', 'selesaikan masalah watak', 'pilih dialog sopan', 'pilih akibat tindakan'],
        physics: ['ramal apa berlaku', 'pilih alat yang sesuai', 'susun eksperimen ringkas', 'bezakan kuat/lemah', 'pilih sebab saintifik', 'selesaikan cabaran objek harian'],
        tracing: ['surih huruf besar', 'surih huruf kecil', 'surih nombor', 'surih suku kata', 'surih bentuk asas', 'surih pola berulang'],
        balloon_pop: ['pop huruf sasaran', 'pop bunyi awal', 'pop suku kata betul', 'pop nombor disebut'],
        falling_catch: ['tangkap nombor sasaran', 'tangkap kuantiti betul', 'tangkap jawapan kiraan mudah'],
        stacking: ['bina menara ikut jumlah', 'susun blok nombor', 'cukupkan bilangan objek'],
        sequence: ['susun turutan nombor', 'susun langkah harian', 'susun proses mudah'],
        swipe_select: ['asingkan kata nama/kata kerja', 'pilih kumpulan betul', 'bezakan contoh dan bukan contoh'],
        spin_wheel: ['padankan rima', 'pilih perkataan sepadan', 'putar dan jawab cepat'],
        picture_hunt: ['cari perkataan sasaran', 'cari objek tersembunyi', 'pilih gambar betul'],
        hidden_object: ['cari objek tersembunyi', 'fokus cari simbol sasaran', 'pilih item dalam gambar'],
        typing_challenge: ['taip perkataan mudah', 'lengkapkan ejaan pendek', 'latih kosa kata'],
        mini_simulation: ['uji objek tertarik magnet', 'pilih bahan betul', 'simulasi sebab-akibat mudah'],
        true_false: ['pilih betul atau salah', 'semak fakta mudah', 'bezakan kenyataan tepat'],
        rhythm_tap: ['tap ikut rentak huruf', 'tap suku kata berulang', 'ikut pola bacaan'],
        connect_dots: ['sambung titik huruf', 'sambung nombor berturutan', 'lengkapkan bentuk'],
        maze: ['cari laluan ke bintang', 'pilih arah selamat', 'selesaikan laluan mudah'],
        reaction_speed: ['tap bila warna berubah', 'latih fokus cepat', 'respon isyarat visual'],
        coloring: ['warnakan simbol nilai', 'pilih ikon untuk diwarnakan', 'aktiviti tenang bertema'],
      };
      const playStyles = playStylesByMode[mode] || ['aktiviti unik'];
      const playStyle = playStyles[index % playStyles.length];
      const microTopic = `${theme} · ${variationAngles[index % variationAngles.length]} · ${playStyle} · siri ${index + 1}`;
      const recentExamples = existingMini.slice(-12).map(g => ({ title: g.title, data: JSON.stringify(g.gameData || {}).slice(0, 260) }));
      const gameGuides = {
        memory: 'Pasangan padanan ingatan. Output pairs sebagai array [depan, belakang].',
        dragdrop: 'Aktiviti seret dan lepas. Output items dan targets dengan panjang sama.',
        wordbuilder: 'Bina perkataan. Output words dan letters yang cukup untuk membina perkataan.',
        sorting: 'Susun mengikut kumpulan. Output groups dan items dengan field text + group.',
        tilematch: 'Padankan jubin sama. Output tiles berpasangan, jumlah genap.',
        story: 'Cerita pilihan nilai murni. Output scenes dengan text, choices[2], answer.',
        physics: 'Cabaran sains/fizik mudah. Output challenges dengan question, options[4], answer.',
        tracing: 'Latihan surih huruf/nombor/simbol. Output letters dan instruction.',
        balloon_pop: 'Pop item sasaran. Output target string dan items array string. Items WAJIB ada target sekurang-kurangnya 2 kali dengan ejaan sama tepat supaya belon boleh di-pop.',
        falling_catch: 'Tangkap item sasaran. Output target string dan items array string. Items WAJIB ada target sekurang-kurangnya 2 kali dengan ejaan sama tepat supaya objek boleh ditangkap.',
        stacking: 'Bina menara ikut jumlah. Output target nombor 3-10.',
        sequence: 'Susun turutan. Output items rawak dan answer turutan betul.',
        swipe_select: 'Pilih kumpulan betul. Output items dengan text dan group, guna dua kumpulan sahaja.',
        spin_wheel: 'Putar roda padanan. Output target dan items yang sesuai untuk dipilih.',
        picture_hunt: 'Cari gambar/emoji berdasarkan perkataan sasaran. Output target string dan items array object {text, value}; text mesti emoji/gambar ringkas untuk dipaparkan, value mesti jawapan/perkataan. Sekurang-kurangnya satu item value sama tepat dengan target.',
        hidden_object: 'Cari objek tersembunyi. Output target string dan items array object {text, value}; text mesti emoji/simbol visual untuk dipaparkan, value mesti nama objek. Sekurang-kurangnya satu item value sama tepat dengan target.',
        typing_challenge: 'Taip perkataan sasaran. Output target satu perkataan pendek.',
        mini_simulation: 'Simulasi sains mudah. Output target dan items dengan text + group.',
        true_false: 'Fakta betul/salah. Output statements dengan text dan answer boolean.',
        rhythm_tap: 'Tap rentak. Output items sebagai huruf/suku kata pendek.',
        connect_dots: 'Sambung titik. Output items sebagai nombor/huruf berturutan.',
        maze: 'Maze ringkas. Output instruction sahaja; jangan perlukan imej luar.',
        reaction_speed: 'Latihan respon cepat. Output instruction sahaja.',
        coloring: 'Aktiviti mewarna ikon. Output items sebagai emoji/simbol selamat.',
      };

      const baseProps = {
        title: { type: 'string' },
        microTopic: { type: 'string' },
        playStyle: { type: 'string' },
        instruction: { type: 'string' },
      };
      const schemaByMode = {
        memory: { type: 'object', properties: { ...baseProps, pairs: { type: 'array', items: { type: 'array', items: { type: 'string' } } } }, required: ['title', 'microTopic', 'instruction', 'pairs'] },
        dragdrop: { type: 'object', properties: { ...baseProps, items: { type: 'array', items: { type: 'string' } }, targets: { type: 'array', items: { type: 'string' } } }, required: ['title', 'microTopic', 'instruction', 'items', 'targets'] },
        wordbuilder: { type: 'object', properties: { ...baseProps, words: { type: 'array', items: { type: 'string' } }, letters: { type: 'array', items: { type: 'string' } } }, required: ['title', 'microTopic', 'instruction', 'words', 'letters'] },
        sorting: { type: 'object', properties: { ...baseProps, groups: { type: 'array', items: { type: 'string' } }, items: { type: 'array', items: { type: 'object', properties: { text: { type: 'string' }, group: { type: 'string' } }, required: ['text', 'group'] } } }, required: ['title', 'microTopic', 'instruction', 'groups', 'items'] },
        tilematch: { type: 'object', properties: { ...baseProps, tiles: { type: 'array', items: { type: 'string' } } }, required: ['title', 'microTopic', 'instruction', 'tiles'] },
        story: { type: 'object', properties: { ...baseProps, scenes: { type: 'array', items: { type: 'object', properties: { text: { type: 'string' }, choices: { type: 'array', items: { type: 'string' } }, answer: { type: 'number' } }, required: ['text', 'choices', 'answer'] } } }, required: ['title', 'microTopic', 'instruction', 'scenes'] },
        physics: { type: 'object', properties: { ...baseProps, challenges: { type: 'array', items: { type: 'object', properties: { question: { type: 'string' }, options: { type: 'array', items: { type: 'string' } }, answer: { type: 'number' } }, required: ['question', 'options', 'answer'] } } }, required: ['title', 'microTopic', 'instruction', 'challenges'] },
        tracing: { type: 'object', properties: { ...baseProps, letters: { type: 'array', items: { type: 'string' } } }, required: ['title', 'microTopic', 'instruction', 'letters'] },
        balloon_pop: { type: 'object', properties: { ...baseProps, target: { type: 'string' }, items: { type: 'array', items: { type: 'string' } } }, required: ['title', 'microTopic', 'instruction', 'target', 'items'] },
        falling_catch: { type: 'object', properties: { ...baseProps, target: { type: 'string' }, items: { type: 'array', items: { type: 'string' } } }, required: ['title', 'microTopic', 'instruction', 'target', 'items'] },
        stacking: { type: 'object', properties: { ...baseProps, target: { type: 'number', minimum: 3, maximum: 10 } }, required: ['title', 'microTopic', 'instruction', 'target'] },
        sequence: { type: 'object', properties: { ...baseProps, items: { type: 'array', items: { type: 'string' } }, answer: { type: 'array', items: { type: 'string' } } }, required: ['title', 'microTopic', 'instruction', 'items', 'answer'] },
        swipe_select: { type: 'object', properties: { ...baseProps, items: { type: 'array', items: { type: 'object', properties: { text: { type: 'string' }, group: { type: 'string' } }, required: ['text', 'group'] } } }, required: ['title', 'microTopic', 'instruction', 'items'] },
        spin_wheel: { type: 'object', properties: { ...baseProps, target: { type: 'string' }, items: { type: 'array', items: { type: 'string' } } }, required: ['title', 'microTopic', 'instruction', 'target', 'items'] },
        picture_hunt: { type: 'object', properties: { ...baseProps, target: { type: 'string' }, items: { type: 'array', items: { type: 'object', properties: { text: { type: 'string' }, value: { type: 'string' } }, required: ['text', 'value'] } } }, required: ['title', 'microTopic', 'instruction', 'target', 'items'] },
        hidden_object: { type: 'object', properties: { ...baseProps, target: { type: 'string' }, items: { type: 'array', items: { type: 'object', properties: { text: { type: 'string' }, value: { type: 'string' } }, required: ['text', 'value'] } } }, required: ['title', 'microTopic', 'instruction', 'target', 'items'] },
        typing_challenge: { type: 'object', properties: { ...baseProps, target: { type: 'string' } }, required: ['title', 'microTopic', 'instruction', 'target'] },
        mini_simulation: { type: 'object', properties: { ...baseProps, target: { type: 'string' }, items: { type: 'array', items: { type: 'object', properties: { text: { type: 'string' }, group: { type: 'string' } }, required: ['text', 'group'] } } }, required: ['title', 'microTopic', 'instruction', 'target', 'items'] },
        true_false: { type: 'object', properties: { ...baseProps, statements: { type: 'array', items: { type: 'object', properties: { text: { type: 'string' }, answer: { type: 'boolean' } }, required: ['text', 'answer'] } } }, required: ['title', 'microTopic', 'instruction', 'statements'] },
        rhythm_tap: { type: 'object', properties: { ...baseProps, items: { type: 'array', items: { type: 'string' } } }, required: ['title', 'microTopic', 'instruction', 'items'] },
        connect_dots: { type: 'object', properties: { ...baseProps, items: { type: 'array', items: { type: 'string' } } }, required: ['title', 'microTopic', 'instruction', 'items'] },
        maze: { type: 'object', properties: baseProps, required: ['title', 'microTopic', 'instruction'] },
        reaction_speed: { type: 'object', properties: baseProps, required: ['title', 'microTopic', 'instruction'] },
        coloring: { type: 'object', properties: { ...baseProps, items: { type: 'array', items: { type: 'string' } } }, required: ['title', 'microTopic', 'instruction', 'items'] },
      };

      const normalizeMiniGameData = (currentMode, rawData, requestedItems) => {
        const next = { ...(rawData || {}) };
        const minimumItems = Math.max(4, Number(requestedItems || 4));
        if (currentMode === 'balloon_pop' || currentMode === 'falling_catch') {
          const target = String(next.target || '').trim() || 'A';
          const rawItems = Array.isArray(next.items) ? next.items : [];
          const cleaned = rawItems.map(item => String(typeof item === 'object' && item !== null ? (item.text || item.label || item.value || '') : item).trim()).filter(Boolean);
          const others = cleaned.filter(item => item.toLowerCase() !== target.toLowerCase());
          next.target = target;
          next.items = [target, target, ...others].slice(0, Math.max(minimumItems, 4));
          while (next.items.length < minimumItems) next.items.push(target);
        }
        if (currentMode === 'mini_simulation') {
          const target = String(next.target || '').trim() || 'Betul';
          const rawItems = Array.isArray(next.items) ? next.items : [];
          next.target = target;
          next.items = rawItems.map(item => ({ text: String(item?.text || item?.label || item || '').trim(), group: String(item?.group || '').trim() })).filter(item => item.text && item.group);
          if (!next.items.some(item => item.group.toLowerCase() === target.toLowerCase())) next.items.unshift({ text: target, group: target });
        }
        if (currentMode === 'picture_hunt' || currentMode === 'hidden_object') {
          const emojiMap = { cat: '🐱', ball: '⚽', fish: '🐟', book: '📚', apple: '🍎', sun: '☀️', moon: '🌙', star: '⭐', car: '🚗', house: '🏠', bird: '🐦', flower: '🌸' };
          const target = String(next.target || '').trim() || 'star';
          const rawItems = Array.isArray(next.items) ? next.items : [];
          next.target = target;
          next.items = rawItems.map(item => {
            const value = String(item?.value || item?.answer || item?.label || item?.text || item || '').trim();
            const text = String(item?.text || emojiMap[value.toLowerCase()] || value).trim();
            return { text, value };
          }).filter(item => item.text && item.value);
          if (!next.items.some(item => item.value.toLowerCase() === target.toLowerCase())) next.items.unshift({ text: emojiMap[target.toLowerCase()] || '⭐', value: target });
        }
        return next;
      };

      let data = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Jana SATU mini game CeriaKid yang unik, bukan variasi template lama.\n\nJenis game: ${mode}\nPanduan mekanik: ${gameGuides[mode] || mode}\nTema besar: ${theme}\nMicro-topic WAJIB untuk set ini: ${microTopic}\nGaya aktiviti WAJIB untuk set ini: ${playStyle}\nLevel: ${level} (${difficultyLabel})\nJumlah item sasaran: ${itemsPerSet}\n\nContent yang sudah wujud dan MESTI dielakkan:\n${JSON.stringify(recentExamples)}\n\n${QC_GENERATOR_RULES}
${qcLearningNotes}

Peraturan anti-repeat:\n0. Platform ini HANYA untuk Prasekolah dan Sekolah Rendah Darjah 1-6; jangan jana kandungan Tingkatan/PT3/SPM/sekolah menengah.\n1. Tajuk mesti spesifik dan unik, bukan "Set 1" atau tajuk generic.\n2. Item, jawapan, kategori, ayat dan scenario mesti berbeza daripada content sedia ada.\n3. Setiap game dalam mini game yang sama MESTI terasa berlainan gaya bermain; ikut gaya aktiviti WAJIB: ${playStyle}.\n4. Jangan ulang pola A-Ayam/B-Bola, warna asas yang sama, haiwan sama, atau pasangan terlalu obvious berulang.\n5. Gunakan konteks Malaysia dan variasikan kemahiran: kenal pasti, padan, susun, beza, kira, pilih sebab, klasifikasi.\n6. Content mesti siap dimainkan, tiada placeholder, tiada arahan yang perlukan gambar luar.\n7. Jika topik melibatkan wang Malaysia/RM, WAJIB guna fakta mata wang semasa yang betul: syiling hanya 5 sen, 10 sen, 20 sen, 50 sen; wang kertas RM1 biru, RM5 hijau, RM10 merah, RM20 jingga, RM50 hijau-biru, RM100 ungu. DILARANG sebut RM1 syiling, RM2 syiling, atau RM2 note.\n8. Jangan reka fakta visual seperti warna, gambar tokoh, atau ciri duit jika tidak pasti; lebih baik guna nilai dan situasi membeli barang.\n9. Untuk balloon_pop dan falling_catch: target mesti string; items mesti array string; items mesti mengandungi target yang sama tepat sekurang-kurangnya 2 kali; jangan guna object untuk items.\n10. Untuk mini_simulation: items mesti array object {text, group}; sekurang-kurangnya satu item mesti group sama tepat dengan target.\n11. Setiap mini game mesti ada jawapan/target/group yang jelas supaya app boleh papar popup Betul atau Cuba lagi.\n12. Jika arahan menyebut gambar/objek visual, items mesti guna emoji/simbol visual, bukan perkataan biasa sahaja.\n13. Jangan cipta aktiviti yang jawapannya bergantung pada warna sahaja; mesti ada label teks, simbol atau bentuk yang jelas untuk kanak-kanak dan kontras tinggi.\n14. Arahan mesti sangat jelas untuk ibu bapa dan kanak-kanak: nyatakan apa perlu ditekan, apa sasaran, dan bila dikira betul dalam satu ayat mudah.\n15. Elakkan mekanik abstrak seperti hanya 'ikut rentak', 'putar dan padan', atau 'simulasi' tanpa jawapan jelas; setiap game mesti ada target/answer/group yang boleh disemak automatik.\n16. Jika tema/subjek Jawi atau Iqra, jangan jana aktiviti yang nampak seperti matematik atau nombor sahaja; gunakan huruf Jawi, suku kata Arab/Jawi, bacaan mudah atau adab Islam yang jelas.\n17. Jika tema Islamic Learning, jangan jana coloring/aktiviti kosong; gunakan story, sequence wuduk/doa, atau true_false adab dengan jawapan jelas.\n18. Output JSON sahaja ikut schema.`,
        response_json_schema: schemaByMode[mode] || { type: 'object', properties: baseProps, required: ['title', 'microTopic', 'instruction'] },
      });

      const reviewed = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Audit dan baiki mini game ini sebelum disimpan.

Jenis game: ${mode}
Tema: ${theme}
Micro-topic: ${microTopic}
Gaya aktiviti wajib: ${playStyle}
Level: ${level} (${difficultyLabel})
Jumlah item sasaran: ${itemsPerSet}

Data asal:
${JSON.stringify(data)}

Wajib baiki:
0. Semua kandungan mesti hanya untuk Prasekolah atau Sekolah Rendah Darjah 1-6; buang kandungan Tingkatan/PT3/SPM/sekolah menengah.
1. Semua kandungan mesti fakta tepat, natural, sesuai KSSR Malaysia dan terus boleh dimainkan.
2. Tiada duplicate item/pasangan/jawapan dalam satu game.
3. Kekalkan gaya aktiviti yang diminta supaya set ini tidak sama format dengan set lain: ${playStyle}.
4. Tiada bahasa Indonesia/asing seperti "bisa", "total", "langkah" dalam BM; guna "boleh", "jumlah", "keping/biji/helai".
4. Jika topik wang Malaysia/RM: guna hanya fakta semasa; jangan sebut RM1 syiling, RM2 syiling, RM2 note, atau warna/ciri duit yang tidak pasti.
5. Guna Bahasa Melayu Malaysia baku; contoh "pemadam" bukan "penghapus".
6. Untuk memory, pasangan mesti unik dan tidak mengulang nilai kiri yang sama.
7. Untuk balloon_pop dan falling_catch, pastikan target ada sekurang-kurangnya 2 kali dalam items dengan ejaan sama tepat, dan items hanya string.
8. Untuk mini_simulation, pastikan sekurang-kurangnya satu item mempunyai group yang sama tepat dengan target.
9. Untuk sorting, swipe_select dan story, setiap item/choice mesti ada jawapan betul yang jelas supaya popup Betul/Cuba lagi boleh dipaparkan.
10. Untuk picture_hunt dan hidden_object, jangan guna perkataan biasa sebagai paparan gambar; items mesti object {text, value}, text ialah emoji/simbol visual dan value ialah jawapan yang dipadankan dengan target.
11. Jangan hasilkan mini game yang bergantung pada beza warna sahaja; setiap pilihan mesti ada teks/simbol/emoji yang jelas dan mudah dibaca.
12. Arahan mesti parent-friendly: terang dalam satu ayat apa anak perlu buat, contoh 'Pilih item, kemudian tekan kumpulan yang betul'.
13. Jika mekanik tidak mempunyai jawapan yang boleh disemak, tukar kepada sequence/sorting/true_false/picture_hunt yang lebih jelas.
14. Jika tema/subjek Jawi atau Iqra, buang item nombor-only atau gaya matematik; kandungan mesti jelas Jawi/Iqra seperti huruf ا ب ت ث, bacaan mudah, atau adab Islam.
15. Jika tema Islamic Learning, buang coloring/aktiviti kosong dan tukar kepada story, sequence, atau true_false yang ada jawapan/adab jelas.
16. Pastikan output masih ikut schema asal dan lengkap.

Output JSON sahaja ikut schema.`,
        response_json_schema: schemaByMode[mode] || { type: 'object', properties: baseProps, required: ['title', 'microTopic', 'instruction'] },
      });
      data = normalizeMiniGameData(mode, reviewed || data, itemsPerSet);

      return { mode, ...data, variant: index + 1, generatedTheme: theme, playStyle: data.playStyle || playStyle, microTopic: data.microTopic || microTopic };
    };

    if (task.subject === 'storykid') {
      const meta = JSON.parse(task.errorMessage || '{}');
      const story = meta.story || { title: task.taskName, emoji: '📖', moral: task.taskName };
      const scenes = Array.isArray(meta.scenes) ? meta.scenes : [];
      const generatedScenes = Array.isArray(meta.generatedScenes) ? meta.generatedScenes : [];

      if (!meta.cover) {
        const coverResult = await base44.asServiceRole.integrations.Core.GenerateImage({
          prompt: buildStoryImagePrompt(story, scenes[0], 0, 'cover'),
          existing_image_urls: [storybookStyleReference],
        });
        await base44.asServiceRole.entities.GameTask.update(task.id, {
          status: 'running',
          createdGames: 1,
          errorMessage: JSON.stringify({ ...meta, cover: coverResult.url, generatedScenes }),
        });
        return Response.json({ success: true, taskName: task.taskName, createdGames: 1, totalGames: scenes.length + 1, isDone: false });
      }

      if (generatedScenes.length < scenes.length) {
        const index = generatedScenes.length;
        const result = await base44.asServiceRole.integrations.Core.GenerateImage({
          prompt: buildStoryImagePrompt(story, scenes[index], index, 'scene'),
          existing_image_urls: [storybookStyleReference],
        });
        const nextScenes = [...generatedScenes, { ...scenes[index], imageUrl: result.url }];
        await base44.asServiceRole.entities.GameTask.update(task.id, {
          status: 'running',
          createdGames: nextScenes.length + 1,
          errorMessage: JSON.stringify({ ...meta, cover: meta.cover, generatedScenes: nextScenes }),
        });
        return Response.json({ success: true, taskName: task.taskName, createdGames: nextScenes.length + 1, totalGames: scenes.length + 1, isDone: false });
      }

      await base44.asServiceRole.entities.Game.create({
        title: story.title,
        description: story.moral,
        type: 'story_adventure',
        category: 'story',
        ageGroup: 'prasekolah',
        difficulty: 'easy',
        tier: 'free',
        emoji: story.emoji || '📖',
        totalQuestions: generatedScenes.length,
        gameData: { storyKid: true, moral: story.moral, cover: meta.cover, scenes: generatedScenes },
        isPublished: true,
        status: 'ready',
        order: meta.order || 0,
      });
      await base44.asServiceRole.entities.GameTask.update(task.id, {
        status: 'completed',
        createdGames: scenes.length + 1,
        completedAt: new Date().toISOString(),
      });
      return Response.json({ success: true, taskName: task.taskName, createdGames: scenes.length + 1, totalGames: scenes.length + 1, isDone: true });
    }

    if (String(task.subject || '').startsWith('bbm_')) {
      const meta = JSON.parse(task.errorMessage || '{}');
      const subject = meta.subject || String(task.subject).replace(/^bbm_/, '').split('_')[0];
      const level = meta.level || task.ageGroup || 'darjah_1';
      const type = meta.type || 'lembaran_kerja';
      const topic = meta.topic || 'umum';
      const count = task.questionsPerGame || 10;

      const subjectLabels = {
        bahasa_melayu: 'Bahasa Melayu', english: 'English', mathematics: 'Matematik', science: 'Sains', jawi: 'Jawi',
        pendidikan_islam: 'Pendidikan Islam', pendidikan_moral: 'Pendidikan Moral', sejarah: 'Sejarah'
      };
      const levelLabels = {
        prasekolah: 'Prasekolah', darjah_1: 'Darjah 1', darjah_2: 'Darjah 2', darjah_3: 'Darjah 3',
        darjah_4: 'Darjah 4', darjah_5: 'Darjah 5', darjah_6: 'Darjah 6'
      };
      const typeLabels = {
        lembaran_kerja: 'Lembaran Kerja', kuiz: 'Kuiz', rancangan_pengajaran: 'RPH', kad_imbasan: 'Kad Imbasan',
        carta: 'Carta', modul: 'Modul', aktiviti: 'Aktiviti', permainan_bilik_darjah: 'Permainan Bilik Darjah'
      };
      const typeEmojis = {
        lembaran_kerja: '📄', kuiz: '🧩', rancangan_pengajaran: '📝', kad_imbasan: '🃏', carta: '📊', modul: '📦', aktiviti: '🎯', permainan_bilik_darjah: '🎲'
      };
      const subjectLabel = subjectLabels[subject] || subject;
      const levelLabel = levelLabels[level] || level;
      const typeLabel = typeLabels[type] || type;
      const bbmKssrGuide = {
        darjah_1: 'Darjah 1: asas literasi/numerasi, nombor 0-100, ayat pendek, deria dan benda harian.',
        darjah_2: 'Darjah 2: ayat mudah, nombor hingga 1000, operasi asas, wang/masa mudah, haiwan/tumbuhan/manusia.',
        darjah_3: 'Darjah 3: kefahaman ringkas, nombor hingga 10000, operasi asas, pecahan/ukuran mudah, magnet/cahaya/bunyi.',
        darjah_4: 'Darjah 4: operasi bergabung mudah, pecahan/perpuluhan asas, proses hidup, sifat bahan, tenaga.',
        darjah_5: 'Darjah 5: aplikasi sederhana, peratus/nisbah/data, mikroorganisma, elektrik, haba, rantai makanan.',
        darjah_6: 'Darjah 6: penyelesaian masalah sederhana, graf/purata/peratus, daya, mesin ringkas, ekosistem.'
      }[level] || 'Ikut tahap umur dan KSSR/DSKP Malaysia yang sesuai.';
      const languageRule = subject === 'english'
        ? 'Use English only for all title, description, instructions, content and answers.'
        : 'Gunakan Bahasa Melayu Malaysia baku untuk semua kandungan.';

      let data = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Anda ialah guru pakar KSSR/DSKP Malaysia. Jana ${typeLabel} lengkap, berkualiti dan siap cetak A4 untuk ${subjectLabel} ${levelLabel}. Topik: ${topic}. Bilangan item/soalan: ${count}. ${languageRule}
Panduan tahap KSSR: ${bbmKssrGuide}

WAJIB ikut standard generator CeriaKid:
0. Platform ini HANYA untuk Prasekolah dan Sekolah Rendah Darjah 1-6. DILARANG jana kandungan Tingkatan, PT3, SPM, sekolah menengah, atau silibus luar tahap ini.
1. Kandungan mesti spesifik kepada topik, bukan umum atau berulang.
2. Setiap item mesti ada kemahiran jelas, soalan/aktiviti penuh, dan jawapan/skema tepat.
3. Guna contoh tempatan Malaysia yang sesuai umur dan selari KSSR/DSKP.
4. Variasikan aras mudah-sederhana-tinggi secara seimbang, tetapi jangan melebihi tahap KSSR ${levelLabel}.
5. DILARANG soalan atau aktiviti generik, merepek, terlalu tinggi/rendah, atau berulang antara item.
6. DILARANG placeholder: "Soalan 1", "Item", "Latihan", "Gambar di bawah", "Gambar di halaman ini", "lihat gambar", atau content kosong.
6. DILARANG fakta meragukan, bahasa rojak, bahasa Indonesia tidak sesuai, arahan yang perlukan gambar, dan tajuk generik.
7. Setiap heading mesti menerangkan kemahiran khusus seperti "Kenal Pasti Kata Nama Am" atau "Selesaikan Tambah Dalam Lingkungan 100".
8. Untuk RPH, mesti ada objektif, set induksi, aktiviti, pentaksiran dan refleksi ringkas.
9. Untuk lembaran/kuiz/kad imbasan, mesti ada item yang terus boleh digunakan murid.
10. Jika topik melibatkan wang Malaysia/RM, WAJIB guna fakta mata wang semasa yang betul: syiling hanya 5 sen, 10 sen, 20 sen, 50 sen; wang kertas RM1 biru, RM5 hijau, RM10 merah, RM20 jingga, RM50 hijau-biru, RM100 ungu. DILARANG sebut RM1 syiling, RM2 syiling, atau RM2 note.

Output JSON sahaja: title, description, instructions, items[{heading,content,answer}].`,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            instructions: { type: 'string' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  heading: { type: 'string' },
                  content: { type: 'string' },
                  answer: { type: 'string' },
                },
              },
            },
          },
        },
      });

      const reviewedBbm = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Audit dan baiki BBM ini sebelum disimpan.

Subjek: ${subjectLabel}
Tahap: ${levelLabel}
Jenis: ${typeLabel}
Topik: ${topic}

Data asal:
${JSON.stringify(data)}

Wajib baiki:
1. Kekalkan bilangan item lebih kurang ${count}, tetapi hanya item berkualiti.
2. Semua kandungan mesti fakta tepat, sesuai KSSR Malaysia dan terus boleh cetak.
3. Guna Bahasa Melayu Malaysia baku; buang bahasa Indonesia/asing seperti "bisa", "total", "langkah", "penghapus" jika konteks BM.
4. Jangan guna arahan yang perlukan gambar/imej kerana BBM ini dijana sebagai teks cetak sahaja; ganti dengan senarai nilai, jadual ringkas, atau situasi cerita.
5. Jika topik wang Malaysia/RM: syiling hanya 5 sen, 10 sen, 20 sen, 50 sen; wang kertas RM1, RM5, RM10, RM20, RM50, RM100. Jangan sebut RM1 syiling, RM2 syiling, RM2 note.
5. Soalan mesti natural dan unit mesti betul: keping, biji, helai, batang, kotak.
6. Jawapan/skema mesti tepat dan tidak mengelirukan.

Output JSON sahaja: title, description, instructions, items[{heading,content,answer}].`,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            instructions: { type: 'string' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  heading: { type: 'string' },
                  content: { type: 'string' },
                  answer: { type: 'string' },
                },
              },
            },
          },
        },
      });
      data = reviewedBbm || data;

      const badBbmPattern = /^(soalan|item|latihan|aktiviti pembelajaran|umum)$/i;
      const items = (Array.isArray(data.items) ? data.items : [])
        .map(item => ({
          ...item,
          heading: String(item.heading || '').replace(/^\s*(soalan|item|latihan)\s*\d+\s*[:\-.]?\s*/i, '').trim(),
          content: String(item.content || '').trim(),
          answer: String(item.answer || '').trim(),
        }))
        .filter(item => item.heading.length >= 8 && item.content.length >= 20 && !badBbmPattern.test(item.heading));
      const htmlContent = `<!DOCTYPE html><html lang="ms"><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;max-width:820px;margin:auto;padding:24px;color:#1f2937;line-height:1.45}h1{text-align:center;color:#4f46e5}h2{text-align:center;color:#64748b;font-size:14px}.meta{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:20px 0}.box,.item{border:1px solid #c7d2fe;border-radius:12px;padding:12px}.box{background:#eef2ff}.item{margin:14px 0;border-left:5px solid #6366f1;background:#fafafa;break-inside:avoid}.answer{color:#047857;font-weight:bold}footer{text-align:center;color:#64748b;font-size:11px;margin-top:28px;border-top:1px solid #eee;padding-top:12px}@media print{body{padding:12px}.item{page-break-inside:avoid}}</style></head><body><h1>${data.title || typeLabel}</h1><h2>${subjectLabel} | ${levelLabel} | ${typeLabel}</h2><div class="meta"><div class="box">Nama: ____________</div><div class="box">Kelas: ____________</div><div class="box">Tarikh: ____________</div></div><div class="box"><b>Arahan:</b> ${data.instructions || 'Gunakan bahan ini semasa pembelajaran.'}</div>${items.map((item, i) => `<section class="item"><h3>${i + 1}. ${item.heading}</h3><p>${item.content || ''}</p>${item.answer ? `<p class="answer">Jawapan/Nota: ${item.answer}</p>` : ''}</section>`).join('')}<footer>CeriaKid Educational Platform | Malaysia</footer></body></html>`;

      await base44.asServiceRole.entities.BBMResource.create({
        title: data.title || `${typeLabel} - ${subjectLabel}`,
        description: data.description || `Jana AI | ${topic}`,
        subject,
        level,
        type,
        emoji: typeEmojis[type] || '📄',
        tier: 'free',
        downloadCount: 0,
        isPublished: true,
        tags: [subjectLabel, levelLabel, typeLabel, topic],
        htmlContent,
      });

      await base44.asServiceRole.entities.GameTask.update(task.id, {
        status: 'completed',
        createdGames: 1,
        completedAt: new Date().toISOString(),
      });

      return Response.json({ success: true, taskName: task.taskName, createdGames: 1, totalGames: 1, isDone: true });
    }

    const miniGame = miniGameMap[task.subject];
    if (miniGame) {
      const existingMini = await base44.asServiceRole.entities.Game.filter({ category: task.subject });
      const meta = (() => {
        try { return JSON.parse(task.errorMessage || '{}'); } catch { return {}; }
      })();
      const levels = Math.max(1, Number(meta.levels || 3));
      const itemsPerSet = Math.max(2, Number(meta.itemsPerSet || task.questionsPerGame || 4));

      for (let i = alreadyCreated; i < batchEnd; i++) {
        const absoluteIndex = existingMini.length + i;
        const level = (absoluteIndex % levels) + 1;
        const setNo = Math.floor(absoluteIndex / levels) + 1;
        const difficulty = level <= 1 ? 'easy' : level === 2 ? 'medium' : 'hard';
        const mode = (meta.modes?.length ? meta.modes : miniGame.modes || [task.subject])[absoluteIndex % (meta.modes?.length || miniGame.modes?.length || 1)];
        const generatedData = await buildMiniGameData(base44, mode, absoluteIndex, meta.theme || miniGame.title || 'Mini game CeriaKid', itemsPerSet, level, existingMini, qcLearningNotes);
        await base44.asServiceRole.entities.Game.create({
          title: generatedData.title || `${miniGame.title} · ${generatedData.microTopic || `Set ${setNo} Level ${level}`}`,
          type: miniGame.type,
          category: task.subject,
          ageGroup: task.ageGroup || 'sekolah_rendah',
          difficulty,
          tier: 'free',
          emoji: miniGame.emoji,
          totalQuestions: itemsPerSet,
          gameData: { ...generatedData, miniGameGenerated: true, categoryId: task.subject, categoryTitle: miniGame.title, setNo, level, itemsPerSet },
          isPublished: true,
          status: 'ready',
          order: absoluteIndex,
        });
        existingMini.push({ title: generatedData.title, gameData: generatedData });
        createdInBatch++;
      }

      const newTotal = alreadyCreated + createdInBatch;
      const isDone = newTotal >= totalNeeded;
      await base44.asServiceRole.entities.GameTask.update(task.id, {
        status: isDone ? 'completed' : 'running',
        createdGames: newTotal,
        ...(isDone ? { completedAt: new Date().toISOString() } : {}),
      });
      return Response.json({ success: true, taskName: task.taskName, createdGames: newTotal, totalGames: totalNeeded, isDone });
    }

    const sanitizeExistingQuestions = (questions = []) => {
      const bannedPattern = /(hewan|singh|bekam|\blama\b|\bbabi\b|turtle|kodok|kelinci|daki|moo|woof|roar|rindu|semangat ketua|bintang di badannya|rongga hidung|terpanjang di dunia|jangan lupa|dua jenis rupa|haiwan apa|apakah nama haiwan ini|sering dibela|dua telinga panjang dan sangat comel|badan kecil dan suka berlari-lari|boleh terbang di taman|berbulu yang sering dipelihara|soalan\s*\d+|placeholder|contoh jawapan|lihat gambar|gambar di bawah)/i;
      return questions
        .filter(q => q?.problem && Array.isArray(q.options) && q.options.length === 4 && Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= 3)
        .filter(q => new Set(q.options.map(o => String(o).trim().toLowerCase())).size === 4)
        .filter(q => !bannedPattern.test([q.problem, ...q.options].join(' ')));
    };

    const gameFilter = { ageGroup: task.ageGroup, category: task.subject };
    if (task.ageGroup === 'sekolah_rendah' && task.darjah) gameFilter.darjah = task.darjah;
    const existingGames = await base44.asServiceRole.entities.Game.filter(gameFilter);
    const underfilledGames = existingGames.filter(g => sanitizeExistingQuestions(g.gameData?.questions || []).length < task.questionsPerGame);
    const totalWork = underfilledGames.length + (task.gamesCount || 0);

    const expandStart = Math.min(alreadyCreated, underfilledGames.length);
    const expandBatch = underfilledGames.slice(expandStart, expandStart + 3);
    if (expandBatch.length > 0) {
      for (const game of expandBatch) {
        const existingClean = sanitizeExistingQuestions(game.gameData?.questions || []);
        const missing = task.questionsPerGame - existingClean.length;
        const generated = await generateQuestionsForGame(base44, game.title, game.title, task.subject, task.ageGroup, missing, existingClean.map(q => q.problem), game.darjah || task.darjah || null, qcLearningNotes);
        const questions = [...existingClean, ...generated].slice(0, task.questionsPerGame);
        await base44.asServiceRole.entities.Game.update(game.id, { totalQuestions: questions.length, gameData: { ...game.gameData, questions } });
        createdInBatch++;
      }

      const newTotal = alreadyCreated + createdInBatch;
      const isDone = newTotal >= totalWork;
      await base44.asServiceRole.entities.GameTask.update(task.id, {
        status: isDone ? 'completed' : 'running',
        createdGames: newTotal,
        ...(isDone ? { completedAt: new Date().toISOString() } : {}),
      });
      return Response.json({ success: true, taskName: task.taskName, progress: newTotal, totalWork, isDone });
    }

    // Get topics pool for this subject
    const topics = TOPIC_POOLS[task.subject] || TOPIC_POOLS.default;
    const latestGamesAfterExpand = await base44.asServiceRole.entities.Game.filter(gameFilter);
    const existingTitles = latestGamesAfterExpand.map(g => g.title);
    const createStart = Math.max(0, alreadyCreated - underfilledGames.length);
    const createEnd = Math.min(createStart + BATCH, task.gamesCount || 0);

    for (let i = createStart; i < createEnd; i++) {
      const gameType = GAME_TYPES[i % GAME_TYPES.length];
      // Pick a unique topic by cycling through the pool
      const darjahNumber = task.darjah ? Number(String(task.darjah).replace('darjah_', '')) || 0 : 0;
      const topicIdx = (darjahNumber * 3 + alreadyCreated + createdInBatch) % topics.length;
      const topicName = topics[topicIdx];
      const darjahLabel = task.ageGroup === 'sekolah_rendah' && task.darjah ? DARJAH_LABELS[task.darjah] : '';
      const gameTitle = `${CATEGORY_LABELS[task.subject] || task.taskName}${darjahLabel ? ` ${darjahLabel}` : ''} — ${topicName}`;

      try {
        const questions = await generateQuestionsForGame(base44, gameTitle, topicName, task.subject, task.ageGroup, task.questionsPerGame, existingTitles, task.darjah || null, qcLearningNotes);

        if (!questions || questions.length === 0) {
          console.error(`Skip ${gameTitle} — no questions`);
          createdInBatch++;
          continue;
        }

        // Refetch latest order
        const latestExisting = await base44.asServiceRole.entities.Game.filter(gameFilter);

        // Tag with current month for rotation (format: 'YYYY-MM')
        const now = new Date();
        const monthTag = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        await base44.asServiceRole.entities.Game.create({
          title: gameTitle,
          type: gameType,
          category: task.subject,
          ageGroup: task.ageGroup,
          ...(task.ageGroup === 'sekolah_rendah' && task.darjah ? { darjah: task.darjah } : {}),
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
      status: isDone ? 'completed' : 'running', // reset to pending for next batch
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