export const MINI_GAME_CATEGORIES = [
  { id: 'memory_master', title: 'Memory Master', emoji: '🧠', color: 'from-violet-500 to-purple-500', objective: 'Latih ingatan visual, fokus dan recall pantas.', games: [
    { id: 'genius-card-recall', title: 'Genius Card Recall', emoji: '🃏', mode: 'memory', difficulty: 'Mudah', objective: 'Ingat dan padankan pasangan kad.', instruction: 'Flip kad dan cari pasangan yang sama.', pairs: [['⭐', 'Star'], ['🚀', 'Rocket'], ['💎', 'Gem']], reward: 'Memory streak' },
    { id: 'hidden-symbol-hunt', title: 'Hidden Symbol Hunt', emoji: '🕵️', mode: 'hidden_object', difficulty: 'Sederhana', objective: 'Cari simbol tersembunyi dengan fokus.', instruction: 'Cari simbol sasaran secepat mungkin.', target: '⭐', items: [{ text: '🍎', value: 'apple' }, { text: '⭐', value: 'star' }, { text: '🚗', value: 'car' }], reward: 'Focus badge' },
    { id: 'sequence-memory', title: 'Sequence Memory', emoji: '🔁', mode: 'sequence', difficulty: 'Sukar', objective: 'Ingat urutan simbol.', instruction: 'Tekan simbol mengikut urutan betul.', items: ['🔴', '🟡', '🔵', '🟢'], answer: ['🔴', '🟡', '🔵', '🟢'], reward: 'Genius combo' },
  ]},
  { id: 'logic_puzzles', title: 'Logic Puzzles', emoji: '🧩', color: 'from-blue-500 to-indigo-500', objective: 'Asah logik, padanan dan penyelesaian puzzle.', games: [
    { id: 'smart-sorter', title: 'Smart Sorter', emoji: '📦', mode: 'sorting', difficulty: 'Mudah', objective: 'Asingkan item ikut kategori logik.', instruction: 'Pilih item, kemudian pilih kumpulan yang betul.', groups: ['Bulat', 'Bersudut'], items: [{ text: 'Bola', group: 'Bulat' }, { text: 'Kotak', group: 'Bersudut' }], reward: 'Logic star' },
    { id: 'tile-brain-match', title: 'Tile Brain Match', emoji: '🟨', mode: 'tilematch', difficulty: 'Sederhana', objective: 'Padankan jubin yang berkaitan.', instruction: 'Cari dua jubin yang sepadan.', tiles: ['Kunci', 'Pintu', 'Pensel', 'Kertas'], reward: 'Puzzle burst' },
    { id: 'drag-solution', title: 'Drag Solution', emoji: '🎯', mode: 'dragdrop', difficulty: 'Sederhana', objective: 'Padankan objek dengan tempat sesuai.', instruction: 'Pilih item, kemudian pilih sasaran yang sesuai.', items: ['Kunci', 'Buku', 'Payung'], targets: ['Pintu', 'Rak', 'Hujan'], reward: 'Smart solve' },
  ]},
  { id: 'speed_focus', title: 'Speed Focus', emoji: '⚡', color: 'from-yellow-400 to-orange-500', objective: 'Latih refleks, fokus mata dan keputusan cepat.', games: [
    { id: 'reaction-tap-pro', title: 'Reaction Tap Pro', emoji: '👆', mode: 'reaction_speed', difficulty: 'Sukar', objective: 'Tekan pada masa yang tepat.', instruction: 'Tunggu isyarat TAP, kemudian tekan secepat mungkin.', reward: 'Speed medal' },
    { id: 'catch-targets', title: 'Catch Targets', emoji: '🧺', mode: 'falling_catch', difficulty: 'Mudah', objective: 'Tangkap item sasaran.', instruction: 'Tangkap simbol sasaran sebelum jatuh.', target: '⭐', items: ['⭐', '💎', '⭐', '🚀'], reward: 'Catch combo' },
    { id: 'pop-focus', title: 'Pop Focus', emoji: '🎈', mode: 'balloon_pop', difficulty: 'Sederhana', objective: 'Pop sasaran yang betul sahaja.', instruction: 'Pop belon yang sama dengan sasaran.', target: '🚀', items: ['🚀', '⭐', '🚀', '💎'], reward: 'Pop streak' },
  ]},
  { id: 'pattern_genius', title: 'Pattern Genius', emoji: '🔷', color: 'from-cyan-500 to-sky-500', objective: 'Kenal pola, urutan dan ritma.', games: [
    { id: 'pattern-sequence', title: 'Pattern Sequence', emoji: '🔢', mode: 'sequence', difficulty: 'Sederhana', objective: 'Susun pola mengikut turutan.', instruction: 'Tekan simbol mengikut pola yang betul.', items: ['⭐', '🌙', '⭐', '🌙'], answer: ['⭐', '🌙', '⭐', '🌙'], reward: 'Pattern sparkle' },
    { id: 'connect-pattern', title: 'Connect Pattern', emoji: '✨', mode: 'connect_dots', difficulty: 'Mudah', objective: 'Sambung titik mengikut urutan.', instruction: 'Tekan titik dari mula hingga akhir.', items: ['1', '2', '3', '4'], reward: 'Line glow' },
    { id: 'rhythm-genius', title: 'Rhythm Genius', emoji: '🥁', mode: 'rhythm_tap', difficulty: 'Sederhana', objective: 'Ikut ritma dan ulang pola.', instruction: 'Tekan Tap Rentak mengikut pola simbol.', items: ['👏', '🥁', '👏', '⭐'], reward: 'Rhythm combo' },
  ]},
  { id: 'maze_adventure', title: 'Maze Adventure', emoji: '🌀', color: 'from-emerald-500 to-teal-500', objective: 'Cari laluan, buat pilihan dan kekalkan fokus.', games: [
    { id: 'genius-maze', title: 'Genius Maze', emoji: '🧭', mode: 'maze', difficulty: 'Sederhana', objective: 'Cari jalan ke bintang.', instruction: 'Tekan arah untuk sampai ke bintang.', reward: 'Maze clear' },
    { id: 'treasure-hunt', title: 'Treasure Hunt', emoji: '💎', mode: 'hidden_object', difficulty: 'Mudah', objective: 'Cari harta tersembunyi.', instruction: 'Cari objek sasaran dalam senarai.', target: '💎', items: [{ text: '⭐', value: 'star' }, { text: '💎', value: 'gem' }, { text: '🚀', value: 'rocket' }], reward: 'Treasure badge' },
    { id: 'choice-adventure', title: 'Choice Adventure', emoji: '📖', mode: 'story', difficulty: 'Sederhana', objective: 'Pilih keputusan paling bijak.', instruction: 'Baca situasi dan pilih tindakan terbaik.', scenes: [{ text: 'Watak jumpa dua laluan.', choices: ['Lihat peta', 'Teka sahaja'], answer: 0 }], reward: 'Adventure star' },
  ]},
  { id: 'creative_builder', title: 'Creative Builder', emoji: '🎨', color: 'from-pink-500 to-rose-500', objective: 'Bina, cipta dan susun idea secara kreatif.', games: [
    { id: 'color-genius', title: 'Color Genius', emoji: '🖍️', mode: 'coloring', difficulty: 'Mudah', objective: 'Lengkapkan aktiviti kreatif.', instruction: 'Tekan ikon untuk warnakan semua item.', items: ['⭐', '🌈', '🌸', '🎈'], reward: 'Color sticker' },
    { id: 'build-stack', title: 'Build Stack', emoji: '🏗️', mode: 'stacking', difficulty: 'Sederhana', objective: 'Bina menara mengikut sasaran.', instruction: 'Tekan blok sampai cukup jumlah sasaran.', target: 6, reward: 'Builder sparkle' },
    { id: 'shape-builder', title: 'Shape Builder', emoji: '🔺', mode: 'dragdrop', difficulty: 'Sederhana', objective: 'Padankan bentuk untuk bina gambar.', instruction: 'Pilih bentuk, kemudian pilih tempat betul.', items: ['Bulatan', 'Segi Tiga', 'Bintang'], targets: ['Matahari', 'Bumbung', 'Langit'], reward: 'Creative burst' },
  ]},
  { id: 'problem_solver', title: 'Problem Solver', emoji: '💡', color: 'from-amber-500 to-yellow-500', objective: 'Selesaikan cabaran sebab-akibat dan pilihan bijak.', games: [
    { id: 'true-false-brain', title: 'True False Brain', emoji: '✅', mode: 'true_false', difficulty: 'Mudah', objective: 'Nilai kenyataan dengan pantas.', instruction: 'Pilih Betul atau Salah untuk setiap kenyataan.', statements: [{ text: 'Kita berfikir sebelum memilih jawapan.', answer: true }, { text: 'Teka tanpa lihat soalan lebih baik.', answer: false }], reward: 'Brain point' },
    { id: 'mini-lab', title: 'Mini Lab', emoji: '🔬', mode: 'mini_simulation', difficulty: 'Sederhana', objective: 'Uji pilihan melalui simulasi mudah.', instruction: 'Pilih item yang sepadan dengan sasaran.', target: 'Kuat', items: [{ text: 'Tali tebal', group: 'Kuat' }, { text: 'Kertas nipis', group: 'Lemah' }], reward: 'Lab zap' },
    { id: 'physics-brain', title: 'Physics Brain', emoji: '⚙️', mode: 'physics', difficulty: 'Sukar', objective: 'Pilih jawapan berdasarkan sebab-akibat.', instruction: 'Pilih jawapan terbaik untuk cabaran.', challenges: [{ question: 'Objek mana lebih mudah bergolek?', options: ['Bola', 'Kotak', 'Buku', 'Pensel'], answer: 0 }], reward: 'Thinker badge' },
  ]},
  { id: 'brain_training', title: 'Brain Training', emoji: '🏆', color: 'from-fuchsia-500 to-purple-500', objective: 'Latihan campuran untuk fokus, logik dan ketangkasan minda.', games: [
    { id: 'brain-memory', title: 'Brain Memory', emoji: '🧠', mode: 'memory', difficulty: 'Mudah', objective: 'Padankan pasangan dengan cepat.', instruction: 'Flip kad dan cari pasangan.', pairs: [['🔴', 'Merah'], ['🔵', 'Biru'], ['🟢', 'Hijau']], reward: 'Brain streak' },
    { id: 'quick-swipe', title: 'Quick Swipe', emoji: '👆', mode: 'swipe_select', difficulty: 'Sederhana', objective: 'Bezakan kumpulan dengan cepat.', instruction: 'Pilih kumpulan yang betul untuk setiap item.', items: [{ text: 'Bola', group: 'Mainan' }, { text: 'Buku', group: 'Belajar' }], reward: 'Swipe combo' },
    { id: 'spin-brain', title: 'Spin Brain', emoji: '🎡', mode: 'spin_wheel', difficulty: 'Sederhana', objective: 'Putar dan pilih padanan tepat.', instruction: 'Padankan item roda dengan sasaran.', target: 'Kunci', items: ['Pintu', 'Awan', 'Pokok', 'Kasut'], reward: 'Wheel spark' },
  ]},
];

export function findMiniCategory(id) {
  return MINI_GAME_CATEGORIES.find(category => category.id === id) || MINI_GAME_CATEGORIES[0];
}

export function findMiniGame(categoryId, gameId) {
  const category = findMiniCategory(categoryId);
  return { category, game: category.games.find(game => game.id === gameId) || category.games[0] };
}