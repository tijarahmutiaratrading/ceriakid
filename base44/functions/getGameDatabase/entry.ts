import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const subjectFiles = [
      { file: 'gameData_prasekolah_bm', label: 'Prasekolah - BM', ageGroup: 'prasekolah', subject: 'bahasa_melayu' },
      { file: 'gameData_prasekolah_en', label: 'Prasekolah - English', ageGroup: 'prasekolah', subject: 'english' },
      { file: 'gameData_prasekolah_math', label: 'Prasekolah - Math', ageGroup: 'prasekolah', subject: 'mathematics' },
      { file: 'gameData_prasekolah_science', label: 'Prasekolah - Science', ageGroup: 'prasekolah', subject: 'science' },
      { file: 'gameData_sr_bm', label: 'Sekolah Rendah - BM', ageGroup: 'sekolah_rendah', subject: 'bahasa_melayu' },
      { file: 'gameData_sr_english', label: 'Sekolah Rendah - English', ageGroup: 'sekolah_rendah', subject: 'english' },
      { file: 'gameData_sr_math', label: 'Sekolah Rendah - Math', ageGroup: 'sekolah_rendah', subject: 'mathematics' },
      { file: 'gameData_sr_science', label: 'Sekolah Rendah - Science', ageGroup: 'sekolah_rendah', subject: 'science' },
    ];

    const result = [];

    for (const { file, label, ageGroup, subject } of subjectFiles) {
      try {
        const module = await import(`../lib/${file}.js`);
        const games = module[Object.keys(module)[0]];
        if (!games || games.length === 0) continue;

        result.push({
          file,
          label,
          ageGroup,
          subject,
          totalGames: games.length,
          games: games.map((g, idx) => ({
            index: idx,
            title: g.title || `Game ${idx + 1}`,
            type: g.type || 'unknown',
            difficulty: g.difficulty || 'easy',
            questionCount: g.gameData?.questions?.length || 0,
            totalQuestions: g.totalQuestions || 0,
            isPublished: g.isPublished !== false,
          })),
        });
      } catch (err) {
        // skip missing files
      }
    }

    // Game Hub
    const gameHub = [
      { id: 'memory', title: 'Memory Game', path: '/games/memory' },
      { id: 'dragdrop', title: 'Drag Drop Game', path: '/games/dragdrop' },
      { id: 'wordbuilder', title: 'Word Builder', path: '/games/wordbuilder' },
      { id: 'sorting', title: 'Sorting Game', path: '/games/sorting' },
      { id: 'tilematch', title: 'Tile Match', path: '/games/tilematch' },
      { id: 'story', title: 'Story Adventure', path: '/games/story' },
      { id: 'physics', title: 'Physics Game', path: '/games/physics' },
      { id: 'tracing', title: 'Tracing Game', path: '/games/tracing' },
    ];

    return Response.json({ success: true, subjects: result, gameHub });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});