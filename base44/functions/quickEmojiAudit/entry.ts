import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function checkEmojiRelevance(emoji, problem, answer) {
  // Pattern-based matching to flag obvious mismatches
  const problem_lower = (problem || '').toLowerCase();
  const answer_lower = (answer || '').toLowerCase();
  const combined = `${problem_lower} ${answer_lower}`.toLowerCase();

  // Mandatory emoji-answer mappings (if answer contains these, MUST use specific emojis)
  const mandatoryMappings = {
    'pensil': ['✏️', '🖍️', '📝'],
    'penghapus': ['🧹', '🧻'],
    'buku': ['📚', '📖', '📕', '📗'],
    'guli': ['⭕', '🔵', '🟠'],
    'dengar': ['👂', '🎧', '🔊'],
    'burung': ['🐦', '🦅', '🦜'],
    'ikan': ['🐠', '🐟', '🦈'],
    'rumah': ['🏠', '🏡', '🏘️'],
    'kereta': ['🚗', '🚕', '🚙'],
    'buku': ['📚', '📖'],
    'sepeda': ['🚴', '🛴'],
    'kasut': ['👞', '👟', '👠'],
    'topi': ['👒', '🎩'],
  };

  // If answer is a mandatory keyword, check if emoji is allowed
  for (const [keyword, allowedEmojis] of Object.entries(mandatoryMappings)) {
    if (answer_lower.includes(keyword)) {
      return allowedEmojis.includes(emoji);
    }
  }

  // Generic mismatches
  if (emoji === '❓' || emoji === '❌' || emoji === '✅') {
    return false;
  }

  // Check for obvious animal emoji mismatch
  const animalEmojis = ['🐦', '🦅', '🦜', '🦆', '🐠', '🐟', '🐘', '🐵', '🦁', '🐯', '🦊', '🐻', '🐼'];
  if (animalEmojis.includes(emoji) && !combined.includes('haiwan') && !combined.includes('burung') && !combined.includes('ikan')) {
    return false;
  }

  return true;
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

    console.log(`Starting quick emoji audit of ${allGames.length} games...`);

    const auditResults = [];
    let passCount = 0;
    let failCount = 0;
    let totalIssues = 0;

    // Audit each game
    for (const game of allGames) {
      const questions = game.gameData?.questions || [];
      const issues = [];
      const emojiCounts = {}; // Track emoji usage

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const emoji = q.emoji || '';
        const problem = q.problem || '';
        const answerIdx = q.answer;
        const answer = q.options?.[answerIdx] || '';

        // Check emoji relevance
        if (!emoji) {
          issues.push(`Q${i + 1}: Missing emoji`);
        } else if (!checkEmojiRelevance(emoji, problem, answer)) {
          issues.push(`Q${i + 1}: Emoji "${emoji}" doesn't match - "${problem.slice(0, 40)}..." (Answer: "${answer}")`);
        }

        // Track emoji usage for duplicate detection
        if (emoji) {
          if (!emojiCounts[emoji]) emojiCounts[emoji] = [];
          emojiCounts[emoji].push(i + 1);
        }
      }

      // Check for duplicate emojis within same game
      for (const [emoji, questionIndices] of Object.entries(emojiCounts)) {
        if (questionIndices.length > 1) {
          issues.push(`Duplicate emoji "${emoji}" in Q${questionIndices.join(', Q')}`);
        }
      }

      const result = {
        gameId: game.id,
        gameTitle: game.title,
        category: game.category,
        ageGroup: game.ageGroup,
        questionCount: questions.length,
        issueCount: issues.length,
        status: issues.length === 0 ? 'PASS' : 'FAIL',
        issues: issues.slice(0, 5), // Top 5 issues
      };

      auditResults.push(result);
      totalIssues += issues.length;

      if (result.status === 'PASS') passCount++;
      else failCount++;
    }

    // Group by category
    const byCategory = {};
    auditResults.forEach(result => {
      const cat = result.category || 'unknown';
      if (!byCategory[cat]) byCategory[cat] = { pass: 0, fail: 0, total: 0 };
      byCategory[cat].total++;
      if (result.status === 'PASS') byCategory[cat].pass++;
      else byCategory[cat].fail++;
    });

    // Failed games details
    const failedGames = auditResults.filter(r => r.status === 'FAIL');

    return Response.json({
      success: true,
      auditDate: new Date().toISOString(),
      summary: {
        totalGames: allGames.length,
        passed: passCount,
        failed: failCount,
        totalIssuesFound: totalIssues,
        passRate: `${((passCount / allGames.length) * 100).toFixed(1)}%`,
      },
      byCategory,
      failedGamesCount: failedGames.length,
      failedGames: failedGames.slice(0, 20), // Top 20 failed games
      recommendation: failCount > 0 
        ? `⚠️ Found ${totalIssues} emoji mismatch issues in ${failCount} games. Review and regenerate.`
        : '✅ Semua games emoji-answer match OK!',
    });
  } catch (error) {
    console.error('Audit error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});