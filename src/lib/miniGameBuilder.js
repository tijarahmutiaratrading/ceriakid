// Mini Game Builder
// Transform soalan KSSR Subject Games (yang dah 100% bersih) jadi format mini game.
// Setiap kategori cognitive ada strategy tersendiri untuk pick & shape data.
//
// Input: array of Subject Games (Game entity dari DB)
// Output: gameData object yang renderer (MiniGameModeRenderer) faham

import { base44 } from '@/api/base44Client';

// Subjects yang sesuai untuk mini games (yang ada questions array)
const SOURCE_SUBJECTS = ['bahasa_melayu', 'english', 'mathematics', 'science'];

// ─── Cache subject games (jimat API calls antara navigation) ───
let _cachedSubjects = null;
let _cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minit

async function fetchSubjectGames() {
  if (_cachedSubjects && Date.now() - _cacheTime < CACHE_TTL) return _cachedSubjects;
  const all = await base44.entities.Game.list('-created_date', 600);
  _cachedSubjects = (all || []).filter(g =>
    SOURCE_SUBJECTS.includes(g.category) &&
    Array.isArray(g.gameData?.questions) &&
    g.gameData.questions.length >= 4 &&
    g.isPublished !== false
  );
  _cacheTime = Date.now();
  return _cachedSubjects;
}

// ─── Helpers ───
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }
function pick(arr, n) { return shuffle(arr).slice(0, n); }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// Pull random questions across subjects
function pullQuestions(subjectGames, count, filterFn) {
  const allQuestions = subjectGames.flatMap(g =>
    g.gameData.questions.map(q => ({ ...q, _subject: g.category }))
  );
  const filtered = filterFn ? allQuestions.filter(filterFn) : allQuestions;
  return pick(filtered, count);
}

// ─── Builders per category ───
// Setiap builder return gameData yang sah untuk MiniGameModeRenderer

// 🧠 MEMORY MASTER — guna pasangan emoji+jawapan dari soalan
function buildMemoryMaster(subjectGames, variant = 1) {
  const questions = pullQuestions(subjectGames, 6, q => q.emoji && q.options?.[q.answer]);
  const pairs = questions.slice(0, 4).map(q => [q.emoji, q.options[q.answer]]);
  return {
    mode: 'memory',
    title: `Memory Master · Padankan Pasangan #${variant}`,
    instruction: 'Buka 2 kad. Cari pasangan yang sama maksud.',
    pairs,
  };
}

// 🧩 LOGIC PUZZLES — sort soalan berdasarkan subject (logic grouping)
function buildLogicPuzzles(subjectGames, variant = 1) {
  const questions = pullQuestions(subjectGames, 8);
  const items = questions.slice(0, 6).map(q => ({
    text: q.options[q.answer],
    group: subjectLabel(q._subject),
  }));
  const groups = [...new Set(items.map(it => it.group))].slice(0, 2);
  return {
    mode: 'sorting',
    title: `Logic Puzzles · Asingkan Mengikut Subjek #${variant}`,
    instruction: 'Pilih item, kemudian pilih kumpulan subjek yang betul.',
    groups,
    items: items.filter(it => groups.includes(it.group)),
  };
}

// ⚡ SPEED FOCUS — falling catch: tangkap jawapan betul untuk soalan
function buildSpeedFocus(subjectGames, variant = 1) {
  // Cari soalan dengan jawapan pendek (1-3 char) untuk lebih readable
  const mathQuestions = pullQuestions(subjectGames, 20, q =>
    q._subject === 'mathematics' && q.options?.[q.answer] && String(q.options[q.answer]).length <= 3
  );
  // Buat 3 rounds, setiap round 1 soalan + items adalah pilihan
  const rounds = mathQuestions.slice(0, 5).map((q, i) => ({
    label: `Round ${i + 1}: ${q.problem}`,
    target: String(q.options[q.answer]),
    items: shuffle([
      String(q.options[q.answer]),
      String(q.options[q.answer]),
      ...q.options.filter((_, idx) => idx !== q.answer).map(String),
    ]).slice(0, 7),
  }));
  return {
    mode: 'falling_catch',
    title: `Speed Focus · Tangkap Jawapan Math #${variant}`,
    instruction: 'Tangkap jawapan yang betul untuk soalan setiap pusingan.',
    rounds,
  };
}

// 🔷 PATTERN GENIUS — sequence: susun ikut turutan
function buildPatternGenius(subjectGames, variant = 1) {
  // Ambil emojis from questions sebagai pattern
  const questions = pullQuestions(subjectGames, 10, q => q.emoji);
  const emojis = [...new Set(questions.map(q => q.emoji))].slice(0, 4);
  const answer = [...emojis];
  return {
    mode: 'sequence',
    title: `Pattern Genius · Susun Pola #${variant}`,
    instruction: 'Tekan simbol mengikut turutan yang ditunjukkan.',
    items: shuffle(emojis),
    answer,
  };
}

