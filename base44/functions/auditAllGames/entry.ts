import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CATEGORY_LABELS = {
  bahasa_melayu: 'Bahasa Melayu',
  english: 'English',
  mathematics: 'Matematik',
  science: 'Sains',
  jawi: 'Aksara Jawi',
  bahasa_tamil: 'Bahasa Tamil',
  bahasa_mandarin: 'Bahasa Mandarin',
};

const AGE_LABELS = {
  prasekolah: 'Prasekolah (4-6 tahun)',
  sekolah_rendah: 'Sekolah Rendah (7-12 tahun)',
};

async function validateGameQuestions(base44, game) {
  const questions = game.gameData?.questions || [];
  if (questions.length === 0) {
    return {
      gameId: game.id,
      gameTitle: game.title,
      status: 'EMPTY',
      issueCount: 1,
      issues: ['Tiada soalan'],
    };
  }

  const questionsText = questions
    .map((q, i) => {
      const answerText = q.options?.[q.answer];
      const allOptions = (q.options || []).map((opt, idx) => `${idx === q.answer ? '✓' : '✗'} ${opt}`).join(' | ');
      return `Q${i + 1}: ${q.problem || q.question || '(kosong)'}\nOptions: ${allOptions}\nAnswer: ${answerText || 'MISSING'}`;
    })
    .join('\n\n');

  try {
    const validationResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Kamu adalah STRICT Malaysian curriculum expert. Audit soalan-soalan ini untuk game: "${game.title}"

Subjek: ${CATEGORY_LABELS[game.category] || game.category}
Peringkat: ${AGE_LABELS[game.ageGroup] || game.ageGroup}
Total Soalan: ${questions.length}

AUDIT CHECKLIST:
1. Soalan jelas, tepat, sesuai kurikulum Malaysia?
2. Jawapan betul PASTI betul?
3. Emoji (jika ada) match dengan jawapan betul?
4. Semua 4 pilihan valid dan berbeza?
5. Soalan tidak kosong, tidak duplicate?

Soalan untuk di-audit:
${questionsText}

Respond JSON dengan status PASS atau FAIL dan list issues. Be VERY STRICT.`,
      model: 'claude_sonnet_4_6',
      response_json_schema: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['PASS', 'FAIL'] },
          passed_questions: { type: 'number' },
          failed_questions: { type: 'number' },
          issues: {
            type: 'array',
            items: { type: 'string' },
          },
          recommendations: { type: 'string' },
        },
        required: ['status', 'issues'],
      },
    });

    return {
      gameId: game.id,
      gameTitle: game.title,
      ageGroup: game.ageGroup,
      category: game.category,
      questionCount: questions.length,
      status: validationResult.status,
      passedQuestions: validationResult.passed_questions || 0,
      failedQuestions: validationResult.failed_questions || 0,
      issueCount: validationResult.issues?.length || 0,
      issues: validationResult.issues || [],
      recommendations: validationResult.recommendations || '',
    };
  } catch (err) {
    return {
      gameId: game.id,
      gameTitle: game.title,
      status: 'ERROR',
      issueCount: 1,
      issues: [`Validation error: ${err.message}`],
    };
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all published games from database
    const allGames = await base44.asServiceRole.entities.Game.filter({ isPublished: true });

    if (allGames.length === 0) {
      return Response.json({
        success: true,
        totalGames: 0,
        message: 'Tiada games dalam database',
      });
    }

    console.log(`Starting audit of ${allGames.length} games...`);

    const auditResults = [];
    let passCount = 0;
    let failCount = 0;
    let errorCount = 0;
    let emptyCount = 0;

    // Audit each game
    for (let i = 0; i < allGames.length; i++) {
      const game = allGames[i];
      console.log(`Auditing game ${i + 1}/${allGames.length}: ${game.title}`);

      const result = await validateGameQuestions(base44, game);
      auditResults.push(result);

      if (result.status === 'PASS') passCount++;
      else if (result.status === 'FAIL') failCount++;
      else if (result.status === 'ERROR') errorCount++;
      else if (result.status === 'EMPTY') emptyCount++;

      // Delay between validations to avoid rate limits
      if (i < allGames.length - 1) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    // Group results by status
    const passedGames = auditResults.filter(r => r.status === 'PASS');
    const failedGames = auditResults.filter(r => r.status === 'FAIL');
    const emptyGames = auditResults.filter(r => r.status === 'EMPTY');
    const errorGames = auditResults.filter(r => r.status === 'ERROR');

    // Group by category for detailed report
    const byCategory = {};
    auditResults.forEach(result => {
      const cat = result.category || 'unknown';
      if (!byCategory[cat]) byCategory[cat] = { pass: 0, fail: 0, total: 0 };
      byCategory[cat].total++;
      if (result.status === 'PASS') byCategory[cat].pass++;
      else byCategory[cat].fail++;
    });

    return Response.json({
      success: true,
      auditDate: new Date().toISOString(),
      summary: {
        totalGames: allGames.length,
        passed: passCount,
        failed: failCount,
        empty: emptyCount,
        errors: errorCount,
        passRate: `${((passCount / allGames.length) * 100).toFixed(1)}%`,
      },
      byCategory,
      failedGames: failedGames.map(g => ({
        title: g.gameTitle,
        category: g.category,
        ageGroup: g.ageGroup,
        questionCount: g.questionCount,
        issueCount: g.issueCount,
        issues: g.issues.slice(0, 5), // Top 5 issues
        recommendations: g.recommendations,
      })),
      emptyGames: emptyGames.map(g => ({ title: g.gameTitle, issue: g.issues[0] })),
      errorGames: errorGames.map(g => ({ title: g.gameTitle, error: g.issues[0] })),
      recommendation: failCount > 0 ? `⚠️ ${failCount} games perlu di-fix. Guna "Check & Fix All" untuk auto-fix atau edit manual.` : '✅ Semua games OKEY!',
      detailedResults: auditResults, // Full audit details
    });
  } catch (error) {
    console.error('Audit error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});