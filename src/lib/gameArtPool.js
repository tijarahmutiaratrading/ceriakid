// Pool art Pixar 3D untuk game cards.
// Setiap art ada "tema" — dipadankan ikut jenis game & keyword tajuk supaya
// gambar sesuai dengan kandungan game (bukan rawak ikut index).
export const GAME_ART_POOL = [
  { key: 'quiz', art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/6b7d784b0_generated_image.png', accent: '#a855f7' }, // quiz stage
  { key: 'memory', art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/fb8fbfcf4_generated_image.png', accent: '#ec4899' }, // memory cards
  { key: 'counting', art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/f4f5426bd_generated_image.png', accent: '#3b82f6' }, // counting blocks
  { key: 'letters', art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/d53c95af8_generated_image.png', accent: '#f97316' }, // alphabet blocks
  { key: 'science', art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/33f6642d0_generated_image.png', accent: '#10b981' }, // science lab
  { key: 'puzzle', art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/41b5c6b76_generated_image.png', accent: '#8b5cf6' }, // puzzle clouds
  { key: 'adventure', art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c596a927b_generated_image.png', accent: '#f59e0b' }, // treasure island
  { key: 'space', art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/00ed36e73_generated_image.png', accent: '#6366f1' }, // space classroom
  { key: 'jungle', art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/58ed55587_generated_image.png', accent: '#22c55e' }, // jungle trail
  { key: 'water', art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/6e464a293_generated_image.png', accent: '#06b6d4' }, // underwater letters
];

const byKey = (k) => GAME_ART_POOL.find((a) => a.key === k) || GAME_ART_POOL[0];

// Petakan jenis game (Game.type) → tema art yang sesuai
const TYPE_THEME = {
  number_match: 'counting', counting: 'counting', math_puzzle: 'counting',
  letter_match: 'letters', word_builder: 'letters', spelling: 'letters',
  reading: 'letters', phonics: 'letters', tracing: 'letters',
  science_quiz: 'science',
  memory_game: 'memory', tile_match: 'memory', sound_match: 'memory',
  shape_sort: 'puzzle', color_match: 'puzzle', pattern_fill: 'puzzle',
  sorting: 'puzzle', drag_drop: 'puzzle',
  picture_quiz: 'quiz', multiple_choice: 'quiz',
  story_adventure: 'adventure', physics: 'space',
};

// Petakan keyword dalam tajuk → tema (override TYPE_THEME bila ada padanan)
const TITLE_KEYWORDS = [
  { re: /kira|nombor|number|count|tambah|tolak|darab|bahagi|math|wang|nilai/i, key: 'counting' },
  { re: /huruf|abc|letter|eja|spell|baca|read|word|perkataan|jawi|aksara|khat/i, key: 'letters' },
  { re: /sains|science|eksperimen|haiwan|tumbuh|planet|cuaca/i, key: 'science' },
  { re: /angkasa|space|roket|bulan|bintang/i, key: 'space' },
  { re: /hutan|jungle|rimba|haiwan/i, key: 'jungle' },
  { re: /laut|air|water|ikan|ocean/i, key: 'water' },
  { re: /memori|memory|ingat|padan|match/i, key: 'memory' },
  { re: /puzzle|teka|corak|pattern|bentuk|shape|warna|color|susun|sort/i, key: 'puzzle' },
  { re: /cerita|story|kembara|adventure|harta|treasure/i, key: 'adventure' },
  { re: /kuiz|quiz|soalan/i, key: 'quiz' },
];

// Pilih art ikut kandungan game. Fallback ke rotasi index supaya tetap pelbagai.
export const getGameArtFor = (game, idx = 0) => {
  const title = game?.title || '';
  for (const { re, key } of TITLE_KEYWORDS) {
    if (re.test(title)) return byKey(key);
  }
  const themeKey = TYPE_THEME[game?.type];
  if (themeKey) return byKey(themeKey);
  return GAME_ART_POOL[Math.abs(idx) % GAME_ART_POOL.length];
};

// Kekalkan eksport lama untuk keserasian
export const getGameArt = (idx) => GAME_ART_POOL[Math.abs(idx) % GAME_ART_POOL.length];