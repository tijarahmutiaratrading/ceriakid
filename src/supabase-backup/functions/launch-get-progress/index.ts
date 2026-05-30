// Get progress across all KSSR/KSPK buckets
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { requireAdmin } from '../_shared/authGuards.ts';

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
  const cors = handleCors(req); if (cors) return cors;
  const guard = await requireAdmin(req);
  if (guard instanceof Response) return guard;

  try {
    let TARGET = 30;
    const { data: settings } = await supabaseAdmin.from('ck_qc_settings').select('subject_cap').limit(1);
    if (settings?.[0]?.subject_cap) TARGET = settings[0].subject_cap;

    const rows: any[] = [];
    let totalExisting = 0, totalNeeded = 0;

    for (const b of BUCKETS) {
      for (const cat of b.categories) {
        let q = supabaseAdmin.from('ck_games').select('id', { count: 'exact', head: true })
          .eq('age_group', b.ageGroup).eq('category', cat).eq('is_published', true);
        if (b.darjah) q = q.eq('darjah', b.darjah);
        const { count } = await q;
        const c = count || 0;
        const needed = Math.max(0, TARGET - c);
        totalExisting += c;
        totalNeeded += needed;
        rows.push({
          ageGroup: b.ageGroup, darjah: b.darjah, category: cat,
          count: c, target: TARGET, needed,
          percent: Math.min(100, Math.round((c / TARGET) * 100)),
          status: c >= TARGET ? 'complete' : c > 0 ? 'partial' : 'empty',
        });
      }
    }

    return jsonResponse({
      success: true, target: TARGET,
      totalBuckets: rows.length,
      completeBuckets: rows.filter(r => r.status === 'complete').length,
      totalExisting, totalNeeded,
      totalTarget: rows.length * TARGET,
      overallPercent: Math.round((totalExisting / (rows.length * TARGET)) * 100),
      rows,
    });
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});