import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CATEGORY_LANG = {
  bahasa_melayu: 'Bahasa Melayu',
  english: 'English',
  mathematics: 'Matematik',
  science: 'Sains',
  jawi: 'Jawi',
  bahasa_tamil: 'Bahasa Tamil',
  bahasa_mandarin: 'Bahasa Mandarin',
};

const LANGUAGE_RULES = {
  english: 'WAJIB guna English sahaja untuk semua soalan, pilihan jawapan dan jawapan. Jangan guna Bahasa Melayu.',
  bahasa_tamil: 'WAJIB guna Bahasa Tamil sahaja untuk semua soalan, pilihan jawapan dan jawapan. Jangan guna Bahasa Melayu.',
  bahasa_mandarin: 'WAJIB guna Bahasa Mandarin/Chinese sahaja untuk semua soalan, pilihan jawapan dan jawapan. Jangan guna Bahasa Melayu.',
  bahasa_melayu: 'Gunakan Bahasa Melayu Malaysia baku sahaja.',
};

const AGE_DESC = {
  prasekolah: 'prasekolah (umur 4-6 tahun)',
  sekolah_rendah: 'sekolah rendah (umur 7-12 tahun)',
};

const GAME_TYPES_BY_SUBJECT = {
  bahasa_melayu: ['word_builder', 'matching', 'multiple_choice', 'spelling', 'true_false'],
  english: ['word_builder', 'matching', 'multiple_choice', 'spelling', 'true_false'],
  mathematics: ['multiple_choice', 'true_false', 'ordering', 'short_answer', 'matching'],
  science: ['matching', 'multiple_choice', 'true_false', 'short_answer', 'ordering'],
};

async function generateQuestionsForGame(base44, game, needed, existingQuestions) {
  const subject = CATEGORY_LANG[game.category] || game.category;
  const ageDesc = AGE_DESC[game.ageGroup] || game.ageGroup;
  const languageRule = LANGUAGE_RULES[game.category] || 'Gunakan bahasa yang sesuai dengan subjek.';
  const existingSample = existingQuestions.slice(0, 2).map(q => q.problem || q.question || '').filter(Boolean).join('; ');

  const gameTypesForSubject = GAME_TYPES_BY_SUBJECT[game.category] || ['multiple_choice', 'true_false', 'matching'];
  const typesList = gameTypesForSubject.join(', ');
  
  const prompt = `Anda ialah pakar pembina soalan pendidikan Malaysia (KSSR) dan pereka permainan pembelajaran interaktif untuk kanak-kanak.

TUGAS: Jana TEPAT ${needed} soalan pendidikan yang PELBAGAI JENIS dan MENARIK untuk:

Tajuk: "${game.title}"
Subjek: ${subject}
Tahap: ${ageDesc}

${existingSample ? `Jangan ulang soalan ini: ${existingSample}` : ''}

────────────────────
JENIS SOALAN (WAJIB campur dari sini sahaja):
${gameTypesForSubject.map((t, i) => `${i + 1}. ${t}`).join('\n')}

────────────────────
PERATURAN:
- Semua soalan berdasarkan KSSR/KSSM
- Setiap soalan = 1 konsep sahaja
- Bahasa mudah difahami untuk ${ageDesc}
- ${languageRule}
- Distractor mesti munasabah tapi jelas salah
- Gunakan nama tempatan (Ali, Siti, Karim, dll)
- Soalan pendek dan jelas
- WAJIB: Gunakan pelbagai type dari senarai atas, JANGAN semua sama

────────────────────
FORMAT JSON:

{
  "games": [
    {
      "type": "multiple_choice",
      "soalan": "Question text in the subject language",
      "pilihan": ["Option A", "Option B", "Option C", "Option D"],
      "jawapan": "Option A"
    },
    {
      "type": "true_false",
      "soalan": "Statement in the subject language",
      "pilihan": ["True", "False"],
      "jawapan": "True"
    },
    {
      "type": "matching",
      "soalan": "Padankan dengan pasangan yang betul",
      "pairs": [
        {"left": "Bulan", "right": "Malam"},
        {"left": "Matahari", "right": "Siang"}
      ],
      "jawapan": "correct_matches"
    },
    {
      "type": "short_answer",
      "soalan": "Berapa jumlah hari dalam seminggu?",
      "jawapan": "Tujuh"
    }
  ]
}

────────────────────
SEMAK:
✓ Bilangan soalan = ${needed}
✓ Minimum 3 jenis BERBEZA dari senarai atas
✓ Tiada duplicate
✓ Jawapan tepat
✓ JSON valid`;

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    model: 'claude_sonnet_4_6',
    response_json_schema: {
      type: 'object',
      properties: {
        games: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              soalan: { type: 'string' },
              pilihan: { type: 'array', items: { type: 'string' } },
              jawapan: { type: 'string' },
            },
            required: ['type', 'soalan', 'jawapan'],
          },
        },
      },
      required: ['games'],
    },
  });

  const questions = result?.games || [];
  return questions
    .filter(q => {
      if (!q.soalan || !q.jawapan || !q.type) return false;
      
      if (q.type === 'matching') return q.pairs?.length >= 2;
      if (q.type === 'ordering') return q.items?.length >= 2;
      if (q.type === 'fill_blank' || q.type === 'short_answer') return true;
      if (q.type === 'true_false' || q.type === 'yes_no') return q.pilihan?.length === 2;
      if (q.pilihan?.length >= 2 && q.pilihan?.length <= 5 && q.pilihan.includes(q.jawapan)) return true;
      
      return false;
    })
    .map((q) => {
      // Preserve different question types with proper structure
      const base = { type: q.type, problem: q.soalan };
      
      if (q.type === 'true_false' || q.type === 'yes_no') {
        return { ...base, options: q.pilihan || ['Betul', 'Salah'], answer: q.pilihan?.indexOf(q.jawapan) || 0 };
      } else if (q.type === 'short_answer' || q.type === 'fill_blank') {
        return { ...base, answer: q.jawapan };
      } else if (q.type === 'matching') {
        return { ...base, pairs: q.pairs || [] };
      } else if (q.type === 'ordering') {
        return { ...base, items: q.items || [], correctOrder: q.correctOrder || [] };
      }
      
      // Multiple choice and default
      const answerIndex = q.pilihan ? q.pilihan.indexOf(q.jawapan) : -1;
      return { ...base, options: q.pilihan || [], answer: answerIndex >= 0 ? answerIndex : 0 };
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