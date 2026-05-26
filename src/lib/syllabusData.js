// Silibus rujukan KSPK (Prasekolah) & KSSR (Darjah 1-6)
// Sumber: Bahagian Pembangunan Kurikulum, Kementerian Pendidikan Malaysia (KPM)
// Nota: Ini adalah RINGKASAN STRUKTUR untuk rujukan ibu bapa & cikgu.
// Untuk DSKP rasmi penuh, sila rujuk: https://www.moe.gov.my

export const KSPK_TUNJANG = [
  {
    id: 'komunikasi',
    name: 'Komunikasi',
    emoji: '💬',
    color: 'from-blue-500 to-cyan-500',
    parentSummary: 'Anak belajar bercakap, mendengar, membaca dan menulis dalam Bahasa Melayu, English, dan boleh juga Bahasa Cina/Tamil.',
    teacherSummary: 'Tunjang Komunikasi menggabungkan kemahiran berbahasa secara lisan dan bukan lisan dalam Bahasa Melayu, Bahasa Inggeris, Bahasa Cina dan Bahasa Tamil.',
    topics: [
      { name: 'Bahasa Melayu', desc: 'Kemahiran mendengar & bertutur, membaca, menulis, seni bahasa' },
      { name: 'Bahasa Inggeris', desc: 'Listening & speaking, reading, writing, language arts' },
      { name: 'Bahasa Cina (SJKC)', desc: 'Kemahiran lisan, membaca tulisan Cina, menulis' },
      { name: 'Bahasa Tamil (SJKT)', desc: 'Kemahiran lisan, membaca, menulis Tamil' },
    ],
  },
  {
    id: 'kerohanian',
    name: 'Kerohanian, Sikap & Nilai',
    emoji: '🕌',
    color: 'from-emerald-500 to-teal-500',
    parentSummary: 'Anak belajar nilai murni, akhlak, dan agama (Pendidikan Islam untuk Muslim, Pendidikan Moral untuk bukan Muslim).',
    teacherSummary: 'Tunjang Kerohanian, Sikap dan Nilai memberi fokus kepada pemupukan nilai murni, sikap positif, dan amalan agama.',
    topics: [
      { name: 'Pendidikan Islam', desc: 'Akidah, Ibadah, Sirah, Akhlak, Jawi, Al-Quran' },
      { name: 'Pendidikan Moral', desc: 'Nilai murni & sikap positif untuk bukan Islam' },
    ],
  },
  {
    id: 'kemanusiaan',
    name: 'Kemanusiaan',
    emoji: '🌍',
    color: 'from-amber-500 to-orange-500',
    parentSummary: 'Anak kenal diri sendiri, keluarga, masyarakat, negara Malaysia, dan alam sekeliling.',
    teacherSummary: 'Tunjang Kemanusiaan mendedahkan murid kepada konsep diri, keluarga, masyarakat, alam sekitar, warisan dan kewarganegaraan.',
    topics: [
      { name: 'Diri Saya', desc: 'Mengenali diri, anggota badan, perasaan' },
      { name: 'Keluarga & Masyarakat', desc: 'Ahli keluarga, jiran, peraturan sosial' },
      { name: 'Malaysiaku', desc: 'Negara, bendera, lagu kebangsaan, perayaan' },
      { name: 'Alam Sekitar', desc: 'Tumbuhan, haiwan, cuaca, penjagaan alam' },
    ],
  },
  {
    id: 'fizikal',
    name: 'Fizikal & Estetika',
    emoji: '🏃',
    color: 'from-rose-500 to-pink-500',
    parentSummary: 'Anak bergerak aktif, jaga kesihatan, dan luahkan kreativiti melalui seni, muzik & lukisan.',
    teacherSummary: 'Tunjang Fizikal dan Estetika merangkumi Pendidikan Jasmani, Kesihatan, Seni Visual dan Muzik.',
    topics: [
      { name: 'Pendidikan Jasmani', desc: 'Kemahiran motor kasar & halus, permainan' },
      { name: 'Pendidikan Kesihatan', desc: 'Kebersihan diri, makanan sihat, keselamatan' },
      { name: 'Seni Visual', desc: 'Melukis, mewarna, kolaj, kraf tangan' },
      { name: 'Muzik & Pergerakan', desc: 'Nyanyian, irama, tarian kreatif' },
    ],
  },
  {
    id: 'sains_teknologi',
    name: 'Sains & Teknologi',
    emoji: '🔬',
    color: 'from-violet-500 to-purple-600',
    parentSummary: 'Anak meneroka sains awal — haiwan, tumbuhan, cuaca, dan mula belajar nombor & bentuk.',
    teacherSummary: 'Tunjang Sains dan Teknologi membangunkan kemahiran inkuiri, pemikiran saintifik, awal matematik dan literasi digital asas.',
    topics: [
      { name: 'Awal Sains', desc: 'Pemerhatian, eksperimen mudah, alam hidupan' },
      { name: 'Awal Matematik', desc: 'Nombor 0-10, bentuk, saiz, corak, ukuran asas' },
      { name: 'Teknologi Maklumat', desc: 'Pengenalan asas peralatan teknologi' },
    ],
  },
  {
    id: 'kreativiti',
    name: 'Ketrampilan Diri',
    emoji: '✨',
    color: 'from-yellow-500 to-amber-500',
    parentSummary: 'Anak belajar yakin diri, berdikari, berkawan, dan kreatif menyelesaikan masalah.',
    teacherSummary: 'Tunjang Ketrampilan Diri memupuk kemahiran sosioemosi, kreativiti, inovasi, kepimpinan dan kemahiran berfikir.',
    topics: [
      { name: 'Sosioemosi', desc: 'Pengurusan emosi, kerjasama, empati' },
      { name: 'Kreativiti & Inovasi', desc: 'Pemikiran kreatif, penyelesaian masalah' },
      { name: 'Kepimpinan & Sahsiah', desc: 'Disiplin, tanggungjawab, keyakinan diri' },
    ],
  },
];

