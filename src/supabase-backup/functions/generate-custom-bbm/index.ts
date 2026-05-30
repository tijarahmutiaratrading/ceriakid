// BBM generator (Cikgu Daniel) — 8 credits per BBM
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin, getUserFromRequest } from '../_shared/supabaseAdmin.ts';
import { deductCredits, refundCredits } from '../_shared/credits.ts';
import { invokeLLM } from '../_shared/llm.ts';

const COST = 8;

const SUBJECT_LABELS: Record<string, string> = {
  bahasa_melayu: 'Bahasa Melayu', english: 'Bahasa Inggeris',
  mathematics: 'Matematik', science: 'Sains', jawi: 'Jawi',
  pendidikan_islam: 'Pendidikan Islam', sejarah: 'Sejarah',
};
const LEVEL_LABELS: Record<string, string> = {
  prasekolah: 'Prasekolah (KSPK)', darjah_1: 'Darjah 1', darjah_2: 'Darjah 2',
  darjah_3: 'Darjah 3', darjah_4: 'Darjah 4', darjah_5: 'Darjah 5', darjah_6: 'Darjah 6',
};
const TYPE_LABELS: Record<string, string> = {
  lembaran_kerja: 'Lembaran Kerja (worksheet dengan 8-12 soalan latihan)',
  nota_ringkas: 'Nota Ringkas (ringkasan konsep utama dengan contoh)',
  latihan_kbat: 'Latihan KBAT (5-8 soalan kemahiran berfikir aras tinggi)',
  kuiz: 'Kuiz (10 soalan aneka pilihan dengan jawapan di hujung)',
  mind_map: 'Mind Map (peta minda struktur konsep)',
};

Deno.serve(async (req) => {
  const cors = handleCors(req); if (cors) return cors;

  try {
    const user = await getUserFromRequest(req);
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

    const { subject, level, type, topic } = await req.json();
    if (!subject || !level || !type || !topic || topic.trim().length < 3) {
      return jsonResponse({ error: 'Sila isi semua maklumat' }, 400);
    }

    const deduction = await deductCredits(user.email, COST, 'bbm_generator',
      `BBM ${type}: ${topic.substring(0, 60)}`,
      { subject, level, type, topic, model: 'gpt-4o' });
    if (!deduction.ok) return jsonResponse({ error: 'INSUFFICIENT_CREDITS', balance: deduction.newBalance, required: COST }, 402);

    const subjectLabel = SUBJECT_LABELS[subject] || subject;
    const levelLabel = LEVEL_LABELS[level] || level;
    const typeLabel = TYPE_LABELS[type] || type;

    const prompt = `Anda pakar pendidikan KSSR/KSPK Malaysia. Bina ${typeLabel} dalam Bahasa Melayu.

Maklumat:
- Subjek: ${subjectLabel}
- Tahap: ${levelLabel}
- Tajuk/Topik: ${topic}

Arahan:
- Selaras KSSR/KSPK kebangsaan
- Bahasa sesuai dengan tahap
- Struktur jelas & printer-friendly
- Jangan masukkan gambar (gunakan emoji jika perlu)
- Worksheet: sertakan ruang jawapan
- Kuiz: jawapan di seksyen akhir
- Nota: guna headings, bullet, jadual`;

    let bbmData: any;
    try {
      bbmData = await invokeLLM({
        prompt, model: 'gpt_5_4',
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' }, emoji: { type: 'string' }, htmlContent: { type: 'string' },
          },
          required: ['title', 'htmlContent'],
        },
      });
      if (!bbmData?.title || !bbmData?.htmlContent) throw new Error('BBM tidak lengkap');
    } catch (llmErr) {
      await refundCredits(user.email, COST, 'bbm_generator', 'Refund — Penjana BBM gagal');
      return jsonResponse({ error: 'Gagal menjana BBM. Kredit dikembalikan.', detail: (llmErr as Error).message }, 500);
    }

    let savedId: string | null = null;
    try {
      const { data: saved } = await supabaseAdmin.from('ck_bbm_resources').insert({
        title: bbmData.title, emoji: bbmData.emoji || '📄',
        html_content: bbmData.htmlContent, subject, level, type,
        description: `Topik: ${topic}`,
        tags: [subjectLabel, levelLabel, topic],
        tier: 'free', is_published: false,
        created_by: user.email,
      }).select().single();
      savedId = saved?.id || null;
    } catch (e) { console.error('save bbm:', (e as Error).message); }

    return jsonResponse({
      success: true,
      bbm: { ...bbmData, id: savedId },
      newBalance: deduction.newBalance,
      creditsUsed: COST,
    });
  } catch (error) {
    console.error('generateCustomBBM:', error);
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});