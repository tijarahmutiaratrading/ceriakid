import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Imports games into DB — skips existing ones (matched by title + ageGroup + category)
// Safe to run multiple times — will never overwrite AI-generated data

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const games = body.games;

    if (!games || !Array.isArray(games)) {
      return Response.json({ error: 'games array required in body' }, { status: 400 });
    }

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const g of games) {
      try {
        // Check duplicate by title + ageGroup + category (safer than order index)
        const existing = await base44.asServiceRole.entities.Game.filter({
          ageGroup: g.ageGroup,
          category: g.category,
          title: g.title,
        });

        if (existing.length > 0) {
          skipped++;
          continue;
        }

        await base44.asServiceRole.entities.Game.create({
          title: g.title,
          type: g.type || 'multiple_choice',
          category: g.category,
          ageGroup: g.ageGroup,
          difficulty: g.difficulty || 'easy',
          tier: g.tier || 'free',
          emoji: g.emoji || '🎮',
          totalQuestions: g.gameData?.questions?.length || 8,
          gameData: g.gameData || {},
          isPublished: true,
          order: g.order ?? 0,
        });
        created++;
      } catch (err) {
        errors++;
      }
    }

    return Response.json({ success: true, created, skipped, errors, total: games.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});