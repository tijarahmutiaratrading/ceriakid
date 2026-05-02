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
  const existingSample = existingQuestions.slice(0, 3).map(q => q.problem || q.question || '').join('; ');

  const prompt = `Kamu adalah pembuat soalan pendidikan kanak-kanak Malaysia.

Buat ${needed} soalan BARU dan UNIK untuk game bertajuk: "${game.title}"
Subjek: ${subject}
Peringkat: ${ageDesc}
Jenis game: ${game.type || 'multiple_choice'}

${existingSample ? `Contoh soalan sedia ada (JANGAN ulang): ${existingSample}` : ''}

Keperluan:
- Setiap soalan mesti berkaitan dengan topik game
- 3-4 pilihan jawapan (options)
- Satu jawapan betul (answer = index 0,1,2 atau 3)
- Bahasa yang sesuai dengan umur kanak-kanak
- Soalan mesti BERBEZA antara satu sama lain
- Kalau bahasa_melayu: soalan dalam BM; kalau english: soalan dalam English; lain-lain ikut subjek

Balas dalam JSON array sahaja, format:
[
  {"problem": "Soalan...", "options": ["A","B","C","D"], "answer": 1},
  ...
]`;

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
              options: { type: 'array', items: { type: 'string' } },
              answer: { type: 'number' },
            },
            required: ['problem', 'options', 'answer'],
          },
        },
      },
      required: ['questions'],
    },
  });

  return result.questions || [];
}

// Filter out dummy questions
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

    const { targetCount, ageGroup, category } = await req.json();

    if (!targetCount || targetCount < 1) {
      return Response.json({ error: 'targetCount required' }, { status: 400 });
    }
    if (!ageGroup || !category) {
      return Response.json({ error: 'ageGroup and category required' }, { status: 400 });
    }

    const games = await base44.asServiceRole.entities.Game.filter({ ageGroup, category });

    let expanded = 0;
    let reduced = 0;
    let unchanged = 0;
    let errors = 0;

    for (const game of games) {
      try {
        // Only keep real questions, strip dummies
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
          // Generate real AI questions for the gap
          const generated = await generateQuestionsForGame(base44, game, needed, realQuestions);
          // Take only what we need
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
        console.error(`Error processing game ${game.id}: ${err.message}`);
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
      message: `${expanded} games expanded with AI questions, ${reduced} reduced, ${unchanged} unchanged, ${errors} errors`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});