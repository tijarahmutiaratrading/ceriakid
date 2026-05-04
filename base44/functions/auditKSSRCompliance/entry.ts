import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const validCategories = ['bahasa_melayu', 'english', 'mathematics', 'science', 'general', 'jawi', 'bahasa_tamil', 'bahasa_mandarin', 'memory', 'dragdrop', 'wordbuilder', 'sorting', 'tilematch', 'story', 'physics', 'tracing'];
    const miniCategories = ['memory', 'dragdrop', 'wordbuilder', 'sorting', 'tilematch', 'story', 'physics', 'tracing'];
    const validAgeGroups = ['prasekolah', 'sekolah_rendah'];
    const validDifficulty = ['easy', 'medium', 'hard'];
    const bannedPattern = /(hewan|singh|bekam|\blama\b|\bbabi\b|turtle|kodok|kelinci|daki|moo|woof|roar|rindu|semangat ketua|bintang di badannya|rongga hidung|terpanjang di dunia|jangan lupa|dua jenis rupa|haiwan apa|apakah nama haiwan ini|sering dibela|soalan\s*\d+|placeholder|contoh jawapan|lihat gambar|gambar di bawah)/i;

    // Fetch all games
    const allGames = await base44.entities.Game.list('-created_date', 1000);
    
    const issues = {
      invalidCategory: [],
      invalidAgeGroup: [],
      invalidDifficulty: [],
      noGameData: [],
      noQuestions: [],
      tooFewQuestions: [],
      wrongLanguageSubject: [], // e.g. Malay questions in English subject
      missingTitle: [],
      missingType: [],
      total: allGames?.length || 0
    };

    if (!allGames || allGames.length === 0) {
      return Response.json({ message: 'No games found', issues });
    }

    for (const game of allGames) {
      // Check category
      if (!validCategories.includes(game.category)) {
        issues.invalidCategory.push({ id: game.id, category: game.category });
      }

      // Check age group
      if (!validAgeGroups.includes(game.ageGroup)) {
        issues.invalidAgeGroup.push({ id: game.id, ageGroup: game.ageGroup });
      }

      // Check difficulty
      if (game.difficulty && !validDifficulty.includes(game.difficulty)) {
        issues.invalidDifficulty.push({ id: game.id, difficulty: game.difficulty });
      }

      // Check title
      if (!game.title) {
        issues.missingTitle.push(game.id);
      }

      // Check type
      if (!game.type) {
        issues.missingType.push(game.id);
      }

      // Check gameData exists
      if (!game.gameData) {
        issues.noGameData.push(game.id);
      }

      // Check questions/content in gameData
      const questions = game.gameData?.questions;
      if (miniCategories.includes(game.category)) {
        const hasMiniContent = Boolean(
          game.gameData?.pairs?.length ||
          game.gameData?.items?.length ||
          game.gameData?.words?.length ||
          game.gameData?.tiles?.length ||
          game.gameData?.scenes?.length ||
          game.gameData?.challenges?.length ||
          game.gameData?.letters?.length
        );
        if (!hasMiniContent) issues.noGameData.push(game.id);
      } else if (!questions || questions.length === 0) {
        issues.noQuestions.push(game.id);
      } else {
        if (questions.length < 8) issues.tooFewQuestions.push({ id: game.id, count: questions.length });
        const badQuestions = questions.filter(q => bannedPattern.test([q.problem || q.question || '', ...(q.options || [])].join(' ')));
        if (badQuestions.length > 0) issues.wrongLanguageSubject.push({ id: game.id, title: game.title, sampleQuestion: badQuestions[0].problem || badQuestions[0].question });
      }

      // Check language matching (basic check)
      if (game.category === 'english' && game.title?.includes('English')) {
        const firstQ = questions?.[0];
        if (firstQ && typeof firstQ.question === 'string') {
          // Check if question looks like Malay (common Malay words)
          const malayWords = ['apa', 'siapa', 'berapa', 'mana', 'yang', 'atau', 'dan', 'ke', 'di'];
          const questionLower = firstQ.question.toLowerCase();
          if (malayWords.some(word => questionLower.includes(word))) {
            issues.wrongLanguageSubject.push({ 
              id: game.id, 
              title: game.title,
              sampleQuestion: firstQ.question 
            });
          }
        }
      }
    }

    const totalIssues = Object.values(issues).reduce((sum, arr) => {
      return sum + (Array.isArray(arr) ? arr.length : 0);
    }, 0);

    return Response.json({
      message: 'KSSR Compliance Audit Complete',
      summary: {
        totalGames: issues.total,
        issuesFound: totalIssues,
        compliance: totalIssues === 0 ? '✅ 100% Compliant' : `⚠️ ${totalIssues} issues found`
      },
      issues
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});