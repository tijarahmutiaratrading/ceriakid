import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SUBJECTS = [
  { file: 'gameData_prasekolah_bm', label: 'Prasekolah - BM', ageGroup: 'prasekolah', subject: 'bahasa_melayu', category: 'bahasa_melayu' },
  { file: 'gameData_prasekolah_en', label: 'Prasekolah - English', ageGroup: 'prasekolah', subject: 'english', category: 'english' },
  { file: 'gameData_prasekolah_math', label: 'Prasekolah - Math', ageGroup: 'prasekolah', subject: 'mathematics', category: 'mathematics' },
  { file: 'gameData_prasekolah_science', label: 'Prasekolah - Science', ageGroup: 'prasekolah', subject: 'science', category: 'science' },
  { file: 'gameData_sr_bm', label: 'Sekolah Rendah - BM', ageGroup: 'sekolah_rendah', subject: 'bahasa_melayu', category: 'bahasa_melayu' },
  { file: 'gameData_sr_english', label: 'Sekolah Rendah - English', ageGroup: 'sekolah_rendah', subject: 'english', category: 'english' },
  { file: 'gameData_sr_math', label: 'Sekolah Rendah - Math', ageGroup: 'sekolah_rendah', subject: 'mathematics', category: 'mathematics' },
  { file: 'gameData_sr_science', label: 'Sekolah Rendah - Science', ageGroup: 'sekolah_rendah', subject: 'science', category: 'science' },
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

    // Find max index per subject to know how many games exist
    const indexMap = {}; // "ageGroup-subject" -> max index
    for (const p of allProgress) {
      const parts = p.gameType?.split('-');
      if (!parts || parts.length < 3) continue;
      // gameType format: ageGroup-subject-index  but ageGroup can be "sekolah_rendah"
      // last part is index, rest is "ageGroup-subject"
      const idx = parseInt(parts[parts.length - 1]);
      const subjectKey = parts.slice(0, -1).join('-');
      if (!isNaN(idx)) {
        indexMap[subjectKey] = Math.max(indexMap[subjectKey] || 0, idx);
      }
    }

    const result = SUBJECTS.map(({ file, label, ageGroup, subject }) => {
      const subjectKey = `${ageGroup}-${subject}`;
      const maxIndex = indexMap[subjectKey] ?? -1;
      const totalGames = maxIndex + 1;

      const games = [];
      for (let i = 0; i <= maxIndex; i++) {
        const key = `${subjectKey}-${i}`;
        const players = playMap[key] ? playMap[key].size : 0;
        const scores = scoreMap[key] || [];
        const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
        games.push({ index: i, players, avgScore, timesPlayed: scores.length });
      }

      const totalPlayers = games.reduce((a, g) => a + g.players, 0);
      const totalPlays = games.reduce((a, g) => a + g.timesPlayed, 0);

      return { file, label, ageGroup, subject, totalGames, totalPlayers, totalPlays, games };
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