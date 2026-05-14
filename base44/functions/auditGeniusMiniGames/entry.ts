import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GENIUS_CATEGORIES = [
  'memory_master',
  'logic_puzzles',
  'speed_focus',
  'pattern_genius',
  'maze_adventure',
  'creative_builder',
  'problem_solver',
  'brain_training',
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const summary = {};
    const issues = [];

    for (const category of GENIUS_CATEGORIES) {
      const games = await base44.asServiceRole.entities.Game.filter({ category });
      summary[category] = { count: games.length, withRounds: 0, issueCount: 0 };

      for (const game of games) {
        const data = game.gameData || {};
        const rounds = Array.isArray(data.rounds) ? data.rounds : [];
        const expectedRounds = Number(data.itemsPerSet || game.totalQuestions || 0);
        const uniqueRounds = new Set(rounds.map(round => String(round).trim().toLowerCase())).size;

        if (rounds.length > 0) summary[category].withRounds++;

        if (data.miniGameGenerated !== true) {
          issues.push({ game: game.title, category, issue: 'Not tagged as generated mini game' });
        }
        if (expectedRounds > 0 && rounds.length !== expectedRounds) {
          issues.push({ game: game.title, category, issue: `Round count ${rounds.length}/${expectedRounds}` });
        }
        if (rounds.length > 1 && uniqueRounds < rounds.length) {
          issues.push({ game: game.title, category, issue: 'Rounds are not unique' });
        }
      }
      summary[category].issueCount = issues.filter(issue => issue.category === category).length;
    }

    const totalGames = Object.values(summary).reduce((sum, item) => sum + item.count, 0);
    const totalWithRounds = Object.values(summary).reduce((sum, item) => sum + item.withRounds, 0);

    return Response.json({
      success: issues.length === 0,
      totalGames,
      totalWithRounds,
      summary,
      issues: issues.slice(0, 30),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});