// Hand-crafted mini game blueprints — content guaranteed bersih, no LLM.
// Setiap blueprint: 3 mini games per kategori × 8 kategori = 24 unique games.
// Content tema Malaysia (haiwan, makanan, sukan, KSSR vocab) — pendidikan + menarik.

export const MINI_GAME_CATEGORIES = [
  // ─────────────────────────────────────────────────────────────────
  // 1. MEMORY MASTER — ingatan + recall
  // ─────────────────────────────────────────────────────────────────
  { id: 'memory_master', title: 'Memory Master', emoji: '🧠', color: 'from-violet-500 to-purple-500', objective: 'Latih ingatan visual, fokus dan recall pantas.', games: [
    {
      id: 'haiwan-memory',
      title: 'Padan Haiwan',
      emoji: '🐯',
      mode: 'memory',
      difficulty: 'Mudah',
      objective: 'Padankan haiwan dengan namanya.',
      instruction: 'Flip kad dan cari pasangan haiwan yang sama.',
      pairs: [['🐯', 'Harimau'], ['🐘', 'Gajah'], ['🦁', 'Singa'], ['🐒', 'Monyet'], ['🐢', 'Kura-kura'], ['🦋', 'Rama-rama']],
      reward: 'Memory streak',
    },
    {
      id: 'cari-buah',
      title: 'Cari Buah Tersembunyi',
      emoji: '🍎',
      mode: 'hidden_object',
      difficulty: 'Sederhana',
      objective: 'Cari buah sasaran dengan fokus.',
      instruction: 'Cari buah yang ditunjukkan secepat mungkin.',
      target: '🍎',
      items: [
        { text: '🍌', value: 'pisang' },
        { text: '🍎', value: 'epal' },
        { text: '🍇', value: 'anggur' },
        { text: '🍊', value: 'oren' },
        { text: '🍓', value: 'strawberi' },
        { text: '🍉', value: 'tembikai' },
      ],
      reward: 'Focus badge',
    },
    {
      id: 'turutan-warna',
      title: 'Ingat Turutan Warna',
      emoji: '🌈',
      mode: 'sequence',
      difficulty: 'Sukar',
      objective: 'Ingat urutan warna.',
      instruction: 'Tekan warna mengikut urutan yang ditunjukkan.',
      items: ['🔴 Merah', '🟡 Kuning', '🔵 Biru', '🟢 Hijau'],
      answer: ['🔴 Merah', '🟡 Kuning', '🔵 Biru', '🟢 Hijau'],
      reward: 'Genius combo',
    },
  ]},

  // ─────────────────────────────────────────────────────────────────
  // 2. LOGIC PUZZLES — logik + padanan
  // ─────────────────────────────────────────────────────────────────
  { id: 'logic_puzzles', title: 'Logic Puzzles', emoji: '🧩', color: 'from-blue-500 to-indigo-500', objective: 'Asah logik, padanan dan penyelesaian puzzle.', games: [
    {
      id: 'kelaskan-haiwan',
      title: 'Kelaskan Haiwan',
      emoji: '🦅',
      mode: 'sorting',
      difficulty: 'Mudah',
      objective: 'Asingkan haiwan ikut tempat tinggal.',
      instruction: 'Pilih haiwan, kemudian pilih tempat tinggal yang betul.',
      groups: ['Darat', 'Air', 'Udara'],
      items: [
        { text: '🐯 Harimau', group: 'Darat' },
        { text: '🐘 Gajah', group: 'Darat' },
        { text: '🐟 Ikan', group: 'Air' },
        { text: '🐬 Lumba-lumba', group: 'Air' },
        { text: '🦅 Helang', group: 'Udara' },
        { text: '🦋 Rama-rama', group: 'Udara' },
      ],
      reward: 'Logic star',
    },
    {
      id: 'padan-alat',
      title: 'Padan Alat dan Gunanya',
      emoji: '🔑',
      mode: 'tilematch',
      difficulty: 'Sederhana',
      objective: 'Padankan alat dengan kegunaannya.',
      instruction: 'Cari dua jubin yang berkaitan (alat ↔ guna).',
      tiles: ['Kunci', 'Pintu', 'Pensel', 'Kertas', 'Payung', 'Hujan', 'Sudu', 'Makan'],
      reward: 'Puzzle burst',
    },
    {
      id: 'padan-objek',
      title: 'Padan Objek dengan Tempat',
      emoji: '🎯',
      mode: 'dragdrop',
      difficulty: 'Sederhana',
      objective: 'Padankan objek dengan tempat yang sesuai.',
      instruction: 'Pilih objek, kemudian pilih tempat yang sepadan.',
      items: ['Buku', 'Pinggan', 'Kereta', 'Baju'],
      targets: ['Rak Buku', 'Dapur', 'Garaj', 'Almari'],
      reward: 'Smart solve',
    },
  ]},

  // ─────────────────────────────────────────────────────────────────
  // 3. SPEED FOCUS — refleks + keputusan pantas
  // ─────────────────────────────────────────────────────────────────
  { id: 'speed_focus', title: 'Speed Focus', emoji: '⚡', color: 'from-yellow-400 to-orange-500', objective: 'Latih refleks, fokus mata dan keputusan cepat.', games: [
    {
      id: 'reflex-tap',
      title: 'Tap Pantas',
      emoji: '👆',
      mode: 'reaction_speed',
      difficulty: 'Sukar',
      objective: 'Tekan pada masa yang tepat.',
      instruction: 'Tunggu butang berubah hijau, kemudian tekan secepat mungkin.',
      reward: 'Speed medal',
    },
    {
      id: 'tangkap-bintang',
      title: 'Tangkap Bintang',
      emoji: '⭐',
      mode: 'falling_catch',
      difficulty: 'Mudah',
      objective: 'Tangkap bintang sahaja.',
      instruction: 'Tangkap ⭐ yang jatuh — abaikan yang lain.',
      target: '⭐',
      items: ['⭐', '💎', '⭐', '🌙', '⭐', '☄️', '⭐'],
      reward: 'Catch combo',
    },
    {
      id: 'pop-belon-merah',
      title: 'Pop Belon Merah',
      emoji: '🎈',
      mode: 'balloon_pop',
      difficulty: 'Sederhana',
      objective: 'Pop belon merah sahaja.',
      instruction: 'Pop belon merah — jangan pop yang lain!',
      target: '🔴',
      items: ['🔴', '🔵', '🔴', '🟡', '🟢', '🔴', '🟣'],
      reward: 'Pop streak',
    },
  ]},

  // ─────────────────────────────────────────────────────────────────
  // 4. PATTERN GENIUS — pola + ritma
  // ─────────────────────────────────────────────────────────────────
  { id: 'pattern_genius', title: 'Pattern Genius', emoji: '🔷', color: 'from-cyan-500 to-sky-500', objective: 'Kenal pola, urutan dan ritma.', games: [
    {
      id: 'pola-bentuk',
      title: 'Pola Bentuk',
      emoji: '🔵',
      mode: 'sequence',
      difficulty: 'Sederhana',
      objective: 'Susun pola mengikut turutan.',
      instruction: 'Sambung pola: bulatan, segi tiga, bulatan, segi tiga...',
      items: ['🔵', '🔺', '🔵', '🔺'],
      answer: ['🔵', '🔺', '🔵', '🔺'],
      reward: 'Pattern sparkle',
    },
    {
      id: 'sambung-nombor',
      title: 'Sambung Nombor 1-10',
      emoji: '🔢',
      mode: 'connect_dots',
      difficulty: 'Mudah',
      objective: 'Sambung titik mengikut urutan nombor.',
      instruction: 'Tekan nombor dari 1 hingga 10 mengikut turutan.',
      items: ['1', '2', '3', '4', '5', '6', '7', '8'],
      reward: 'Line glow',
    },
    {
      id: 'ritma-tepuk',
      title: 'Ritma Tepuk Tangan',
      emoji: '👏',
      mode: 'rhythm_tap',
      difficulty: 'Sederhana',
      objective: 'Ikut ritma tepuk tangan.',
      instruction: 'Tekan butang ikut pola: tepuk, tepuk, hentak!',
      items: ['👏 Tepuk', '👏 Tepuk', '🦶 Hentak', '👏 Tepuk', '👏 Tepuk', '🦶 Hentak'],
      reward: 'Rhythm combo',
    },
  ]},

  // ─────────────────────────────────────────────────────────────────
  // 5. MAZE ADVENTURE — laluan + pilihan
  // ─────────────────────────────────────────────────────────────────
  { id: 'maze_adventure', title: 'Maze Adventure', emoji: '🌀', color: 'from-emerald-500 to-teal-500', objective: 'Cari laluan, buat pilihan dan kekalkan fokus.', games: [
    {
      id: 'maze-arnab',
      title: 'Bantu Arnab Cari Lobak',
      emoji: '🐰',
      mode: 'maze',
      difficulty: 'Sederhana',
      objective: 'Bantu arnab sampai ke bintang.',
      instruction: 'Tekan arah untuk gerakkan arnab ke bintang ⭐.',
      reward: 'Maze clear',
    },
    {
      id: 'cari-harta',
      title: 'Cari Harta Karun',
      emoji: '💎',
      mode: 'hidden_object',
      difficulty: 'Mudah',
      objective: 'Cari permata tersembunyi.',
      instruction: 'Cari 💎 antara objek lain.',
      target: '💎',
      items: [
        { text: '⭐', value: 'bintang' },
        { text: '💎', value: 'permata' },
        { text: '🚀', value: 'roket' },
        { text: '🌙', value: 'bulan' },
        { text: '🎁', value: 'hadiah' },
        { text: '👑', value: 'mahkota' },
      ],
      reward: 'Treasure badge',
    },
    {
      id: 'cerita-pilihan',
      title: 'Pilih Tindakan Bijak',
      emoji: '📖',
      mode: 'story',
      difficulty: 'Sederhana',
      objective: 'Pilih keputusan paling bijak.',
      instruction: 'Baca cerita dan pilih tindakan yang terbaik.',
      scenes: [
        { text: 'Ali nampak kawan jatuh basikal. Apa Ali patut buat?', choices: ['Tolong dia bangun', 'Ketawa dan lari', 'Pura-pura tak nampak'], answer: 0 },
        { text: 'Hujan turun. Ibu sedang menjemur baju di luar. Apa kau patut buat?', choices: ['Bantu angkat baju', 'Biarkan saja', 'Tidur'], answer: 0 },
        { text: 'Kau jumpa duit di lantai sekolah. Apa kau patut buat?', choices: ['Ambil dan simpan', 'Hantar ke pejabat guru', 'Bagi kawan'], answer: 1 },
      ],
      reward: 'Adventure star',
    },
  ]},

  // ─────────────────────────────────────────────────────────────────
  // 6. CREATIVE BUILDER — bina + cipta
  // ─────────────────────────────────────────────────────────────────
  { id: 'creative_builder', title: 'Creative Builder', emoji: '🎨', color: 'from-pink-500 to-rose-500', objective: 'Bina, cipta dan susun idea secara kreatif.', games: [
    {
      id: 'warna-pelangi',
      title: 'Warnakan Pelangi',
      emoji: '🌈',
      mode: 'coloring',
      difficulty: 'Mudah',
      objective: 'Lengkapkan aktiviti mewarna.',
      instruction: 'Tekan setiap gambar untuk warnakan.',
      items: ['🌈', '🌸', '🌻', '🎈', '🦋', '🌟'],
      reward: 'Color sticker',
    },
    {
      id: 'bina-menara',
      title: 'Bina Menara KLCC',
      emoji: '🏗️',
      mode: 'stacking',
      difficulty: 'Sederhana',
      objective: 'Bina menara setinggi sasaran.',
      instruction: 'Tekan butang untuk tambah blok sehingga 8 tingkat.',
      target: 8,
      reward: 'Builder sparkle',
    },
    {
      id: 'bina-rumah',
      title: 'Bina Rumah Impian',
      emoji: '🏠',
      mode: 'dragdrop',
      difficulty: 'Sederhana',
      objective: 'Letakkan bahagian rumah di tempat yang betul.',
      instruction: 'Pilih bahagian, kemudian pilih lokasinya.',
      items: ['Bumbung', 'Pintu', 'Tingkap', 'Tangga'],
      targets: ['Atas Rumah', 'Depan Rumah', 'Sebelah Dinding', 'Tengah Rumah'],
      reward: 'Creative burst',
    },
  ]},

  // ─────────────────────────────────────────────────────────────────
  // 7. PROBLEM SOLVER — sebab + akibat
  // ─────────────────────────────────────────────────────────────────
  { id: 'problem_solver', title: 'Problem Solver', emoji: '💡', color: 'from-amber-500 to-yellow-500', objective: 'Selesaikan cabaran sebab-akibat dan pilihan bijak.', games: [
    {
      id: 'betul-salah-sains',
      title: 'Betul atau Salah: Sains',
      emoji: '🔬',
      mode: 'true_false',
      difficulty: 'Mudah',
      objective: 'Nilai fakta sains dengan tepat.',
      instruction: 'Pilih Betul atau Salah untuk setiap fakta.',
      statements: [
        { text: 'Matahari terbit dari arah timur.', answer: true },
        { text: 'Ikan boleh hidup tanpa air.', answer: false },
        { text: 'Air membeku menjadi ais pada suhu sejuk.', answer: true },
        { text: 'Bulan lebih besar daripada matahari.', answer: false },
        { text: 'Pokok perlukan cahaya matahari untuk hidup.', answer: true },
        { text: 'Manusia boleh terbang tanpa pesawat.', answer: false },
      ],
      reward: 'Brain point',
    },
    {
      id: 'mini-makmal',
      title: 'Mini Makmal',
      emoji: '🧪',
      mode: 'mini_simulation',
      difficulty: 'Sederhana',
      objective: 'Pilih bahan ikut sifat.',
      instruction: 'Pilih objek yang terapung di atas air.',
      target: 'Terapung',
      items: [
        { text: 'Kayu', group: 'Terapung' },
        { text: 'Daun', group: 'Terapung' },
        { text: 'Batu', group: 'Tenggelam' },
        { text: 'Besi', group: 'Tenggelam' },
        { text: 'Kapas', group: 'Terapung' },
        { text: 'Syiling', group: 'Tenggelam' },
      ],
      reward: 'Lab zap',
    },
    {
      id: 'fizik-kanak',
      title: 'Fizik untuk Kanak-kanak',
      emoji: '⚙️',
      mode: 'physics',
      difficulty: 'Sukar',
      objective: 'Fikir sebab dan akibat.',
      instruction: 'Pilih jawapan paling tepat.',
      statements: [
        { text: 'Bola lebih mudah bergolek berbanding kotak.', answer: true },
        { text: 'Objek berat jatuh lebih perlahan dari objek ringan.', answer: false },
        { text: 'Magnet menarik kepingan besi.', answer: true },
        { text: 'Cermin boleh memantulkan cahaya.', answer: true },
      ],
      reward: 'Thinker badge',
    },
  ]},

  // ─────────────────────────────────────────────────────────────────
  // 8. BRAIN TRAINING — campuran
  // ─────────────────────────────────────────────────────────────────
  { id: 'brain_training', title: 'Brain Training', emoji: '🏆', color: 'from-fuchsia-500 to-purple-500', objective: 'Latihan campuran untuk fokus, logik dan ketangkasan minda.', games: [
    {
      id: 'padan-warna-nama',
      title: 'Padan Warna dengan Nama',
      emoji: '🎨',
      mode: 'memory',
      difficulty: 'Mudah',
      objective: 'Padankan warna dengan namanya.',
      instruction: 'Flip kad dan cari pasangan warna.',
      pairs: [['🔴', 'Merah'], ['🔵', 'Biru'], ['🟢', 'Hijau'], ['🟡', 'Kuning'], ['🟣', 'Ungu'], ['🟠', 'Jingga']],
      reward: 'Brain streak',
    },
    {
      id: 'mainan-vs-belajar',
      title: 'Mainan atau Alat Belajar?',
      emoji: '👆',
      mode: 'swipe_select',
      difficulty: 'Sederhana',
      objective: 'Bezakan mainan dan alat belajar.',
      instruction: 'Tekan kategori betul untuk setiap item.',
      groups: ['Mainan', 'Alat Belajar'],
      items: [
        { text: 'Bola sepak', group: 'Mainan' },
        { text: 'Buku teks', group: 'Alat Belajar' },
        { text: 'Lego', group: 'Mainan' },
        { text: 'Pensel', group: 'Alat Belajar' },
        { text: 'Boneka', group: 'Mainan' },
        { text: 'Pemadam', group: 'Alat Belajar' },
        { text: 'Yo-yo', group: 'Mainan' },
        { text: 'Buku latihan', group: 'Alat Belajar' },
      ],
      reward: 'Swipe combo',
    },
    {
      id: 'roda-rima',
      title: 'Roda Rima',
      emoji: '🎡',
      mode: 'spin_wheel',
      difficulty: 'Sederhana',
      objective: 'Cari perkataan yang berima.',
      instruction: 'Putar roda dan cari perkataan yang berima dengan "kucing".',
      target: 'kucing',
      items: ['bunting', 'pusing', 'kambing', 'datang', 'kasing'],
      reward: 'Wheel spark',
    },
  ]},
];

export function findMiniCategory(id) {
  return MINI_GAME_CATEGORIES.find(category => category.id === id) || MINI_GAME_CATEGORIES[0];
}

export function findMiniGame(categoryId, gameId) {
  const category = findMiniCategory(categoryId);
  return { category, game: category.games.find(game => game.id === gameId) || category.games[0] };
}