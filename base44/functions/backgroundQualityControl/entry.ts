import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SUBJECTS = ['bahasa_melayu', 'english', 'mathematics', 'science', 'jawi', 'bahasa_tamil', 'bahasa_mandarin'];
const DARJAH_LEVELS = ['darjah_1', 'darjah_2', 'darjah_3', 'darjah_4', 'darjah_5', 'darjah_6'];
const MINI_CATEGORIES = ['memory_master', 'logic_puzzles', 'speed_focus', 'pattern_genius', 'maze_adventure', 'creative_builder', 'problem_solver', 'brain_training', 'memory', 'dragdrop', 'wordbuilder', 'sorting', 'tilematch', 'story', 'physics', 'tracing'];
const MIN_PASS_SCORE = 90;
const MAX_DELETE_PER_RUN = 300;
const MAX_AUTOFIX_PER_RUN = 20;
const MIN_GAMES_PER_BUCKET = 4;
const DEFAULT_CAP = 30;
const STUCK_TASK_MINUTES = 30;

const BANNED_PATTERN = /(hewan|singh|bekam|\blama\b|\bbabi\b|turtle|kodok|kelinci|\bpohon\b|\bsepatu\b|strawberi|tampak|cantik|santai|membazir|merata-rata|daki|moo|woof|roar|rindu|semangat ketua|bintang di badannya|rongga hidung|terpanjang di dunia|jangan lupa|dua jenis rupa|haiwan apa|apakah nama haiwan ini|sering dibela|dua telinga panjang dan sangat comel|badan kecil dan suka berlari-lari|boleh terbang di taman|berbulu yang sering dipelihara|soalan\s*\d+|placeholder|contoh jawapan|lihat gambar|gambar di bawah|copy|salinan|umum sahaja|aktiviti pembelajaran|preferensi|guara|trojan|loker|saksofon|kueh roti|gam pita|pancung)/i;

// Off-theme content keywords — content yang ada keyword ni TAK PATUT muncul dalam mini game cognitive category
// (sebab kategori macam brain_training/memory_master patut focus kognitif, bukan general knowledge)
const OFF_THEME_KEYWORDS = {
  brain_training:   /\b(haiwan peliharaan|makanan malaysia|nasi lemak|baju kurung|cheongsam|sari|bola sepak|kapal terbang)\b/i,
  memory_master:    /\b()\b/i,
  logic_puzzles:    /\b()\b/i,
  pattern_genius:   /\b()\b/i,
  maze_adventure:   /\b()\b/i,
  speed_focus:      /\b()\b/i,
  problem_solver:   /\b()\b/i,
  creative_builder: /\b()\b/i,
};

const MAX_MATH_NUMBER = { darjah_1: 100, darjah_2: 1000, darjah_3: 10000, darjah_4: 100000, darjah_5: 1000000, darjah_6: 10000000 };

// Issues that can be safely repaired by re-generating just the bad question via LLM
const REPAIRABLE_QUESTION_ISSUES = new Set(['weak_question', 'banned_text', 'bad_options_count', 'bad_answer_index', 'duplicate_options', 'repeat_inside_game']);
// Issues that affect the whole game (require replacement, not per-question fix)
const STRUCTURAL_ISSUES = new Set(['missing_darjah', 'too_few_questions', 'repeat_across_darjah', 'math_level_too_high']);

// Mini game issues that REQUIRE delete + replace (can't auto-fix)
const MINI_STRUCTURAL_ISSUES = new Set(['empty_rounds', 'dragdrop_no_challenge', 'duplicate_title', 'duplicate_microtopic', 'off_theme_content', 'weak_mini_content', 'target_not_playable']);

function normalizeText(value) {
  return String(value || '').toLowerCase().replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').replace(/[^a-z0-9\u00C0-\u024F\u0600-\u06FF\u0B80-\u0BFF\u4E00-\u9FFF ]/gi, ' ').replace(/\s+/g, ' ').trim();
}

function getQuestions(game) {
  return Array.isArray(game.gameData?.questions) ? game.gameData.questions : [];
}

function getMiniContentCount(game) {
  const data = game.gameData || {};
  // Count top-level content arrays
  const topCount = ['pairs', 'items', 'words', 'tiles', 'scenes', 'challenges', 'letters', 'statements'].reduce((sum, key) => sum + (Array.isArray(data[key]) ? data[key].length : 0), 0);
  // Count content inside rounds[] (spin_wheel, swipe_select, dragdrop, memory, hidden_object use rounds structure)
  let roundCount = 0;
  if (Array.isArray(data.rounds)) {
    for (const r of data.rounds) {
      if (!r || typeof r !== 'object') continue;
      for (const key of ['items', 'pairs', 'targets', 'options', 'tiles', 'cards']) {
        if (Array.isArray(r[key])) roundCount += r[key].length;
      }
    }
  }
  return topCount + roundCount;
}

