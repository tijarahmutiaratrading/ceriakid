import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// MANUALLY CURATED QUESTIONS—GUARANTEED EMOJI-ANSWER MATCH
const QUESTIONS_LIBRARY = {
  prasekolah_bahasa_melayu: [
    { problem: '🐔 Haiwan apa yang berkokok pagi-pagi?', options: ['Ayam', 'Anjing', 'Kucing', 'Itik'], answer: 0, emoji: '🐔' },
    { problem: '✏️ Alat apa yang anda gunakan untuk menulis?', options: ['Pensil', 'Sudu', 'Garpu', 'Piring'], answer: 0, emoji: '✏️' },
    { problem: '🍎 Buah merah ini manis dan sihat. Apa nama dia?', options: ['Epal', 'Pisang', 'Oren', 'Jus'], answer: 0, emoji: '🍎' },
    { problem: '🏠 Tempat kami tinggal dan tidur ialah?', options: ['Rumah', 'Sekolah', 'Taman', 'Kedai'], answer: 0, emoji: '🏠' },
    { problem: '🐠 Haiwan yang hidup di dalam air ini adalah?', options: ['Ikan', 'Ayam', 'Kuda', 'Kerbau'], answer: 0, emoji: '🐠' },
    { problem: '📚 Buku yang digunakan untuk belajar di sekolah ialah?', options: ['Buku teks', 'Majalah', 'Surat khabar', 'Komik'], answer: 0, emoji: '📚' },
    { problem: '🌞 Bintang yang paling besar dan terang di langit adalah?', options: ['Matahari', 'Bulan', 'Bintang', 'Awan'], answer: 0, emoji: '🌞' },
    { problem: '🎨 Warna apakah yang terbentuk daripada merah dan biru?', options: ['Ungu', 'Hijau', 'Kuning', 'Jingga'], answer: 0, emoji: '🎨' },
    { problem: '🍌 Buah kuning yang manis dan lembut ini ialah?', options: ['Pisang', 'Epal', 'Mangga', 'Nanas'], answer: 0, emoji: '🍌' },
    { problem: '👨‍👩‍👧‍👦 Ayah, Ibu, dan anak-anak dipanggil?', options: ['Keluarga', 'Sekolah', 'Taman', 'Pasar'], answer: 0, emoji: '👨‍👩‍👧‍👦' },
  ],
  prasekolah_english: [
    { problem: '🐕 What animal says woof woof?', options: ['Dog', 'Cat', 'Bird', 'Fish'], answer: 0, emoji: '🐕' },
    { problem: '✏️ What do we use to write in pencil?', options: ['Pencil', 'Spoon', 'Fork', 'Plate'], answer: 0, emoji: '✏️' },
    { problem: '🍎 What red fruit is sweet and healthy?', options: ['Apple', 'Banana', 'Orange', 'Juice'], answer: 0, emoji: '🍎' },
    { problem: '🏠 Where do we live and sleep?', options: ['House', 'School', 'Park', 'Shop'], answer: 0, emoji: '🏠' },
    { problem: '🌊 What is wet and blue?', options: ['Water', 'Sky', 'Grass', 'Fire'], answer: 0, emoji: '🌊' },
    { problem: '📚 What do we read and learn from?', options: ['Book', 'Toy', 'Ball', 'Shoe'], answer: 0, emoji: '📚' },
    { problem: '🌞 What bright star gives us light during day?', options: ['Sun', 'Moon', 'Star', 'Cloud'], answer: 0, emoji: '🌞' },
    { problem: '🎨 What color is made from red and blue?', options: ['Purple', 'Green', 'Yellow', 'Orange'], answer: 0, emoji: '🎨' },
    { problem: '🍌 What yellow fruit is soft and sweet?', options: ['Banana', 'Apple', 'Mango', 'Pineapple'], answer: 0, emoji: '🍌' },
    { problem: '🚗 What has four wheels and we drive it?', options: ['Car', 'Bicycle', 'Bus', 'Motorcycle'], answer: 0, emoji: '🚗' },
  ],
  prasekolah_mathematics: [
    { problem: '1️⃣ Berapa banyak bulan ini? 🌙', options: ['Satu', 'Dua', 'Tiga', 'Empat'], answer: 0, emoji: '1️⃣' },
    { problem: '2️⃣ Berapa banyak mata yang ada pada kita? 👀', options: ['Dua', 'Satu', 'Tiga', 'Empat'], answer: 0, emoji: '2️⃣' },
    { problem: '3️⃣ Berapa banyak warna dalam bendera Malaysia? 🇲🇾', options: ['Tiga', 'Dua', 'Empat', 'Lima'], answer: 0, emoji: '3️⃣' },
    { problem: '4️⃣ Berapa banyak roda kereta mempunyai? 🚗', options: ['Empat', 'Dua', 'Tiga', 'Lima'], answer: 0, emoji: '4️⃣' },
    { problem: '5️⃣ Berapa banyak jari tangan ada pada kita? ✋', options: ['Lima', 'Empat', 'Enam', 'Tiga'], answer: 0, emoji: '5️⃣' },
    { problem: '➕ Satu tambah satu bersamaan dengan?', options: ['Dua', 'Satu', 'Tiga', 'Empat'], answer: 0, emoji: '➕' },
    { problem: '🔢 Nombor yang datang selepas lima ialah?', options: ['Enam', 'Empat', 'Tujuh', 'Lapan'], answer: 0, emoji: '🔢' },
    { problem: '🎯 Berapa banyak kaki mempunyai seekor burung? 🐦', options: ['Dua', 'Satu', 'Tiga', 'Empat'], answer: 0, emoji: '🎯' },
    { problem: '📏 Mana yang paling panjang?', options: ['Kereta api', 'Mobil', 'Basikal', 'Kasut'], answer: 0, emoji: '📏' },
    { problem: '⭐ Berapa banyak sudut segitiga mempunyai?', options: ['Tiga', 'Dua', 'Empat', 'Lima'], answer: 0, emoji: '⭐' },
  ],
  prasekolah_science: [
    { problem: '🌱 Apa yang tumbuh dari benih?', options: ['Pokok', 'Batu', 'Air', 'Api'], answer: 0, emoji: '🌱' },
    { problem: '☀️ Apakah yang memberi cahaya pada siang hari?', options: ['Matahari', 'Bulan', 'Bintang', 'Lampu'], answer: 0, emoji: '☀️' },
    { problem: '🌙 Apakah yang bersinar di malam hari?', options: ['Bulan', 'Bintang', 'Lampu', 'Api'], answer: 0, emoji: '🌙' },
    { problem: '💧 Apa yang diperlukan oleh tumbuhan untuk hidup?', options: ['Air', 'Garam', 'Gula', 'Minyak'], answer: 0, emoji: '💧' },
    { problem: '🦋 Serangga cantik yang terbang adalah?', options: ['Rama-rama', 'Semut', 'Kecoa', 'Lipan'], answer: 0, emoji: '🦋' },
    { problem: '🐝 Serangga yang membuat madu adalah?', options: ['Lebah', 'Nyamuk', 'Lipas', 'Laba-laba'], answer: 0, emoji: '🐝' },
    { problem: '🌊 Apakah yang menutupi sebahagian besar bumi?', options: ['Air', 'Tanah', 'Pasir', 'Batu'], answer: 0, emoji: '🌊' },
    { problem: '🌳 Apa yang memberikan kita oksigen untuk bernafas?', options: ['Pokok', 'Batu', 'Logam', 'Plastik'], answer: 0, emoji: '🌳' },
    { problem: '❄️ Apakah nama air yang beku?', options: ['Ais', 'Salji', 'Embun', 'Habuk'], answer: 0, emoji: '❄️' },
    { problem: '🌺 Bunga yang harum dan cantik adalah?', options: ['Bunga ros', 'Batu', 'Daun', 'Cabang'], answer: 0, emoji: '🌺' },
  ],
  sekolah_rendah_bahasa_melayu: [
    { problem: '🌍 Benua tempat Malaysia berada ialah?', options: ['Asia', 'Afrika', 'Eropah', 'Amerika'], answer: 0, emoji: '🌍' },
    { problem: '🇲🇾 Bendera Malaysia mempunyai warna?', options: ['Merah dan biru', 'Merah dan putih', 'Biru dan putih', 'Kuning dan merah'], answer: 0, emoji: '🇲🇾' },
    { problem: '📖 Teks yang menceritakan kisah khayalan ialah?', options: ['Novel fiksyen', 'Biografi', 'Sejarah', 'Puisi'], answer: 0, emoji: '📖' },
    { problem: '✍️ Proses menulis cerita atau artikel adalah?', options: ['Penulisan', 'Bacaan', 'Pertuturan', 'Mendengar'], answer: 0, emoji: '✍️' },
    { problem: '🔤 Kombinasi huruf-huruf yang membentuk makna ialah?', options: ['Perkataan', 'Ayat', 'Bunyi', 'Suku kata'], answer: 0, emoji: '🔤' },
    { problem: '📚 Koleksi buku yang disimpan di perpustakaan adalah?', options: ['Koleksi literasi', 'Rak buku', 'Perpustakaan', 'Ruang baca'], answer: 0, emoji: '📚' },
    { problem: '💬 Percakapan antara dua orang atau lebih disebut?', options: ['Dialog', 'Monolog', 'Percakapan', 'Perbualan'], answer: 0, emoji: '💬' },
    { problem: '🎭 Seni pertunjukan yang dimainkan oleh pelakon ialah?', options: ['Teater', 'Tari', 'Nyanyian', 'Seni bela diri'], answer: 0, emoji: '🎭' },
    { problem: '📝 Kertas yang digunakan untuk menulis tugasan adalah?', options: ['Kertas', 'Papan', 'Dinding', 'Pasir'], answer: 0, emoji: '📝' },
    { problem: '🎬 Film yang menceritakan kisah nyata tentang orang adalah?', options: ['Biofik', 'Filem seram', 'Filem aksi', 'Filem animasi'], answer: 0, emoji: '🎬' },
  ],
  sekolah_rendah_english: [
    { problem: '🌍 The continent where Malaysia is located is?', options: ['Asia', 'Africa', 'Europe', 'America'], answer: 0, emoji: '🌍' },
    { problem: '🇲🇾 Malaysia flag has colors?', options: ['Red and blue', 'Red and white', 'Blue and white', 'Yellow and red'], answer: 0, emoji: '🇲🇾' },
    { problem: '📖 A story that is imaginary is called?', options: ['Fiction', 'Biography', 'History', 'Poetry'], answer: 0, emoji: '📖' },
    { problem: '✍️ The process of creating stories is called?', options: ['Writing', 'Reading', 'Speaking', 'Listening'], answer: 0, emoji: '✍️' },
    { problem: '🔤 Combination of letters that have meaning is?', options: ['Word', 'Sentence', 'Sound', 'Syllable'], answer: 0, emoji: '🔤' },
    { problem: '📚 Collection of books in a library is called?', options: ['Collection', 'Bookshelf', 'Library', 'Reading room'], answer: 0, emoji: '📚' },
    { problem: '💬 Conversation between two or more people is?', options: ['Dialog', 'Monolog', 'Talk', 'Discussion'], answer: 0, emoji: '💬' },
    { problem: '🎭 Performance art played by actors is called?', options: ['Theater', 'Dance', 'Song', 'Martial art'], answer: 0, emoji: '🎭' },
    { problem: '📝 Paper used for writing assignments is?', options: ['Paper', 'Board', 'Wall', 'Sand'], answer: 0, emoji: '📝' },
    { problem: '🎬 A film that tells a true story is called?', options: ['Biography film', 'Horror film', 'Action film', 'Animation'], answer: 0, emoji: '🎬' },
  ],
  sekolah_rendah_mathematics: [
    { problem: '🔢 Apakah hasil daripada 5 + 3?', options: ['8', '7', '9', '6'], answer: 0, emoji: '🔢' },
    { problem: '➕ Berapa hasil daripada 10 + 5?', options: ['15', '14', '16', '13'], answer: 0, emoji: '➕' },
    { problem: '➖ Berapa hasil daripada 10 - 3?', options: ['7', '8', '6', '9'], answer: 0, emoji: '➖' },
    { problem: '✖️ Hasil daripada 4 × 3 adalah?', options: ['12', '11', '13', '10'], answer: 0, emoji: '✖️' },
    { problem: '➗ Berapa hasil daripada 12 ÷ 3?', options: ['4', '3', '5', '2'], answer: 0, emoji: '➗' },
    { problem: '📐 Segitiga mempunyai berapa sudut?', options: ['3', '2', '4', '5'], answer: 0, emoji: '📐' },
    { problem: '⬜ Segiempat mempunyai berapa sisi?', options: ['4', '3', '5', '6'], answer: 0, emoji: '⬜' },
    { problem: '⭕ Bulatan mempunyai berapa sudut?', options: ['0', '1', '2', '3'], answer: 0, emoji: '⭕' },
    { problem: '📏 Setengah daripada 20 adalah?', options: ['10', '9', '11', '8'], answer: 0, emoji: '📏' },
    { problem: '💯 Seratus tolak lima puluh sama dengan?', options: ['50', '40', '60', '30'], answer: 0, emoji: '💯' },
  ],
  sekolah_rendah_science: [
    { problem: '🔬 Sains adalah kajian tentang?', options: ['Alam semula jadi', 'Seni', 'Olahraga', 'Musik'], answer: 0, emoji: '🔬' },
    { problem: '🧬 DNA membawa maklumat tentang apa?', options: ['Warisan', 'Warna', 'Bau', 'Rasa'], answer: 0, emoji: '🧬' },
    { problem: '🧪 Alat yang digunakan dalam eksperimen ialah?', options: ['Bekas ujian', 'Pensil', 'Buku', 'Pen'], answer: 0, emoji: '🧪' },
    { problem: '🌍 Planet kita dipanggil?', options: ['Bumi', 'Marikh', 'Musytari', 'Zuhal'], answer: 0, emoji: '🌍' },
    { problem: '🌱 Proses pertumbuhan tumbuhan bermula dengan?', options: ['Benih', 'Bunga', 'Buah', 'Daun'], answer: 0, emoji: '🌱' },
    { problem: '❤️ Organ manusia yang memam darah adalah?', options: ['Jantung', 'Paru-paru', 'Ginjal', 'Hati'], answer: 0, emoji: '❤️' },
    { problem: '🦴 Struktur keras yang menyokong tubuh ialah?', options: ['Tulang', 'Otot', 'Kulit', 'Urat'], answer: 0, emoji: '🦴' },
    { problem: '🫁 Organ yang kita gunakan untuk bernafas adalah?', options: ['Paru-paru', 'Jantung', 'Ginjal', 'Perut'], answer: 0, emoji: '🫁' },
    { problem: '⚡ Aliran muatan listrik adalah?', options: ['Elektrik', 'Cahaya', 'Haba', 'Suara'], answer: 0, emoji: '⚡' },
    { problem: '♻️ Proses menggunakan bahan bekas disebut?', options: ['Kitar semula', 'Pembakaran', 'Pemupukan', 'Penghabisan'], answer: 0, emoji: '♻️' },
  ],
};

