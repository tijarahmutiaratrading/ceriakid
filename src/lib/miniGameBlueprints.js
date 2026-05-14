export const MINI_GAME_CATEGORIES = [
  { id: 'abc_phonics', title: 'ABC & Phonics', emoji: '🔤', color: 'from-pink-500 to-rose-400', objective: 'Kenal huruf, bunyi dan bentuk huruf.', games: [
    { id: 'letter-balloon-pop', title: 'Letter Balloon Pop', emoji: '🎈', mode: 'balloon_pop', difficulty: 'Mudah', objective: 'Kenal huruf disebut.', instruction: 'Pop belon huruf sasaran.', target: 'A', items: ['A', 'B', 'A', 'C', 'D'], reward: 'Star combo + pop sound' },
    { id: 'trace-alphabet', title: 'Trace The Alphabet', emoji: '✏️', mode: 'tracing', difficulty: 'Mudah', objective: 'Belajar tulis huruf.', instruction: 'Tap titik glowing ikut urutan.', letters: ['A', 'B', 'C'], reward: 'Unlock sticker' },
    { id: 'phonics-match', title: 'Phonics Match', emoji: '🔊', mode: 'sorting', difficulty: 'Sederhana', objective: 'Padankan bunyi awal dengan perkataan.', instruction: 'Pilih perkataan, kemudian masukkan ke bunyi awal yang betul.', groups: ['ba', 'ca', 'da', 'ma'], items: [{ text: 'bola', group: 'ba' }, { text: 'cawan', group: 'ca' }, { text: 'dadu', group: 'da' }, { text: 'mata', group: 'ma' }], reward: 'Confetti padanan' },
  ]},
  { id: 'math_counting', title: 'Math & Counting', emoji: '🔢', color: 'from-blue-500 to-cyan-400', objective: 'Nombor, kiraan dan pola asas.', games: [
    { id: 'catch-numbers', title: 'Catch The Numbers', emoji: '🧺', mode: 'falling_catch', difficulty: 'Mudah', objective: 'Tangkap nombor yang betul.', instruction: 'Tap nombor sasaran sebelum jatuh.', target: '5', items: ['2', '5', '7', '5', '9'], reward: 'Combo basket' },
    { id: 'counting-stack', title: 'Counting Stack Tower', emoji: '🏗️', mode: 'stacking', difficulty: 'Sederhana', objective: 'Bina menara ikut jumlah.', instruction: 'Tap blok sampai cukup jumlah.', target: 6, reward: 'Tower sparkle' },
    { id: 'number-sequence-train', title: 'Number Train Sequence', emoji: '🚂', mode: 'sequence', difficulty: 'Sederhana', objective: 'Susun nombor mengikut turutan.', instruction: 'Tap nombor mengikut urutan menaik.', items: ['3', '1', '4', '2'], answer: ['1', '2', '3', '4'], reward: 'Train bergerak' },
  ]},
  { id: 'creative_arts', title: 'Creative Arts', emoji: '🎨', color: 'from-orange-500 to-pink-400', objective: 'Mewarna, rentak, kreativiti dan koordinasi tangan.', games: [
    { id: 'coloring-fun', title: 'Coloring Fun', emoji: '🖍️', mode: 'coloring', difficulty: 'Mudah', objective: 'Latih fokus dan kreativiti.', instruction: 'Tekan ikon untuk warnakan semua gambar.', items: ['⭐', '🌈', '🌸', '🎈'], reward: 'Sticker warna' },
    { id: 'rhythm-tap', title: 'Rhythm Tap', emoji: '🥁', mode: 'rhythm_tap', difficulty: 'Sederhana', objective: 'Ikut rentak dan pola mudah.', instruction: 'Tekan Tap Rentak mengikut susunan simbol.', items: ['👏', '🥁', '👏', '⭐'], reward: 'Combo rentak' },
    { id: 'shape-drag-art', title: 'Shape Drag Art', emoji: '🔷', mode: 'dragdrop', difficulty: 'Sederhana', objective: 'Padankan bentuk untuk lengkapkan gambar.', instruction: 'Pilih bentuk, kemudian pilih tempat yang sepadan.', items: ['Bulatan', 'Segi Tiga', 'Bintang'], targets: ['Matahari', 'Bumbung', 'Langit'], reward: 'Art sparkle' },
  ]},
  { id: 'english_vocabulary', title: 'English Vocabulary', emoji: '🌟', color: 'from-violet-500 to-purple-400', objective: 'Vocabulary harian dan perkataan mudah.', games: [
    { id: 'word-picture-hunt', title: 'Word Picture Hunt', emoji: '🔍', mode: 'picture_hunt', difficulty: 'Mudah', objective: 'Cari gambar mengikut perkataan.', instruction: 'Tap gambar yang sepadan dengan perkataan sasaran.', target: 'cat', items: [{ text: '🐱', value: 'cat' }, { text: '⚽', value: 'ball' }, { text: '🐟', value: 'fish' }, { text: '📚', value: 'book' }], reward: 'Magnifier sparkle' },
    { id: 'typing-race', title: 'Mini Typing Race', emoji: '⌨️', mode: 'typing_challenge', difficulty: 'Sederhana', objective: 'Taip perkataan mudah.', instruction: 'Taip perkataan sasaran.', target: 'sun', reward: 'Race car boost' },
    { id: 'opposite-tiles', title: 'Opposite Tile Match', emoji: '🟨', mode: 'tilematch', difficulty: 'Sederhana', objective: 'Padankan lawan kata.', instruction: 'Cari pasangan opposite words.', tiles: ['big', 'small', 'hot', 'cold', 'up', 'down'], reward: 'Tile burst' },
  ]},
  { id: 'sains_awal', title: 'Sains Awal', emoji: '🔬', color: 'from-sky-500 to-blue-500', objective: 'Pemerhatian, klasifikasi dan sebab-akibat.', games: [
    { id: 'living-sorting', title: 'Living Things Sorter', emoji: '🌱', mode: 'sorting', difficulty: 'Mudah', objective: 'Isih benda hidup/bukan hidup.', instruction: 'Letak item dalam kumpulan betul.', groups: ['Benda Hidup', 'Bukan Hidup'], items: [{ text: 'Kucing', group: 'Benda Hidup' }, { text: 'Pokok', group: 'Benda Hidup' }, { text: 'Buku', group: 'Bukan Hidup' }, { text: 'Meja', group: 'Bukan Hidup' }], reward: 'Lab stars' },
    { id: 'magnet-simulation', title: 'Magnet Mini Simulation', emoji: '🧲', mode: 'mini_simulation', difficulty: 'Sederhana', objective: 'Kenal objek tertarik magnet.', instruction: 'Tap objek yang tertarik kepada magnet.', target: 'Logam', items: [{ text: 'Klip', group: 'Logam' }, { text: 'Pensel', group: 'Bukan' }, { text: 'Paku', group: 'Logam' }], reward: 'Magnet zap' },
    { id: 'weather-true-false', title: 'Weather True / False', emoji: '🌦️', mode: 'true_false', difficulty: 'Mudah', objective: 'Fahami cuaca harian.', instruction: 'Pilih betul atau salah.', statements: [{ text: 'Hujan turun dari awan.', answer: true }, { text: 'Matahari muncul waktu malam sahaja.', answer: false }], reward: 'Sunshine cheer' },
  ]},
  { id: 'jawi_iqra', title: 'Jawi & Iqra', emoji: '🕌', color: 'from-amber-500 to-yellow-400', objective: 'Kenal huruf Jawi dan bacaan asas.', games: [
    { id: 'jawi-memory', title: 'Jawi Memory Flip', emoji: '🧠', mode: 'memory', difficulty: 'Mudah', objective: 'Ingat pasangan huruf Jawi.', instruction: 'Flip dan cari pasangan huruf.', pairs: [['ا', 'Alif'], ['ب', 'Ba'], ['ت', 'Ta']], reward: 'Moon stars' },
    { id: 'iqra-rhythm', title: 'Iqra Step Tap', emoji: '🥁', mode: 'sequence', difficulty: 'Sederhana', objective: 'Kenal urutan huruf Jawi asas.', instruction: 'Tap huruf Jawi mengikut turutan Alif, Ba, Ta, Tha.', items: ['ت', 'ا', 'ث', 'ب'], answer: ['ا', 'ب', 'ت', 'ث'], reward: 'Rhythm combo' },
    { id: 'jawi-connect-dots', title: 'Jawi Connect Dots', emoji: '✨', mode: 'connect_dots', difficulty: 'Sederhana', objective: 'Kenal urutan huruf Jawi asas.', instruction: 'Tekan huruf Jawi mengikut turutan Alif, Ba, Ta, Tha.', items: ['ا', 'ب', 'ت', 'ث'], reward: 'Glowing letter' },
  ]},
  { id: 'memory_logic', title: 'Memory & Logic', emoji: '🧠', color: 'from-fuchsia-500 to-pink-500', objective: 'Ingatan, fokus dan penyelesaian masalah.', games: [
    { id: 'maze-runner', title: 'Mini Maze Runner', emoji: '🌀', mode: 'maze', difficulty: 'Sederhana', objective: 'Cari jalan ke bintang.', instruction: 'Tap arah untuk bawa watak ke bintang.', reward: 'Maze clear confetti' },
    { id: 'hidden-object', title: 'Hidden Object Hunt', emoji: '🕵️', mode: 'hidden_object', difficulty: 'Sederhana', objective: 'Fokus mencari objek tersembunyi.', instruction: 'Cari objek sasaran.', target: '⭐', items: ['🍎', '⭐', '🐱', '⚽'], reward: 'Detective badge' },
    { id: 'reaction-tap', title: 'Reaction Speed Tap', emoji: '⚡', mode: 'reaction_speed', difficulty: 'Sukar', objective: 'Latih refleks dan fokus.', instruction: 'Tekan Mula, tunggu perkataan TAP muncul, kemudian tekan secepat mungkin.', reward: 'Speed medal' },
  ]},
  { id: 'islamic_learning', title: 'Islamic Learning', emoji: '🌙', color: 'from-teal-500 to-emerald-400', objective: 'Adab, doa dan nilai Islam.', games: [
    { id: 'adab-story-choice', title: 'Adab Story Choice', emoji: '📖', mode: 'story', difficulty: 'Mudah', objective: 'Pilih adab yang baik.', instruction: 'Bantu watak pilih tindakan baik.', scenes: [{ text: 'Ali mahu makan.', choices: ['Baca Bismillah', 'Terus makan'], answer: 0 }, { text: 'Jumpa guru di sekolah.', choices: ['Beri salam', 'Lari pergi'], answer: 0 }], reward: 'Good adab star' },
    { id: 'wuduk-sequence', title: 'Wuduk Sequence', emoji: '💧', mode: 'sequence', difficulty: 'Sederhana', objective: 'Susun langkah wuduk asas.', instruction: 'Tap langkah mengikut turutan.', items: ['Basuh muka', 'Niat', 'Basuh tangan', 'Sapu kepala'], answer: ['Niat', 'Basuh muka', 'Basuh tangan', 'Sapu kepala'], reward: 'Water sparkle' },
    { id: 'doa-coloring', title: 'Doa & Adab Quiz', emoji: '🤲', mode: 'true_false', difficulty: 'Mudah', objective: 'Fahami doa dan adab harian.', instruction: 'Baca ayat, kemudian pilih Betul atau Salah.', statements: [{ text: 'Kita membaca Bismillah sebelum makan.', answer: true }, { text: 'Kita menjerit ketika orang sedang berdoa.', answer: false }, { text: 'Kita mengucapkan Alhamdulillah selepas mendapat nikmat.', answer: true }], reward: 'Good adab star' },
  ]},
];

export function findMiniCategory(id) {
  return MINI_GAME_CATEGORIES.find(category => category.id === id) || MINI_GAME_CATEGORIES[0];
}

export function findMiniGame(categoryId, gameId) {
  const category = findMiniCategory(categoryId);
  return { category, game: category.games.find(game => game.id === gameId) || category.games[0] };
}