// Get ALL text inside a mini game (deep walk, includes rounds, nested items, values)
function getAllMiniText(game) {
  const data = game.gameData || {};
  const parts = [String(game.title || ''), String(game.description || ''), String(data.title || ''), String(data.microTopic || ''), String(data.instruction || '')];
  const walk = (node) => {
    if (node == null) return;
    if (typeof node === 'string') { parts.push(node); return; }
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (typeof node === 'object') { Object.values(node).forEach(walk); return; }
  };
  walk(data.rounds);
  walk(data.items);
  walk(data.pairs);
  walk(data.words);
  walk(data.tiles);
  walk(data.scenes);
  walk(data.challenges);
  walk(data.statements);
  return parts.join(' || ');
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
  // NOTE: Jawi sengaja dikecualikan dari repeat_across_darjah check.
  // Huruf Jawi (Alif, Ba, Ta, dll) memang patut muncul Darjah 1-6 — ini curriculum, bukan bug.
  if (game.ageGroup === 'sekolah_rendah' && game.darjah && crossSeen && game.category !== 'jawi') {
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

function auditMiniGame(game, miniTitleSeen, miniMicroTopicSeen) {
  const issues = [];
  const data = game.gameData || {};
  const allText = getAllMiniText(game);

  // 1. Missing metadata
  if (!game.title || !game.type || !game.category) issues.push('missing_metadata');

  // 2. Banned text — scan ALL nested content now (not just top-level JSON.stringify)
  if (BANNED_PATTERN.test(allText)) issues.push('banned_text');

  // 3. Off-theme content (e.g. brain_training shouldn't be about haiwan peliharaan)
  const offThemePattern = OFF_THEME_KEYWORDS[game.category];
  if (offThemePattern && offThemePattern.source !== '\\b()\\b' && offThemePattern.test(allText)) {
    issues.push('off_theme_content');
  }

  // 4. Content count check — must have enough playable items
  const contentCount = getMiniContentCount(game);
  if (contentCount < 4) issues.push('weak_mini_content');

  // 5. Empty rounds — every round must have at least items/pairs/targets/options
  if (Array.isArray(data.rounds)) {
    let emptyRoundCount = 0;
    for (const r of data.rounds) {
      if (!r || typeof r !== 'object') { emptyRoundCount++; continue; }
      const hasContent = ['items', 'pairs', 'targets', 'options', 'tiles', 'cards'].some(k => Array.isArray(r[k]) && r[k].length >= 2);
      if (!hasContent && !r.target) emptyRoundCount++;
    }
    if (emptyRoundCount >= Math.ceil(data.rounds.length / 2)) issues.push('empty_rounds');
  }

  // 6. Dragdrop sanity — items must NOT be identical to targets (no challenge!)
  if (data.mode === 'dragdrop' && Array.isArray(data.rounds)) {
    let badRounds = 0;
    for (const r of data.rounds) {
      if (Array.isArray(r?.items) && Array.isArray(r?.targets) && r.items.length === r.targets.length) {
        const sameSet = r.items.every((it, i) => normalizeText(it) === normalizeText(r.targets[i]));
        if (sameSet) badRounds++;
      }
    }
    if (badRounds > 0) issues.push('dragdrop_no_challenge');
  }

  // 7. balloon_pop / falling_catch target playability
  if ((data.mode === 'balloon_pop' || data.mode === 'falling_catch') && (!data.target || !Array.isArray(data.items) || data.items.filter(item => String(item).toLowerCase() === String(data.target).toLowerCase()).length < 2)) {
    issues.push('target_not_playable');
  }

  // 8. type vs mode mismatch (cosmetic but breaks UI sometimes)
  const TYPE_MODE_MAP = {
    memory_game: ['memory'],
    drag_drop: ['dragdrop'],
    story_adventure: ['maze', 'hidden_object', 'story'],
  };
  if (data.mode && TYPE_MODE_MAP[game.type] && !TYPE_MODE_MAP[game.type].includes(data.mode)) {
    // Don't fail on this alone — just flag for "Teach" context
    issues.push('type_mode_mismatch');
  }

  // 9. Cross-game duplicate detection (mini games)
  // Cap pada 5 duplicates — kalau dah lebih, LLM memang suka reuse title untuk theme sama,
  // tapi content dalam game tetap berbeza. Tak worth delete lagi (loop infinite).
  if (miniTitleSeen && miniMicroTopicSeen) {
    const normTitle = normalizeText(game.title);
    const normMicro = normalizeText(data.microTopic);
    if (normTitle) {
      const titleCount = (miniTitleSeen.get(normTitle) || 0) + 1;
      miniTitleSeen.set(normTitle, titleCount);
      if (titleCount > 1 && titleCount <= 5) issues.push('duplicate_title');
    }
    if (normMicro && normMicro.length > 10) {
      const microCount = (miniMicroTopicSeen.get(normMicro) || 0) + 1;
      miniMicroTopicSeen.set(normMicro, microCount);
      if (microCount > 1 && microCount <= 5) issues.push('duplicate_microtopic');
    }
  }

  return [...new Set(issues)];
}

function auditStoryGame(game) {
  const issues = [];
  const mode = game.gameData?.mode;
  // Maze / hidden_object games are NOT story-based — skip story-specific checks
  const isMazeOrHiddenObject = mode === 'maze' || mode === 'hidden_object' || game.type === 'story_adventure' && (mode === 'maze' || mode === 'hidden_object');
  const scenes = Array.isArray(game.gameData?.scenes) ? game.gameData.scenes : [];
  if (!game.title) issues.push('missing_title');
  if (!isMazeOrHiddenObject) {
    if (!game.description && !game.gameData?.moral) issues.push('missing_moral');
    if (scenes.length < 3) issues.push('too_few_story_slides');
  }
  if (BANNED_PATTERN.test(`${game.title} ${game.description} ${JSON.stringify(scenes)}`)) issues.push('banned_text');
  return [...new Set(issues)];
}

function buildReplacementTask(game, count, learnFromIssues = []) {
  const isStoryKid = game.gameData?.storyKid === true || game.category === 'story' || game.type === 'story_adventure';
  const isMiniGame = !isStoryKid && (game.gameData?.miniGameGenerated === true || (MINI_CATEGORIES.includes(game.category) && !SUBJECTS.includes(game.category)));
  const teachNote = learnFromIssues.length > 0 ? ` AVOID these past issues: ${learnFromIssues.join(', ')}.` : '';

  if (isStoryKid) {
    return {
      taskName: `QC Story Replacement: ${game.title || 'Story Kid'}`,
      ageGroup: game.ageGroup || 'prasekolah',
      subject: 'story',
      gamesCount: count,
      questionsPerGame: Math.max(3, Math.min(Number(game.gameData?.scenes?.length || 5), 8)),
      status: 'pending',
      createdGames: 0,
      errorMessage: JSON.stringify({ storyKid: true, theme: game.title || 'cerita kanak-kanak', note: `QC replacement.${teachNote}` })
    };
  }
  if (isMiniGame) {
    return { taskName: `QC Mini Replacement: ${game.category}`, ageGroup: game.ageGroup || 'prasekolah', subject: game.category, gamesCount: count, questionsPerGame: Math.max(4, Math.min(Number(game.totalQuestions || game.gameData?.itemsPerSet || 4), 10)), status: 'pending', createdGames: 0, errorMessage: JSON.stringify({ theme: game.title || game.category, itemsPerSet: Math.max(4, Number(game.totalQuestions || 4)), modes: game.gameData?.mode ? [game.gameData.mode] : [], teachNote: teachNote.trim() }) };
  }
  if (game.ageGroup === 'sekolah_rendah' && !game.darjah) return null;
  return { taskName: `QC Replacement: ${game.title || game.category}`, ageGroup: game.ageGroup, ...(game.ageGroup === 'sekolah_rendah' && game.darjah ? { darjah: game.darjah } : {}), subject: game.category, gamesCount: count, questionsPerGame: Math.max(8, Math.min(Number(game.totalQuestions || 8), 20)), status: 'pending', createdGames: 0, errorMessage: `Auto re-queue by QC after failed audit.${teachNote}` };
}

// ─── AUTO-FIX: Strip banned items from mini game (lightweight repair, no LLM needed) ───
function tryFixMiniGameInPlace(game) {
  const data = JSON.parse(JSON.stringify(game.gameData || {}));
  let touched = false;
  // Clean top-level arrays
  for (const key of ['pairs', 'items', 'words', 'tiles', 'scenes', 'challenges', 'letters', 'statements']) {
    if (Array.isArray(data[key])) {
      const before = data[key].length;
      data[key] = data[key].filter(item => !BANNED_PATTERN.test(JSON.stringify(item)));
      if (data[key].length !== before) touched = true;
    }
  }
  // Clean inside rounds[]
  if (Array.isArray(data.rounds)) {
    for (const r of data.rounds) {
      if (!r || typeof r !== 'object') continue;
      for (const key of ['items', 'pairs', 'targets', 'options', 'tiles', 'cards']) {
        if (Array.isArray(r[key])) {
          const before = r[key].length;
          r[key] = r[key].filter(item => !BANNED_PATTERN.test(JSON.stringify(item)));
          if (r[key].length !== before) touched = true;
        }
      }
    }
  }
  // Must still have minimum playable content
  const fakeGame = { gameData: data };
  if (touched && getMiniContentCount(fakeGame) >= 4) return data;
  return null;
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
async function ensureBucketsNotEmpty(base44, games, activeTaskKeys, subjectCap) {
  const counts = new Map();
  for (const g of games) {
    if (!SUBJECTS.includes(g.category)) continue;
    if (g.ageGroup === 'sekolah_rendah' && !DARJAH_LEVELS.includes(g.darjah)) continue;
    const key = `${g.ageGroup}|${g.darjah || ''}|${g.category}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  const refillTasks = [];
  const subjectGaps = []; // [{label, current, target, need}]
  // Target = 70% of cap (so capacity audit fires before bucket goes empty)
  const subjectTarget = Math.max(MIN_GAMES_PER_BUCKET, Math.floor(subjectCap * 0.7));
  // Prasekolah buckets
  for (const subject of SUBJECTS) {
    const key = `prasekolah||${subject}`;
    const current = counts.get(key) || 0;
    const need = subjectTarget - current;
    if (need > 0) subjectGaps.push({ label: `prasekolah/${subject}`, current, target: subjectTarget, need });
    if (need > 0 && current < subjectCap && !activeTaskKeys.has(key)) {
      refillTasks.push({ taskName: `QC Capacity Refill: prasekolah ${subject} (${current}/${subjectTarget})`, ageGroup: 'prasekolah', subject, gamesCount: Math.min(need, subjectCap - current), questionsPerGame: 10, status: 'pending', createdGames: 0, errorMessage: `Auto refill by QC: under capacity (${current}/${subjectTarget})` });
    }
  }
  // Sekolah rendah buckets per darjah
  for (const subject of SUBJECTS) {
    for (const darjah of DARJAH_LEVELS) {
      const key = `sekolah_rendah|${darjah}|${subject}`;
      const current = counts.get(key) || 0;
      const need = subjectTarget - current;
      if (need > 0) subjectGaps.push({ label: `${darjah}/${subject}`, current, target: subjectTarget, need });
      if (need > 0 && current < subjectCap && !activeTaskKeys.has(key)) {
        refillTasks.push({ taskName: `QC Capacity Refill: ${darjah} ${subject} (${current}/${subjectTarget})`, ageGroup: 'sekolah_rendah', darjah, subject, gamesCount: Math.min(need, subjectCap - current), questionsPerGame: 10, status: 'pending', createdGames: 0, errorMessage: `Auto refill by QC: under capacity (${current}/${subjectTarget})` });
      }
    }
  }
  let createdCount = 0;
  for (const task of refillTasks.slice(0, 8)) {
    await base44.asServiceRole.entities.GameTask.create(task);
    createdCount++;
  }
  return { createdCount, gaps: subjectGaps };
}

// ─── NEW: Capacity audit for Mini Game categories ───
async function ensureMiniCategoriesAtCapacity(base44, games, activeTasks, miniGameCap) {
  const counts = new Map();
  for (const g of games) {
    if (MINI_CATEGORIES.includes(g.category) && !SUBJECTS.includes(g.category)) {
      counts.set(g.category, (counts.get(g.category) || 0) + 1);
    }
  }
  // Count pending mini tasks per category so we don't double-queue
  const pendingByCategory = new Map();
  for (const t of activeTasks) {
    if (MINI_CATEGORIES.includes(t.subject) && !SUBJECTS.includes(t.subject)) {
      const remaining = (Number(t.gamesCount) || 0) - (Number(t.createdGames) || 0);
      pendingByCategory.set(t.subject, (pendingByCategory.get(t.subject) || 0) + remaining);
    }
  }
  const target = Math.max(MIN_GAMES_PER_BUCKET, Math.floor(miniGameCap * 0.7));
  const refillTasks = [];
  const miniGaps = [];
  for (const category of MINI_CATEGORIES) {
    if (SUBJECTS.includes(category)) continue;
    const current = counts.get(category) || 0;
    const pending = pendingByCategory.get(category) || 0;
    const effective = current + pending;
    const need = target - effective;
    if (need > 0) miniGaps.push({ label: `mini/${category}`, current, pending, target, need });
    if (need > 0 && effective < miniGameCap) {
      const room = miniGameCap - effective;
      const queueCount = Math.min(need, room);
      refillTasks.push({ taskName: `QC Mini Capacity Refill: ${category} (${current}/${target})`, ageGroup: 'prasekolah', subject: category, gamesCount: queueCount, questionsPerGame: 6, status: 'pending', createdGames: 0, errorMessage: `Auto refill by QC: mini category under capacity (${current}/${target}). AVOID weak_mini_content, target_not_playable, banned_text.` });
    }
  }
  let createdCount = 0;
  for (const task of refillTasks.slice(0, 6)) {
    await base44.asServiceRole.entities.GameTask.create(task);
    createdCount++;
  }
  return { createdCount, gaps: miniGaps };
}

// ─── NEW: Capacity audit for Story Kid ───
async function ensureStoryKidAtCapacity(base44, games, activeTasks, storyKidCap) {
  const current = games.filter(g => g.gameData?.storyKid === true || g.category === 'story' || g.type === 'story_adventure').length;
  const pending = activeTasks.filter(t => t.subject === 'story').reduce((s, t) => s + Math.max(0, (Number(t.gamesCount) || 0) - (Number(t.createdGames) || 0)), 0);
  const effective = current + pending;
  const target = Math.max(MIN_GAMES_PER_BUCKET, Math.floor(storyKidCap * 0.7));
  const need = target - effective;
  const gap = need > 0 ? { label: 'story_kid', current, pending, target, need } : null;
  if (need <= 0 || effective >= storyKidCap) return { createdCount: 0, gap };
  const queueCount = Math.min(need, storyKidCap - effective);
  await base44.asServiceRole.entities.GameTask.create({
    taskName: `QC Story Capacity Refill (${current}/${target})`,
    ageGroup: 'prasekolah',
    subject: 'story',
    gamesCount: queueCount,
    questionsPerGame: 5,
    status: 'pending',
    createdGames: 0,
    errorMessage: JSON.stringify({ storyKid: true, theme: 'cerita kanak-kanak Malaysia', note: `Auto refill by QC: story kid under capacity (${current}/${target}).` })
  });
  return { createdCount: 1, gap };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const force = body.force === true;
    const settings = await base44.asServiceRole.entities.QCSetting.list('-created_date', 1);
    const qcSetting = settings?.[0] || await base44.asServiceRole.entities.QCSetting.create({ intervalMinutes: 10 });
    const intervalMinutes = Math.max(5, Number(qcSetting.intervalMinutes || 10));
    const subjectCap = Math.max(4, Number(qcSetting.subjectCap || DEFAULT_CAP));
    const miniGameCap = Math.max(4, Number(qcSetting.miniGameCap || DEFAULT_CAP));
    const storyKidCap = Math.max(4, Number(qcSetting.storyKidCap || DEFAULT_CAP));
    const lastAutoRunAt = qcSetting.lastAutoRunAt ? new Date(qcSetting.lastAutoRunAt).getTime() : 0;
    const minutesSinceLastRun = lastAutoRunAt ? (Date.now() - lastAutoRunAt) / 60000 : Infinity;

    // ─── AUTO-LOOP: Peek queue + last log dulu. Kalau queue kosong DAN score terakhir < 90,
    //    bypass interval guard — jalankan repair pusingan seterusnya automatik.
    let bypassInterval = false;
    if (!force && body.auditOnly !== true) {
      try {
        const peekTasks = await base44.asServiceRole.entities.GameTask.list('-created_date', 100);
        const peekActive = (peekTasks || []).filter(t => ['pending', 'running'].includes(t.status));
        if (peekActive.length === 0) {
          const recentLogs = await base44.asServiceRole.entities.QCLog.list('-created_date', 1);
          const lastScore = recentLogs?.[0]?.score;
          if (typeof lastScore === 'number' && lastScore < MIN_PASS_SCORE) {
            bypassInterval = true;
          }
        }
      } catch {}
    }

    if (!force && body.auditOnly !== true && !bypassInterval && minutesSinceLastRun < intervalMinutes) {
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

    // ─── Step 2: Load games & detect under-capacity categories EVEN if queue is busy ───
    const games = await base44.asServiceRole.entities.Game.list('-created_date', 1500);
    const subjectRefillResult = await ensureBucketsNotEmpty(base44, games || [], activeTaskKeys, subjectCap);
    const miniRefillResult = await ensureMiniCategoriesAtCapacity(base44, games || [], activeTasks, miniGameCap);
    const storyRefillResult = await ensureStoryKidAtCapacity(base44, games || [], activeTasks, storyKidCap);
    const bucketRefillCount = subjectRefillResult.createdCount + miniRefillResult.createdCount + storyRefillResult.createdCount;
    const capacityGaps = {
      subject: subjectRefillResult.gaps,
      mini: miniRefillResult.gaps,
      story: storyRefillResult.gap ? [storyRefillResult.gap] : [],
    };
    const totalGaps = capacityGaps.subject.length + capacityGaps.mini.length + capacityGaps.story.length;

    // NOTE: dulu kita STOP kalau queue busy. Sekarang kita TERUSKAN audit & autofix games sedia ada
    //       — generator akan tetap proses queue di background secara selari. QC tak perlu tunggu queue habis
    //       untuk fix games yang dah ada bug. Cuma kita skip auto-queue replacement baru kalau queue
    //       terlalu padat (>30 active tasks) supaya tak overload.
    const skipNewReplacementTasks = activeTasks.length > 30 && !force;

    // ─── Step 3: Audit all games ───
    const auditableGames = (games || []).filter(game => SUBJECTS.includes(game.category) || MINI_CATEGORIES.includes(game.category) || game.gameData?.storyKid);
    const crossSeen = new Map();
    const miniTitleSeen = new Map(); // title → count (cap at 5)
    const miniMicroTopicSeen = new Map(); // micro → count (cap at 5)
    const failed = []; // {game, issues, perQuestion, gameIssues, kind}
    for (const game of auditableGames) {
      const isStoryKid = game.gameData?.storyKid || game.category === 'story' || game.type === 'story_adventure';
      const isGeneratedMiniGame = game.gameData?.miniGameGenerated || MINI_CATEGORIES.includes(game.category);
      if (isStoryKid) {
        const issues = auditStoryGame(game);
        if (issues.length > 0) failed.push({ game, issues, kind: 'story' });
      } else if (isGeneratedMiniGame) {
        const issues = auditMiniGame(game, miniTitleSeen, miniMicroTopicSeen);
        if (issues.length > 0) failed.push({ game, issues, kind: 'mini' });
      } else {
        const audit = auditSubjectGame(game, crossSeen);
        if (audit.issues.length > 0) failed.push({ game, issues: audit.issues, perQuestion: audit.perQuestion, gameIssues: audit.gameIssues, kind: 'subject' });
      }
    }
    const total = auditableGames.length;
    const passed = Math.max(0, total - failed.length);
    const score = total === 0 ? 0 : Math.round((passed / total) * 100);

    // Breakdown by content type — helps admin understand WHERE issues are
    const breakdown = { subject: { total: 0, failed: 0 }, mini: { total: 0, failed: 0 }, story: { total: 0, failed: 0 } };
    for (const game of auditableGames) {
      const isStoryKid = game.gameData?.storyKid || game.category === 'story' || game.type === 'story_adventure';
      const isMini = !isStoryKid && (game.gameData?.miniGameGenerated || MINI_CATEGORIES.includes(game.category));
      const bucket = isStoryKid ? 'story' : (isMini ? 'mini' : 'subject');
      breakdown[bucket].total++;
    }
    for (const item of failed) {
      const bucket = item.kind === 'story' ? 'story' : (item.kind === 'mini' ? 'mini' : 'subject');
      breakdown[bucket].failed++;
    }

    if (score >= MIN_PASS_SCORE && bucketRefillCount === 0 && stuckCleaned === 0 && totalGaps === 0) {
      const payload = { success: true, status: 'passed', score, total, passed, failed: failed.length, breakdown, capacityGaps, topIssues: [], sampleIssues: failed.slice(0, 5).map(item => ({ title: item.game.title, issues: item.issues, kind: item.kind })), message: `Quality score ${score}% — cukup baik. Subject ${breakdown.subject.failed}/${breakdown.subject.total}, Mini ${breakdown.mini.failed}/${breakdown.mini.total}, Story ${breakdown.story.failed}/${breakdown.story.total}.` };
      if (!force && body.auditOnly !== true) await base44.asServiceRole.entities.QCSetting.update(qcSetting.id, { lastAutoRunAt: new Date().toISOString() });
      await createQcLog(base44, { action: body.auditOnly === true ? 'audit' : 'auto_audit', ...payload });
      return Response.json(payload);
    }

    // Build per-kind sample (so admin sees variety, not just first 10 subject failures)
    const sampleSubject = failed.filter(f => f.kind === 'subject').slice(0, 4).map(item => ({ title: item.game.title, category: item.game.category, issues: item.issues, kind: 'subject' }));
    const sampleMini = failed.filter(f => f.kind === 'mini').slice(0, 8).map(item => ({ title: item.game.title, category: item.game.category, issues: item.issues, kind: 'mini' }));
    const sampleStory = failed.filter(f => f.kind === 'story').slice(0, 3).map(item => ({ title: item.game.title, category: item.game.category, issues: item.issues, kind: 'story' }));
    const balancedSamples = [...sampleSubject, ...sampleMini, ...sampleStory];

    // Aggregate issue-type counts so admin sees WHICH problems are most common
    const issueCounts = {};
    for (const item of failed) {
      for (const issue of (item.issues || [])) {
        issueCounts[issue] = (issueCounts[issue] || 0) + 1;
      }
    }
    const topIssues = Object.entries(issueCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([issue, count]) => ({ issue, count }));

    if (body.auditOnly === true) {
      const payload = { success: true, status: 'needs_repair', score, total, passed, failed: failed.length, breakdown, capacityGaps, topIssues, sampleIssues: balancedSamples, message: `Score ${score}%. Failed: Subject ${breakdown.subject.failed}, Mini ${breakdown.mini.failed}, Story ${breakdown.story.failed}. Capacity gaps: ${totalGaps}.` };
      await createQcLog(base44, { action: 'audit', ...payload });
      return Response.json(payload);
    }

    // ─── Step 4: AUTO-FIX ───
    // 4a: Subject games — per-question LLM fix
    // 4b: Mini games — lightweight in-place strip of banned items (no LLM cost)
    let autofixedGames = 0;
    let autofixedQuestions = 0;
    let autofixedMiniGames = 0;
    const stillBroken = [];
    let autofixBudget = MAX_AUTOFIX_PER_RUN;

    for (const item of failed) {
      // 4b: Mini game lightweight fix
      // - Only banned_text → strip banned items in-place
      // - type_mode_mismatch alone → cosmetic fix (don't delete, just flag)
      // - Anything in MINI_STRUCTURAL_ISSUES → delete + replace
      if (item.kind === 'mini') {
        const hasStructural = item.issues.some(i => MINI_STRUCTURAL_ISSUES.has(i));
        const nonCosmetic = item.issues.filter(i => i !== 'type_mode_mismatch');
        const onlyBanned = nonCosmetic.length === 1 && nonCosmetic[0] === 'banned_text';
        const onlyCosmetic = nonCosmetic.length === 0;

        if (onlyCosmetic) {
          // Just type_mode_mismatch — skip, not worth delete
          continue;
        }
        if (onlyBanned && !hasStructural) {
          const fixedData = tryFixMiniGameInPlace(item.game);
          if (fixedData) {
            await base44.asServiceRole.entities.Game.update(item.game.id, { gameData: fixedData, status: 'ready' });
            autofixedMiniGames++;
            continue;
          }
        }
        stillBroken.push(item);
        continue;
      }
      if (item.kind !== 'subject') { stillBroken.push(item); continue; }
      if (autofixBudget <= 0) { stillBroken.push(item); continue; }
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
    // Build per-bucket counts to enforce caps for subjects, mini games, and story kid
    const bucketCounts = new Map();
    const miniCategoryCounts = new Map();
    let storyKidCount = 0;
    for (const g of games || []) {
      const isStoryKid = g.gameData?.storyKid === true;
      if (isStoryKid) {
        storyKidCount++;
      } else if (SUBJECTS.includes(g.category)) {
        const key = `${g.ageGroup}|${g.darjah || ''}|${g.category}`;
        bucketCounts.set(key, (bucketCounts.get(key) || 0) + 1);
      } else if (MINI_CATEGORIES.includes(g.category)) {
        miniCategoryCounts.set(g.category, (miniCategoryCounts.get(g.category) || 0) + 1);
      }
    }

    // Count active tasks per mini category so we don't queue more on top of pending
    const activeMiniCounts = new Map();
    for (const t of activeTasks) {
      if (MINI_CATEGORIES.includes(t.subject)) {
        activeMiniCounts.set(t.subject, (activeMiniCounts.get(t.subject) || 0) + (Number(t.gamesCount) || 0) - (Number(t.createdGames) || 0));
      }
    }

    // PADAM SEMUA SAMPAH yang dikesan dalam run ni (cap 300 per run untuk elak timeout).
    // Pusingan seterusnya (5 min lagi) akan padam yang berbaki — jadi tak bertumpuk.
    // Kalau queue terlalu padat (>30 active), skip delete — biar generator catch-up dulu.
    const selected = skipNewReplacementTasks ? [] : stillBroken.slice(0, MAX_DELETE_PER_RUN);
    const grouped = new Map();
    // Pass 1 (sync): group + accumulate counts/learnings
    for (const item of selected) {
      const game = item.game;
      const isStoryKid = game.gameData?.storyKid === true || item.kind === 'story';
      const isMini = !isStoryKid && MINI_CATEGORIES.includes(game.category) && !SUBJECTS.includes(game.category);
      const groupKey = isStoryKid ? 'storykid' : (isMini ? `mini|${game.category}` : `${game.ageGroup}|${game.darjah || ''}|${game.category}`);
      const existing = grouped.get(groupKey) || { sample: game, count: 0, isMini, isStoryKid, learnedIssues: new Set() };
      existing.count += 1;
      (item.issues || []).forEach(i => existing.learnedIssues.add(i));
      grouped.set(groupKey, existing);
      if (isStoryKid) {
        storyKidCount = Math.max(0, storyKidCount - 1);
      } else if (isMini) {
        miniCategoryCounts.set(game.category, Math.max(0, (miniCategoryCounts.get(game.category) || 1) - 1));
      } else {
        bucketCounts.set(groupKey, Math.max(0, (bucketCounts.get(groupKey) || 1) - 1));
      }
    }
    // Pass 2 (parallel batches): delete in chunks of 20 supaya cepat tapi tak crash
    const BATCH_SIZE = 20;
    let deletedOk = 0;
    for (let i = 0; i < selected.length; i += BATCH_SIZE) {
      const batch = selected.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(batch.map(item => base44.asServiceRole.entities.Game.delete(item.game.id)));
      deletedOk += results.filter(r => r.status === 'fulfilled').length;
    }
    let createdTaskCount = 0;
    let skippedTasksAtCap = 0;
    for (const [groupKey, group] of grouped.entries()) {
      let room;
      if (group.isStoryKid) {
        room = storyKidCap - storyKidCount;
      } else if (group.isMini) {
        const category = group.sample.category;
        const current = miniCategoryCounts.get(category) || 0;
        const pending = activeMiniCounts.get(category) || 0;
        room = miniGameCap - current - pending;
      } else {
        const currentCount = bucketCounts.get(groupKey) || 0;
        room = subjectCap - currentCount;
      }
      if (room <= 0) {
        // Already at/over cap → don't queue replacements (prevents infinite loop)
        skippedTasksAtCap++;
        continue;
      }
      const replaceCount = Math.min(group.count, room);
      const learnedIssues = [...group.learnedIssues];
      const task = buildReplacementTask(group.sample, replaceCount, learnedIssues);
      if (task) {
        await base44.asServiceRole.entities.GameTask.create(task);
        createdTaskCount++;
      }
    }

    const totalReplacementTasks = createdTaskCount + bucketRefillCount;
    const totalAutofixed = autofixedGames + autofixedMiniGames;
    const payload = {
      success: true,
      status: 'repair_queued',
      score,
      threshold: MIN_PASS_SCORE,
      total,
      passed,
      failedBeforeRepair: failed.length,
      failed: failed.length,
      breakdown,
      capacityGaps,
      autofixedGames: totalAutofixed,
      autofixedQuestions,
      autofixedMiniGames,
      stuckTasksCleaned: stuckCleaned,
      bucketRefills: bucketRefillCount,
      capacityRefills: { subject: subjectRefillResult.createdCount, mini: miniRefillResult.createdCount, story: storyRefillResult.createdCount },
      deletedThisRun: deletedOk,
      deletedCount: deletedOk,
      replacementTasks: totalReplacementTasks,
      skippedAtCap: skippedTasksAtCap,
      topIssues,
      sampleIssues: balancedSamples,
      message: `Score ${score}%. Auto-fix: ${autofixedGames} subject + ${autofixedMiniGames} mini (${autofixedQuestions} questions). Deleted: ${deletedOk}/${selected.length}. Replace queue: ${createdTaskCount}. Capacity refills: ${bucketRefillCount} (subjek:${subjectRefillResult.createdCount}, mini:${miniRefillResult.createdCount}, story:${storyRefillResult.createdCount}). Stuck cleaned: ${stuckCleaned}.`,
    };
    if (!force) await base44.asServiceRole.entities.QCSetting.update(qcSetting.id, { lastAutoRunAt: new Date().toISOString() });
    await createQcLog(base44, { action: force ? 'repair' : 'auto_repair', ...payload });
    return Response.json(payload);
  } catch (error) {
    console.error('backgroundQualityControl error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});