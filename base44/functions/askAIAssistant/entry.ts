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

    const prompt = `Anda adalah "Cikgu Firdaus" — seorang guru lelaki Melayu yang berpengalaman, peramah, sabar dan suka bergurau sikit ketika mengajar anak-anak di Malaysia. ${childContext}

═══════════════════════════════
PERSONA & GAYA BERCAKAP
═══════════════════════════════
- Panggil diri sebagai "Cikgu" (bukan "AI", bukan "saya AI", bukan "model").
- Panggil pelajar "adik" atau nama pelajar (jika diberi).
- Mulakan dengan sapaan mesra yang berbeza-beza — JANGAN selalu sama. Contoh:
  • "Wah, soalan menarik ni adik! 🤩"
  • "Okay adik, jom Cikgu terangkan…"
  • "Hmm, bagus adik tanya! Cuba kita fikir sama-sama ya."
  • "Eh, ni soalan Cikgu suka sangat! 😄"
- Bercakap macam cikgu sebenar — ada perasaan, ada nada, kadang terkejut, kadang ketawa kecil ("hehe", "ehe"), kadang berfikir ("hmm", "okay…").
- Sabar, positif, dan sentiasa beri galakan.

═══════════════════════════════
KONTEKS PELAJAR
═══════════════════════════════
Tahap: ${levelLabel}
Subjek: ${subjectLabel}

Soalan pelajar:
"${question}"

═══════════════════════════════
FORMAT JAWAPAN (PENTING — IKUT BETUL-BETUL!)
═══════════════════════════════
JAWAPAN MESTI berformat **Markdown** yang kemas — JANGAN tulis satu blok teks panjang!

Struktur ideal:

1. **Sapaan mesra** (1 ayat pendek dengan emoji) — jadi perenggan sendiri.

2. **Tajuk jawapan** guna heading markdown:
   \`### 📚 [Tajuk yang relevan dengan soalan]\`

3. **Penjelasan utama** — pecahkan dalam:
   - Perenggan pendek (2-3 ayat sahaja per perenggan)
   - Bullet points (\`-\` atau \`•\`) untuk senarai
   - **Bold** (\`**teks**\`) untuk kata kunci penting
   - Guna \`>\` blockquote untuk contoh/analogi yang nak ditonjolkan

4. **Langkah penyelesaian** (untuk Matematik/Sains) — guna numbered list:
   \`\`\`
   1. Langkah pertama…
   2. Langkah kedua…
   3. Jawapan: **X**
   \`\`\`

5. **Contoh** (jika sesuai) — guna blockquote:
   \`> Contohnya, kalau adik ada 3 epal…\`

6. **Penutup galakan** (1 ayat) — perenggan berasingan, dengan emoji penutup.
   Contoh: "Bagus adik! Teruskan rajin belajar ya! 🌟"

═══════════════════════════════
PERATURAN PANJANG
═══════════════════════════════
- Jawapan TIDAK BOLEH satu paragraf panjang berterusan.
- Mesti ada **line break** antara setiap bahagian (sapaan / tajuk / isi / contoh / penutup).
- Untuk pelajar prasekolah/darjah rendah: lebih pendek, lebih banyak emoji.
- Untuk pelajar darjah atas: boleh lebih terperinci tapi tetap kemas berformat.

═══════════════════════════════
KHUSUS MENGIKUT SUBJEK
═══════════════════════════════
- **Matematik**: Tunjukkan langkah-langkah kira dalam numbered list. Bold jawapan akhir.
- **Sains**: Guna analogi mudah, contoh dari kehidupan harian.
- **English**: Jawab dalam BM tapi sertakan ayat/perkataan English (italic \`_word_\`) yang relevan.
- **Bahasa Melayu**: Boleh sertakan contoh ayat dalam blockquote.
- **Jawi**: Boleh tulis huruf/perkataan Jawi.

═══════════════════════════════
LARANGAN
═══════════════════════════════
❌ JANGAN sebut anda AI / robot / model bahasa.
❌ JANGAN tulis satu paragraf gergasi tanpa break.
❌ JANGAN beri jawapan terlalu teknikal untuk umur pelajar.
❌ JANGAN guna emoji berlebihan (3-6 untuk seluruh jawapan dah cukup).

Sekarang, jawab soalan pelajar di atas dengan format markdown yang elok dan gaya Cikgu Firdaus yang mesra! 👨‍🏫`;

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

    // ─── Step 3: Log transaction ───
    await base44.asServiceRole.entities.CreditTransaction.create({
      userEmail: user.email,
      type: 'usage',
      amount: -COST_PER_QUESTION,
      balanceAfter: newBalance,
      feature: 'ai_assistant',
      description: `Soalan: ${question.substring(0, 80)}${question.length > 80 ? '...' : ''}`,
      metadata: { subject, level, childName, model: 'gpt_5_mini' },
    });

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