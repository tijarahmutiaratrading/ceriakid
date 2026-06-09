// LAUNCH-READY BATCH GENERATOR
// Generates high-quality games for ONE bucket (ageGroup + darjah + category) at a time
// using premium AI model with strict KSSR-aligned validation.
//
// Designed to be called repeatedly (1 bucket per call) to avoid timeout.
//
// Payload: { ageGroup, darjah, category, targetCount=30, dryRun=false }
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SUBJECT_LABELS = {
  bahasa_melayu: 'Bahasa Melayu',
  english: 'English Language',
  mathematics: 'Mathematics',
  science: 'Science',
  jawi: 'Jawi (Arabic-Malay script)',
  pendidikan_islam: 'Pendidikan Islam (Islamic Studies KSSR)',
  pendidikan_moral: 'Pendidikan Moral (Moral Education KSSR)',
  sejarah: 'Sejarah (History KSSR)',
  rbt: 'Reka Bentuk dan Teknologi (Design & Technology KSSR)',
  pjk: 'Pendidikan Jasmani dan Kesihatan (Physical & Health Education KSSR)',
  seni: 'Pendidikan Seni Visual (Visual Arts KSSR)',
};

const DARJAH_TOPICS = {
  prasekolah: {
    bahasa_melayu: ['Huruf vokal A E I O U', 'Suku kata KV (ba bi bu)', 'Suku kata KVKV (baju, biru)', 'Nama haiwan ternak', 'Nama haiwan liar', 'Nama buah-buahan tempatan', 'Nama sayur-sayuran', 'Warna asas', 'Bentuk asas', 'Anggota badan', 'Ahli keluarga', 'Pakaian harian', 'Alat sekolah', 'Pengangkutan', 'Pekerjaan asas', 'Hari dalam seminggu', 'Cuaca harian', 'Perasaan & emosi', 'Lawan kata mudah (besar/kecil)', 'Eja perkataan 2 suku kata'],
    english: ['Alphabet A-E recognition', 'Alphabet F-J recognition', 'Alphabet K-O recognition', 'Alphabet P-T recognition', 'Alphabet U-Z recognition', 'Numbers 1-5', 'Numbers 6-10', 'Basic colors', 'Shapes', 'Animal names', 'Fruit names', 'Vegetable names', 'Body parts', 'Family members', 'Greetings', 'Days of week', 'Weather words', 'Action verbs', 'Opposites (big/small)', 'Sight words simple'],
    mathematics: ['Counting 1-5', 'Counting 6-10', 'Number recognition', 'Number order', 'Simple addition within 5', 'Simple addition within 10', 'Simple subtraction within 5', 'Simple subtraction within 10', 'Compare more/less', 'Compare size big/small', 'Basic shapes 2D', 'Patterns AB', 'Position (atas/bawah)', 'Match objects to numbers', 'Money coins recognition', 'Time day/night', 'Measurement (panjang/pendek)', 'Even & odd basic', 'Group counting', 'Story sums'],
    science: ['Pancaindera lima', 'Bahagian tubuh manusia', 'Haiwan & habitat', 'Tumbuhan & bahagiannya', 'Cuaca harian', 'Sumber cahaya', 'Sumber bunyi', 'Air & kegunaannya', 'Udara & angin', 'Makanan berkhasiat', 'Kebersihan diri', 'Siang & malam', 'Bayang-bayang', 'Magnet asas', 'Terapung tenggelam', 'Pengangkutan & sumber tenaga', 'Sayur & buah', 'Kitaran hidup rama-rama', 'Kitaran hidup ayam', 'Alam sekitar bersih'],
    jawi: ['Huruf Alif Ba Ta Tha', 'Huruf Jim Ha Kha Dal', 'Huruf Ra Zai Sin Syin', 'Huruf Sod Dod Tho Zho', 'Huruf Ain Ghain Fa Qaf', 'Huruf Kaf Lam Mim Nun', 'Huruf Wau Ha Ya', 'Padan Jawi-Rumi vokal', 'Padan Jawi-Rumi konsonan', 'Suku kata Jawi (با بي بو)', 'Suku kata Jawi (تا تي تو)', 'Perkataan Jawi 2 huruf', 'Perkataan Jawi mudah (ابو، اب)', 'Nama keluarga dalam Jawi', 'Nama haiwan dalam Jawi', 'Nama buah dalam Jawi', 'Nama warna dalam Jawi', 'Angka Jawi 1-10', 'Eja perkataan Jawi mudah', 'Tulis arah Jawi (kanan ke kiri)'],
  },
  darjah_1: {
    bahasa_melayu: ['Suku kata KV+KV', 'Suku kata KVK', 'Perkataan 2 suku kata', 'Perkataan 3 suku kata', 'Sinonim mudah', 'Antonim mudah', 'Kata nama am', 'Kata nama khas', 'Kata kerja asas', 'Kata adjektif warna', 'Imbuhan "me-"', 'Tanda baca titik & koma', 'Ayat tunggal', 'Bina ayat pendek', 'Bacaan & kefahaman pendek', 'Perkataan seerti', 'Perkataan berlawan', 'Peribahasa kanak-kanak', 'Cerita teladan', 'Lagu kanak-kanak'],
    english: ['Phonics short vowels (a, e, i, o, u)', 'CVC words (cat, dog, bus)', 'Sight words (the, is, and)', 'Numbers 1-20 spelling', 'Days of week spelling', 'Months of year', 'Family members extended', 'Plural nouns -s', 'Action verbs present', 'Adjectives for size & color', 'Question words (what, who, where)', 'Articles a/an', 'Simple sentences', 'Reading comprehension short', 'Greetings & introductions', 'Classroom objects', 'Animals & sounds', 'Food & meals', 'Clothes & accessories', 'Weather descriptions'],
    mathematics: ['Numbers up to 100', 'Place value tens & ones', 'Addition within 18', 'Subtraction within 18', 'Number bonds to 10', 'Comparing numbers <, >, =', 'Skip counting 2s, 5s, 10s', 'Money sen & ringgit basic', 'Time o\'clock & half past', 'Days & months order', '2D shapes properties', '3D shapes recognition', 'Length cm', 'Mass kg basic', 'Volume liter basic', 'Patterns extend', 'Ordinal numbers 1st-10th', 'Word problems +', 'Word problems -', 'Data picture graphs'],
    science: ['Living vs non-living things', 'Parts of plants', 'Parts of animals', 'My body parts function', 'Healthy food', 'Five senses application', 'Materials around us', 'Push & pull forces', 'Light sources', 'Sound sources', 'Day & night', 'Weather & seasons (MY)', 'Water cycle basic', 'Air importance', 'Plants need (water, sun, soil)', 'Animals need (food, water, shelter)', 'Safety at home', 'Safety at school', 'Recycling 3R', 'Earth & sky'],
    jawi: ['Huruf Jawi Alif-Tha + sambung', 'Huruf Jawi Jim-Dal + sambung', 'Huruf Jawi Ra-Syin + sambung', 'Huruf Jawi Sod-Zho + sambung', 'Huruf Jawi Ain-Qaf + sambung', 'Huruf Jawi Kaf-Nun + sambung', 'Huruf Jawi Wau-Ya', 'Baris atas (fathah)', 'Baris bawah (kasrah)', 'Baris hadapan (dommah)', 'Suku kata Jawi terbuka', 'Suku kata Jawi tertutup', 'Perkataan Jawi 2 suku', 'Perkataan Jawi 3 suku', 'Eja nama haiwan Jawi', 'Eja nama buah Jawi', 'Eja nama warna Jawi', 'Eja nama anggota keluarga', 'Padan ayat Jawi-Rumi', 'Baca ayat Jawi mudah'],
    // KAFA Darjah 1 — asas paling mudah
    kafa_quran: ['Mengenal huruf hijaiyah Alif Ba Ta', 'Mengenal huruf hijaiyah Tha Jim Ha', 'Mengenal huruf hijaiyah Kha Dal Zal', 'Baris atas fathah pada huruf', 'Baris bawah kasrah pada huruf', 'Baris hadapan dommah pada huruf', 'Hafazan Surah Al-Fatihah ayat 1-3', 'Hafazan Surah Al-Fatihah ayat 4-7', 'Adab membaca Al-Quran', 'Bacaan basmalah & taawuz', 'Mengenal mushaf Al-Quran', 'Surah pendek An-Nas pengenalan'],
    kafa_jawi: ['Huruf Jawi tunggal Alif Ba Ta Tha', 'Huruf Jawi Jim Ca Ha Kha', 'Huruf Jawi Dal Zal Ra Zai', 'Huruf Jawi tambahan (Ca, Nga, Pa, Ga, Nya, Va)', 'Padan Jawi-Rumi huruf tunggal', 'Eja nama sendiri dalam Jawi', 'Eja "saya", "ayah", "ibu" dalam Jawi', 'Nombor 1-10 dalam Jawi', 'Tulis arah Jawi kanan ke kiri', 'Perkataan mudah 2 huruf Jawi'],
    kafa_akidah: ['Rukun Iman 6 perkara pengenalan', 'Beriman kepada Allah SWT', 'Allah Maha Pencipta', 'Allah Maha Mengasihani', 'Allah Maha Melihat dan Mendengar', 'Mengenal nama Allah (Asmaul Husna asas)', 'Beriman kepada Malaikat', 'Tugas Malaikat (Jibril, Mikail, Israfil)', 'Kalimah Syahadah', 'Maksud Lailahaillallah'],
    kafa_ibadah: ['Rukun Islam 5 perkara', 'Rukun Iman 6 perkara', 'Cara berwuduk langkah 1-3', 'Cara berwuduk langkah 4-6', 'Perkara membatalkan wuduk', 'Solat 5 waktu (nama & waktu)', 'Bilangan rakaat solat fardhu', 'Bacaan niat solat', 'Bacaan Al-Fatihah dalam solat', 'Adab masuk masjid'],
    kafa_sirah: ['Nama penuh Nabi Muhammad SAW', 'Tarikh & tempat kelahiran Nabi', 'Nama ayah & ibu Nabi (Abdullah & Aminah)', 'Datuk Nabi (Abdul Muttalib)', 'Bapa saudara Nabi (Abu Talib)', 'Ibu susuan Nabi (Halimah Sa\'diah)', 'Sifat Nabi sebagai Al-Amin', 'Pekerjaan Nabi semasa muda (mengembala)', 'Isteri pertama Nabi (Siti Khadijah)', 'Anak-anak Nabi Muhammad SAW'],
    kafa_adab: ['Adab makan & minum (mulakan bismillah)', 'Adab tidur (doa sebelum tidur)', 'Adab masuk tandas (kaki kiri dulu)', 'Adab keluar tandas (kaki kanan)', 'Adab dengan ibu bapa (cium tangan)', 'Adab di sekolah (hormat guru)', 'Adab memberi salam', 'Adab menjawab salam', 'Adab berkawan (jujur, baik)', 'Adab bercakap (sopan, tidak menjerit)'],
    kafa_bahasa_arab: ['Huruf hijaiyah Arab Alif sampai Jim', 'Huruf hijaiyah Arab Ha sampai Zai', 'Salam: As-salamu alaikum & jawapan', 'Perkataan Arab: ana (saya), anta (kamu)', 'Nama keluarga Arab: abi (ayah), ummi (ibu)', 'Bilangan Arab 1-5 (wahid, ithnan, thalatha, arba\'a, khamsa)', 'Warna Arab: ahmar (merah), asfar (kuning)', 'Haiwan Arab: qittun (kucing), kalbun (anjing)', 'Anggota badan: ra\'s (kepala), yad (tangan)', 'Buah Arab: tuffah (epal), mawz (pisang)'],
    // Pendidikan Islam KSSR Darjah 1
    pendidikan_islam: ['Rukun Islam lima perkara', 'Rukun Iman enam perkara', 'Kalimah Syahadah & maksud', 'Mengenal Allah sebagai Pencipta', 'Nama-nama Allah (Ar-Rahman, Ar-Rahim)', 'Cara berwuduk asas', 'Nama solat lima waktu', 'Bilangan rakaat solat fardhu', 'Bacaan Al-Fatihah', 'Adab makan & minum (bismillah)', 'Adab dengan ibu bapa', 'Doa sebelum & selepas makan', 'Doa sebelum tidur', 'Mengenal huruf hijaiyah Alif Ba Ta', 'Surah Al-Fatihah hafazan', 'Nabi Muhammad SAW (nama & keluarga)', 'Kebersihan diri dalam Islam', 'Adab memberi salam', 'Sifat jujur & amanah', 'Bismillah dalam kehidupan harian'],
    pendidikan_moral: ['Nilai baik hati (membantu kawan)', 'Nilai hormat kepada ibu bapa', 'Nilai kasih sayang dalam keluarga', 'Nilai bertanggungjawab di rumah', 'Nilai jujur (bercakap benar)', 'Nilai kebersihan diri', 'Nilai rajin belajar', 'Nilai berterima kasih', 'Nilai bekerjasama', 'Nilai sederhana (tidak membazir)', 'Nilai berdikari', 'Nilai keberanian', 'Adab di sekolah', 'Adab dengan guru', 'Menjaga harta sekolah', 'Bersopan santun', 'Menyayangi haiwan', 'Menjaga alam sekitar', 'Bertegur sapa', 'Memberi & menerima maaf'],
    rbt: ['Mengenal alatan tangan asas', 'Bahan semula jadi & buatan', 'Cara guna gunting dengan selamat', 'Mengenal warna & bentuk reka bentuk', 'Asas melipat kertas (origami mudah)', 'Menanam benih (pertanian asas)', 'Menjaga tumbuhan', 'Mengenal alatan dapur', 'Keselamatan di dapur', 'Mengemas alatan selepas guna', 'Asas menjahit (jahitan mudah)', 'Mengenal komputer & tablet', 'Bahagian komputer asas', 'Mereka bentuk kad mudah', 'Mengitar semula bahan', 'Membuat kraf dari bahan terpakai', 'Mengukur dengan pembaris', 'Menampal & melekat', 'Mengenal mesin mudah (gear, takal)', 'Kebersihan ruang kerja'],
    pjk: ['Pergerakan asas (berjalan, berlari)', 'Melompat & melonjak', 'Membaling & menyambut bola', 'Mengimbang badan', 'Senaman memanaskan badan', 'Kepentingan bersenam', 'Makanan berkhasiat', 'Kebersihan diri (mandi, gosok gigi)', 'Tidur yang cukup', 'Minum air secukupnya', 'Keselamatan semasa bermain', 'Anggota badan & fungsi', 'Pancaindera lima', 'Postur badan yang betul', 'Mencuci tangan dengan betul', 'Bahaya benda tajam', 'Pengurusan emosi asas', 'Permainan tradisional', 'Regangan otot mudah', 'Rehat & aktiviti seimbang'],
    seni: ['Warna primer (merah, biru, kuning)', 'Warna sekunder (hijau, oren, ungu)', 'Mengenal garisan (lurus, beralun)', 'Bentuk asas (bulat, segi empat)', 'Melukis objek mudah', 'Mewarna dalam garisan', 'Corak berulang mudah', 'Kolaj kertas warna', 'Cap jari & cap tangan', 'Mengenal tekstur (kasar, licin)', 'Lipatan kertas (origami)', 'Membuat topeng mudah', 'Melukis pemandangan', 'Seni dari bahan semula jadi (daun)', 'Membentuk dengan tanah liat', 'Mengenal seni budaya Malaysia (batik)', 'Membuat kad ucapan', 'Lukisan keluarga', 'Warna panas & sejuk', 'Menghias bentuk dengan corak'],
  },
  darjah_2: {
    bahasa_melayu: ['Diftong (ai, au, oi)', 'Konsonan bergabung (ng, ny, sy)', 'Imbuhan awalan "me-, ber-, ter-"', 'Imbuhan akhiran "-an, -kan"', 'Kata ganti nama diri', 'Kata bilangan', 'Kata sendi nama', 'Ayat penyata', 'Ayat tanya', 'Ayat perintah', 'Penanda wacana asas', 'Karangan 3 ayat', 'Membaca petikan pendek', 'Sinonim & antonim luas', 'Peribahasa mudah', 'Sajak kanak-kanak', 'Surat tidak rasmi', 'Iklan ringkas', 'Tanda baca tanda tanya & seru', 'Cerita rakyat ringkas'],
    english: ['Long vowels (ai, ee, oa)', 'Blends (st, br, gr, pl)', 'Digraphs (sh, ch, th, wh)', 'Sight words extended', 'Verb tenses past simple', 'Plural irregular', 'Pronouns I, you, he, she, we, they', 'Possessive pronouns', 'Prepositions (in, on, under, behind)', 'Adjectives comparison', 'Wh-questions extended', 'Simple paragraph', 'Reading short stories', 'Story sequence', 'Punctuation full stop, comma, ?, !', 'Capital letters rules', 'Conjunctions and, but, or', 'Time telling words', 'Days, months, dates writing', 'Letter writing informal'],
    mathematics: ['Numbers up to 1000', 'Place value H, T, O', 'Addition with regrouping', 'Subtraction with regrouping', 'Multiplication tables 2, 3, 4, 5, 10', 'Division as sharing', 'Fractions halves & quarters', 'Money RM & sen calculation', 'Time quarter past & to', 'Calendar days, weeks, months', '2D shapes sides & corners', '3D shapes faces, edges', 'Length m, cm conversion', 'Mass g, kg', 'Volume ml, l', 'Perimeter basic', 'Patterns number & shape', 'Bar graphs read', 'Pictograms read', 'Word problems mixed'],
    science: ['Life processes basic', 'Classification of animals', 'Classification of plants', 'Habitats (sea, land, air)', 'Food chain simple', 'Healthy lifestyle', 'States of matter (solid, liquid, gas)', 'Changes of state ice/water/steam', 'Floating & sinking', 'Magnets attract repel', 'Sources of light reflection', 'Sources of sound vibration', 'Earth, sun, moon', 'Seasons & climate MY', 'Pollution & environment', 'Recycling materials', 'Energy sources', 'Simple machines lever pulley', 'Animal life cycles butterfly frog', 'Plant life cycle seed to plant'],
    jawi: ['Huruf Jawi tunggal lengkap (37)', 'Cara sambung huruf Jawi', 'Huruf yang tidak boleh disambung selepasnya', 'Baris atas, bawah, hadapan lanjutan', 'Sukun (tanda mati)', 'Syaddah (penegas)', 'Perkataan KV+KV Jawi', 'Perkataan KVK Jawi', 'Eja nama sayur Jawi', 'Eja nama pengangkutan Jawi', 'Eja nama tempat Jawi', 'Eja nama pekerjaan Jawi', 'Ayat Jawi 3 perkataan', 'Ayat Jawi 4 perkataan', 'Bacaan petikan Jawi pendek', 'Padan Jawi-Rumi ayat', 'Tulis nama sendiri dalam Jawi', 'Tulis nama keluarga dalam Jawi', 'Doa harian dalam Jawi', 'Surah pendek dalam Jawi'],
    // KAFA Darjah 2
    kafa_quran: ['Huruf hijaiyah Ra Zai Sin Syin', 'Huruf hijaiyah Sod Dod Tho Zho', 'Huruf hijaiyah Ain Ghain Fa Qaf', 'Huruf hijaiyah Kaf Lam Mim Nun Wau Ha Ya', 'Tanda sukun (huruf mati)', 'Hafazan Surah An-Nas', 'Hafazan Surah Al-Falaq', 'Hafazan Surah Al-Ikhlas', 'Adab membaca Al-Quran lanjutan', 'Wajah-wajah huruf hijaiyah (awal, tengah, akhir)'],
    kafa_jawi: ['Huruf Jawi bersambung depan & belakang', 'Eja nama bulan Hijrah dalam Jawi', 'Eja nama hari (Ahad, Isnin, Selasa) Jawi', 'Eja nama negeri Malaysia dalam Jawi', 'Perkataan 3 suku kata Jawi', 'Bacaan ayat Jawi pendek', 'Padan ayat Jawi-Rumi', 'Tulis alamat sendiri dalam Jawi', 'Doa makan dalam Jawi', 'Doa tidur dalam Jawi'],
    kafa_akidah: ['Rukun Iman 6 perkara terperinci', 'Sifat wajib Allah (Wujud, Qidam, Baqa)', 'Sifat mustahil bagi Allah', 'Beriman kepada Kitab-kitab Allah', 'Kitab Taurat, Zabur, Injil, Al-Quran', 'Beriman kepada Rasul-rasul Allah', 'Bilangan Rasul yang wajib diketahui (25)', 'Beriman kepada Hari Akhirat', 'Beriman kepada Qada & Qadar', 'Pengertian Tauhid Rububiyyah & Uluhiyyah'],
    kafa_ibadah: ['Wuduk lengkap dengan sunat-sunatnya', 'Perkara membatalkan wuduk lanjutan', 'Tayammum (ganti wuduk)', 'Syarat sah solat', 'Rukun solat 13 perkara', 'Perkara membatalkan solat', 'Bacaan rukuk & sujud', 'Bacaan tahiyat awal & akhir', 'Solat berjemaah pengenalan', 'Adab dalam masjid'],
    kafa_sirah: ['Nabi Muhammad mendapat wahyu pertama', 'Tempat wahyu pertama (Gua Hira)', 'Malaikat Jibril menyampaikan wahyu', 'Wahyu pertama (Iqra\' bismi rabbik)', 'Dakwah secara sembunyi 3 tahun', 'Para sahabat awal masuk Islam', 'Abu Bakar As-Siddiq sahabat pertama lelaki', 'Khadijah binti Khuwailid isteri & sahabat pertama', 'Ali bin Abi Talib kanak-kanak pertama Islam', 'Penindasan kafir Quraisy ke atas umat Islam awal'],
    kafa_adab: ['Adab di masjid (tidak bercakap kuat)', 'Adab membaca Al-Quran (berwuduk)', 'Adab berdoa (angkat tangan, ikhlas)', 'Adab terhadap jiran', 'Adab terhadap guru di sekolah', 'Adab makan secara berjemaah', 'Adab dalam perjalanan', 'Adab menjaga kebersihan', 'Adab menjaga lidah (tidak mengumpat)', 'Adab membantu rakan'],
    kafa_bahasa_arab: ['Huruf hijaiyah Arab lengkap 28', 'Bilangan Arab 6-10 (sittah, sab\'a, thamaniyah, tis\'a, asyarah)', 'Hari dalam Arab (al-ahad, al-ithnain, al-thulatha)', 'Bulan Hijrah dalam Arab (Muharram, Safar, Rabiul Awal)', 'Anggota keluarga Arab (akhi, ukhti, jaddi)', 'Pekerjaan Arab (mudarris-guru, tabib-doktor)', 'Bahagian rumah Arab (bait-rumah, bab-pintu)', 'Bahagian sekolah (madrasah, kitab, qalam)', 'Soal jawab mudah: ma ismuka? (apa nama kamu?)', 'Perbualan mudah: kaifa haluk? (apa khabar?)'],
    // Pendidikan Islam KSSR Darjah 2
    pendidikan_islam: ['Rukun Islam terperinci', 'Rukun Iman terperinci', 'Syarat sah wuduk', 'Perkara membatalkan wuduk', 'Rukun solat', 'Bacaan dalam rukuk & sujud', 'Bacaan tahiyat', 'Hafazan Surah Al-Ikhlas', 'Hafazan Surah An-Nas', 'Hafazan Surah Al-Falaq', 'Adab masuk & keluar tandas', 'Adab di masjid', 'Doa naik kenderaan', 'Doa masuk rumah', 'Huruf hijaiyah & baris (fathah, kasrah, dommah)', 'Kisah Nabi Adam AS', 'Kisah Nabi Nuh AS', 'Akhlak terpuji: sabar & syukur', 'Adab dengan guru', 'Cara bersuci (istinja)'],
    pendidikan_moral: ['Nilai hormat-menghormati', 'Nilai kasih sayang sesama insan', 'Nilai tanggungjawab terhadap diri', 'Nilai kejujuran dalam tindakan', 'Nilai toleransi', 'Nilai berdikari', 'Nilai hemah tinggi (sopan)', 'Nilai kesyukuran', 'Nilai kerjasama dalam kumpulan', 'Nilai berhemat (jimat)', 'Nilai keberanian membuat keputusan', 'Nilai keadilan', 'Menyayangi keluarga', 'Menghormati jiran', 'Menjaga kebersihan kawasan', 'Menghargai masa', 'Menepati janji', 'Bersikap adil dengan kawan', 'Membantu orang susah', 'Menjaga keselamatan diri'],
    rbt: ['Alatan tangan & kegunaannya', 'Cara guna tukul & pemutar skru', 'Bahan logam, kayu, plastik', 'Reka bentuk produk mudah', 'Lakaran idea produk', 'Menanam sayur di rumah', 'Penjagaan tanaman (siram, baja)', 'Asas memasak (sandwic mudah)', 'Keselamatan dapur lanjutan', 'Jahitan butang', 'Mengenal litar elektrik mudah', 'Bahagian komputer & fungsi', 'Mereka bentuk poster', 'Kraf tangan dari kertas', 'Mengukur panjang & lebar', 'Memotong dengan tepat', 'Mesin mudah: tuas & roda', 'Mengitar semula plastik', 'Membuat bekas dari bahan terpakai', 'Susun atur ruang kerja'],
    pjk: ['Kemahiran lokomotor (skip, galop)', 'Kemahiran bukan lokomotor (pusing, bengkok)', 'Manipulasi bola (tendang, lempar)', 'Imbangan statik & dinamik', 'Senaman regangan', 'Komponen kecergasan asas', 'Piramid makanan', 'Kebersihan gigi & mulut', 'Kepentingan tidur', 'Pengambilan air', 'Keselamatan di padang', 'Sistem tulang & otot asas', 'Penjagaan pancaindera', 'Postur duduk & berdiri', 'Tabiat mencuci tangan', 'Bahaya merokok (kesedaran awal)', 'Mengurus rasa marah', 'Permainan kecil berpasukan', 'Kelenturan badan', 'Aktiviti riadah keluarga'],
    seni: ['Roda warna asas', 'Campuran warna', 'Jenis garisan dalam lukisan', 'Bentuk geometri & organik', 'Lukisan haiwan mudah', 'Teknik mewarna (lorek, gosok)', 'Corak simetri', 'Kolaj bertema', 'Cetakan dari objek', 'Tekstur dalam karya', 'Lipatan & guntingan kertas', 'Membuat patung kertas', 'Lukisan landskap', 'Seni dari bahan alam', 'Membentuk model tanah liat', 'Batik & songket (pengenalan)', 'Kad hari perayaan', 'Potret diri', 'Warna mengikut perasaan', 'Hiasan corak berulang'],
  },
  darjah_3: {
    bahasa_melayu: ['Imbuhan kompleks (memper-, diper-)', 'Kata majmuk', 'Kata ganda', 'Penjodoh bilangan', 'Ayat majmuk gabungan', 'Ayat aktif & pasif', 'Karangan naratif pendek', 'Karangan deskriptif', 'Surat rasmi format', 'Laporan ringkas', 'Iklan kreatif', 'Pantun 4 kerat', 'Sajak bertema', 'Cerpen kanak-kanak', 'Perbahasan pendek', 'Tanda baca lengkap', 'Penanda wacana lanjutan', 'Sinonim & antonim lanjutan', 'Peribahasa Melayu', 'Tatabahasa lengkap'],
    english: ['Verb tenses present, past, future', 'Continuous tense -ing', 'Irregular verbs (go-went, eat-ate)', 'Adverbs of manner, time, place', 'Comparative & superlative adjectives', 'Compound words', 'Synonyms & antonyms', 'Idioms basic', 'Paragraph writing', 'Recount writing', 'Descriptive writing', 'Letter writing formal & informal', 'Email format', 'Reading comprehension intermediate', 'Story plot setting characters', 'Poetry rhyme', 'Dialogue writing', 'Conjunctions because, although, so', 'Direct & indirect speech basic', 'Punctuation apostrophe, quotation marks'],
    mathematics: ['Numbers up to 10,000', 'Place value Th, H, T, O', 'Addition & subtraction 4-digit', 'Multiplication tables 6, 7, 8, 9', 'Long multiplication 2-digit', 'Division by 1-digit', 'Fractions add subtract like', 'Decimals tenths & hundredths', 'Money calculation problems', 'Time hours, minutes, seconds', 'Length m, cm, mm conversion', 'Mass g, kg conversion', 'Volume ml, l conversion', 'Perimeter rectangle, square', 'Area squares & rectangles count', '2D shapes properties detailed', '3D shapes properties detailed', 'Symmetry lines', 'Data tally & bar graphs', 'Word problems multi-step'],
    science: ['Living things characteristics', 'Animal reproduction sexual & asexual', 'Plant reproduction parts of flower', 'Food chain & food web', 'Adaptation animals to habitat', 'Adaptation plants', 'Health & nutrition food pyramid', 'Diseases & prevention', 'States of matter properties', 'Mixture & solution', 'Heat sources & effects', 'Light reflection & refraction', 'Sound pitch & loudness', 'Forces friction', 'Simple machines applications', 'Electricity basic circuits', 'Earth resources soil, water, air', 'Conservation environment', 'Solar system planets', 'Weather instruments'],
    jawi: ['Ejaan Jawi lengkap perkataan biasa', 'Imbuhan Jawi me-, ber-, ter-', 'Imbuhan Jawi -an, -kan', 'Penulisan ayat Jawi lengkap', 'Tanda baca dalam Jawi', 'Bacaan Jawi petikan sederhana', 'Tulisan khat asas', 'Padan ayat Jawi-Rumi panjang', 'Karangan Jawi pendek', 'Surat Jawi mudah', 'Doa & zikir Jawi', 'Surah-surah pendek (Al-Fatihah dll)', 'Ayat Al-Quran pilihan', 'Nama-nama Allah (Asmaul Husna) asas', 'Nama nabi & rasul', 'Rukun Islam dalam Jawi', 'Rukun Iman dalam Jawi', 'Adab harian Jawi', 'Peribahasa Melayu dalam Jawi', 'Pantun Jawi pendek'],
    // KAFA Darjah 3
    kafa_quran: ['Tajwid asas: Mad asli (panjang 2 harakat)', 'Hukum Nun mati & Tanwin: Izhar', 'Hukum Nun mati & Tanwin: Idgham', 'Hukum Nun mati & Tanwin: Iqlab & Ikhfa', 'Hafazan Surah Al-Kauthar', 'Hafazan Surah Al-Asr', 'Hafazan Surah Al-Humazah', 'Hafazan Surah Al-Fil', 'Adab terhadap Al-Quran (menyentuh dalam wuduk)', 'Pengertian beberapa ayat pendek'],
    kafa_jawi: ['Eja perkataan berimbuhan Jawi', 'Tulisan khat naskhi asas', 'Karangan Jawi 5 ayat (cerita)', 'Surat Jawi tidak rasmi (kepada kawan)', 'Bacaan petikan Jawi sederhana', 'Padan ayat Jawi-Rumi panjang', 'Terjemahan ayat Jawi ke Rumi', 'Tulis nama-nama sahabat Nabi dalam Jawi', 'Tulis doa harian dalam Jawi', 'Surah pendek tulisan Jawi'],
    kafa_akidah: ['Sifat 20 Allah pengenalan: Wajibul Wujud', 'Sifat Salbiyyah Allah (Qidam, Baqa)', 'Sifat Ma\'ani Allah (Qudrat, Iradat)', '25 Rasul wajib diketahui (nama-nama)', 'Mukjizat Nabi-nabi terpilih', 'Ulul Azmi 5 Rasul (Nuh, Ibrahim, Musa, Isa, Muhammad)', 'Perbezaan Nabi dan Rasul', 'Sifat-sifat wajib Rasul (Siddiq, Amanah, Tabligh, Fathonah)', 'Pengertian Akhirat', 'Tanda-tanda kiamat kecil'],
    kafa_ibadah: ['Solat lima waktu bilangan rakaat', 'Bacaan iftitah dalam solat', 'Sujud sahwi (sujud kelupaan)', 'Solat berjemaah cara & adab', 'Kedudukan imam & makmum', 'Solat Jumaat hukum & syarat', 'Khutbah Jumaat', 'Adab masuk masjid (kaki kanan, doa)', 'Solat sunat Rawatib', 'Solat Sunat Tahajjud pengenalan'],
    kafa_sirah: ['Hijrah Nabi ke Madinah', 'Sebab hijrah ke Madinah', 'Gua Thur dalam hijrah', 'Pembinaan Masjid Quba', 'Pembinaan Masjid Nabawi', 'Piagam Madinah', 'Perang Badar (perang pertama)', 'Perang Uhud', 'Perang Khandak', 'Pembukaan Mekah (Fathu Makkah)'],
    kafa_adab: ['Adab ziarah orang sakit', 'Adab di rumah (membantu kerja rumah)', 'Adab memberi & menerima hadiah', 'Adab makan secara Islam (kanan, duduk)', 'Adab tidur (wuduk dulu, doa)', 'Adab kepada kitab Al-Quran', 'Adab dengan adik beradik', 'Adab menjaga maruah diri', 'Adab berpakaian (menutup aurat)', 'Adab menghormati orang tua'],
    kafa_bahasa_arab: ['Kosa kata haiwan: ghazal (rusa), thaalab (musang), jamal (unta)', 'Kosa kata buah: burtuqal (oren), inab (anggur)', 'Warna lengkap: abyad (putih), aswad (hitam), akhdar (hijau)', 'Hari dalam Arab lengkap 7 hari', 'Bulan dalam Arab Hijrah lengkap', 'Bilangan Arab 11-20', 'Soal jawab: ayna...? (di mana...?)', 'Perbualan: min ayna anta? (kamu dari mana?)', 'Kosa kata sekolah: mu\'allim (cikgu), tilmiz (pelajar)', 'Doa harian dalam Arab: bismillah, alhamdulillah, insya Allah'],
    // Pendidikan Islam KSSR Darjah 3
    pendidikan_islam: ['Solat berjemaah cara & adab', 'Bacaan iftitah', 'Sujud sahwi', 'Hukum tajwid asas (mad asli)', 'Hafazan Surah Al-Kauthar', 'Hafazan Surah Al-Asr', 'Hafazan Surah Al-Maun', 'Sifat wajib Allah (Wujud, Qidam, Baqa)', 'Beriman kepada Malaikat & tugasnya', 'Beriman kepada Kitab Allah', 'Kisah Nabi Ibrahim AS', 'Kisah Nabi Ismail AS', 'Hijrah Nabi ke Madinah', 'Akhlak: jujur, amanah, hormat', 'Adab ziarah orang sakit', 'Adab dengan jiran', 'Puasa Ramadhan pengenalan', 'Doa untuk ibu bapa', 'Cara mandi wajib pengenalan', 'Asmaul Husna 5 nama pertama'],
    pendidikan_moral: ['Nilai bertanggungjawab kepada masyarakat', 'Nilai hormat hak orang lain', 'Nilai kasih sayang terhadap alam', 'Nilai kejujuran & integriti', 'Nilai semangat bermasyarakat', 'Nilai kerajinan', 'Nilai bersopan & beradab', 'Nilai bersyukur dengan nikmat', 'Nilai kerjasama untuk kebaikan', 'Nilai kesederhanaan', 'Nilai kebebasan bertanggungjawab', 'Nilai keadilan sosial', 'Patriotik mencintai negara', 'Menghormati budaya kaum lain', 'Menjaga kemudahan awam', 'Menghargai jasa orang', 'Bertolak ansur', 'Kebersihan persekitaran', 'Hidup bersatu padu', 'Menolong tanpa mengira kaum'],
    rbt: ['Jenis alatan tangan & fungsi khusus', 'Teknik mengukur & menanda', 'Sifat bahan (kuat, lentur, telap)', 'Proses reka bentuk (kenal pasti masalah)', 'Lakaran & lukisan teknik mudah', 'Pengeluaran tanaman sayur', 'Penjagaan tanaman & serangga perosak', 'Penyediaan makanan ringkas berkhasiat', 'Pengendalian makanan yang selamat', 'Jahitan asas (jahitan kia)', 'Litar elektrik (mentol, suis, bateri)', 'Perkakasan & perisian komputer', 'Reka bentuk grafik mudah', 'Kraf tradisional (anyaman mudah)', 'Pengiraan bahan untuk projek', 'Pemotongan & pencantuman bahan', 'Mekanisme: gear & takal', 'Pengurusan sisa & kitar semula', 'Membina model struktur mudah', 'Etika & keselamatan bengkel'],
    pjk: ['Kemahiran lokomotor gabungan', 'Kemahiran manipulasi alatan (gelung, pundi kacang)', 'Kemahiran asas permainan (hantar, terima)', 'Imbangan & koordinasi', 'Senaman daya tahan kardiovaskular', 'Komponen kecergasan (kekuatan, kelenturan)', 'Pemakanan seimbang', 'Penjagaan kesihatan diri', 'Rehat & tidur berkualiti', 'Pengambilan air & hidrasi', 'Keselamatan dalam aktiviti fizikal', 'Sistem pernafasan asas', 'Penjagaan mata & telinga', 'Postur badan yang sihat', 'Amalan kebersihan diri', 'Bahaya dadah & rokok (kesedaran)', 'Pengurusan emosi & tekanan', 'Permainan kecil & strategi', 'Kelenturan & regangan dinamik', 'Gaya hidup aktif'],
    seni: ['Unsur seni: rupa & bentuk', 'Prinsip rekaan: imbangan', 'Warna harmoni & kontra', 'Garisan menghasilkan corak', 'Lukisan figura manusia', 'Teknik catan (berus, sapuan)', 'Corak tradisional Malaysia', 'Kolaj campuran bahan', 'Cetakan blok mudah', 'Tekstur sebenar & ilusi', 'Origami pelbagai bentuk', 'Arca/model 3 dimensi', 'Lukisan suasana & cerita', 'Seni guna bahan kitar semula', 'Membentuk tembikar mudah', 'Batik & ukiran (pengenalan)', 'Reka bentuk poster', 'Potret & lakaran wajah', 'Warna & emosi dalam karya', 'Hiasan motif berulang'],
  },
  darjah_4: {
    bahasa_melayu: ['Tatabahasa lanjutan', 'Imbuhan apitan (per-...-an, ke-...-an)', 'Frasa nama, kerja, adjektif', 'Klausa', 'Ayat songsang', 'Ayat tanya khusus', 'Karangan fakta', 'Karangan keperihalan', 'Surat rasmi lengkap', 'Laporan aktiviti', 'Ulasan buku/filem', 'Syair', 'Gurindam', 'Peribahasa lanjutan', 'Bidalan & pepatah', 'Bahasa kiasan', 'Cerpen analisis watak', 'Komsas asas', 'Karangan berformat', 'Soalan KBAT'],
    english: ['Complex sentences', 'Subordinate clauses', 'Passive voice introduction', 'Modal verbs (can, must, should)', 'Conditional sentences if-then', 'Relative pronouns (who, which, that)', 'Phrasal verbs common', 'Idioms intermediate', 'Proverbs', 'Figurative language similes metaphors', 'Essay writing intro-body-conclusion', 'Narrative writing structure', 'Argumentative writing basic', 'Book review', 'Reading comprehension advanced', 'Inference questions', 'Main idea & supporting details', 'Author\'s purpose', 'Vocabulary in context', 'Spelling rules'],
    mathematics: ['Numbers up to 100,000', 'Place value extended', 'Operations with large numbers', 'Order of operations BODMAS', 'Multiplication 3-digit × 2-digit', 'Long division', 'Factors & multiples', 'Prime numbers basic', 'Fractions equivalent & simplify', 'Fractions + - mixed', 'Decimals operations', 'Percentages basic', 'Ratio basic', 'Money budgeting', 'Time 24-hour clock', 'Length, mass, volume conversion mixed', 'Perimeter & area formulas', 'Angles types', 'Lines parallel, perpendicular', 'Data mean, mode, range'],
    science: ['Cells basic', 'Human body systems intro', 'Digestive system', 'Respiratory system', 'Circulatory system', 'Skeleton & muscles', 'Plant reproduction detail', 'Photosynthesis basic', 'Energy types', 'Heat transfer', 'Light properties speed, color', 'Electricity circuits series & parallel', 'Magnetism applications', 'Forces gravity, friction, air resistance', 'Earth structure layers', 'Rocks & minerals', 'Weather patterns Malaysia', 'Climate change basic', 'Ecosystems Malaysia rainforest', 'Endangered species'],
    jawi: ['Ejaan Jawi sistematik DBP', 'Khat naskhi asas', 'Karangan Jawi sederhana', 'Surat Jawi rasmi', 'Bacaan Jawi petikan panjang', 'Pemahaman teks Jawi', 'Terjemahan Jawi-Rumi ayat', 'Penulisan kreatif Jawi', 'Doa & wirid lanjutan', 'Surah pendek (Al-Ikhlas, Al-Falaq, An-Nas)', 'Hadis pilihan ringkas', 'Sirah nabi ringkas', 'Sahabat nabi pilihan', 'Adab & akhlak Islam', 'Hari kebesaran Islam', 'Bulan-bulan Hijrah', 'Doa harian (makan, tidur, masuk tandas)', 'Solat fardhu langkah', 'Wuduk langkah', 'Tanya jawab Jawi'],
    // KAFA Darjah 4
    kafa_quran: ['Tajwid: Hukum Mim mati (Ikhfa Syafawi, Idgham Mithli, Izhar)', 'Tajwid: Qalqalah (sughra & kubra)', 'Tajwid: Mad asli & mad bertemu hamzah', 'Hafazan Surah Al-Maun', 'Hafazan Surah Quraisy', 'Hafazan Surah Al-Adiyat', 'Hafazan Surah Az-Zalzalah', 'Hafazan Surah Al-Bayyinah', 'Pengertian surah Al-Fatihah', 'Adab kepada Al-Quran lanjutan'],
    kafa_jawi: ['Ejaan Jawi sistematik DBP lanjutan', 'Khat naskhi (huruf bersambung lengkap)', 'Karangan Jawi sederhana 8-10 ayat', 'Surat Jawi rasmi (kepada guru)', 'Bacaan teks Jawi panjang', 'Pemahaman teks Jawi (jawab soalan)', 'Terjemahan ayat Jawi ke Rumi lanjutan', 'Tulis biodata diri dalam Jawi', 'Tulis hadis pendek dalam Jawi', 'Tulis nama-nama Asmaul Husna dalam Jawi'],
    kafa_akidah: ['Sifat 20 Allah lengkap', 'Sifat Wajib, Mustahil, Harus Allah', 'Sifat Ma\'nawiyyah Allah', '25 Rasul nama & tugas masing-masing', 'Kisah Nabi Adam AS', 'Kisah Nabi Nuh AS', 'Kisah Nabi Ibrahim AS', 'Kisah Nabi Musa AS', 'Kisah Nabi Isa AS', 'Mukjizat Nabi Muhammad SAW (Al-Quran)'],
    kafa_ibadah: ['Solat fardhu lengkap (rukun, syarat, wajib, sunat)', 'Sujud sahwi waktu & cara', 'Sujud tilawah & syukur', 'Puasa Ramadhan hukum & syarat', 'Perkara membatalkan puasa', 'Sunat-sunat puasa', 'Zakat fitrah pengenalan', 'Kadar zakat fitrah', 'Solat sunat Aidilfitri & Aidiladha', 'Solat jenazah pengenalan'],
    kafa_sirah: ['Khulafa Ar-Rasyidin (4 khalifah)', 'Saidina Abu Bakar As-Siddiq', 'Saidina Umar bin Al-Khattab', 'Saidina Uthman bin Affan', 'Saidina Ali bin Abi Talib', '10 Sahabat dijamin syurga', 'Bilal bin Rabah (muazzin pertama)', 'Khadijah binti Khuwailid', 'Aisyah binti Abu Bakar', 'Fatimah Az-Zahra (puteri Nabi)'],
    kafa_adab: ['Akhlak terpuji: Jujur (siddiq)', 'Akhlak terpuji: Amanah', 'Akhlak terpuji: Sabar', 'Akhlak terpuji: Tolong-menolong', 'Akhlak tercela: Bohong (kazib)', 'Akhlak tercela: Khianat', 'Akhlak tercela: Marah berlebihan', 'Akhlak tercela: Tamak (rakus)', 'Adab dalam majlis ilmu', 'Adab terhadap binatang & alam sekitar'],
    kafa_bahasa_arab: ['Kata ganti nama: ana, anta, anti, huwa, hiya', 'Kata kerja Arab asas: yaktub (menulis), yaqra\' (membaca)', 'Ayat nominal mudah (jumlah ismiyyah)', 'Ayat verbal mudah (jumlah fi\'liyyah)', 'Kosa kata pakaian: qamis (baju), sirwal (seluar)', 'Kosa kata makanan: khubz (roti), labn (susu)', 'Kosa kata waktu: sabah (pagi), masa\' (petang)', 'Doa harian Arab lengkap: doa makan, tidur', 'Soal jawab: kam umruk? (umur kamu berapa?)', 'Asmaul Husna asas: Ar-Rahman, Ar-Rahim, Al-Malik'],
    // Pendidikan Islam KSSR Darjah 4
    pendidikan_islam: ['Solat fardhu lengkap (rukun, syarat, sunat)', 'Tajwid: hukum nun mati & tanwin', 'Hafazan Surah Al-Fil', 'Hafazan Surah Quraisy', 'Hafazan Surah Al-Humazah', 'Sifat 20 Allah pengenalan', '25 Rasul wajib diketahui', 'Mukjizat para Nabi', 'Kisah Nabi Musa AS', 'Kisah Nabi Isa AS', 'Puasa Ramadhan hukum & syarat', 'Perkara membatalkan puasa', 'Zakat fitrah pengenalan', 'Akhlak terpuji: ikhlas & tawaduk', 'Akhlak tercela: bohong & khianat', 'Adab menuntut ilmu', 'Khulafa Ar-Rasyidin pengenalan', 'Sahabat Nabi: Abu Bakar & Umar', 'Solat sunat Rawatib', 'Doa selepas solat'],
    // Sejarah bermula Darjah 4 dalam KSSR
    sejarah: ['Maksud sejarah & sumber sejarah', 'Diri & keluarga saya', 'Salasilah keluarga', 'Sejarah sekolah saya', 'Tokoh kebanggaan keluarga', 'Warisan keluarga & adat', 'Kepentingan menghargai sejarah', 'Garis masa peristiwa hidup', 'Kemerdekaan Malaysia (pengenalan)', 'Bendera Malaysia (Jalur Gemilang)', 'Lagu Negaraku', 'Jata Negara & maksud', 'Tokoh kemerdekaan (Tunku Abdul Rahman)', 'Bunga raya bunga kebangsaan', 'Perpaduan kaum di Malaysia', 'Tempat bersejarah berhampiran', 'Cara menyimpan dokumen sejarah', 'Muzium & fungsinya', 'Menghormati orang tua sebagai sumber sejarah', 'Semangat cintakan negara'],
    pendidikan_moral: ['Nilai bertanggungjawab terhadap negara', 'Nilai hormat institusi negara', 'Nilai kasih sayang & prihatin', 'Nilai kejujuran & ketelusan', 'Nilai semangat patriotik', 'Nilai rasional membuat keputusan', 'Nilai hemah tinggi & budi bahasa', 'Nilai bersyukur kepada negara', 'Nilai kerjasama membangun masyarakat', 'Nilai kesederhanaan dalam hidup', 'Nilai keadilan & saksama', 'Nilai keberanian moral', 'Menghargai keamanan negara', 'Menghormati lambang negara', 'Menjaga aset & kemudahan awam', 'Menghargai pemimpin & tokoh', 'Bertoleransi antara agama', 'Memelihara alam sekitar', 'Perpaduan dalam kepelbagaian', 'Tanggungjawab sebagai warganegara muda'],
    rbt: ['Pengelasan alatan tangan', 'Teknik penggunaan alatan yang betul', 'Pemilihan bahan ikut kesesuaian', 'Proses reka bentuk lengkap', 'Lukisan projeksi & lakaran 3D mudah', 'Teknologi pertanian moden', 'Penyakit & perosak tanaman', 'Penyediaan & pengawetan makanan', 'Pelabelan & keselamatan makanan', 'Jahitan & jahitan hiasan', 'Litar siri & litar selari', 'Komponen elektronik asas', 'Reka bentuk berbantu komputer (pengenalan)', 'Kraf tradisional & moden', 'Pengiraan kos bahan', 'Teknik cantuman bahan', 'Sistem mekanikal (gear, takal, tuas)', 'Pengurusan sisa & kelestarian', 'Pembinaan model berfungsi', 'Inovasi & penyelesaian masalah'],
    pjk: ['Kemahiran asas olahraga (lari pecut)', 'Kemahiran permainan (bola jaring, bola sepak)', 'Kemahiran gimnastik asas', 'Koordinasi mata-tangan-kaki', 'Latihan kecergasan berkala', 'Komponen kecergasan fizikal lengkap', 'Pemakanan untuk tenaga', 'Penjagaan kesihatan reproduktif (asas)', 'Kepentingan rehat & pemulihan', 'Pengurusan berat badan sihat', 'Keselamatan sukan & pencegahan kecederaan', 'Sistem peredaran darah', 'Penjagaan kulit & rambut', 'Postur & ergonomik', 'Pencegahan penyakit berjangkit', 'Bahaya penyalahgunaan bahan', 'Pengurusan stres & emosi', 'Strategi permainan berpasukan', 'Kelenturan & kelajuan', 'Aktiviti rekreasi luar'],
    seni: ['Unsur seni lengkap (jalinan, ruang)', 'Prinsip rekaan (kepelbagaian, kesatuan)', 'Teori warna lanjutan', 'Lukisan perspektif mudah', 'Catan menggunakan media berbeza', 'Corak & motif budaya Malaysia', 'Kolaj & montaj', 'Cetakan (stensil, blok)', 'Seni arca & binaan', 'Tembikar & seramik mudah', 'Seni khat & tulisan hias', 'Reka bentuk grafik & logo', 'Lukisan ilustrasi cerita', 'Seni kraf (anyaman, tenunan)', 'Fotografi asas (komposisi)', 'Batik & ukiran kayu', 'Reka bentuk fesyen mudah', 'Potret & figura', 'Warna & mood dalam karya', 'Pameran & apresiasi seni'],
  },
  darjah_5: {
    bahasa_melayu: ['Tatabahasa kompleks', 'Ayat majmuk pancangan', 'Ayat majmuk relatif', 'Ayat majmuk komplemen', 'Penjodoh bilangan lanjutan', 'Karangan berformat (rencana, ucapan)', 'Karangan respons terbuka', 'Karangan tidak berformat', 'Komsas sajak', 'Komsas cerpen', 'Komsas prosa tradisional', 'Komsas drama', 'Analisis watak', 'Tema & persoalan', 'Plot & latar', 'Gaya bahasa', 'Pemahaman petikan KBAT', 'Tatabahasa KBAT', 'Penulisan ulasan', 'Penulisan rumusan'],
    english: ['Complex grammar review', 'Reported speech rules', 'Passive voice all tenses', 'Conditional sentences types 1, 2, 3', 'Subjunctive mood', 'Idioms & expressions extended', 'Phrasal verbs extended', 'Connectors & cohesion', 'Essay types descriptive, narrative, expository', 'Argumentative essay structure', 'Letter writing formal types', 'Report writing', 'Speech writing', 'Article writing', 'Reading comprehension UPSR-style', 'Literature short stories', 'Poetry analysis', 'Drama elements', 'Vocabulary advanced', 'Writing mechanics editing'],
    mathematics: ['Whole numbers to 1,000,000', 'Operations all four', 'Fractions mixed operations', 'Decimals all four operations', 'Percentages applications', 'Ratio & proportion', 'Money problems multi-step', 'Time problems', 'Length, mass, volume problem-solving', 'Perimeter complex shapes', 'Area triangles, parallelograms', 'Volume cubes & cuboids', 'Angles measure & calculate', 'Lines & shapes properties', '2D shapes nets', '3D shapes nets', 'Data mean, median, mode', 'Pie charts', 'Line graphs', 'Word problems UPSR'],
    science: ['Microorganisms', 'Disease germs & immunity', 'Vaccination', 'Food nutrition detail', 'Reproduction humans basic', 'Plant adaptations', 'Animal adaptations', 'Survival of species', 'Energy conservation', 'Heat & expansion', 'Light & shadows', 'Sound waves', 'Electricity safety', 'Renewable energy', 'Non-renewable energy', 'Solar system detail', 'Stars & galaxies basic', 'Earth movements rotation revolution', 'Eclipses', 'Pollution types & solutions'],
    jawi: ['Khat naskhi & riq\'ah', 'Karangan Jawi panjang', 'Surat Jawi rasmi & tidak rasmi', 'Karangan deskriptif Jawi', 'Karangan naratif Jawi', 'Petikan Jawi UPSR style', 'Pemahaman Jawi KBAT', 'Terjemahan ayat panjang', 'Doa harian lengkap', 'Surah pendek (Al-Kawthar, Al-Asr, Al-Humazah)', 'Hadis qudsi pilihan', 'Sirah nabi terperinci', 'Khulafa Ar-Rasyidin', 'Adab pergaulan Islam', 'Akhlak terpuji', 'Akhlak tercela', 'Solat sunat', 'Puasa', 'Zakat', 'Haji & umrah asas'],
    // KAFA Darjah 5
    kafa_quran: ['Tajwid lengkap: Idgham Mutamathilain, Mutaqaribain, Mutajanisain', 'Tajwid: Mad far\'i jenis-jenis', 'Tajwid: Waqaf dan ibtida\'', 'Hafazan Surah At-Tin', 'Hafazan Surah Al-Alaq', 'Hafazan Surah Al-Qadr', 'Hafazan Surah Al-Lail', 'Hafazan Surah Asy-Syams', 'Hafazan Surah Al-Balad', 'Pengertian Surah Al-Ikhlas'],
    kafa_jawi: ['Khat naskhi lengkap & riq\'ah pengenalan', 'Karangan Jawi panjang (15 ayat)', 'Surat Jawi rasmi (kepada pengetua)', 'Karangan deskriptif Jawi (huraian)', 'Karangan naratif Jawi (cerita)', 'Petikan Jawi gaya UPKK', 'Pemahaman Jawi (jawab soalan KBAT)', 'Terjemahan ayat panjang Jawi-Rumi', 'Tulis hadis 40 dalam Jawi (pilihan)', 'Tulis bab fiqh dalam Jawi'],
    kafa_akidah: ['Tauhid Rububiyyah, Uluhiyyah, Asma wa Sifat', 'Syirik kecil & besar (perbezaan)', 'Bahaya syirik & cara menghindari', 'Hari Akhirat: tanda-tanda kiamat besar', 'Hari kiamat: peristiwa di mahsyar', 'Syurga & sifat-sifatnya', 'Neraka & sifat-sifatnya', 'Qada & Qadar pengertian', 'Beriman kepada Qada & Qadar', 'Hubungan Qada Qadar dengan usaha (ikhtiar)'],
    kafa_ibadah: ['Solat sunat Rawatib (qabliyyah & ba\'diyyah)', 'Solat sunat Tahajjud cara', 'Solat sunat Dhuha', 'Solat sunat Tarawih', 'Solat sunat Witir', 'Puasa sunat (Isnin Khamis, Ayyamul Bidh)', 'Zakat harta jenis-jenis (emas, perak, perniagaan)', 'Nisab & kadar zakat harta', 'Haji rukun & wajib', 'Umrah cara & rukun'],
    kafa_sirah: ['Tahun-tahun penting hijrah Nabi', 'Perjanjian Hudaibiyyah', 'Pembebasan Mekah (Fathu Makkah)', 'Haji Wida\' (haji perpisahan)', 'Wafatnya Rasulullah SAW', 'Pemilihan Khalifah Abu Bakar', 'Perang Riddah (Murtaddin)', 'Pengumpulan Al-Quran zaman Abu Bakar', 'Penaklukan zaman Umar (Syam, Mesir, Parsi)', 'Pembukuan Al-Quran zaman Uthman'],
    kafa_adab: ['Akhlak terpuji: Ikhlas', 'Akhlak terpuji: Tawaduk (rendah diri)', 'Akhlak terpuji: Syukur', 'Akhlak terpuji: Adil', 'Akhlak tercela: Riya\' (menunjuk-nunjuk)', 'Akhlak tercela: Takabbur (sombong)', 'Akhlak tercela: Hasad dengki', 'Akhlak tercela: Kufur nikmat', 'Adab dengan jiran (toleransi)', 'Adab dalam masyarakat (gotong-royong)'],
    kafa_bahasa_arab: ['Kata kerja madhi (lampau) - kataba (telah menulis)', 'Kata kerja mudhari\' (sekarang) - yaktub', 'Kata kerja amr (suruhan) - uktub!', 'Isim mufrad, mudhanna, jama\' (tunggal, dua, jamak)', 'Isim ma\'rifah & nakirah (al-)', 'Idhafah (gabungan kata)', 'Soal jawab lengkap: matha tadhhab? (bila kamu pergi?)', 'Doa selepas solat dalam Arab', 'Hadis pendek dalam Arab dengan terjemahan', 'Asmaul Husna 99 nama (10 pertama)'],
    // Pendidikan Islam KSSR Darjah 5
    pendidikan_islam: ['Solat fardhu & sunat lengkap', 'Tajwid: hukum mim mati & qalqalah', 'Hafazan Surah At-Tin', 'Hafazan Surah Al-Alaq', 'Hafazan Surah Al-Qadr', 'Sifat 20 Allah lengkap', 'Tauhid Rububiyyah & Uluhiyyah', 'Bahaya syirik', 'Hari Akhirat & tanda kiamat', 'Kisah Nabi Yusuf AS', 'Kisah Nabi Sulaiman AS', 'Puasa sunat (Isnin Khamis)', 'Zakat harta jenis & nisab', 'Solat jenazah pengenalan', 'Akhlak: adil & syukur', 'Akhlak tercela: riak & sombong', 'Perang Badar & Uhud', 'Wanita teladan: Khadijah & Aisyah', 'Adab dalam masyarakat (gotong-royong)', 'Korban & akikah pengenalan'],
    sejarah: ['Zaman prasejarah di Malaysia', 'Kerajaan Melayu awal (Kedah Tua)', 'Kerajaan Melaka & kegemilangannya', 'Tokoh Kesultanan Melaka (Parameswara)', 'Hang Tuah & pahlawan Melaka', 'Sistem pemerintahan Melaka', 'Perdagangan di Melaka', 'Kedatangan Portugis 1511', 'Penjajahan British di Tanah Melayu', 'Tokoh penentang penjajah (Tok Janggut, Dato Bahaman)', 'Mat Salleh & Rentap', 'Pendudukan Jepun', 'Gerakan kemerdekaan', 'Perjanjian Persekutuan Tanah Melayu', 'Tokoh kemerdekaan (Tunku, Tun Razak, Tun Sambanthan)', 'Hari Merdeka 31 Ogos 1957', 'Pembentukan Malaysia 1963', 'Warisan & monumen negara', 'Lambang & identiti negara', 'Semangat patriotisme'],
    pendidikan_moral: ['Tanggungjawab terhadap diri & keluarga', 'Hormat hak asasi manusia', 'Kasih sayang & perpaduan', 'Kejujuran dalam kepimpinan', 'Patriotisme & kedaulatan negara', 'Rasional & pemikiran kritis', 'Hemah tinggi dalam pergaulan', 'Kesyukuran terhadap kemakmuran', 'Kerjasama membangun negara', 'Kesederhanaan & keseimbangan', 'Kebebasan & tanggungjawab sosial', 'Keadilan & hak saksama', 'Keberanian mempertahankan kebenaran', 'Menghargai keamanan & keharmonian', 'Menghormati kepelbagaian agama', 'Memelihara warisan negara', 'Toleransi antara kaum', 'Pemuliharaan alam sekitar', 'Integriti & antirasuah (asas)', 'Sumbangan kepada komuniti'],
    rbt: ['Sistem & teknologi (input, proses, output)', 'Penggunaan alatan & mesin selamat', 'Sifat & pemilihan bahan kejuruteraan', 'Reka bentuk lengkap & penilaian', 'Lukisan teknik & ortografik', 'Sistem pertanian & akuakultur', 'Pengurusan tanaman komersial', 'Sains rumah tangga & pemakanan', 'Pengawetan & pembungkusan makanan', 'Jahitan projek tekstil', 'Litar elektronik & komponen', 'Pengaturcaraan asas (block coding)', 'Reka bentuk berbantu komputer', 'Kraf & inovasi produk', 'Pengiraan kos & untung', 'Teknik fabrikasi bahan', 'Sistem mekanikal kompleks', 'Tenaga boleh diperbaharui', 'Pembinaan prototaip', 'Pemasaran produk asas'],
    pjk: ['Kemahiran olahraga (lompat, balingan)', 'Kemahiran permainan bola lanjutan', 'Gimnastik & pergerakan kreatif', 'Latihan ansur maju kecergasan', 'Ujian kecergasan SEGAK', 'Pemakanan atlet & sukan', 'Kesihatan reproduktif & akil baligh', 'Pemulihan & pencegahan kecederaan', 'Pengurusan berat & komposisi badan', 'Keselamatan air & renang', 'Sistem otot & rangka lanjutan', 'Penjagaan kesihatan mental', 'Postur & pencegahan kecederaan', 'Pencegahan penyakit tidak berjangkit', 'Bahaya dadah, rokok, vape', 'Pengurusan tekanan & emosi', 'Strategi & taktik permainan', 'Latihan kelajuan & ketangkasan', 'Aktiviti rekreasi & ekspedisi', 'Gaya hidup sihat sepanjang hayat'],
    seni: ['Asas senireka & komposisi', 'Prinsip rekaan lengkap', 'Skema warna & psikologi warna', 'Lukisan perspektif satu & dua titik', 'Catan media campuran', 'Motif & corak budaya Malaysia', 'Kolaj, montaj & asemblaj', 'Seni cetak (lino, sablon)', 'Seni arca & instalasi', 'Seramik & tembikar', 'Seni khat & tipografi', 'Reka bentuk grafik digital', 'Ilustrasi & komik', 'Kraf warisan (batik, songket, ukiran)', 'Fotografi & komposisi', 'Animasi mudah (pengenalan)', 'Reka bentuk produk & fesyen', 'Potret, figura & anatomi asas', 'Ekspresi & emosi dalam seni', 'Kurasi & apresiasi karya'],
  },
  darjah_6: {
    bahasa_melayu: ['Tatabahasa UPSR review', 'Karangan respons terhad', 'Karangan respons bebas', 'Karangan KBAT', 'Komsas semua genre', 'Penulisan ringkasan', 'Penulisan ulasan', 'Pemahaman petikan tinggi', 'Tatabahasa kontekstual', 'Sinonim antonim peribahasa', 'Kata majmuk & ganda lanjutan', 'Imbuhan semua jenis', 'Ayat songsang & susunan biasa', 'Klausa & frasa lanjutan', 'Penanda wacana semua jenis', 'Stilistik bahasa', 'Bahasa kiasan & perlambangan', 'Soalan KBAT bahasa', 'Karangan format pidato', 'Karangan format laporan'],
    english: ['Grammar UPSR review', 'Writing assessment essay', 'Reading assessment comprehension', 'Listening assessment basics', 'Speaking presentation', 'Literature elements all', 'Vocabulary UPSR words', 'Spelling tricky words', 'Punctuation all rules', 'Sentence structures all', 'Tense consistency', 'Voice & mood', 'Idioms & proverbs UPSR', 'Figurative language all', 'Essay types complete', 'Letter writing all types', 'Report writing detail', 'Article writing', 'Summary writing', 'Editing & proofreading'],
    mathematics: ['UPSR number sense', 'UPSR operations problem-solving', 'Fractions, decimals, percentages mixed', 'Ratio & proportion problems', 'Money compound problems', 'Time speed distance', 'Length, mass, volume UPSR problems', 'Perimeter & area complex', 'Volume problems', 'Angles UPSR', 'Geometry properties UPSR', 'Symmetry & transformations', 'Average problems', 'Data interpretation graphs', 'Probability introduction', 'Algebra basic letter for number', 'Word problems UPSR style mixed', 'KBAT mathematics problems', 'Reasoning problems', 'Mental math strategies'],
    science: ['UPSR review life processes', 'UPSR review matter & energy', 'UPSR review earth & universe', 'Scientific skills investigating', 'Experiment design', 'Variables manipulated, responding, fixed', 'Data collection methods', 'Data interpretation', 'Health complete topics', 'Environment & conservation', 'Energy & sustainability', 'Technology in science', 'Forces & motion', 'Heat, light, sound, electricity review', 'Plants & animals classification', 'Ecosystems Malaysia', 'Solar system review', 'Weather & climate Malaysia', 'KBAT science questions', 'Real-world science applications'],
    jawi: ['Khat naskhi lengkap', 'Karangan Jawi UPSR', 'Surat Jawi semua format', 'Petikan Jawi UPSR', 'Pemahaman Jawi KBAT', 'Terjemahan Jawi-Rumi panjang', 'Penulisan kreatif Jawi', 'Surah pendek juzuk 30 pilihan', 'Hadis 40 pilihan ringkas', 'Sirah nabi lengkap', 'Khulafa Ar-Rasyidin lengkap', 'Tokoh-tokoh Islam', 'Adab Islam lengkap', 'Akhlak Islam lengkap', 'Solat fardhu & sunat', 'Puasa Ramadhan', 'Zakat fitrah & harta', 'Haji & umrah', 'Doa pilihan lengkap', 'Kalimah syahadah & pengertian'],
    // KAFA Darjah 6 — persediaan UPKK
    kafa_quran: ['Tajwid review lengkap UPKK', 'Hafazan Surah Al-Insyirah', 'Hafazan Surah Ad-Dhuha', 'Hafazan Surah Al-Ghashiyah', 'Hafazan Surah Al-A\'la', 'Hafazan Surah At-Tariq', 'Hafazan Surah Al-Buruj', 'Hafazan Surah Al-Insyiqaq', 'Pengertian surah juzuk Amma pilihan', 'Soalan UPKK gaya Al-Quran & tajwid'],
    kafa_jawi: ['Khat naskhi lengkap UPKK', 'Karangan Jawi gaya UPKK (15-20 ayat)', 'Surat Jawi semua format (rasmi & tidak rasmi)', 'Petikan Jawi gaya UPKK', 'Pemahaman Jawi soalan KBAT', 'Terjemahan Jawi-Rumi ayat panjang', 'Penulisan kreatif Jawi (cerita pendek)', 'Tulis ringkasan dalam Jawi', 'Tulis pengalaman dalam Jawi', 'Soalan latih tubi UPKK Jawi'],
    kafa_akidah: ['Rukun Iman 6 lengkap dengan dalil', 'Sifat 20 Allah lengkap dengan maksud', 'Sifat Mustahil 20 lengkap', '25 Rasul lengkap dengan mukjizat', 'Hari Akhirat lengkap (mahsyar, mizan, syurga, neraka)', 'Qada & Qadar dengan contoh', 'Beriman kepada kitab-kitab Allah (4 kitab utama)', 'Beriman kepada malaikat (10 nama malaikat utama)', 'Soalan UPKK gaya Akidah', 'Bahaya syirik & cara mengelakkannya'],
    kafa_ibadah: ['Solat fardhu lengkap untuk UPKK', 'Solat sunat semua jenis', 'Wuduk, tayammum, mandi wajib lengkap', 'Puasa Ramadhan & puasa sunat lengkap', 'Zakat fitrah & zakat harta lengkap', 'Haji rukun, wajib, sunat lengkap', 'Umrah cara & rukun lengkap', 'Solat jenazah lengkap (rukun & cara)', 'Sembelihan & korban (qurban & akikah)', 'Soalan UPKK gaya Ibadah & Fekah'],
    kafa_sirah: ['Sirah Nabi Muhammad SAW lengkap (kelahiran hingga wafat)', 'Khulafa Ar-Rasyidin 4 orang lengkap', '10 sahabat dijamin syurga lengkap', 'Tokoh-tokoh Islam (Umar Abdul Aziz, Salahuddin Al-Ayyubi)', 'Wanita-wanita teladan Islam (Khadijah, Aisyah, Fatimah)', 'Perang-perang utama zaman Nabi (Badar, Uhud, Khandak, Fathu Makkah)', 'Hijrah ke Habsyah & Madinah', 'Piagam Madinah & Perjanjian Hudaibiyyah', 'Penyebaran Islam zaman Khulafa Ar-Rasyidin', 'Soalan UPKK gaya Sirah'],
    kafa_adab: ['Akhlak terpuji lengkap (10 sifat utama)', 'Akhlak tercela lengkap (10 sifat utama)', 'Adab harian lengkap (makan, tidur, tandas, masjid)', 'Adab dengan ibu bapa lengkap', 'Adab dengan guru & murid', 'Adab berkawan & jiran', 'Adab di masjid & Al-Quran', 'Adab menuntut ilmu', 'Adab terhadap binatang & alam', 'Soalan UPKK gaya Adab Islamiah'],
    kafa_bahasa_arab: ['Kata kerja Arab lengkap (madhi, mudhari\', amr)', 'Tasrif kata kerja (perubahan dhomir)', 'Isim mufrad, mudhanna, jama\' lengkap', 'Ayat nominal & verbal lanjutan', 'Asmaul Husna 99 nama lengkap', 'Doa-doa harian dalam Arab lengkap', 'Hadis pendek dalam Arab dengan terjemahan', 'Soalan UPKK Bahasa Arab gaya pilihan ganda', 'Perbualan Arab harian lengkap', 'Kosa kata Arab umum (sekolah, rumah, masyarakat) lengkap'],
    // Pendidikan Islam KSSR Darjah 6 — persediaan UPSR
    pendidikan_islam: ['Solat fardhu, sunat & jenazah lengkap', 'Tajwid lengkap (review UPSR)', 'Hafazan Surah Ad-Dhuha', 'Hafazan Surah Al-Insyirah', 'Hafazan juzuk Amma pilihan', 'Rukun Iman 6 lengkap dengan dalil', 'Sifat 20 Allah lengkap dengan maksud', '25 Rasul lengkap dengan mukjizat', 'Hari Akhirat lengkap (mahsyar, mizan, syurga, neraka)', 'Qada & Qadar', 'Kisah Nabi Muhammad SAW lengkap', 'Khulafa Ar-Rasyidin lengkap', 'Puasa, zakat, haji & umrah lengkap', 'Korban & akikah lengkap', 'Akhlak terpuji & tercela lengkap', 'Adab harian lengkap', 'Adab menuntut ilmu', 'Perang utama zaman Nabi', 'Tokoh Islam (Salahuddin Al-Ayyubi)', 'Soalan KBAT Pendidikan Islam'],
    // Sejarah KSSR Darjah 6 — persediaan ke menengah
    sejarah: ['Warisan negara & kepentingannya', 'Tokoh-tokoh negara (Bapa Kemerdekaan)', 'Perjuangan kemerdekaan terperinci', 'Pembentukan Persekutuan Malaysia', 'Penggal & sistem pemerintahan negara', 'Yang di-Pertuan Agong & raja-raja Melayu', 'Perlembagaan Persekutuan', 'Rukun Negara & maksud', 'Lambang-lambang negara lengkap', 'Sistem demokrasi Malaysia', 'Pilihan raya & tanggungjawab rakyat', 'Pembangunan negara selepas merdeka', 'Wawasan & pembangunan ekonomi', 'Perpaduan & integrasi nasional', 'Keganasan komunis & darurat', 'Peristiwa 13 Mei & pengajaran', 'Tokoh wanita dalam sejarah', 'Warisan budaya pelbagai kaum', 'Kepentingan menghargai sejarah negara', 'Soalan KBAT Sejarah'],
    pendidikan_moral: ['Tanggungjawab warganegara sepenuhnya', 'Hak asasi & keadilan sosial', 'Kasih sayang & keprihatinan sejagat', 'Integriti & ketelusan', 'Patriotisme & kedaulatan negara', 'Pemikiran rasional & kritis', 'Hemah tinggi & etika', 'Kesyukuran & menghargai nikmat', 'Kerjasama & semangat komuniti', 'Kesederhanaan & keseimbangan hidup', 'Kebebasan bertanggungjawab', 'Keadilan & saksama', 'Keberanian mempertahankan kebenaran', 'Cinta keamanan & keharmonian', 'Menghormati kepelbagaian agama & budaya', 'Memelihara warisan & alam', 'Toleransi & perpaduan', 'Pemuliharaan alam sekitar lestari', 'Antirasuah & integriti diri', 'Soalan KBAT nilai murni'],
    rbt: ['Sistem teknologi lengkap', 'Keselamatan & ergonomik bengkel', 'Sains & teknologi bahan', 'Proses reka bentuk & inovasi', 'Lukisan teknik lengkap', 'Teknologi pertanian & akuakultur moden', 'Keusahawanan pertanian', 'Sains rumah tangga & dietetik', 'Teknologi pemprosesan makanan', 'Projek tekstil & fesyen', 'Elektronik & sistem kawalan', 'Pengaturcaraan & robotik asas', 'Reka bentuk berbantu komputer (CAD)', 'Inovasi produk & prototaip', 'Pengiraan kos, untung & belanjawan', 'Teknik fabrikasi lanjutan', 'Sistem mekanikal & automasi', 'Tenaga lestari & kecekapan', 'Pembinaan & ujian produk', 'Pemasaran & keusahawanan'],
    pjk: ['Olahraga lengkap (acara padang & balapan)', 'Permainan berpasukan lengkap', 'Gimnastik & pergerakan ritma', 'Program latihan kecergasan peribadi', 'Ujian SEGAK & analisis', 'Pemakanan & prestasi sukan', 'Kesihatan reproduktif & akil baligh', 'Pengurusan kecederaan & pertolongan cemas', 'Komposisi badan & gaya hidup', 'Keselamatan air, renang & rekreasi', 'Anatomi & fisiologi asas', 'Kesihatan mental & kesejahteraan', 'Postur, ergonomik & pencegahan', 'Pencegahan penyakit gaya hidup', 'Bahaya dadah, alkohol, rokok, vape', 'Daya tahan emosi & tekanan', 'Strategi, taktik & kepimpinan sukan', 'Latihan ketangkasan & kuasa', 'Aktiviti luar & ekspedisi', 'Gaya hidup sihat sepanjang hayat'],
    seni: ['Senireka & komposisi lanjutan', 'Prinsip & unsur seni lengkap', 'Teori warna & aplikasi', 'Lukisan perspektif & ilusi ruang', 'Catan & teknik media campuran', 'Motif, corak & identiti budaya', 'Kolaj, montaj & seni campuran', 'Seni cetak pelbagai teknik', 'Arca, instalasi & seni 3D', 'Seramik, tembikar & seni tanah liat', 'Seni khat, tipografi & kaligrafi', 'Reka bentuk grafik & multimedia', 'Ilustrasi, komik & cerita visual', 'Kraf warisan Malaysia lengkap', 'Fotografi, video & komposisi', 'Animasi & seni digital', 'Reka bentuk produk, fesyen & pakaian', 'Anatomi, potret & figura lanjutan', 'Ekspresi diri & makna dalam seni', 'Kurasi, pameran & apresiasi seni'],
  },
};

