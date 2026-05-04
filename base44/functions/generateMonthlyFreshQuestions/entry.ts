import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Scheduled automation: runs on 1st of every month
// 1. Queues fresh question generation tasks for ALL subjects (tagged with current monthTag)
// 2. Deletes games tagged 2+ months ago (keeps current month + last month)
// processNextGameTask (every 5 min) handles actual AI generation

const SUBJECTS = [
  { ageGroup: 'prasekolah', subject: 'bahasa_melayu', label: 'Prasekolah - BM' },
  { ageGroup: 'prasekolah', subject: 'english', label: 'Prasekolah - English' },
  { ageGroup: 'prasekolah', subject: 'mathematics', label: 'Prasekolah - Math' },
  { ageGroup: 'prasekolah', subject: 'science', label: 'Prasekolah - Science' },
  { ageGroup: 'prasekolah', subject: 'bahasa_tamil', label: 'Prasekolah - Tamil' },
  { ageGroup: 'prasekolah', subject: 'bahasa_mandarin', label: 'Prasekolah - Mandarin' },
  { ageGroup: 'sekolah_rendah', subject: 'bahasa_melayu', label: 'Sekolah Rendah - BM' },
  { ageGroup: 'sekolah_rendah', subject: 'jawi', label: 'Sekolah Rendah - Jawi' },
  { ageGroup: 'sekolah_rendah', subject: 'english', label: 'Sekolah Rendah - English' },
  { ageGroup: 'sekolah_rendah', subject: 'mathematics', label: 'Sekolah Rendah - Math' },
  { ageGroup: 'sekolah_rendah', subject: 'science', label: 'Sekolah Rendah - Science' },
  { ageGroup: 'sekolah_rendah', subject: 'bahasa_tamil', label: 'Sekolah Rendah - Tamil' },
  { ageGroup: 'sekolah_rendah', subject: 'bahasa_mandarin', label: 'Sekolah Rendah - Mandarin' },
];

const NEW_GAMES_PER_SUBJECT = 20;
const QUESTIONS_PER_GAME = 20;

// Returns 'YYYY-MM' string, offset by monthsAgo (0 = current, -1 = last month, -2 = 2 months ago)
function getMonthTag(date, offsetMonths = 0) {
  const d = new Date(date.getFullYear(), date.getMonth() + offsetMonths, 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const now = new Date();
    const currentTag = getMonthTag(now, 0);        // e.g. '2026-05'
    const lastMonthTag = getMonthTag(now, -1);      // e.g. '2026-04'
    const oldTag = getMonthTag(now, -2);            // e.g. '2026-03' — DELETE these

    const monthLabel = now.toLocaleString('ms-MY', { month: 'long', year: 'numeric', timeZone: 'Asia/Kuala_Lumpur' });
    console.log(`generateMonthlyFreshQuestions: ${monthLabel} | current=${currentTag} keep=${lastMonthTag} delete=${oldTag}`);

    // ── STEP 1: Delete games tagged 2+ months ago ──
    let deleted = 0;
    const allGames = await base44.asServiceRole.entities.Game.list();
    const toDelete = allGames.filter(g => {
      if (!g.monthTag) return false; // never delete untagged (manual/original games)
      return g.monthTag <= oldTag;   // '2026-03' <= '2026-03' → delete
    });

    for (const g of toDelete) {
      await base44.asServiceRole.entities.Game.delete(g.id);
      deleted++;
    }
    console.log(`Deleted ${deleted} old games (tag <= ${oldTag})`);

    // ── STEP 2: Queue new game generation for this month ──
    let queued = 0;
    let skipped = 0;

    for (const s of SUBJECTS) {
      // Avoid duplicate tasks for this month
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const existing = await base44.asServiceRole.entities.GameTask.filter({
        ageGroup: s.ageGroup,
        subject: s.subject,
        status: 'pending',
      });
      const alreadyQueued = existing.filter(t => t.created_date >= thisMonthStart);
      if (alreadyQueued.length > 0) {
        skipped++;
        continue;
      }

      await base44.asServiceRole.entities.GameTask.create({
        taskName: `[${currentTag}] ${s.label}`,
        ageGroup: s.ageGroup,
        subject: s.subject,
        gamesCount: NEW_GAMES_PER_SUBJECT,
        questionsPerGame: QUESTIONS_PER_GAME,
        status: 'pending',
        // monthTag passed via taskName prefix; processNextGameTask will tag games via title
      });

      queued++;
    }

    console.log(`Queued ${queued} subjects, skipped ${skipped}`);

    return Response.json({
      success: true,
      month: monthLabel,
      currentTag,
      keptTag: lastMonthTag,
      deletedTag: oldTag,
      deleted,
      queued,
      skipped,
      message: `Deleted ${deleted} old games. Queued ${queued} subjects for fresh content.`,
    });

  } catch (error) {
    console.error('generateMonthlyFreshQuestions error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});