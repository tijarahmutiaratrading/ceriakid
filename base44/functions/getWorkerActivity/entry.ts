import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Returns detailed "what is the background doing right now" info:
// - Last 15 games created (with timestamps & metadata)
// - Background generator settings (enabled/disabled)
// - Hourly game creation breakdown for last 24h
// - Activity bursts (consecutive minutes with creations)
//
// Designed for admin "Live Activity" panel so admin can SEE
// games being created in real-time.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const now = Date.now();
    const settings = await base44.asServiceRole.entities.QCSetting.list();
    const setting = settings[0] || {};

    // ── Library Hub (StudyNote) live activity ──
    const SUBJECT_LABEL = {
      bahasa_melayu: 'BM', english: 'English', mathematics: 'Math', science: 'Sains',
      jawi: 'Jawi', pendidikan_islam: 'P. Islam', pendidikan_moral: 'P. Moral',
      sejarah: 'Sejarah', rbt: 'RBT', pjk: 'PJK', seni: 'Seni',
      '3m_membaca': 'Membaca', '3m_menulis': 'Menulis', '3m_mengira': 'Mengira',
    };
    const recentNotesRaw = await base44.asServiceRole.entities.StudyNote.list('-created_date', 15).catch(() => []);
    const recentNotes = recentNotesRaw.map(n => {
      const ageMin = Math.floor((now - new Date(n.created_date).getTime()) / 60000);
      return {
        id: n.id,
        title: n.title,
        emoji: n.emoji || '📘',
        subject: SUBJECT_LABEL[n.subject] || n.subject,
        level: n.level,
        branches: n.mindMap?.branches?.length || 0,
        ageMin,
      };
    });
    const notesLast5Min = recentNotes.filter(n => n.ageMin < 5).length;
    const notesLast15Min = recentNotes.filter(n => n.ageMin < 15).length;
    const notesLast24h = recentNotesRaw.filter(n => (now - new Date(n.created_date).getTime()) < 86400000).length;

    // Last 15 games created across whole app
    const recentGames = await base44.asServiceRole.entities.Game.list('-created_date', 15);
    const games = recentGames.map(g => {
      const ageMs = now - new Date(g.created_date).getTime();
      const ageMin = Math.floor(ageMs / 60000);
      // Identify "source" — story = backgroundStoryGenerator, else backgroundLaunchGenerator (KSSR)
      const source = g.category === 'story'
        ? 'Story Generator'
        : ['memory_master','logic_puzzles','speed_focus','pattern_genius','maze_adventure','creative_builder','problem_solver','brain_training'].includes(g.category)
          ? 'Mini Games (static)'
          : 'KSSR Generator';
      return {
        id: g.id,
        title: g.title,
        category: g.category,
        ageGroup: g.ageGroup,
        darjah: g.darjah || null,
        difficulty: g.difficulty || 'easy',
        questionsCount: g.gameData?.questions?.length || g.totalQuestions || 0,
        createdAt: g.created_date,
        ageMin,
        source,
      };
    });

    // Get last 100 games for hourly breakdown (24h window)
    const last100 = await base44.asServiceRole.entities.Game.list('-created_date', 100);
    const hourlyBreakdown = Array.from({ length: 24 }, (_, i) => ({ hourAgo: 23 - i, count: 0, kssr: 0, story: 0 }));
    for (const g of last100) {
      const ageMs = now - new Date(g.created_date).getTime();
      const hourIdx = Math.floor(ageMs / (60 * 60 * 1000));
      if (hourIdx < 24) {
        const slot = hourlyBreakdown.find(h => h.hourAgo === hourIdx);
        if (slot) {
          slot.count++;
          if (g.category === 'story') slot.story++;
          else slot.kssr++;
        }
      }
    }

    // Categorize what's happening NOW
    const last5MinGames = games.filter(g => g.ageMin < 5);
    const last15MinGames = games.filter(g => g.ageMin < 15);
    const lastHourGames = games.filter(g => g.ageMin < 60);

    let liveStatus = 'idle';
    if (last5MinGames.length > 0) liveStatus = 'active';
    else if (last15MinGames.length > 0) liveStatus = 'recent';

    // What's the generator likely doing NOW?
    let currentActivity = 'Tidak aktif (idle)';
    if (setting.backgroundLaunchEnabled && setting.backgroundStoryEnabled) {
      currentActivity = '🟢 KSSR (5 min) + Story (10 min) — kedua-dua aktif';
    } else if (setting.backgroundLaunchEnabled) {
      currentActivity = '🟢 KSSR Generator aktif (setiap 5 minit)';
    } else if (setting.backgroundStoryEnabled) {
      currentActivity = '🟢 Story Generator aktif (setiap 10 minit)';
    } else {
      currentActivity = '⚪ Semua background generator OFF';
    }

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      liveStatus,                  // 'active' | 'recent' | 'idle'
      currentActivity,             // Human-readable description
      enabled: {
        kssr: setting.backgroundLaunchEnabled === true,
        story: setting.backgroundStoryEnabled === true,
      },
      library: {
        last5Min: notesLast5Min,
        last15Min: notesLast15Min,
        last24h: notesLast24h,
        recentNotes,
      },
      counts: {
        last5Min: last5MinGames.length,
        last15Min: last15MinGames.length,
        lastHour: lastHourGames.length,
        last24h: last100.filter(g => (now - new Date(g.created_date).getTime()) < 86400000).length,
      },
      recentGames: games,
      hourlyBreakdown,
    });
  } catch (error) {
    console.error('getWorkerActivity error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});