import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SUBJECTS = ['bahasa_melayu', 'english', 'mathematics', 'science', 'jawi', 'bahasa_tamil', 'bahasa_mandarin'];
const DARJAH_LEVELS = ['darjah_1', 'darjah_2', 'darjah_3', 'darjah_4', 'darjah_5', 'darjah_6'];
const MINI_CATEGORIES = ['memory_master', 'logic_puzzles', 'speed_focus', 'pattern_genius', 'maze_adventure', 'creative_builder', 'problem_solver', 'brain_training', 'memory', 'dragdrop', 'wordbuilder', 'sorting', 'tilematch', 'story', 'physics', 'tracing'];
const MIN_PASS_SCORE = 90;
const MAX_DELETE_PER_RUN = 20;
const MAX_AUTOFIX_PER_RUN = 15;
const MIN_GAMES_PER_BUCKET = 4;
const STUCK_TASK_MINUTES = 30;

const BANNED_PATTERN = /(hewan|singh|bekam|\blama\b|\bbabi\b|turtle|kodok|kelinci|\bpohon\b|\bsepatu\b|strawberi|tampak|cantik|santai|membazir|merata-rata|daki|moo|woof|roar|rindu|semangat ketua|bintang di badannya|rongga hidung|terpanjang di dunia|jangan lupa|dua jenis rupa|haiwan apa|apakah nama haiwan ini|sering dibela|dua telinga panjang dan sangat comel|badan kecil dan suka berlari-lari|boleh terbang di taman|berbulu yang sering dipelihara|soalan\s*\d+|placeholder|contoh jawapan|lihat gambar|gambar di bawah|copy|salinan|umum sahaja|aktiviti pembelajaran)/i;
const MAX_MATH_NUMBER = { darjah_1: 100, darjah_2: 1000, darjah_3: 10000, darjah_4: 100000, darjah_5: 1000000, darjah_6: 10000000 };

// Issues that can be safely repaired by re-generating just the bad question via LLM
const REPAIRABLE_QUESTION_ISSUES = new Set(['weak_question', 'banned_text', 'bad_options_count', 'bad_answer_index', 'duplicate_options', 'repeat_inside_game']);
// Issues that affect the whole game (require replacement, not per-question fix)
const STRUCTURAL_ISSUES = new Set(['missing_darjah', 'too_few_questions', 'repeat_across_darjah', 'math_level_too_high']);

function normalizeText(value) {
  return String(value || '').toLowerCase().replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').replace(/[^a-z0-9\u00C0-\u024F\u0600-\u06FF\u0B80-\u0BFF\u4E00-\u9FFF ]/gi, ' ').replace(/\s+/g, ' ').trim();
}

function getQuestions(game) {
  return Array.isArray(game.gameData?.questions) ? game.gameData.questions : [];
}

function getMiniContentCount(game) {
  const data = game.gameData || {};
  return ['pairs', 'items', 'words', 'tiles', 'scenes', 'challenges', 'letters', 'statements'].reduce((sum, key) => sum + (Array.isArray(data[key]) ? data[key].length : 0), 0);
}

// Per-question audit — returns issues array for ONE question
function auditOneQuestion(q, game, localSeen, crossSeen) {
  const issues = [];
  const text = normalizeText(q.problem || q.question);
  const options = Array.isArray(q.options) ? q.options.map(o => String(o || '').trim()) : [];
  const joined = [q.problem || q.question, ...options].join(' ');
  if (!text || text.length < 8) issues.push('weak_question');
  if (BANNED_PATTERN.test(joined)) issues.push('banned_text');
  if (options.length !== 4) issues.push('bad_options_count');
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) issues.push('bad_answer_index');
  if (options.length === 4 && new Set(options.map(o => normalizeText(o))).size !== 4) issues.push('duplicate_options');
  if (localSeen.has(text)) issues.push('repeat_inside_game');
  localSeen.add(text);
  if (game.ageGroup === 'sekolah_rendah' && game.darjah && crossSeen) {
    const key = `${game.category}|${text}`;
    const prior = crossSeen.get(key);
    if (prior && prior.darjah !== game.darjah) issues.push('repeat_across_darjah');
    crossSeen.set(key, { darjah: game.darjah, title: game.title });
  }
  return issues;
}

