// Quiz generator (Cikgu Rosie) — 1 credit per question
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { getUserFromRequest } from '../_shared/supabaseAdmin.ts';
import { deductCredits, refundCredits } from '../_shared/credits.ts';
import { invokeLLM } from '../_shared/llm.ts';

const COST = 1;

const SUBJECT_LABELS: Record<string, string> = {
  bahasa_melayu: 'Bahasa Melayu', english: 'English', mathematics: 'Matematik',
  science: 'Sains', jawi: 'Jawi', general: 'Umum / Pengetahuan Am',
};
const LEVEL_LABELS: Record<string, string> = {
  prasekolah: 'Prasekolah (4-6 tahun)',
  darjah_1: 'Darjah 1', darjah_2: 'Darjah 2', darjah_3: 'Darjah 3',
  darjah_4: 'Darjah 4', darjah_5: 'Darjah 5', darjah_6: 'Darjah 6',
};
const DIFFICULTY_LABELS: Record<string, string> = { easy: 'Mudah', medium: 'Sederhana', hard: 'Mencabar' };

Deno.serve(async (req) => {
  const cors = handleCors(req); if (cors) return cors;

  try {
    const user = await getUserFromRequest(req);
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

    const { subject, level, topic, difficulty, askedQuestions, childName } = await req.json();
    if (!subject || !level) return jsonResponse({ error: 'Subjek dan tahap diperlukan' }, 400);

    const subjectLabel = SUBJECT_LABELS[subject] || 'Umum';
    const levelLabel = LEVEL_LABELS[level] || 'Sekolah Rendah';

    const deduction = await deductCredits(user.email, COST, 'ai_assistant',
      `Kuiz AI: ${subjectLabel} (${levelLabel})${topic ? ` — ${topic}` : ''}`,
      { subject, level, topic, difficulty, childName, mode: 'quiz_ai', model: 'gpt-4o-mini' });
    if (!deduction.ok) return jsonResponse({ error: 'INSUFFICIENT_CREDITS', balance: deduction.newBalance, required: COST }, 402);

    const difficultyLabel = DIFFICULTY_LABELS[difficulty] || 'Sederhana';
    const childContext = childName ? `Pelajar bernama ${childName}.` : '';
    const topicLine = topic ? `Topik khusus: ${topic}` : 'Topik: bebas mengikut sukatan.';
    const recentList = Array.isArray(askedQuestions) && askedQuestions.length > 0
      ? '\n\nELAK soalan ini:\n' + askedQuestions.slice(-10).map((q: string, i: number) => `${i + 1}. ${q}`).join('\n')
      : '';

    const prompt = `Anda pereka soalan kuiz untuk anak Malaysia mengikut KSPK/KSSR. ${childContext}

Tahap: ${levelLabel} | Subjek: ${subjectLabel}
${topicLine}
Kesukaran: ${difficultyLabel}
${recentList}

TUGAS: Jana SATU soalan kuiz pelbagai pilihan.

ARAHAN:
- Bahasa Melayu mudah, jelas
- 4 pilihan (1 betul, 3 salah tapi munasabah)
- Prasekolah/Darjah 1: ayat pendek, nombor kecil (1-20)
- Darjah 4-6: lebih mencabar, ikut KSSR
- Jawapan TEPAT 100%
- explanation: 1-2 ayat
- hint: petua tanpa beri jawapan
- encouragement: kata semangat`;

    let quiz: any;
    try {
      quiz = await invokeLLM({
        prompt, model: 'gpt_5_mini',
        response_json_schema: {
          type: 'object',
          properties: {
            question: { type: 'string' },
            choices: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4 },
            correctIndex: { type: 'number' },
            explanation: { type: 'string' }, hint: { type: 'string' },
            encouragement: { type: 'string' }, emoji: { type: 'string' },
          },
          required: ['question', 'choices', 'correctIndex', 'explanation', 'hint', 'encouragement'],
        },
      });
      if (!quiz?.question || !Array.isArray(quiz?.choices) || quiz.choices.length !== 4
          || typeof quiz.correctIndex !== 'number' || quiz.correctIndex < 0 || quiz.correctIndex > 3) {
        throw new Error('Format kuiz tidak sah');
      }
    } catch (llmErr) {
      await refundCredits(user.email, COST, 'ai_assistant', 'Refund — Kuiz AI gagal');
      return jsonResponse({ error: 'AI tidak dapat jana soalan. Kredit dikembalikan.', detail: (llmErr as Error).message }, 500);
    }

    return jsonResponse({ success: true, quiz, newBalance: deduction.newBalance, creditsUsed: COST });
  } catch (error) {
    console.error('generateQuizQuestion:', error);
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});