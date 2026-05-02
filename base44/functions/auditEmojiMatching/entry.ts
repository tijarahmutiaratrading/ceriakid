import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

async function validateEmojiMatch(base44, game) {
  const questions = game.gameData?.questions || [];
  if (questions.length === 0) {
    return { gameId: game.id, gameTitle: game.title, status: 'EMPTY', issues: [] };
  }

  // Prepare batch validation prompt
  const questionsText = questions
    .map((q, i) => {
      const answerIdx = q.answer;
      const correctAnswer = q.options?.[answerIdx] || '';
      return `Q${i + 1}: "${q.problem || ''}" | Emoji: ${q.emoji || '❌'} | Answer: "${correctAnswer}"`;
    })
    .join('\n');

  try {
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Audit emoji relevance untuk game: "${game.title}"
Subject: ${game.category}
Age: ${game.ageGroup}

Soalan-soalan:
${questionsText}

Untuk SETIAP soalan, check: Adakah emoji RELEVAN dengan soalan DAN jawapan betul?
List ONLY soalan yang emoji TIDAK match. Format: "Q1: Problem - Emoji tidak match dengan jawapan"

Jika SEMUA OK, respond: "SEMUA OK"`,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          issues: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of questions dengan emoji yang tidak match',
          },
          status: { type: 'string', enum: ['PASS', 'FAIL'] },
        },
        required: ['issues', 'status'],
      },
    });

    return {
      gameId: game.id,
      gameTitle: game.title,
      category: game.category,
      ageGroup: game.ageGroup,
      questionCount: questions.length,
      issueCount: result.issues?.length || 0,
      status: result.status || (result.issues?.length > 0 ? 'FAIL' : 'PASS'),
      issues: result.issues || [],
    };
  } catch (err) {
    return {
      gameId: game.id,
      gameTitle: game.title,
      category: game.category,
      ageGroup: game.ageGroup,
      questionCount: questions.length,
      issueCount: 1,
      status: 'ERROR',
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

    // Get all published games
    const allGames = await base44.asServiceRole.entities.Game.filter({ isPublished: true });

    if (allGames.length === 0) {
      return Response.json({ success: true, totalGames: 0, message: 'Tiada games untuk di-audit' });
    }

    console.log(`Starting emoji audit of ${allGames.length} games...`);

    const auditResults = [];
    let passCount = 0;
    let failCount = 0;

    // Audit each game
    for (let i = 0; i < allGames.length; i++) {
      const game = allGames[i];
      console.log(`Auditing game ${i + 1}/${allGames.length}: ${game.title}`);

      const result = await validateEmojiMatch(base44, game);
      auditResults.push(result);

      if (result.status === 'PASS') passCount++;
      else failCount++;

      // Delay to avoid rate limits
      if (i < allGames.length - 1) {
        await new Promise(r => setTimeout(r, 1500));
      }
    }

    // Group results by category
    const byCategory = {};
    auditResults.forEach(result => {
      const cat = result.category || 'unknown';
      if (!byCategory[cat]) byCategory[cat] = { pass: 0, fail: 0, total: 0 };
      byCategory[cat].total++;
      if (result.status === 'PASS') byCategory[cat].pass++;
      else byCategory[cat].fail++;
    });

    // Failed games details
    const failedGames = auditResults
      .filter(r => r.status === 'FAIL')
      .map(g => ({
        title: g.gameTitle,
        category: g.category,
        questionCount: g.questionCount,
        issueCount: g.issueCount,
        issues: g.issues,
      }));

    return Response.json({
      success: true,
      auditDate: new Date().toISOString(),
      summary: {
        totalGames: allGames.length,
        passed: passCount,
        failed: failCount,
        passRate: `${((passCount / allGames.length) * 100).toFixed(1)}%`,
      },
      byCategory,
      failedGames,
      recommendation: failCount > 0 
        ? `⚠️ ${failCount} games ada emoji yang tidak match. Check failedGames untuk details.`
        : '✅ Semua games emoji-answer match OK!',
    });
  } catch (error) {
    console.error('Audit error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});