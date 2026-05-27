// generateAllKafa — Loop generator untuk semua 42 KAFA buckets (7 subjek × 6 darjah)
// Self-contained: panggil InvokeLLM terus, simpan ke DB. Tak rely on launchGenerateBatch.
// Payload: { targetCount = 10, maxGames = 5 } — max games to generate per call (timeout safety)
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const KAFA_SUBJECTS = ['kafa_quran', 'kafa_jawi', 'kafa_akidah', 'kafa_ibadah', 'kafa_sirah', 'kafa_adab', 'kafa_bahasa_arab'];
const DARJAHS = ['darjah_1', 'darjah_2', 'darjah_3', 'darjah_4', 'darjah_5', 'darjah_6'];

const SUBJECT_LABELS = {
  kafa_quran: 'KAFA Al-Quran & Hafazan (bacaan, tajwid asas, hafazan surah pendek)',
  kafa_jawi: 'KAFA Jawi & Khat (tulisan Jawi rasmi DBP, ejaan, khat naskhi)',
  kafa_akidah: 'KAFA Akidah Islam (rukun iman, sifat Allah, kepercayaan asas)',
  kafa_ibadah: 'KAFA Ibadah & Fekah (rukun Islam, solat, wuduk, puasa, zakat, haji)',
  kafa_sirah: 'KAFA Sirah Nabawiyah (sejarah Nabi Muhammad SAW, para sahabat, peristiwa Islam)',
  kafa_adab: 'KAFA Adab & Akhlak Islamiah (adab harian, akhlak mahmudah & mazmumah)',
  kafa_bahasa_arab: 'KAFA Bahasa Arab (kosa kata, ayat mudah, perbualan harian)',
};

const SUBJECT_LANG_RULE = {
  kafa_quran: 'Write questions in BAHASA MELAYU. Include actual Arabic Quranic verses or words (with proper Arabic script) where relevant. Mention surah names accurately. Facts MUST be verified — use only authentic Islamic sources.',
  kafa_jawi: 'Write questions in BAHASA MELAYU. Include Jawi script (Arabic-Malay characters) extensively in options and problems. Follow rasmi DBP Jawi spelling.',
  kafa_akidah: 'Write ALL questions and options in BAHASA MELAYU only. Use proper Islamic terms (rukun iman, sifat wajib Allah). Facts MUST follow Ahlus Sunnah wal Jamaah aqidah only.',
  kafa_ibadah: 'Write ALL questions and options in BAHASA MELAYU only. Use proper fiqh terms (rukun, syarat, wajib, sunat). Follow Shafie mazhab (mainstream in Malaysia). Facts MUST be accurate.',
  kafa_sirah: 'Write ALL questions and options in BAHASA MELAYU only. Use proper honorifics (Nabi Muhammad SAW, para sahabat RA). Historical facts MUST be 100% accurate — verify before writing.',
  kafa_adab: 'Write ALL questions and options in BAHASA MELAYU only. Focus on practical Islamic adab — adab makan, tidur, belajar, dengan ibu bapa, dll.',
  kafa_bahasa_arab: 'Include Arabic words/phrases in proper Arabic script in options. Questions can be in BAHASA MELAYU asking about Arabic vocabulary, simple phrases, or basic grammar. Level must match the darjah.',
};

const AGE_DESC = {
  darjah_1: 'Year 1 KAFA students aged 7 (very simple Islamic concepts, basic vocabulary)',
  darjah_2: 'Year 2 KAFA students aged 8 (introductory Islamic studies)',
  darjah_3: 'Year 3 KAFA students aged 9 (intermediate KAFA syllabus)',
  darjah_4: 'Year 4 KAFA students aged 10 (intermediate-advanced KAFA syllabus)',
  darjah_5: 'Year 5 KAFA students aged 11 (advanced KAFA preparation)',
  darjah_6: 'Year 6 KAFA students aged 12 (UPKK preparation — comprehensive review)',
};

