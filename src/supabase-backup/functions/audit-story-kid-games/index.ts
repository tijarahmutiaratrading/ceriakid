// Audit Story Kid games for quality issues + duplicate detection
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { requireAdmin } from '../_shared/authGuards.ts';

function evaluate(game: any) {
  const issues: string[] = [];
  const data = game.game_data || {};
  const scenes = data.scenes;

  if (!Array.isArray(scenes) || scenes.length < 5) {
    issues.push(`Scenes kurang (${scenes?.length || 0} < 5)`);
    return { passed: false, issues, score: 0 };
  }
  if (!data.moral || typeof data.moral !== 'string' || data.moral.trim().length < 5) issues.push('Moral tiada');
  if (!data.cover || typeof data.cover !== 'string' || !data.cover.startsWith('http')) issues.push('Cover tiada');

  let hasEnd = false, hasStar = false, noImg = 0, badText = 0, broken = 0;

  scenes.forEach((s: any, idx: number) => {
    const text = s.text;
    if (!text || typeof text !== 'string') { badText++; issues.push(`Scene ${idx}: text tiada`); }
    else if (text.trim().length < 20) { badText++; issues.push(`Scene ${idx}: text pendek`); }
    else if (text.length > 280) { badText++; issues.push(`Scene ${idx}: text panjang`); }

    if (!s.imageUrl || !s.imageUrl.startsWith('http')) noImg++;

    if (!Array.isArray(s.choices) || s.choices.length === 0) {
      issues.push(`Scene ${idx}: tiada choices`);
      return;
    }

    s.choices.forEach((c: any, ci: number) => {
      if (!c.text || c.text.trim().length < 3) issues.push(`Scene ${idx} choice ${ci}: text pendek`);
      if (c.next === 'end') hasEnd = true;
      else if (typeof c.next === 'number') {
        if (c.next < 0 || c.next >= scenes.length) { broken++; issues.push(`Scene ${idx} choice ${ci}: broken next=${c.next}`); }
      } else { broken++; }
      if (c.star === true) hasStar = true;
    });
  });

  if (!hasEnd) issues.push('Tiada end choice');
  if (!hasStar) issues.push('Tiada star choice');
  if (noImg > Math.floor(scenes.length / 2)) issues.push(`${noImg}/${scenes.length} scenes tiada image`);
  if (broken > 2) issues.push(`${broken} broken links`);
  if (badText > Math.floor(scenes.length / 3)) issues.push(`${badText} scenes text bermasalah`);
  if (!game.title || game.title.trim().length < 5) issues.push('Title pendek');
  if (!game.description || game.description.trim().length < 5) issues.push('Description pendek');

  const critical = [!hasEnd, !hasStar, broken > 2, noImg > Math.floor(scenes.length / 2),
                    badText > Math.floor(scenes.length / 3), !data.cover, !data.moral].filter(Boolean).length;
  const passed = critical === 0 && issues.length <= 2;
  const score = Math.max(0, 100 - (issues.length * 8) - (critical * 25));

  return { passed, issues, score };
}

Deno.serve(async (req) => {
  const cors = handleCors(req); if (cors) return cors;
  const guard = await requireAdmin(req);
  if (guard instanceof Response) return guard;

  try {
    const body = await req.json().catch(() => ({}));
    const mode = body.mode === 'delete' ? 'delete' : 'dryRun';

    const { data: allGames } = await supabaseAdmin
      .from('ck_games')
      .select('*')
      .eq('category', 'story')
      .order('created_at', { ascending: false })
      .limit(5000);

    const passed: any[] = [], failed: any[] = [], reportIssues: any[] = [];

    for (const game of allGames || []) {
      const result = evaluate(game);
      const entry = { id: game.id, title: game.title, score: result.score, issues: result.issues };
      if (result.passed) passed.push(entry);
      else {
        failed.push(entry);
        if (reportIssues.length < 30) reportIssues.push(entry);
      }
    }

    // Dedupe by title — keep higher score
    const seen = new Map();
    const dupes: any[] = [];
    for (const p of passed) {
      const t = (p.title || '').trim().toLowerCase();
      if (!t) continue;
      if (seen.has(t)) {
        const ex = seen.get(t);
        if (p.score > ex.score) { dupes.push({ ...ex, issues: ['Duplicate title'] }); seen.set(t, p); }
        else dupes.push({ ...p, issues: ['Duplicate title'] });
      } else seen.set(t, p);
    }

    const toDelete = [...failed, ...dupes];
    let deletedCount = 0;
    if (mode === 'delete' && toDelete.length > 0) {
      for (const e of toDelete) {
        try { await supabaseAdmin.from('ck_games').delete().eq('id', e.id); deletedCount++; }
        catch (err) { console.error('Delete failed:', err); }
      }
    }

    return jsonResponse({
      success: true, mode,
      totalScanned: allGames?.length || 0,
      passedCount: passed.length - dupes.length,
      failedCount: failed.length, duplicatesCount: dupes.length,
      toDeleteCount: toDelete.length, deletedCount,
      sampleFailures: reportIssues, sampleDuplicates: dupes.slice(0, 10),
    });
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});