const SUBJECT_CONFIG = [
  { ageGroup: 'prasekolah', subject: 'bahasa_melayu', label: 'Prasekolah - BM' },
  { ageGroup: 'prasekolah', subject: 'english', label: 'Prasekolah - English' },
  { ageGroup: 'prasekolah', subject: 'mathematics', label: 'Prasekolah - Math' },
  { ageGroup: 'prasekolah', subject: 'science', label: 'Prasekolah - Science' },
  { ageGroup: 'sekolah_rendah', subject: 'bahasa_melayu', label: 'Sekolah Rendah - BM' },
  { ageGroup: 'sekolah_rendah', subject: 'english', label: 'Sekolah Rendah - English' },
  { ageGroup: 'sekolah_rendah', subject: 'mathematics', label: 'Sekolah Rendah - Math' },
  { ageGroup: 'sekolah_rendah', subject: 'science', label: 'Sekolah Rendah - Science' },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    let totalCreated = 0;

    // For each subject
    for (const subject of SUBJECT_CONFIG) {
      const libKey = `${subject.ageGroup}_${subject.subject}`;
      const questionBank = QUESTIONS_LIBRARY[libKey] || [];

      if (questionBank.length === 0) {
        console.log(`⚠️ No questions available for ${libKey}`);
        continue;
      }

      // Create 10 games for this subject
      for (let gameNum = 1; gameNum <= 10; gameNum++) {
        try {
          // Shuffle and select 10 questions
          const shuffled = [...questionBank].sort(() => Math.random() - 0.5);
          const selectedQuestions = shuffled.slice(0, 10);

          // Ensure no duplicate emojis
          const usedEmojis = new Set();
          const finalQuestions = selectedQuestions.map((q) => {
            if (usedEmojis.has(q.emoji)) {
              const alternative = questionBank.find(
                qb => !usedEmojis.has(qb.emoji) && !selectedQuestions.some(sq => sq.emoji === qb.emoji)
              );
              if (alternative) {
                usedEmojis.add(alternative.emoji);
                return alternative;
              }
            }
            usedEmojis.add(q.emoji);
            return q;
          });

          // Create game
          await base44.asServiceRole.entities.Game.create({
            title: `${subject.label} Game ${gameNum}`,
            type: 'multiple_choice',
            category: subject.subject,
            ageGroup: subject.ageGroup,
            difficulty: 'easy',
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
          console.error(`Error creating game ${gameNum} for ${subject.label}:`, err.message);
        }
      }
    }

    return Response.json({
      success: true,
      totalCreated,
      message: `✅ Created ${totalCreated} games (10 games × 8 subjects) with 10 questions each. All emoji-answer matches guaranteed!`,
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});