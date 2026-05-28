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

    // ─── Step 1: Check & deduct credits (semua user termasuk admin) ───
    const credits = await base44.asServiceRole.entities.UserCredit.filter({ userEmail: user.email });
    let credit = credits[0] || null;
    let newBalance = credit?.balance || 0;

    // Refetch latest balance just before deduction (mitigates double-click race)
    const fresh = credit ? await base44.asServiceRole.entities.UserCredit.get(credit.id) : null;
    const currentBalance = fresh?.balance || 0;
    if (!fresh || currentBalance < COST_PER_QUESTION) {
      return Response.json({
        error: 'INSUFFICIENT_CREDITS',
        balance: currentBalance,
        required: COST_PER_QUESTION,
      }, { status: 402 });
    }
    credit = fresh;
    newBalance = currentBalance - COST_PER_QUESTION;
    const nowIso = new Date().toISOString();
    await base44.asServiceRole.entities.UserCredit.update(credit.id, {
      balance: newBalance,
      totalUsed: (fresh.totalUsed || 0) + COST_PER_QUESTION,
      lastUsedAt: nowIso,
    });

    // ─── Step 2: Call LLM ───
    const subjectLabel = SUBJECT_LABELS[subject] || 'Umum';
    const levelLabel = LEVEL_LABELS[level] || 'Sekolah Rendah';
    const childContext = childName ? `Pelajar bernama ${childName}.` : '';

    const prompt = `Anda "Cikgu Firdaus" — guru Melayu mesra & sabar di Malaysia. ${childContext}

PELAJAR: ${levelLabel} | SUBJEK: ${subjectLabel}
SOALAN: "${question}"

GAYA:
- Panggil diri "Cikgu", panggil pelajar "adik" atau nama
- Sapaan mesra & berbeza setiap kali (cth: "Wah, soalan menarik!", "Okay adik, jom Cikgu terang…")
- Jangan sebut anda AI/robot/model

FORMAT (Markdown, kemas — JANGAN satu blok panjang):
1. Sapaan mesra 1 ayat + emoji
2. \`### 📚 [Tajuk]\`
3. Penjelasan: perenggan pendek, bullet (-), **bold** kata kunci, > blockquote untuk contoh
4. Matematik/Sains: numbered list langkah, **bold** jawapan akhir
5. Penutup galakan 1 ayat + emoji

Untuk prasekolah/darjah rendah: lebih pendek, lebih emoji. Darjah atas: lebih terperinci. Guna 3-6 emoji sahaja sepanjang jawapan.

Jawab sekarang!`;

    let answer;
    try {
      const llmResponse = await base44.integrations.Core.InvokeLLM({
        prompt,
        model: 'gemini_3_flash',
      });
      answer = typeof llmResponse === 'string' ? llmResponse : (llmResponse?.text || JSON.stringify(llmResponse));
    } catch (llmErr) {
      // Refund credit on LLM failure — refetch then add back to current balance
      if (credit) {
        const latest = await base44.asServiceRole.entities.UserCredit.get(credit.id);
        await base44.asServiceRole.entities.UserCredit.update(credit.id, {
          balance: (latest?.balance || 0) + COST_PER_QUESTION,
          totalUsed: Math.max(0, (latest?.totalUsed || 0) - COST_PER_QUESTION),
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

    // ─── Step 3: Log transaction (non-blocking — don't await) ───
    base44.asServiceRole.entities.CreditTransaction.create({
      userEmail: user.email,
      type: 'usage',
      amount: -COST_PER_QUESTION,
      balanceAfter: newBalance,
      feature: 'ai_assistant',
      description: `Soalan: ${question.substring(0, 80)}${question.length > 80 ? '...' : ''}`,
      metadata: { subject, level, childName, model: 'gemini_3_flash' },
    }).catch(() => {}); // fire-and-forget, jangan block response

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