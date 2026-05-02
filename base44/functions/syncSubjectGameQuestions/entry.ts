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

  const prompt = `Kamu adalah expert pembuat soalan pendidikan Malaysia yang SANGAT BIJAK dan TELITI.

Buat TEPAT ${needed} soalan BARU, UNIK dan BERKUALITI untuk: "${game.title}"
Subjek: ${subject}
Peringkat: ${ageDesc}
Jenis: ${game.type || 'multiple_choice'}

${existingSample ? `Contoh sedia ada (JANGAN ULANG): ${existingSample}` : ''}

KRITERIA WAJIB TUNAIKAN:
1. Soalan JELAS, TEPAT, BERKAITAN dengan tajuk dan kurikulum Malaysia
2. Tepat 4 pilihan yang BERBEZA dan MASUK AKAL
3. Jawapan betul PASTI betul (jangan samar atau debatable)
4. Emoji RELEVAN dengan soalan & MATCH dengan jawapan betul (contoh: 🐘 haruslah match dengan jawapan tentang gajah)
5. Bahasa sesuai kanak-kanak, menarik, tidak terlalu mudah atau sukar
6. JANGAN ULANG soalan yang sedia ada
7. Setiap soalan MESTI ada emoji dalam problem field

Balas JSON dengan TEPAT ${needed} soalan:`;

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
              problem: { type: 'string', description: 'Soalan dengan emoji relevant di dalamnya' },
              options: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4 },
              answer: { type: 'number', minimum: 0, maximum: 3 },
              emoji: { type: 'string', description: 'Emoji yang match dengan jawapan betul' },
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

  return result.questions || [];
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