// Topic library — minimal 10 topics per (darjah, subject) bucket
const TOPICS = {
  darjah_1: {
    kafa_quran: ['Mengenal huruf hijaiyah Alif Ba Ta', 'Mengenal huruf hijaiyah Tha Jim Ha', 'Mengenal huruf hijaiyah Kha Dal Zal', 'Baris atas fathah pada huruf', 'Baris bawah kasrah pada huruf', 'Baris hadapan dommah pada huruf', 'Hafazan Surah Al-Fatihah ayat 1-3', 'Hafazan Surah Al-Fatihah ayat 4-7', 'Adab membaca Al-Quran', 'Bacaan basmalah & taawuz', 'Mengenal mushaf Al-Quran', 'Surah pendek An-Nas pengenalan'],
    kafa_jawi: ['Huruf Jawi tunggal Alif Ba Ta Tha', 'Huruf Jawi Jim Ca Ha Kha', 'Huruf Jawi Dal Zal Ra Zai', 'Huruf Jawi tambahan (Ca, Nga, Pa, Ga, Nya, Va)', 'Padan Jawi-Rumi huruf tunggal', 'Eja nama sendiri dalam Jawi', 'Eja "saya", "ayah", "ibu" dalam Jawi', 'Nombor 1-10 dalam Jawi', 'Tulis arah Jawi kanan ke kiri', 'Perkataan mudah 2 huruf Jawi'],
    kafa_akidah: ['Rukun Iman 6 perkara pengenalan', 'Beriman kepada Allah SWT', 'Allah Maha Pencipta', 'Allah Maha Mengasihani', 'Allah Maha Melihat dan Mendengar', 'Mengenal nama Allah (Asmaul Husna asas)', 'Beriman kepada Malaikat', 'Tugas Malaikat (Jibril, Mikail, Israfil)', 'Kalimah Syahadah', 'Maksud Lailahaillallah'],
    kafa_ibadah: ['Rukun Islam 5 perkara', 'Rukun Iman 6 perkara', 'Cara berwuduk langkah 1-3', 'Cara berwuduk langkah 4-6', 'Perkara membatalkan wuduk', 'Solat 5 waktu (nama & waktu)', 'Bilangan rakaat solat fardhu', 'Bacaan niat solat', 'Bacaan Al-Fatihah dalam solat', 'Adab masuk masjid'],
    kafa_sirah: ['Nama penuh Nabi Muhammad SAW', 'Tarikh & tempat kelahiran Nabi', 'Nama ayah & ibu Nabi (Abdullah & Aminah)', 'Datuk Nabi (Abdul Muttalib)', 'Bapa saudara Nabi (Abu Talib)', 'Ibu susuan Nabi (Halimah Sa\'diah)', 'Sifat Nabi sebagai Al-Amin', 'Pekerjaan Nabi semasa muda (mengembala)', 'Isteri pertama Nabi (Siti Khadijah)', 'Anak-anak Nabi Muhammad SAW'],
    kafa_adab: ['Adab makan & minum (mulakan bismillah)', 'Adab tidur (doa sebelum tidur)', 'Adab masuk tandas (kaki kiri dulu)', 'Adab keluar tandas (kaki kanan)', 'Adab dengan ibu bapa (cium tangan)', 'Adab di sekolah (hormat guru)', 'Adab memberi salam', 'Adab menjawab salam', 'Adab berkawan (jujur, baik)', 'Adab bercakap (sopan, tidak menjerit)'],
    kafa_bahasa_arab: ['Huruf hijaiyah Arab Alif sampai Jim', 'Huruf hijaiyah Arab Ha sampai Zai', 'Salam: As-salamu alaikum & jawapan', 'Perkataan Arab: ana (saya), anta (kamu)', 'Nama keluarga Arab: abi (ayah), ummi (ibu)', 'Bilangan Arab 1-5 (wahid, ithnan, thalatha, arba\'a, khamsa)', 'Warna Arab: ahmar (merah), asfar (kuning)', 'Haiwan Arab: qittun (kucing), kalbun (anjing)', 'Anggota badan: ra\'s (kepala), yad (tangan)', 'Buah Arab: tuffah (epal), mawz (pisang)'],
  },
  darjah_2: {
    kafa_quran: ['Huruf hijaiyah Ra Zai Sin Syin', 'Huruf hijaiyah Sod Dod Tho Zho', 'Huruf hijaiyah Ain Ghain Fa Qaf', 'Huruf hijaiyah Kaf Lam Mim Nun Wau Ha Ya', 'Tanda sukun (huruf mati)', 'Hafazan Surah An-Nas', 'Hafazan Surah Al-Falaq', 'Hafazan Surah Al-Ikhlas', 'Adab membaca Al-Quran lanjutan', 'Wajah-wajah huruf hijaiyah (awal, tengah, akhir)'],
    kafa_jawi: ['Huruf Jawi bersambung depan & belakang', 'Eja nama bulan Hijrah dalam Jawi', 'Eja nama hari (Ahad, Isnin, Selasa) Jawi', 'Eja nama negeri Malaysia dalam Jawi', 'Perkataan 3 suku kata Jawi', 'Bacaan ayat Jawi pendek', 'Padan ayat Jawi-Rumi', 'Tulis alamat sendiri dalam Jawi', 'Doa makan dalam Jawi', 'Doa tidur dalam Jawi'],
    kafa_akidah: ['Rukun Iman 6 perkara terperinci', 'Sifat wajib Allah (Wujud, Qidam, Baqa)', 'Sifat mustahil bagi Allah', 'Beriman kepada Kitab-kitab Allah', 'Kitab Taurat, Zabur, Injil, Al-Quran', 'Beriman kepada Rasul-rasul Allah', 'Bilangan Rasul yang wajib diketahui (25)', 'Beriman kepada Hari Akhirat', 'Beriman kepada Qada & Qadar', 'Pengertian Tauhid Rububiyyah & Uluhiyyah'],
    kafa_ibadah: ['Wuduk lengkap dengan sunat-sunatnya', 'Perkara membatalkan wuduk lanjutan', 'Tayammum (ganti wuduk)', 'Syarat sah solat', 'Rukun solat 13 perkara', 'Perkara membatalkan solat', 'Bacaan rukuk & sujud', 'Bacaan tahiyat awal & akhir', 'Solat berjemaah pengenalan', 'Adab dalam masjid'],
    kafa_sirah: ['Nabi Muhammad mendapat wahyu pertama', 'Tempat wahyu pertama (Gua Hira)', 'Malaikat Jibril menyampaikan wahyu', 'Wahyu pertama (Iqra\' bismi rabbik)', 'Dakwah secara sembunyi 3 tahun', 'Para sahabat awal masuk Islam', 'Abu Bakar As-Siddiq sahabat pertama lelaki', 'Khadijah binti Khuwailid isteri & sahabat pertama', 'Ali bin Abi Talib kanak-kanak pertama Islam', 'Penindasan kafir Quraisy ke atas umat Islam awal'],
    kafa_adab: ['Adab di masjid (tidak bercakap kuat)', 'Adab membaca Al-Quran (berwuduk)', 'Adab berdoa (angkat tangan, ikhlas)', 'Adab terhadap jiran', 'Adab terhadap guru di sekolah', 'Adab makan secara berjemaah', 'Adab dalam perjalanan', 'Adab menjaga kebersihan', 'Adab menjaga lidah (tidak mengumpat)', 'Adab membantu rakan'],
    kafa_bahasa_arab: ['Huruf hijaiyah Arab lengkap 28', 'Bilangan Arab 6-10 (sittah, sab\'a, thamaniyah, tis\'a, asyarah)', 'Hari dalam Arab (al-ahad, al-ithnain, al-thulatha)', 'Bulan Hijrah dalam Arab (Muharram, Safar, Rabiul Awal)', 'Anggota keluarga Arab (akhi, ukhti, jaddi)', 'Pekerjaan Arab (mudarris-guru, tabib-doktor)', 'Bahagian rumah Arab (bait-rumah, bab-pintu)', 'Bahagian sekolah (madrasah, kitab, qalam)', 'Soal jawab mudah: ma ismuka? (apa nama kamu?)', 'Perbualan mudah: kaifa haluk? (apa khabar?)'],
  },
  darjah_3: {
    kafa_quran: ['Tajwid asas: Mad asli (panjang 2 harakat)', 'Hukum Nun mati & Tanwin: Izhar', 'Hukum Nun mati & Tanwin: Idgham', 'Hukum Nun mati & Tanwin: Iqlab & Ikhfa', 'Hafazan Surah Al-Kauthar', 'Hafazan Surah Al-Asr', 'Hafazan Surah Al-Humazah', 'Hafazan Surah Al-Fil', 'Adab terhadap Al-Quran (menyentuh dalam wuduk)', 'Pengertian beberapa ayat pendek'],
    kafa_jawi: ['Eja perkataan berimbuhan Jawi', 'Tulisan khat naskhi asas', 'Karangan Jawi 5 ayat (cerita)', 'Surat Jawi tidak rasmi (kepada kawan)', 'Bacaan petikan Jawi sederhana', 'Padan ayat Jawi-Rumi panjang', 'Terjemahan ayat Jawi ke Rumi', 'Tulis nama-nama sahabat Nabi dalam Jawi', 'Tulis doa harian dalam Jawi', 'Surah pendek tulisan Jawi'],
    kafa_akidah: ['Sifat 20 Allah pengenalan: Wajibul Wujud', 'Sifat Salbiyyah Allah (Qidam, Baqa)', 'Sifat Ma\'ani Allah (Qudrat, Iradat)', '25 Rasul wajib diketahui (nama-nama)', 'Mukjizat Nabi-nabi terpilih', 'Ulul Azmi 5 Rasul (Nuh, Ibrahim, Musa, Isa, Muhammad)', 'Perbezaan Nabi dan Rasul', 'Sifat-sifat wajib Rasul (Siddiq, Amanah, Tabligh, Fathonah)', 'Pengertian Akhirat', 'Tanda-tanda kiamat kecil'],
    kafa_ibadah: ['Solat lima waktu bilangan rakaat', 'Bacaan iftitah dalam solat', 'Sujud sahwi (sujud kelupaan)', 'Solat berjemaah cara & adab', 'Kedudukan imam & makmum', 'Solat Jumaat hukum & syarat', 'Khutbah Jumaat', 'Adab masuk masjid (kaki kanan, doa)', 'Solat sunat Rawatib', 'Solat Sunat Tahajjud pengenalan'],
    kafa_sirah: ['Hijrah Nabi ke Madinah', 'Sebab hijrah ke Madinah', 'Gua Thur dalam hijrah', 'Pembinaan Masjid Quba', 'Pembinaan Masjid Nabawi', 'Piagam Madinah', 'Perang Badar (perang pertama)', 'Perang Uhud', 'Perang Khandak', 'Pembukaan Mekah (Fathu Makkah)'],
    kafa_adab: ['Adab ziarah orang sakit', 'Adab di rumah (membantu kerja rumah)', 'Adab memberi & menerima hadiah', 'Adab makan secara Islam (kanan, duduk)', 'Adab tidur (wuduk dulu, doa)', 'Adab kepada kitab Al-Quran', 'Adab dengan adik beradik', 'Adab menjaga maruah diri', 'Adab berpakaian (menutup aurat)', 'Adab menghormati orang tua'],
    kafa_bahasa_arab: ['Kosa kata haiwan: ghazal (rusa), thaalab (musang), jamal (unta)', 'Kosa kata buah: burtuqal (oren), inab (anggur)', 'Warna lengkap: abyad (putih), aswad (hitam), akhdar (hijau)', 'Hari dalam Arab lengkap 7 hari', 'Bulan dalam Arab Hijrah lengkap', 'Bilangan Arab 11-20', 'Soal jawab: ayna...? (di mana...?)', 'Perbualan: min ayna anta? (kamu dari mana?)', 'Kosa kata sekolah: mu\'allim (cikgu), tilmiz (pelajar)', 'Doa harian dalam Arab: bismillah, alhamdulillah, insya Allah'],
  },
  darjah_4: {
    kafa_quran: ['Tajwid: Hukum Mim mati (Ikhfa Syafawi, Idgham Mithli, Izhar)', 'Tajwid: Qalqalah (sughra & kubra)', 'Tajwid: Mad asli & mad bertemu hamzah', 'Hafazan Surah Al-Maun', 'Hafazan Surah Quraisy', 'Hafazan Surah Al-Adiyat', 'Hafazan Surah Az-Zalzalah', 'Hafazan Surah Al-Bayyinah', 'Pengertian surah Al-Fatihah', 'Adab kepada Al-Quran lanjutan'],
    kafa_jawi: ['Ejaan Jawi sistematik DBP lanjutan', 'Khat naskhi (huruf bersambung lengkap)', 'Karangan Jawi sederhana 8-10 ayat', 'Surat Jawi rasmi (kepada guru)', 'Bacaan teks Jawi panjang', 'Pemahaman teks Jawi (jawab soalan)', 'Terjemahan ayat Jawi ke Rumi lanjutan', 'Tulis biodata diri dalam Jawi', 'Tulis hadis pendek dalam Jawi', 'Tulis nama-nama Asmaul Husna dalam Jawi'],
    kafa_akidah: ['Sifat 20 Allah lengkap', 'Sifat Wajib, Mustahil, Harus Allah', 'Sifat Ma\'nawiyyah Allah', '25 Rasul nama & tugas masing-masing', 'Kisah Nabi Adam AS', 'Kisah Nabi Nuh AS', 'Kisah Nabi Ibrahim AS', 'Kisah Nabi Musa AS', 'Kisah Nabi Isa AS', 'Mukjizat Nabi Muhammad SAW (Al-Quran)'],
    kafa_ibadah: ['Solat fardhu lengkap (rukun, syarat, wajib, sunat)', 'Sujud sahwi waktu & cara', 'Sujud tilawah & syukur', 'Puasa Ramadhan hukum & syarat', 'Perkara membatalkan puasa', 'Sunat-sunat puasa', 'Zakat fitrah pengenalan', 'Kadar zakat fitrah', 'Solat sunat Aidilfitri & Aidiladha', 'Solat jenazah pengenalan'],
    kafa_sirah: ['Khulafa Ar-Rasyidin (4 khalifah)', 'Saidina Abu Bakar As-Siddiq', 'Saidina Umar bin Al-Khattab', 'Saidina Uthman bin Affan', 'Saidina Ali bin Abi Talib', '10 Sahabat dijamin syurga', 'Bilal bin Rabah (muazzin pertama)', 'Khadijah binti Khuwailid', 'Aisyah binti Abu Bakar', 'Fatimah Az-Zahra (puteri Nabi)'],
    kafa_adab: ['Akhlak terpuji: Jujur (siddiq)', 'Akhlak terpuji: Amanah', 'Akhlak terpuji: Sabar', 'Akhlak terpuji: Tolong-menolong', 'Akhlak tercela: Bohong (kazib)', 'Akhlak tercela: Khianat', 'Akhlak tercela: Marah berlebihan', 'Akhlak tercela: Tamak (rakus)', 'Adab dalam majlis ilmu', 'Adab terhadap binatang & alam sekitar'],
    kafa_bahasa_arab: ['Kata ganti nama: ana, anta, anti, huwa, hiya', 'Kata kerja Arab asas: yaktub (menulis), yaqra\' (membaca)', 'Ayat nominal mudah (jumlah ismiyyah)', 'Ayat verbal mudah (jumlah fi\'liyyah)', 'Kosa kata pakaian: qamis (baju), sirwal (seluar)', 'Kosa kata makanan: khubz (roti), labn (susu)', 'Kosa kata waktu: sabah (pagi), masa\' (petang)', 'Doa harian Arab lengkap: doa makan, tidur', 'Soal jawab: kam umruk? (umur kamu berapa?)', 'Asmaul Husna asas: Ar-Rahman, Ar-Rahim, Al-Malik'],
  },
  darjah_5: {
    kafa_quran: ['Tajwid lengkap: Idgham Mutamathilain, Mutaqaribain, Mutajanisain', 'Tajwid: Mad far\'i jenis-jenis', 'Tajwid: Waqaf dan ibtida\'', 'Hafazan Surah At-Tin', 'Hafazan Surah Al-Alaq', 'Hafazan Surah Al-Qadr', 'Hafazan Surah Al-Lail', 'Hafazan Surah Asy-Syams', 'Hafazan Surah Al-Balad', 'Pengertian Surah Al-Ikhlas'],
    kafa_jawi: ['Khat naskhi lengkap & riq\'ah pengenalan', 'Karangan Jawi panjang (15 ayat)', 'Surat Jawi rasmi (kepada pengetua)', 'Karangan deskriptif Jawi (huraian)', 'Karangan naratif Jawi (cerita)', 'Petikan Jawi gaya UPKK', 'Pemahaman Jawi (jawab soalan KBAT)', 'Terjemahan ayat panjang Jawi-Rumi', 'Tulis hadis 40 dalam Jawi (pilihan)', 'Tulis bab fiqh dalam Jawi'],
    kafa_akidah: ['Tauhid Rububiyyah, Uluhiyyah, Asma wa Sifat', 'Syirik kecil & besar (perbezaan)', 'Bahaya syirik & cara menghindari', 'Hari Akhirat: tanda-tanda kiamat besar', 'Hari kiamat: peristiwa di mahsyar', 'Syurga & sifat-sifatnya', 'Neraka & sifat-sifatnya', 'Qada & Qadar pengertian', 'Beriman kepada Qada & Qadar', 'Hubungan Qada Qadar dengan usaha (ikhtiar)'],
    kafa_ibadah: ['Solat sunat Rawatib (qabliyyah & ba\'diyyah)', 'Solat sunat Tahajjud cara', 'Solat sunat Dhuha', 'Solat sunat Tarawih', 'Solat sunat Witir', 'Puasa sunat (Isnin Khamis, Ayyamul Bidh)', 'Zakat harta jenis-jenis (emas, perak, perniagaan)', 'Nisab & kadar zakat harta', 'Haji rukun & wajib', 'Umrah cara & rukun'],
    kafa_sirah: ['Tahun-tahun penting hijrah Nabi', 'Perjanjian Hudaibiyyah', 'Pembebasan Mekah (Fathu Makkah)', 'Haji Wida\' (haji perpisahan)', 'Wafatnya Rasulullah SAW', 'Pemilihan Khalifah Abu Bakar', 'Perang Riddah (Murtaddin)', 'Pengumpulan Al-Quran zaman Abu Bakar', 'Penaklukan zaman Umar (Syam, Mesir, Parsi)', 'Pembukuan Al-Quran zaman Uthman'],
    kafa_adab: ['Akhlak terpuji: Ikhlas', 'Akhlak terpuji: Tawaduk (rendah diri)', 'Akhlak terpuji: Syukur', 'Akhlak terpuji: Adil', 'Akhlak tercela: Riya\' (menunjuk-nunjuk)', 'Akhlak tercela: Takabbur (sombong)', 'Akhlak tercela: Hasad dengki', 'Akhlak tercela: Kufur nikmat', 'Adab dengan jiran (toleransi)', 'Adab dalam masyarakat (gotong-royong)'],
    kafa_bahasa_arab: ['Kata kerja madhi (lampau) - kataba (telah menulis)', 'Kata kerja mudhari\' (sekarang) - yaktub', 'Kata kerja amr (suruhan) - uktub!', 'Isim mufrad, mudhanna, jama\' (tunggal, dua, jamak)', 'Isim ma\'rifah & nakirah (al-)', 'Idhafah (gabungan kata)', 'Soal jawab lengkap: matha tadhhab? (bila kamu pergi?)', 'Doa selepas solat dalam Arab', 'Hadis pendek dalam Arab dengan terjemahan', 'Asmaul Husna 99 nama (10 pertama)'],
  },
  darjah_6: {
    kafa_quran: ['Tajwid review lengkap UPKK', 'Hafazan Surah Al-Insyirah', 'Hafazan Surah Ad-Dhuha', 'Hafazan Surah Al-Ghashiyah', 'Hafazan Surah Al-A\'la', 'Hafazan Surah At-Tariq', 'Hafazan Surah Al-Buruj', 'Hafazan Surah Al-Insyiqaq', 'Pengertian surah juzuk Amma pilihan', 'Soalan UPKK gaya Al-Quran & tajwid'],
    kafa_jawi: ['Khat naskhi lengkap UPKK', 'Karangan Jawi gaya UPKK (15-20 ayat)', 'Surat Jawi semua format (rasmi & tidak rasmi)', 'Petikan Jawi gaya UPKK', 'Pemahaman Jawi soalan KBAT', 'Terjemahan Jawi-Rumi ayat panjang', 'Penulisan kreatif Jawi (cerita pendek)', 'Tulis ringkasan dalam Jawi', 'Tulis pengalaman dalam Jawi', 'Soalan latih tubi UPKK Jawi'],
    kafa_akidah: ['Rukun Iman 6 lengkap dengan dalil', 'Sifat 20 Allah lengkap dengan maksud', 'Sifat Mustahil 20 lengkap', '25 Rasul lengkap dengan mukjizat', 'Hari Akhirat lengkap (mahsyar, mizan, syurga, neraka)', 'Qada & Qadar dengan contoh', 'Beriman kepada kitab-kitab Allah (4 kitab utama)', 'Beriman kepada malaikat (10 nama malaikat utama)', 'Soalan UPKK gaya Akidah', 'Bahaya syirik & cara mengelakkannya'],
    kafa_ibadah: ['Solat fardhu lengkap untuk UPKK', 'Solat sunat semua jenis', 'Wuduk, tayammum, mandi wajib lengkap', 'Puasa Ramadhan & puasa sunat lengkap', 'Zakat fitrah & zakat harta lengkap', 'Haji rukun, wajib, sunat lengkap', 'Umrah cara & rukun lengkap', 'Solat jenazah lengkap (rukun & cara)', 'Sembelihan & korban (qurban & akikah)', 'Soalan UPKK gaya Ibadah & Fekah'],
    kafa_sirah: ['Sirah Nabi Muhammad SAW lengkap (kelahiran hingga wafat)', 'Khulafa Ar-Rasyidin 4 orang lengkap', '10 sahabat dijamin syurga lengkap', 'Tokoh-tokoh Islam (Umar Abdul Aziz, Salahuddin Al-Ayyubi)', 'Wanita-wanita teladan Islam (Khadijah, Aisyah, Fatimah)', 'Perang-perang utama zaman Nabi (Badar, Uhud, Khandak, Fathu Makkah)', 'Hijrah ke Habsyah & Madinah', 'Piagam Madinah & Perjanjian Hudaibiyyah', 'Penyebaran Islam zaman Khulafa Ar-Rasyidin', 'Soalan UPKK gaya Sirah'],
    kafa_adab: ['Akhlak terpuji lengkap (10 sifat utama)', 'Akhlak tercela lengkap (10 sifat utama)', 'Adab harian lengkap (makan, tidur, tandas, masjid)', 'Adab dengan ibu bapa lengkap', 'Adab dengan guru & murid', 'Adab berkawan & jiran', 'Adab di masjid & Al-Quran', 'Adab menuntut ilmu', 'Adab terhadap binatang & alam', 'Soalan UPKK gaya Adab Islamiah'],
    kafa_bahasa_arab: ['Kata kerja Arab lengkap (madhi, mudhari\', amr)', 'Tasrif kata kerja (perubahan dhomir)', 'Isim mufrad, mudhanna, jama\' lengkap', 'Ayat nominal & verbal lanjutan', 'Asmaul Husna 99 nama lengkap', 'Doa-doa harian dalam Arab lengkap', 'Hadis pendek dalam Arab dengan terjemahan', 'Soalan UPKK Bahasa Arab gaya pilihan ganda', 'Perbualan Arab harian lengkap', 'Kosa kata Arab umum (sekolah, rumah, masyarakat) lengkap'],
  },
};

