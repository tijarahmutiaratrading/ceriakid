import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// All subject configs
const SUBJECT_CONFIGS = [
  // Prasekolah
  { ageGroup: 'prasekolah', subject: 'bahasa_melayu', label: 'Prasekolah - BM' },
  { ageGroup: 'prasekolah', subject: 'english', label: 'Prasekolah - English' },
  { ageGroup: 'prasekolah', subject: 'mathematics', label: 'Prasekolah - Math' },
  { ageGroup: 'prasekolah', subject: 'science', label: 'Prasekolah - Science' },
  { ageGroup: 'prasekolah', subject: 'bahasa_tamil', label: 'Prasekolah - Tamil' },
  { ageGroup: 'prasekolah', subject: 'bahasa_mandarin', label: 'Prasekolah - Mandarin' },
  // Sekolah Rendah
  { ageGroup: 'sekolah_rendah', subject: 'bahasa_melayu', label: 'SR - BM' },
  { ageGroup: 'sekolah_rendah', subject: 'jawi', label: 'SR - Jawi' },
  { ageGroup: 'sekolah_rendah', subject: 'english', label: 'SR - English' },
  { ageGroup: 'sekolah_rendah', subject: 'mathematics', label: 'SR - Math' },
  { ageGroup: 'sekolah_rendah', subject: 'science', label: 'SR - Science' },
  { ageGroup: 'sekolah_rendah', subject: 'bahasa_tamil', label: 'SR - Tamil' },
  { ageGroup: 'sekolah_rendah', subject: 'bahasa_mandarin', label: 'SR - Mandarin' },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { gamesCount = 30, questionsPerGame = 20 } = await req.json();

    // Generate tasks - Sekolah Rendah is separated by Darjah 1-6
    const darjahLevels = ['darjah_1', 'darjah_2', 'darjah_3', 'darjah_4', 'darjah_5', 'darjah_6'];
    const darjahLabels = { darjah_1: 'Darjah 1', darjah_2: 'Darjah 2', darjah_3: 'Darjah 3', darjah_4: 'Darjah 4', darjah_5: 'Darjah 5', darjah_6: 'Darjah 6' };
    const tasks = [];

    for (const config of SUBJECT_CONFIGS) {
      if (config.ageGroup === 'sekolah_rendah') {
        for (const darjah of darjahLevels) {
          tasks.push({
            taskId: tasks.length + 1,
            taskName: `${config.label} - ${darjahLabels[darjah]}`,
            ageGroup: config.ageGroup,
            darjah,
            subject: config.subject,
            gamesCount,
            questionsPerGame,
          });
        }
      } else {
        tasks.push({
          taskId: tasks.length + 1,
          taskName: config.label,
          ageGroup: config.ageGroup,
          subject: config.subject,
          gamesCount,
          questionsPerGame,
        });
      }
    }

    return Response.json({
      success: true,
      totalTasks: tasks.length,
      totalGames: tasks.length * gamesCount,
      totalQuestions: tasks.length * gamesCount * questionsPerGame,
      tasks,
      instruction: 'Execute each task sequentially using "regenerateGamesTask" function. Wait for each task to complete before starting the next.',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});