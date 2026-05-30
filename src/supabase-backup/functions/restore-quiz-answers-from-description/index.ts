// Restore quiz answers from original description JSON
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { requireAdmin } from '../_shared/authGuards.ts';

const EXCLUDED_CATEGORIES = [
  'kafa_quran', 'kafa_jawi', 'kafa_akidah', 'kafa_ibadah',
  'kafa_sirah', 'kafa_adab', 'kafa_bahasa_arab', 'jawi',
];
const VALID_TYPES = [
  'multiple_choice', 'math_puzzle', 'picture_quiz', 'quiz',
  'science_quiz', 'word_builder', 'letter_match', 'number_match',
];

Deno.serve(async (req) => {
  const cors = handleCors(req); if (cors) return cors;
  const guard = await requireAdmin(req);
  if (guard instanceof Response) return guard;

  try {
    const { dryRun = true, offset = 0, limit = 100 } = await req.json().catch(() => ({}));

    const { data: games } = await supabaseAdmin
      .from('ck_games')
      .select('*')
      .in('type', VALID_TYPES)
      .not('category', 'in', `(${EXCLUDED_CATEGORIES.map(c => `"${c}"`).join(',')})`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (!games || games.length === 0) {
      return jsonResponse({ done: true, offset, processed: 0 });
    }

    let restored = 0, mismatchedGames = 0, skipped = 0;
    const changes: any[] = [];

    for (const game of games) {
      const desc = game.description;
      if (!desc || typeof desc !== 'string' || !desc.trim().startsWith('{')) { skipped++; continue; }

      let parsed: any;
      try { parsed = JSON.parse(desc); } catch { skipped++; continue; }

      const orig = parsed?.questions;
      const curr = game?.game_data?.questions;
      if (!Array.isArray(orig) || !Array.isArray(curr) || orig.length !== curr.length) { skipped++; continue; }

      let hasMismatch = false;
      const restoredQuestions = curr.map((q: any, idx: number) => {
        const origAnswer = orig[idx]?.answer;
        if (typeof origAnswer === 'number' && origAnswer !== q.answer) {
          hasMismatch = true;
          return { ...q, answer: origAnswer };
        }
        return q;
      });

      if (!hasMismatch) continue;

      mismatchedGames++;
      changes.push({
        gameId: game.id, title: game.title, category: game.category, darjah: game.darjah,
        fixes: curr.map((q: any, idx: number) => ({
          qIndex: idx,
          currentAnswer: q.answer,
          originalAnswer: orig[idx]?.answer,
        })).filter((c: any) => c.currentAnswer !== c.originalAnswer),
      });

      if (!dryRun) {
        await supabaseAdmin.from('ck_games').update({
          game_data: { ...game.game_data, questions: restoredQuestions },
        }).eq('id', game.id);
        restored++;
      }
    }

    return jsonResponse({
      offset, limit, processed: games.length,
      nextOffset: offset + games.length, done: games.length < limit,
      mismatchedGames, restored, skipped, dryRun,
      changes: changes.slice(0, 30),
    });
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});