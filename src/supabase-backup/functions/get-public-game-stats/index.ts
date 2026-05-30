// PUBLIC endpoint — aggregated game count statistics for marketing pages
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';

const TIER_LIMITS: Record<string, number> = { asas: 50, standard: 100, keluarga: 200 };

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const { data: games } = await supabaseAdmin
      .from('ck_games')
      .select('age_group, category')
      .eq('is_published', true)
      .limit(10000);

    const subjectCounts: Record<string, number> = {};
    for (const g of games || []) {
      const key = `${g.age_group}-${g.category}`;
      subjectCounts[key] = (subjectCounts[key] || 0) + 1;
    }

    const totalGames = games?.length || 0;
    const subjectKeys = Object.keys(subjectCounts);
    const numSubjects = subjectKeys.length;

    const accessibleByTier: Record<string, number> = {};
    for (const [tier, limit] of Object.entries(TIER_LIMITS)) {
      let accessible = 0;
      for (const key of subjectKeys) {
        accessible += Math.min(subjectCounts[key], limit);
      }
      accessibleByTier[tier] = accessible;
    }

    return new Response(
      JSON.stringify({ success: true, totalGames, numSubjects, subjectCounts, accessibleByTier }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    return jsonResponse({ success: false, error: error.message }, 500);
  }
});