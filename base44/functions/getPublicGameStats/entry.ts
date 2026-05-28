import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Public endpoint — returns aggregated game count statistics for marketing pages
// (Landing page, UpgradeTierCard, etc). No authentication required since these
// are public stats. Uses service role to count all published games.
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // Fetch all published games (service role, bypass user filtering)
        const games = await base44.asServiceRole.entities.Game.filter({ isPublished: true });

        // Group by ageGroup + category to get per-subject counts
        const subjectCounts = {};
        for (const g of games) {
            const key = `${g.ageGroup}-${g.category}`;
            subjectCounts[key] = (subjectCounts[key] || 0) + 1;
        }

        // Tier limit per subject — must match lib/tierAccess.js
        const TIER_LIMITS = { asas: 50, standard: 100, keluarga: 200 };

        // Calculate accessible games per tier:
        // For each subject, user can access min(subjectCount, tierLimit)
        const totalGames = games.length;
        const subjectKeys = Object.keys(subjectCounts);
        const numSubjects = subjectKeys.length;

        const accessibleByTier = {};
        for (const [tier, limit] of Object.entries(TIER_LIMITS)) {
            let accessible = 0;
            for (const key of subjectKeys) {
                accessible += Math.min(subjectCounts[key], limit);
            }
            accessibleByTier[tier] = accessible;
        }

        return Response.json({
            success: true,
            totalGames,
            numSubjects,
            subjectCounts,
            accessibleByTier, // { asas: ~300, standard: ~600, keluarga: totalGames }
        }, {
            headers: {
                // Cache for 1 hour — counts don't change often
                'Cache-Control': 'public, max-age=3600',
            }
        });
    } catch (error) {
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
});