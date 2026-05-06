import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SUBJECTS = ['bahasa_melayu', 'english', 'mathematics', 'science', 'jawi', 'bahasa_tamil', 'bahasa_mandarin'];
const MINI_CATEGORIES = ['memory', 'dragdrop', 'wordbuilder', 'sorting', 'tilematch', 'story', 'physics', 'tracing'];
const STORY_CATEGORIES = ['story'];
const DARJAH_LEVELS = ['darjah_1', 'darjah_2', 'darjah_3', 'darjah_4', 'darjah_5', 'darjah_6'];

const BANNED_PATTERN = /(hewan|singh|bekam|\blama\b|\bbabi\b|turtle|kodok|kelinci|daki|moo|woof|roar|rindu|semangat ketua|bintang di badannya|rongga hidung|terpanjang di dunia|jangan lupa|dua jenis rupa|haiwan apa|apakah nama haiwan ini|sering dibela|dua telinga panjang dan sangat comel|badan kecil dan suka berlari-lari|boleh terbang di taman|berbulu yang sering dipelihara|soalan\s*\d+|placeholder|contoh jawapan|lihat gambar|gambar di bawah|umum sahaja|aktiviti pembelajaran)$/i;

const KSSR_GUIDE = {
  darjah_1: { maxNumber: 100, keywords: ['huruf', 'suku kata', 'perkataan', 'ayat pendek', '0-100', 'tambah', 'tolak', 'bentuk', 'deria'] },
  darjah_2: { maxNumber: 1000, keywords: ['ayat mudah', 'kefahaman', '0-1000', 'operasi asas', 'wang', 'masa', 'haiwan', 'tumbuhan'] },
  darjah_3: { maxNumber: 10000, keywords: ['kefahaman', '0-10000', 'pecahan mudah', 'ukuran', 'magnet', 'cahaya', 'bunyi'] },
  darjah_4: { maxNumber: 100000, keywords: ['operasi bergabung', 'pecahan', 'perpuluhan', 'proses hidup', 'bahan', 'tenaga'] },
  darjah_5: { maxNumber: 1000000, keywords: ['peratus', 'nisbah', 'data', 'mikroorganisma', 'elektrik', 'haba', 'rantai makanan'] },
  darjah_6: { maxNumber: 10000000, keywords: ['penyelesaian masalah', 'peratus', 'purata', 'graf', 'daya', 'mesin ringkas', 'ekosistem'] },
};

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/[^a-z0-9\u00C0-\u024F\u0600-\u06FF\u0B80-\u0BFF\u4E00-\u9FFF ]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractQuestions(game) {
  if (Array.isArray(game.gameData?.questions)) return game.gameData.questions;
  if (Array.isArray(game.gameData?.challenges)) return game.gameData.challenges.map(q => ({ problem: q.question, options: q.options, answer: q.answer }));
  if (Array.isArray(game.gameData?.scenes)) return game.gameData.scenes.map(s => ({ problem: s.text, options: s.choices?.map(c => c.text || c), answer: 0 }));
  return [];
}

function getMiniContentCount(game) {
  const data = game.gameData || {};
  return ['pairs', 'items', 'words', 'tiles', 'scenes', 'challenges', 'letters'].reduce((sum, key) => sum + (Array.isArray(data[key]) ? data[key].length : 0), 0);
}

