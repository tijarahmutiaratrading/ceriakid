import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Pulangkan progress generate gambar unik games + status automation.
// Admin sahaja.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const all = await base44.asServiceRole.entities.Game.filter({ isPublished: true });
    const total = all.length;
    const withIcon = all.filter(g => g.iconUrl && String(g.iconUrl).startsWith('http'));
    const done = withIcon.length;
    const remaining = total - done;

    // Kira berapa gambar dijana dalam 5/15/60 minit terakhir (ikut updated_date)
    const now = Date.now();
    const min5 = now - 5 * 60 * 1000;
    const min15 = now - 15 * 60 * 1000;
    const hour1 = now - 60 * 60 * 1000;
    let last5 = 0, last15 = 0, lastHour = 0;
    const recent = [];
    for (const g of withIcon) {
      const t = new Date(g.updated_date || g.created_date).getTime();
      if (t >= min5) last5++;
      if (t >= min15) last15++;
      if (t >= hour1) lastHour++;
      recent.push({ id: g.id, title: g.title, iconUrl: g.iconUrl, t });
    }
    recent.sort((a, b) => b.t - a.t);
    const recentGames = recent.slice(0, 12).map(r => ({
      id: r.id,
      title: r.title,
      iconUrl: r.iconUrl,
      ageMin: Math.max(0, Math.round((now - r.t) / 60000)),
    }));

    return Response.json({
      success: true,
      total,
      done,
      remaining,
      percent: total > 0 ? Math.round((done / total) * 100) : 0,
      last5, last15, lastHour,
      live: last5 > 0,
      recentGames,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});