function auditSubjectGame(game, crossSeen) {
  const gameIssues = [];
  const perQuestion = []; // [{index, issues}]
  const questions = getQuestions(game);
  const localSeen = new Set();
  if (game.ageGroup === 'sekolah_rendah' && !DARJAH_LEVELS.includes(game.darjah)) gameIssues.push('missing_darjah');
  if (questions.length < Math.max(8, Number(game.totalQuestions || 8))) gameIssues.push('too_few_questions');
  for (let i = 0; i < questions.length; i++) {
    const qIssues = auditOneQuestion(questions[i], game, localSeen, crossSeen);
    if (qIssues.length > 0) perQuestion.push({ index: i, issues: qIssues });
  }
  if (game.category === 'mathematics' && game.darjah) {
    const allText = normalizeText(`${game.title} ${questions.map(q => `${q.problem} ${(q.options || []).join(' ')}`).join(' ')}`);
    const numbers = (allText.match(/\b\d+\b/g) || []).map(Number).filter(Number.isFinite);
    if (numbers.some(n => n > MAX_MATH_NUMBER[game.darjah])) gameIssues.push('math_level_too_high');
  }
  // Aggregate all issue keys
  const allIssues = new Set(gameIssues);
  for (const pq of perQuestion) pq.issues.forEach(x => allIssues.add(x));
  return { issues: [...allIssues], gameIssues, perQuestion };
}

function auditMiniGame(game) {
  const issues = [];
  const data = game.gameData || {};
  const text = JSON.stringify(data);
  if (!game.title || !game.type || !game.category) issues.push('missing_metadata');
  if (getMiniContentCount(game) < 2 && !data.target && !data.instruction) issues.push('weak_mini_content');
  if (BANNED_PATTERN.test(text)) issues.push('banned_text');
  if ((data.mode === 'balloon_pop' || data.mode === 'falling_catch') && (!data.target || !Array.isArray(data.items) || data.items.filter(item => String(item).toLowerCase() === String(data.target).toLowerCase()).length < 2)) issues.push('target_not_playable');
  return [...new Set(issues)];
}

function auditStoryGame(game) {
  const issues = [];
  const scenes = Array.isArray(game.gameData?.scenes) ? game.gameData.scenes : [];
  if (!game.title) issues.push('missing_title');
  if (!game.description && !game.gameData?.moral) issues.push('missing_moral');
  if (scenes.length < 3) issues.push('too_few_story_slides');
  if (BANNED_PATTERN.test(`${game.title} ${game.description} ${JSON.stringify(scenes)}`)) issues.push('banned_text');
  return [...new Set(issues)];
}

function buildReplacementTask(game, count) {
  const isMiniGame = game.gameData?.miniGameGenerated === true || (MINI_CATEGORIES.includes(game.category) && !SUBJECTS.includes(game.category));
  if (isMiniGame) {
    return { taskName: `QC Mini Replacement: ${game.category}`, ageGroup: game.ageGroup || 'prasekolah', subject: game.category, gamesCount: count, questionsPerGame: Math.max(4, Math.min(Number(game.totalQuestions || game.gameData?.itemsPerSet || 4), 10)), status: 'pending', createdGames: 0, errorMessage: JSON.stringify({ theme: game.title || game.category, itemsPerSet: Math.max(4, Number(game.totalQuestions || 4)), modes: game.gameData?.mode ? [game.gameData.mode] : [] }) };
  }
  if (game.ageGroup === 'sekolah_rendah' && !game.darjah) return null;
  return { taskName: `QC Replacement: ${game.title || game.category}`, ageGroup: game.ageGroup, ...(game.ageGroup === 'sekolah_rendah' && game.darjah ? { darjah: game.darjah } : {}), subject: game.category, gamesCount: count, questionsPerGame: Math.max(8, Math.min(Number(game.totalQuestions || 8), 20)), status: 'pending', createdGames: 0, errorMessage: 'Auto re-queue by background quality control after failed audit.' };
}

