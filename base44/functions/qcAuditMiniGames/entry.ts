import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// QC audit for mini games — delete broken games and queue replacements.
// Triggers for ALL 8 mini game categories (memory_master ... brain_training).

const MINI_CATEGORIES = {
  memory_master: { title: 'Memory Master', modes: ['memory', 'hidden_object', 'sequence'] },
  logic_puzzles: { title: 'Logic Puzzles', modes: ['sorting', 'tilematch', 'dragdrop'] },
  speed_focus: { title: 'Speed Focus', modes: ['falling_catch', 'balloon_pop', 'swipe_select'] },
  pattern_genius: { title: 'Pattern Genius', modes: ['sequence', 'connect_dots', 'tilematch'] },
  maze_adventure: { title: 'Maze Adventure', modes: ['maze', 'hidden_object', 'story'] },
  creative_builder: { title: 'Creative Builder', modes: ['coloring', 'stacking', 'dragdrop'] },
  problem_solver: { title: 'Problem Solver', modes: ['true_false', 'mini_simulation', 'physics'] },
  brain_training: { title: 'Brain Training', modes: ['memory', 'swipe_select', 'spin_wheel'] },
};

// Modes yang dah dilarang (user buang)
const BANNED_MODES = new Set(['reaction_speed', 'rhythm_tap']);

function norm(s) {
  return String(s || '').replace(/\s+/g, '').toLowerCase();
}

// Check if a round has valid playable data based on its mode
function isRoundValid(mode, round) {
  if (!round || typeof round !== 'object') return false;
  const r = round;

  switch (mode) {
    case 'memory': {
      if (!Array.isArray(r.pairs) || r.pairs.length < 2) return false;
      return r.pairs.every(p => Array.isArray(p) && p.length === 2 && p[0] && p[1]);
    }
    case 'dragdrop': {
      return Array.isArray(r.items) && Array.isArray(r.targets) && r.items.length >= 2 && r.targets.length >= 2;
    }
    case 'wordbuilder': {
      return Array.isArray(r.words) && r.words.length >= 1 && Array.isArray(r.letters) && r.letters.length >= 2;
    }
    case 'sorting':
    case 'swipe_select':
    case 'mini_simulation': {
      if (!Array.isArray(r.items) || r.items.length < 2) return false;
      const valid = r.items.every(it => it?.text && it?.group);
      if (!valid) return false;
      if (mode === 'sorting' && (!Array.isArray(r.groups) || r.groups.length < 2)) return false;
      if (mode === 'mini_simulation') {
        if (!r.target) return false;
        const hasMatch = r.items.some(it => norm(it.group) === norm(r.target));
        if (!hasMatch) return false;
      }
      return true;
    }
    case 'tilematch': {
      return Array.isArray(r.tiles) && r.tiles.length >= 4 && r.tiles.length % 2 === 0;
    }
    case 'story': {
      if (!Array.isArray(r.scenes) || r.scenes.length < 1) return false;
      return r.scenes.every(s => s?.text && Array.isArray(s.choices) && s.choices.length >= 2);
    }
    case 'physics': {
      if (!Array.isArray(r.challenges) || r.challenges.length < 1) return false;
      return r.challenges.every(c =>
        c?.question &&
        Array.isArray(c.options) && c.options.length === 4 &&
        Number.isInteger(c.answer) && c.answer >= 0 && c.answer <= 3
      );
    }
    case 'true_false': {
      if (!Array.isArray(r.statements) || r.statements.length < 1) return false;
      return r.statements.every(s => s?.text && typeof s.answer === 'boolean');
    }
    case 'tracing': {
      return Array.isArray(r.letters) && r.letters.length >= 1;
    }
    case 'balloon_pop':
    case 'falling_catch': {
      if (!r.target || !Array.isArray(r.items) || r.items.length < 3) return false;
      const targetCount = r.items.filter(it => norm(typeof it === 'object' ? (it.text || it.label || it.value) : it) === norm(r.target)).length;
      return targetCount >= 1;
    }
    case 'stacking': {
      return Number.isFinite(Number(r.target)) && Number(r.target) >= 3 && Number(r.target) <= 12;
    }
    case 'sequence': {
      if (!Array.isArray(r.items) || r.items.length < 2) return false;
      if (!Array.isArray(r.answer) || r.answer.length < 2) return false;
      // Answer must reference items
      return r.answer.every(a => r.items.includes(a));
    }
    case 'spin_wheel': {
      return r.target && Array.isArray(r.items) && r.items.length >= 2;
    }
    case 'picture_hunt':
    case 'hidden_object': {
      if (!r.target || !Array.isArray(r.items) || r.items.length < 3) return false;
      const valid = r.items.every(it => it?.text && it?.value);
      if (!valid) return false;
      return r.items.some(it => norm(it.value) === norm(r.target));
    }
    case 'typing_challenge': {
      return r.target && String(r.target).length >= 2;
    }
    case 'connect_dots':
    case 'coloring': {
      return Array.isArray(r.items) && r.items.length >= 3;
    }
    case 'maze': {
      return !!r.label;
    }
    default:
      // Unknown mode — fail
      return false;
  }
}

