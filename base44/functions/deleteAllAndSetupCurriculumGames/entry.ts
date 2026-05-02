import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// CURRICULUM-ALIGNED QUESTIONS (KSSR & PRASEKOLAH)
const CURRICULUM_QUESTIONS = {
  // PRASEKOLAH (Pre-school) - Age 4-6
  // Focus: Basic language, numeracy, socialization, creativity
  prasekolah_bahasa_melayu: [
    { problem: '🐔 Apakah nama haiwan yang berkokok?', options: ['Ayam', 'Anjing', 'Kucing', 'Kuda'], answer: 0, emoji: '🐔' },
    { problem: '✏️ Apa alat untuk menulis atau melukis?', options: ['Pensil', 'Sudu', 'Garpu', 'Cawan'], answer: 0, emoji: '✏️' },
    { problem: '🍎 Buah merah yang manis ini?', options: ['Epal', 'Pisang', 'Oren', 'Tembikai'], answer: 0, emoji: '🍎' },
    { problem: '🏠 Rumah kami ada berapa pintu?', options: ['Beberapa', 'Satu', 'Dua', 'Banyak'], answer: 0, emoji: '🏠' },
    { problem: '👩 Siapa mama saya?', options: ['Ibu', 'Ayah', 'Kakak', 'Abang'], answer: 0, emoji: '👩' },
    { problem: '📚 Apa yang kita baca di sekolah?', options: ['Buku', 'Mainan', 'Makanan', 'Kasut'], answer: 0, emoji: '📚' },
    { problem: '🌞 Siang hari terang kerana apa?', options: ['Matahari', 'Bulan', 'Bintang', 'Lampu'], answer: 0, emoji: '🌞' },
    { problem: '🎨 Warna apa yang suka anda?', options: ['Merah', 'Biru', 'Kuning', 'Semua warna'], answer: 0, emoji: '🎨' },
    { problem: '🍌 Buah kuning yang lembut ini?', options: ['Pisang', 'Mango', 'Nanas', 'Papaya'], answer: 0, emoji: '🍌' },
    { problem: '😊 Emosi bahagia ditunjukkan dengan?', options: ['Senyuman', 'Menangis', 'Marah', 'Tidur'], answer: 0, emoji: '😊' },
  ],
  prasekolah_english: [
    { problem: '🐕 This animal says woof woof', options: ['Dog', 'Cat', 'Cow', 'Pig'], answer: 0, emoji: '🐕' },
    { problem: '✏️ We use this to write or draw', options: ['Pencil', 'Spoon', 'Fork', 'Cup'], answer: 0, emoji: '✏️' },
    { problem: '🍎 This red fruit is sweet', options: ['Apple', 'Banana', 'Orange', 'Watermelon'], answer: 0, emoji: '🍎' },
    { problem: '🏠 My family lives in a', options: ['House', 'School', 'Park', 'Store'], answer: 0, emoji: '🏠' },
    { problem: '👨 My father is my', options: ['Dad', 'Mom', 'Sister', 'Brother'], answer: 0, emoji: '👨' },
    { problem: '📚 We read books at', options: ['School', 'Park', 'Home', 'Shop'], answer: 0, emoji: '📚' },
    { problem: '🌞 The sun is bright during', options: ['Day', 'Night', 'Morning', 'Evening'], answer: 0, emoji: '🌞' },
    { problem: '🎨 What color is the sky?', options: ['Blue', 'Red', 'Green', 'Yellow'], answer: 0, emoji: '🎨' },
    { problem: '🍌 This yellow fruit is soft', options: ['Banana', 'Mango', 'Pineapple', 'Papaya'], answer: 0, emoji: '🍌' },
    { problem: '😊 Happy feeling shown by', options: ['Smile', 'Crying', 'Angry', 'Sleeping'], answer: 0, emoji: '😊' },
  ],
  prasekolah_mathematics: [
    { problem: '1️⃣ Berapa banyak matahari di langit?', options: ['Satu', 'Dua', 'Tiga', 'Banyak'], answer: 0, emoji: '1️⃣' },
    { problem: '2️⃣ Berapa mata yang ada pada kita?', options: ['Dua', 'Satu', 'Tiga', 'Empat'], answer: 0, emoji: '2️⃣' },
    { problem: '3️⃣ Berapa sisi segitiga ada?', options: ['Tiga', 'Dua', 'Empat', 'Lima'], answer: 0, emoji: '3️⃣' },
    { problem: '4️⃣ Berapa roda kereta ada?', options: ['Empat', 'Dua', 'Tiga', 'Lima'], answer: 0, emoji: '4️⃣' },
    { problem: '5️⃣ Berapa jari dalam satu tangan?', options: ['Lima', 'Empat', 'Enam', 'Tiga'], answer: 0, emoji: '5️⃣' },
    { problem: '➕ Satu tambah satu = ?', options: ['Dua', 'Satu', 'Tiga', 'Kosong'], answer: 0, emoji: '➕' },
    { problem: '🔢 Nombor selepas lima ialah?', options: ['Enam', 'Empat', 'Tujuh', 'Lapan'], answer: 0, emoji: '🔢' },
    { problem: '⭕ Bentuk ini adalah?', options: ['Bulatan', 'Segi empat', 'Segitiga', 'Bintang'], answer: 0, emoji: '⭕' },
    { problem: '📏 Mana paling panjang?', options: ['Kereta api', 'Kereta', 'Basikal', 'Semut'], answer: 0, emoji: '📏' },
    { problem: '🎯 Berapa kaki burung ada?', options: ['Dua', 'Satu', 'Tiga', 'Empat'], answer: 0, emoji: '🎯' },
  ],
  prasekolah_science: [
    { problem: '🌱 Dari apa pokok tumbuh?', options: ['Benih', 'Batu', 'Air', 'Api'], answer: 0, emoji: '🌱' },
    { problem: '☀️ Siang terang kerana?', options: ['Matahari', 'Bulan', 'Bintang', 'Lampu'], answer: 0, emoji: '☀️' },
    { problem: '🌙 Malam gelap, cahaya dari?', options: ['Bulan', 'Bintang', 'Lampu', 'Api'], answer: 0, emoji: '🌙' },
    { problem: '💧 Pokok perlu apa untuk hidup?', options: ['Air', 'Garam', 'Gula', 'Minyak'], answer: 0, emoji: '💧' },
    { problem: '🦋 Serangga cantik yang terbang?', options: ['Rama-rama', 'Semut', 'Kecoa', 'Lipan'], answer: 0, emoji: '🦋' },
    { problem: '🐝 Serangga yang buat madu?', options: ['Lebah', 'Nyamuk', 'Lipas', 'Lalat'], answer: 0, emoji: '🐝' },
    { problem: '🌊 Sebab besar bumi basah?', options: ['Air', 'Tanah', 'Pasir', 'Batu'], answer: 0, emoji: '🌊' },
    { problem: '🌳 Apa yang beri oksigen?', options: ['Pokok', 'Batu', 'Logam', 'Plastik'], answer: 0, emoji: '🌳' },
    { problem: '❄️ Air yang beku dipanggil?', options: ['Ais', 'Salji', 'Embun', 'Hujan'], answer: 0, emoji: '❄️' },
    { problem: '🌺 Bunga yang harum adalah?', options: ['Bunga ros', 'Batu', 'Daun', 'Kayu'], answer: 0, emoji: '🌺' },
  ],
  
  // SEKOLAH RENDAH (Primary School) - Age 7-12
  // KSSR Curriculum aligned
  sekolah_rendah_bahasa_melayu: [
    { problem: '📖 Cerita khayalan tanpa fakta nyata disebut?', options: ['Fiksi', 'Biografi', 'Sejarah', 'Berita'], answer: 0, emoji: '📖' },
    { problem: '✍️ Proses menyusun cerita atau artikel adalah?', options: ['Penulisan', 'Bacaan', 'Pertuturan', 'Pendengaran'], answer: 0, emoji: '✍️' },
    { problem: '🔤 Gabungan huruf yang mempunyai makna?', options: ['Perkataan', 'Ayat', 'Bunyi', 'Suku kata'], answer: 0, emoji: '🔤' },
    { problem: '📚 Tempat menyimpan buku-buku ialah?', options: ['Perpustakaan', 'Kelas', 'Rumah', 'Taman'], answer: 0, emoji: '📚' },
    { problem: '💬 Perbualan antara dua orang dipanggil?', options: ['Dialog', 'Monolog', 'Cerita', 'Laporan'], answer: 0, emoji: '💬' },
    { problem: '🎭 Seni pertunjukan yang dimainkan pelakon?', options: ['Teater', 'Lukisan', 'Nyanyian', 'Tari'], answer: 0, emoji: '🎭' },
    { problem: '📝 Teks tentang kehidupan sebenar seseorang?', options: ['Biografi', 'Fiksi', 'Puisi', 'Drama'], answer: 0, emoji: '📝' },
    { problem: '🎬 Kisah yang dicerita dengan gambar bergerak?', options: ['Filem', 'Foto', 'Buku', 'Surat'], answer: 0, emoji: '🎬' },
    { problem: '📰 Laporan peristiwa semasa di akhbar?', options: ['Berita', 'Kolumun', 'Iklan', 'Cerita'], answer: 0, emoji: '📰' },
    { problem: '🌍 Cerita tradisional dari budaya kita?', options: ['Legenda', 'Novel', 'Puisi', 'Drama'], answer: 0, emoji: '🌍' },
  ],
  sekolah_rendah_english: [
    { problem: '📖 A story that is not real is called?', options: ['Fiction', 'Biography', 'History', 'News'], answer: 0, emoji: '📖' },
    { problem: '✍️ The process of creating a story is?', options: ['Writing', 'Reading', 'Speaking', 'Listening'], answer: 0, emoji: '✍️' },
    { problem: '🔤 A group of letters with meaning is?', options: ['Word', 'Sentence', 'Sound', 'Letter'], answer: 0, emoji: '🔤' },
    { problem: '📚 A place with many books is?', options: ['Library', 'Classroom', 'Home', 'Park'], answer: 0, emoji: '📚' },
    { problem: '💬 A talk between two people is?', options: ['Dialog', 'Monolog', 'Story', 'Report'], answer: 0, emoji: '💬' },
    { problem: '🎭 A performance by actors is called?', options: ['Theater', 'Painting', 'Song', 'Dance'], answer: 0, emoji: '🎭' },
    { problem: '📝 True story of a real person is?', options: ['Biography', 'Fiction', 'Poetry', 'Drama'], answer: 0, emoji: '📝' },
    { problem: '🎬 Story told with moving pictures is?', options: ['Film', 'Photo', 'Book', 'Letter'], answer: 0, emoji: '🎬' },
    { problem: '📰 Current events reported in newspaper?', options: ['News', 'Column', 'Advertisement', 'Story'], answer: 0, emoji: '📰' },
    { problem: '🌍 Old stories from our culture are?', options: ['Legend', 'Novel', 'Poetry', 'Drama'], answer: 0, emoji: '🌍' },
  ],
  sekolah_rendah_mathematics: [
    { problem: '🔢 Hasil 7 + 8 = ?', options: ['15', '14', '16', '13'], answer: 0, emoji: '🔢' },
    { problem: '➕ Berapa 25 + 15 = ?', options: ['40', '35', '45', '30'], answer: 0, emoji: '➕' },
    { problem: '➖ Berapa 50 - 20 = ?', options: ['30', '25', '35', '40'], answer: 0, emoji: '➖' },
    { problem: '✖️ Hasil 6 × 7 = ?', options: ['42', '40', '44', '36'], answer: 0, emoji: '✖️' },
    { problem: '➗ Berapa 48 ÷ 6 = ?', options: ['8', '7', '9', '6'], answer: 0, emoji: '➗' },
    { problem: '📐 Segitiga mempunyai berapa sudut?', options: ['3', '4', '5', '6'], answer: 0, emoji: '📐' },
    { problem: '⬜ Segiempat sama mempunyai berapa sisi?', options: ['4', '3', '5', '6'], answer: 0, emoji: '⬜' },
    { problem: '📊 Setengah daripada 100 adalah?', options: ['50', '25', '75', '100'], answer: 0, emoji: '📊' },
    { problem: '💯 Sepuluh kuasa dua (10²) = ?', options: ['100', '20', '10', '1000'], answer: 0, emoji: '💯' },
    { problem: '📏 Perimeter segi empat sisi 5cm?', options: ['20cm', '15cm', '25cm', '10cm'], answer: 0, emoji: '📏' },
  ],
  sekolah_rendah_science: [
    { problem: '🔬 Kaedah yang digunakan dalam sains adalah?', options: ['Kaedah saintifik', 'Cerita', 'Lukisan', 'Nyanyian'], answer: 0, emoji: '🔬' },
    { problem: '🧬 Maklumat warisan dalam badan disimpan?', options: ['DNA', 'Darah', 'Air', 'Tulang'], answer: 0, emoji: '🧬' },
    { problem: '🧪 Alat ujian cair dalam eksperimen?', options: ['Bekas ujian', 'Palu', 'Pensil', 'Benang'], answer: 0, emoji: '🧪' },
    { problem: '🌍 Planet tempat kita tinggal?', options: ['Bumi', 'Marikh', 'Musytari', 'Zuhal'], answer: 0, emoji: '🌍' },
    { problem: '🌱 Proses pertumbuhan pokok dimulai dengan?', options: ['Benih', 'Bunga', 'Buah', 'Daun'], answer: 0, emoji: '🌱' },
    { problem: '❤️ Organ yang memam darah?', options: ['Jantung', 'Paru-paru', 'Ginjal', 'Hati'], answer: 0, emoji: '❤️' },
    { problem: '🦴 Struktur keras penyokong tubuh?', options: ['Tulang', 'Otot', 'Kulit', 'Urat'], answer: 0, emoji: '🦴' },
    { problem: '🫁 Organ untuk bernafas?', options: ['Paru-paru', 'Jantung', 'Ginjal', 'Perut'], answer: 0, emoji: '🫁' },
    { problem: '⚡ Aliran muatan listrik dipanggil?', options: ['Arus elektrik', 'Cahaya', 'Haba', 'Suara'], answer: 0, emoji: '⚡' },
    { problem: '♻️ Proses menggunakan barang bekas?', options: ['Kitar semula', 'Pembakaran', 'Pembuangan', 'Pemupukan'], answer: 0, emoji: '♻️' },
  ],
};

