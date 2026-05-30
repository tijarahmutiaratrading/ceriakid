// Normalize KSSR/KSPK buckets — trim excess games (keep newest N), skip generation in Supabase env
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { requireAdmin } from '../_shared/authGuards.ts';

const BUCKETS = [
  { ageGroup: 'prasekolah', darjah: null, subjects: ['bahasa_melayu', 'english', 'mathematics', 'science', 'jawi'] },
  { ageGroup: 'sekolah_rendah', darjah: 'darjah_1', subjects: ['bahasa_melayu', 'english', 'mathematics', 'science', 'jawi'] },
  { ageGroup: 'sekolah_rendah', darjah: 'darjah_2', subjects: ['bahasa_melayu', 'english', 'mathematics', 'science', 'jawi'] },
  { ageGroup: 'sekolah_rendah', darjah: 'darjah_3', subjects: ['bahasa_melayu', 'english', 'mathematics', 'science', 'jawi'] },
  { ageGroup: 'sekolah_rendah', darjah: 'darjah_4', subjects: ['bahasa_melayu', 'english', 'mathematics', 'science', 'jawi'] },
  { ageGroup: 'sekolah_rendah', darjah: 'darjah_5', subjects: ['bahasa_melayu', 'english', 'mathematics', 'science', 'jawi'] },
  { ageGroup: 'sekolah_rendah', darjah: 'darjah_6', subjects: ['bahasa_melayu', 'english', 'mathematics', 'science', 'jawi'] },
];

Deno.serve(async (req) => {
  const cors = handleCors(req); if (cors) return cors;
  const guard = await requireAdmin(req);
  if (guard instanceof Response) return guard;

  try {
    const body = await req.json().catch(() => ({}));
    const dryRun = body.dryRun === true;
    const target = parseInt(body.target) || 30;

    const singleAgeGroup = body.ageGroup, singleDarjah = body.darjah || null, singleCategory = body.category;
    const isSingle = singleAgeGroup && singleCategory;
    const buckets = isSingle ? [{ ageGroup: singleAgeGroup, darjah: singleDarjah, subjects: [singleCategory] }] : BUCKETS;

    const report: any[] = [];
    let totalDeleted = 0;

    for (const b of buckets) {
      for (const subject of b.subjects) {
        let q = supabaseAdmin.from('ck_games').select('*').eq('age_group', b.ageGroup).eq('category', subject).eq('is_published', true);
        if (b.darjah) q = q.eq('darjah', b.darjah);
        const { data: games } = await q.order('created_at', { ascending: false }).limit(500);

        const count = games?.length || 0;
        const label = `${b.darjah || b.ageGroup}/${subject}`;
        let deleted = 0;

        if (count > target) {
          const toDelete = (games || []).slice(target);
          if (!dryRun) {
            for (const g of toDelete) {
              await supabaseAdmin.from('ck_games').delete().eq('id', g.id);
              deleted++;
              totalDeleted++;
              await new Promise(r => setTimeout(r, 50));
            }
          } else {
            deleted = toDelete.length;
          }
        }

        report.push({
          bucket: label, before: count, target,
          action: count > target ? 'trim' : count < target ? 'needs_generation' : 'ok',
          deleted, after: count - deleted,
        });
      }
    }

    return jsonResponse({
      success: true, dryRun, target, totalDeleted, report,
      note: 'Generation skipped — Supabase env does not include LLM-based game generators.',
    });
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});