const AGE_BAND = {
  prasekolah: 'preschool children aged 4-6 (very simple language, short sentences)',
  darjah_1: 'Year 1 primary school children aged 7 (KSSR-aligned, simple vocabulary)',
  darjah_2: 'Year 2 primary school children aged 8 (KSSR-aligned)',
  darjah_3: 'Year 3 primary school children aged 9 (KSSR-aligned)',
  darjah_4: 'Year 4 primary school children aged 10 (KSSR-aligned)',
  darjah_5: 'Year 5 primary school children aged 11 (KSSR-aligned)',
  darjah_6: 'Year 6 primary school children aged 12 (KSSR/UPSR-aligned)',
};

const SUBJECT_LANG_RULE = {
  bahasa_melayu: 'Write ALL questions, options, and content in BAHASA MELAYU only. No English mixing.',
  english: 'Write ALL questions, options, and content in ENGLISH only.',
  mathematics: 'Write questions in BAHASA MELAYU. Numbers and math symbols only.',
  science: 'Write ALL questions, options, and content in BAHASA MELAYU only.',
  jawi: 'Write questions in BAHASA MELAYU. Include Jawi script (Arabic-Malay characters) where relevant in options or problem.',
  pendidikan_islam: 'Write ALL questions, options, and content in BAHASA MELAYU only. Use authentic Islamic terms (Arabic words like solat, wuduk, rukun) where appropriate. Facts must follow Ahli Sunnah Wal Jamaah and Malaysian KSSR Pendidikan Islam syllabus.',
  pendidikan_moral: 'Write ALL questions, options, and content in BAHASA MELAYU only. Focus on the 18 nilai murni in the Malaysian KSSR Pendidikan Moral syllabus (e.g. baik hati, hormat, kasih sayang, bertanggungjawab). Non-religious, values for all Malaysians.',
  sejarah: 'Write ALL questions, options, and content in BAHASA MELAYU only. Facts must be 100% accurate to Malaysian KSSR Sejarah syllabus (Darjah 4-6) — tokoh, peristiwa, kemerdekaan, warisan negara.',
  rbt: 'Write ALL questions, options, and content in BAHASA MELAYU only. Follow Malaysian KSSR Reka Bentuk dan Teknologi syllabus — alatan tangan, bahan, teknologi, pertanian, sains rumah tangga, asas elektrik.',
  pjk: 'Write ALL questions, options, and content in BAHASA MELAYU only. Follow Malaysian KSSR Pendidikan Jasmani dan Kesihatan syllabus — kemahiran pergerakan, kecergasan, kesihatan diri, pemakanan, keselamatan.',
  seni: 'Write ALL questions, options, and content in BAHASA MELAYU only. Follow Malaysian KSSR Pendidikan Seni Visual syllabus — warna, garisan, bentuk, ruang, lukisan, kraf tangan, seni budaya.',
};

