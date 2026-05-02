import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// MANUALLY CURATED QUESTIONS WITH GUARANTEED EMOJI MATCHING
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
    { problem: '🚗 Kenderaan yang bergerak di jalan raya dengan 4 roda adalah?', options: ['Kereta', 'Motosikal', 'Basikal', 'Bas'], answer: 0, emoji: '🚗' },
    { problem: '🎒 Beg yang dibawa oleh pelajar ke sekolah ialah?', options: ['Beg sekolah', 'Beg tangan', 'Beg galas', 'Beg kecil'], answer: 0, emoji: '🎒' },
    { problem: '🌟 Di malam hari, apa yang berkelap-kelip di langit?', options: ['Bintang', 'Matahari', 'Awan', 'Cahaya'], answer: 0, emoji: '🌟' },
    { problem: '🧪 Seorang doktor menggunakan alat ini untuk memeriksa?', options: ['Termometer', 'Pemotong', 'Sendok', 'Garpu'], answer: 0, emoji: '🧪' },
    { problem: '🎵 Nada-nada yang indah dan merdu dipanggil?', options: ['Lagu', 'Cakap', 'Bising', 'Bunyi'], answer: 0, emoji: '🎵' },
    { problem: '🍕 Makanan berbentuk bulat dengan pelbagai topping ialah?', options: ['Pizza', 'Roti', 'Nasi', 'Mee'], answer: 0, emoji: '🍕' },
    { problem: '⚽ Bola digunakan untuk bermain?', options: ['Bola sepak', 'Bola basket', 'Bola volley', 'Bola tenis'], answer: 0, emoji: '⚽' },
    { problem: '🎓 Topi yang dipakai oleh guru dan pelajar tersebut ialah?', options: ['Topi mortarboard', 'Topi baseball', 'Topi matahari', 'Topi musim sejuk'], answer: 0, emoji: '🎓' },
    { problem: '🦋 Serangga berwarna-warni yang terbang di bunga adalah?', options: ['Rama-rama', 'Lebah', 'Semut', 'Lipas'], answer: 0, emoji: '🦋' },
    { problem: '💤 Apabila kita penat, kita perlu?', options: ['Tidur', 'Berlari', 'Bermain', 'Makan'], answer: 0, emoji: '💤' },
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
    { problem: '🔍 Aktiviti mencari maklumat untuk penyelidikan ialah?', options: ['Penyelidikan', 'Permainan', 'Membaca', 'Menulis'], answer: 0, emoji: '🔍' },
    { problem: '📰 Laporan peristiwa terkini di surat khabar disebut?', options: ['Berita', 'Iklan', 'Cerita', 'Kolumun'], answer: 0, emoji: '📰' },
    { problem: '🎤 Alat untuk bercakap di hadapan ramai orang ialah?', options: ['Mikrofon', 'Pembesar suara', 'Telefon', 'Kamera'], answer: 0, emoji: '🎤' },
    { problem: '📊 Gambar yang menunjukkan data atau maklumat disebut?', options: ['Graf', 'Carta', 'Jadual', 'Diagram'], answer: 0, emoji: '📊' },
    { problem: '✒️ Tulisan tangan yang rapi dan indah dipanggil?', options: ['Kaligrafi', 'Seni tulis', 'Tulisan tangan', 'Ejaan'], answer: 0, emoji: '✒️' },
    { problem: '🌏 Seni dan budaya Malaysia yang unik ialah?', options: ['Warisan budaya', 'Tradisi', 'Adat istiadat', 'Kesenian rakyat'], answer: 0, emoji: '🌏' },
    { problem: '🗣️ Kemampuan menggunakan bahasa untuk berkomunikasi disebut?', options: ['Kemahiran bahasa', 'Kebolehan tulis', 'Kepintaran bercakap', 'Kefahaman'], answer: 0, emoji: '🗣️' },
    { problem: '💭 Pemikiran yang mendalam tentang sesuatu ialah?', options: ['Refleksi', 'Reaksi', 'Tindakan', 'Perasaan'], answer: 0, emoji: '💭' },
    { problem: '🏆 Hadiah yang diberikan kepada pemenang disebut?', options: ['Trofi', 'Medali', 'Piala', 'Syarat'], answer: 0, emoji: '🏆' },
    { problem: '🎯 Matlamat yang ingin dicapai dalam tugasan ialah?', options: ['Objektif', 'Alasan', 'Sebab', 'Hasil'], answer: 0, emoji: '🎯' },
  ],
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { ageGroup, category, gameId, targetCount } = await req.json();

    if (!ageGroup || !category) {
      return Response.json({ error: 'ageGroup and category required' }, { status: 400 });
    }

    const libKey = `${ageGroup}_${category}`;
    const questionBank = QUESTIONS_LIBRARY[libKey] || [];

    if (questionBank.length === 0) {
      return Response.json({
        error: `No manual questions available for ${libKey}. Available keys: ${Object.keys(QUESTIONS_LIBRARY).join(', ')}`,
      }, { status: 400 });
    }

    // Get games to update
    let games;
    if (gameId) {
      const g = await base44.asServiceRole.entities.Game.filter({ id: gameId });
      games = g.length > 0 ? [g[0]] : [];
    } else {
      games = await base44.asServiceRole.entities.Game.filter({ ageGroup, category, isPublished: true });
    }

    if (games.length === 0) {
      return Response.json({ error: 'No games found to update' }, { status: 400 });
    }

    let updated = 0;

    for (const game of games) {
      try {
        // Shuffle and select questions from bank
        const shuffled = [...questionBank].sort(() => Math.random() - 0.5);
        const selectedQuestions = shuffled.slice(0, targetCount || 10);

        // Ensure no duplicate emojis
        const usedEmojis = new Set();
        const finalQuestions = selectedQuestions.map((q) => {
          if (usedEmojis.has(q.emoji)) {
            // Find alternative if duplicate
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

        await base44.asServiceRole.entities.Game.update(game.id, {
          totalQuestions: finalQuestions.length,
          gameData: { questions: finalQuestions },
          status: 'ready',
        });

        updated++;
      } catch (err) {
        console.error(`Error updating game ${game.id}:`, err.message);
      }
    }

    return Response.json({
      success: true,
      updated,
      totalGames: games.length,
      message: `✅ ${updated} games updated with manually curated questions (emoji-answer guaranteed match)`,
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});