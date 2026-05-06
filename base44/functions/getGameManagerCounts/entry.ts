import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SUBJECTS = [
  { ageGroup: 'prasekolah', subject: 'bahasa_melayu' },
  { ageGroup: 'prasekolah', subject: 'english' },
  { ageGroup: 'prasekolah', subject: 'mathematics' },
  { ageGroup: 'prasekolah', subject: 'science' },
  { ageGroup: 'prasekolah', subject: 'bahasa_tamil' },
  { ageGroup: 'prasekolah', subject: 'bahasa_mandarin' },
  { ageGroup: 'sekolah_rendah', subject: 'bahasa_melayu' },
  { ageGroup: 'sekolah_rendah', subject: 'jawi' },
  { ageGroup: 'sekolah_rendah', subject: 'english' },
  { ageGroup: 'sekolah_rendah', subject: 'mathematics' },
  { ageGroup: 'sekolah_rendah', subject: 'science' },
  { ageGroup: 'sekolah_rendah', subject: 'bahasa_tamil' },
  { ageGroup: 'sekolah_rendah', subject: 'bahasa_mandarin' },
];

const MINI_GAMES = ['memory', 'dragdrop', 'wordbuilder', 'sorting', 'tilematch', 'story', 'physics', 'tracing'];

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
    const subjectCounts = {};
    const miniCounts = {};

    for (const s of SUBJECTS) {
      const filtered = games.filter(g => g.ageGroup === s.ageGroup && g.category === s.subject && g.isPublished !== false);
      const avgQuestions = filtered.length > 0
        ? Math.round(filtered.reduce((sum, g) => sum + (g.gameData?.questions?.length || g.totalQuestions || 0), 0) / filtered.length)
        : 0;
      const countData = { games: filtered.length, avgQuestions };
      if (s.ageGroup === 'sekolah_rendah') {
        countData.darjah = {};
        for (const darjah of ['darjah_1', 'darjah_2', 'darjah_3', 'darjah_4', 'darjah_5', 'darjah_6']) {
          const byDarjah = filtered.filter(g => g.darjah === darjah);
          countData.darjah[darjah] = {
            games: byDarjah.length,
            avgQuestions: byDarjah.length > 0
              ? Math.round(byDarjah.reduce((sum, g) => sum + (g.gameData?.questions?.length || g.totalQuestions || 0), 0) / byDarjah.length)
              : 0,
          };
        }
      }
      subjectCounts[`${s.ageGroup}-${s.subject}`] = countData;
    }

    for (const id of MINI_GAMES) {
      const filtered = games.filter(g => g.category === id && g.isPublished !== false);
      miniCounts[id] = {
        count: filtered.length,
        totalQuestions: filtered.reduce((sum, g) => sum + (g.gameData?.questions?.length || g.totalQuestions || 0), 0),
      };
    }

    return Response.json({ success: true, subjectCounts, miniCounts });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});