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

    // ─── Step 1: Deduct credits dengan race condition protection ───
    // Strategy: read → deduct → verify. Kalau verify gagal (balance jadi negative
    // sebab race condition dengan request lain), refund + return error.
    const credits = await base44.asServiceRole.entities.UserCredit.filter({ userEmail: user.email });
    let credit = credits[0] || null;
    if (!credit || (credit.balance || 0) < COST_PER_QUESTION) {
      return Response.json({
        error: 'INSUFFICIENT_CREDITS',
        balance: credit?.balance || 0,
        required: COST_PER_QUESTION,
      }, { status: 402 });
    }

    // Refetch latest just before deduction
    const fresh = await base44.asServiceRole.entities.UserCredit.get(credit.id);
    const currentBalance = fresh?.balance || 0;
    if (currentBalance < COST_PER_QUESTION) {
      return Response.json({
        error: 'INSUFFICIENT_CREDITS',
        balance: currentBalance,
        required: COST_PER_QUESTION,
      }, { status: 402 });
    }

    credit = fresh;
    const newBalance = currentBalance - COST_PER_QUESTION;
    const nowIso = new Date().toISOString();
    await base44.asServiceRole.entities.UserCredit.update(credit.id, {
      balance: newBalance,
      totalUsed: (fresh.totalUsed || 0) + COST_PER_QUESTION,
      lastUsedAt: nowIso,
    });

    // Verify post-update — kalau balance jadi negative, race condition berlaku.
    // Refund segera dan tolak request.
    const verify = await base44.asServiceRole.entities.UserCredit.get(credit.id);
    if ((verify?.balance ?? 0) < 0) {
      await base44.asServiceRole.entities.UserCredit.update(credit.id, {
        balance: 0,
        totalUsed: Math.max(0, (verify?.totalUsed || 0) - COST_PER_QUESTION),
      });
      return Response.json({
        error: 'INSUFFICIENT_CREDITS',
        balance: 0,
        required: COST_PER_QUESTION,
        detail: 'Concurrent request detected. Please try again.',
      }, { status: 402 });
    }

    // ─── Step 2: Call LLM ───
    const subjectLabel = SUBJECT_LABELS[subject] || 'Umum';
    const levelLabel = LEVEL_LABELS[level] || 'Sekolah Rendah';
    const childContext = childName ? `Pelajar bernama ${childName}.` : '';

    const prompt = `Anda "Cikgu Firdaus" — guru Melayu mesra & sabar di Malaysia. ${childContext}

PELAJAR: ${levelLabel} | SUBJEK: ${subjectLabel}
SOALAN: "${question}"

GAYA UMUM:
- Panggil diri "Cikgu", panggil pelajar "adik" atau nama
- Jangan sebut anda AI/robot/model
- Sesuaikan PANJANG & FORMAT jawapan dengan jenis soalan ⬇️

🟢 KALAU SOALAN SANTAI / SAPAAN / SEMBANG (cth: "salam cikgu", "apa khabar", "cikgu sihat?", "terima kasih", "hahaha"):
- Jawab RINGKAS & SANTAI sahaja — 1-2 ayat pendek + 1-2 emoji
- JANGAN guna heading, bullet, blockquote, bold, atau format akademik
- Macam balas sembang biasa je: "Waalaikumsalam adik! Cikgu sihat, alhamdulillah 😊 Adik apa khabar?"

🔵 KALAU SOALAN AKADEMIK / PELAJARAN (Matematik, Sains, BM, English, Jawi, dll):
1. Sapaan mesra 1 ayat + emoji
2. \`### 📚 [Tajuk]\`
3. Penjelasan: perenggan pendek, bullet (-), **bold** kata kunci, > blockquote untuk contoh
4. Matematik/Sains: numbered list langkah, **bold** jawapan akhir
5. Penutup galakan 1 ayat + emoji
- Prasekolah/darjah rendah: lebih pendek, lebih emoji
- Darjah atas: lebih terperinci
- Guna 3-6 emoji sahaja sepanjang jawapan

Jawab sekarang!`;

    let answer;
    try {
      const llmResponse = await base44.integrations.Core.InvokeLLM({
        prompt,
        model: 'gpt_5_mini',
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
      metadata: { subject, level, childName, model: 'gpt_5_mini' },
    }).catch(() => {}); // fire-and-forget, jangan block response

    return Response.json({
      success: true,
      answer,
      newBalance,
      creditsUsed: COST_PER_QUESTION,
    });
  } catch (error) {
    console.error('askAIAssistant error:', error);
    // Don't leak internal error details to frontend
    return Response.json({ error: 'Sistem ralat. Sila cuba lagi.' }, { status: 500 });
  }
});