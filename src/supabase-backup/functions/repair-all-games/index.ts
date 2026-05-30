// Repair games: delete empty, dedupe questions, dedupe options
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { requireAdmin } from '../_shared/authGuards.ts';

function repairGame(game: any) {
  const actions: string[] = [];
  const data = game.game_data || {};
  let questions = Array.isArray(data.questions) ? data.questions : [];

  // Dedupe questions
  const seen = new Set();
  const before = questions.length;
  questions = questions.filter((q: any) => {
    const key = String(q.problem || q.question || q.word || q.letter || '').trim().toLowerCase();
    if (!key) return true;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  if (questions.length < before) actions.push(`Padam ${before - questions.length} duplikat`);

  // Dedupe options per question
  questions = questions.map((q: any) => {
    if (!Array.isArray(q.options)) return q;
    const correctOpt = (typeof q.answer === 'number' && q.options[q.answer] !== undefined) ? q.options[q.answer] : null;
    const optSet = new Set();
    const deduped = q.options.filter((o: any) => {
      const k = String(o).trim().toLowerCase();
      if (optSet.has(k)) return false;
      optSet.add(k);
      return true;
    });
    if (deduped.length < q.options.length) {
      let newAnswer = q.answer;
      if (correctOpt !== null) {
        const newIdx = deduped.findIndex((o: any) => String(o).trim().toLowerCase() === String(correctOpt).trim().toLowerCase());
        if (newIdx >= 0) newAnswer = newIdx;
      }
      actions.push(`Padam option duplikat`);
      return { ...q, options: deduped, answer: newAnswer };
    }
    return q;
  });

  return { questions, actions, isEmpty: questions.length === 0 };
}

Deno.serve(async (req) => {
  const cors = handleCors(req); if (cors) return cors;
  const guard = await requireAdmin(req);
  if (guard instanceof Response) return guard;

  try {
    const { data: allGames } = await supabaseAdmin
      .from('ck_games')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10000);

    const results: any = {
      total: allGames?.length || 0,
      deleted: 0, repaired: 0, unchanged: 0,
      errors: [], deletedIds: [], repairedDetails: [],
    };

    for (const game of allGames || []) {
      try {
        const questions = game.game_data?.questions || [];

        if (!Array.isArray(questions) || questions.length === 0) {
          await supabaseAdmin.from('ck_games').delete().eq('id', game.id);
          results.deleted++;
          results.deletedIds.push({ id: game.id, title: game.title, category: game.category });
          continue;
        }

        const { questions: newQ, actions, isEmpty } = repairGame(game);

        if (isEmpty) {
          await supabaseAdmin.from('ck_games').delete().eq('id', game.id);
          results.deleted++;
          results.deletedIds.push({ id: game.id, title: game.title, category: game.category, reason: 'all_duplicates' });
          continue;
        }

        if (actions.length > 0) {
          await supabaseAdmin.from('ck_games').update({
            game_data: { ...game.game_data, questions: newQ },
            total_questions: newQ.length,
          }).eq('id', game.id);
          results.repaired++;
          results.repairedDetails.push({
            id: game.id, title: game.title, category: game.category,
            actions, beforeCount: questions.length, afterCount: newQ.length,
          });
        } else {
          results.unchanged++;
        }
      } catch (err) {
        results.errors.push({ id: game.id, title: game.title, error: (err as Error).message });
      }
    }

    return jsonResponse({ success: true, results, repairedAt: new Date().toISOString() });
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});