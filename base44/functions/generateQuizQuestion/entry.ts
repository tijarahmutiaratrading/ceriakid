import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const COST_PER_QUIZ = 1;

const SUBJECT_LABELS = {
  bahasa_melayu: 'Bahasa Melayu',
  english: 'English',
  mathematics: 'Matematik',
  science: 'Sains',
  jawi: 'Jawi',
  general: 'Umum / Pengetahuan Am',
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

const DIFFICULTY_LABELS = {
  easy: 'Mudah',
  medium: 'Sederhana',
  hard: 'Mencabar',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { subject, level, topic, difficulty, askedQuestions, childName } = await req.json();
    if (!subject || !level) {
      return Response.json({ error: 'Subjek dan tahap diperlukan' }, { status: 400 });
    }

    // ─── Step 1: Check & deduct credits (admin bypass) — refetch to mitigate races ───
    const isAdmin = user.role === 'admin';
    const credits = await base44.asServiceRole.entities.UserCredit.filter({ userEmail: user.email });
    let credit = credits[0] || null;
    let newBalance = credit?.balance || 0;

    if (!isAdmin) {
      const fresh = credit ? await base44.asServiceRole.entities.UserCredit.get(credit.id) : null;
      const currentBalance = fresh?.balance || 0;
      if (!fresh || currentBalance < COST_PER_QUIZ) {
        return Response.json({
          error: 'INSUFFICIENT_CREDITS',
          balance: currentBalance,
          required: COST_PER_QUIZ,
        }, { status: 402 });
      }
      credit = fresh;
      newBalance = currentBalance - COST_PER_QUIZ;
      const nowIso = new Date().toISOString();
      await base44.asServiceRole.entities.UserCredit.update(credit.id, {
        balance: newBalance,
        totalUsed: (fresh.totalUsed || 0) + COST_PER_QUIZ,
        lastUsedAt: nowIso,
      });
    }

    // ─── Step 2: Build prompt ───
    const subjectLabel = SUBJECT_LABELS[subject] || 'Umum';
    const levelLabel = LEVEL_LABELS[level] || 'Sekolah Rendah';
    const difficultyLabel = DIFFICULTY_LABELS[difficulty] || 'Sederhana';
    const childContext = childName ? `Pelajar bernama ${childName}.` : '';
    const topicLine = topic ? `Topik khusus: ${topic}` : 'Topik: bebas mengikut sukatan.';

    const recentList = Array.isArray(askedQuestions) && askedQuestions.length > 0
      ? '\n\nELAK soalan ini (sudah ditanya):\n' + askedQuestions.slice(-10).map((q, i) => `${i + 1}. ${q}`).join('\n')
      : '';

    const prompt = `Anda adalah pereka soalan kuiz untuk anak Malaysia mengikut sukatan KSPK/KSSR. ${childContext}

Tahap: ${levelLabel}
Subjek: ${subjectLabel}
${topicLine}
Tahap kesukaran: ${difficultyLabel}
${recentList}

TUGAS: Jana SATU soalan kuiz pelbagai pilihan (multiple choice).

ARAHAN KETAT:
- Soalan dalam Bahasa Melayu mudah, jelas, tidak ambiguous.
- 4 pilihan jawapan (1 betul, 3 salah tetapi munasabah/menarik).
- Untuk Prasekolah/Darjah 1: ayat sangat pendek, nombor kecil (1-20), kata mudah, boleh guna emoji dalam pilihan.
- Untuk Darjah 4-6: boleh lebih mencabar, ikut sukatan KSSR sebenar.
- Jawapan betul mesti TEPAT 100% — semak matematik dua kali.
- "explanation" — ringkas 1-2 ayat, terangkan KENAPA jawapan betul.
- "hint" — petua kecil (tanpa beri jawapan terus) untuk anak yang tersangkut.
- "encouragement" — kata-kata semangat untuk dipaparkan selepas anak jawab betul.
- ELAK soalan yang sama dengan senarai yang sudah ditanya.`;

    const responseJsonSchema = {
      type: 'object',
      properties: {
        question: { type: 'string', description: 'Soalan kuiz dalam BM' },
        choices: {
          type: 'array',
          items: { type: 'string' },
          minItems: 4,
          maxItems: 4,
        },
        correctIndex: { type: 'number', description: 'Index jawapan betul (0-3)' },
        explanation: { type: 'string', description: 'Penerangan ringkas jawapan' },
        hint: { type: 'string', description: 'Petua tanpa beri jawapan' },
        encouragement: { type: 'string', description: 'Kata semangat selepas betul' },
        emoji: { type: 'string', description: 'Satu emoji yang mewakili soalan' },
      },
      required: ['question', 'choices', 'correctIndex', 'explanation', 'hint', 'encouragement'],
    };

    // ─── Step 3: Call LLM ───
    let quiz;
    try {
      const llmResponse = await base44.integrations.Core.InvokeLLM({
        prompt,
        model: 'gpt_5_mini',
        response_json_schema: responseJsonSchema,
      });

      quiz = typeof llmResponse === 'object' ? llmResponse : JSON.parse(llmResponse);

      // Validation
      if (!quiz?.question || !Array.isArray(quiz?.choices) || quiz.choices.length !== 4
          || typeof quiz.correctIndex !== 'number' || quiz.correctIndex < 0 || quiz.correctIndex > 3) {
        throw new Error('Format kuiz tidak sah');
      }
    } catch (llmErr) {
      // Refund credit on LLM failure (only if charged) — refetch then add back to current balance
      if (!isAdmin && credit) {
        const latest = await base44.asServiceRole.entities.UserCredit.get(credit.id);
        await base44.asServiceRole.entities.UserCredit.update(credit.id, {
          balance: (latest?.balance || 0) + COST_PER_QUIZ,
          totalUsed: Math.max(0, (latest?.totalUsed || 0) - COST_PER_QUIZ),
        });
        await base44.asServiceRole.entities.CreditTransaction.create({
          userEmail: user.email,
          type: 'refund',
          amount: COST_PER_QUIZ,
          balanceAfter: credit.balance,
          feature: 'ai_assistant',
          description: 'Refund — Kuiz AI gagal',
        });
      }
      return Response.json({ error: 'AI tidak dapat jana soalan. Kredit dikembalikan.', detail: llmErr.message }, { status: 500 });
    }

    // ─── Step 4: Log transaction (skip for admin) ───
    if (!isAdmin) {
      await base44.asServiceRole.entities.CreditTransaction.create({
        userEmail: user.email,
        type: 'usage',
        amount: -COST_PER_QUIZ,
        balanceAfter: newBalance,
        feature: 'ai_assistant',
        description: `Kuiz AI: ${subjectLabel} (${levelLabel})${topic ? ` — ${topic}` : ''}`,
        metadata: { subject, level, topic, difficulty, childName, mode: 'quiz_ai', model: 'gpt_5_mini' },
      });
    }

    return Response.json({
      success: true,
      quiz,
      newBalance,
      creditsUsed: COST_PER_QUIZ,
    });
  } catch (error) {
    console.error('generateQuizQuestion error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});