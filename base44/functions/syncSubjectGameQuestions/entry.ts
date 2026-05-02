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

  const prompt = `Anda adalah pakar pembina soalan pendidikan Malaysia (KSSR/KSSM), sangat teliti dan ketat.

Tugas: Jana TEPAT ${needed} soalan BARU, UNIK & BERKUALITI untuk:
Topik: "${game.title}"
Subjek: ${subject}
Peringkat: ${ageDesc}
Jenis: ${game.type || 'multiple_choice'}

${existingSample ? `JANGAN ULANG: ${existingSample}` : ''}

PERATURAN SOALAN:
- Berdasarkan silibus Malaysia (nyatakan konsep jelas)
- 1 soalan = 1 konsep sahaja
- Tidak subjektif / tiada jawapan berganda
- Semua soalan berbeza subtopik

PILIHAN JAWAPAN:
- 4 pilihan sahaja
- Semua dalam kategori sama
- Panjang hampir sama
- Susunan rawak

EMOJI (WAJIB & KETAT):
- Emoji mesti MATCH EXACT dengan jawapan
- Tidak boleh simbolik atau generic
- Setiap soalan emoji berbeza (no repetition)
- Jika tiada emoji tepat → skip soalan itu

TAHAP:
- 30% mudah
- 50% sederhana
- 20% mencabar

VALIDASI AKHIR:
- Jawapan mesti wujud dalam pilihan
- Tiada emoji berulang
- Tiada soalan duplicate`;

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    model: 'claude_sonnet_4_6',
    response_json_schema: {
      type: 'object',
      properties: {
        questions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              problem: { type: 'string', description: 'Soalan jelas' },
              options: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4 },
              answer: { type: 'number', minimum: 0, maximum: 3 },
              emoji: { type: 'string', description: 'Emoji yang MATCH jawapan betul' },
            },
            required: ['problem', 'options', 'answer', 'emoji'],
          },
          minItems: needed,
          maxItems: needed,
        },
      },
      required: ['questions'],
    },
  });

  // Validate emoji matches—if mismatch, try to fix with fallback
  return (result.questions || []).map((q) => {
    const correctAnswer = q.options?.[q.answer] || '';
    if (!validateEmojiMatch(correctAnswer, q.emoji)) {
      // Fallback: use first valid emoji or generic match
      q.emoji = '🎯'; // Safe fallback for deduplication to fix
    }
    return q;
  });
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