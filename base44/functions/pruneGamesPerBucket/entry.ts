import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SUBJECTS = ['bahasa_melayu', 'english', 'mathematics', 'science', 'jawi', 'bahasa_tamil', 'bahasa_mandarin'];
const DARJAH_LEVELS = ['darjah_1', 'darjah_2', 'darjah_3', 'darjah_4', 'darjah_5', 'darjah_6'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const maxPerBucket = Math.max(1, Number(body.maxPerBucket || 30));
    const onlySubject = body.subject || null; // optional filter, e.g. 'bahasa_mandarin'

    // Load all games (paginate)
    const all = [];
    let skip = 0;
    while (true) {
      const page = await base44.asServiceRole.entities.Game.list('-created_date', 200, skip);
      if (!page || page.length === 0) break;
      all.push(...page);
      skip += page.length;
      if (page.length < 200) break;
    }

    // Group by bucket: ageGroup|darjah|category
    const buckets = new Map();
    for (const g of all) {
      if (!SUBJECTS.includes(g.category)) continue;
      if (g.ageGroup === 'sekolah_rendah' && !DARJAH_LEVELS.includes(g.darjah)) continue;
      if (onlySubject && g.category !== onlySubject) continue;
      const key = `${g.ageGroup}|${g.darjah || ''}|${g.category}`;
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(g);
    }

    const report = [];
    let totalDeleted = 0;

    for (const [key, games] of buckets.entries()) {
      if (games.length <= maxPerBucket) continue;

      // Sort: keep games with MORE questions first (better quality), then OLDER (more proven)
      games.sort((a, b) => {
        const qa = a.gameData?.questions?.length || a.totalQuestions || 0;
        const qb = b.gameData?.questions?.length || b.totalQuestions || 0;
        if (qb !== qa) return qb - qa;
        return new Date(a.created_date).getTime() - new Date(b.created_date).getTime();
      });

      const toDelete = games.slice(maxPerBucket);
      for (const g of toDelete) {
        await base44.asServiceRole.entities.Game.delete(g.id);
        totalDeleted++;
        await new Promise(r => setTimeout(r, 100)); // throttle to avoid rate limit
      }
      report.push({ bucket: key, before: games.length, after: maxPerBucket, deleted: toDelete.length });
    }

    // Also cancel pending QC Replacement tasks for buckets that are now full
    const tasks = await base44.asServiceRole.entities.GameTask.list('-created_date', 500);
    let cancelledTasks = 0;
    for (const t of tasks || []) {
      if (t.status !== 'pending') continue;
      if (onlySubject && t.subject !== onlySubject) continue;
      const key = `${t.ageGroup}|${t.darjah || ''}|${t.subject}`;
      const bucket = buckets.get(key);
      if (bucket && bucket.length >= maxPerBucket && /^QC (Replacement|Bucket Refill)/i.test(t.taskName || '')) {
        await base44.asServiceRole.entities.GameTask.delete(t.id);
        cancelledTasks++;
      }
    }

    return Response.json({
      success: true,
      maxPerBucket,
      onlySubject: onlySubject || 'all',
      totalDeleted,
      cancelledTasks,
      buckets: report,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});