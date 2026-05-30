// Background scheduled generator — calls launch-generate-batch for first incomplete bucket
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';

const BUCKETS = [
  { ageGroup: 'prasekolah', darjah: null, subjects: ['bahasa_melayu', 'english', 'mathematics', 'science', 'jawi'] },
  { ageGroup: 'sekolah_rendah', darjah: 'darjah_1', subjects: ['bahasa_melayu', 'english', 'mathematics', 'science', 'jawi'] },
  { ageGroup: 'sekolah_rendah', darjah: 'darjah_2', subjects: ['bahasa_melayu', 'english', 'mathematics', 'science', 'jawi'] },
  { ageGroup: 'sekolah_rendah', darjah: 'darjah_3', subjects: ['bahasa_melayu', 'english', 'mathematics', 'science', 'jawi'] },
  { ageGroup: 'sekolah_rendah', darjah: 'darjah_4', subjects: ['bahasa_melayu', 'english', 'mathematics', 'science', 'jawi'] },
  { ageGroup: 'sekolah_rendah', darjah: 'darjah_5', subjects: ['bahasa_melayu', 'english', 'mathematics', 'science', 'jawi'] },
  { ageGroup: 'sekolah_rendah', darjah: 'darjah_6', subjects: ['bahasa_melayu', 'english', 'mathematics', 'science', 'jawi'] },
];

const KAFA_SUBJECTS = ['kafa_quran', 'kafa_jawi', 'kafa_akidah', 'kafa_ibadah', 'kafa_sirah', 'kafa_adab', 'kafa_bahasa_arab'];
const KAFA_BUCKETS = ['darjah_1', 'darjah_2', 'darjah_3', 'darjah_4', 'darjah_5', 'darjah_6']
  .map(d => ({ ageGroup: 'sekolah_rendah', darjah: d, subjects: KAFA_SUBJECTS }));
const KAFA_TARGET_CAP = 10;

async function invokeFunction(name: string, body: any): Promise<any> {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_KEY');
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function countBucket(ageGroup: string, darjah: string | null, category: string): Promise<number> {
  let q = supabaseAdmin.from('ck_games').select('id', { count: 'exact', head: true })
    .eq('age_group', ageGroup).eq('category', category).eq('is_published', true);
  if (darjah) q = q.eq('darjah', darjah);
  const { count } = await q;
  return count || 0;
}

Deno.serve(async (req) => {
  const cors = handleCors(req); if (cors) return cors;

  try {
    const { data: settings } = await supabaseAdmin.from('ck_qc_settings').select('*').limit(1);
    const setting = settings?.[0];
    if (!setting?.background_launch_enabled) {
      return jsonResponse({ success: true, skipped: true, reason: 'disabled' });
    }

    const targetCap = setting?.subject_cap || 30;

    // Trim excess
    let totalTrimmed = 0;
    for (const b of BUCKETS) {
      for (const subject of b.subjects) {
        let q = supabaseAdmin.from('ck_games').select('id, created_at')
          .eq('age_group', b.ageGroup).eq('category', subject).eq('is_published', true)
          .order('created_at', { ascending: false });
        if (b.darjah) q = q.eq('darjah', b.darjah);
        const { data: existing } = await q;
        if (existing && existing.length > targetCap) {
          const excess = existing.slice(targetCap);
          for (const g of excess) {
            await supabaseAdmin.from('ck_games').delete().eq('id', g.id);
            totalTrimmed++;
          }
        }
      }
    }

    // Find first KAFA bucket needing work
    let targetBucket: any = null;
    let bucketCap = targetCap;
    for (const b of KAFA_BUCKETS) {
      for (const subject of b.subjects) {
        const count = await countBucket(b.ageGroup, b.darjah, subject);
        if (count < KAFA_TARGET_CAP) {
          targetBucket = { ageGroup: b.ageGroup, darjah: b.darjah, category: subject, count, needed: KAFA_TARGET_CAP - count };
          bucketCap = KAFA_TARGET_CAP;
          break;
        }
      }
      if (targetBucket) break;
    }

    if (!targetBucket) {
      for (const b of BUCKETS) {
        for (const subject of b.subjects) {
          const count = await countBucket(b.ageGroup, b.darjah, subject);
          if (count < targetCap) {
            targetBucket = { ageGroup: b.ageGroup, darjah: b.darjah, category: subject, count, needed: targetCap - count };
            bucketCap = targetCap;
            break;
          }
        }
        if (targetBucket) break;
      }
    }

    if (!targetBucket) {
      if (setting?.id) await supabaseAdmin.from('ck_qc_settings').update({ background_launch_enabled: false }).eq('id', setting.id);
      return jsonResponse({ success: true, allComplete: true, trimmed: totalTrimmed });
    }

    const isKafa = targetBucket.category.startsWith('kafa_');
    const fnName = isKafa ? 'generate-all-kafa' : 'launch-generate-batch';
    const payload = isKafa
      ? { targetCount: KAFA_TARGET_CAP, maxGames: 3, internalCall: true }
      : { ageGroup: targetBucket.ageGroup, darjah: targetBucket.darjah, category: targetBucket.category,
          targetCount: bucketCap, dryRun: false, internalCall: true };

    const res = await invokeFunction(fnName, payload);

    return jsonResponse({
      success: true,
      bucket: targetBucket,
      generated: res?.generated || res?.totalGenerated || 0,
      failed: res?.failed || res?.totalFailed || 0,
      trimmed: totalTrimmed,
    });
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});