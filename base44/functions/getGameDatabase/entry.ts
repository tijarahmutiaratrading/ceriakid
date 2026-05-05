import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SUBJECTS = [
  { file: 'gameData_prasekolah_bm', label: 'Prasekolah - BM', ageGroup: 'prasekolah', subject: 'bahasa_melayu' },
  { file: 'gameData_prasekolah_en', label: 'Prasekolah - English', ageGroup: 'prasekolah', subject: 'english' },
  { file: 'gameData_prasekolah_math', label: 'Prasekolah - Math', ageGroup: 'prasekolah', subject: 'mathematics' },
  { file: 'gameData_prasekolah_science', label: 'Prasekolah - Science', ageGroup: 'prasekolah', subject: 'science' },
  { file: 'gameData_prasekolah_tamil', label: 'Prasekolah - Tamil', ageGroup: 'prasekolah', subject: 'bahasa_tamil' },
  { file: 'gameData_prasekolah_mandarin', label: 'Prasekolah - Mandarin', ageGroup: 'prasekolah', subject: 'bahasa_mandarin' },
  { file: 'gameData_sr_bm', label: 'Sekolah Rendah - BM', ageGroup: 'sekolah_rendah', subject: 'bahasa_melayu' },
  { file: 'gameData_sr_jawi', label: 'Sekolah Rendah - Jawi', ageGroup: 'sekolah_rendah', subject: 'jawi' },
  { file: 'gameData_sr_english', label: 'Sekolah Rendah - English', ageGroup: 'sekolah_rendah', subject: 'english' },
  { file: 'gameData_sr_math', label: 'Sekolah Rendah - Math', ageGroup: 'sekolah_rendah', subject: 'mathematics' },
  { file: 'gameData_sr_science', label: 'Sekolah Rendah - Science', ageGroup: 'sekolah_rendah', subject: 'science' },
  { file: 'gameData_sr_tamil', label: 'Sekolah Rendah - Tamil', ageGroup: 'sekolah_rendah', subject: 'bahasa_tamil' },
  { file: 'gameData_sr_mandarin', label: 'Sekolah Rendah - Mandarin', ageGroup: 'sekolah_rendah', subject: 'bahasa_mandarin' },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all play progress records
    const allProgress = await base44.asServiceRole.entities.ChildGameProgress.list();

    // Group by ageGroup-subject-index
    const playMap = {}; // key -> Set of emails
    const scoreMap = {}; // key -> array of scores
    for (const p of allProgress) {
      const key = p.gameType; // e.g. "prasekolah-science-0"
      if (!playMap[key]) playMap[key] = new Set();
      if (!scoreMap[key]) scoreMap[key] = [];
      playMap[key].add(p.userEmail);
      if (p.lastScore != null && p.lastTotal != null && p.lastTotal > 0) {
        scoreMap[key].push(Math.round((p.lastScore / p.lastTotal) * 100));
      }
    }

    const allGames = await base44.asServiceRole.entities.Game.list('-created_date', 1000);

    const result = SUBJECTS.map(({ file, label, ageGroup, subject }) => {
      const subjectGames = allGames
        .filter(g => g.ageGroup === ageGroup && g.category === subject && g.isPublished !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      const games = subjectGames.map((game, index) => {
        const key = `${ageGroup}-${subject}-${index}`;
        const players = playMap[key] ? playMap[key].size : 0;
        const scores = scoreMap[key] || [];
        const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
        const questionCount = Array.isArray(game.gameData?.questions) ? game.gameData.questions.length : (game.totalQuestions || 0);
        return { index, id: game.id, title: game.title, type: game.type, players, avgScore, timesPlayed: scores.length, questionCount };
      });

      const totalPlayers = games.reduce((a, g) => a + g.players, 0);
      const totalPlays = games.reduce((a, g) => a + g.timesPlayed, 0);

      return { file, label, ageGroup, subject, totalGames: games.length, totalPlayers, totalPlays, games };
    });

    const gameHub = [
      { id: 'memory', title: 'Memory Game' },
      { id: 'dragdrop', title: 'Drag & Drop' },
      { id: 'wordbuilder', title: 'Word Builder' },
      { id: 'sorting', title: 'Sorting Game' },
      { id: 'tilematch', title: 'Tile Match' },
      { id: 'story', title: 'Story Adventure' },
      { id: 'physics', title: 'Physics Game' },
      { id: 'tracing', title: 'Tracing Game' },
    ];

    // Hub play stats
    const hubStats = {};
    for (const p of allProgress) {
      if (p.category === 'hub') {
        if (!hubStats[p.gameType]) hubStats[p.gameType] = new Set();
        hubStats[p.gameType].add(p.userEmail);
      }
    }

    return Response.json({
      success: true,
      subjects: result,
      gameHub: gameHub.map(g => ({ ...g, players: hubStats[g.id] ? hubStats[g.id].size : 0 })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});