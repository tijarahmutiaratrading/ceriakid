import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Same bucket structure as launchGetProgress
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

    // Check if background mode is enabled (stored in QCSetting)
    const settings = await base44.asServiceRole.entities.QCSetting.list();
    const setting = settings[0];
    const enabled = setting?.backgroundLaunchEnabled === true;
    const targetCap = setting?.subjectCap || 30;

    if (!enabled) {
      console.log('Background launch is disabled. Skipping.');
      return Response.json({ success: true, skipped: true, reason: 'disabled' });
    }

    // Find first incomplete bucket
    let targetBucket = null;
    for (const b of BUCKETS) {
      for (const subject of b.subjects) {
        const filter = { ageGroup: b.ageGroup, category: subject, isPublished: true };
        if (b.darjah) filter.darjah = b.darjah;
        const existing = await base44.asServiceRole.entities.Game.filter(filter);
        if (existing.length < targetCap) {
          targetBucket = {
            ageGroup: b.ageGroup,
            darjah: b.darjah,
            category: subject,
            count: existing.length,
            needed: targetCap - existing.length,
          };
          break;
        }
      }
      if (targetBucket) break;
    }

    if (!targetBucket) {
      console.log('🎉 All KSSR buckets complete! Auto-disabling background mode.');
      if (setting?.id) {
        await base44.asServiceRole.entities.QCSetting.update(setting.id, { backgroundLaunchEnabled: false });
      }
      return Response.json({ success: true, allComplete: true });
    }

    console.log(`🚀 Background generating: ${targetBucket.ageGroup}/${targetBucket.darjah || 'pra'}/${targetBucket.category} (${targetBucket.count}/${targetCap})`);

    // Call existing launchGenerateBatch function
    const res = await base44.asServiceRole.functions.invoke('launchGenerateBatch', {
      ageGroup: targetBucket.ageGroup,
      darjah: targetBucket.darjah,
      category: targetBucket.category,
      targetCount: targetCap,
      dryRun: false,
    });

    const generated = res?.data?.generated || 0;
    const failed = res?.data?.failed || 0;
    console.log(`✅ Generated ${generated} games (${failed} failed) for ${targetBucket.category}`);

    return Response.json({
      success: true,
      bucket: targetBucket,
      generated,
      failed,
    });
  } catch (error) {
    console.error('backgroundLaunchGenerator error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});