function buildPrompt({ ageGroup, darjah, category, topic, gameIndex }) {
  const level = darjah || ageGroup;
  const subjectLabel = SUBJECT_LABELS[category];
  const ageDesc = AGE_BAND[level];
  const langRule = SUBJECT_LANG_RULE[category];

  return `You are an expert Malaysian KSSR/Prasekolah curriculum designer creating a 10-question quiz game.

GAME CONTEXT:
- Subject: ${subjectLabel}
- Level: ${ageDesc}
- Specific Topic: "${topic}"
- Game number: ${gameIndex + 1}

LANGUAGE RULE: ${langRule}

CRITICAL QUALITY RULES:
1. Generate EXACTLY 10 questions, all focused on the topic "${topic}".
2. Each question must have EXACTLY 4 options (A, B, C, D).
3. "answer" field is the index (0=A, 1=B, 2=C, 3=D) of the correct option. RANDOMIZE — don't always put correct at index 0.
4. Facts MUST be 100% accurate. Double-check before answering.
5. Distractors (wrong options) must be plausible but clearly wrong. No silly options like "Banana" for a math question.
6. Difficulty must match the level — not too easy, not too hard.
7. Each question should test a different sub-aspect of the topic.
8. Include a relevant emoji for each question.
9. No language mixing. Stick to the LANGUAGE RULE above strictly.
10. No duplicate questions.

Also provide a game title and description matching the topic.

Return ONLY valid JSON:
{
  "title": "Game title in correct language (5-6 words max)",
  "emoji": "single relevant emoji",
  "description": "One-line description in correct language",
  "questions": [
    { "problem": "...", "options": ["...","...","...","..."], "answer": 0-3, "emoji": "🎯" }
  ]
}`;
}

