// Get progress across all launch buckets (ageGroup × darjah × category)
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const BUCKETS = [
  { ageGroup: 'prasekolah', darjah: null, categories: ['bahasa_melayu', 'english', 'mathematics', 'science', 'jawi'] },
  { ageGroup: 'sekolah_rendah', darjah: 'darjah_1', categories: ['bahasa_melayu', 'english', 'mathematics', 'science', 'jawi', 'pendidikan_islam', 'pendidikan_moral', 'rbt', 'pjk', 'seni'] },
  { ageGroup: 'sekolah_rendah', darjah: 'darjah_2', categories: ['bahasa_melayu', 'english', 'mathematics', 'science', 'jawi', 'pendidikan_islam', 'pendidikan_moral', 'rbt', 'pjk', 'seni'] },
  { ageGroup: 'sekolah_rendah', darjah: 'darjah_3', categories: ['bahasa_melayu', 'english', 'mathematics', 'science', 'jawi', 'pendidikan_islam', 'pendidikan_moral', 'rbt', 'pjk', 'seni'] },
  { ageGroup: 'sekolah_rendah', darjah: 'darjah_4', categories: ['bahasa_melayu', 'english', 'mathematics', 'science', 'jawi', 'pendidikan_islam', 'pendidikan_moral', 'sejarah', 'rbt', 'pjk', 'seni'] },
  { ageGroup: 'sekolah_rendah', darjah: 'darjah_5', categories: ['bahasa_melayu', 'english', 'mathematics', 'science', 'jawi', 'pendidikan_islam', 'pendidikan_moral', 'sejarah', 'rbt', 'pjk', 'seni'] },
  { ageGroup: 'sekolah_rendah', darjah: 'darjah_6', categories: ['bahasa_melayu', 'english', 'mathematics', 'science', 'jawi', 'pendidikan_islam', 'pendidikan_moral', 'sejarah', 'rbt', 'pjk', 'seni'] },
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

    // Ambil SEMUA published games sekali sahaja (page-by-page) lalu kira dalam memory.
    // Ini elak 68 panggilan .filter() serentak yang cetuskan rate limit (429 → 500).
    const counts = {}; // key: `${ageGroup}|${darjah||''}|${category}` → count
    let page = 0;
    const PAGE_SIZE = 200;
    while (true) {
      const batch = await base44.asServiceRole.entities.Game.filter(
        { isPublished: true },
        '-created_date',
        PAGE_SIZE,
        page * PAGE_SIZE
      );
      if (!batch || batch.length === 0) break;
      for (const g of batch) {
        const key = `${g.ageGroup}|${g.darjah || ''}|${g.category}`;
        counts[key] = (counts[key] || 0) + 1;
      }
      if (batch.length < PAGE_SIZE) break;
      page++;
    }

    const rows = [];
    let totalExisting = 0;
    let totalNeeded = 0;

    for (const b of BUCKETS) {
      for (const cat of b.categories) {
        const key = `${b.ageGroup}|${b.darjah || ''}|${cat}`;
        const count = counts[key] || 0;
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