// KSSR Darjah 1-6 — Struktur subjek teras & elektif mengikut KPM
// Setiap darjah ada subjek yang sama, dengan topik berkembang mengikut tahap

const buildBM = (darjah) => ({
  emoji: '🇲🇾',
  color: 'from-blue-500 to-indigo-600',
  parentSummary: `Anak belajar membaca, menulis dan bercakap Bahasa Melayu dengan lebih lancar. Termasuk tatabahasa, karangan, dan kefahaman.`,
  teacherSummary: 'Standard Kurikulum Bahasa Melayu — Kemahiran Mendengar & Bertutur, Membaca, Menulis, Seni Bahasa, dan Tatabahasa.',
  topics: [
    { name: 'Mendengar & Bertutur', desc: 'Sebutan, intonasi, perbualan' },
    { name: 'Membaca', desc: darjah <= 2 ? 'Suku kata, perkataan, ayat mudah' : 'Petikan, kefahaman, pemahaman teks' },
    { name: 'Menulis', desc: darjah <= 2 ? 'Tulisan berangkai, ayat mudah' : darjah <= 4 ? 'Karangan pendek, ulasan' : 'Karangan panjang, surat, laporan' },
    { name: 'Tatabahasa', desc: darjah <= 2 ? 'Kata nama, kata kerja asas' : 'Imbuhan, kata sendi, ayat majmuk' },
    { name: 'Seni Bahasa', desc: 'Pantun, sajak, peribahasa, lagu' },
  ],
});

const buildBI = (darjah) => ({
  emoji: '🇬🇧',
  color: 'from-emerald-500 to-green-600',
  parentSummary: `Anak belajar English untuk membaca, menulis, dan bercakap. Bermula dari perkataan asas ke ayat yang lebih kompleks.`,
  teacherSummary: 'English Language Curriculum (CEFR-aligned) — Listening, Speaking, Reading, Writing, Language Arts.',
  topics: [
    { name: 'Listening', desc: 'Understand spoken English, follow instructions' },
    { name: 'Speaking', desc: darjah <= 2 ? 'Simple words, greetings' : 'Conversations, presentations' },
    { name: 'Reading', desc: darjah <= 2 ? 'Phonics, sight words, short sentences' : 'Comprehension, stories, articles' },
    { name: 'Writing', desc: darjah <= 2 ? 'Letters, simple sentences' : darjah <= 4 ? 'Paragraphs, descriptions' : 'Essays, letters, reports' },
    { name: 'Language Arts', desc: 'Rhymes, poems, songs, drama' },
  ],
});