function auditGame(game) {
  const issues = [];
  const data = game?.gameData || {};
  const mode = data.mode;

  if (!mode) { issues.push('No mode'); return { valid: false, issues }; }
  if (BANNED_MODES.has(mode)) { issues.push(`Banned mode: ${mode}`); return { valid: false, issues }; }

  // Title must be reasonable length (not absurdly bloated/recursive)
  const title = String(game.title || '');
  if (title.length > 180) issues.push('Title too long (recursive/bloated)');
  if (/siri\s+\d+.*siri\s+\d+/i.test(title)) issues.push('Recursive title pattern');

  // microTopic should not be recursive either
  if (String(data.microTopic || '').length > 220) issues.push('microTopic too long');

  // Rounds must exist and be playable
  if (!Array.isArray(data.rounds) || data.rounds.length === 0) {
    issues.push('No rounds');
    return { valid: false, issues };
  }

  // Each round must have valid playable data
  const invalidRounds = data.rounds.filter(r => !isRoundValid(mode, r));
  if (invalidRounds.length > 0) {
    issues.push(`${invalidRounds.length}/${data.rounds.length} rounds invalid (label only / mismatched data)`);
  }

  // Require at least 70% rounds valid
  const validCount = data.rounds.length - invalidRounds.length;
  if (validCount / data.rounds.length < 0.7) {
    return { valid: false, issues };
  }

  return { valid: true, issues };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const allGames = [];
    for (const cat of Object.keys(MINI_CATEGORIES)) {
      const games = await base44.asServiceRole.entities.Game.filter({ category: cat });
      allGames.push(...games);
    }

    const failed = [];
    const passed = [];
    const issuesByCategory = {};

    for (const game of allGames) {
      const { valid, issues } = auditGame(game);
      if (!valid) {
        failed.push({ id: game.id, title: game.title, category: game.category, mode: game.gameData?.mode, issues });
        if (!issuesByCategory[game.category]) issuesByCategory[game.category] = 0;
        issuesByCategory[game.category]++;
      } else {
        passed.push(game.id);
      }
    }

    // Delete failed games
    let deleted = 0;
    for (const f of failed) {
      try {
        await base44.asServiceRole.entities.Game.delete(f.id);
        deleted++;
      } catch (err) {
        console.error(`Failed to delete ${f.id}: ${err.message}`);
      }
    }

    // Queue replacement tasks per category
    const tasksCreated = [];
    for (const [cat, count] of Object.entries(issuesByCategory)) {
      if (count <= 0) continue;
      const meta = MINI_CATEGORIES[cat];
      const task = await base44.asServiceRole.entities.GameTask.create({
        taskName: `${meta.title} · QC Replacement ${count} Games`,
        ageGroup: 'prasekolah',
        subject: cat,
        gamesCount: count,
        questionsPerGame: 10,
        status: 'pending',
        createdGames: 0,
        errorMessage: JSON.stringify({
          levels: 3,
          itemsPerSet: 10,
          theme: `${meta.title} · Replacement berkualiti tinggi selepas QC audit.`,
          modes: meta.modes,
        }),
      });
      tasksCreated.push({ category: cat, count, taskId: task.id });
    }

    // Log QC run
    await base44.asServiceRole.entities.QCLog.create({
      runAt: new Date().toISOString(),
      action: 'repair',
      status: deleted > 0 ? 'failed_content_removed' : 'all_clean',
      score: Math.round((passed.length / Math.max(1, allGames.length)) * 100),
      total: allGames.length,
      passed: passed.length,
      failed: failed.length,
      deletedCount: deleted,
      replacementTasks: tasksCreated.length,
      message: `Mini games QC: ${deleted} games merapu dipadam, ${tasksCreated.length} replacement tasks queued.`,
      sampleIssues: failed.slice(0, 10).map(f => ({
        title: f.title?.slice(0, 80),
        category: f.category,
        issues: f.issues,
      })),
    });

    return Response.json({
      success: true,
      total: allGames.length,
      passed: passed.length,
      failed: failed.length,
      deleted,
      replacementTasks: tasksCreated,
      issuesByCategory,
      sampleFailed: failed.slice(0, 15),
    });
  } catch (error) {
    console.error('qcAuditMiniGames error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});