// Audit all games for structural quality issues
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { requireAdmin } from '../_shared/authGuards.ts';

function checkGame(game: any) {
  const issues: any[] = [];
  const data = game.game_data || {};
  const questions = Array.isArray(data.questions) ? data.questions : [];

  if (!game.title || game.title.trim().length < 3) issues.push({ severity: 'high', code: 'missing_title', msg: 'Tajuk tiada atau pendek' });
  if (!game.category) issues.push({ severity: 'high', code: 'missing_category', msg: 'Kategori tiada' });
  if (!game.age_group) issues.push({ severity: 'high', code: 'missing_age', msg: 'AgeGroup tiada' });
  if (game.age_group === 'sekolah_rendah' && !game.darjah) issues.push({ severity: 'medium', code: 'missing_darjah', msg: 'Darjah tiada' });
  if (!game.type) issues.push({ severity: 'medium', code: 'missing_type', msg: 'Type tiada' });

  if (questions.length === 0) {
    issues.push({ severity: 'critical', code: 'no_questions', msg: 'Tiada soalan' });
    return issues;
  }
  if (questions.length < 5) issues.push({ severity: 'medium', code: 'too_few_questions', msg: `Hanya ${questions.length} soalan` });
  if (game.total_questions && game.total_questions > questions.length) {
    issues.push({ severity: 'low', code: 'totalQuestions_mismatch', msg: `mismatch` });
  }

  const seen = new Set();
  questions.forEach((q: any, i: number) => {
    const qText = q.problem || q.question || q.word || q.letter || '';
    if (!qText || qText.toString().trim().length < 2) {
      issues.push({ severity: 'high', code: 'empty_question', msg: `Soalan #${i + 1} kosong` });
    }
    const key = String(qText).trim().toLowerCase();
    if (key && seen.has(key)) issues.push({ severity: 'medium', code: 'duplicate_question', msg: `Soalan #${i + 1} duplikat` });
    seen.add(key);

    const qType = q.type || game.type;
    if (['multiple_choice', 'true_false', 'yes_no'].includes(qType) || (!q.type && Array.isArray(q.options))) {
      if (!Array.isArray(q.options) || q.options.length < 2) {
        issues.push({ severity: 'high', code: 'bad_options', msg: `Soalan #${i + 1} options kurang dari 2` });
      } else {
        if (typeof q.answer !== 'number') {
          issues.push({ severity: 'high', code: 'bad_answer_type', msg: `Soalan #${i + 1} answer bukan number` });
        } else if (q.answer < 0 || q.answer >= q.options.length) {
          issues.push({ severity: 'critical', code: 'answer_out_of_range', msg: `Soalan #${i + 1} answer=${q.answer} dari ${q.options.length} options` });
        }
        const optSet = new Set();
        q.options.forEach((opt: any, oi: number) => {
          if (opt === undefined || opt === null || String(opt).trim() === '') {
            issues.push({ severity: 'high', code: 'empty_option', msg: `Soalan #${i + 1} option #${oi + 1} kosong` });
          }
          const okey = String(opt).trim().toLowerCase();
          if (optSet.has(okey)) issues.push({ severity: 'medium', code: 'duplicate_option', msg: `Soalan #${i + 1} option duplikat` });
          optSet.add(okey);
        });
      }
    }
    if (['short_answer', 'fill_blank'].includes(qType)) {
      if (!q.answer || String(q.answer).trim() === '') {
        issues.push({ severity: 'high', code: 'missing_answer', msg: `Soalan #${i + 1} tiada answer` });
      }
    }
  });

  const mcQuestions = questions.filter((q: any) => Array.isArray(q.options) && typeof q.answer === 'number');
  if (mcQuestions.length >= 5) {
    const counts: Record<number, number> = {};
    mcQuestions.forEach((q: any) => { counts[q.answer] = (counts[q.answer] || 0) + 1; });
    const maxSame = Math.max(...Object.values(counts));
    const ratio = maxSame / mcQuestions.length;
    if (ratio >= 0.8) issues.push({ severity: 'medium', code: 'biased_answers', msg: `${Math.round(ratio * 100)}% jawapan sama` });
  }

  return issues;
}

Deno.serve(async (req) => {
  const cors = handleCors(req); if (cors) return cors;
  const guard = await requireAdmin(req);
  if (guard instanceof Response) return guard;

  try {
    const url = new URL(req.url);
    const categoryFilter = url.searchParams.get('category');
    const ageGroupFilter = url.searchParams.get('ageGroup');

    let q = supabaseAdmin.from('ck_games').select('*');
    if (categoryFilter) q = q.eq('category', categoryFilter);
    if (ageGroupFilter) q = q.eq('age_group', ageGroupFilter);
    const { data: allGames } = await q.order('created_at', { ascending: false }).limit(10000);

    const gameReports: any[] = [];
    const summary: any = {
      totalGames: allGames?.length || 0,
      gamesWithIssues: 0, cleanGames: 0,
      issuesBySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
      issuesByCode: {}, byCategory: {},
    };

    for (const game of allGames || []) {
      const issues = checkGame(game);
      const catKey = `${game.age_group}/${game.category}${game.darjah ? '/' + game.darjah : ''}`;
      if (!summary.byCategory[catKey]) summary.byCategory[catKey] = { total: 0, withIssues: 0, critical: 0, high: 0 };
      summary.byCategory[catKey].total++;

      if (issues.length === 0) {
        summary.cleanGames++;
      } else {
        summary.gamesWithIssues++;
        summary.byCategory[catKey].withIssues++;
        issues.forEach((iss: any) => {
          summary.issuesBySeverity[iss.severity] = (summary.issuesBySeverity[iss.severity] || 0) + 1;
          summary.issuesByCode[iss.code] = (summary.issuesByCode[iss.code] || 0) + 1;
          if (iss.severity === 'critical') summary.byCategory[catKey].critical++;
          if (iss.severity === 'high') summary.byCategory[catKey].high++;
        });
        gameReports.push({
          id: game.id, title: game.title, category: game.category,
          ageGroup: game.age_group, darjah: game.darjah, tier: game.tier,
          questionsCount: (game.game_data?.questions || []).length, issues,
        });
      }
    }

    const rank: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    gameReports.sort((a, b) => {
      const aMin = Math.min(...a.issues.map((i: any) => rank[i.severity] ?? 4));
      const bMin = Math.min(...b.issues.map((i: any) => rank[i.severity] ?? 4));
      return aMin - bMin;
    });

    return jsonResponse({ success: true, summary, gameReports, auditedAt: new Date().toISOString() });
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});