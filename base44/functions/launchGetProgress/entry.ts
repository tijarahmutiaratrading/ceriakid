// Get progress across all launch buckets (ageGroup × darjah × category)
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const BUCKETS = [
  { ageGroup: 'prasekolah', darjah: null, categories: ['bahasa_melayu', 'english', 'mathematics', 'science', 'jawi'] },
  { ageGroup: 'sekolah_rendah', darjah: 'darjah_1', categories: ['bahasa_melayu', 'english', 'mathematics', 'science', 'jawi'] },
  { ageGroup: 'sekolah_rendah', darjah: 'darjah_2', categories: ['bahasa_melayu', 'english', 'mathematics', 'science', 'jawi'] },
  { ageGroup: 'sekolah_rendah', darjah: 'darjah_3', categories: ['bahasa_melayu', 'english', 'mathematics', 'science', 'jawi'] },
  { ageGroup: 'sekolah_rendah', darjah: 'darjah_4', categories: ['bahasa_melayu', 'english', 'mathematics', 'science', 'jawi'] },
  { ageGroup: 'sekolah_rendah', darjah: 'darjah_5', categories: ['bahasa_melayu', 'english', 'mathematics', 'science', 'jawi'] },
  { ageGroup: 'sekolah_rendah', darjah: 'darjah_6', categories: ['bahasa_melayu', 'english', 'mathematics', 'science', 'jawi'] },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Read target from QCSetting (set via Target Settings modal)
    let TARGET = 30;
    try {
      const settings = await base44.asServiceRole.entities.QCSetting.list();
      if (settings.length > 0 && settings[0].subjectCap) {
        TARGET = settings[0].subjectCap;
      }
    } catch (e) { /* use default */ }

    const rows = [];
    let totalExisting = 0;
    let totalNeeded = 0;

    for (const b of BUCKETS) {
      for (const cat of b.categories) {
        const filter = { ageGroup: b.ageGroup, category: cat, isPublished: true };
        if (b.darjah) filter.darjah = b.darjah;
        const games = await base44.asServiceRole.entities.Game.filter(filter);
        const count = games.length;
        const needed = Math.max(0, TARGET - count);
        totalExisting += count;
        totalNeeded += needed;
        rows.push({
          ageGroup: b.ageGroup,
          darjah: b.darjah,
          category: cat,
          count,
          target: TARGET,
          needed,
          percent: Math.min(100, Math.round((count / TARGET) * 100)),
          status: count >= TARGET ? 'complete' : count > 0 ? 'partial' : 'empty',
        });
      }
    }

    return Response.json({
      success: true,
      target: TARGET,
      totalBuckets: rows.length,
      completeBuckets: rows.filter(r => r.status === 'complete').length,
      totalExisting,
      totalNeeded,
      totalTarget: rows.length * TARGET,
      overallPercent: Math.round((totalExisting / (rows.length * TARGET)) * 100),
      rows,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});