// ─── AUTO-FIX: Re-generate a single bad question via LLM ───
async function fixOneQuestion(base44, game, badQuestion, issues) {
  const subject = game.category;
  const darjahLabel = game.darjah ? game.darjah.replace('_', ' ') : (game.ageGroup === 'prasekolah' ? 'Prasekolah' : 'Sekolah Rendah');
  const prompt = `You are an expert Malaysian KSSR/KSPK ${subject} teacher. Generate ONE replacement question for "${game.title}" (${darjahLabel}).

The OLD question had these issues: ${issues.join(', ')}

OLD question: ${badQuestion.problem || badQuestion.question || '(empty)'}
OLD options: ${(badQuestion.options || []).join(' | ')}

Generate a brand new question in BAHASA MELAYU that:
- Is age-appropriate for ${darjahLabel} ${subject}
- Has a clear, complete question text (min 10 characters, max 120)
- Has EXACTLY 4 distinct options
- Has exactly ONE correct answer (return its index 0-3)
- Includes a relevant emoji that semantically matches the correct answer
- Avoids generic phrases like "soalan X", "lihat gambar", "placeholder"
- Is FACTUALLY CORRECT

Return JSON only.`;

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        problem: { type: 'string' },
        options: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4 },
        answer: { type: 'number', minimum: 0, maximum: 3 },
        emoji: { type: 'string' },
      },
      required: ['problem', 'options', 'answer', 'emoji'],
    },
  });

  const fixed = result.response || result;
  if (!fixed || !fixed.problem || !Array.isArray(fixed.options) || fixed.options.length !== 4) return null;
  const norm = fixed.options.map(o => normalizeText(o));
  if (new Set(norm).size !== 4) return null;
  if (BANNED_PATTERN.test(`${fixed.problem} ${fixed.options.join(' ')}`)) return null;
  return { problem: fixed.problem, options: fixed.options, answer: fixed.answer, emoji: fixed.emoji, _autofixed: true };
}

async function createQcLog(base44, payload) {
  await base44.asServiceRole.entities.QCLog.create({
    runAt: new Date().toISOString(),
    action: payload.action || 'audit',
    status: payload.status || 'unknown',
    score: typeof payload.score === 'number' ? payload.score : null,
    total: payload.total || 0,
    passed: payload.passed || 0,
    failed: payload.failed || 0,
    deletedCount: payload.deletedCount || 0,
    replacementTasks: payload.replacementTasks || 0,
    activeTasks: payload.activeTasks || 0,
    message: payload.message || '',
    sampleIssues: payload.sampleIssues || [],
  });
}

// ─── Cleanup stuck tasks (running > 30 min) so queue keeps moving ───
async function cleanupStuckTasks(base44) {
  const tasks = await base44.asServiceRole.entities.GameTask.list('-created_date', 200);
  const cutoff = Date.now() - STUCK_TASK_MINUTES * 60 * 1000;
  let cleaned = 0;
  for (const t of tasks || []) {
    if (t.status === 'running') {
      const started = t.startedAt ? new Date(t.startedAt).getTime() : new Date(t.updated_date || t.created_date).getTime();
      if (started < cutoff) {
        await base44.asServiceRole.entities.GameTask.update(t.id, { status: 'pending', errorMessage: 'Reset by QC: task stuck in running state' });
        cleaned++;
      }
    }
  }
  return cleaned;
}

