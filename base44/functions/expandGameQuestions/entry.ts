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

async function generateQuestionsAI(base44, game, needed) {
  const subject = CATEGORY_LANG[game.category] || game.category;
  const ageDesc = AGE_DESC[game.ageGroup] || game.ageGroup;
  const existingSample = (game.gameData?.questions || [])
    .slice(0, 2)
    .map(q => q.problem || q.question || '')
    .filter(Boolean)
    .join('; ');

  const prompt = `Kamu adalah expert pembuat soalan pendidikan Malaysia yang SANGAT BIJAK.

Buat TEPAT ${needed} soalan BARU untuk game: "${game.title}"
Subjek: ${subject}
Peringkat: ${ageDesc}
Jenis: ${game.type || 'multiple_choice'}

${existingSample ? `Contoh sedia ada (JANGAN ULANG): ${existingSample}` : ''}

KEPERLUAN:
- Soalan JELAS, TEPAT, RELEVAN dengan tajuk
- Tepat 4 pilihan BERBEZA dan masuk akal
- Jawapan betul PASTI betul (jangan samar)
- Emoji MATCH dengan jawapan betul (contoh: 🦁 = gajah/singa)
- Bahasa sesuai kanak-kanak
- JANGAN ULANG soalan yang sedia ada

Balas JSON TEPAT ${needed} soalan:`;

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
              problem: { type: 'string' },
              options: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4 },
              answer: { type: 'number', minimum: 0, maximum: 3 },
              emoji: { type: 'string' },
            },
            required: ['problem', 'options', 'answer', 'emoji'],
          },
          minItems: needed,
        },
      },
      required: ['questions'],
    },
  });

  return result.questions || [];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { fileName, targetCount } = await req.json();

    const module = await import(`../lib/${fileName}.js`);
    const games = module[Object.keys(module)[0]];

    if (!games || games.length === 0) {
      return Response.json({ error: 'File kosong' }, { status: 400 });
    }

    let totalQuestionsAdded = 0;
    let gamesUpdated = 0;

    for (const game of games) {
      const currentCount = game.gameData?.questions?.length || 0;
      
      if (targetCount > currentCount) {
        const needed = targetCount - currentCount;
        const aiQuestions = await generateQuestionsAI(base44, game, needed);

        game.gameData.questions.push(...aiQuestions.slice(0, needed));
        game.totalQuestions = targetCount;
        totalQuestionsAdded += needed;
        gamesUpdated++;
      }
    }

    return Response.json({
      success: true,
      fileName,
      gamesUpdated,
      totalQuestions: targetCount,
      totalQuestionsAdded,
      message: `✅ ${gamesUpdated} games expand ke ${targetCount} soalan dengan AI`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});