const SUBJECTS = [
  { ageGroup: 'prasekolah', subject: 'bahasa_melayu', label: 'Prasekolah - Bahasa Melayu' },
  { ageGroup: 'prasekolah', subject: 'english', label: 'Prasekolah - English' },
  { ageGroup: 'prasekolah', subject: 'mathematics', label: 'Prasekolah - Mathematics' },
  { ageGroup: 'prasekolah', subject: 'science', label: 'Prasekolah - Science' },
  { ageGroup: 'sekolah_rendah', subject: 'bahasa_melayu', label: 'Sekolah Rendah - Bahasa Melayu' },
  { ageGroup: 'sekolah_rendah', subject: 'english', label: 'Sekolah Rendah - English' },
  { ageGroup: 'sekolah_rendah', subject: 'mathematics', label: 'Sekolah Rendah - Mathematics' },
  { ageGroup: 'sekolah_rendah', subject: 'science', label: 'Sekolah Rendah - Science' },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Step 1: Delete all games
    console.log('🗑️ Deleting all games...');
    const allGames = await base44.asServiceRole.entities.Game.list();
    for (const game of allGames) {
      await base44.asServiceRole.entities.Game.delete(game.id);
    }
    console.log(`✅ Deleted ${allGames.length} games`);

    // Step 2: Create new curriculum-aligned games
    let totalCreated = 0;

    for (const subject of SUBJECTS) {
      const libKey = `${subject.ageGroup}_${subject.subject}`;
      const questionBank = CURRICULUM_QUESTIONS[libKey] || [];

      if (questionBank.length === 0) {
        console.log(`⚠️ No questions for ${libKey}`);
        continue;
      }

      // Create 10 games per subject
      for (let gameNum = 1; gameNum <= 10; gameNum++) {
        try {
          const shuffled = [...questionBank].sort(() => Math.random() - 0.5);
          const selectedQuestions = shuffled.slice(0, 10);

          const usedEmojis = new Set();
          const finalQuestions = selectedQuestions.map((q) => {
            if (usedEmojis.has(q.emoji)) {
              const alt = questionBank.find(
                qb => !usedEmojis.has(qb.emoji) && !selectedQuestions.some(sq => sq.emoji === qb.emoji)
              );
              if (alt) {
                usedEmojis.add(alt.emoji);
                return alt;
              }
            }
            usedEmojis.add(q.emoji);
            return q;
          });

          await base44.asServiceRole.entities.Game.create({
            title: `${subject.label} Game ${gameNum}`,
            type: 'multiple_choice',
            category: subject.subject,
            ageGroup: subject.ageGroup,
            difficulty: gameNum <= 3 ? 'easy' : gameNum <= 7 ? 'medium' : 'hard',
            tier: 'free',
            emoji: ['🎮', '🎯', '🎪', '🎨', '🎭', '🎬', '🎤', '🎸', '🎹', '🎺'][gameNum - 1],
            totalQuestions: 10,
            gameData: { questions: finalQuestions },
            isPublished: true,
            status: 'ready',
            order: gameNum - 1,
          });

          totalCreated++;
        } catch (err) {
          console.error(`Error game ${gameNum} for ${subject.label}:`, err.message);
        }
      }
    }

    return Response.json({
      success: true,
      deletedCount: allGames.length,
      createdCount: totalCreated,
      message: `✅ Deleted ${allGames.length} old games. Created ${totalCreated} new curriculum-aligned games (10 games × 8 subjects, KSSR & Prasekolah aligned)`,
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});