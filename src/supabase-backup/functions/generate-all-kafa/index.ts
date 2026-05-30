// Generate KAFA quiz games — loops through 42 buckets (7 subjects × 6 darjah)
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin, getUserFromRequest } from '../_shared/supabaseAdmin.ts';
import { invokeLLM } from '../_shared/llm.ts';

const KAFA_SUBJECTS = ['kafa_quran', 'kafa_jawi', 'kafa_akidah', 'kafa_ibadah', 'kafa_sirah', 'kafa_adab', 'kafa_bahasa_arab'];
const DARJAHS = ['darjah_1', 'darjah_2', 'darjah_3', 'darjah_4', 'darjah_5', 'darjah_6'];

const SUBJECT_LABELS: Record<string, string> = {
  kafa_quran: 'KAFA Al-Quran & Hafazan',
  kafa_jawi: 'KAFA Jawi & Khat',
  kafa_akidah: 'KAFA Akidah Islam',
  kafa_ibadah: 'KAFA Ibadah & Fekah',
  kafa_sirah: 'KAFA Sirah Nabawiyah',
  kafa_adab: 'KAFA Adab & Akhlak',
  kafa_bahasa_arab: 'KAFA Bahasa Arab',
};

const AGE_DESC: Record<string, string> = {
  darjah_1: 'KAFA Year 1 aged 7', darjah_2: 'KAFA Year 2 aged 8',
  darjah_3: 'KAFA Year 3 aged 9', darjah_4: 'KAFA Year 4 aged 10',
  darjah_5: 'KAFA Year 5 aged 11', darjah_6: 'KAFA Year 6 aged 12 (UPKK prep)',
};

function getTopics(darjah: string, category: string): string[] {
  // Generic topic list — caller can pass specific topics via payload
  return Array.from({ length: 10 }, (_, i) => `${SUBJECT_LABELS[category]} topik ${i + 1} (${darjah})`);
}

function buildPrompt(darjah: string, category: string, topic: string, idx: number): string {
  return `Anda pakar KAFA Malaysia. Bina 10 soalan kuiz pelbagai pilihan.

Subjek: ${SUBJECT_LABELS[category]}
Tahap: ${AGE_DESC[darjah]}
Topik: "${topic}"
Game #${idx + 1}

ARAHAN:
1. 10 soalan dalam Bahasa Melayu (kecuali Arab gunakan tulisan Arab).
2. 4 pilihan setiap soalan. "answer" = 0-3.
3. Fakta Islam 100% tepat — guna sumber autentik.
4. Distractor munasabah tapi salah.
5. Hormati Nabi dengan SAW, sahabat dengan RA.
6. Mazhab Shafie untuk fiqh.

Return JSON: {"title":"...","emoji":"🕌","description":"...","questions":[{"problem":"...","options":[],"answer":0,"emoji":"🎯"}]}`;
}

function validate(game: any): boolean {
  if (!game?.title || !Array.isArray(game?.questions) || game.questions.length !== 10) return false;
  for (const q of game.questions) {
    if (!q.problem || q.problem.length < 5) return false;
    if (!Array.isArray(q.options) || q.options.length !== 4) return false;
    if (typeof q.answer !== 'number' || q.answer < 0 || q.answer > 3) return false;
    if (new Set(q.options).size !== 4) return false;
  }
  return true;
}

Deno.serve(async (req) => {
  const cors = handleCors(req); if (cors) return cors;

  try {
    const body = await req.json().catch(() => ({}));
    const { targetCount = 10, maxGames = 3, internalCall = false } = body;

    if (!internalCall) {
      const user = await getUserFromRequest(req);
      if (!user || user.role !== 'admin') return jsonResponse({ error: 'Forbidden: Admin only' }, 403);
    }

    // Find incomplete buckets
    const needsWork: any[] = [];
    for (const darjah of DARJAHS) {
      for (const category of KAFA_SUBJECTS) {
        const { count } = await supabaseAdmin
          .from('ck_games')
          .select('id', { count: 'exact', head: true })
          .eq('age_group', 'sekolah_rendah').eq('darjah', darjah).eq('category', category).eq('is_published', true);
        if ((count || 0) < targetCount) needsWork.push({ darjah, category, existing: count || 0 });
      }
    }

    if (needsWork.length === 0) {
      return jsonResponse({ success: true, allComplete: true, message: 'All 42 KAFA buckets complete' });
    }

    let totalGenerated = 0, totalFailed = 0;
    const log: string[] = [];

    for (const b of needsWork) {
      if (totalGenerated + totalFailed >= maxGames) break;
      const topics = getTopics(b.darjah, b.category);
      const canDo = Math.min(targetCount - b.existing, maxGames - totalGenerated - totalFailed);

      for (let i = 0; i < canDo; i++) {
        const topic = topics[(b.existing + i) % topics.length];
        const gameIndex = b.existing + i;

        let game: any = null;
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const result = await invokeLLM({
              prompt: buildPrompt(b.darjah, b.category, topic, gameIndex),
              model: 'gpt_5_mini',
              response_json_schema: { type: 'object' },
            });
            if (validate(result)) { game = result; break; }
          } catch (e) { /* retry */ }
        }

        if (game) {
          await supabaseAdmin.from('ck_games').insert({
            title: game.title,
            description: game.description || `KAFA · ${topic}`,
            type: 'multiple_choice',
            category: b.category, age_group: 'sekolah_rendah', darjah: b.darjah,
            difficulty: gameIndex < 4 ? 'easy' : gameIndex < 8 ? 'medium' : 'hard',
            tier: 'free', emoji: game.emoji || '🕌',
            total_questions: game.questions.length,
            game_data: {
              questions: game.questions.map((q: any) => ({
                type: 'multiple_choice', problem: q.problem, options: q.options,
                answer: q.answer, emoji: q.emoji || game.emoji || '🕌',
              })),
            },
            is_published: true, status: 'ready', order: gameIndex + 1,
            month_tag: new Date().toISOString().slice(0, 7),
          });
          totalGenerated++;
          log.push(`✅ ${b.darjah}/${b.category}: "${game.title}"`);
        } else {
          totalFailed++;
          log.push(`❌ ${b.darjah}/${b.category}: failed`);
        }

        if (totalGenerated + totalFailed >= maxGames) break;
      }
    }

    return jsonResponse({
      success: true, totalGenerated, totalFailed,
      bucketsRemaining: needsWork.length,
      log,
    });
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});