function buildPrompt({ darjah, category, topic, gameIndex }) {
  return `You are an expert Malaysian KAFA (Kelas Agama Fardhu Ain) curriculum designer creating a 10-question quiz game.

GAME CONTEXT:
- Subject: ${SUBJECT_LABELS[category]}
- Level: ${AGE_DESC[darjah]}
- Specific Topic: "${topic}"
- Game number: ${gameIndex + 1}

LANGUAGE RULE: ${SUBJECT_LANG_RULE[category]}

CRITICAL QUALITY RULES:
1. Generate EXACTLY 10 questions, all focused on the topic "${topic}".
2. Each question must have EXACTLY 4 options (A, B, C, D).
3. "answer" field is the index (0=A, 1=B, 2=C, 3=D) of the correct option. RANDOMIZE — don't always put correct at index 0.
4. Facts MUST be 100% accurate — Islamic facts must be verified against authentic sources.
5. Distractors (wrong options) must be plausible but clearly wrong.
6. Difficulty must match the level — KAFA students at this darjah.
7. Each question should test a different sub-aspect of the topic.
8. Include a relevant emoji for each question (e.g. 📖, 🕌, ☪️).
9. No language mixing. Stick to the LANGUAGE RULE strictly.
10. No duplicate questions.

Return ONLY valid JSON:
{
  "title": "Game title in BAHASA MELAYU (5-7 words)",
  "emoji": "single relevant emoji",
  "description": "One-line description",
  "questions": [
    { "problem": "...", "options": ["...","...","...","..."], "answer": 0-3, "emoji": "🎯" }
  ]
}`;
}

