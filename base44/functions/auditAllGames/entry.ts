import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Audit semua games dalam DB untuk detect quality issues.
// Admin-only. Return ringkasan + senarai issues per game.

function checkGame(game) {
  const issues = [];
  const data = game.gameData || {};
  const questions = Array.isArray(data.questions) ? data.questions : [];

  // 1. Missing critical fields
  if (!game.title || game.title.trim().length < 3) issues.push({ severity: 'high', code: 'missing_title', msg: 'Tajuk tiada atau terlalu pendek' });
  if (!game.category) issues.push({ severity: 'high', code: 'missing_category', msg: 'Kategori tiada' });
  if (!game.ageGroup) issues.push({ severity: 'high', code: 'missing_age', msg: 'AgeGroup tiada' });
  if (game.ageGroup === 'sekolah_rendah' && !game.darjah) issues.push({ severity: 'medium', code: 'missing_darjah', msg: 'Darjah tiada untuk sekolah_rendah' });
  if (!game.type) issues.push({ severity: 'medium', code: 'missing_type', msg: 'Type tiada' });

  // 2. Questions structure
  if (questions.length === 0) {
    issues.push({ severity: 'critical', code: 'no_questions', msg: 'Tiada soalan langsung' });
    return issues;
  }
  if (questions.length < 5) issues.push({ severity: 'medium', code: 'too_few_questions', msg: `Hanya ${questions.length} soalan` });

  // 3. totalQuestions mismatch
  if (game.totalQuestions && game.totalQuestions > questions.length) {
    issues.push({ severity: 'low', code: 'totalQuestions_mismatch', msg: `totalQuestions=${game.totalQuestions} tapi questions=${questions.length}` });
  }

  // 4. Per-question checks
  const seenQuestions = new Set();
  questions.forEach((q, i) => {
    const qText = q.problem || q.question || q.word || q.letter || '';
    if (!qText || qText.toString().trim().length < 2) {
      issues.push({ severity: 'high', code: 'empty_question', msg: `Soalan #${i + 1} kosong atau terlalu pendek` });
    }

    // Duplicate detection within same game
    const key = String(qText).trim().toLowerCase();
    if (key && seenQuestions.has(key)) {
      issues.push({ severity: 'medium', code: 'duplicate_question', msg: `Soalan #${i + 1} duplikat: "${qText.substring(0, 50)}"` });
    }
    seenQuestions.add(key);

    // Multiple choice / true_false: options & answer
    const qType = q.type || game.type;
    if (['multiple_choice', 'true_false', 'yes_no'].includes(qType) || (!q.type && Array.isArray(q.options))) {
      if (!Array.isArray(q.options) || q.options.length < 2) {
        issues.push({ severity: 'high', code: 'bad_options', msg: `Soalan #${i + 1} options tiada atau kurang dari 2` });
      } else {
        // Answer must be valid index
        if (typeof q.answer !== 'number') {
          issues.push({ severity: 'high', code: 'bad_answer_type', msg: `Soalan #${i + 1} answer bukan number (got ${typeof q.answer})` });
        } else if (q.answer < 0 || q.answer >= q.options.length) {
          issues.push({ severity: 'critical', code: 'answer_out_of_range', msg: `Soalan #${i + 1} answer=${q.answer} tapi cuma ada ${q.options.length} options` });
        }

        // Check for empty / duplicate options
        const optSet = new Set();
        q.options.forEach((opt, oi) => {
          if (opt === undefined || opt === null || String(opt).trim() === '') {
            issues.push({ severity: 'high', code: 'empty_option', msg: `Soalan #${i + 1} option #${oi + 1} kosong` });
          }
          const okey = String(opt).trim().toLowerCase();
          if (optSet.has(okey)) {
            issues.push({ severity: 'medium', code: 'duplicate_option', msg: `Soalan #${i + 1} ada option duplikat: "${opt}"` });
          }
          optSet.add(okey);
        });

        // Detect "answer 0" suspicious pattern — bila lebih 80% answer = 0, kemungkinan AI generate biased
        // (tanya ini di game level, bukan question level)
      }
    }

    // Short answer: must have answer string
    if (['short_answer', 'fill_blank'].includes(qType)) {
      if (!q.answer || String(q.answer).trim() === '') {
        issues.push({ severity: 'high', code: 'missing_answer', msg: `Soalan #${i + 1} tiada answer` });
      }
    }
  });

  // 5. Biased answer distribution (AI hallucination indicator)
  const mcQuestions = questions.filter(q => Array.isArray(q.options) && typeof q.answer === 'number');
  if (mcQuestions.length >= 5) {
    const answerCounts = {};
    mcQuestions.forEach(q => { answerCounts[q.answer] = (answerCounts[q.answer] || 0) + 1; });
    const maxSame = Math.max(...Object.values(answerCounts));
    const ratio = maxSame / mcQuestions.length;
    if (ratio >= 0.8) {
      issues.push({ severity: 'medium', code: 'biased_answers', msg: `${Math.round(ratio * 100)}% jawapan adalah index sama (kemungkinan AI bias)` });
    }
  }

  return issues;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const url = new URL(req.url);
    const categoryFilter = url.searchParams.get('category'); // optional filter
    const ageGroupFilter = url.searchParams.get('ageGroup');

    // Fetch all games — paginate
    const allGames = [];
    let page = 0;
    const pageSize = 500;
    while (true) {
      const filter = {};
      if (categoryFilter) filter.category = categoryFilter;
      if (ageGroupFilter) filter.ageGroup = ageGroupFilter;
      const batch = await base44.asServiceRole.entities.Game.filter(filter, '-created_date', pageSize, page * pageSize);
      if (!batch || batch.length === 0) break;
      allGames.push(...batch);
      if (batch.length < pageSize) break;
      page++;
      if (page > 20) break; // safety cap 10k games
    }

    console.log(`Auditing ${allGames.length} games...`);

    // Audit each game
    const gameReports = [];
    const summary = {
      totalGames: allGames.length,
      gamesWithIssues: 0,
      cleanGames: 0,
      issuesBySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
      issuesByCode: {},
      byCategory: {},
    };

    for (const game of allGames) {
      const issues = checkGame(game);
      const catKey = `${game.ageGroup}/${game.category}${game.darjah ? '/' + game.darjah : ''}`;
      if (!summary.byCategory[catKey]) summary.byCategory[catKey] = { total: 0, withIssues: 0, critical: 0, high: 0 };
      summary.byCategory[catKey].total++;

      if (issues.length === 0) {
        summary.cleanGames++;
      } else {
        summary.gamesWithIssues++;
        summary.byCategory[catKey].withIssues++;
        issues.forEach(iss => {
          summary.issuesBySeverity[iss.severity] = (summary.issuesBySeverity[iss.severity] || 0) + 1;
          summary.issuesByCode[iss.code] = (summary.issuesByCode[iss.code] || 0) + 1;
          if (iss.severity === 'critical') summary.byCategory[catKey].critical++;
          if (iss.severity === 'high') summary.byCategory[catKey].high++;
        });
        gameReports.push({
          id: game.id,
          title: game.title,
          category: game.category,
          ageGroup: game.ageGroup,
          darjah: game.darjah,
          tier: game.tier,
          questionsCount: (game.gameData?.questions || []).length,
          issues,
        });
      }
    }

    // Sort reports by severity (critical first)
    const severityRank = { critical: 0, high: 1, medium: 2, low: 3 };
    gameReports.sort((a, b) => {
      const aMin = Math.min(...a.issues.map(i => severityRank[i.severity] ?? 4));
      const bMin = Math.min(...b.issues.map(i => severityRank[i.severity] ?? 4));
      return aMin - bMin;
    });

    return Response.json({
      success: true,
      summary,
      gameReports,
      auditedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('auditAllGames error:', error);
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});