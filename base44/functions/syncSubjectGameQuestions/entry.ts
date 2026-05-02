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

async function generateQuestionsForGame(base44, game, needed, existingQuestions) {
  const subject = CATEGORY_LANG[game.category] || game.category;
  const ageDesc = AGE_DESC[game.ageGroup] || game.ageGroup;
  const existingSample = existingQuestions.slice(0, 3).map(q => q.problem || q.question || '').filter(Boolean).join('; ');

  const prompt = `Anda adalah pakar pembina soalan pendidikan Malaysia (KSSR/KSSM), sangat teliti, bijak dan ketat dalam memastikan kualiti.

Tugas: Jana TEPAT ${needed} soalan BARU, UNIK & BERKUALITI untuk:
Topik: "${game.title}"
Subjek: ${subject}
Peringkat: ${ageDesc}
Jenis: ${game.type}

JENIS PERMAINAN: ${game.type}

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
STRUKTUR BERDASARKAN JENIS PERMAINAN:

JIKA multiple_choice, letter_match, number_match, picture_quiz, counting, math_puzzle:
- WAJIB ada 4 pilihan jawapan (A, B, C, D)
- Semua pilihan mesti dalam kategori yang sama
- Panjang ayat pilihan mesti hampir sama (elak obvious answer)
- Susunan jawapan mesti rawak (jawapan tidak sentiasa di tempat sama)
- Jawapan mesti wujud EXACT dalam pilihan

JIKA matching, word_builder, spelling, phonics:
- Soalan boleh ada pasangan (matching pairs)
- Atau boleh ada blank yang perlu diisi
- Minimal 2-3 pilihan/pasangan untuk setiap soalan
- Bukan semestinya 4 pilihan tepat

JIKA true/false, yes/no:
- Soalan jelas dan unambiguous
- Jawapan WAJIB "Ya" atau "Tidak" / "Betul" atau "Salah"
- Hanya ada 2 pilihan

JIKA drag_drop, shape_sort, color_match:
- Soalan boleh lebih deskriptif dengan instruksi visual
- Jawapan boleh berupa kategori atau matching items
- Fleksibel dengan jumlah pilihan (minimum 3)

────────────────────────
TAHAP KESUKARAN:
- 30% mudah (ingat fakta)
- 50% sederhana (faham konsep)
- 20% mencabar (aplikasi mudah)

────────────────────────
FORMAT OUTPUT (WAJIB - JSON SAHAJA, TANPA TEKS TAMBAHAN):

Jika multiple_choice/letter_match/number_match/counting/math_puzzle (4 pilihan):
[
  {
    "soalan": "",
    "pilihan": ["", "", "", ""],
    "jawapan": ""
  }
]

Jika true/false atau yes/no (2 pilihan):
[
  {
    "soalan": "",
    "pilihan": ["Ya", "Tidak"],
    "jawapan": ""
  }
]

Jika matching/word_builder/fill_blank (fleksibel pilihan):
[
  {
    "soalan": "",
    "pilihan": ["", "", ""],
    "jawapan": ""
  }
]

────────────────────────
VALIDASI AKHIR (WAJIB SEMAK SEBELUM OUTPUT):
- Tiada soalan duplicate
- Tiada subtopik berulang
- Jawapan tepat dan tidak bercanggah
- Jawapan MESTI wujud dalam pilihan array
- Jumlah pilihan SESUAI dengan jenis permainan (boleh 2, 3, 4, atau lebih)
- Tidak semua soalan harus 4 pilihan—VARIASIKAN mengikut jenis permainan`;

  // Determine min/max items based on game type
  const getItemLimits = (type) => {
    if (['true_false', 'yes_no'].includes(type)) return { min: 2, max: 2 };
    if (['matching', 'word_builder', 'spelling', 'phonics'].includes(type)) return { min: 2, max: 10 };
    if (['drag_drop', 'shape_sort', 'color_match'].includes(type)) return { min: 3, max: 10 };
    if (['multiple_choice', 'letter_match', 'number_match', 'picture_quiz', 'counting', 'math_puzzle'].includes(type)) return { min: 4, max: 4 };
    return { min: 2, max: 10 }; // Default flexible for any new types
  };

  const { min, max } = getItemLimits(game.type);

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    model: 'claude_sonnet_4_6',
    response_json_schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          soalan: { type: 'string', description: 'Teks soalan' },
          pilihan: { type: 'array', items: { type: 'string' }, minItems: min, maxItems: max, description: 'Pilihan jawapan' },
          jawapan: { type: 'string', description: 'Jawapan yang tepat (mesti wujud dalam pilihan)' },
        },
        required: ['soalan', 'pilihan', 'jawapan'],
      },
      minItems: needed,
      maxItems: needed,
    },
  });

  // Transform format
  return (result || [])
    .filter(q => q.soalan && q.pilihan?.length >= min && q.pilihan?.length <= max && q.jawapan && q.pilihan.includes(q.jawapan))
    .map((q) => {
      // Transform to internal format: problem, options, answer (index)
      const answerIndex = q.pilihan.indexOf(q.jawapan);
      return {
        problem: q.soalan,
        options: q.pilihan,
        answer: answerIndex >= 0 ? answerIndex : 0,
      };
    });
}

function isRealQuestion(q) {
  const problem = q.problem || q.question || '';
  return !/^Soalan \d+$/.test(problem.trim());
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
          newQuestions = [...realQuestions, ...generated.slice(0, needed)];
          expanded++;
        } else {
          newQuestions = realQuestions.slice(0, targetCount);
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