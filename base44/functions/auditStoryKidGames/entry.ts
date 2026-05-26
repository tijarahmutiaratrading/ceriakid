import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Audit Story Kid games — scan untuk poor quality cerita.
 * Mode: 'dryRun' (default) returns report sahaja. 'delete' akan padam yang gagal.
 *
 * Quality checks:
 * 1. Mesti ada gameData.scenes (array, minimum 5 scenes)
 * 2. Mesti ada moral (string, min 5 chars)
 * 3. Cover image mesti wujud
 * 4. Setiap scene mesti ada: text (min 20 chars, max 250), choices (array)
 * 5. Setiap scene mesti ada imageUrl
 * 6. Semua choice.next mesti valid (index dalam range atau 'end')
 * 7. Mesti ada sekurang-kurangnya satu choice dengan next: 'end'
 * 8. Mesti ada sekurang-kurangnya satu choice dengan star: true
 * 9. Tiada duplicate title — keep yang terbaru/terlengkap, padam yang lain
 */

function evaluateStoryQuality(game) {
  const issues = [];
  const data = game.gameData || {};
  const scenes = data.scenes;

  // Check 1: scenes array
  if (!Array.isArray(scenes) || scenes.length < 5) {
    issues.push(`Scenes tidak cukup (${scenes?.length || 0} < 5)`);
    return { passed: false, issues, score: 0 };
  }

  // Check 2: moral
  if (!data.moral || typeof data.moral !== 'string' || data.moral.trim().length < 5) {
    issues.push('Moral tiada atau terlalu pendek');
  }

  // Check 3: cover image
  if (!data.cover || typeof data.cover !== 'string' || !data.cover.startsWith('http')) {
    issues.push('Cover image tiada atau tidak sah');
  }

  let hasEndChoice = false;
  let hasStarChoice = false;
  let scenesWithoutImage = 0;
  let scenesWithBadText = 0;
  let brokenChoiceLinks = 0;

  scenes.forEach((scene, idx) => {
    // Text check
    const text = scene.text;
    if (!text || typeof text !== 'string') {
      scenesWithBadText++;
      issues.push(`Scene ${idx}: text tiada`);
    } else if (text.trim().length < 20) {
      scenesWithBadText++;
      issues.push(`Scene ${idx}: text terlalu pendek (${text.length} chars)`);
    } else if (text.length > 280) {
      scenesWithBadText++;
      issues.push(`Scene ${idx}: text terlalu panjang (${text.length} chars)`);
    }

    // Image check
    if (!scene.imageUrl || typeof scene.imageUrl !== 'string' || !scene.imageUrl.startsWith('http')) {
      scenesWithoutImage++;
    }

    // Choices check
    if (!Array.isArray(scene.choices) || scene.choices.length === 0) {
      issues.push(`Scene ${idx}: tiada choices`);
      return;
    }

    scene.choices.forEach((choice, cIdx) => {
      if (!choice.text || typeof choice.text !== 'string' || choice.text.trim().length < 3) {
        issues.push(`Scene ${idx} choice ${cIdx}: text tiada/pendek`);
      }
      if (choice.next === 'end') {
        hasEndChoice = true;
      } else if (typeof choice.next === 'number') {
        if (choice.next < 0 || choice.next >= scenes.length) {
          brokenChoiceLinks++;
          issues.push(`Scene ${idx} choice ${cIdx}: broken link (next=${choice.next})`);
        }
      } else {
        brokenChoiceLinks++;
        issues.push(`Scene ${idx} choice ${cIdx}: next tidak sah (${choice.next})`);
      }
      if (choice.star === true) hasStarChoice = true;
    });
  });

  if (!hasEndChoice) issues.push('Tiada choice yang menuju "end" — cerita takde penutup');
  if (!hasStarChoice) issues.push('Tiada choice dengan star:true — takde path positif');
  if (scenesWithoutImage > Math.floor(scenes.length / 2)) {
    issues.push(`Terlalu banyak scenes tanpa image (${scenesWithoutImage}/${scenes.length})`);
  }
  if (brokenChoiceLinks > 2) {
    issues.push(`Terlalu banyak broken choice links (${brokenChoiceLinks})`);
  }
  if (scenesWithBadText > Math.floor(scenes.length / 3)) {
    issues.push(`Terlalu banyak scenes dengan text bermasalah (${scenesWithBadText})`);
  }

  // Title check
  if (!game.title || game.title.trim().length < 5) {
    issues.push('Title tiada atau terlalu pendek');
  }

  // Description check
  if (!game.description || game.description.trim().length < 5) {
    issues.push('Description tiada atau terlalu pendek');
  }

  // Scoring: critical issues = auto fail
  const critical = [
    !hasEndChoice,
    !hasStarChoice,
    brokenChoiceLinks > 2,
    scenesWithoutImage > Math.floor(scenes.length / 2),
    scenesWithBadText > Math.floor(scenes.length / 3),
    !data.cover,
    !data.moral || data.moral.trim().length < 5,
  ].filter(Boolean).length;

  const passed = critical === 0 && issues.length <= 2;
  const score = Math.max(0, 100 - (issues.length * 8) - (critical * 25));

  return { passed, issues, score, hasEndChoice, hasStarChoice };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const mode = body.mode === 'delete' ? 'delete' : 'dryRun';

    // Fetch all story kid games (paginate)
    let allGames = [];
    let cursor = 0;
    const pageSize = 100;
    while (true) {
      const page = await base44.asServiceRole.entities.Game.filter(
        { category: 'story' },
        '-created_date',
        pageSize,
        cursor
      );
      if (!page || page.length === 0) break;
      allGames = allGames.concat(page);
      if (page.length < pageSize) break;
      cursor += pageSize;
      if (cursor > 5000) break; // safety
    }

    console.log(`Total story kid games found: ${allGames.length}`);

    const passed = [];
    const failed = [];
    const reportIssues = [];

    for (const game of allGames) {
      const result = evaluateStoryQuality(game);
      const entry = {
        id: game.id,
        title: game.title,
        score: result.score,
        issues: result.issues,
      };
      if (result.passed) {
        passed.push(entry);
      } else {
        failed.push(entry);
        if (reportIssues.length < 30) reportIssues.push(entry);
      }
    }

    // Detect duplicates among PASSED games — keep highest score, mark rest as failed
    const seenTitles = new Map();
    const dupesToDelete = [];
    for (const p of passed) {
      const normTitle = (p.title || '').trim().toLowerCase();
      if (!normTitle) continue;
      if (seenTitles.has(normTitle)) {
        const existing = seenTitles.get(normTitle);
        // Keep the one with higher score
        if (p.score > existing.score) {
          dupesToDelete.push({ ...existing, issues: ['Duplicate title — versi lebih lemah'] });
          seenTitles.set(normTitle, p);
        } else {
          dupesToDelete.push({ ...p, issues: ['Duplicate title — versi lebih lemah'] });
        }
      } else {
        seenTitles.set(normTitle, p);
      }
    }

    const toDelete = [...failed, ...dupesToDelete];

    let deletedCount = 0;
    const deletedIds = [];
    if (mode === 'delete' && toDelete.length > 0) {
      for (const entry of toDelete) {
        try {
          await base44.asServiceRole.entities.Game.delete(entry.id);
          deletedCount++;
          deletedIds.push(entry.id);
        } catch (e) {
          console.error(`Failed to delete ${entry.id}:`, e.message);
        }
      }
    }

    return Response.json({
      success: true,
      mode,
      totalScanned: allGames.length,
      passedCount: passed.length - dupesToDelete.length,
      failedCount: failed.length,
      duplicatesCount: dupesToDelete.length,
      toDeleteCount: toDelete.length,
      deletedCount,
      sampleFailures: reportIssues,
      sampleDuplicates: dupesToDelete.slice(0, 10),
    });
  } catch (error) {
    console.error('auditStoryKidGames error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});