const buildMath = (darjah) => ({
  emoji: '🔢',
  color: 'from-purple-500 to-violet-600',
  parentSummary: `Anak belajar nombor, kira-kira, geometri, dan menyelesaikan masalah matematik harian.`,
  teacherSummary: 'Standard Kurikulum Matematik — Nombor & Operasi, Sukatan & Geometri, Statistik & Kebarangkalian.',
  topics: [
    { name: 'Nombor & Operasi', desc: darjah === 1 ? 'Nombor 0-100, tambah & tolak' : darjah === 2 ? 'Nombor 1000, darab & bahagi asas' : darjah === 3 ? 'Nombor 10,000, operasi 4 asas' : darjah === 4 ? 'Pecahan, perpuluhan' : darjah === 5 ? 'Peratus, nisbah' : 'Integer, perpuluhan, peratus lanjutan' },
    { name: 'Sukatan & Geometri', desc: darjah <= 2 ? 'Panjang, jisim, isi padu asas' : darjah <= 4 ? 'Perimeter, luas, isi padu' : 'Luas permukaan, sudut, simetri' },
    { name: 'Wang & Masa', desc: 'Mata wang Malaysia, jam, kalendar' },
    { name: 'Statistik', desc: darjah <= 3 ? 'Piktograf mudah' : 'Carta palang, carta pai, purata' },
    { name: 'Penyelesaian Masalah', desc: 'Soalan cerita & aplikasi harian' },
  ],
});

const buildSains = (darjah) => ({
  emoji: '🔬',
  color: 'from-cyan-500 to-blue-600',
  parentSummary: `Anak meneroka alam — manusia, haiwan, tumbuhan, bumi, dan sains fizikal melalui eksperimen.`,
  teacherSummary: 'Standard Kurikulum Sains — Kemahiran Proses Sains, Sains Hayat, Sains Fizikal, Sains Bahan, Bumi & Sains Angkasa, Teknologi.',
  topics: [
    { name: 'Sains Hayat', desc: 'Manusia, haiwan, tumbuhan, habitat' },
    { name: 'Sains Fizikal', desc: darjah <= 3 ? 'Cahaya, bunyi, magnet asas' : 'Daya, tenaga, elektrik' },
    { name: 'Sains Bahan', desc: 'Sifat bahan, keadaan jirim' },
    { name: 'Bumi & Angkasa', desc: 'Cuaca, bumi, bulan, matahari, sistem suria' },
    { name: 'Teknologi & Kelestarian', desc: 'Reka cipta mudah, kitar semula' },
  ],
});

const buildPI = () => ({
  emoji: '🕌',
  color: 'from-emerald-500 to-teal-600',
  parentSummary: 'Anak Muslim belajar Akidah, Ibadah, Al-Quran, Sirah Nabi, Akhlak dan Jawi.',
  teacherSummary: 'Standard Kurikulum Pendidikan Islam — Al-Quran, Hadis, Akidah, Ibadah, Sirah, Akhlak, Adab, Jawi.',
  topics: [
    { name: 'Al-Quran', desc: 'Bacaan, hafazan surah lazim' },
    { name: 'Akidah', desc: 'Rukun Iman, sifat Allah' },
    { name: 'Ibadah', desc: 'Wuduk, solat, puasa' },
    { name: 'Sirah Rasulullah', desc: 'Kisah Nabi Muhammad SAW' },
    { name: 'Akhlak & Adab', desc: 'Adab harian, akhlak mulia' },
    { name: 'Jawi', desc: 'Tulisan Jawi, ejaan, bacaan' },
  ],
});

const buildPM = () => ({
  emoji: '💖',
  color: 'from-pink-500 to-rose-600',
  parentSummary: 'Untuk anak bukan Islam — belajar nilai murni, akhlak, dan tanggungjawab sebagai rakyat Malaysia.',
  teacherSummary: 'Standard Kurikulum Pendidikan Moral — Nilai murni, sikap dan amalan dalam konteks Malaysia.',
  topics: [
    { name: 'Nilai Diri', desc: 'Kepercayaan kepada Tuhan, hormat-menghormati' },
    { name: 'Nilai Kekeluargaan', desc: 'Kasih sayang, tanggungjawab keluarga' },
    { name: 'Nilai Alam Sekitar', desc: 'Memelihara alam sekitar' },
    { name: 'Nilai Patriotik', desc: 'Cinta akan negara, perpaduan' },
    { name: 'Nilai Hak Asasi', desc: 'Keadilan, kebebasan, kasih sayang' },
  ],
});

