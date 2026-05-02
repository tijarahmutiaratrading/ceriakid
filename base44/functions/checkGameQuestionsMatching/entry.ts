import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { ageGroup, category } = await req.json();

    if (!ageGroup || !category) {
      return Response.json({ error: 'ageGroup and category required' }, { status: 400 });
    }

    // Get all games for this subject
    const games = await base44.asServiceRole.entities.Game.filter({
      ageGroup,
      category,
      isPublished: true,
    });

    const issues = [];
    let totalQuestions = 0;
    let problemQuestions = 0;

    for (const game of games) {
      const questions = game.gameData?.questions || [];
      totalQuestions += questions.length;

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const problemText = q.problem || q.question || '';
        const options = q.options || [];
        const answerIdx = q.answer;
        const answerText = options[answerIdx];

        // Check 1: Empty question
        if (!problemText.trim()) {
          problemQuestions++;
          issues.push({
            gameTitle: game.title,
            questionNum: i + 1,
            problem: 'EMPTY QUESTION',
            question: problemText,
            details: 'Soalan kosong',
          });
          continue;
        }

        // Check 2: Invalid answer index
        if (answerIdx === undefined || answerIdx === null || answerIdx < 0 || answerIdx >= options.length) {
          problemQuestions++;
          issues.push({
            gameTitle: game.title,
            questionNum: i + 1,
            problem: 'INVALID ANSWER INDEX',
            question: problemText,
            answerIndex: answerIdx,
            optionCount: options.length,
            details: `Jawapan index ${answerIdx} tidak sah (hanya ada ${options.length} pilihan)`,
          });
          continue;
        }

        // Check 3: Answer text is empty
        if (!answerText || !answerText.trim()) {
          problemQuestions++;
          issues.push({
            gameTitle: game.title,
            questionNum: i + 1,
            problem: 'EMPTY ANSWER TEXT',
            question: problemText,
            answerIndex: answerIdx,
            answerText: answerText,
            details: 'Pilihan jawapan betul kosong/blank',
          });
          continue;
        }

        // Check 4: All options are same
        const uniqueOptions = new Set(options.filter(o => o && o.trim()).map(o => o.trim().toLowerCase()));
        if (uniqueOptions.size === 1) {
          problemQuestions++;
          issues.push({
            gameTitle: game.title,
            questionNum: i + 1,
            problem: 'DUPLICATE OPTIONS',
            question: problemText,
            options: options,
            details: 'Semua pilihan sama atau kosong',
          });
          continue;
        }

        // Check 5: Less than 4 valid options
        const validOptions = options.filter(o => o && o.trim());
        if (validOptions.length < 4) {
          problemQuestions++;
          issues.push({
            gameTitle: game.title,
            questionNum: i + 1,
            problem: 'INSUFFICIENT OPTIONS',
            question: problemText,
            options: options,
            validCount: validOptions.length,
            details: `Hanya ${validOptions.length} pilihan sah (perlu 4)`,
          });
          continue;
        }

        // Check 6: Answer doesn't match question theme (basic check)
        // For science, check if answer makes sense contextually
        const scienceKeywords = ['haiwan', 'animal', 'bunga', 'flower', 'tumbuhan', 'plant', 'bumi', 'earth', 'air', 'water', 'api', 'fire', 'udara', 'oxygen'];
        const questionLower = problemText.toLowerCase();
        const answerLower = answerText.toLowerCase();
        
        // Simple check: if question has science keyword, answer should too or be contextually related
        const hasKeyword = scienceKeywords.some(kw => questionLower.includes(kw));
        if (hasKeyword && !answerLower.includes('bukan') && !answerLower.includes('tidak') && !answerLower.includes('no')) {
          // This is just a basic heuristic check
          // Real validation would need more context
        }
      }
    }

    return Response.json({
      success: true,
      ageGroup,
      category,
      totalGames: games.length,
      totalQuestions,
      problemQuestions,
      issueCount: issues.length,
      issues: issues.slice(0, 50), // Return first 50 issues
      summary: `Found ${issues.length} issues in ${totalQuestions} questions across ${games.length} games`,
    });
  } catch (error) {
    console.error('Check error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});