function validateGame(game, category) {
  const errors = [];
  if (!game.title) errors.push('missing title');
  if (!Array.isArray(game.questions) || game.questions.length !== 10) errors.push(`questions count: ${game.questions?.length}`);

  (game.questions || []).forEach((q, i) => {
    if (!q.problem || q.problem.length < 5) errors.push(`Q${i+1}: bad problem`);
    if (!Array.isArray(q.options) || q.options.length !== 4) errors.push(`Q${i+1}: not 4 options`);
    if (typeof q.answer !== 'number' || q.answer < 0 || q.answer > 3) errors.push(`Q${i+1}: bad answer index`);
    if (new Set(q.options).size !== 4) errors.push(`Q${i+1}: duplicate options`);

    // Language mixing check (BM subjects shouldn't have heavy English)
    if (['bahasa_melayu', 'science', 'mathematics', 'jawi', 'pendidikan_islam', 'pendidikan_moral', 'sejarah', 'rbt', 'pjk', 'seni'].includes(category)) {
      const text = q.problem + ' ' + q.options.join(' ');
      const englishWords = ['the ', 'is ', 'are ', 'what ', 'which ', 'where ', 'how ', 'when ', 'this ', 'that '];
      const englishCount = englishWords.filter(w => text.toLowerCase().includes(w)).length;
      if (englishCount >= 2) errors.push(`Q${i+1}: language mixing detected`);
    }
  });

  return errors;
}

