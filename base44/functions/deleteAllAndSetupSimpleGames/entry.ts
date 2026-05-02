import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// CURRICULUM-ALIGNED QUESTIONS (NO EMOJI)
const QUESTIONS = {
  prasekolah_bahasa_melayu: [
    { problem: 'Apakah nama haiwan yang berkokok?', options: ['Ayam', 'Anjing', 'Kucing', 'Kuda'], answer: 0 },
    { problem: 'Apa alat untuk menulis atau melukis?', options: ['Pensil', 'Sudu', 'Garpu', 'Cawan'], answer: 0 },
    { problem: 'Buah merah yang manis ini apa nama?', options: ['Epal', 'Pisang', 'Oren', 'Tembikai'], answer: 0 },
    { problem: 'Tempat kami tinggal dan tidur ialah?', options: ['Rumah', 'Sekolah', 'Taman', 'Kedai'], answer: 0 },
    { problem: 'Siapa yang mengajar kita di sekolah?', options: ['Guru', 'Ayah', 'Ibu', 'Kawan'], answer: 0 },
    { problem: 'Apa yang kita baca di sekolah?', options: ['Buku', 'Mainan', 'Makanan', 'Kasut'], answer: 0 },
    { problem: 'Siang hari terang kerana apa?', options: ['Matahari', 'Bulan', 'Bintang', 'Lampu'], answer: 0 },
    { problem: 'Berapa jumlah hari dalam seminggu?', options: ['Tujuh', 'Enam', 'Lima', 'Lapan'], answer: 0 },
    { problem: 'Bulan berapa selepas Januari?', options: ['Februari', 'Mac', 'April', 'Mei'], answer: 0 },
    { problem: 'Emosi bahagia ditunjukkan dengan apa?', options: ['Senyuman', 'Menangis', 'Marah', 'Tidur'], answer: 0 },
  ],
  prasekolah_english: [
    { problem: 'This animal says woof woof?', options: ['Dog', 'Cat', 'Cow', 'Pig'], answer: 0 },
    { problem: 'We use this to write or draw?', options: ['Pencil', 'Spoon', 'Fork', 'Cup'], answer: 0 },
    { problem: 'This red fruit is sweet and healthy?', options: ['Apple', 'Banana', 'Orange', 'Watermelon'], answer: 0 },
    { problem: 'My family lives in a?', options: ['House', 'School', 'Park', 'Store'], answer: 0 },
    { problem: 'My father is my?', options: ['Dad', 'Mom', 'Sister', 'Brother'], answer: 0 },
    { problem: 'We learn and read at?', options: ['School', 'Park', 'Home', 'Shop'], answer: 0 },
    { problem: 'The sun is bright during?', options: ['Day', 'Night', 'Morning', 'Evening'], answer: 0 },
    { problem: 'How many days in a week?', options: ['Seven', 'Six', 'Five', 'Eight'], answer: 0 },
    { problem: 'What color is the sky?', options: ['Blue', 'Red', 'Green', 'Yellow'], answer: 0 },
    { problem: 'Happy feeling is shown by?', options: ['Smile', 'Crying', 'Angry', 'Sleeping'], answer: 0 },
  ],
  prasekolah_mathematics: [
    { problem: 'Berapa banyak matahari di langit?', options: ['Satu', 'Dua', 'Tiga', 'Banyak'], answer: 0 },
    { problem: 'Berapa mata yang ada pada kita?', options: ['Dua', 'Satu', 'Tiga', 'Empat'], answer: 0 },
    { problem: 'Berapa sisi segitiga ada?', options: ['Tiga', 'Dua', 'Empat', 'Lima'], answer: 0 },
    { problem: 'Berapa roda kereta ada?', options: ['Empat', 'Dua', 'Tiga', 'Lima'], answer: 0 },
    { problem: 'Berapa jari dalam satu tangan?', options: ['Lima', 'Empat', 'Enam', 'Tiga'], answer: 0 },
    { problem: 'Satu tambah satu bersamaan?', options: ['Dua', 'Satu', 'Tiga', 'Kosong'], answer: 0 },
    { problem: 'Nombor selepas lima ialah?', options: ['Enam', 'Empat', 'Tujuh', 'Lapan'], answer: 0 },
    { problem: 'Bentuk ini apa namanya?', options: ['Bulatan', 'Segi empat', 'Segitiga', 'Bintang'], answer: 0 },
    { problem: 'Mana paling panjang antara ini?', options: ['Kereta api', 'Kereta', 'Basikal', 'Semut'], answer: 0 },
    { problem: 'Berapa kaki burung ada?', options: ['Dua', 'Satu', 'Tiga', 'Empat'], answer: 0 },
  ],
  prasekolah_science: [
    { problem: 'Dari apa pokok tumbuh?', options: ['Benih', 'Batu', 'Air', 'Api'], answer: 0 },
    { problem: 'Siang terang kerana apa?', options: ['Matahari', 'Bulan', 'Bintang', 'Lampu'], answer: 0 },
    { problem: 'Malam gelap, cahaya datang dari?', options: ['Bulan', 'Bintang', 'Lampu', 'Api'], answer: 0 },
    { problem: 'Pokok memerlukan apa untuk hidup?', options: ['Air', 'Garam', 'Gula', 'Minyak'], answer: 0 },
    { problem: 'Serangga cantik yang terbang apa?', options: ['Rama-rama', 'Semut', 'Kecoa', 'Lipan'], answer: 0 },
    { problem: 'Serangga yang membuat madu apa?', options: ['Lebah', 'Nyamuk', 'Lipas', 'Lalat'], answer: 0 },
    { problem: 'Sebab bumi mempunyai banyak air apa?', options: ['Laut', 'Tanah', 'Pasir', 'Batu'], answer: 0 },
    { problem: 'Apa yang memberikan oksigen kepada kita?', options: ['Pokok', 'Batu', 'Logam', 'Plastik'], answer: 0 },
    { problem: 'Air yang beku dipanggil apa?', options: ['Ais', 'Salji', 'Embun', 'Hujan'], answer: 0 },
    { problem: 'Bunga yang wangi apa namanya?', options: ['Bunga ros', 'Batu', 'Daun', 'Kayu'], answer: 0 },
  ],
  sekolah_rendah_bahasa_melayu: [
    { problem: 'Cerita khayalan tanpa fakta nyata disebut?', options: ['Fiksi', 'Biografi', 'Sejarah', 'Berita'], answer: 0 },
    { problem: 'Proses menyusun cerita atau artikel adalah?', options: ['Penulisan', 'Bacaan', 'Pertuturan', 'Pendengaran'], answer: 0 },
    { problem: 'Gabungan huruf yang mempunyai makna adalah?', options: ['Perkataan', 'Ayat', 'Bunyi', 'Suku kata'], answer: 0 },
    { problem: 'Tempat menyimpan buku-buku ialah?', options: ['Perpustakaan', 'Kelas', 'Rumah', 'Taman'], answer: 0 },
    { problem: 'Perbualan antara dua orang disebut?', options: ['Dialog', 'Monolog', 'Cerita', 'Laporan'], answer: 0 },
    { problem: 'Seni pertunjukan yang dimainkan pelakon apa?', options: ['Teater', 'Lukisan', 'Nyanyian', 'Tari'], answer: 0 },
    { problem: 'Teks tentang kehidupan sebenar seseorang?', options: ['Biografi', 'Fiksi', 'Puisi', 'Drama'], answer: 0 },
    { problem: 'Kisah yang dicerita dengan gambar bergerak?', options: ['Filem', 'Foto', 'Buku', 'Surat'], answer: 0 },
    { problem: 'Laporan peristiwa semasa di akhbar apa?', options: ['Berita', 'Kolumun', 'Iklan', 'Cerita'], answer: 0 },
    { problem: 'Cerita tradisional dari budaya kita disebut?', options: ['Legenda', 'Novel', 'Puisi', 'Drama'], answer: 0 },
  ],
  sekolah_rendah_english: [
    { problem: 'A story that is not real is called?', options: ['Fiction', 'Biography', 'History', 'News'], answer: 0 },
    { problem: 'The process of creating a story is?', options: ['Writing', 'Reading', 'Speaking', 'Listening'], answer: 0 },
    { problem: 'A group of letters with meaning is?', options: ['Word', 'Sentence', 'Sound', 'Letter'], answer: 0 },
    { problem: 'A place with many books is?', options: ['Library', 'Classroom', 'Home', 'Park'], answer: 0 },
    { problem: 'A talk between two people is?', options: ['Dialog', 'Monolog', 'Story', 'Report'], answer: 0 },
    { problem: 'A performance by actors is called?', options: ['Theater', 'Painting', 'Song', 'Dance'], answer: 0 },
    { problem: 'True story of a real person is?', options: ['Biography', 'Fiction', 'Poetry', 'Drama'], answer: 0 },
    { problem: 'Story told with moving pictures is?', options: ['Film', 'Photo', 'Book', 'Letter'], answer: 0 },
    { problem: 'Current events reported in newspaper?', options: ['News', 'Column', 'Advertisement', 'Story'], answer: 0 },
    { problem: 'Old stories from our culture are?', options: ['Legend', 'Novel', 'Poetry', 'Drama'], answer: 0 },
  ],
  sekolah_rendah_mathematics: [
    { problem: 'Hasil 7 + 8 = ?', options: ['15', '14', '16', '13'], answer: 0 },
    { problem: 'Berapa 25 + 15 = ?', options: ['40', '35', '45', '30'], answer: 0 },
    { problem: 'Berapa 50 - 20 = ?', options: ['30', '25', '35', '40'], answer: 0 },
    { problem: 'Hasil 6 × 7 = ?', options: ['42', '40', '44', '36'], answer: 0 },
    { problem: 'Berapa 48 ÷ 6 = ?', options: ['8', '7', '9', '6'], answer: 0 },
    { problem: 'Segitiga mempunyai berapa sudut?', options: ['3', '4', '5', '6'], answer: 0 },
    { problem: 'Segiempat sama mempunyai berapa sisi?', options: ['4', '3', '5', '6'], answer: 0 },
    { problem: 'Setengah daripada 100 adalah?', options: ['50', '25', '75', '100'], answer: 0 },
    { problem: 'Sepuluh kuasa dua (10²) = ?', options: ['100', '20', '10', '1000'], answer: 0 },
    { problem: 'Perimeter segi empat sisi 5cm?', options: ['20cm', '15cm', '25cm', '10cm'], answer: 0 },
  ],
  sekolah_rendah_science: [
    { problem: 'Kaedah yang digunakan dalam sains adalah?', options: ['Kaedah saintifik', 'Cerita', 'Lukisan', 'Nyanyian'], answer: 0 },
    { problem: 'Maklumat warisan dalam badan disimpan dalam?', options: ['DNA', 'Darah', 'Air', 'Tulang'], answer: 0 },
    { problem: 'Alat ujian cair dalam eksperimen adalah?', options: ['Bekas ujian', 'Palu', 'Pensil', 'Benang'], answer: 0 },
    { problem: 'Planet tempat kita tinggal apa namanya?', options: ['Bumi', 'Marikh', 'Musytari', 'Zuhal'], answer: 0 },
    { problem: 'Proses pertumbuhan pokok dimulai dengan?', options: ['Benih', 'Bunga', 'Buah', 'Daun'], answer: 0 },
    { problem: 'Organ yang memam darah adalah?', options: ['Jantung', 'Paru-paru', 'Ginjal', 'Hati'], answer: 0 },
    { problem: 'Struktur keras penyokong tubuh apa?', options: ['Tulang', 'Otot', 'Kulit', 'Urat'], answer: 0 },
    { problem: 'Organ yang kita gunakan untuk bernafas?', options: ['Paru-paru', 'Jantung', 'Ginjal', 'Perut'], answer: 0 },
    { problem: 'Aliran muatan listrik dipanggil apa?', options: ['Arus elektrik', 'Cahaya', 'Haba', 'Suara'], answer: 0 },
    { problem: 'Proses menggunakan barang bekas disebut?', options: ['Kitar semula', 'Pembakaran', 'Pembuangan', 'Pemupukan'], answer: 0 },
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

    // Delete all games
    const allGames = await base44.asServiceRole.entities.Game.list();
    for (const game of allGames) {
      await base44.asServiceRole.entities.Game.delete(game.id);
    }
    console.log(`🗑️ Deleted ${allGames.length} games`);

    // Create 10 games per subject
    let totalCreated = 0;

    for (const subject of SUBJECTS) {
      const libKey = `${subject.ageGroup}_${subject.subject}`;
      const questionBank = QUESTIONS[libKey] || [];

      for (let gameNum = 1; gameNum <= 10; gameNum++) {
        try {
          const shuffled = [...questionBank].sort(() => Math.random() - 0.5);
          const selectedQuestions = shuffled.slice(0, 10);

          await base44.asServiceRole.entities.Game.create({
            title: `${subject.label} Game ${gameNum}`,
            type: 'multiple_choice',
            category: subject.subject,
            ageGroup: subject.ageGroup,
            difficulty: gameNum <= 3 ? 'easy' : gameNum <= 7 ? 'medium' : 'hard',
            tier: 'free',
            totalQuestions: 10,
            gameData: { questions: selectedQuestions },
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
      message: `✅ Deleted ${allGames.length} games. Created ${totalCreated} new games (10 games × 8 subjects, 10 questions each).`,
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});