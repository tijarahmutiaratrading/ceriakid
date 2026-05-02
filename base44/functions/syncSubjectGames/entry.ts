import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Syncs the number of games for a subject by cloning/removing from DB Game entity
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { targetCount, ageGroup, subject, category } = await req.json();

    if (!targetCount || targetCount < 1) {
      return Response.json({ error: 'targetCount required' }, { status: 400 });
    }
    if (!ageGroup || !category) {
      return Response.json({ error: 'ageGroup and category required' }, { status: 400 });
    }

    // Get all games for this subject from DB
    const existing = await base44.asServiceRole.entities.Game.filter({
      ageGroup,
      category,
    });

    // Sort by order
    existing.sort((a, b) => (a.order || 0) - (b.order || 0));

    const currentCount = existing.length;
    let added = 0;
    let removed = 0;

    if (targetCount > currentCount) {
      // Add games by cloning the last one
      const template = existing[existing.length - 1] || {
        title: 'Game Baru',
        type: 'multiple_choice',
        category,
        ageGroup,
        difficulty: 'easy',
        tier: 'free',
        emoji: '🎮',
        totalQuestions: 8,
        gameData: { questions: [] },
        isPublished: true,
      };

      for (let i = currentCount; i < targetCount; i++) {
        await base44.asServiceRole.entities.Game.create({
          title: `${template.title} - ${i + 1}`,
          type: template.type,
          category,
          ageGroup,
          difficulty: template.difficulty || 'easy',
          tier: template.tier || 'free',
          emoji: template.emoji || '🎮',
          totalQuestions: template.totalQuestions || 8,
          gameData: JSON.parse(JSON.stringify(template.gameData || {})),
          isPublished: true,
          order: i,
        });
        added++;
      }
    } else if (targetCount < currentCount) {
      // Remove excess games from the end
      const toRemove = existing.slice(targetCount);
      for (const g of toRemove) {
        await base44.asServiceRole.entities.Game.delete(g.id);
        removed++;
      }
    }

    return Response.json({
      success: true,
      ageGroup,
      category,
      previousCount: currentCount,
      targetCount,
      added,
      removed,
      message: added > 0 ? `${added} games ditambah` : removed > 0 ? `${removed} games dibuang` : 'Sudah pada target',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});