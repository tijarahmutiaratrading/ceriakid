import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SUBJECTS = ['bahasa_melayu', 'english', 'mathematics', 'science', 'jawi', 'bahasa_tamil', 'bahasa_mandarin'];
const DARJAH_LEVELS = ['darjah_1', 'darjah_2', 'darjah_3', 'darjah_4', 'darjah_5', 'darjah_6'];
const MINI_CATEGORIES = ['memory_master', 'logic_puzzles', 'speed_focus', 'pattern_genius', 'maze_adventure', 'creative_builder', 'problem_solver', 'brain_training', 'memory', 'dragdrop', 'wordbuilder', 'sorting', 'tilematch', 'story', 'physics', 'tracing'];
const MIN_GAMES_PER_BUCKET = 4;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const games = await base44.asServiceRole.entities.Game.list('-created_date', 2000);
    const tasks = await base44.asServiceRole.entities.GameTask.list('-created_date', 200);
    const settings = await base44.asServiceRole.entities.QCSetting.list('-created_date', 1);

    const all = games || [];

    // Classify
    const storyKid = all.filter(g => g.gameData?.storyKid === true);
    const storyKidIds = new Set(storyKid.map(g => g.id));
    const subjectGames = all.filter(g => SUBJECTS.includes(g.category) && !storyKidIds.has(g.id) && !g.gameData?.miniGameGenerated);
    const miniGames = all.filter(g => !storyKidIds.has(g.id) && (g.gameData?.miniGameGenerated || (MINI_CATEGORIES.includes(g.category) && !SUBJECTS.includes(g.category))));

    // ─── Subject games breakdown by subject × darjah/prasekolah ───
    const subjectBuckets = [];
    for (const subject of SUBJECTS) {
      // Prasekolah row
      const preGames = subjectGames.filter(g => g.category === subject && g.ageGroup === 'prasekolah');
      subjectBuckets.push({
        subject,
        level: 'prasekolah',
        count: preGames.length,
        empty: preGames.length === 0,
        low: preGames.length > 0 && preGames.length < MIN_GAMES_PER_BUCKET,
      });
      // Each darjah row
      for (const darjah of DARJAH_LEVELS) {
        const darjGames = subjectGames.filter(g => g.category === subject && g.ageGroup === 'sekolah_rendah' && g.darjah === darjah);
        subjectBuckets.push({
          subject,
          level: darjah,
          count: darjGames.length,
          empty: darjGames.length === 0,
          low: darjGames.length > 0 && darjGames.length < MIN_GAMES_PER_BUCKET,
        });
      }
    }

    // ─── Mini games breakdown by category ───
    const miniBreakdown = MINI_CATEGORIES.map(cat => {
      const items = miniGames.filter(g => g.category === cat);
      return { category: cat, count: items.length, empty: items.length === 0, low: items.length > 0 && items.length < MIN_GAMES_PER_BUCKET };
    });

    // ─── Story kid breakdown ───
    const storySummary = {
      total: storyKid.length,
      prasekolah: storyKid.filter(g => g.ageGroup === 'prasekolah').length,
      sekolahRendah: storyKid.filter(g => g.ageGroup === 'sekolah_rendah').length,
      empty: storyKid.length === 0,
      low: storyKid.length > 0 && storyKid.length < MIN_GAMES_PER_BUCKET,
    };

    // ─── Queue state ───
    const activeTasks = (tasks || []).filter(t => ['pending', 'running'].includes(t.status));
    const failedTasks = (tasks || []).filter(t => t.status === 'failed').length;

    // ─── Health summary ───
    const totalSubjectBuckets = subjectBuckets.length;
    const emptySubjectBuckets = subjectBuckets.filter(b => b.empty).length;
    const lowSubjectBuckets = subjectBuckets.filter(b => b.low).length;
    const emptyMiniBuckets = miniBreakdown.filter(b => b.empty).length;
    const lowMiniBuckets = miniBreakdown.filter(b => b.low).length;

    return Response.json({
      success: true,
      generatedAt: new Date().toISOString(),
      qcSetting: settings?.[0] || null,
      totals: {
        all: all.length,
        subjectGames: subjectGames.length,
        miniGames: miniGames.length,
        storyKid: storyKid.length,
      },
      subjectBuckets,
      miniBreakdown,
      storySummary,
      queue: {
        active: activeTasks.length,
        pending: activeTasks.filter(t => t.status === 'pending').length,
        running: activeTasks.filter(t => t.status === 'running').length,
        failed: failedTasks,
      },
      health: {
        totalSubjectBuckets,
        emptySubjectBuckets,
        lowSubjectBuckets,
        emptyMiniBuckets,
        lowMiniBuckets,
        storyEmpty: storySummary.empty,
        storyLow: storySummary.low,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});