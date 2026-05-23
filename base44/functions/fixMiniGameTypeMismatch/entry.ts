import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Auto-fix mini games yang ada type vs mode mismatch.
// Sebab: kalau Game.type tak match dengan gameData.mode, renderer pilih jawapan-checker yang salah
// → user tekan jawapan betul, sistem cakap salah.
// Fix: tukar Game.type supaya match dengan mode sebenar dalam gameData.

// Mode → canonical type yang renderer faham
const MODE_TO_TYPE = {
  memory: 'memory_game',
  spin_wheel: 'memory_game',
  swipe_select: 'memory_game',
  dragdrop: 'drag_drop',
  coloring: 'drag_drop',
  maze: 'story_adventure',
  hidden_object: 'story_adventure',
  story: 'story_adventure',
  true_false: 'multiple_choice',
  falling_catch: 'picture_quiz',
  balloon_pop: 'picture_quiz',
  sequence: 'pattern_fill',
  stacking: 'physics',
  typing_challenge: 'word_builder',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const games = await base44.asServiceRole.entities.Game.list('-created_date', 1500);
    let fixed = 0;
    let skipped = 0;
    const samples = [];

    for (const game of games) {
      const mode = game.gameData?.mode;
      if (!mode) { skipped++; continue; }
      const expectedType = MODE_TO_TYPE[mode];
      if (!expectedType) { skipped++; continue; }
      if (game.type === expectedType) { skipped++; continue; }

      await base44.asServiceRole.entities.Game.update(game.id, { type: expectedType });
      fixed++;
      if (samples.length < 10) {
        samples.push({ title: game.title, oldType: game.type, newType: expectedType, mode });
      }
    }

    return Response.json({
      success: true,
      totalScanned: games.length,
      fixed,
      skipped,
      samples,
      message: `Fixed ${fixed} mini games (type ↔ mode match). Renderer akan baca yang betul sekarang.`,
    });
  } catch (error) {
    console.error('fixMiniGameTypeMismatch error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});