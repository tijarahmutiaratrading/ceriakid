// AI tutor (Cikgu Firdaus) — 1 credit per question
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { getUserFromRequest } from '../_shared/supabaseAdmin.ts';
import { deductCredits, refundCredits } from '../_shared/credits.ts';
import { invokeLLM } from '../_shared/llm.ts';

const COST = 1;

const SUBJECT_LABELS: Record<string, string> = {
  bahasa_melayu: 'Bahasa Melayu', english: 'English', mathematics: 'Matematik',
  science: 'Sains', jawi: 'Jawi', general: 'Umum',
};
const LEVEL_LABELS: Record<string, string> = {
  prasekolah: 'Prasekolah (4-6 tahun)',
  darjah_1: 'Darjah 1 (7 tahun)', darjah_2: 'Darjah 2 (8 tahun)',
  darjah_3: 'Darjah 3 (9 tahun)', darjah_4: 'Darjah 4 (10 tahun)',
  darjah_5: 'Darjah 5 (11 tahun)', darjah_6: 'Darjah 6 (12 tahun)',
};

Deno.serve(async (req) => {
  const cors = handleCors(req); if (cors) return cors;

  try {
    const user = await getUserFromRequest(req);
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

    const { question, subject, level, childName } = await req.json();
    if (!question || question.trim().length < 3) return jsonResponse({ error: 'Soalan terlalu pendek' }, 400);

    const deduction = await deductCredits(user.email, COST, 'ai_assistant',
      `Soalan: ${question.substring(0, 80)}${question.length > 80 ? '...' : ''}`,
      { subject, level, childName, model: 'gpt-4o-mini' });
    if (!deduction.ok) return jsonResponse({ error: 'INSUFFICIENT_CREDITS', balance: deduction.newBalance, required: COST }, 402);

    const subjectLabel = SUBJECT_LABELS[subject] || 'Umum';
    const levelLabel = LEVEL_LABELS[level] || 'Sekolah Rendah';
    const childContext = childName ? `Pelajar bernama ${childName}.` : '';

    const prompt = `Anda "Cikgu Firdaus" — guru Melayu mesra & sabar di Malaysia. ${childContext}

PELAJAR: ${levelLabel} | SUBJEK: ${subjectLabel}
SOALAN: "${question}"

GAYA UMUM:
- Panggil diri "Cikgu", panggil pelajar "adik" atau nama
- Jangan sebut anda AI/robot/model
- Sesuaikan PANJANG & FORMAT jawapan dengan jenis soalan

🟢 KALAU SOALAN SANTAI / SAPAAN / SEMBANG:
- Jawab RINGKAS 1-2 ayat + 1-2 emoji, tiada heading/bullet

🔵 KALAU SOALAN AKADEMIK:
1. Sapaan mesra 1 ayat + emoji
2. ### 📚 [Tajuk]
3. Penjelasan dengan bullet & **bold** kata kunci
4. Matematik/Sains: numbered list langkah, **bold** jawapan
5. Penutup galakan 1 ayat + emoji
- Guna 3-6 emoji sepanjang jawapan

Jawab sekarang!`;

    let answer: string;
    try {
      answer = await invokeLLM({ prompt, model: 'gpt_5_mini' });
    } catch (llmErr) {
      await refundCredits(user.email, COST, 'ai_assistant', 'Refund — AI gagal menjawab');
      return jsonResponse({ error: 'AI tidak dapat menjawab. Kredit dikembalikan.', detail: (llmErr as Error).message }, 500);
    }

    return jsonResponse({ success: true, answer, newBalance: deduction.newBalance, creditsUsed: COST });
  } catch (error) {
    console.error('askAIAssistant:', error);
    return jsonResponse({ error: 'Sistem ralat. Sila cuba lagi.' }, 500);
  }
});