import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Single unified endpoint returning EVERYTHING admin needs to see
// what background AI is doing right now:
// - KSSR generator state (bucket progress, current bucket, enabled?)
// - Story Kid generator state
// - Mini Games progress
// - GameTask queue counts (pending/running/completed/failed)
// - Last 10 QC logs
// - Active locks (autoRunLockedAt, autoRunCurrentBucket)
//
// Designed for the BackgroundTaskMonitor UI to poll every 30s.

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
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    // === 1. SETTINGS (locks, toggles, current bucket) ===
    const settings = await base44.asServiceRole.entities.QCSetting.list();
    const setting = settings[0] || {};
    const target = setting.subjectCap || 30;

    // === 2. KSSR BUCKET PROGRESS ===
    const kssrRows = [];
    let kssrTotal = 0;
    let kssrExisting = 0;
    let kssrComplete = 0;
    let nextBucket = null;

    for (const b of BUCKETS) {
      for (const subject of b.subjects) {
        const filter = { ageGroup: b.ageGroup, category: subject, isPublished: true };
        if (b.darjah) filter.darjah = b.darjah;
        const games = await base44.asServiceRole.entities.Game.filter(filter);
        const count = games.length;
        const needed = Math.max(0, target - count);
        const isComplete = count >= target;

        kssrRows.push({
          ageGroup: b.ageGroup,
          darjah: b.darjah,
          category: subject,
          count,
          target,
          needed,
          percent: Math.round((count / target) * 100),
          status: isComplete ? 'complete' : count > 0 ? 'partial' : 'empty',
        });

        kssrTotal += target;
        kssrExisting += count;
        if (isComplete) kssrComplete++;
        if (!nextBucket && !isComplete) {
          nextBucket = { ageGroup: b.ageGroup, darjah: b.darjah, category: subject, needed };
        }
      }
    }

    // === 3. STORY KID PROGRESS ===
    const storyGames = await base44.asServiceRole.entities.Game.filter({ category: 'story', isPublished: true });
    const storyTarget = setting.storyKidCap || 30;
    const storyProgress = {
      count: storyGames.length,
      target: storyTarget,
      percent: Math.round((storyGames.length / storyTarget) * 100),
      isComplete: storyGames.length >= storyTarget,
    };

    // === 4. MINI GAMES PROGRESS ===
    const MINI_CATEGORIES = ['memory_master','logic_puzzles','speed_focus','pattern_genius','maze_adventure','creative_builder','problem_solver','brain_training'];
    const miniTarget = setting.miniGameCap || 30;
    const miniRows = [];
    let miniTotal = 0;
    let miniExisting = 0;
    for (const cat of MINI_CATEGORIES) {
      const games = await base44.asServiceRole.entities.Game.filter({ category: cat, isPublished: true });
      const count = games.length;
      miniRows.push({
        category: cat,
        count,
        target: miniTarget,
        percent: Math.round((count / miniTarget) * 100),
        isComplete: count >= miniTarget,
      });
      miniTotal += miniTarget;
      miniExisting += count;
    }

    // === 5. GAMETASK QUEUE ===
    const [pendingTasks, runningTasks, completedTasks, failedTasks] = await Promise.all([
      base44.asServiceRole.entities.GameTask.filter({ status: 'pending' }, '-created_date', 500),
      base44.asServiceRole.entities.GameTask.filter({ status: 'running' }, '-created_date', 100),
      base44.asServiceRole.entities.GameTask.filter({ status: 'completed' }, '-created_date', 50),
      base44.asServiceRole.entities.GameTask.filter({ status: 'failed' }, '-created_date', 50),
    ]);

    // === 6. RECENT QC LOGS (last 10) ===
    const recentQcLogs = await base44.asServiceRole.entities.QCLog.list('-runAt', 10);

    // === 7. LOCK STATUS ===
    let lockStatus = 'idle';
    let lockAgeMinutes = null;
    if (setting.autoRunLockedAt) {
      const ageMs = Date.now() - new Date(setting.autoRunLockedAt).getTime();
      lockAgeMinutes = Math.round(ageMs / 60000);
      lockStatus = lockAgeMinutes > 10 ? 'stale' : 'active';
    }

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),

      // System state
      system: {
        backgroundLaunchEnabled: setting.backgroundLaunchEnabled === true,
        backgroundStoryEnabled: setting.backgroundStoryEnabled === true,
        intervalMinutes: setting.intervalMinutes || 10,
        lockStatus,
        lockAgeMinutes,
        lockedAt: setting.autoRunLockedAt || null,
        lockedBy: setting.autoRunLockedBy || null,
        currentBucket: setting.autoRunCurrentBucket || null,
      },

      // KSSR (subject games)
      kssr: {
        totalBuckets: kssrRows.length,
        completeBuckets: kssrComplete,
        totalExisting: kssrExisting,
        totalTarget: kssrTotal,
        percent: Math.round((kssrExisting / kssrTotal) * 100),
        nextBucket,
        rows: kssrRows,
      },

      // Story Kid
      story: storyProgress,

      // Mini Games
      miniGames: {
        totalExisting: miniExisting,
        totalTarget: miniTotal,
        percent: Math.round((miniExisting / miniTotal) * 100),
        rows: miniRows,
      },

      // Task queue
      tasks: {
        pending: pendingTasks.length,
        running: runningTasks.length,
        completed: completedTasks.length,
        failed: failedTasks.length,
        runningList: runningTasks.slice(0, 5).map(t => ({
          id: t.id,
          taskName: t.taskName,
          subject: t.subject,
          ageGroup: t.ageGroup,
          darjah: t.darjah,
          gamesCount: t.gamesCount,
          createdGames: t.createdGames,
          startedAt: t.startedAt,
        })),
        recentCompleted: completedTasks.slice(0, 5).map(t => ({
          id: t.id,
          taskName: t.taskName,
          createdGames: t.createdGames,
          completedAt: t.completedAt,
        })),
        recentFailed: failedTasks.slice(0, 5).map(t => ({
          id: t.id,
          taskName: t.taskName,
          errorMessage: t.errorMessage,
        })),
      },

      // QC activity log
      recentQc: recentQcLogs.map(l => ({
        id: l.id,
        runAt: l.runAt,
        action: l.action,
        status: l.status,
        score: l.score,
        message: l.message,
        deletedCount: l.deletedCount,
      })),
    });
  } catch (error) {
    console.error('getBackgroundActivityStatus error:', error);
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});