const buildSejarah = (darjah) => ({
  emoji: '📜',
  color: 'from-amber-600 to-orange-700',
  parentSummary: `Anak Darjah ${darjah} belajar sejarah Malaysia — tokoh, peristiwa penting, dan warisan negara.`,
  teacherSummary: 'Standard Kurikulum Sejarah (Darjah 4-6) — Kemahiran Pemikiran Sejarah, Tokoh Negara, Sejarah Tanah Air.',
  topics: [
    { name: 'Sejarah Diri & Keluarga', desc: 'Asal usul, sejarah keluarga' },
    { name: 'Tokoh Kebangsaan', desc: 'Tunku Abdul Rahman, tokoh perjuangan' },
    { name: 'Zaman Kesultanan Melayu', desc: 'Kesultanan Melayu Melaka' },
    { name: 'Kemerdekaan Malaysia', desc: 'Perjuangan menuju 31 Ogos 1957' },
    { name: 'Warisan Negara', desc: 'Lambang, lagu, peristiwa penting' },
  ],
});

const buildPJK = () => ({
  emoji: '⚽',
  color: 'from-red-500 to-orange-500',
  parentSummary: 'Anak bergerak aktif, main sukan, dan belajar jaga kesihatan diri.',
  teacherSummary: 'Standard Kurikulum Pendidikan Jasmani & Kesihatan — Kemahiran pergerakan, kecergasan, kesihatan diri & sosial.',
  topics: [
    { name: 'Kemahiran Pergerakan', desc: 'Lari, lompat, baling, tangkap' },
    { name: 'Kecergasan Fizikal', desc: 'Daya tahan, kekuatan, kelenturan' },
    { name: 'Sukan & Permainan', desc: 'Bola, badminton, gimnastik asas' },
    { name: 'Kesihatan Diri', desc: 'Pemakanan, kebersihan, keselamatan' },
  ],
});

const buildSeni = () => ({
  emoji: '🎨',
  color: 'from-fuchsia-500 to-pink-500',
  parentSummary: 'Anak luah kreativiti melalui lukisan, kraf, dan reka bentuk.',
  teacherSummary: 'Standard Kurikulum Pendidikan Seni Visual — Bahasa Seni Visual, Apresiasi, Aplikasi & Ekspresi Kreatif.',
  topics: [
    { name: 'Menggambar', desc: 'Lukisan, catan, lakaran' },
    { name: 'Membuat Corak', desc: 'Corak terancang & tidak terancang' },
    { name: 'Membentuk & Membuat Binaan', desc: 'Arca, model, kraf' },
    { name: 'Kraf Tradisional', desc: 'Batik, tekat, wau, songket' },
  ],
});

const buildMuzik = () => ({
  emoji: '🎵',
  color: 'from-indigo-500 to-violet-500',
  parentSummary: 'Anak nyanyi, main alat muzik mudah, dan kenal irama.',
  teacherSummary: 'Standard Kurikulum Pendidikan Muzik — Pengalaman muzikal, penghasilan muzik, apresiasi muzik.',
  topics: [
    { name: 'Nyanyian', desc: 'Lagu kanak-kanak, lagu patriotik' },
    { name: 'Permainan Alat Muzik', desc: 'Perkusi, rekoder' },
    { name: 'Pergerakan Kreatif', desc: 'Tarian mengikut irama' },
    { name: 'Apresiasi Muzik', desc: 'Mendengar pelbagai jenis muzik' },
  ],
});

const buildRBT = () => ({
  emoji: '🔧',
  color: 'from-slate-500 to-gray-600',
  parentSummary: 'Anak Darjah 4-6 belajar reka cipta, teknologi mudah, dan kemahiran hidup.',
  teacherSummary: 'Standard Kurikulum Reka Bentuk & Teknologi — Organisasi & Pengurusan, Reka Bentuk, Penghasilan Projek, Teknologi Pertanian, Sains Rumah Tangga, TMK.',
  topics: [
    { name: 'Reka Bentuk', desc: 'Lakaran, model 3D, idea kreatif' },
    { name: 'Penghasilan Projek', desc: 'Membina projek mudah dari pelbagai bahan' },
    { name: 'Teknologi Pertanian', desc: 'Tanaman, ternakan asas' },
    { name: 'Sains Rumah Tangga', desc: 'Memasak, jahitan asas' },
    { name: 'Teknologi Maklumat (TMK)', desc: 'Komputer, perisian asas' },
  ],
});

