// Game analytics from ck_games table (replaces hardcoded lib/ imports)
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { requireAdmin } from '../_shared/authGuards.ts';

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const guard = await requireAdmin(req);
  if (guard instanceof Response) return guard;

  try {
    // Get all published games grouped by category × ageGroup
    const { data: games } = await supabaseAdmin
      .from('ck_games')
      .select('id, title, category, age_group, game_data, total_questions')
      .eq('is_published', true)
      .limit(5000);

    // Group by file-like buckets: ageGroup-category
    const buckets: Record<string, any[]> = {};
    for (const g of games || []) {
      const key = `${g.age_group}-${g.category}`;
      if (!buckets[key]) buckets[key] = [];
      buckets[key].push({
        title: g.title,
        questionCount: g.game_data?.questions?.length || 0,
        isFull: (g.game_data?.questions?.length || 0) >= 20,
        totalQuestions: g.total_questions || 0,
      });
    }

    const subjectAnalytics = Object.entries(buckets).map(([file, gameStats]) => {
      const gamesWithFull = gameStats.filter((g: any) => g.isFull).length;
      return {
        file,
        totalGames: gameStats.length,
        gamesWithFull20: gamesWithFull,
        gamesWithout20: gameStats.length - gamesWithFull,
        percentage: Math.round((gamesWithFull / gameStats.length) * 100),
        games: gameStats,
      };
    });

    const totalSubjectGames = subjectAnalytics.reduce((s, a) => s + a.totalGames, 0);
    const totalSubjectGamesWithFull20 = subjectAnalytics.reduce((s, a) => s + a.gamesWithFull20, 0);

    const gameHubGames = [
      { id: 'memory', title: 'Memory Game' }, { id: 'dragdrop', title: 'Drag Drop Game' },
      { id: 'wordbuilder', title: 'Word Builder Game' }, { id: 'sorting', title: 'Sorting Game' },
      { id: 'tilematch', title: 'Tile Match Game' }, { id: 'story', title: 'Story Adventure Game' },
      { id: 'physics', title: 'Physics Game' }, { id: 'tracing', title: 'Tracing Game' },
    ];

    return jsonResponse({
      success: true,
      subjects: {
        total: subjectAnalytics,
        summary: {
          totalFiles: subjectAnalytics.length,
          totalGames: totalSubjectGames,
          gamesWithFull20: totalSubjectGamesWithFull20,
          percentage: totalSubjectGames > 0 ? Math.round((totalSubjectGamesWithFull20 / totalSubjectGames) * 100) : 0,
        },
      },
      gameHub: {
        totalGames: gameHubGames.length,
        games: gameHubGames.map(g => ({ ...g, isFull: true })),
        percentage: 100,
      },
    });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});