// 🌀 MAZE ADVENTURE — hidden object: cari emoji jawapan
function buildMazeAdventure(subjectGames, variant = 1) {
  const questions = pullQuestions(subjectGames, 12, q => q.emoji && q.options?.[q.answer]);
  // Round 1: target = first emoji, items = mixed emojis
  const target = questions[0]?.emoji || '⭐';
  const items = questions.slice(0, 6).map(q => ({
    text: q.emoji,
    value: q.options[q.answer],
  }));
  return {
    mode: 'hidden_object',
    title: `Maze Adventure · Cari Harta #${variant}`,
    instruction: `Cari ${target} dalam senarai gambar.`,
    target,
    items: shuffle(items),
  };
}

// 🎨 CREATIVE BUILDER — coloring + stacking
function buildCreativeBuilder(subjectGames, variant = 1) {
  const questions = pullQuestions(subjectGames, 8, q => q.emoji);
  const emojis = [...new Set(questions.map(q => q.emoji))].slice(0, 6);
  return {
    mode: 'coloring',
    title: `Creative Builder · Warnakan Semua #${variant}`,
    instruction: 'Tekan setiap ikon untuk warnakan.',
    items: emojis,
  };
}

// 💡 PROBLEM SOLVER — true/false dari soalan multi-choice
function buildProblemSolver(subjectGames, variant = 1) {
  const questions = pullQuestions(subjectGames, 10, q => q.options?.[q.answer]);
  // Mix: setengah betul (statement = jawapan betul), setengah palsu (statement = jawapan salah)
  const statements = questions.slice(0, 6).map((q, i) => {
    const isTrue = i % 2 === 0;
    const optionIdx = isTrue ? q.answer : (q.answer + 1) % q.options.length;
    return {
      text: `${q.problem.replace(/\?$/, '')} → ${q.options[optionIdx]}`,
      answer: isTrue,
    };
  });
  return {
    mode: 'true_false',
    title: `Problem Solver · Betul atau Salah? #${variant}`,
    instruction: 'Baca kenyataan, pilih Betul atau Salah.',
    statements,
  };
}

// 🏆 BRAIN TRAINING — mix: swipe_select berdasarkan subject
function buildBrainTraining(subjectGames, variant = 1) {
  const questions = pullQuestions(subjectGames, 12, q => q.options?.[q.answer]);
  const items = questions.slice(0, 8).map(q => ({
    text: q.options[q.answer],
    group: subjectLabel(q._subject),
  }));
  const groups = [...new Set(items.map(it => it.group))].slice(0, 2);
  return {
    mode: 'swipe_select',
    title: `Brain Training · Kategorikan Pantas #${variant}`,
    instruction: 'Baca perkataan, pilih subjek yang betul.',
    groups,
    items: items.filter(it => groups.includes(it.group)),
  };
}

function subjectLabel(category) {
  switch (category) {
    case 'bahasa_melayu': return 'Bahasa Melayu';
    case 'english': return 'English';
    case 'mathematics': return 'Matematik';
    case 'science': return 'Sains';
    default: return 'Lain-lain';
  }
}

const BUILDERS = {
  memory_master: buildMemoryMaster,
  logic_puzzles: buildLogicPuzzles,
  speed_focus: buildSpeedFocus,
  pattern_genius: buildPatternGenius,
  maze_adventure: buildMazeAdventure,
  creative_builder: buildCreativeBuilder,
  problem_solver: buildProblemSolver,
  brain_training: buildBrainTraining,
};

// ─── Public API ───

// Build a mini game on the fly from KSSR Subject Games
// variant: 1-6, used as seed (different content each variant)
export async function buildMiniGameFromKSSR(categoryId, variant = 1) {
  const builder = BUILDERS[categoryId];
  if (!builder) return null;
  const subjectGames = await fetchSubjectGames();
  if (subjectGames.length === 0) return null;
  // Shuffle source supaya variant berbeza dapat content berbeza
  const shuffled = shuffle(subjectGames);
  try {
    const gameData = builder(shuffled, variant);
    return gameData;
  } catch (e) {
    console.error('miniGameBuilder error', e);
    return null;
  }
}

// Get list of variants for a category (untuk list page)
export function getMiniGameVariants(categoryId, count = 6) {
  return Array.from({ length: count }, (_, i) => ({
    id: `${categoryId}-v${i + 1}`,
    variant: i + 1,
    title: `Cabaran #${i + 1}`,
    categoryId,
  }));
}

export const COGNITIVE_CATEGORIES = Object.keys(BUILDERS);