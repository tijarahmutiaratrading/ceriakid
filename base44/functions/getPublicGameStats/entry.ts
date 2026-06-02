import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Public endpoint — returns aggregated game count statistics for marketing pages
// (Landing page, UpgradeTierCard, etc). No authentication required since these
// are public stats. Uses service role to count all published games.
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // Fetch all published games (service role, bypass user filtering)
        const games = await base44.asServiceRole.entities.Game.filter({ isPublished: true });

        // Group by BUCKET (= darjah for sekolah_rendah, or subject for prasekolah)
        // supaya match dengan logic lock di GamesList — per-darjah quota.
        const subjectCounts = {};  // legacy: per ageGroup-category (untuk back-compat)
        const bucketCounts = {};   // baru: per bucket (darjah utk SR, subject utk PS)
        for (const g of games) {
            const subjectKey = `${g.ageGroup}-${g.category}`;
            subjectCounts[subjectKey] = (subjectCounts[subjectKey] || 0) + 1;

            const bucketKey = g.ageGroup === 'sekolah_rendah' && g.darjah
                ? `${g.ageGroup}-${g.category}-${g.darjah}`
                : subjectKey;
            bucketCounts[bucketKey] = (bucketCounts[bucketKey] || 0) + 1;
        }

        // Per-bucket tier limit — must match lib/tierAccess.js
        const TIER_LIMITS = { asas: 10, standard: 20, keluarga: Infinity };

        // Untuk setiap bucket, user boleh akses min(bucketCount, tierLimit).
        // Total accessible = sum across all buckets.
        const totalGames = games.length;
        const subjectKeys = Object.keys(subjectCounts);
        const bucketKeys = Object.keys(bucketCounts);
        const numSubjects = subjectKeys.length;

        const accessibleByTier = {};
        for (const [tier, limit] of Object.entries(TIER_LIMITS)) {
            let accessible = 0;
            for (const key of bucketKeys) {
                accessible += Math.min(bucketCounts[key], limit);
            }
            accessibleByTier[tier] = accessible;
        }

        return Response.json({
            success: true,
            totalGames,
            numSubjects,
            subjectCounts,
            bucketCounts,
            accessibleByTier, // { asas, standard, keluarga: totalGames } — kira per-bucket
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