const buildBahasaTambahan = (bahasa) => ({
  emoji: bahasa === 'Cina' ? '🏮' : bahasa === 'Tamil' ? '🌺' : '✍️',
  color: bahasa === 'Cina' ? 'from-red-500 to-orange-500' : bahasa === 'Tamil' ? 'from-rose-500 to-pink-500' : 'from-teal-500 to-cyan-500',
  parentSummary: `Anak belajar Bahasa ${bahasa} — membaca, menulis, dan bercakap.`,
  teacherSummary: `Standard Kurikulum Bahasa ${bahasa} — Kemahiran Mendengar & Bertutur, Membaca, Menulis, Aspek Seni Bahasa.`,
  topics: [
    { name: 'Mendengar & Bertutur', desc: 'Sebutan dan perbualan asas' },
    { name: 'Membaca', desc: 'Huruf, perkataan, ayat' },
    { name: 'Menulis', desc: 'Tulisan, karangan mudah' },
    { name: 'Seni Bahasa', desc: 'Sajak, lagu, peribahasa' },
  ],
});

// Build all 6 darjah
export const KSSR_DARJAH = [1, 2, 3, 4, 5, 6].map((d) => ({
  id: `darjah_${d}`,
  darjah: d,
  label: `Darjah ${d}`,
  ageRange: `${d + 6}-${d + 7} tahun`,
  subjects: [
    { id: 'bahasa_melayu', name: 'Bahasa Melayu', ...buildBM(d) },
    { id: 'english', name: 'Bahasa Inggeris (English)', ...buildBI(d) },
    { id: 'mathematics', name: 'Matematik', ...buildMath(d) },
    { id: 'science', name: 'Sains', ...buildSains(d) },
    { id: 'pendidikan_islam', name: 'Pendidikan Islam', ...buildPI() },
    { id: 'pendidikan_moral', name: 'Pendidikan Moral', ...buildPM() },
    ...(d >= 4 ? [{ id: 'sejarah', name: 'Sejarah', ...buildSejarah(d) }] : []),
    { id: 'pjk', name: 'Pendidikan Jasmani & Kesihatan', ...buildPJK() },
    { id: 'seni', name: 'Pendidikan Seni Visual', ...buildSeni() },
    { id: 'muzik', name: 'Pendidikan Muzik', ...buildMuzik() },
    ...(d >= 4 ? [{ id: 'rbt', name: 'Reka Bentuk & Teknologi (RBT)', ...buildRBT() }] : []),
    { id: 'jawi', name: 'Jawi', emoji: '✍️', color: 'from-teal-500 to-cyan-500', parentSummary: 'Anak Muslim belajar tulisan Jawi sebagai sebahagian dari Pendidikan Islam.', teacherSummary: 'Tulisan Jawi diajar dalam komponen Pendidikan Islam.', topics: [{ name: 'Huruf Jawi', desc: 'Mengenal & menulis huruf' }, { name: 'Suku kata Jawi', desc: 'Membaca & menulis suku kata' }, { name: 'Perkataan & Ayat', desc: 'Ayat mudah dalam Jawi' }] },
    { id: 'bahasa_cina', name: 'Bahasa Cina (SJKC)', ...buildBahasaTambahan('Cina') },
    { id: 'bahasa_tamil', name: 'Bahasa Tamil (SJKT)', ...buildBahasaTambahan('Tamil') },
  ],
}));

export const SYLLABUS_INFO = {
  kspk: {
    fullName: 'Kurikulum Standard Prasekolah Kebangsaan (KSPK)',
    forAge: '4-6 tahun',
    lastUpdated: 'Semakan 2017',
    description: 'KSPK adalah kurikulum rasmi prasekolah Malaysia yang disusun berdasarkan 6 Tunjang Pembelajaran. Fokus kepada perkembangan menyeluruh kanak-kanak.',
  },
  kssr: {
    fullName: 'Kurikulum Standard Sekolah Rendah (KSSR)',
    forAge: '7-12 tahun (Darjah 1-6)',
    lastUpdated: 'Semakan 2017',
    description: 'KSSR adalah kurikulum rasmi sekolah rendah Malaysia. Disusun berdasarkan Dokumen Standard Kurikulum & Pentaksiran (DSKP) yang dikeluarkan KPM.',
  },
  source: 'Bahagian Pembangunan Kurikulum, Kementerian Pendidikan Malaysia',
  sourceUrl: 'https://www.moe.gov.my',
};