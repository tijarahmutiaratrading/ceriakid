import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const subjects = ['pendidikan_islam', 'sejarah', 'pendidikan_moral', 'rbt', 'pjk', 'seni'];
    const darjahs = ['darjah_1', 'darjah_2', 'darjah_3', 'darjah_4', 'darjah_5', 'darjah_6'];

    const result = {};
    for (const subject of subjects) {
      const games = await base44.asServiceRole.entities.Game.filter({ category: subject, isPublished: true });
      const breakdown = {};
      darjahs.forEach(d => { breakdown[d] = 0; });
      games.forEach(g => {
        const d = g.darjah || 'unknown';
        breakdown[d] = (breakdown[d] || 0) + 1;
      });
      result[subject] = { total: games.length, darjah: breakdown };
    }

    return Response.json({ success: true, result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});