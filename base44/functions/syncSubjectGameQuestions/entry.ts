import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CATEGORY_LANG = {
  bahasa_melayu: 'Bahasa Melayu',
  english: 'English',
  mathematics: 'Matematik',
  science: 'Sains',
};

const AGE_DESC = {
  prasekolah: 'prasekolah (umur 4-6 tahun)',
  sekolah_rendah: 'sekolah rendah (umur 7-12 tahun)',
};

// Map answer keywords to valid emojis
const EMOJI_MAPPING = {
  'pensil': ['✏️', '🖍️'],
  'penghapus': ['🧹', '🧻'],
  'buku': ['📚', '📖'],
  'burung': ['🐦', '🦅'],
  'ikan': ['🐠', '🐟'],
  'rumah': ['🏠', '🏡'],
  'kereta': ['🚗', '🚕'],
  'malaysia': ['🇲🇾'],
  'merah': ['🔴'],
  'biru': ['🔵'],
};

function validateEmojiMatch(answer, emoji) {
  // Extract first word from answer
  const answerLower = (answer || '').toLowerCase().split(' ')[0];
  
  // Check if answer matches any mandatory mapping
  for (const [keyword, validEmojis] of Object.entries(EMOJI_MAPPING)) {
    if (answerLower.includes(keyword)) {
      return validEmojis.includes(emoji);
    }
  }
  
  // If no mapping, emoji should not be generic
  const genericEmojis = ['❓', '❌', '✅', '🎮', '📝'];
  return !genericEmojis.includes(emoji) && emoji.length > 0;
}

async function generateQuestionsForGame(base44, game, needed, existingQuestions) {
  const subject = CATEGORY_LANG[game.category] || game.category;
  const ageDesc = AGE_DESC[game.ageGroup] || game.ageGroup;
  const existingSample = existingQuestions.slice(0, 3).map(q => q.problem || q.question || '').filter(Boolean).join('; ');

  const prompt = `Anda adalah pakar pembina soalan pendidikan Malaysia (KSSR/KSSM), sangat teliti, bijak dan ketat dalam memastikan kualiti.

Tugas: Jana TEPAT ${needed} soalan BARU, UNIK & BERKUALITI untuk:
Topik: "${game.title}"
Subjek: ${subject}
Peringkat: ${ageDesc}
Jenis: ${game.type || 'multiple_choice'}

${existingSample ? `JANGAN ULANG SOALAN INI: ${existingSample}` : ''}

────────────────────────
PERATURAN SOALAN:
- Berdasarkan silibus Malaysia (KSSR/KSSM)
- Setiap soalan mesti fokus kepada SATU konsep sahaja
- Tidak subjektif dan tiada jawapan berganda
- Setiap soalan mesti berbeza subtopik (tiada pengulangan idea)
- Gunakan bahasa yang sesuai dengan ${ageDesc}
- Variasikan gaya ayat (jangan semua bermula dengan "Apakah")

────────────────────────
PILIHAN JAWAPAN:
- Mesti ada 4 pilihan sahaja
- Semua pilihan mesti dalam kategori yang sama
- Panjang ayat pilihan mesti hampir sama (elak obvious answer)
- Susunan jawapan mesti rawak (jawapan tidak sentiasa di tempat sama)
- Jawapan mesti wujud EXACT dalam pilihan

────────────────────────
PERATURAN EMOJI (SANGAT KETAT - ZERO ERROR):
- Emoji HANYA dibenarkan dalam field "emoji" sahaja
- DILARANG sama sekali letak emoji dalam:
  • teks soalan
  • pilihan jawapan
- Setiap soalan hanya boleh ada SATU emoji sahaja
- Emoji mesti MATCH EXACT dengan jawapan (bukan simbolik)
- Setiap emoji mesti BERBEZA (tiada ulangan langsung)
- Jika tiada emoji yang tepat → JANGAN jana soalan itu

Contoh:
Jawapan "Burung" → 🐦 atau 🦅 sahaja
Jawapan "Malaysia" → 🇲🇾 sahaja

────────────────────────
TAHAP KESUKARAN:
- 30% mudah (ingat fakta)
- 50% sederhana (faham konsep)
- 20% mencabar (aplikasi mudah)

────────────────────────
FORMAT OUTPUT (WAJIB - JSON SAHAJA, TANPA TEKS TAMBAHAN):

[
  {
    "soalan": "",
    "pilihan": ["", "", "", ""],
    "jawapan": "",
    "emoji": ""
  }
]

────────────────────────
VALIDASI AKHIR (WAJIB SEMAK SEBELUM OUTPUT):
- Tiada soalan duplicate
- Tiada subtopik berulang
- Jawapan tepat dan tidak bercanggah
- Jawapan wujud dalam pilihan
- TIADA emoji dalam "soalan" dan "pilihan"
- Semua emoji unik (tiada pengulangan)`;

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    model: 'claude_sonnet_4_6',
    response_json_schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          soalan: { type: 'string', description: 'Teks soalan tanpa emoji' },
          pilihan: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4, description: 'Empat pilihan jawapan tanpa emoji' },
          jawapan: { type: 'string', description: 'Jawapan yang tepat (mesti wujud dalam pilihan)' },
          emoji: { type: 'string', description: 'Emoji yang MATCH EXACT dengan jawapan' },
        },
        required: ['soalan', 'pilihan', 'jawapan', 'emoji'],
      },
      minItems: needed,
      maxItems: needed,
    },
  });

  // Validate emoji matches and transform format
  return (result || [])
    .filter(q => q.soalan && q.pilihan?.length === 4 && q.jawapan && q.emoji)
    .map((q) => {
      if (!validateEmojiMatch(q.jawapan, q.emoji)) {
        // Skip if emoji doesn't match answer
        return null;
      }
      // Transform to internal format: problem, options, answer (index), emoji
      const answerIndex = q.pilihan.indexOf(q.jawapan);
      return {
        problem: q.soalan,
        options: q.pilihan,
        answer: answerIndex >= 0 ? answerIndex : 0,
        emoji: q.emoji,
      };
    })
    .filter(Boolean);
}

