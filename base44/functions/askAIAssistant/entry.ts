import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const COST_PER_QUESTION = 1;

const SUBJECT_LABELS = {
  bahasa_melayu: 'Bahasa Melayu',
  english: 'English',
  mathematics: 'Matematik',
  science: 'Sains',
  jawi: 'Jawi',
  general: 'Umum',
};

const LEVEL_LABELS = {
  prasekolah: 'Prasekolah (4-6 tahun)',
  darjah_1: 'Darjah 1 (7 tahun)',
  darjah_2: 'Darjah 2 (8 tahun)',
  darjah_3: 'Darjah 3 (9 tahun)',
  darjah_4: 'Darjah 4 (10 tahun)',
  darjah_5: 'Darjah 5 (11 tahun)',
  darjah_6: 'Darjah 6 (12 tahun)',
};

// Detect kalau user nak quiz mode (generate soalan untuk anak jawab)
function detectQuizIntent(question) {
  const q = question.toLowerCase();
  const triggers = [
    'kuiz', 'quiz', 'soalan', 'latih', 'uji', 'test saya', 'cuba saya',
    'tanya saya', 'jana soalan', 'bagi soalan', 'beri soalan',
    'cabar saya', 'main kuiz', 'tanya saya soalan',
  ];
  return triggers.some(t => q.includes(t));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { question, subject, level, childName, history } = await req.json();
    if (!question || question.trim().length < 1) {
      return Response.json({ error: 'Soalan terlalu pendek' }, { status: 400 });
    }

    // ─── Step 1: Check & deduct credits ───
    const credits = await base44.asServiceRole.entities.UserCredit.filter({ userEmail: user.email });
    if (credits.length === 0 || (credits[0].balance || 0) < COST_PER_QUESTION) {
      return Response.json({
        error: 'INSUFFICIENT_CREDITS',
        balance: credits[0]?.balance || 0,
        required: COST_PER_QUESTION,
      }, { status: 402 });
    }

    const credit = credits[0];
    const newBalance = (credit.balance || 0) - COST_PER_QUESTION;
    const nowIso = new Date().toISOString();

    await base44.asServiceRole.entities.UserCredit.update(credit.id, {
      balance: newBalance,
      totalUsed: (credit.totalUsed || 0) + COST_PER_QUESTION,
      lastUsedAt: nowIso,
    });

    // ─── Step 2: Build prompt ───
    const subjectLabel = SUBJECT_LABELS[subject] || 'Umum';
    const levelLabel = LEVEL_LABELS[level] || 'Sekolah Rendah';
    const childContext = childName ? `Pelajar bernama ${childName}.` : '';
    const wantsQuiz = detectQuizIntent(question);

    // Build short conversation context (last 6 messages max)
    const historyContext = Array.isArray(history) && history.length > 0
      ? '\n\nSejarah perbualan terkini:\n' + history.slice(-6).map(m => `${m.role === 'user' ? 'Pelajar' : 'Cikgu'}: ${m.content.substring(0, 300)}`).join('\n')
      : '';

    let prompt;
    let useJsonMode = false;
    let responseJsonSchema = null;

    if (wantsQuiz) {
      useJsonMode = true;
      responseJsonSchema = {
        type: 'object',
        properties: {
          message: { type: 'string', description: 'Mesej pembuka dalam BM, mesra & semangat (1-2 ayat dengan emoji)' },
          quiz: {
            type: 'object',
            properties: {
              question: { type: 'string', description: 'Soalan dalam BM, jelas & sesuai umur' },
              choices: {
                type: 'array',
                items: { type: 'string' },
                minItems: 2,
                maxItems: 4,
                description: 'Pilihan jawapan (2-4 sahaja). Untuk soalan matematik, boleh nombor. Untuk Sains/BM, ayat pendek.',
              },
              correctIndex: { type: 'number', description: 'Index jawapan betul (0-based)' },
              explanation: { type: 'string', description: 'Penjelasan ringkas (1-2 ayat) untuk jawapan betul' },
            },
            required: ['question', 'choices', 'correctIndex', 'explanation'],
          },
        },
        required: ['message', 'quiz'],
      };

      prompt = `Anda adalah Cikgu AI untuk anak Malaysia. ${childContext}

Tahap: ${levelLabel}
Subjek: ${subjectLabel}

Pelajar minta: "${question}"
${historyContext}

ARAHAN PENTING:
- Jana SATU soalan kuiz dalam Bahasa Melayu mudah, sesuai untuk ${levelLabel}.
- Berikan 2-4 pilihan jawapan (1 betul, yang lain salah tetapi munasabah).
- Untuk Prasekolah/Darjah 1: guna ayat pendek, nombor kecil (1-20), atau kata yang biasa.
- Untuk Darjah tinggi: boleh lebih cabaran tetapi masih ikut sukatan KSSR.
- Pastikan jawapan betul TEPAT — periksa dua kali matematik anda!
- "message" — kata-kata semangat ringkas sebelum soalan (cth: "Cuba soalan ni! 🎯")
- "explanation" — terangkan kenapa jawapan betul (1-2 ayat).
- ELAK soalan ambiguous atau ada lebih dari satu jawapan betul.`;
    } else {
      prompt = `Anda adalah Cikgu AI yang ramah dan sabar untuk anak Malaysia. ${childContext}

Tahap: ${levelLabel}
Subjek: ${subjectLabel}

Soalan dari pelajar:
"${question}"
${historyContext}

Arahan jawapan:
- Jawab dalam Bahasa Melayu yang mudah, mesra dan sesuai untuk umur pelajar.
- Beri penjelasan ringkas (maksimum 4-5 ayat), guna contoh atau analogi yang anak kecil boleh faham.
- Gunakan emoji sesuai untuk buat jawapan lebih menarik (1-3 emoji sahaja).
- Kalau soalan tentang Matematik/Sains — tunjukkan langkah berfikir secara ringkas.
- Kalau pelajar baru jawab kuiz (lihat sejarah perbualan), beri respons sesuai (puji kalau betul, beri hint kalau salah) dan TAWARKAN soalan seterusnya secara semula jadi.
- Akhiri dengan satu galakan positif atau soalan susulan.
- JANGAN beri jawapan terlalu panjang.`;
    }

    // ─── Step 3: Call LLM ───
    let answer;
    let quizData = null;
    try {
      const llmResponse = await base44.integrations.Core.InvokeLLM({
        prompt,
        model: 'gpt_5_mini',
        ...(useJsonMode && { response_json_schema: responseJsonSchema }),
      });

      if (useJsonMode && typeof llmResponse === 'object' && llmResponse?.quiz) {
        answer = llmResponse.message || 'Cuba soalan ni! 🎯';
        quizData = llmResponse.quiz;
      } else {
        answer = typeof llmResponse === 'string' ? llmResponse : (llmResponse?.text || JSON.stringify(llmResponse));
      }
    } catch (llmErr) {
      // Refund credit on LLM failure
      await base44.asServiceRole.entities.UserCredit.update(credit.id, {
        balance: credit.balance,
        totalUsed: credit.totalUsed || 0,
      });
      await base44.asServiceRole.entities.CreditTransaction.create({
        userEmail: user.email,
        type: 'refund',
        amount: COST_PER_QUESTION,
        balanceAfter: credit.balance,
        feature: 'ai_assistant',
        description: 'Refund — AI gagal menjawab',
      });
      return Response.json({ error: 'AI tidak dapat menjawab. Kredit dikembalikan.', detail: llmErr.message }, { status: 500 });
    }

    // ─── Step 4: Log transaction ───
    await base44.asServiceRole.entities.CreditTransaction.create({
      userEmail: user.email,
      type: 'usage',
      amount: -COST_PER_QUESTION,
      balanceAfter: newBalance,
      feature: 'ai_assistant',
      description: `${quizData ? '[KUIZ] ' : ''}${question.substring(0, 80)}${question.length > 80 ? '...' : ''}`,
      metadata: { subject, level, childName, model: 'gpt_5_mini', mode: quizData ? 'quiz' : 'qa' },
    });

    return Response.json({
      success: true,
      answer,
      quiz: quizData,
      newBalance,
      creditsUsed: COST_PER_QUESTION,
    });
  } catch (error) {
    console.error('askAIAssistant error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});