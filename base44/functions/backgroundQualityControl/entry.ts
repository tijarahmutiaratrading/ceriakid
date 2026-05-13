import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SUBJECTS = ['bahasa_melayu', 'english', 'mathematics', 'science', 'jawi', 'bahasa_tamil', 'bahasa_mandarin'];
const DARJAH_LEVELS = ['darjah_1', 'darjah_2', 'darjah_3', 'darjah_4', 'darjah_5', 'darjah_6'];
const MINI_CATEGORIES = ['abc_phonics', 'math_counting', 'bahasa_melayu', 'english_vocabulary', 'sains_awal', 'jawi_iqra', 'memory_logic', 'islamic_learning'];
const MIN_PASS_SCORE = 90;
const MAX_DELETE_PER_RUN = 12;

const BANNED_PATTERN = /(hewan|singh|bekam|\blama\b|\bbabi\b|turtle|kodok|kelinci|daki|moo|woof|roar|rindu|semangat ketua|bintang di badannya|rongga hidung|terpanjang di dunia|jangan lupa|dua jenis rupa|haiwan apa|apakah nama haiwan ini|sering dibela|dua telinga panjang dan sangat comel|badan kecil dan suka berlari-lari|boleh terbang di taman|berbulu yang sering dipelihara|soalan\s*\d+|placeholder|contoh jawapan|lihat gambar|gambar di bawah|copy|salinan|umum sahaja|aktiviti pembelajaran)/i;
const MAX_MATH_NUMBER = { darjah_1: 100, darjah_2: 1000, darjah_3: 10000, darjah_4: 100000, darjah_5: 1000000, darjah_6: 10000000 };

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

function auditSubjectGame(game, crossSeen) {
  const issues = [];
  const questions = getQuestions(game);
  const localSeen = new Set();
  if (game.ageGroup === 'sekolah_rendah' && !DARJAH_LEVELS.includes(game.darjah)) issues.push('missing_darjah');
  if (questions.length < Math.max(8, Number(game.totalQuestions || 8))) issues.push('too_few_questions');
  for (const q of questions) {
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
    if (game.ageGroup === 'sekolah_rendah' && game.darjah) {
      const key = `${game.category}|${text}`;
      const prior = crossSeen.get(key);
      if (prior && prior.darjah !== game.darjah) issues.push('repeat_across_darjah');
      crossSeen.set(key, { darjah: game.darjah, title: game.title });
    }
  }
  if (game.category === 'mathematics' && game.darjah) {
    const allText = normalizeText(`${game.title} ${questions.map(q => `${q.problem} ${(q.options || []).join(' ')}`).join(' ')}`);
    const numbers = (allText.match(/\b\d+\b/g) || []).map(Number).filter(Number.isFinite);
    if (numbers.some(n => n > MAX_MATH_NUMBER[game.darjah])) issues.push('math_level_too_high');
  }
  return [...new Set(issues)];
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
  if (game.gameData?.miniGameGenerated || MINI_CATEGORIES.includes(game.category)) {
    return { taskName: `QC Mini Replacement: ${game.category}`, ageGroup: game.ageGroup || 'prasekolah', subject: game.category, gamesCount: count, questionsPerGame: Math.max(4, Math.min(Number(game.totalQuestions || game.gameData?.itemsPerSet || 4), 10)), status: 'pending', createdGames: 0, errorMessage: JSON.stringify({ theme: game.title || game.category, itemsPerSet: Math.max(4, Number(game.totalQuestions || 4)), modes: game.gameData?.mode ? [game.gameData.mode] : [] }) };
  }
  return { taskName: `QC Replacement: ${game.title || game.category}`, ageGroup: game.ageGroup, ...(game.ageGroup === 'sekolah_rendah' && game.darjah ? { darjah: game.darjah } : {}), subject: game.category, gamesCount: count, questionsPerGame: Math.max(8, Math.min(Number(game.totalQuestions || 8), 20)), status: 'pending', createdGames: 0, errorMessage: 'Auto re-queue by background quality control after failed audit.' };
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

    const tasks = await base44.asServiceRole.entities.GameTask.list('-created_date', 500);
    const activeTasks = (tasks || []).filter(task => ['pending', 'running'].includes(task.status));
    if (activeTasks.length > 0 && !force) {
      const payload = { success: true, status: 'waiting_for_generation', score: null, activeTasks: activeTasks.length, message: 'Queue belum siap, audit akan jalan bila semua completed.' };
      await base44.asServiceRole.entities.QCSetting.update(qcSetting.id, { lastAutoRunAt: new Date().toISOString() });
      await createQcLog(base44, { action: 'auto_audit', ...payload });
      return Response.json(payload);
    }
    const games = await base44.asServiceRole.entities.Game.list('-created_date', 1000);
    const auditableGames = (games || []).filter(game => SUBJECTS.includes(game.category) || MINI_CATEGORIES.includes(game.category) || game.gameData?.storyKid);
    const crossSeen = new Map();
    const failed = [];
    for (const game of auditableGames) {
      const isStoryKid = game.gameData?.storyKid || game.category === 'story' || game.type === 'story_adventure';
      const isGeneratedMiniGame = game.gameData?.miniGameGenerated || MINI_CATEGORIES.includes(game.category);
      const issues = isStoryKid ? auditStoryGame(game) : isGeneratedMiniGame ? auditMiniGame(game) : auditSubjectGame(game, crossSeen);
      if (issues.length > 0) failed.push({ game, issues });
    }
    const total = auditableGames.length;
    const passed = Math.max(0, total - failed.length);
    const score = total === 0 ? 0 : Math.round((passed / total) * 100);
    if (score >= MIN_PASS_SCORE) {
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
    const selected = failed.slice(0, MAX_DELETE_PER_RUN);
    const grouped = new Map();
    for (const item of selected) {
      const game = item.game;
      const groupKey = `${game.ageGroup}|${game.darjah || ''}|${game.category}`;
      const existing = grouped.get(groupKey) || { sample: game, count: 0 };
      existing.count += 1;
      grouped.set(groupKey, existing);
      await base44.asServiceRole.entities.Game.delete(game.id);
    }
    for (const group of grouped.values()) {
      await base44.asServiceRole.entities.GameTask.create(buildReplacementTask(group.sample, group.count));
    }
    const payload = { success: true, status: 'repair_queued', score, threshold: MIN_PASS_SCORE, total, passed, failedBeforeRepair: failed.length, failed: failed.length, deletedThisRun: selected.length, deletedCount: selected.length, replacementTasks: grouped.size, sampleIssues: failed.slice(0, 5).map(item => ({ title: item.game.title, issues: item.issues })), message: `Score ${score}%, ${selected.length} failed games deleted and replacements queued.` };
    if (!force) await base44.asServiceRole.entities.QCSetting.update(qcSetting.id, { lastAutoRunAt: new Date().toISOString() });
    await createQcLog(base44, { action: force ? 'repair' : 'auto_repair', ...payload });
    return Response.json(payload);
  } catch (error) {
    console.error('backgroundQualityControl error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});