function collectQuestionIssues(game, questions, seenByScope, crossDarjahSeen) {
  const issues = [];
  const localSeen = new Map();

  questions.forEach((q, index) => {
    const text = normalizeText(q.problem || q.question);
    const options = Array.isArray(q.options) ? q.options.map(o => String(o || '').trim()) : [];
    const joined = [q.problem || q.question, ...options].join(' ');

    if (!text || text.length < 8) issues.push({ type: 'weak_question', index, text: q.problem || q.question || '' });
    if (BANNED_PATTERN.test(joined)) issues.push({ type: 'banned_or_merepek_text', index, text: q.problem || q.question || '' });

    if (options.length > 0) {
      const answerIsNumber = Number.isInteger(q.answer) && q.answer >= 0 && q.answer < options.length;
      const uniqueOptions = new Set(options.map(o => normalizeText(o))).size === options.length;
      if (!answerIsNumber) issues.push({ type: 'bad_answer_index', index, text: q.problem || q.question || '' });
      if (!uniqueOptions) issues.push({ type: 'duplicate_options', index, text: q.problem || q.question || '' });
    }

    if (text) {
      if (localSeen.has(text)) issues.push({ type: 'repeat_inside_game', index, text: q.problem || q.question || '' });
      localSeen.set(text, true);

      const sameScopeKey = `${game.ageGroup}|${game.darjah || 'none'}|${game.category}|${text}`;
      if (seenByScope.has(sameScopeKey)) issues.push({ type: 'repeat_same_darjah_subject', index, text: q.problem || q.question || '', duplicateWith: seenByScope.get(sameScopeKey) });
      seenByScope.set(sameScopeKey, game.title);

      if (game.ageGroup === 'sekolah_rendah' && game.darjah && SUBJECTS.includes(game.category)) {
        const crossKey = `${game.category}|${text}`;
        const prior = crossDarjahSeen.get(crossKey);
        if (prior && prior.darjah !== game.darjah) {
          issues.push({ type: 'repeat_across_darjah_1_6', index, text: q.problem || q.question || '', duplicateWith: `${prior.darjah} · ${prior.title}` });
        }
        crossDarjahSeen.set(crossKey, { darjah: game.darjah, title: game.title });
      }
    }
  });

  return issues;
}

function auditKssrLevel(game, questions) {
  if (game.ageGroup !== 'sekolah_rendah' || !SUBJECTS.includes(game.category)) return [];
  const issues = [];

  if (!DARJAH_LEVELS.includes(game.darjah)) {
    issues.push({ type: 'missing_or_invalid_darjah', detail: 'Sekolah rendah game mesti ada darjah_1 hingga darjah_6.' });
    return issues;
  }

  const allText = normalizeText(`${game.title} ${questions.map(q => q.problem || q.question || '').join(' ')}`);
  const numbers = (allText.match(/\b\d+\b/g) || []).map(Number).filter(n => Number.isFinite(n));
  const guide = KSSR_GUIDE[game.darjah];

  if (guide && numbers.some(n => n > guide.maxNumber && game.category === 'mathematics')) {
    issues.push({ type: 'math_level_too_high', detail: `Ada nombor melebihi julat munasabah ${game.darjah}.` });
  }

  if (/universiti|kolej|kimia organik|algebra kuadratik|trigonometri|calculus|politik|peperangan|dewasa/i.test(allText)) {
    issues.push({ type: 'outside_primary_kssr_scope', detail: 'Terdapat kandungan terlalu tinggi atau tidak sesuai KSSR sekolah rendah.' });
  }

  return issues;
}

