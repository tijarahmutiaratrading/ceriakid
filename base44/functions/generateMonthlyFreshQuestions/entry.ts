import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Scheduled automation: runs on 1st of every month
// Queues fresh question generation tasks for ALL subjects
// processNextGameTask (every 5 min) will handle the actual AI generation

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

// How many NEW games to add each month per subject
const NEW_GAMES_PER_SUBJECT = 5;
// Questions per new game
const QUESTIONS_PER_GAME = 20;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const now = new Date();
    const monthLabel = now.toLocaleString('ms-MY', { month: 'long', year: 'numeric', timeZone: 'Asia/Kuala_Lumpur' });

    console.log(`generateMonthlyFreshQuestions: Starting for ${monthLabel}`);

    let queued = 0;
    let skipped = 0;

    for (const s of SUBJECTS) {
      // Check if a task for this subject was already queued this month (avoid duplicates)
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const existing = await base44.asServiceRole.entities.GameTask.filter({
        ageGroup: s.ageGroup,
        subject: s.subject,
        status: 'pending',
      });

      // Filter for tasks created this month
      const thisMonthTasks = existing.filter(t => t.created_date >= thisMonthStart);
      if (thisMonthTasks.length > 0) {
        console.log(`Skip ${s.label} — already queued this month`);
        skipped++;
        continue;
      }

      await base44.asServiceRole.entities.GameTask.create({
        taskName: `[${monthLabel}] ${s.label}`,
        ageGroup: s.ageGroup,
        subject: s.subject,
        gamesCount: NEW_GAMES_PER_SUBJECT,
        questionsPerGame: QUESTIONS_PER_GAME,
        status: 'pending',
      });

      queued++;
      console.log(`Queued: ${s.label}`);
    }

    const message = `Monthly refresh queued: ${queued} subjects, ${skipped} skipped (already queued). Month: ${monthLabel}`;
    console.log(message);

    return Response.json({
      success: true,
      month: monthLabel,
      queued,
      skipped,
      totalSubjects: SUBJECTS.length,
      message,
    });

  } catch (error) {
    console.error('generateMonthlyFreshQuestions error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});