import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const NEW_SUBJECTS = ['pendidikan_islam', 'sejarah', 'pendidikan_moral', 'rbt', 'pjk', 'seni'];
const DARJAH = ['darjah_1', 'darjah_2', 'darjah_3', 'darjah_4', 'darjah_5', 'darjah_6'];

async function listAllGames(base44) {
  const all = [];
  let skip = 0;
  const limit = 100;
  while (true) {
    const page = await base44.asServiceRole.entities.Game.list('-created_date', limit, skip);
    if (!page || page.length === 0) break;
    all.push(...page);
    skip += page.length;
    if (page.length < limit) break;
  }
  return all;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const games = await listAllGames(base44);
    const result = {};

    for (const subject of NEW_SUBJECTS) {
      const filtered = games.filter(g => g.category === subject && g.isPublished !== false);
      const byDarjah = {};
      for (const d of DARJAH) {
        byDarjah[d] = filtered.filter(g => g.darjah === d).length;
      }
      result[subject] = { total: filtered.length, ...byDarjah };
    }

    return Response.json({ success: true, counts: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});