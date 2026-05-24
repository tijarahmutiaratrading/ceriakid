// Purge all games for a specific bucket so we can regenerate fresh high-quality content
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { ageGroup, darjah, category, dryRun = true } = await req.json();
    if (!ageGroup || !category) {
      return Response.json({ error: 'ageGroup and category required' }, { status: 400 });
    }

    const filter = { ageGroup, category };
    if (darjah) filter.darjah = darjah;

    const existing = await base44.asServiceRole.entities.Game.filter(filter);

    if (dryRun) {
      return Response.json({
        success: true,
        dryRun: true,
        wouldDelete: existing.length,
        sample: existing.slice(0, 3).map(g => g.title),
      });
    }

    let deleted = 0;
    for (const g of existing) {
      await base44.asServiceRole.entities.Game.delete(g.id);
      deleted++;
    }

    return Response.json({
      success: true,
      deleted,
      bucket: `${ageGroup}${darjah ? '/' + darjah : ''}/${category}`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});