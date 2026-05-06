import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const DARJAH_LEVELS = ['darjah_1', 'darjah_2', 'darjah_3', 'darjah_4', 'darjah_5', 'darjah_6'];

function inferDarjah(game, index) {
  const text = `${game.title || ''} ${game.description || ''} ${JSON.stringify(game.gameData || {})}`.toLowerCase();

  for (let i = 1; i <= 6; i++) {
    const patterns = [
      new RegExp(`darjah\\s*${i}`, 'i'),
      new RegExp(`tahun\\s*${i}`, 'i'),
      new RegExp(`year\\s*${i}`, 'i'),
      new RegExp(`grade\\s*${i}`, 'i'),
    ];
    if (patterns.some((pattern) => pattern.test(text))) return `darjah_${i}`;
  }

  // Existing untagged games are broad mixed SR content; use even distribution only if explicitly requested.
  return null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { apply = false, distributeUntagged = false } = await req.json();
    const games = await base44.asServiceRole.entities.Game.filter({ ageGroup: 'sekolah_rendah' });
    const subjectGames = games.filter(g => !['memory', 'dragdrop', 'wordbuilder', 'sorting', 'tilematch', 'story', 'physics', 'tracing'].includes(g.category));

    const summary = {
      totalSekolahRendahSubjectGames: subjectGames.length,
      alreadyTagged: 0,
      inferable: 0,
      notInferable: 0,
      applied: 0,
      byDarjah: {},
      samplesNotInferable: [],
    };

    for (const level of DARJAH_LEVELS) summary.byDarjah[level] = 0;

    const grouped = {};
    for (const game of subjectGames) {
      const key = game.category || 'unknown';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(game);
    }

    for (const [category, list] of Object.entries(grouped)) {
      list.sort((a, b) => (a.order || 0) - (b.order || 0));
      for (let i = 0; i < list.length; i++) {
        const game = list[i];
        if (game.darjah) {
          summary.alreadyTagged++;
          summary.byDarjah[game.darjah] = (summary.byDarjah[game.darjah] || 0) + 1;
          continue;
        }

        let inferred = inferDarjah(game, i);
        if (!inferred && distributeUntagged) inferred = DARJAH_LEVELS[i % DARJAH_LEVELS.length];

        if (inferred) {
          summary.inferable++;
          summary.byDarjah[inferred] = (summary.byDarjah[inferred] || 0) + 1;
          if (apply) {
            await base44.asServiceRole.entities.Game.update(game.id, { darjah: inferred });
            summary.applied++;
          }
        } else {
          summary.notInferable++;
          if (summary.samplesNotInferable.length < 12) {
            summary.samplesNotInferable.push({ id: game.id, title: game.title, category });
          }
        }
      }
    }

    return Response.json({
      success: true,
      apply,
      distributeUntagged,
      summary,
      recommendation: summary.notInferable > 0
        ? 'Game sedia ada nampak broad/mixed dan tidak cukup bukti untuk asing Darjah dengan tepat. Lebih selamat delete dan generate baru ikut Darjah.'
        : 'Semua game boleh dipetakan atau sudah ada tag Darjah.',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});