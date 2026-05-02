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

  const prompt = `Anda adalah pakar pembina kandungan pendidikan Malaysia (KSSR/KSSM) DAN pereka mini-games pembelajaran interaktif kanak-kanak.

Tugas:
Jana TEPAT ${needed} item permainan pendidikan yang MENARIK, INTERAKTIF dan BERBEZA untuk:

Topik: "${game.title}"
Subjek: ${subject}
Peringkat: ${ageDesc}

${existingSample ? `JANGAN ULANG: ${existingSample}` : ''}

────────────────────────
🎮 OBJEKTIF:
- Hasilkan MINI GAMES, bukan sekadar soalan
- Variasikan gameplay supaya tidak membosankan
- Sesuai untuk kanak-kanak (engaging & mudah faham)

────────────────────────
🎯 10 JENIS GAME:

1. multiple_choice (4 pilihan)
2. true_false (Betul/Salah)
3. matching (pasangan kiri-kanan)
4. fill_blank (isi tempat kosong)
5. ordering (susun urutan)
6. odd_one_out (cari yang berlainan)
7. short_answer (jawapan ringkas)
8. image_choice (pilih gambar - jika topik memerlukan)
9. categorization (mengkategori items)
10. yes_no (Ya/Tidak)

AGIHAN:
- Gunakan sekurang-kurangnya 4 jenis berbeda
- Elakkan semua jenis sama

────────────────────────
📚 PERATURAN AKADEMIK:
- Berdasarkan silibus KSSR/KSSM
- 1 item = 1 konsep sahaja
- Tiada jawapan berganda
- Tidak subjektif
- Bahasa sesuai tahap ${ageDesc}
- Variasikan gaya ayat

────────────────────────
🧠 KUALITI:
- Elakkan soalan terlalu obvious
- Semua pilihan mesti munasabah
- Distractor mesti nampak hampir betul
- Elakkan format berulang

────────────────────────
🔊 SOUND EFFECT (WAJIB):

Setiap item MESTI ada 2 sound:
- Correct: "correct_pop" / "correct_ding" / "success_chime"
- Wrong: "wrong_buzz" / "error_tone" / "fail_beep"

Pilih secara rawak untuk variasi.

────────────────────────
🎯 ENGAGEMENT:
- Sekurang-kurangnya 20% dalam bentuk situasi harian
- Gunakan nama tempatan (Ali, Siti, dll)
- Soalan pendek & jelas

────────────────────────
⚙️ FORMAT SETIAP GAME:

multiple_choice: { "type": "multiple_choice", "soalan": "", "pilihan": ["", "", "", ""], "jawapan": "", "sound_correct": "", "sound_wrong": "" }

true_false: { "type": "true_false", "soalan": "", "pilihan": ["Betul", "Salah"], "jawapan": "", "sound_correct": "", "sound_wrong": "" }

matching: { "type": "matching", "soalan": "", "pairs": [{"kiri": "", "kanan": ""}], "jawapan": "", "sound_correct": "", "sound_wrong": "" }

fill_blank: { "type": "fill_blank", "soalan": "", "jawapan": "", "sound_correct": "", "sound_wrong": "" }

ordering: { "type": "ordering", "soalan": "", "items": [], "jawapan": [], "sound_correct": "", "sound_wrong": "" }

odd_one_out: { "type": "odd_one_out", "soalan": "", "pilihan": ["", "", "", ""], "jawapan": "", "sound_correct": "", "sound_wrong": "" }

short_answer: { "type": "short_answer", "soalan": "", "jawapan": "", "sound_correct": "", "sound_wrong": "" }

categorization: { "type": "categorization", "soalan": "", "kategori": ["", ""], "items": [{"item": "", "jawapan": ""}], "sound_correct": "", "sound_wrong": "" }

yes_no: { "type": "yes_no", "soalan": "", "pilihan": ["Ya", "Tidak"], "jawapan": "", "sound_correct": "", "sound_wrong": "" }

────────────────────────
📦 FORMAT OUTPUT (WAJIB JSON SAHAJA):

[
  {
    "type": "",
    "soalan": "",
    "pilihan": [],
    "jawapan": "",
    "sound_correct": "",
    "sound_wrong": ""
  }
]

────────────────────────
🔍 VALIDASI AKHIR:
- Bilangan item = ${needed}
- Minimum 4 jenis game berbeda digunakan
- Tiada duplicate
- Jawapan tepat
- Struktur JSON valid
- Semua item ada sound_correct & sound_wrong
- Tiada format berulang`;

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
      type: 'object',
      properties: {
        questions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', description: 'Game type (multiple_choice, true_false, matching, fill_blank, ordering, odd_one_out, short_answer, categorization, yes_no)' },
              soalan: { type: 'string', description: 'Teks soalan' },
              pilihan: { type: 'array', items: { type: 'string' }, description: 'Pilihan jawapan (fleksibel bilangan)' },
              pairs: { type: 'array', items: { type: 'object' }, description: 'Untuk matching type' },
              items: { type: 'array', items: { type: 'string' }, description: 'Untuk ordering type' },
              kategori: { type: 'array', items: { type: 'string' }, description: 'Untuk categorization type' },
              jawapan: { type: 'string', description: 'Jawapan yang tepat' },
              sound_correct: { type: 'string', description: 'Correct sound effect (correct_pop, correct_ding, success_chime)' },
              sound_wrong: { type: 'string', description: 'Wrong sound effect (wrong_buzz, error_tone, fail_beep)' },
            },
            required: ['type', 'soalan', 'jawapan', 'sound_correct', 'sound_wrong'],
          },
          minItems: needed,
          maxItems: needed,
        },
      },
      required: ['questions'],
    },
  });

  // Transform format
  const questions = result?.questions || [];
  return questions
    .filter(q => {
      // Validate based on game type
      if (!q.soalan || !q.jawapan || !q.type || !q.sound_correct || !q.sound_wrong) return false;
      
      if (q.type === 'matching' && q.pairs?.length >= 2) return true;
      if (q.type === 'ordering' && q.items?.length >= 2) return true;
      if (q.type === 'categorization' && q.kategori?.length >= 2) return true;
      if (q.type === 'fill_blank' || q.type === 'short_answer') return true;
      if ((q.type === 'true_false' || q.type === 'yes_no') && q.pilihan?.length === 2 && q.pilihan.includes(q.jawapan)) return true;
      if (q.pilihan?.length >= min && q.pilihan?.length <= max && q.pilihan.includes(q.jawapan)) return true;
      
      return false;
    })
    .map((q) => {
      // Keep original structure but add game type and sounds
      const answerIndex = q.pilihan ? q.pilihan.indexOf(q.jawapan) : -1;
      return {
        type: q.type,
        problem: q.soalan,
        options: q.pilihan || [],
        answer: answerIndex >= 0 ? answerIndex : 0,
        pairs: q.pairs,
        items: q.items,
        kategori: q.kategori,
        sound_correct: q.sound_correct,
        sound_wrong: q.sound_wrong,
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
        console.error(`Error game ${game.id} (${game.title}): ${err.message}`);
        console.error(`Stack:`, err.stack);
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