function auditBbm(resource) {
  const issues = [];
  const html = String(resource.htmlContent || '');
  const text = normalizeText(`${resource.title} ${resource.description} ${html}`);

  if (!resource.title || resource.title.length < 8) issues.push({ type: 'weak_title' });
  if (!resource.subject || !resource.level || !resource.type) issues.push({ type: 'missing_metadata' });
  if (!html && !resource.fileUrl) issues.push({ type: 'missing_content' });
  if (BANNED_PATTERN.test(text)) issues.push({ type: 'banned_or_merepek_text' });
  if (/umum|topik umum|aktiviti pembelajaran/i.test(`${resource.title} ${resource.description}`)) issues.push({ type: 'generic_topic' });
  if (resource.level?.startsWith('darjah_') && !DARJAH_LEVELS.includes(resource.level)) issues.push({ type: 'invalid_darjah_level' });
  if (resource.subject === 'english' && /\b(apa|siapa|berapa|yang|dan|atau)\b/i.test(html)) issues.push({ type: 'wrong_language_for_english' });

  return issues;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const games = await base44.asServiceRole.entities.Game.list('-created_date', 1000);
    const bbmResources = await base44.asServiceRole.entities.BBMResource.list('-created_date', 1000);

    const seenByScope = new Map();
    const crossDarjahSeen = new Map();
    const gameIssues = [];
    const miniGameIssues = [];
    const storyKidIssues = [];

    for (const game of games || []) {
      const questions = extractQuestions(game);
      const isMini = MINI_CATEGORIES.includes(game.category);
      const isStoryKid = game.gameData?.storyKid || STORY_CATEGORIES.includes(game.category) || game.type === 'story_adventure';
      const issues = [];

      if (!game.title) issues.push({ type: 'missing_title' });
      if (!game.type) issues.push({ type: 'missing_type' });
      if (!game.gameData) issues.push({ type: 'missing_game_data' });

      if (isMini) {
        if (getMiniContentCount(game) < 2) issues.push({ type: 'weak_mini_game_content' });
      } else if (isStoryKid) {
        const scenes = game.gameData?.scenes || [];
        if (scenes.length < 3) issues.push({ type: 'too_few_story_slides' });
        if (!game.description && !game.gameData?.moral) issues.push({ type: 'missing_story_moral' });
      } else {
        if (questions.length < 8) issues.push({ type: 'too_few_questions', count: questions.length });
        issues.push(...collectQuestionIssues(game, questions, seenByScope, crossDarjahSeen));
        issues.push(...auditKssrLevel(game, questions));
      }

      if (issues.length > 0) {
        const entry = { id: game.id, title: game.title, category: game.category, ageGroup: game.ageGroup, darjah: game.darjah || null, issues: issues.slice(0, 8) };
        if (isMini) miniGameIssues.push(entry);
        else if (isStoryKid) storyKidIssues.push(entry);
        else gameIssues.push(entry);
      }
    }

    const bbmIssues = (bbmResources || [])
      .map(resource => ({ id: resource.id, title: resource.title, subject: resource.subject, level: resource.level, type: resource.type, issues: auditBbm(resource) }))
      .filter(item => item.issues.length > 0);

    const repeatAcrossDarjahCount = gameIssues.reduce((sum, item) => sum + item.issues.filter(issue => issue.type === 'repeat_across_darjah_1_6').length, 0);
    const totalIssues = gameIssues.length + miniGameIssues.length + bbmIssues.length + storyKidIssues.length;

    return Response.json({
      message: 'Full KSSR Quality Audit Complete',
      summary: {
        totalGames: games?.length || 0,
        totalBBM: bbmResources?.length || 0,
        gamesWithIssues: gameIssues.length,
        miniGamesWithIssues: miniGameIssues.length,
        bbmWithIssues: bbmIssues.length,
        storyKidWithIssues: storyKidIssues.length,
        repeatAcrossDarjahCount,
        status: totalIssues === 0 ? '✅ Semua bahan nampak baik' : `⚠️ ${totalIssues} bahan perlukan semakan`,
      },
      priorityNotes: [
        repeatAcrossDarjahCount > 0 ? 'Ada soalan berulang merentas Darjah 1-6. Ini perlu dibersihkan dahulu.' : 'Tiada repeat merentas Darjah 1-6 dikesan dalam 1000 rekod terbaru.',
        gameIssues.length > 0 ? 'Games utama ada isu kualiti/KSSR untuk disemak.' : 'Games utama lulus audit asas.',
        bbmIssues.length > 0 ? 'BBM ada bahan generik/kurang spesifik yang perlu diperbaiki.' : 'BBM lulus audit asas.',
      ],
      issues: {
        games: gameIssues.slice(0, 100),
        miniGames: miniGameIssues.slice(0, 100),
        bbm: bbmIssues.slice(0, 100),
        storyKid: storyKidIssues.slice(0, 100),
      },
    });
  } catch (error) {
    console.error('auditKSSRCompliance error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});