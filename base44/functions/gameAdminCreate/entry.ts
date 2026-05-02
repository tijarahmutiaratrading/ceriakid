import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { fileName, gameData } = await req.json();

    const { title, type, category, difficulty = 'easy', tier = 'free', emoji = '🎮', totalQuestions = 8 } = gameData;

    if (!title || !type || !category) {
      return Response.json({ error: 'Missing required fields: title, type, category' }, { status: 400 });
    }

    // Generate AI questions instead of dummy placeholders
    const categoryMap = {
      bahasa_melayu: 'Bahasa Melayu',
      english: 'English',
      mathematics: 'Matematik',
      science: 'Sains',
      jawi: 'Aksara Jawi',
      bahasa_tamil: 'Bahasa Tamil',
      bahasa_mandarin: 'Bahasa Mandarin',
    };

    const ageDesc = {
      prasekolah: 'prasekolah (umur 4-6 tahun)',
      sekolah_rendah: 'sekolah rendah (umur 7-12 tahun)',
    };

    const prompt = `Kamu adalah expert pembuat soalan pendidikan kanak-kanak Malaysia yang BIJAK.

Buat TEPAT ${totalQuestions} soalan berkualiti tinggi untuk game BARU:
Tajuk: "${title}"
Subjek: ${categoryMap[category] || category}
Peringkat: ${ageDesc[gameData.ageGroup] || 'sekolah rendah'}
Jenis: ${type}

KRITERIA KUALITI:
- Soalan BERKAITAN dengan tajuk dan sesuai kurikulum Malaysia
- Tepat 4 pilihan jawapan yang BERBEZA dan MASUK AKAL
- Jawapan betul PASTI betul (jangan samar)
- Emoji RELEVAN dengan soalan, sesuai dengan jawapan betul
- Bahasa jelas, menarik untuk kanak-kanak
- Soalan UNIK antara satu sama lain (JANGAN ULANG)

Balas JSON dengan struktur:
{
  "questions": [
    {
      "problem": "soalan dengan emoji yang relevan 🎯",
      "options": ["pilihan A", "pilihan B", "pilihan C", "pilihan D"],
      "answer": 0,
      "emoji": "🎯"
    }
  ]
}`;

    const aiQuestions = await base44.asServiceRole.integrations.Core.InvokeLLM({
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
          },
        },
        required: ['questions'],
      },
    });

    const newGame = {
      title,
      type,
      category,
      difficulty,
      tier,
      emoji: emoji || (aiQuestions.questions?.[0]?.emoji || '🎮'),
      totalQuestions,
      isPublished: false,
      gameData: {
        questions: (aiQuestions.questions || []).slice(0, totalQuestions),
      },
    };

    return Response.json({
      success: true,
      message: 'Game created with AI-generated questions',
      game: newGame,
      questionsGenerated: newGame.gameData.questions.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});