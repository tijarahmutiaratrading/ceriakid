import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const COST_PER_BBM = 10;

const SUBJECT_LABELS = {
  bahasa_melayu: 'Bahasa Melayu',
  english: 'Bahasa Inggeris',
  mathematics: 'Matematik',
  science: 'Sains',
  jawi: 'Jawi',
  pendidikan_islam: 'Pendidikan Islam',
  sejarah: 'Sejarah',
};

const LEVEL_LABELS = {
  prasekolah: 'Prasekolah (KSPK)',
  darjah_1: 'Darjah 1',
  darjah_2: 'Darjah 2',
  darjah_3: 'Darjah 3',
  darjah_4: 'Darjah 4',
  darjah_5: 'Darjah 5',
  darjah_6: 'Darjah 6',
};

const TYPE_LABELS = {
  lembaran_kerja: 'Lembaran Kerja (worksheet dengan 8-12 soalan latihan)',
  nota_ringkas: 'Nota Ringkas (ringkasan konsep utama dengan contoh)',
  latihan_kbat: 'Latihan KBAT (5-8 soalan kemahiran berfikir aras tinggi)',
  kuiz: 'Kuiz (10 soalan aneka pilihan dengan jawapan di hujung)',
  mind_map: 'Mind Map (peta minda struktur konsep)',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { subject, level, type, topic } = await req.json();
    if (!subject || !level || !type || !topic || topic.trim().length < 3) {
      return Response.json({ error: 'Sila isi semua maklumat' }, { status: 400 });
    }

    // ─── Check & deduct credits ───
    const credits = await base44.asServiceRole.entities.UserCredit.filter({ userEmail: user.email });
    if (credits.length === 0 || (credits[0].balance || 0) < COST_PER_BBM) {
      return Response.json({
        error: 'INSUFFICIENT_CREDITS',
        balance: credits[0]?.balance || 0,
        required: COST_PER_BBM,
      }, { status: 402 });
    }

    const credit = credits[0];
    const newBalance = (credit.balance || 0) - COST_PER_BBM;
    const nowIso = new Date().toISOString();

    await base44.asServiceRole.entities.UserCredit.update(credit.id, {
      balance: newBalance,
      totalUsed: (credit.totalUsed || 0) + COST_PER_BBM,
      lastUsedAt: nowIso,
    });

    const subjectLabel = SUBJECT_LABELS[subject] || subject;
    const levelLabel = LEVEL_LABELS[level] || level;
    const typeLabel = TYPE_LABELS[type] || type;

    const prompt = `Anda adalah pakar pendidikan KSSR/KSPK Malaysia. Bina ${typeLabel} dalam Bahasa Melayu.

Maklumat:
- Subjek: ${subjectLabel}
- Tahap: ${levelLabel}
- Tajuk/Topik: ${topic}

Arahan:
- Pastikan kandungan selaras dengan sukatan KSSR/KSPK kebangsaan Malaysia
- Gunakan bahasa yang sesuai dengan tahap pelajar
- Struktur kandungan mesti jelas dan mudah dicetak (printer-friendly)
- Jangan masukkan gambar/imej (gunakan emoji jika perlu)
- Untuk lembaran kerja: sertakan ruang jawapan
- Untuk kuiz: letak jawapan di seksyen terakhir
- Untuk nota: gunakan headings, bullet points, dan jadual jika sesuai

Format jawapan dalam JSON:
{
  "title": "Tajuk BBM yang lengkap dan menarik",
  "emoji": "1 emoji utama",
  "htmlContent": "HTML lengkap untuk dicetak. WAJIB include: tajuk dengan <h1>, nama murid & tarikh kosong di atas, kandungan utama dengan heading struktur <h2>/<h3>, gunakan <ol>/<ul> untuk senarai, <table> jika perlu. Style inline minimum: padding, line-height, font-family Arial. JANGAN sertakan <html>/<head>/<body> tag — content sahaja yang akan dimasukkan dalam container. Maksimum 1 muka surat A4."
}`;

    let bbmData;
    try {
      const llmResponse = await base44.integrations.Core.InvokeLLM({
        prompt,
        model: 'claude_sonnet_4_6',
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            emoji: { type: 'string' },
            htmlContent: { type: 'string' },
          },
          required: ['title', 'htmlContent'],
        },
      });
      bbmData = llmResponse;
      if (!bbmData?.title || !bbmData?.htmlContent) {
        throw new Error('BBM tidak lengkap dijana');
      }
    } catch (llmErr) {
      // Refund
      await base44.asServiceRole.entities.UserCredit.update(credit.id, {
        balance: credit.balance,
        totalUsed: credit.totalUsed || 0,
      });
      await base44.asServiceRole.entities.CreditTransaction.create({
        userEmail: user.email,
        type: 'refund',
        amount: COST_PER_BBM,
        balanceAfter: credit.balance,
        feature: 'bbm_generator',
        description: 'Refund — Penjana BBM gagal',
      });
      return Response.json({ error: 'Gagal menjana BBM. Kredit dikembalikan.', detail: llmErr.message }, { status: 500 });
    }

    // Log transaction
    await base44.asServiceRole.entities.CreditTransaction.create({
      userEmail: user.email,
      type: 'usage',
      amount: -COST_PER_BBM,
      balanceAfter: newBalance,
      feature: 'bbm_generator',
      description: `BBM: ${bbmData.title}`,
      metadata: { subject, level, type, topic, model: 'claude_sonnet_4_6' },
    });

    return Response.json({
      success: true,
      bbm: bbmData,
      newBalance,
      creditsUsed: COST_PER_BBM,
    });
  } catch (error) {
    console.error('generateCustomBBM error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});