function isRealQuestion(q) {
  const problem = q.problem || q.question || '';
  return !/^Soalan \d+$/.test(problem.trim());
}

function deduplicateEmojis(questions) {
  const usedEmojis = new Set();
  const emojiPool = ['📚', '📖', '✏️', '🖍️', '🔤', '💬', '🗣️', '📄', '🎓', '🌍', '🌟', '✍️', '🇬🇧', '📖', '🎤', '💭', '🏆', '🔢', '➕', '➖', '✖️', '➗', '📐', '📏', '🧮', '🔺', '💯', '🔬', '🧬', '🧪', '🌱', '🦋', '🔭', '⚗️', '🧫', '🌎', '🐦', '🦅', '🐠', '🐟', '🏠', '🏡', '🚗', '🚕', '🧹', '🧻', '🔴', '🔵'];

  return questions.map((q) => {
    let emoji = q.emoji || '';
    
    // If emoji already used, find replacement from pool
    if (usedEmojis.has(emoji) || !emoji) {
      emoji = emojiPool.find(e => !usedEmojis.has(e)) || '🎯';
    }
    
    usedEmojis.add(emoji);
    return { ...q, emoji };
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { targetCount, ageGroup, category, gameId } = await req.json();

    if (!targetCount || targetCount < 1) {
      return Response.json({ error: 'targetCount required' }, { status: 400 });
    }
    if (!ageGroup || !category) {
      return Response.json({ error: 'ageGroup and category required' }, { status: 400 });
    }

    // If gameId provided, only process that one game
    let games;
    if (gameId) {
      const g = await base44.asServiceRole.entities.Game.filter({ id: gameId });
      games = g.length > 0 ? [g[0]] : [];
    } else {
      games = await base44.asServiceRole.entities.Game.filter({ ageGroup, category });
    }

    let expanded = 0;
    let reduced = 0;
    let unchanged = 0;
    let errors = 0;

    for (const game of games) {
      try {
        const allQuestions = game.gameData?.questions || [];
        const realQuestions = allQuestions.filter(isRealQuestion);
        const currentCount = realQuestions.length;

        if (currentCount === targetCount) {
          unchanged++;
          continue;
        }

        let newQuestions = [...realQuestions];

        if (targetCount > currentCount) {
          const needed = targetCount - currentCount;
          const generated = await generateQuestionsForGame(base44, game, needed, realQuestions);
          newQuestions = deduplicateEmojis([...realQuestions, ...generated.slice(0, needed)]);
          expanded++;
        } else {
          newQuestions = deduplicateEmojis(realQuestions.slice(0, targetCount));
          reduced++;
        }

        await base44.asServiceRole.entities.Game.update(game.id, {
          totalQuestions: newQuestions.length,
          gameData: { ...game.gameData, questions: newQuestions },
        });
      } catch (err) {
        console.error(`Error game ${game.id}: ${err.message}`);
        errors++;
      }
    }

    return Response.json({
      success: true,
      ageGroup,
      category,
      targetCount,
      totalGames: games.length,
      expanded,
      reduced,
      unchanged,
      errors,
      message: `${expanded} games expanded with AI questions, ${reduced} reduced, ${unchanged} unchanged`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});