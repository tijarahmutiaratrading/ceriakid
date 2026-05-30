// Generate KSSR/KSPK quiz games using OpenAI (replaces Base44 InvokeLLM)
// Limited topic bank — port of full Base44 version with same structure.
// Payload: { ageGroup, darjah, category, targetCount, dryRun, internalCall }
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin, getUserFromRequest } from '../_shared/supabaseAdmin.ts';
import { invokeLLM } from '../_shared/llm.ts';

const SUBJECT_LABELS: Record<string, string> = {
  bahasa_melayu: 'Bahasa Melayu', english: 'English Language',
  mathematics: 'Mathematics', science: 'Science', jawi: 'Jawi (Arabic-Malay script)',
};

const AGE_BAND: Record<string, string> = {
  prasekolah: 'preschool children aged 4-6 (very simple language)',
  darjah_1: 'Year 1 KSSR aged 7', darjah_2: 'Year 2 KSSR aged 8',
  darjah_3: 'Year 3 KSSR aged 9', darjah_4: 'Year 4 KSSR aged 10',
  darjah_5: 'Year 5 KSSR aged 11', darjah_6: 'Year 6 KSSR/UPSR aged 12',
};

const LANG_RULE: Record<string, string> = {
  bahasa_melayu: 'Write in BAHASA MELAYU only.',
  english: 'Write in ENGLISH only.',
  mathematics: 'Write in BAHASA MELAYU.',
  science: 'Write in BAHASA MELAYU only.',
  jawi: 'Write in BAHASA MELAYU. Include Jawi script in options where relevant.',
};

// Generic topics — use as fallback when specific topic not provided
function getDefaultTopics(level: string, category: string): string[] {
  return Array.from({ length: 20 }, (_, i) => `Topic ${i + 1} for ${level} ${category}`);
}

function buildPrompt(ageGroup: string, darjah: string | null, category: string, topic: string, idx: number): string {
  const level = darjah || ageGroup;
  return `You are an expert Malaysian KSSR/Prasekolah curriculum designer creating a 10-question quiz.

Subject: ${SUBJECT_LABELS[category]}
Level: ${AGE_BAND[level]}
Topic: "${topic}"
Game #${idx + 1}

LANGUAGE RULE: ${LANG_RULE[category]}

RULES:
1. EXACTLY 10 questions on "${topic}".
2. Each question: 4 options (A,B,C,D).
3. "answer" = index (0-3). RANDOMIZE — don't always pick 0.
4. Facts MUST be 100% accurate.
5. Distractors plausible but clearly wrong.
6. Match level difficulty.
7. No duplicate questions.
8. Include emoji per question.

Return ONLY JSON: {"title":"...", "emoji":"...", "description":"...", "questions":[{"problem":"...","options":[],"answer":0,"emoji":"🎯"}]}`;
}

function validateGame(game: any): string[] {
  const errors: string[] = [];
  if (!game?.title) errors.push('missing title');
  if (!Array.isArray(game?.questions) || game.questions.length !== 10) errors.push(`bad question count`);
  for (const [i, q] of (game.questions || []).entries()) {
    if (!q?.problem || q.problem.length < 5) errors.push(`Q${i + 1} bad problem`);
    if (!Array.isArray(q.options) || q.options.length !== 4) errors.push(`Q${i + 1} not 4 options`);
    if (typeof q.answer !== 'number' || q.answer < 0 || q.answer > 3) errors.push(`Q${i + 1} bad answer`);
    if (new Set(q.options).size !== 4) errors.push(`Q${i + 1} duplicate options`);
  }
  return errors;
}

async function generateOne(args: { ageGroup: string; darjah: string | null; category: string; topic: string; idx: number }) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await invokeLLM({
        prompt: buildPrompt(args.ageGroup, args.darjah, args.category, args.topic, args.idx),
        model: 'gpt_5_4',
        response_json_schema: { type: 'object', properties: { title: { type: 'string' }, questions: { type: 'array' } } },
      });
      const errors = validateGame(result);
      if (errors.length === 0) return { ok: true, game: result };
      console.log(`Attempt ${attempt + 1} errors:`, errors.slice(0, 3));
    } catch (e) { console.log(`Attempt ${attempt + 1}:`, (e as Error).message); }
  }
  return { ok: false };
}

Deno.serve(async (req) => {
  const cors = handleCors(req); if (cors) return cors;

  try {
    const body = await req.json();
    const { ageGroup, darjah, category, targetCount = 30, dryRun = false, internalCall = false, topics: customTopics } = body;

    if (!internalCall) {
      const user = await getUserFromRequest(req);
      if (!user || user.role !== 'admin') return jsonResponse({ error: 'Forbidden: Admin only' }, 403);
    }
    if (!ageGroup || !category) return jsonResponse({ error: 'ageGroup and category required' }, 400);

    let q = supabaseAdmin.from('ck_games').select('*')
      .eq('age_group', ageGroup).eq('category', category).eq('is_published', true);
    if (darjah) q = q.eq('darjah', darjah);
    const { data: existing } = await q;
    const existingCount = existing?.length || 0;
    const needed = Math.max(0, targetCount - existingCount);

    if (needed === 0) {
      return jsonResponse({ success: true, message: `Already has ${existingCount} games`, existing: existingCount, generated: 0 });
    }

    const levelKey = darjah || ageGroup;
    const topics = Array.isArray(customTopics) && customTopics.length > 0
      ? customTopics
      : getDefaultTopics(levelKey, category);
    const topicsToUse = topics.slice(0, needed);

    if (dryRun) {
      return jsonResponse({ success: true, dryRun: true, existing: existingCount, toGenerate: topicsToUse.length, topics: topicsToUse });
    }

    let inserted = 0, failed = 0;
    const failedTopics: string[] = [];
    const batchSize = Math.min(topicsToUse.length, 3); // limit batch size for edge function timeout

    for (let i = 0; i < batchSize; i++) {
      const topic = topicsToUse[i];
      const gameIndex = existingCount + i;
      const result = await generateOne({ ageGroup, darjah, category, topic, idx: gameIndex });

      if (result.ok) {
        const g = result.game;
        await supabaseAdmin.from('ck_games').insert({
          title: g.title,
          description: g.description || `Topik: ${topic}`,
          type: 'multiple_choice',
          category, age_group: ageGroup, darjah: darjah || null,
          difficulty: gameIndex < 10 ? 'easy' : gameIndex < 20 ? 'medium' : 'hard',
          tier: gameIndex < 5 ? 'free' : gameIndex < 15 ? 'premium' : 'pro',
          emoji: g.emoji || '🎮',
          total_questions: g.questions.length,
          game_data: {
            questions: g.questions.map((q: any) => ({
              type: 'multiple_choice',
              problem: q.problem, options: q.options, answer: q.answer,
              emoji: q.emoji || g.emoji || '🎯',
            })),
          },
          is_published: true, status: 'ready', order: gameIndex + 1,
          month_tag: new Date().toISOString().slice(0, 7),
        });
        inserted++;
      } else {
        failed++;
        failedTopics.push(topic);
      }
    }

    return jsonResponse({
      success: true,
      bucket: `${ageGroup}${darjah ? '/' + darjah : ''}/${category}`,
      existing: existingCount, generated: inserted, failed, failedTopics,
      stillNeeded: needed - inserted,
    });
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});