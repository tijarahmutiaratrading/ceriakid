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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { question, subject, level, childName } = await req.json();
    if (!question || question.trim().length < 3) {
      return Response.json({ error: 'Soalan terlalu pendek' }, { status: 400 });
    }

    // ─── Step 1: Check & deduct credits (admin bypass) ───
    const isAdmin = user.role === 'admin';
    const credits = await base44.asServiceRole.entities.UserCredit.filter({ userEmail: user.email });
    let credit = credits[0] || null;
    let newBalance = credit?.balance || 0;

    if (!isAdmin) {
      if (!credit || (credit.balance || 0) < COST_PER_QUESTION) {
        return Response.json({
          error: 'INSUFFICIENT_CREDITS',
          balance: credit?.balance || 0,
          required: COST_PER_QUESTION,
        }, { status: 402 });
      }
      newBalance = (credit.balance || 0) - COST_PER_QUESTION;
      const nowIso = new Date().toISOString();
      await base44.asServiceRole.entities.UserCredit.update(credit.id, {
        balance: newBalance,
        totalUsed: (credit.totalUsed || 0) + COST_PER_QUESTION,
        lastUsedAt: nowIso,
      });
    }

    // ─── Step 2: Call LLM ───
    const subjectLabel = SUBJECT_LABELS[subject] || 'Umum';
    const levelLabel = LEVEL_LABELS[level] || 'Sekolah Rendah';
    const childContext = childName ? `Pelajar bernama ${childName}.` : '';

    const prompt = `Anda adalah cikgu yang ramah dan sabar untuk anak Malaysia. ${childContext}

Tahap: ${levelLabel}
Subjek: ${subjectLabel}

Soalan dari pelajar:
"${question}"

Arahan jawapan:
- Jawab dalam Bahasa Melayu yang mudah, mesra dan sesuai untuk umur pelajar.
- Beri penjelasan ringkas (maksimum 4-5 ayat), guna contoh atau analogi yang anak kecil boleh faham.
- Gunakan emoji sesuai untuk buat jawapan lebih menarik (1-3 emoji sahaja).
- Kalau soalan tentang Matematik/Sains — tunjukkan langkah berfikir secara ringkas.
- Kalau soalan English — jawab dalam BM tapi sertakan ayat English yang relevan.
- Akhiri dengan satu galakan positif (cth: "Bagus! Teruskan belajar! 🌟").
- JANGAN beri jawapan terlalu panjang atau berbelit-belit.`;

    let answer;
    try {
      const llmResponse = await base44.integrations.Core.InvokeLLM({
        prompt,
        model: 'gpt_5_mini',
      });
      answer = typeof llmResponse === 'string' ? llmResponse : (llmResponse?.text || JSON.stringify(llmResponse));
    } catch (llmErr) {
      // Refund credit on LLM failure (only if charged)
      if (!isAdmin && credit) {
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
      }
      return Response.json({ error: 'AI tidak dapat menjawab. Kredit dikembalikan.', detail: llmErr.message }, { status: 500 });
    }

    // ─── Step 3: Log transaction (skip for admin) ───
    if (!isAdmin) {
      await base44.asServiceRole.entities.CreditTransaction.create({
        userEmail: user.email,
        type: 'usage',
        amount: -COST_PER_QUESTION,
        balanceAfter: newBalance,
        feature: 'ai_assistant',
        description: `Soalan: ${question.substring(0, 80)}${question.length > 80 ? '...' : ''}`,
        metadata: { subject, level, childName, model: 'gpt_5_mini' },
      });
    }

    return Response.json({
      success: true,
      answer,
      newBalance,
      creditsUsed: COST_PER_QUESTION,
    });
  } catch (error) {
    console.error('askAIAssistant error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});