// ─── Ensure each subject×darjah bucket has minimum games; queue refill if empty ───
async function ensureBucketsNotEmpty(base44, games, activeTaskKeys) {
  const counts = new Map();
  for (const g of games) {
    if (!SUBJECTS.includes(g.category)) continue;
    if (g.ageGroup === 'sekolah_rendah' && !DARJAH_LEVELS.includes(g.darjah)) continue;
    const key = `${g.ageGroup}|${g.darjah || ''}|${g.category}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  const refillTasks = [];
  // Prasekolah buckets
  for (const subject of SUBJECTS) {
    const key = `prasekolah||${subject}`;
    const need = MIN_GAMES_PER_BUCKET - (counts.get(key) || 0);
    if (need > 0 && !activeTaskKeys.has(`prasekolah||${subject}`)) {
      refillTasks.push({ taskName: `QC Bucket Refill: prasekolah ${subject}`, ageGroup: 'prasekolah', subject, gamesCount: need, questionsPerGame: 10, status: 'pending', createdGames: 0, errorMessage: 'Auto refill by QC: bucket below minimum' });
    }
  }
  // Sekolah rendah buckets per darjah
  for (const subject of SUBJECTS) {
    for (const darjah of DARJAH_LEVELS) {
      const key = `sekolah_rendah|${darjah}|${subject}`;
      const need = MIN_GAMES_PER_BUCKET - (counts.get(key) || 0);
      if (need > 0 && !activeTaskKeys.has(`sekolah_rendah|${darjah}|${subject}`)) {
        refillTasks.push({ taskName: `QC Bucket Refill: ${darjah} ${subject}`, ageGroup: 'sekolah_rendah', darjah, subject, gamesCount: need, questionsPerGame: 10, status: 'pending', createdGames: 0, errorMessage: 'Auto refill by QC: bucket below minimum' });
      }
    }
  }
  let createdCount = 0;
  for (const task of refillTasks.slice(0, 8)) {
    await base44.asServiceRole.entities.GameTask.create(task);
    createdCount++;
  }
  return createdCount;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const force = body.force === true;
    const settings = await base44.asServiceRole.entities.QCSetting.list('-created_date', 1);
    const qcSetting = settings?.[0] || await base44.asServiceRole.entities.QCSetting.create({ intervalMinutes: 10 });
    const intervalMinutes = Math.max(5, Number(qcSetting.intervalMinutes || 10));
    const lastAutoRunAt = qcSetting.lastAutoRunAt ? new Date(qcSetting.lastAutoRunAt).getTime() : 0;
    const minutesSinceLastRun = lastAutoRunAt ? (Date.now() - lastAutoRunAt) / 60000 : Infinity;

    if (!force && body.auditOnly !== true && minutesSinceLastRun < intervalMinutes) {
      return Response.json({
        success: true,
        status: 'skipped_interval',
        intervalMinutes,
        minutesUntilNextRun: Math.ceil(intervalMinutes - minutesSinceLastRun),
        message: `QC skip dulu. Auto check setiap ${intervalMinutes} minit.`
      });
    }

    // ─── Step 1: Cleanup stuck tasks BEFORE checking queue ───
    const stuckCleaned = await cleanupStuckTasks(base44);

    const tasks = await base44.asServiceRole.entities.GameTask.list('-created_date', 500);
    const activeTasks = (tasks || []).filter(task => ['pending', 'running'].includes(task.status));
    const activeTaskKeys = new Set();
    for (const t of activeTasks) {
      activeTaskKeys.add(`${t.ageGroup}|${t.darjah || ''}|${t.subject}`);
    }

    // ─── Step 2: Load games & detect empty buckets EVEN if queue is busy ───
    const games = await base44.asServiceRole.entities.Game.list('-created_date', 1500);
    const bucketRefillCount = await ensureBucketsNotEmpty(base44, games || [], activeTaskKeys);

    if (activeTasks.length > 0 && !force) {
      const payload = { success: true, status: 'waiting_for_generation', score: null, activeTasks: activeTasks.length, replacementTasks: bucketRefillCount, message: `Queue belum siap (${activeTasks.length} aktif). Stuck cleaned: ${stuckCleaned}. Bucket refills: ${bucketRefillCount}.` };
      await base44.asServiceRole.entities.QCSetting.update(qcSetting.id, { lastAutoRunAt: new Date().toISOString() });
      await createQcLog(base44, { action: 'auto_audit', ...payload });
      return Response.json(payload);
    }

    // ─── Step 3: Audit all games ───
    const auditableGames = (games || []).filter(game => SUBJECTS.includes(game.category) || MINI_CATEGORIES.includes(game.category) || game.gameData?.storyKid);
    const crossSeen = new Map();
    const failed = []; // {game, issues, perQuestion, gameIssues, kind}
    for (const game of auditableGames) {
      const isStoryKid = game.gameData?.storyKid || game.category === 'story' || game.type === 'story_adventure';
      const isGeneratedMiniGame = game.gameData?.miniGameGenerated || MINI_CATEGORIES.includes(game.category);
      if (isStoryKid) {
        const issues = auditStoryGame(game);
        if (issues.length > 0) failed.push({ game, issues, kind: 'story' });
      } else if (isGeneratedMiniGame) {
        const issues = auditMiniGame(game);
        if (issues.length > 0) failed.push({ game, issues, kind: 'mini' });
      } else {
        const audit = auditSubjectGame(game, crossSeen);
        if (audit.issues.length > 0) failed.push({ game, issues: audit.issues, perQuestion: audit.perQuestion, gameIssues: audit.gameIssues, kind: 'subject' });
      }
    }
    const total = auditableGames.length;
    const passed = Math.max(0, total - failed.length);
    const score = total === 0 ? 0 : Math.round((passed / total) * 100);

    if (score >= MIN_PASS_SCORE && bucketRefillCount === 0 && stuckCleaned === 0) {
      const payload = { success: true, status: 'passed', score, total, passed, failed: failed.length, sampleIssues: failed.slice(0, 5).map(item => ({ title: item.game.title, issues: item.issues })), message: `Quality score ${score}% — cukup baik.` };
      if (!force && body.auditOnly !== true) await base44.asServiceRole.entities.QCSetting.update(qcSetting.id, { lastAutoRunAt: new Date().toISOString() });
      await createQcLog(base44, { action: body.auditOnly === true ? 'audit' : 'auto_audit', ...payload });
      return Response.json(payload);
    }

    if (body.auditOnly === true) {
      const payload = { success: true, status: 'needs_repair', score, total, passed, failed: failed.length, sampleIssues: failed.slice(0, 10).map(item => ({ title: item.game.title, category: item.game.category, issues: item.issues })), message: `Quality score ${score}% — perlu repair.` };
      await createQcLog(base44, { action: 'audit', ...payload });
      return Response.json(payload);
    }

    // ─── Step 4: AUTO-FIX repairable subject games first (per-question LLM fix) ───
    let autofixedGames = 0;
    let autofixedQuestions = 0;
    const stillBroken = [];
    let autofixBudget = MAX_AUTOFIX_PER_RUN;

    for (const item of failed) {
      if (autofixBudget <= 0) { stillBroken.push(item); continue; }
      if (item.kind !== 'subject') { stillBroken.push(item); continue; }
      const hasStructuralIssue = (item.gameIssues || []).some(i => STRUCTURAL_ISSUES.has(i));
      if (hasStructuralIssue) { stillBroken.push(item); continue; }
      const perQ = item.perQuestion || [];
      const repairable = perQ.filter(pq => pq.issues.every(i => REPAIRABLE_QUESTION_ISSUES.has(i)));
      if (repairable.length === 0) { stillBroken.push(item); continue; }
      if (repairable.length > 5) { stillBroken.push(item); continue; } // too damaged → replace

      // Try to fix each repairable question
      const questions = [...(item.game.gameData?.questions || [])];
      let fixedThisGame = 0;
      for (const pq of repairable) {
        if (autofixBudget <= 0) break;
        autofixBudget--;
        const fixed = await fixOneQuestion(base44, item.game, questions[pq.index], pq.issues);
        if (fixed) {
          questions[pq.index] = fixed;
          fixedThisGame++;
          autofixedQuestions++;
        }
        await new Promise(r => setTimeout(r, 400));
      }
      if (fixedThisGame === repairable.length) {
        await base44.asServiceRole.entities.Game.update(item.game.id, {
          gameData: { ...item.game.gameData, questions },
          status: 'ready',
        });
        autofixedGames++;
      } else {
        // Couldn't fix everything → mark for replacement
        stillBroken.push(item);
      }
    }

    // ─── Step 5: For games that can't be fixed → delete & queue replacement ───
    const selected = stillBroken.slice(0, MAX_DELETE_PER_RUN);
    const grouped = new Map();
    for (const item of selected) {
      const game = item.game;
      const groupKey = `${game.ageGroup}|${game.darjah || ''}|${game.category}`;
      const existing = grouped.get(groupKey) || { sample: game, count: 0 };
      existing.count += 1;
      grouped.set(groupKey, existing);
      await base44.asServiceRole.entities.Game.delete(game.id);
    }
    let createdTaskCount = 0;
    for (const group of grouped.values()) {
      const task = buildReplacementTask(group.sample, group.count);
      if (task) {
        await base44.asServiceRole.entities.GameTask.create(task);
        createdTaskCount++;
      }
    }

    const totalReplacementTasks = createdTaskCount + bucketRefillCount;
    const payload = {
      success: true,
      status: 'repair_queued',
      score,
      threshold: MIN_PASS_SCORE,
      total,
      passed,
      failedBeforeRepair: failed.length,
      failed: failed.length,
      autofixedGames,
      autofixedQuestions,
      stuckTasksCleaned: stuckCleaned,
      bucketRefills: bucketRefillCount,
      deletedThisRun: selected.length,
      deletedCount: selected.length,
      replacementTasks: totalReplacementTasks,
      sampleIssues: failed.slice(0, 5).map(item => ({ title: item.game.title, issues: item.issues })),
      message: `Score ${score}%. Auto-fix: ${autofixedGames} games / ${autofixedQuestions} questions. Deleted: ${selected.length}. Replacement tasks: ${totalReplacementTasks}. Stuck cleaned: ${stuckCleaned}.`,
    };
    if (!force) await base44.asServiceRole.entities.QCSetting.update(qcSetting.id, { lastAutoRunAt: new Date().toISOString() });
    await createQcLog(base44, { action: force ? 'repair' : 'auto_repair', ...payload });
    return Response.json(payload);
  } catch (error) {
    console.error('backgroundQualityControl error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});