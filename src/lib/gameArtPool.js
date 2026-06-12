// Pool art Pixar 3D untuk game cards.
// Setiap art ada "tema" — dipadankan ikut subjek, jenis game & keyword tajuk
// supaya gambar sesuai dengan kandungan game (bukan rawak ikut index).
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
  // ── Tema subjek khusus ──
  { key: 'islam', art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/03ae58e43_generated_image.png', accent: '#0d9488' }, // masjid + Quran
  { key: 'jawi', art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/377ce147a_generated_image.png', accent: '#b45309' }, // kaligrafi jawi
  { key: 'moral', art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/8ab7fa41d_generated_image.png', accent: '#f43f5e' }, // tolong-menolong
  { key: 'sejarah', art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/06274efd8_generated_image.png', accent: '#a16207' }, // istana lama + peta
  { key: 'rbt', art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c71e59090_generated_image.png', accent: '#64748b' }, // bengkel robot
  { key: 'pjk', art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/9f1284243_generated_image.png', accent: '#16a34a' }, // padang sukan
  { key: 'seni', art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/4204cef86_generated_image.png', accent: '#d946ef' }, // studio lukisan
  { key: 'english', art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/e41e7f744_generated_image.png', accent: '#dc2626' }, // english classroom
  { key: 'tamil', art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/7aa446bc2_generated_image.png', accent: '#ea580c' }, // tamil script
  { key: 'mandarin', art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/5867f4bca_generated_image.png', accent: '#e11d48' }, // mandarin lanterns
  { key: 'bm', art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/3b62fd2ec_generated_image.png', accent: '#7c3aed' }, // buku cerita BM
  { key: 'money', art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/6c3d0d915_generated_image.png', accent: '#ca8a04' }, // kedai wang
  { key: 'time', art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/d6ce6b762_generated_image.png', accent: '#0ea5e9' }, // jam waktu
];

const byKey = (k) => GAME_ART_POOL.find((a) => a.key === k) || GAME_ART_POOL[0];

// Petakan kategori subjek (Game.category) → tema art
const CATEGORY_THEME = {
  bahasa_melayu: 'bm',
  english: 'english',
  mathematics: 'counting',
  science: 'science',
  jawi: 'jawi',
  pendidikan_islam: 'islam',
  pendidikan_moral: 'moral',
  sejarah: 'sejarah',
  rbt: 'rbt',
  pjk: 'pjk',
  seni: 'seni',
  bahasa_tamil: 'tamil',
  bahasa_mandarin: 'mandarin',
  kafa_quran: 'islam',
  kafa_jawi: 'jawi',
  kafa_akidah: 'islam',
  kafa_ibadah: 'islam',
  kafa_sirah: 'sejarah',
  kafa_adab: 'moral',
  kafa_bahasa_arab: 'jawi',
};

// Petakan jenis game (Game.type) → tema art
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

// Petakan keyword dalam tajuk → tema (paling tinggi keutamaan)
const TITLE_KEYWORDS = [
  { re: /wang|duit|money|harga|beli|kedai|ringgit|sen\b/i, key: 'money' },
  { re: /masa|waktu|jam|time|clock|hari|bulan(?! sabit)/i, key: 'time' },
  { re: /solat|wudhu|doa|iman|rukun|quran|hafazan|surah|nabi(?! muhammad saw sejarah)|akidah|ibadah|puasa|zakat|islam/i, key: 'islam' },
  { re: /jawi|khat|hijaiyah|arab/i, key: 'jawi' },
  { re: /moral|adab|akhlak|nilai|hormat|jujur|tolong/i, key: 'moral' },
  { re: /sejarah|merdeka|sultan|melaka|tokoh|sirah|warisan/i, key: 'sejarah' },
  { re: /reka|teknologi|robot|alat|bina|rbt/i, key: 'rbt' },
  { re: /sukan|senaman|kesihatan|bola|larian|pjk|badan/i, key: 'pjk' },
  { re: /seni|lukis|warna(?!.*padan)|kraf|corak seni/i, key: 'seni' },
  { re: /sains|science|eksperimen|tumbuh|planet|cuaca|magnet|tenaga/i, key: 'science' },
  { re: /angkasa|space|roket|bulan sabit|bintang/i, key: 'space' },
  { re: /hutan|jungle|rimba/i, key: 'jungle' },
  { re: /laut|ikan|ocean|air\b/i, key: 'water' },
  { re: /kira|nombor|number|count|tambah|tolak|darab|bahagi|math|pecahan|ukur/i, key: 'counting' },
  { re: /huruf|abc|letter|eja|spell|suku kata|fonik|phonic/i, key: 'letters' },
  { re: /memori|memory|ingat|padan|match/i, key: 'memory' },
  { re: /puzzle|teka|corak|pattern|bentuk|shape|susun|sort/i, key: 'puzzle' },
  { re: /cerita|story|kembara|adventure|harta|treasure/i, key: 'adventure' },
  { re: /kuiz|quiz|soalan/i, key: 'quiz' },
];

// Pilih art ikut kandungan game: tajuk → jenis → subjek → fallback rotasi.
export const getGameArtFor = (game, idx = 0) => {
  const title = game?.title || '';
  for (const { re, key } of TITLE_KEYWORDS) {
    if (re.test(title)) return byKey(key);
  }
  const typeKey = TYPE_THEME[game?.type];
  if (typeKey) return byKey(typeKey);
  const catKey = CATEGORY_THEME[game?.category];
  if (catKey) return byKey(catKey);
  return GAME_ART_POOL[Math.abs(idx) % GAME_ART_POOL.length];
};

// Kekalkan eksport lama untuk keserasian
export const getGameArt = (idx) => GAME_ART_POOL[Math.abs(idx) % GAME_ART_POOL.length];