function validateGame(game) {
  if (!game?.title || !Array.isArray(game?.questions) || game.questions.length !== 10) return false;
  for (const q of game.questions) {
    if (!q.problem || q.problem.length < 5) return false;
    if (!Array.isArray(q.options) || q.options.length !== 4) return false;
    if (typeof q.answer !== 'number' || q.answer < 0 || q.answer > 3) return false;
    if (new Set(q.options).size !== 4) return false;
  }
  return true;
}

async function generateOneGame(base44, { darjah, category, topic, gameIndex }) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: buildPrompt({ darjah, category, topic, gameIndex }),
        model: 'gpt_5_mini',
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
      let game = result;
      if (result?.response && typeof result.response === 'object') game = result.response;
      if (validateGame(game)) return { ok: true, game };
    } catch (e) {
      console.log(`Attempt ${attempt + 1} failed:`, e.message);
    }
  }
  return { ok: false };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { targetCount = 10, maxGames = 5, internalCall = false } = body;

    if (!internalCall) {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
      }
    }

    // Find ALL incomplete buckets
    const needsWork = [];
    for (const darjah of DARJAHS) {
      for (const category of KAFA_SUBJECTS) {
        const existing = await base44.asServiceRole.entities.Game.filter({
          ageGroup: 'sekolah_rendah',
          darjah,
          category,
          isPublished: true,
        });
        if (existing.length < targetCount) {
          needsWork.push({ darjah, category, existing: existing.length });
        }
      }
    }

    if (needsWork.length === 0) {
      return Response.json({
        success: true,
        allComplete: true,
        message: `🎉 Semua 42 KAFA buckets dah ada ${targetCount}+ games!`,
      });
    }

    // Generate up to maxGames games total (across multiple buckets if needed)
    let totalGenerated = 0;
    let totalFailed = 0;
    const log = [];

    for (const b of needsWork) {
      if (totalGenerated + totalFailed >= maxGames) break;

      const topics = TOPICS[b.darjah]?.[b.category] || [];
      const remainingNeeded = targetCount - b.existing;
      const canDoThisBucket = Math.min(remainingNeeded, maxGames - totalGenerated - totalFailed);

      for (let i = 0; i < canDoThisBucket; i++) {
        const topic = topics[(b.existing + i) % topics.length];
        const gameIndex = b.existing + i;
        const result = await generateOneGame(base44, { darjah: b.darjah, category: b.category, topic, gameIndex });

        if (result.ok) {
          const g = result.game;
          await base44.asServiceRole.entities.Game.create({
            title: g.title,
            description: g.description || `KAFA · ${topic}`,
            type: 'multiple_choice',
            category: b.category,
            ageGroup: 'sekolah_rendah',
            darjah: b.darjah,
            difficulty: gameIndex < 4 ? 'easy' : gameIndex < 8 ? 'medium' : 'hard',
            tier: 'free',
            emoji: g.emoji || '🕌',
            totalQuestions: g.questions.length,
            gameData: {
              questions: g.questions.map((q) => ({
                type: 'multiple_choice',
                problem: q.problem,
                options: q.options,
                answer: q.answer,
                emoji: q.emoji || g.emoji || '🕌',
              })),
            },
            isPublished: true,
            status: 'ready',
            order: gameIndex + 1,
            monthTag: '2026-05',
          });
          totalGenerated++;
          log.push(`✅ ${b.darjah}/${b.category}: "${g.title}"`);
        } else {
          totalFailed++;
          log.push(`❌ ${b.darjah}/${b.category}: failed (${topic})`);
        }

        if (totalGenerated + totalFailed >= maxGames) break;
      }
    }

    return Response.json({
      success: true,
      totalGenerated,
      totalFailed,
      bucketsRemaining: needsWork.length,
      message: `Generated ${totalGenerated} (${totalFailed} failed). ${needsWork.length} buckets still under ${targetCount}. Call again to continue.`,
      log,
    });
  } catch (error) {
    console.error('generateAllKafa error:', error);
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});