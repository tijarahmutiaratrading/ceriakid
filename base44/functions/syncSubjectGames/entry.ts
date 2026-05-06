import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Syncs the number of games for a subject by cloning/removing from DB Game entity
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { targetCount: rawTarget, ageGroup, subject, category, darjah } = await req.json();

    // Cap max 20 games per call to avoid rate limits
    const targetCount = Math.min(rawTarget || 0, 20);

    if (!targetCount || targetCount < 1) {
      return Response.json({ error: 'targetCount required' }, { status: 400 });
    }
    if (!ageGroup || !category) {
      return Response.json({ error: 'ageGroup and category required' }, { status: 400 });
    }

    const filter = { ageGroup, category };
    if (ageGroup === 'sekolah_rendah' && darjah) filter.darjah = darjah;

    // Get all games for this subject from DB
    const existing = await base44.asServiceRole.entities.Game.filter(filter);

    // Sort by order
    existing.sort((a, b) => (a.order || 0) - (b.order || 0));

    const currentCount = existing.length;
    let added = 0;
    let removed = 0;

    if (targetCount > currentCount) {
      const gamesToAdd = targetCount - currentCount;
      const pendingFilter = { ageGroup, subject: category, status: 'pending' };
      if (ageGroup === 'sekolah_rendah' && darjah) pendingFilter.darjah = darjah;
      const existingPending = await base44.asServiceRole.entities.GameTask.filter(pendingFilter);

      if (existingPending.length === 0) {
        await base44.asServiceRole.entities.GameTask.create({
          taskName: `Sync Generate: ${ageGroup} - ${category}${darjah ? ` - ${darjah}` : ''}`,
          ageGroup,
          ...(ageGroup === 'sekolah_rendah' && darjah ? { darjah } : {}),
          subject: category,
          gamesCount: gamesToAdd,
          questionsPerGame: 20,
          status: 'pending',
        });
        added = gamesToAdd;
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
      darjah: darjah || null,
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