async function generateOneGame(base44, { ageGroup, darjah, category, topic, gameIndex }) {
  const prompt = buildPrompt({ ageGroup, darjah, category, topic, gameIndex });

  let attempt = 0;
  while (attempt < 2) {
    attempt++;
    try {
      // KAFA subjects use a more lenient model — opus kadang refuse religious content
      const isKafa = category.startsWith('kafa_');
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        model: isKafa ? 'gpt_5_5' : 'claude_opus_4_7',
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            emoji: { type: 'string' },
            description: { type: 'string' },
            questions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  problem: { type: 'string' },
                  options: { type: 'array', items: { type: 'string' } },
                  answer: { type: 'number' },
                  emoji: { type: 'string' },
                },
                required: ['problem', 'options', 'answer'],
              },
            },
          },
          required: ['title', 'questions'],
        },
      });

      // Unwrap nested response — claude_sonnet_4_6 sometimes wraps in {response: ...}
      let game = result;
      if (result?.response && typeof result.response === 'object') game = result.response;
      else if (result?.response && typeof result.response === 'string') {
        try { game = JSON.parse(result.response); } catch (e) { /* keep result */ }
      }
      if (!game?.questions && game?.game) game = game.game;

      const errors = validateGame(game, category);
      if (errors.length === 0) {
        return { ok: true, game };
      }
      console.log(`Attempt ${attempt} validation errors:`, errors.slice(0, 3), 'raw keys:', Object.keys(result || {}));
    } catch (e) {
      console.log(`Attempt ${attempt} failed:`, e.message);
    }
  }
  return { ok: false, error: 'Failed validation after 2 attempts' };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { ageGroup, darjah, category, targetCount = 30, dryRun = false, internalCall = false } = body;

    // Skip admin check for internal calls from background generator (service role context)
    if (!internalCall) {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
      }
    }
    if (!ageGroup || !category) {
      return Response.json({ error: 'ageGroup and category required' }, { status: 400 });
    }

    // Count existing in this bucket
    const filter = { ageGroup, category, isPublished: true };
    if (darjah) filter.darjah = darjah;
    const existing = await base44.asServiceRole.entities.Game.filter(filter);
    const needed = Math.max(0, targetCount - existing.length);

    if (needed === 0) {
      return Response.json({
        success: true,
        message: `Already has ${existing.length} games. No generation needed.`,
        existing: existing.length,
        generated: 0,
      });
    }

    const levelKey = darjah || ageGroup;
    const topics = DARJAH_TOPICS[levelKey]?.[category] || [];
    if (topics.length === 0) {
      return Response.json({ error: `No topics defined for ${levelKey} / ${category}` }, { status: 400 });
    }

    // Pick topics avoiding existing titles (rough match)
    const existingTitles = new Set(existing.map(g => (g.title || '').toLowerCase()));
    const remainingTopics = topics.filter(t => !Array.from(existingTitles).some(et => et.includes(t.toLowerCase().slice(0, 10))));
    const topicsToUse = remainingTopics.slice(0, needed);

    if (topicsToUse.length === 0) {
      return Response.json({
        success: true,
        message: `Bucket already has games covering all topics`,
        existing: existing.length,
        generated: 0,
      });
    }

    if (dryRun) {
      return Response.json({
        success: true,
        dryRun: true,
        existing: existing.length,
        toGenerate: topicsToUse.length,
        topics: topicsToUse,
      });
    }

    let inserted = 0;
    let failed = 0;
    const failedTopics = [];

    // Generate one at a time to avoid timeout — limit to 5 per call (Deno function ~180s timeout safety)
    const batchSize = Math.min(topicsToUse.length, 5);
    for (let i = 0; i < batchSize; i++) {
      const topic = topicsToUse[i];
      const gameIndex = existing.length + i;
      const result = await generateOneGame(base44, { ageGroup, darjah, category, topic, gameIndex });

      if (result.ok) {
        const g = result.game;
        await base44.asServiceRole.entities.Game.create({
          title: g.title,
          description: g.description || `Topik: ${topic}`,
          type: 'multiple_choice',
          category,
          ageGroup,
          darjah: darjah || null,
          difficulty: gameIndex < 10 ? 'easy' : gameIndex < 20 ? 'medium' : 'hard',
          tier: gameIndex < 5 ? 'free' : gameIndex < 15 ? 'premium' : 'pro',
          emoji: g.emoji || '🎮',
          totalQuestions: g.questions.length,
          gameData: {
            questions: g.questions.map(q => ({
              type: 'multiple_choice',
              problem: q.problem,
              options: q.options,
              answer: q.answer,
              emoji: q.emoji || g.emoji || '🎯',
            })),
          },
          isPublished: true,
          status: 'ready',
          order: gameIndex + 1,
          monthTag: new Date().toISOString().slice(0, 7), // YYYY-MM auto, bukan hardcoded
        });
        inserted++;
      } else {
        failed++;
        failedTopics.push(topic);
      }
    }

    const stillNeeded = needed - inserted;

    return Response.json({
      success: true,
      bucket: `${ageGroup}${darjah ? '/' + darjah : ''}/${category}`,
      existing: existing.length,
      generated: inserted,
      failed,
      failedTopics,
      stillNeeded,
      message: stillNeeded > 0
        ? `✅ Generated ${inserted}/${batchSize}. Run again to continue (${stillNeeded} more needed).`
        : `✅ Bucket complete with ${existing.length + inserted} games.`,
    });
  } catch (error) {
    console.error('launchGenerateBatch error:', error);
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});