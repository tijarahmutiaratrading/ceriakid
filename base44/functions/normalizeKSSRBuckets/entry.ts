import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const BUCKETS = [
  { ageGroup: 'prasekolah', darjah: null, subjects: ['bahasa_melayu','english','mathematics','science','jawi'] },
  { ageGroup: 'sekolah_rendah', darjah: 'darjah_1', subjects: ['bahasa_melayu','english','mathematics','science','jawi'] },
  { ageGroup: 'sekolah_rendah', darjah: 'darjah_2', subjects: ['bahasa_melayu','english','mathematics','science','jawi'] },
  { ageGroup: 'sekolah_rendah', darjah: 'darjah_3', subjects: ['bahasa_melayu','english','mathematics','science','jawi'] },
  { ageGroup: 'sekolah_rendah', darjah: 'darjah_4', subjects: ['bahasa_melayu','english','mathematics','science','jawi'] },
  { ageGroup: 'sekolah_rendah', darjah: 'darjah_5', subjects: ['bahasa_melayu','english','mathematics','science','jawi'] },
  { ageGroup: 'sekolah_rendah', darjah: 'darjah_6', subjects: ['bahasa_melayu','english','mathematics','science','jawi'] },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const dryRun = body.dryRun === true;
    const target = parseInt(body.target) || 30;
    const generateMissing = body.generateMissing !== false; // default true

    // SINGLE BUCKET MODE: caller passes { ageGroup, darjah, category } to process only one bucket
    // (avoids function timeout when processing all 35 buckets in one call)
    const singleAgeGroup = body.ageGroup;
    const singleDarjah = body.darjah || null;
    const singleCategory = body.category;
    const isSingleMode = singleAgeGroup && singleCategory;

    // Build the list of buckets to process
    let bucketsToProcess = BUCKETS;
    if (isSingleMode) {
      bucketsToProcess = [{
        ageGroup: singleAgeGroup,
        darjah: singleDarjah,
        subjects: [singleCategory],
      }];
    }

    const report = [];
    let totalDeleted = 0;
    let totalGenerated = 0;
    let totalGenFailed = 0;

    for (const b of bucketsToProcess) {
      for (const subject of b.subjects) {
        const filter = { ageGroup: b.ageGroup, category: subject, isPublished: true };
        if (b.darjah) filter.darjah = b.darjah;

        // Get all games (sorted by created_date desc — newest first)
        const games = await base44.asServiceRole.entities.Game.filter(filter, '-created_date', 500);
        const count = games.length;
        const label = `${b.darjah || b.ageGroup}/${subject}`;

        let deleted = 0;
        let generated = 0;
        let genFailed = 0;

        if (count > target) {
          // EXCESS — delete oldest (keep newest `target` games)
          const toDelete = games.slice(target); // games[target..end] are oldest
          if (!dryRun) {
            for (const g of toDelete) {
              try {
                await base44.asServiceRole.entities.Game.delete(g.id);
                deleted++;
                totalDeleted++;
                await new Promise(r => setTimeout(r, 50)); // small delay to avoid rate limit
              } catch (e) {
                console.error(`Delete failed for ${g.id}: ${e.message}`);
              }
            }
          } else {
            deleted = toDelete.length;
          }
        } else if (count < target && generateMissing) {
          // SHORTFALL — call launchGenerateBatch (which tops up to target)
          if (!dryRun) {
            try {
              const res = await base44.asServiceRole.functions.invoke('launchGenerateBatch', {
                ageGroup: b.ageGroup,
                darjah: b.darjah,
                category: subject,
                targetCount: target,
                dryRun: false,
              });
              generated = res?.data?.generated || 0;
              genFailed = res?.data?.failed || 0;
              totalGenerated += generated;
              totalGenFailed += genFailed;
              // Cooldown between generation batches to avoid LLM rate limits
              await new Promise(r => setTimeout(r, 3000));
            } catch (e) {
              console.error(`Generate failed for ${label}: ${e.message}`);
              genFailed = target - count;
            }
          }
        }

        report.push({
          bucket: label,
          before: count,
          target,
          action: count > target ? 'trim' : count < target ? (generateMissing ? 'generate' : 'skip') : 'ok',
          deleted,
          generated,
          genFailed,
          after: count - deleted + generated,
        });
      }
    }

    return Response.json({
      success: true,
      dryRun,
      target,
      totalDeleted,
      totalGenerated,
      totalGenFailed,
      report,
    });
  } catch (error) {
    console.error('normalizeKSSRBuckets error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});